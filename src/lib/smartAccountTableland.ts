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

    return await smartAccount.sendTransaction({ transaction: tx });
  };

  return new Database({
    signer,
    signAndSendOverride,
    autoWait: true,
  });
}
