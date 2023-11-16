"use client";

import { type SelectProps } from "@radix-ui/react-select";
import { supportedChains } from "@tableland/studio-chains";
import { type Chain } from "viem/chains";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

const groupedChains = Array.from(
  supportedChains(
    typeof window !== "undefined" &&
      (window.location?.hostname === "localhost" ||
        window.location?.hostname === "127.0.0.1"),
  )
    .reduce(
      (acc, chain) => {
        if (chain.testnet === undefined) {
          acc.get("Others")?.push(chain);
        } else if (chain.testnet) {
          acc.get("Testnets")?.push(chain);
        } else {
          acc.get("Mainnets")?.push(chain);
        }
        return acc;
      },
      new Map<string, Chain[]>([
        ["Mainnets", []],
        ["Testnets", []],
        ["Others", []],
      ]),
    )
    .entries(),
);

type Props = Omit<SelectProps, "onValueChange"> & {
  onValueChange?: (value: number) => void;
};

export default function ChainSelector({
  onValueChange = () => {},
  ...rest
}: Props) {
  return (
    <Select {...rest} onValueChange={(val) => onValueChange(parseInt(val, 10))}>
      <SelectTrigger className="w-fit gap-x-2">
        <SelectValue placeholder="Select chain" />
      </SelectTrigger>
      <SelectContent>
        <ScrollArea className="h-[20rem]">
          {groupedChains.map((group) => {
            return group[1].length ? (
              <div key={group[0]}>
                <p className="px-2 pt-2 text-xs text-muted-foreground">
                  {group[0]}
                </p>
                {group[1].map((chain) => (
                  <SelectItem key={chain.name} value={`${chain.id}`}>
                    {chain.name} ({chain.id})
                  </SelectItem>
                ))}
              </div>
            ) : null;
          })}
        </ScrollArea>
      </SelectContent>
    </Select>
  );
}
