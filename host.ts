import { ensureDir } from "jsr:@std/fs@1.0.3";
import { join } from "jsr:@std/path@1.0.3/join";
import { App } from "./models/app.ts";

const deploy = async (request: Request, app: App) => {
  console.time("file saved");
  const name = app.name.replaceAll(" ", ".").toLowerCase() ||
    Date.now().toString();
  let deployPath: string = "";
  let versionId: string = "";
  let isDeployed: boolean = false;

  if (request.body) {
    const tempDir = await Deno.makeTempDir({ prefix: "nguvu-cloud" });

    await ensureDir(join(tempDir, "deploy"));

    // const reader = await request.body.getReader();

    const appPath = `${join(tempDir, "deploy")}/${name}.tar.gz`;

    const f = await Deno.open(appPath, {
      create: true,
      write: true,
    });

    await request.body.pipeTo(f.writable);

    versionId = Date.now().toString();
    deployPath = join(Deno.env.get("DEPLOY_PATH") || "", name, versionId);
    await ensureDir(deployPath);

    // Uncompress tar archive
    const tarCommand = new Deno.Command("tar", {
      args: ["xzf", appPath, "-C", deployPath, "."],
      stdout: "inherit",
      stderr: "inherit",
    });

    const { success: tarSuccess } = await tarCommand
      .output();
    if (!tarSuccess) {
      console.error("Failed to uncomress tar archive.");
    }

    isDeployed = true;
  }

  console.timeEnd("file saved");

  return {
    name,
    deployPath,
    versionId,
    isDeployed,
  };
};

export default deploy;
