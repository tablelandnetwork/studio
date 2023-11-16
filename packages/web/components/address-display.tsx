"use client";

import { Copy } from "lucide-react";
import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { useToast } from "@/components/ui/use-toast";

export default function AddressDisplay({
  address,
  numCharacters = 5,
  copy = false,
}: {
  address: string;
  numCharacters?: number;
  copy?: boolean;
}) {
  const { toast } = useToast();

  const handleCopy = () => {
    // TODO: clickboard write text is probably really fast, so it might not be
    //    needed here, but some kind lock of the UI when async ops are happening
    //    could make the ui feel more responsive.
    navigator.clipboard
      .writeText(address)
      .then(function () {
        toast({
          title: "Done!",
          description: "The address has been copied to your clipboard.",
          duration: 2000,
        });
      })
      .catch(function (err) {
        const errMessage = [
          "Could not copy the address to your clipboard.",
          typeof err.message === "string" ? err.message : undefined,
        ]
          .filter((s) => s)
          .join(" ");

        toast({
          title: "Error!",
          description: errMessage,
          duration: 2000,
        });
      });
  };

  return (
    <div className="flex items-center gap-1">
      <p className="text-sm text-muted-foreground">
        {address.slice(0, numCharacters)}...{address.slice(-numCharacters)}
      </p>
      {copy && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={"ghost"}
                className="h-auto p-1"
                onClick={handleCopy}
              >
                <Copy className="h-4 w-4 stroke-slate-300" />
                <span className="sr-only">Copy address</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Click to copy address</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}
