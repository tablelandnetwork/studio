"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { type schema } from "@tableland/studio-store";
import { Plus, X } from "lucide-react";
import { type Result } from "@tableland/sdk";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import HashDisplay from "./hash-display";
import { Console } from "./console";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

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
  environmentId,
  defs,
}: {
  environmentId: string;
  defs: schema.Def[];
}) {
  const [tabs, setTabs] = useState<Tab[]>([]);
  useEffect(() => {
    setTabs([
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
  }, []);
  const [addressPostMount, setAddressPostMount] = useState<
    `0x${string}` | undefined
  >();
  const { address } = useAccount();

  useEffect(() => {
    setAddressPostMount(address);
  }, [address]);

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
      console.log("click to renamezz");
      editTabName(tab);
    }
  };

  return (
    <Tabs
      // defaultValue={tabs[0].id}
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
        {addressPostMount && (
          <div className="ml-auto flex items-center gap-x-4 text-sm text-foreground">
            <span>
              Connected as{" "}
              <div className="inline-block">
                <HashDisplay
                  hash={addressPostMount}
                  copy
                  className="text-foreground"
                />
              </div>
            </span>
            {/* <div className="flex items-center gap-x-2">
            {authorizedStudioUser && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <User className="size-4 shrink-0 stroke-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    Studio user {authorizedStudioUser.team.name}
                    {authorizedStudioUser.user.teamId === auth?.user.teamId
                      ? " (you)"
                      : ""}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {auth && auth.user.address !== addressPostMount && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <AlertTriangle className="size-4 shrink-0 stroke-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    This address is different than the one associated with
                    your Studio account.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {owner === addressPostMount && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Crown className="size-4 shrink-0 stroke-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>Table owner</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {accountPermissions && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <KeyRound className="size-4 shrink-0 stroke-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    Permissions:
                    <ul className="list-disc px-3">
                      {accountPermissions.privileges.insert && (
                        <li>Insert</li>
                      )}
                      {accountPermissions.privileges.update && (
                        <li>Update</li>
                      )}
                      {accountPermissions.privileges.delete && (
                        <li>Delete</li>
                      )}
                    </ul>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div> */}
          </div>
        )}
      </div>
      {tabs.map((tab) => (
        <TabsContent key={tab.id} value={tab.id} className="flex-1">
          <Console
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
