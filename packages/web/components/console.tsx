"use client";

import { v4 as uuidv4 } from "uuid";
import * as React from "react";
import {
  Database,
  Validator,
  type Schema,
  helpers,
  type Result,
} from "@tableland/sdk";
import { CodeEditor } from "./code-editor";
import { cn } from "@/lib/utils";
import { Table } from "./ui/table";

export function Console({}: Props) {
  const runQuery = async function (queryText) {
    const chain = chainsMap.get(chainId);
    const blockExplorer = blockExplorers.get(chainId);
    const openSeaLink = openSeaLinks.get(chainId);

    const baseUrl = helpers.getBaseUrl(chainId);
    const db = new Database({ baseUrl });
    const data = await db.prepare(`SELECT * FROM ${tableName};`).all();

    const formattedData = data ? objectToTableData(data.results) : undefined;
  };

  let tabCount = 0;
  const getNewTab = function () {
    tabCount += 1;

    const tab = {
      tabId: tabCount,
      name: "Tab " + tabCount,
      query: "",
      columns: [],
      rows: [],
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

  const [tabs, setTabs] = React.useState([getNewTab()]);
  const [currentTab, setCurrentTab] = React.useState(tabs[0].tabId);

  const openQueryTab = function (id?: number | string) {
    console.log("openQueryTab", id);
    if (id) return setCurrentTab(parseInt(id, 10));

    const tab = newQueryTab();
    setCurrentTab(tab.tabId);
  };

  const closeQueryTab = function (id?: number | string) {
    const tabId = parseInt(id, 10);
    const isCurrent = currentTab === tabId;

    setTabs(tabs.filter((t) => t.tabId !== tabId));
    if (isCurrent) setCurrentTab(tabs[0].tabId);
  };

  return (
    <div className="flex-1 space-y-4">
      <div className="tabs-pane">
        <div>
          <ul className="flex">
            {tabs.map((tab, key) => {
              return (
                <TabLabel
                  key={tab.tabId}
                  tab={tab}
                  currentTab={currentTab}
                  openTab={() => openQueryTab(tab.tabId)}
                  closeTab={() => closeQueryTab(tab.tabId)}
                />
              );
            })}
            <li
              className="cursor-pointer border hover:bg-accent"
              onClick={() => openQueryTab()}
            >
              <i className="px-2">+</i>
            </li>
          </ul>
        </div>
        {tabs.map((tab, key) => {
          const className = currentTab === tab.tabId ? "open" : "hidden";
          return (
            <div key={tab.tabId} className={`${className} single-tab-pane`}>
              <QueryPane tabId={tab.tabId} query={tab.query} />

              <ResultSetPane tabId={tab.tabId} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function QueryPane(props: any): React.JSX.Element {
  const { tab, query: initialQuery, queryType } = props;

  const [query, setQuery] = React.useState(initialQuery);
  const updateQuery = function (payload) {
    setQuery(payload.query);
  };

  const sendQuery = function (event): void {
    event.preventDefault();
    runQuery({ tabId: tab.tabId, query });
  };

  return (
    <div className="executer">
      <div className="border bg-card">
        <CodeEditor
          hideLineNumbers={true}
          onChange={(code: any) => {
            updateQuery({ query: code });
          }}
          code={query}
        />
      </div>
      <Loading show={props.loading} />
      <ul className="action-icons-bar">
        <li>
          <button
            disabled={props.loading}
            className="my-4 mr-4 inline-flex h-8 items-center justify-center rounded-md border border-input bg-transparent px-3 text-xs font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            onClick={sendQuery}
          >
            Run Query
          </button>

          <button
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
          </button>
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
  closeTab: () => void;
  openTab: () => void;
}): React.JSX.Element {
  const { currentTab, tab, openTab, closeTab } = props;

  function closeThisTab(e: any): void {
    console.log("closeThisTab");
    e.preventDefault();
    e.stopPropagation();
    closeTab();
  }

  console.log("TabLabel", tab, currentTab);
  return (
    <li onClick={() => openTab()} className="flex border">
      <i className="fa-solid fa-terminal"></i>
      <span
        className={cn(
          "min-w-20 cursor-pointer px-2",
          tab.tabId === currentTab ? "bg-card" : "bg-accent",
        )}
      >
        {tab.name}
      </span>
      {/*<input
        className="bg-accent"
        type="name"
        style={{
          pointerEvents: tab.tabId !== currentTab ? "none" : "initial",
        }}
        value={tab.name}
        onChange={(e) => {
          renameTab({ tab: tab.tabId, name: e.target.value });
        }}
      />*/}
      <span className="pr-2" onClick={() => closeThisTab()}>
        <i className="fa-solid fa-circle-xmark">x</i>
      </span>
    </li>
  );
}

function ResultSetPane(props: any): React.JSX.Element {
  const { tabId, error, status, message } = props;

  return (
    <div className="table-results">
      {error && (
        <div className="error">
          Error<br></br>
          {error}
        </div>
      )}
      {message && <div className="message">{message}</div>}
      {status === "loading" ? <Loading /> : <Table tabid={tabId} />}
    </div>
  );
}
