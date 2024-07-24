"use client";

import * as React from "react";
import { Database, helpers } from "@tableland/sdk";
import { studioAliases, getBaseUrl } from "@tableland/studio-client";
import { init } from "@tableland/sqlparser";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { CodeEditor } from "./code-editor";
import { DataTable } from "./data-table";
import { cn, objectToTableData } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

init().catch((err: any) => {
  console.log("could not init sqlparser:", err);
  throw err;
});

interface Tab {
  tabId: number;
  name: string;
  query: string;
  columns?: any[];
  results: any[];
  messages: string[];
  error: any;
  queryType: string;
  committing: boolean;
}

async function getDatabase(options) {
  const { useAliases, environmentId, tables } = options;

  if (useAliases) {
    const aliases = studioAliases({
      environmentId,
      apiUrl: getBaseUrl(),
    });
    const aliasMap = await aliases.read();

    const uuTableName = aliasMap[tables[0]];
    if (!uuTableName) throw new Error("invalid table name");

    const chainId = parseInt(uuTableName.split("_").reverse()[1], 10);
    const baseUrl = helpers.getBaseUrl(chainId);
    return new Database({ baseUrl, aliases, autoWait: true });
  }

  const tableNameParts = tables[0].split("_");
  if (tableNameParts.length < 3) {
    throw new Error("must provide global table name or switch to use aliases");
  }
  const chainId = parseInt(tableNameParts.reverse()[1], 10);
  const baseUrl = helpers.getBaseUrl(chainId);
  return new Database({ baseUrl, autoWait: true });
}

export function Console({ environmentId }: { environmentId: string }) {
  const [loading, setLoading] = React.useState(false);
  const [tabs, setTabs] = React.useState<Tab[]>([]);
  const [currentTab, setCurrentTab] = React.useState<number | undefined>();
  // TODO: We will have to import more of the css for the old console to enable line numbers
  const [hideLineNumbers] = React.useState(true);
  const [useAliases, setUseAliases] = React.useState(true);

  const runQuery = async function ({
    tabId,
    query: queryText,
  }: {
    tabId: number;
    query: string;
  }) {
    if (loading) return;
    setLoading(true);

    try {
      const { statements, tables } = await sqlparser.normalize(queryText);
      if (statements.length > 1) {
        throw new Error("you may only run one statement at a time");
      }
      if (statements.length < 1) {
        throw new Error("you must provide a query statement");
      }

      const statement = statements[0];
      const db = await getDatabase({ useAliases, environmentId, tables });
      const data = await db.prepare(statement).all();

      const columns = data
        ? data.results.length
          ? Object.keys(data.results[0] as object).map((col) => ({
              accessorKey: col,
              header: col,
            }))
          : []
        : undefined;

      setTabs(
        tabs.map((tab: Tab) => {
          if (tab.tabId !== tabId) return tab;

          tab.error = null;
          tab.messages = [];
          tab.columns = columns;
          tab.results = objectToTableData(data.results);

          // if there is a transactionHash it means that this is the response from a mutation
          // the template rendering logic will key off the existence of messages
          if (
            !columns?.length &&
            data.success &&
            data.meta.txn?.transactionHash
          ) {
            tab.messages = [
              `success: ${data.success?.toString()}`,
              `duration: ${data.meta.duration}`,
              `tableIds: ${data.meta.txn?.tableIds.join(", ") ?? ""}`,
              `transactionHash: ${data.meta.txn.transactionHash}`,
              `blockNumber: ${data.meta.txn?.blockNumber ?? ""}`,
              `chainId: ${data.meta.txn?.chainId ?? ""}`,
              `universalTableNames": ${data.meta.txn?.names.join(", ") ?? ""}`,
              `definitionNames: ${data.meta.txn?.prefixes.join(", ") ?? ""}`,
            ];
          }

          return tab;
        }),
      );

      setLoading(false);
    } catch (err: any) {
      setTabs(
        tabs.map((tab) => {
          if (tab.tabId !== tabId) return tab;

          tab.error = err;
          return tab;
        }),
      );

      setLoading(false);
    }
  };

  const getNewTab = function () {
    const largestDefaultNum = tabs.reduce(function (max, tab) {
      if (tab.name?.trim().match(/Tab [0-9]+$/)) {
        const num = parseInt(tab.name?.trim().slice(4), 10);
        if (num > max) return num;
      }

      return max;
    }, 0);

    // TODO: this is the only way I can find to get an incrementing default tab
    //   name with a number that lives across re-renders.
    // eslint-disable-next-line
    const name = "Tab " + (largestDefaultNum + 1);
    const tab = {
      // eslint-disable-next-line
      tabId: tabs.length === 0 ? 1 : tabs[tabs.length - 1].tabId + 1,
      name,
      query: "",
      columns: [],
      results: [],
      messages: [],
      error: null,
      queryType: "",
      committing: false,
    };

    return tab;
  };

  const newQueryTab = function () {
    const tab = getNewTab();
    setTabs(tabs.concat([tab]));

    return tab;
  };

  const openQueryTab = function (id?: number | string) {
    if (id) return setCurrentTab(parseInt(id?.toString() || "0", 10));

    const tab = newQueryTab();
    setCurrentTab(tab.tabId);
  };

  const closeQueryTab = function (id?: number | string) {
    const tabId = parseInt(id?.toString() ?? "0", 10);
    const isCurrent = currentTab === tabId;

    setTabs(tabs.filter((t) => t.tabId !== tabId));
    if (isCurrent) setCurrentTab(tabs[0].tabId);
  };

  React.useEffect(() => {
    const firstTab = getNewTab();
    setTabs([firstTab]);
    setCurrentTab(firstTab.tabId);
    // eslint-disable-next-line
  }, []);

  return (
    <div className="flex-1 space-y-4">
      <div className={cn("tabs-pane", loading ? "text-muted" : "")}>
        <div className="flex">
          <ul className="flex">
            {tabs.map((tab, key) => {
              return (
                <TabLabel
                  key={tab.tabId}
                  tab={tab}
                  currentTab={currentTab ?? 0}
                  loading={loading}
                  openTab={() => openQueryTab(tab.tabId)}
                  closeTab={() => closeQueryTab(tab.tabId)}
                />
              );
            })}
            <li
              className="cursor-pointer rounded-tr-md border hover:bg-accent"
              onClick={() => openQueryTab()}
            >
              <i className="px-2">+</i>
            </li>
          </ul>
          <span className="flex">
            <Switch
              className="ml-2 mt-1"
              checked={useAliases}
              onCheckedChange={() => setUseAliases(!useAliases)}
            />
            <Label className="ml-2 mt-2">Use Definition Aliases</Label>
          </span>
        </div>
        {tabs.map((tab, key) => {
          const className = currentTab === tab.tabId ? "open" : "hidden";
          return (
            <div key={tab.tabId} className={`${className} single-tab-pane`}>
              <QueryPane
                tabId={tab.tabId}
                query={tab.query}
                runQuery={runQuery}
                hideLineNumbers={hideLineNumbers}
                loading={loading}
              />

              <ResultSetPane tab={tab} loading={loading} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function QueryPane(props: any): React.JSX.Element {
  const {
    tabId,
    query: initialQuery,
    runQuery,
    loading,
    hideLineNumbers,
  } = props;

  const [query, setQuery] = React.useState(initialQuery);
  const updateQuery = function (payload: any) {
    setQuery(payload.query);
  };

  const sendQuery = function (event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    runQuery({ tabId, query });
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

function TabLabel(props: {
  tab: any;
  currentTab: number;
  loading: boolean;
  closeTab: () => void;
  openTab: () => void;
}): React.JSX.Element {
  const { currentTab, tab, openTab, closeTab, loading } = props;

  function closeThisTab(e: any): void {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;
    closeTab();
  }

  function openThisTab(e: any): void {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;
    openTab();
  }

  return (
    <li
      onClick={(eve) => openThisTab(eve)}
      className={cn(
        "flex border first:rounded-tl-md",
        tab.tabId === currentTab ? "bg-accent" : "bg-card",
      )}
    >
      <i className="fa-solid fa-terminal"></i>
      <span
        className={cn(
          "min-w-20 px-2",
          loading ? "cursor-wait" : "cursor-pointer",
        )}
      >
        {tab.name}
      </span>
      <span
        className={cn("pr-2", loading ? "cursor-wait" : "cursor-pointer")}
        onClick={(eve) => closeThisTab(eve)}
      >
        <i className="fa-solid fa-circle-xmark">x</i>
      </span>
    </li>
  );
}

function ResultSetPane(props: any): React.JSX.Element {
  const { tab } = props;

  const table = useReactTable({
    data: tab.results,
    columns: tab.columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="table-results">
      {tab.error && (
        <div className="error mt-4 rounded-md border p-4">
          Error<br></br>
          {tab.error.message}
        </div>
      )}
      {!!tab.messages?.length && (
        <div className="mt-4 rounded-md border p-4">
          {tab.messages.map((message: string, i: number) => {
            return <p key={i}>{message}</p>;
          })}
        </div>
      )}
      {!tab.error && !tab.messages?.length && <DataTable table={table} />}
    </div>
  );
}
