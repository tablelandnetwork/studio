import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { z } from "zod";
import { JsonRpcSigner, BrowserProvider } from "ethers";
import { type WalletClient } from "wagmi";
import { type useToast } from "@/components/ui/use-toast";

type Toast = ReturnType<typeof useToast>["toast"];

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const objSchema = z.record(z.string(), z.any());
const arrSchema = z.array(z.any());
// accepts an Array with any entries that are any kind of Object and goes
// through each Object's keys to ensure that values containing an Object or
// Array are `stringify`ed.  This enables showing nested data in an html table
// without the dreded "[object Object]"
export function objectToTableData<TData>(data: any[]) {
  data = arrSchema.parse(data);

  return data.map(function (d) {
    return Object.fromEntries(
      Object.entries(objSchema.parse(d)).map(function ([key, val]) {
        // check for Object or Array
        if (typeof val === "object" && val !== null) {
          try {
            val = JSON.stringify(val);
          } catch (err) {
            console.log(`could not stringify`, err);
          }
        }

        return [key, val];
      }),
    ) as TData;
  });
}

export const handleCopy = function (text: string, desc: string, toast: Toast) {
  // TODO: clickboard write text is probably really fast, so it might not be
  //    needed here, but some kind lock of the UI when async ops are happening
  //    could make the ui feel more responsive.
  navigator.clipboard
    .writeText(text)
    .then(function () {
      toast({
        title: "Done!",
        description: `${desc} has been copied to your clipboard.`,
        duration: 2000,
      });
    })
    .catch(function (err) {
      const errMessage = [
        `Could not copy ${desc} ${text} to your clipboard.`,
        typeof err.message === "string" ? err.message : undefined,
      ]
        .filter((s) => s)
        .join(" ");

      toast({
        title: "Error!",
        description: errMessage,
        // Leave the toast open for 10 seconds so they have a chance to copy
        // the text in the toast.
        duration: 10000,
      });
    });
};

// Given a column name with escape characters, return the fomatted name.
export const formatIdentifierName = function (name: string) {
  return name
    .replace(/^`/, "")
    .replace(/`$/, "")
    .replace(/^"/, "")
    .replace(/"$/, "")
    .replace(/^\[/, "")
    .replace(/"\]/, "");
};

export const walletClientToSigner = function (
  walletClient: WalletClient,
): JsonRpcSigner {
  const { account, chain, transport } = walletClient;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };
  const provider = new BrowserProvider(transport, network);
  const signer = new JsonRpcSigner(provider, account.address);
  return signer;
};
