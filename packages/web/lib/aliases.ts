import fs from "fs";
import path from "path";
import { type helpers } from "@tableland/sdk";
import { provider } from "./wallet";

const tablesFile = (async (): Promise<string> => {
  const { chainId } = await provider.getNetwork();
  const file = path.join(process.cwd(), `tables_${chainId}.json`);

  return await new Promise(function (resolve) {
    fs.access(file, fs.constants.F_OK, (err) => {
      if (err) {
        fs.writeFileSync(file, JSON.stringify({}, null, 4));
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
    const jsonBuf = fs.readFileSync(await tablesFile);
    const jsonObj = { ...JSON.parse(jsonBuf.toString()), ...nameMap };
    fs.writeFileSync(await tablesFile, JSON.stringify(jsonObj, null, 4));
  },
};
