import { deploy } from "./mod.ts";
import {
  mergeReadableStreams,
} from "jsr:@std/streams@1.0.0-rc.4/merge-readable-streams";
import {
  App,
  AppLoadEvent,
  AppPorts,
  AppSettings,
  HostProcess,
} from "./models/app.ts";

const kv = await Deno.openKv("nc");

const RunApps = async () => {
  const apps = kv.list({ prefix: ["app"] });

  for await (const appEntry of apps) {
    const app = appEntry.value as App;

    if(!app.path){
      await kv.delete(appEntry.key);
      return;
    }

    RunApp({
      init: true,
      hostname: app.hostname,
      port: app.port,
      name: app.hostname,
      path: `${app.path}`,
    });
    console.log("Running", app.hostname);
  }
};

// @ts-ignore
addEventListener("loadApp", async (e: AppLoadEvent) => {
  // Get current host details
  const hostProcess: HostProcess =
    (await kv.get(["hp", e.detail.hostname])).value as HostProcess || {
      port: e.detail.port.staging,
    };

  // Port to be used
  const port = hostProcess?.port === e.detail.port.production
    ? e.detail.port.staging
    : e.detail.port.production;

  // create the file to attach the process to
  const file = await Deno.open(`./${e.detail.name}_logs.txt`, {
    read: true,
    write: true,
    create: true,
  });

  const command = new Deno.Command(`${e.detail.path}/app`, {
    args: [
      `--port=${port}`,
      `--sourceDir=${e.detail.path}/src`,
    ],
    // stdin: "piped",
    stdout: "piped",
    stderr: "piped",
  });

  const process = command.spawn();

  // example of combining stdout and stderr while sending to a file
  const joined = mergeReadableStreams(
    process.stdout,
    process.stderr,
  );

  // returns a promise that resolves when the process is killed/closed
  joined.pipeTo(file.writable).then(() => console.log("Logs Loaded"));

  // setup pid
  if (hostProcess.pid && !e.detail.init) {
    try {
      Deno.kill(hostProcess.pid, "SIGINT");
    } catch (error) { 
      console.log("Error killing process", error)
    }
  }

  // Set new host details
  await kv.set(["hp", e.detail.hostname], {
    port,
    pid: process.pid,
  });
});

const getLastAssignedPort = async (): Promise<AppPorts> => {
  const appPort: AppPorts =
    (await kv.get(["availiblePorts"])).value as AppPorts || {
      production: 8002,
      staging: 8003,
      development: 8004,
    };

  await kv.set(["availiblePorts"], {
    production: appPort.production + 3,
    development: appPort.development + 3,
    staging: appPort.staging + 3,
  });

  return appPort;
};

const RunApp = ({ init, hostname, port, name, path }: AppSettings) => {
  const launchApp = new CustomEvent("loadApp", {
    bubbles: true,
    detail: { hostname, port, name, path, init },
  });

  dispatchEvent(launchApp);
};

const getRegisteredApp = async (hostname: string): Promise<App> => {
  return (await kv.get(["app", hostname])).value as App;
};

const decoder = new TextDecoder("utf-8");

const cert_path = Deno.env.get("CERT_PATH");
const key_path = Deno.env.get("KEY_PATH");

let port = 8000;
let cert, key;

if (key_path && cert_path) {
  cert = decoder.decode(await Deno.readFile(cert_path));
  key = decoder.decode(await Deno.readFile(key_path));
  port = 443;
}

Deno.serve({ cert, key, port }, async (request: Request) => {
  const uri = new URL(request.url);

  console.log("calling", uri.hostname)
  const hostProcess: HostProcess = (await kv.get(["hp", uri.hostname])).value as HostProcess 

  if (!hostProcess) {
    return new Response("How can I help");
  }

  const headers = request.headers;
  const body = request.body;

  const method = request.method;

  // we might run into a serious issue with certs here
  return fetch(
    `http://localhost:${hostProcess.port}${uri.pathname}${uri.search}`,
    {
      method,
      headers,
      body,
    },
  );
});

Deno.serve({ port: 8001 }, async (request: Request) => {
  const { searchParams, pathname } = new URL(request.url);
  const hostname = searchParams.get("hostname");

  if (!hostname) {
    return new Response("Hostname not provided", {
      status: 500,
    });
  }

  const app: App = await getRegisteredApp(hostname) || {};

  if (!app && pathname !== "/register") {
    return new Response(`App ${hostname} does not exist`, {
      status: 500,
    });
  }

  if (false) {
    return new Response("Inccorect Nguvu Cloud Keys", {
      status: 500,
    });
  }

  if (request.method === "POST") {
    if (pathname === "/register") {
      const newApp: App = await request.json();
      app.port = await getLastAssignedPort();
      console.log("registering", hostname)
      await kv.set(["app", hostname], { ...app, ...newApp });
    }

    if (pathname === "/deploy") {
      const deployedStatus = await deploy(request, app);

      if (deployedStatus.isDeployed) {
        RunApp({
          init: false,
          hostname,
          port: app.port,
          name: deployedStatus.name,
          path: deployedStatus.deployPath,
        });
        app.path = deployedStatus.deployPath;
        await kv.set(["app", hostname], app);
      }
    }
  }

  return new Response("Deployed to Nguvu Cloud");
});

RunApps();
