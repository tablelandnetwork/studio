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
import { cn, handleCopy } from "@/lib/utils";

export default function HashDisplay({
  hash,
  numCharacters = 5,
  copy = false,
  hashDesc = "address",
  className,
  ...rest
}: HTMLProps<HTMLDivElement> & {
  hash: string;
  numCharacters?: number;
  copy?: boolean;
  hashDesc?: string;
}) {
  const { toast } = useToast();
  const slicedHash =
    hash.length > numCharacters * 2
      ? `${hash.slice(0, numCharacters)}...${hash.slice(-numCharacters)}`
      : hash;

  return (
    <div className="flex items-center justify-center">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className={cn("text-sm", className)} {...rest}>
              {slicedHash}
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
                onClick={() => handleCopy(hash, hashDesc, toast)}
              >
                <Copy className="size-4 opacity-50" />
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
