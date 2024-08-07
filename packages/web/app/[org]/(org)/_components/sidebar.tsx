"use client";

import { Folders, Settings, Users } from "lucide-react";
import { useParams, useSelectedLayoutSegment } from "next/navigation";
import { skipToken } from "@tanstack/react-query";
import { api } from "@/trpc/react";
import { SidebarContainer, SidebarSection } from "@/components/sidebar";
import SidebarLink from "@/components/sidebar-link";

export function Sidebar() {
  const { org: orgSlug } = useParams<{
    org: string;
  }>();
  const selectedLayoutSegment = useSelectedLayoutSegment();

  const orgQuery = api.orgs.orgBySlug.useQuery({ slug: orgSlug });

  const isAuthorizedQuery = api.orgs.isAuthorized.useQuery(
    orgQuery.data ? { orgId: orgQuery.data.id } : skipToken,
  );

  if (!orgQuery.data) {
    return null;
  }

  return (
    <SidebarContainer>
      <SidebarSection>
        <SidebarLink
          href={`/${orgQuery.data.slug}`}
          title="Projects"
          icon={Folders}
          selected={!selectedLayoutSegment}
        />
        {!orgQuery.data.personal && (
          <SidebarLink
            href={`/${orgQuery.data.slug}/people`}
            title="People"
            icon={Users}
            selected={selectedLayoutSegment === "people"}
          />
        )}
        {isAuthorizedQuery.data && (
          <SidebarLink
            href={`/${orgQuery.data.slug}/settings`}
            title="Settings"
            icon={Settings}
            selected={selectedLayoutSegment === "settings"}
          />
        )}
      </SidebarSection>
    </SidebarContainer>
  );
}
