"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Paginator } from "./paginator";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { type SqlLog, getSqlLogs } from "@/lib/validator-queries";

export default function SQLLogs({
  tables,
}: {
  tables: Array<{ chainId: number; tableId: string }>;
}) {
  const [logs, setLogs] = useState<SqlLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(0);
  const [loadedPage, setLoadedPage] = useState(-1);
  const [maxLoadedPage, setMaxLoadedPage] = useState(-1);
  const [pageSize] = useState(10);
  useEffect(() => {
    async function loadLogs() {
      if (page <= maxLoadedPage) {
        setLoadedPage(page);
        return;
      }
      let beforeTimestamp =
        logs.length > 0 ? logs[logs.length - 1].timestamp : undefined;
      if (beforeTimestamp && maxLoadedPage === -1) {
        beforeTimestamp = undefined;
      }
      setLoading(true);
      const res = await getSqlLogs(tables, pageSize, beforeTimestamp);
      setLoading(false);
      setLogs(maxLoadedPage === -1 ? res : [...logs, ...res]);
      setLoadedPage(page);
      setMaxLoadedPage(page);
    }

    loadLogs().catch((err) => {
      setLoading(false);
      setError(err.message);
    });
  }, [page, pageSize, maxLoadedPage, tables, logs]);

  function refresh() {
    setMaxLoadedPage(-1);
    setPage(0);
  }

  const offset = loadedPage * pageSize;

  return (
    <div className={cn("flex flex-col gap-4", loading && "opacity-30")}>
      <Button
        variant="outline"
        className="ml-auto"
        onClick={refresh}
        disabled={loading}
      >
        <RefreshCw className="mr-2" />
        Refresh
      </Button>
      {error && <div className="text-red-500">{error}</div>}
      <div className="w-full">
        {logs.slice(offset, offset + pageSize).map((log) => (
          <div className="mb-4" key={`${log.txHash}-${log.eventIndex}`}>
            <Link
              className={cn(
                "flex items-center rounded-md border bg-card p-2 transition-all",
                log.error ? "bg-red-900 hover:bg-red-800" : "hover:bg-accent",
              )}
              href={`/sql-log?chainId=${log.chainId}&txnHash=${log.txHash}&index=${log.eventIndex}`}
              target="_blank"
            >
              {log.error && <AlertCircle className="shrink-0" />}
              <div className="px-2 text-sm text-muted-foreground">
                {new Date(log.timestamp * 1000).toLocaleString()}
              </div>
              <div className="break-all font-mono text-sm">
                <div>{log.statement}</div>
              </div>
            </Link>
          </div>
        ))}
      </div>
      <Paginator
        numItems={logs.length}
        page={page}
        setPage={setPage}
        pageSize={pageSize}
        disabled={loading}
      />
    </div>
  );
}
