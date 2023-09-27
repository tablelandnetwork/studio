import { LocalTableland } from "@tableland/local";
import { spawn } from "child_process";
import { unlinkSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const _dirname = path.dirname(fileURLToPath(import.meta.url));

const lt = new LocalTableland({
  validatorDir: path.resolve(_dirname, "validator"),
});

const start = async function () {
  try {
    unlinkSync(path.resolve(_dirname, "..", "tables_31337.json"));
  } catch (err) {
    if (err.code !== "ENOENT") throw err;
  }

  await lt.start();

  await new Promise((resolve) => setTimeout(() => resolve(), 5000));

  spawn("npm", ["run", "exec-migrate"], {
    cwd: path.resolve(_dirname, ".."),
  });
};

start().catch(function (err) {
  console.error("start failed with:", err);
});

const handle = async function () {
  await lt.shutdown();
};

process.on("SIGINT", handle);
process.on("SIGTERM", handle);
