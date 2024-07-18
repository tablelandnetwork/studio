"use client";

import { Database, helpers } from "@tableland/sdk";
import { studioAliases, getBaseUrl } from "@tableland/studio-client";
import { init } from "@tableland/sqlparser";
import {
  type ColumnDef,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";
import { CodeEditor } from "./code-editor";
import { DataTable } from "./data-table";
import { cn, objectToTableData } from "@/lib/utils";

init().catch((err: any) => {
  console.log("could not init sqlparser:", err);
  throw err;
});

export function Console({ environmentId }: { environmentId: string }) {
  const [query, setQuery] = useState("");
  const [columns, setColumns] = useState<Array<ColumnDef<unknown>> | undefined>(
    [],
  );
  const [results, setResults] = useState<Array<Record<string, unknown>>>([]);
  const [messages, setMessages] = useState<string[]>([]);
  const [error, setError] = useState<Error | undefined>();
  const [loading, setLoading] = useState(false);
  // TODO: We will have to import more of the css for the old console to enable line numbers
  const [hideLineNumbers] = useState(true);

  const runQuery = async function ({ query: queryText }: { query: string }) {
    if (loading) return;
    setLoading(true);

    try {
      //   const { statements, tables } = await sqlparser.normalize(queryText);
      //   if (statements.length > 1) {
      //     throw new Error("you may only run one statement at a time");
      //   }
      //   if (statements.length < 1) {
      //     throw new Error("you must provide a query statement");
      //   }

      //   const statement = statements[0];
      //   const aliases = studioAliases({
      //     environmentId,
      //     apiUrl: getBaseUrl(),
      //   });
      //   const aliasMap = await aliases.read();

      //   const uuTableName = aliasMap[tables[0]];
      //   if (!uuTableName) throw new Error("invalid table name");

      //   const chainId = parseInt(uuTableName.split("_").reverse()[1], 10);
      //   const baseUrl = helpers.getBaseUrl(chainId);
      //   const db = new Database({ baseUrl, aliases, autoWait: true });
      //   const data = await db.prepare(statement).all();

      //   const columns = data
      //     ? data.results.length
      //       ? Object.keys(data.results[0] as object).map((col) => ({
      //           accessorKey: col,
      //           header: col,
      //         }))
      //       : []
      //     : undefined;

      setError(undefined);
      setMessages([]);
      setColumns([
        { accessorKey: "id", header: "id" },
        { accessorKey: "name", header: "name" },
      ]);
      setResults([
        { id: 1, name: "aaron" },
        { id: 2, name: "james" },
      ]);
      // if (!columns?.length && data.success && data.meta.txn?.transactionHash) {
      //   setMessages([
      //     `success: ${data.success?.toString()}`,
      //     `duration: ${data.meta.duration}`,
      //     `tableIds: ${data.meta.txn?.tableIds.join(", ") ?? ""}`,
      //     `transactionHash: ${data.meta.txn.transactionHash}`,
      //     `blockNumber: ${data.meta.txn?.blockNumber ?? ""}`,
      //     `chainId: ${data.meta.txn?.chainId ?? ""}`,
      //     `universalTableNames": ${data.meta.txn?.names.join(", ") ?? ""}`,
      //     `definitionNames: ${data.meta.txn?.prefixes.join(", ") ?? ""}`,
      //   ]);
      // }

      setLoading(false);
    } catch (err: any) {
      setError(err);
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 space-y-4">
      <div className={cn("tabs-pane", loading ? "text-muted" : "")}>
        <div>
          <QueryPane
            query={query}
            runQuery={runQuery}
            hideLineNumbers={hideLineNumbers}
            loading={loading}
          />

          <ResultSetPane
            results={results}
            loading={loading}
            columns={columns}
            error={error}
            messages={messages}
          />
        </div>
      </div>
    </div>
  );
}

function QueryPane(props: any): React.JSX.Element {
  const { query: initialQuery, runQuery, loading, hideLineNumbers } = props;

  const [query, setQuery] = useState(initialQuery);
  const updateQuery = function (payload: any) {
    setQuery(payload.query);
  };

  const sendQuery = function (event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    runQuery({ query });
  };

  return (
    <div className={cn("executer", loading ? "cursor-wait" : "")}>
      <div className="rounded-b-md rounded-tr-md border bg-card">
        <CodeEditor
          hideLineNumbers={hideLineNumbers}
          onChange={(code: any) => {
            updateQuery({ query: code });
          }}
          code={query}
          loading={loading}
        />
      </div>
      <Loading show={props.loading} />
      <ul className="action-icons-bar">
        <li>
          <button
            disabled={props.loading}
            className="my-4 mr-4 inline-flex h-8 items-center justify-center rounded-md border border-input bg-transparent px-3 text-xs font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            // TODO: typescript errors out with "Types of parameters 'event' and 'event' are incompatible"
            //   I haven't tried to dig into the cause.
            // @ts-expect-error see the above TODO
            onClick={sendQuery}
          >
            Run Query
          </button>

          {/* <button
            className="my-4 mr-4 inline-flex h-8 items-center justify-center rounded-md border border-input bg-transparent px-3 text-xs font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            onClick={() => {
              let savedQueries = JSON.parse(
                localStorage.getItem("savedQueries") as any,
              );
              savedQueries = Array.isArray(savedQueries) ? savedQueries : [];
              savedQueries.push({
                query,
                name: tab.name,
              });
              localStorage.setItem(
                "savedQueries",
                JSON.stringify(savedQueries),
              );
            }}
          >
            Save
          </button> */}
        </li>
      </ul>
    </div>
  );
}

function Loading(props: any): React.JSX.Element {
  return (
    <div className={`loading-please ${props.show ? "open" : "closed"}`}>
      <i className="fas fa-circle-notch fa-spin"></i>
    </div>
  );
}

function ResultSetPane(props: any): React.JSX.Element {
  const { results, columns, error, messages } = props;
  const data = objectToTableData(results);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="table-results">
      {error && (
        <div className="error mt-4 rounded-md border p-4">
          Error<br></br>
          {error.message}
        </div>
      )}
      {!!messages?.length && (
        <div className="mt-4 rounded-md border p-4">
          {messages.map((message: string, i: number) => {
            return <p key={i}>{message}</p>;
          })}
        </div>
      )}
      {!error && !messages?.length && <DataTable table={table} />}
    </div>
  );
}
