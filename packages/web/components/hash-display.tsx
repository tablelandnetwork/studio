"use client";

import { Copy } from "lucide-react";
import { type HTMLProps } from "react";
import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

export default function HashDisplay({
  hash,
  numCharacters = 5,
  copy = false,
  hashDesc = "address",
  className,
  ...rest
}: HTMLProps<HTMLSpanElement> & {
  hash: string;
  numCharacters?: number;
  copy?: boolean;
  hashDesc?: string;
}) {
  const { toast } = useToast();

  const handleCopy = () => {
    // TODO: clickboard write text is probably really fast, so it might not be
    //    needed here, but some kind lock of the UI when async ops are happening
    //    could make the ui feel more responsive.
    navigator.clipboard
      .writeText(hash)
      .then(function () {
        toast({
          title: "Done!",
          description: `The ${hashDesc} has been copied to your clipboard.`,
          duration: 2000,
        });
      })
      .catch(function (err) {
        const errMessage = [
          `Could not copy the ${hashDesc} to your clipboard.`,
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
    <div>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              className={cn("text-sm text-muted-foreground", className)}
              {...rest}
            >
              {hash.slice(0, numCharacters)}...
              {hash.slice(-numCharacters)}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>{hash}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      {copy && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={"ghost"}
                className="ml-1 h-auto p-1"
                onClick={handleCopy}
              >
                <Copy className="h-4 w-4 stroke-slate-300" />
                <span className="sr-only">Copy {hashDesc}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Click to copy {hashDesc}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}
