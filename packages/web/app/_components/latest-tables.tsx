"use client";

import Link from "next/link";
import TimeAgo from "javascript-time-ago";
import { TypographyH3 } from "@/components/typography-h3";
import { useEffect, useState } from "react";
import { chainsMap } from "../../lib/chains-map";
import ChainSelector from "@/components/chain-selector";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Table, getLatestTables } from "@/lib/validator-queries";
import { Paginator } from "./paginator";

const timeAgo = new TimeAgo("en-US");

export function LatestTables({ initialData }: { initialData: Table[] }) {
  const [latestTables, setLatestTables] = useState<Table[]>(initialData);
  const [selectedChain, setSelectedChain] = useState<
    number | "mainnets" | "testnets"
  >("mainnets");
  const [loading, setLoading] = useState(false);
  const [pageSize, _] = useState(10);
  const [page, setPage] = useState(0);
  useEffect(() => {
    setLoading(true);
    getLatestTables(selectedChain).then((tables) => {
      setLatestTables(tables);
      setLoading(false);
    });
  }, [selectedChain]);

  const offset = page * pageSize;

  return (
    <>
      <div className="mt-8 flex items-end gap-4">
        <TypographyH3>Latest Tableland tables</TypographyH3>
        <div className="ml-auto flex items-center gap-2">
          <Label>Chain:</Label>
          <ChainSelector
            showAll
            onValueChange={(v) => {
              setSelectedChain(v);
            }}
          />
        </div>
      </div>
      <div className={cn("mt-4 flex flex-col gap-4", loading && "opacity-30")}>
        {latestTables.slice(offset, offset + pageSize).map((table) => (
          <Link
            key={`${table.chain_id}-${table.id}`}
            href={`/tables/${table.prefix}_${table.chain_id}_${table.id}`}
            className="flex flex-col items-start gap-2 rounded-lg border p-4 text-left text-sm transition-all hover:bg-accent"
          >
            <div className="flex w-full flex-col gap-1">
              <div className="flex items-center gap-2">
                <div className="flex flex-col gap-1">
                  <div className="text-sm font-semibold">
                    {`${table.prefix}_${table.chain_id}_${table.id}`}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {chainsMap.get(table.chain_id)?.name} |{" "}
                    {table.controller.slice(0, 4)}...
                    {table.controller.slice(-4)}
                  </div>
                </div>
                <div className="ml-auto text-sm text-muted-foreground">
                  {timeAgo.format(new Date(table.created_at * 1000))}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      <Paginator
        numItems={latestTables.length}
        pageSize={pageSize}
        page={page}
        setPage={setPage}
      />
    </>
  );
}
