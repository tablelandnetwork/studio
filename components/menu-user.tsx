"use client";

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
import {
  accountAtom,
  providerAtom,
  scwAddressAtom,
  smartAccountAtom,
  socialLoginSDKAtom,
} from "@/store/wallet";
import { useAtomValue, useSetAtom } from "jotai";
import { LogOut, Settings } from "lucide-react";
import { useRouter } from "next/navigation";

export function MenuUser({ personalTeam }: { personalTeam: Team }) {
  const router = useRouter();

  const socialLoginSDK = useAtomValue(socialLoginSDKAtom);
  const setAccount = useSetAtom(accountAtom);
  const setProvider = useSetAtom(providerAtom);
  const setScwAddress = useSetAtom(scwAddressAtom);
  const setSmartAccount = useSetAtom(smartAccountAtom);

  const disconnectWeb3 = async () => {
    if (!socialLoginSDK || !socialLoginSDK.web3auth) {
      console.error("Web3Modal not initialized.");
      return;
    }
    await socialLoginSDK.logout();
    socialLoginSDK.hideWallet();
    setProvider(null);
    setAccount(null);
    setSmartAccount(null);
    setScwAddress(null);
  };

  const handleSignOut = async () => {
    await disconnectWeb3();
    router.push("/");
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
        <DropdownMenuGroup>
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
