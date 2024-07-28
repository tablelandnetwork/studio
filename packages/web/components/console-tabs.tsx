"use client";

import { type schema } from "@tableland/studio-store";
import { Plus, X } from "lucide-react";
import { type Result } from "@tableland/sdk";
import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { type Auth } from "@tableland/studio-api";
import { useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Console } from "./console";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import WalletStatus from "./wallet-status";
import { useAccount } from "@/lib/use-account";

interface Tab {
  id: string;
  name: string;
  selected: boolean;
  query: string;
  result?: Result<Record<string, unknown>>;
  editingName: boolean;
  newName: string;
}

export default function ConsoleTabs({
  auth,
  environmentId,
  defs,
}: {
  auth?: Auth;
  environmentId: string;
  defs: schema.Def[];
}) {
  const address = useAccount();

  const tabsAtom = useRef(
    atomWithStorage<Tab[]>(
      `env_tabs_${environmentId}`,
      [
        {
          id: window.self.crypto.randomUUID(),
          name: "New Query",
          selected: true,
          query: "",
          result: undefined,
          editingName: false,
          newName: "",
        },
      ],
      undefined,
      {
        getOnInit: true,
      },
    ),
  );
  const [tabs, setTabs] = useAtom(tabsAtom.current);

  const addTab = () => {
    setTabs((tabs) => [
      ...tabs.map((tab) => ({ ...tab, selected: false })),
      {
        id: window.self.crypto.randomUUID(),
        name: "New Query",
        selected: true,
        query: "",
        result: undefined,
        editingName: false,
        newName: "",
      },
    ]);
  };

  const removeTab = (tab: Tab, index: number) => {
    if (!tab.selected) {
      setTabs((tabs) => tabs.filter((t) => t.id !== tab.id));
    } else {
      setTabs((tabs) => {
        const newSelectedIndex =
          index === tabs.length - 1 ? index - 1 : index + 1;
        return tabs
          .map((t, index) =>
            index === newSelectedIndex
              ? { ...t, selected: true }
              : { ...t, selected: false },
          )
          .filter((t) => t.id !== tab.id);
      });
    }
  };

  const editTabName = (tab: Tab) => {
    setTabs((tabs) =>
      tabs.map((t) =>
        t.id === tab.id ? { ...t, editingName: true, newName: t.name } : t,
      ),
    );
  };

  const updateEditedTabName = (tab: Tab, newName: string) => {
    setTabs((tabs) =>
      tabs.map((t) => (t.id === tab.id ? { ...t, newName } : t)),
    );
  };

  const revertEditedTabName = (tab: Tab) => {
    setTabs((tabs) =>
      tabs.map((t) =>
        t.id === tab.id ? { ...t, newName: "", editingName: false } : t,
      ),
    );
  };

  const commitEditedTabName = (tab: Tab) => {
    setTabs((tabs) =>
      tabs.map((t) =>
        t.id === tab.id
          ? {
              ...t,
              editingName: false,
              name: t.newName.length ? t.newName : t.name,
              newName: "",
            }
          : t,
      ),
    );
  };

  const setQuery = (tab: Tab, query: string) => {
    setTabs((tabs) => tabs.map((t) => (t.id === tab.id ? { ...t, query } : t)));
  };

  const setRes = (
    tab: Tab,
    result: Result<Record<string, unknown>> | undefined,
  ) => {
    setTabs((tabs) =>
      tabs.map((t) => (t.id === tab.id ? { ...t, result } : t)),
    );
  };

  const selectedTab = tabs.find((tab) => tab.selected)?.id;
  const setSelectedTab = (tabId: string) => {
    setTabs((tabs) =>
      tabs.map((tab) =>
        tab.id === tabId
          ? { ...tab, selected: true }
          : { ...tab, selected: false },
      ),
    );
  };

  const handleTabClick = (tab: Tab) => {
    if (tab.selected) {
      editTabName(tab);
    }
  };

  return (
    <Tabs
      className="flex min-h-full w-full min-w-0 flex-col justify-stretch"
      value={selectedTab}
      onValueChange={setSelectedTab}
    >
      <div className="flex items-end">
        <TabsList>
          {tabs.map((tab, index) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="flex items-center gap-x-2"
              onPointerDown={() => handleTabClick(tab)}
            >
              {tab.editingName ? (
                <Input
                  key={tab.id}
                  value={tab.newName}
                  className="h-5"
                  size={tab.name.length}
                  onChange={(e) => updateEditedTabName(tab, e.target.value)}
                  onBlur={() => commitEditedTabName(tab)}
                  onKeyUp={(e) => {
                    if (e.key === "Enter") {
                      commitEditedTabName(tab);
                    } else if (e.key === "Escape") {
                      revertEditedTabName(tab);
                    }
                  }}
                />
              ) : (
                <>
                  {tab.name}
                  {tabs.length > 1 && (
                    <X
                      className="size-3 text-muted-foreground hover:text-foreground"
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        removeTab(tab, index);
                      }}
                    />
                  )}
                </>
              )}
            </TabsTrigger>
          ))}
          <Button
            size="icon"
            variant="ghost"
            className="ml-1"
            title="New query tab"
            onClick={addTab}
          >
            <Plus />
          </Button>
        </TabsList>
        <WalletStatus auth={auth} address={address} />
      </div>
      {tabs.map((tab) => (
        <TabsContent key={tab.id} value={tab.id} className="flex-1">
          <Console
            key={tab.id}
            environmentId={environmentId}
            defs={defs}
            query={tab.query}
            setQuery={(q) => setQuery(tab, q)}
            res={tab.result}
            setRes={(r) => setRes(tab, r)}
          />
        </TabsContent>
      ))}
    </Tabs>
  );
}
