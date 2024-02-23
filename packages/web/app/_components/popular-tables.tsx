"use client";

import Link from "next/link";
import { TypographyH3 } from "@/components/typography-h3";
import { useEffect, useState } from "react";
import { chainsMap } from "../../lib/chains-map";
import ChainSelector from "@/components/chain-selector";
import { Label } from "@/components/ui/label";
import { PopularTable, getPopularTables } from "@/lib/validator-queries";
import { TypographyP } from "@/components/typography-p";
import { cn } from "@/lib/utils";
import { Paginator } from "./paginator";

export function PopularTables({
  initialData,
}: {
  initialData: PopularTable[];
}) {
  const [popularTables, setPopularTables] =
    useState<PopularTable[]>(initialData);
  const [selectedChain, setSelectedChain] = useState<
    number | "mainnets" | "testnets"
  >("mainnets");
  const [loading, setLoading] = useState(false);
  const [pageSize, _] = useState(10);
  const [page, setPage] = useState(0);
  useEffect(() => {
    setLoading(true);
    getPopularTables(selectedChain).then((tables) => {
      setPopularTables(tables);
      setLoading(false);
    });
  }, [selectedChain]);

  const offset = page * pageSize;

  return (
    <>
      <div className="mt-8 flex items-end gap-4">
        <div className="flex flex-col">
          <TypographyH3>Active Tableland tables</TypographyH3>
          <TypographyP>
            Tables ranked by the most write operations in the last 24 hours.
          </TypographyP>
        </div>
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
        {popularTables.length === 0 && (
          <div className="text-muted-foreground">
            No active tables in the last 24 hours
          </div>
        )}
        {popularTables.slice(offset, offset + pageSize).map((table, n) => (
          <Link
            key={`${table.chain_id}-${table.table_id}`}
            href={`/tables/${table.prefix}_${table.chain_id}_${table.table_id}`}
            className="flex flex-col items-start gap-2 rounded-lg border p-4 text-left text-sm transition-all hover:bg-accent"
          >
            <div className="flex w-full flex-col gap-1">
              <div className="flex items-center gap-4">
                <div className="text-lg text-muted-foreground">
                  {pageSize * page + n + 1}
                </div>
                <div className="flex flex-col gap-1">
                  <div className="text-sm font-semibold">
                    {`${table.prefix}_${table.chain_id}_${table.table_id}`}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {chainsMap.get(table.chain_id)?.name} |{" "}
                    {table.controller.slice(0, 4)}...
                    {table.controller.slice(-4)}
                  </div>
                </div>
                <div className="ml-auto text-sm text-muted-foreground">
                  {table.count + (table.count === 1 ? " write" : " writes")}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      <Paginator
        numItems={popularTables.length}
        pageSize={pageSize}
        page={page}
        setPage={setPage}
      />
    </>
  );
}
