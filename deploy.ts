// Copyright Worklyn Station Inc. All Rights Reserved. Proprietary and confidential.
// Inspired by Codebender HQ Inc Deploy and Deno Land Inc ddng


  /**
  * This module contains function deploy, .
  * @module
  */

import { parseArgs } from "jsr:@std/cli@1.0.3/parse-args";
import { join } from "jsr:@std/path@1.0.3/join";
import { ensureDir } from "jsr:@std/fs@1.0.3";
const args = parseArgs(Deno.args);
 

const sourceDir = args.sourceDir || Deno.cwd();
let entryPoint = args.entryPoint;
let hostname = args.hostname;

// Prepare temp directory
const tempDir = await Deno.makeTempDir({ prefix: "nguvu-cloud" });
await ensureDir(join(tempDir, "pkg", "deno_dir"));
await ensureDir(join(tempDir, "pkg", "src"));

console.log("%cTemporary Directory Created", "color: blue");

// Copy source code to tempdir
const copyCommand = new Deno.Command("bash", {
  args: [
    "-c",
    `(cd "${sourceDir}" && tar --exclude='.git' -cf - .) | (cd "${tempDir}/pkg/src" && tar -xf -)`,
  ],
  stdout: "inherit",
  stderr: "inherit",
});

const { success: copySuccess } = await copyCommand
  .output();
if (!copySuccess) {
  console.error("Failed to copy source code.");
  Deno.exit(1);
}

console.log("%cSource Code Copied To Temp Directory", "color: blue");

// Detect entry point if not specified
if (!entryPoint) {
  const possibleEntryPoints = [
    "main.ts",
    "main.js",
    "index.ts",
    "index.js",
    "mod.ts",
    "mod.js",
  ];

  for (const ep of possibleEntryPoints) {
    if (
      await Deno.stat(join(tempDir, "pkg", "src", ep)).catch(() => null)
    ) {
      entryPoint = ep;
      break;
    }
  }
}

console.log(
  `%cStarting to Compile %c${entryPoint}`,
  "color: blue",
  "color: green",
);

// Compile App
const compileCommand = new Deno.Command("deno", {
  env: { "DENO_DIR": join(tempDir, "pkg", "deno_dir") },
  args: [
    "compile",
    "--node-modules-dir=auto",
    "--reload",
    "--vendor", 
    "-A",
    "-o",
    join(tempDir, "pkg", "app"),
    join(tempDir, "pkg", "src", entryPoint),
  ],
  stdout: "inherit",
  stderr: "inherit",
});
const { success: cacheSuccess } = await compileCommand
  .output();
if (!cacheSuccess) {
  console.error("Failed to cache dependencies.");
  Deno.exit(1);
}

console.log(`%cCompiled %c${entryPoint}`, "color: blue", "color: green");

const packagedApp = join(tempDir, "pkg.tar.gz");

console.log(
  `%cStarting to package %c${packagedApp}`,
  "color: blue",
  "color: green",
);

// Create tar archive
const tarCommand = new Deno.Command("tar", {
  args: ["czf", packagedApp, "-C", join(tempDir, "pkg"), "."],
  stdout: "inherit",
  stderr: "inherit",
});

const { success: tarSuccess } = await tarCommand
  .output();
if (!tarSuccess) {
  console.error("Failed to create tar archive.");
  Deno.exit(1);
}

console.log(
  `%cSuccefully packaged %c${packagedApp}`,
  "color: blue",
  "color: green",
);

const size = (await Deno.stat(packagedApp)).size;
const packageAppFile = await Deno.open(packagedApp, { read: true });

console.log(
  `%cDeploying packaged app: %c${packagedApp}`,
  "color: blue",
  "color: green",
);

// Upload to VM
fetch(`${Deno.env.get("DEPLOY_URL")}?hostname=${hostname}`, {
  method: "POST",
  headers: {
    "content-length": `${size}`,
    "content-type": "application/tar",
  },
  body: packageAppFile.readable,
}).then(async (res) => {
  if (res.status === 500 || res.status === 404) {
    throw new Error(`Unable to deploy: ${await res.text()}`);
  }
  console.log(
    `%cDeployed packaged app to %c${Deno.env.get("DEPLOY_URL")}`,
    "color: green",
    "color: blue",
  );
  Deno.exit(0);
}).catch((err) => {
  console.error(
    `%cDeployed packaged app to %c${Deno.env.get("DEPLOY_URL")}`,
    "color: red",
    "color: blue",
  );
  console.error(`%cReason:${err.message}`, "color: red");
  Deno.exit(1);
});
