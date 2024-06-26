import { type SelectProps } from "@radix-ui/react-select";
import { supportedChains } from "@tableland/studio-chains";
import { type Chain } from "viem/chains";
import { forwardRef } from "react";
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
  onValueChange?: (value: number | "mainnets" | "testnets") => void;
  showAll?: boolean;
};

const ChainSelector = forwardRef<React.ElementRef<typeof SelectTrigger>, Props>(
  ({ onValueChange = () => {}, showAll = false, ...rest }: Props, ref) => {
    function handleOnValueChange(val: string) {
      if (val === "mainnets" || val === "testnets") {
        onValueChange(val);
      } else {
        const num = parseInt(val, 10);
        if (isNaN(num)) return;
        onValueChange(num);
      }
    }

    return (
      <Select
        {...rest}
        onValueChange={handleOnValueChange}
        defaultValue={showAll ? "testnets" : undefined}
      >
        <SelectTrigger className="w-fit gap-x-2" ref={ref}>
          <SelectValue placeholder="Select chain" />
        </SelectTrigger>
        <SelectContent>
          <ScrollArea className="h-[20rem]">
            {showAll && (
              <>
                <SelectItem key="mainnets" value="mainnets">
                  All mainnets
                </SelectItem>
                <SelectItem key="testnets" value="testnets">
                  All testnets
                </SelectItem>
              </>
            )}
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
  },
);

ChainSelector.displayName = "ChainSelector";

export default ChainSelector;
