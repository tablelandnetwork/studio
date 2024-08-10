import {
  type ColumnDef,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import { init } from "@tableland/sqlparser";
import { getBaseUrl, studioAliases } from "@tableland/studio-client";
import { Database, type Result, helpers } from "@tableland/sdk";
import CodeMirror from "@uiw/react-codemirror";
import { SQLite, sql } from "@codemirror/lang-sql";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { Loader2 } from "lucide-react";
import { getNetwork, switchNetwork } from "wagmi/actions";
import { type RouterOutputs } from "@tableland/studio-api";
import { DataTable } from "./data-table";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";
import HashDisplay from "./hash-display";
import { ensureError } from "@/lib/ensure-error";
import { parseTableName } from "@/lib/parse-table-name";
import { objectToTableData } from "@/lib/utils";

init().catch((err: any) => {
  console.log("could not init sqlparser:", err);
  throw err;
});

export function Console({
  environmentId,
  deployments,
  nativeMode,
  query,
  setQuery,
  res,
  setRes,
}: {
  environmentId: string;
  deployments: RouterOutputs["deployments"]["deploymentsByEnvironmentId"];
  nativeMode: boolean;
  query: string;
  setQuery: (query: string) => void;
  res: Result<Record<string, unknown>> | undefined;
  setRes: (res: Result<Record<string, unknown>> | undefined) => void;
}) {
  const { toast, dismiss } = useToast();

  const [pending, setPending] = useState(false);

  const schema = deployments.reduce<Record<string, string[]>>(
    (acc, deployment) => {
      const cols = deployment.def.schema.columns.map((col) => col.name);
      const aliased = { [deployment.def.name]: cols };
      const native = nativeMode
        ? { [deployment.deployment.tableName]: cols }
        : {};
      return {
        ...acc,
        ...aliased,
        ...native,
      };
    },
    {},
  );

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
  const data = useMemo(() => {
    if (!res) return [];
    return objectToTableData(res.results);
  }, [res]);

  useEffect(() => {
    if (res && !res.results.length && res.meta.txn) {
      toast({
        title: "Success!",
        description: (
          <span>
            Txn hash:{" "}
            <div className="inline-block">
              <HashDisplay hash={res.meta.txn.transactionHash} copy />
            </div>
          </span>
        ),
      });
      setRes(undefined);
    }
  }, [res, setRes, toast]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const runQuery = async () => {
    const aliases = studioAliases({
      environmentId,
      apiUrl: getBaseUrl(),
    });
    const nameMapping = await aliases.read();
    const aliasMap = new Map(Object.entries(nameMapping));

    const { statements, tables, type } = await sqlparser.normalize(query);

    const uuTableNames = tables
      .map((table) => aliasMap.get(table))
      .filter((table) => table !== undefined) as string[];
    if (uuTableNames.length !== tables.length) {
      throw new Error("Invalid table name.");
    }

    const chainIds = uuTableNames
      .map((name) => parseTableName(name).chainId)
      .filter((item, i, ar) => ar.indexOf(item) === i);
    const chainId = chainIds[0];

    if (statements.length < 1) {
      throw new Error("You must provide a query statement.");
    }

    if (type === "create") {
      throw new Error(
        "Create statements are not supported, create and deploy a new table instead.",
      );
    }

    if (type === "read" && statements.length > 1) {
      throw new Error("You may only run one read statement at a time.");
    }

    if (type === "acl" || type === "write") {
      if (chainIds.length > 1) {
        throw new Error(
          "Multiple mutating statements must be for tables on the same chain.",
        );
      }
      const currentNetwork = getNetwork();
      if (currentNetwork.chain?.id !== chainId) {
        await switchNetwork({ chainId });
      }
    }

    const baseUrl = helpers.getBaseUrl(chainId);
    const db = new Database({ baseUrl, aliases, autoWait: true });

    if (statements.length === 1) {
      const res = await db.prepare(statements[0]).all();
      return res;
    }
    const res = await db.batch(statements.map((stmt) => db.prepare(stmt)));
    return res[0] as Result<Record<string, unknown>>;
  };

  const handleRunQuery = () => {
    setRes(undefined);
    dismiss();
    setPending(true);
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
      })
      .finally(() => {
        setPending(false);
      });
  };

  return (
    <div className="flex h-full flex-col justify-stretch">
      <div className="min-h-[200px]">
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
      </div>
      <Button
        onClick={handleRunQuery}
        className="mt-2 gap-x-2 self-start"
        disabled={pending}
      >
        {pending && <Loader2 className="size-4 animate-spin" />}
        Run Query
      </Button>
      <DataTable table={table} className="flex-grow" />
    </div>
  );
}
