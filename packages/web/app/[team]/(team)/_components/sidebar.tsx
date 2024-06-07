"use client";

import { Folders, Settings, Users } from "lucide-react";
import Link from "next/link";
import { useParams, useSelectedLayoutSegment } from "next/navigation";
import { skipToken } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { SidebarContainer, SidebarSection } from "@/components/sidebar";

export function Sidebar() {
  const { team: teamSlug } = useParams<{
    team: string;
  }>();
  const selectedLayoutSegment = useSelectedLayoutSegment();

  const teamQuery = api.teams.teamBySlug.useQuery({ slug: teamSlug });

  const isAuthorizedQuery = api.teams.isAuthorized.useQuery(
    teamQuery.data ? { teamId: teamQuery.data.id } : skipToken,
  );

  if (!teamQuery.data) {
    return null;
  }

  return (
    <SidebarContainer className="p-3">
      <SidebarSection>
        <Link href={`/${teamQuery.data.slug}`}>
          <Button
            variant={!selectedLayoutSegment ? "secondary" : "ghost"}
            className="w-full justify-start gap-x-2 pl-1"
          >
            <Folders className="size-5" />
            Projects
          </Button>
        </Link>
        {!teamQuery.data.personal && (
          <Link href={`/${teamQuery.data.slug}/people`}>
            <Button
              variant={
                selectedLayoutSegment === "people" ? "secondary" : "ghost"
              }
              className="w-full justify-start gap-x-2 pl-1"
            >
              <Users className="size-5" />
              People
            </Button>
          </Link>
        )}
        {isAuthorizedQuery.data && (
          <Link href={`/${teamQuery.data.slug}/settings`}>
            <Button
              variant={
                selectedLayoutSegment === "settings" ? "secondary" : "ghost"
              }
              className="w-full justify-start gap-x-2 pl-1"
            >
              <Settings className="size-5" />
              Settings
            </Button>
          </Link>
        )}
      </SidebarSection>
    </SidebarContainer>
  );
}
