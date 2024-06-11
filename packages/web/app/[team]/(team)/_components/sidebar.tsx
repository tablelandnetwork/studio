"use client";

import { Folders, Settings, Users } from "lucide-react";
import { useParams, useSelectedLayoutSegment } from "next/navigation";
import { skipToken } from "@tanstack/react-query";
import { api } from "@/trpc/react";
import { SidebarContainer, SidebarSection } from "@/components/sidebar";
import SidebarLink from "@/components/sidebar-link";

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
    <SidebarContainer>
      <SidebarSection>
        <SidebarLink
          href={`/${teamQuery.data.slug}`}
          title="Projects"
          Icon={Folders}
          selected={!selectedLayoutSegment}
        />
        {!teamQuery.data.personal && (
          <SidebarLink
            href={`/${teamQuery.data.slug}/people`}
            title="People"
            Icon={Users}
            selected={selectedLayoutSegment === "people"}
          />
        )}
        {isAuthorizedQuery.data && (
          <SidebarLink
            href={`/${teamQuery.data.slug}/settings`}
            title="Settings"
            Icon={Settings}
            selected={selectedLayoutSegment === "settings"}
          />
        )}
      </SidebarSection>
    </SidebarContainer>
  );
}
