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
import {
  accountAtom,
  providerAtom,
  scwAddressAtom,
  smartAccountAtom,
  socialLoginSDKAtom,
} from "@/store/wallet";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { LogIn, Unplug } from "lucide-react";
import { useRouter } from "next/navigation";
import AddressDisplay from "./address-display";

export function MenuWallet() {
  const router = useRouter();

  const socialLoginSDK = useAtomValue(socialLoginSDKAtom);
  const [account, setAccount] = useAtom(accountAtom);
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

  const handleLogIn = async () => {};

  const handleDisconnect = async () => {
    await disconnectWeb3();
    router.push("/");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={`https://avatar.vercel.sh/${account}.png`}
              alt={`Avatar for address ${account}`}
            />
            <AvatarFallback>0x</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            {/* TODO: Handle null account */}
            <AddressDisplay address={account!} copy={true} />
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={handleLogIn}>
            <LogIn className="mr-2 h-4 w-4" />
            <span>Sign In to Studio</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleDisconnect}>
          <Unplug className="mr-2 h-4 w-4" />
          <span>Disconnect Wallet</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
