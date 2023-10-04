"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logoutAtom } from "@/store/social-login";
import { schema } from "@tableland/studio-store";
import { useSetAtom } from "jotai";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

export default function MenuUser({
  personalTeam,
}: {
  personalTeam: schema.Team;
}) {
  const router = useRouter();

  const logout = useSetAtom(logoutAtom);

  // TODO: Use isPending.
  const [isPending, startTransition] = useTransition();

  const handleSignOut = async () => {
    startTransition(async () => {
      await logout();
      router.push("/");
      router.refresh();
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={`https://avatar.vercel.sh/${personalTeam.slug}.png`}
              alt={personalTeam.name}
            />
            <AvatarFallback>{personalTeam.name.charAt(0)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {personalTeam.name}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {/* <DropdownMenuGroup> */}
        {/* <DropdownMenuItem> */}
        {/* <Settings className="mr-2 h-4 w-4" /> */}
        {/* <span>Settings</span> */}
        {/* <DropdownMenuShortcut>⌘S</DropdownMenuShortcut> */}
        {/* </DropdownMenuItem> */}
        {/* </DropdownMenuGroup> */}
        {/* <DropdownMenuSeparator /> */}
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
          {/* <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut> */}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
