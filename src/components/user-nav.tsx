import { LogOut, Settings, User } from "lucide-react";
import { useAtom } from "jotai";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Team } from "@/db/schema";
import { logoutAtom } from "@/store/login";
import { useRouter } from "next/router";

export function UserNav({ personalTeam }: { personalTeam: Team }) {
  const [, logout] = useAtom(logoutAtom);
  const router = useRouter();

  const handleSignOut = async () => {
    await logout();
    router.push("/");
  };

  const inDash = router.pathname.includes("dashboard");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={`https://avatar.vercel.sh/${personalTeam.slug}.png`}
              alt={personalTeam.name || undefined}
            />
            <AvatarFallback>
              {personalTeam.name?.charAt(0) || ":)"}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {personalTeam.name || "Personal Team"}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {!inDash && (
            <DropdownMenuItem
              onClick={() => router.push(`/dashboard/${personalTeam.slug}`)}
            >
              <User className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
              {/* <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut> */}
            </DropdownMenuItem>
          )}
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
            {/* <DropdownMenuShortcut>⌘S</DropdownMenuShortcut> */}
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
          {/* <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut> */}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
