import path from "path";
import { fileURLToPath } from "url";
import * as dotenv from "dotenv";
import { LocalTableland } from "@tableland/local";
import { helpers } from "@tableland/sdk";
import { after, before } from "mocha";
import {
  TEST_REGISTRY_PORT,
  TEST_TIMEOUT_FACTOR,
  TEST_VALIDATOR_URL,
} from "./utils";

// `kv` needs the connection env vars
dotenv.config();

const _dirname = path.dirname(fileURLToPath(import.meta.url));
// this sets default values globally
helpers.overrideDefaults("local-tableland", { baseUrl: TEST_VALIDATOR_URL });
helpers.overrideDefaults("localhost", { baseUrl: TEST_VALIDATOR_URL });

const lt = new LocalTableland({
  validator: path.resolve(_dirname, "validator"),
  registryPort: TEST_REGISTRY_PORT,
  silent: false,
});

before(async function () {
  this.timeout(90000 * TEST_TIMEOUT_FACTOR);
  await lt.start();
});

after(async function () {
  // shutdown tableland network
  await lt.shutdown();
});
