import SmartAccount from "@biconomy/smart-account";
import { TablelandTables__factory } from "@tableland/evm";
import { Database } from "@tableland/sdk";
import { ethers } from "ethers";

export default function SmartAccountDatabase(
  smartAccount: SmartAccount
): Database {
  const { signer } = smartAccount;

  const signAndSendOverride = async ({
    signer,
    contractAddress,
    functionSignature,
    functionArgs,
    overrides,
  }: any) => {
    const ci = new ethers.utils.Interface(TablelandTables__factory.abi);
    const txData = ci.encodeFunctionData(functionSignature, functionArgs);

    const tx = {
      to: contractAddress,
      data: txData,
    };

    const response = await smartAccount.sendTransaction({ transaction: tx });

    const receipt = await response.wait();

    const events = receipt.logs.map((log) => {
      try {
        const l = ci.parseLog(log);
        const event = ci.decodeEventLog(l.eventFragment, log.data);
        return {
          args: event,
          event: l.name,
        };
      } catch (e) {
        console.log(e);
        return null;
      }
    });

    return { ...response, events };
  };

  return new Database({
    signer,
    signAndSendOverride,
    autoWait: true,
  });
}
