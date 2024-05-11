"use client";

import {
  Folders,
  LayoutDashboard,
  Settings,
  User,
  User2,
  Users,
} from "lucide-react";
import Link from "next/link";
import {
  useParams,
  useRouter,
  useSelectedLayoutSegment,
} from "next/navigation";
import { skipToken } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  const { team: teamSlug } = useParams<{
    team: string;
  }>();
  const router = useRouter();
  const selectedLayoutSegment = useSelectedLayoutSegment();

  const teamQuery = api.teams.teamBySlug.useQuery({ slug: teamSlug });

  const isAuthorizedQuery = api.teams.isAuthorized.useQuery(
    teamQuery.data ? { teamId: teamQuery.data.id } : skipToken,
  );

  if (!teamQuery.data) {
    return null;
  }

  return (
    <div className={cn("space-y-6 p-3", className)}>
      <div className="flex flex-col space-y-1">
        <Link href={`/${teamQuery.data.slug}`}>
          <Button
            variant={!selectedLayoutSegment ? "secondary" : "ghost"}
            className="w-full justify-start gap-x-2 pl-1"
          >
            <Folders />
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
              <Users />
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
              <Settings />
              Settings
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
