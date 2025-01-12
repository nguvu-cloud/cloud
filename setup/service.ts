  /**
  * This module setups the systemd service on your VM.
  * @module
  */

import packageConfig from "../deno.json" with {type: "json"}; 
import { parseArgs } from "jsr:@std/cli@1.0.3/parse-args";
import { setupServeSh } from "./serve.ts";

const args = parseArgs(Deno.args);
 
const fileResponse = await fetch(`https://jsr.io/@nguvu/cloud/${packageConfig.version}/templates/nguvu-cloud.service`);

if (fileResponse.body) {
  const file = await Deno.open("./nguvu-cloud.service", { write: true, create: true });
 
  await fileResponse.body.pipeTo(file.writable);


  const decoder = new TextDecoder("utf-8");
  const data = await Deno.readFile("./nguvu-cloud.service");
  const serviceFile = decoder.decode(data)

  // /etc/systemd/system/nguvu-cloud.service
  await Deno.writeTextFile("/etc/systemd/system/nguvu-cloud.service", serviceFile.replace("{username}", args.username));

  await Deno.remove("./nguvu-cloud.service");
}

await setupServeSh()

// Enable Nguvu Cloud Service
const enableServeShCommand = new Deno.Command("chmod", {
  args: ["+x", "/serve.sh"],	
  stdout: "inherit",
  stderr: "inherit",
});

const { success: serveShSuccess } = await enableServeShCommand
  .output();
if (!serveShSuccess) {
  console.error("Failed to enable serve.sh.");
  Deno.exit(1);
}

console.log(
  `%cSuccefully enable serve.sh`,
  "color: blue",
);


// Enable Nguvu Cloud Service
const systemctlEnableCommand = new Deno.Command("systemctl", {
  args: ["enable", "nguvu-cloud.service"],
  stdout: "inherit",
  stderr: "inherit",
});

const { success: systemctlEnableSuccess } = await systemctlEnableCommand
  .output();
if (!systemctlEnableSuccess) {
  console.error("Failed to enable Nguvu Cloud Service.");
  Deno.exit(1);
}

console.log(
  `%cSuccefully enable Nguvu Cloud Service`,
  "color: blue",
);

// Start Nguvu Cloud Service
const systemctlStartCommand = new Deno.Command("systemctl", {
  args: ["start", "nguvu-cloud.service"],
  stdout: "inherit",
  stderr: "inherit",
});

const { success: systemctlStartSuccess } = await systemctlStartCommand
  .output();
if (!systemctlStartSuccess) {
  console.error("Failed to Start Nguvu Cloud Service.");
  Deno.exit(1);
}

console.log(
  `%cSuccefully Start Nguvu Cloud Service`,
  "color: blue",
);


await Deno.writeTextFile("/.env", "DEPLOY_PATH=/app");

console.log(
  `%cSuccefully created env file`,
  "color: blue",
);

console.log(
  `%cDeplpoyed Apps can be seen at %c/app`,
  "color: blue",
  "color: green"
);

console.log(
  `%cNguvu Cloud Cli comming soon`,
  "color: blue",
);

