import fs from "fs";
import path from "path";
import { type helpers } from "@tableland/sdk";
import { provider } from "./wallet";

const tablesFile = (async (): Promise<string> => {
  const { chainId } = await provider.getNetwork();
  const file = path.join(process.cwd(), `tables_${chainId}.json`);

  return await new Promise(function (resolve, reject) {
    fs.access(file, fs.constants.F_OK, (err) => {
      if (err) {
        reject(err);
      }
      resolve(file);
    });
  });
})();

export const databaseAliases = {
  read: async function () {
    const jsonBuf = fs.readFileSync(await tablesFile);
    return JSON.parse(jsonBuf.toString()) as helpers.NameMapping;
  },
  write: async function (nameMap: helpers.NameMapping) {
    throw new Error("Cannot write to readonly aliases");
  },
};
