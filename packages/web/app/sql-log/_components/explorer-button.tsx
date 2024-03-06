"use client";

import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ExplorerButton({
  explorerName,
  txnUrl,
}: {
  explorerName: string;
  txnUrl: string;
}) {
  return (
    <Button
      variant="ghost"
      size="default"
      className="ml-auto gap-x-1"
      onClick={() => window.open(txnUrl)}
    >
      <ExternalLink className="shrink-0" />
      View on {explorerName}
    </Button>
  );
}
