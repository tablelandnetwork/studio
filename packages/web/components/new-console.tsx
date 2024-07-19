"use client";

import {
  type ColumnDef,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { init } from "@tableland/sqlparser";
import { getBaseUrl, studioAliases } from "@tableland/studio-client";
import { Database, type Result, helpers } from "@tableland/sdk";
import CodeMirror from "@uiw/react-codemirror";
import { SQLite, sql } from "@codemirror/lang-sql";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { type schema } from "@tableland/studio-store";
import { DataTable } from "./data-table";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";
import { ensureError } from "@/lib/ensure-error";

init().catch((err: any) => {
  console.log("could not init sqlparser:", err);
  throw err;
});

export function Console({
  environmentId,
  defs,
}: {
  environmentId: string;
  defs: schema.Def[];
}) {
  const [query, setQuery] = useState("");
  const [res, setRes] = useState<Result<Record<string, unknown>> | undefined>();

  const schema = defs.reduce<Record<string, string[]>>((acc, def) => {
    return { ...acc, [def.name]: def.schema.columns.map((col) => col.name) };
  }, {});

  console.log(JSON.stringify(schema, null, 2));

  const columns: Array<ColumnDef<unknown>> = useMemo(
    () =>
      res?.results.length
        ? Object.keys(res.results[0]).map((col) => ({
            accessorKey: col,
            header: col,
          }))
        : [],
    [res],
  );
  const data = useMemo(() => res?.results ?? [], [res]);
  const messages = useMemo(() => {
    let messages: string[] = [];
    if (res && !res.results.length) {
      messages = [
        ...messages,
        // TODO: Typescript says that res.success can only be true. Why?
        `success: ${res.success ? "true" : "false"}`,
        `duration: ${res.meta.duration}`,
      ];
      if (res.meta.txn) {
        messages = [
          ...messages,
          `tableIds: ${res.meta.txn.tableIds.join(", ") ?? ""}`,
          `transactionHash: ${res.meta.txn.transactionHash}`,
          `blockNumber: ${res.meta.txn.blockNumber ?? ""}`,
          `chainId: ${res.meta.txn.chainId ?? ""}`,
          `universalTableNames: ${res.meta.txn.names.join(", ") ?? ""}`,
          `definitionNames: ${res.meta.txn.prefixes.join(", ") ?? ""}`,
        ];
      }
    }
    return messages;
  }, [res]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const { toast, dismiss } = useToast();

  const runQuery = async () => {
    const { statements, tables, type } = await sqlparser.normalize(query);
    if (statements.length > 1) {
      throw new Error("you may only run one statement at a time");
    }
    if (statements.length < 1) {
      throw new Error("you must provide a query statement");
    }

    const statement = statements[0];
    const aliases = studioAliases({
      environmentId,
      apiUrl: getBaseUrl(),
    });
    const aliasMap = await aliases.read();

    const uuTableName = aliasMap[tables[0]];
    if (!uuTableName) throw new Error("invalid table name");

    const chainId = parseInt(uuTableName.split("_").reverse()[1], 10);
    const baseUrl = helpers.getBaseUrl(chainId);
    const db = new Database({ baseUrl, aliases, autoWait: true });
    const res = await db.prepare(statement).all();
    return res;
  };

  const handleRunQuery = () => {
    setRes(undefined);
    dismiss();
    runQuery()
      .then((res) => {
        setRes(res);
      })
      .catch((err) => {
        toast({
          duration: 20000,
          title: "Error",
          description: ensureError(err).message,
          variant: "destructive",
        });
      });
  };

  return (
    <div className="flex min-h-full flex-1 flex-col justify-stretch">
      <CodeMirror
        value={query}
        extensions={[
          sql({
            dialect: SQLite,
            schema,
          }),
        ]}
        theme={vscodeDark}
        onChange={setQuery}
        minHeight="200px"
      />
      <Button onClick={handleRunQuery} className="mt-2 self-start">
        Run Query
      </Button>
      {!!messages.length && (
        <div className="mt-4 rounded-md border p-4">
          {messages.map((message: string, i: number) => {
            return <p key={i}>{message}</p>;
          })}
        </div>
      )}
      <DataTable table={table} className="flex-grow" />
    </div>
  );
}
