"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { chains } from "@/lib/chains";
import { type Chain } from "wagmi/chains";

const groupedChains = Array.from(
  chains()
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

interface Props {
  setValue: (v: string) => void;
}

export default function ChainSelector({ setValue }: Props) {
  return (
    <Select onValueChange={(val) => setValue(val)}>
      <SelectTrigger className="w-fit gap-x-2">
        <SelectValue placeholder="Select chain" />
      </SelectTrigger>
      <SelectContent>
        <ScrollArea className="h-[20rem]">
          {groupedChains.map((group) => {
            return !!group[1].length ? (
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
