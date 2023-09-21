"use client";

import { authenticated, logout } from "@/app/actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authAtom } from "@/store/wallet";
import { Auth } from "@tableland/studio-api";
import { useAtom } from "jotai";
import { LogOut, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAccount, useConnect } from "wagmi";
import AddressDisplay from "./address-display";
import RegistrationDialog from "./registration-dialog";
import SignInButton from "./sign-in-button";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";

export default function Profile() {
  const { isConnected, address } = useAccount();
  const {
    connect,
    connectors,
    error: walletConnectorError,
    isLoading,
    reset,
  } = useConnect();
  const [auth, setAuth] = useAtom(authAtom);
  const [signInError, setSignInError] = useState<Error | undefined>(undefined);
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  // Fetch user when:
  useEffect(() => {
    const handler = async () => {
      try {
        const auth = await authenticated();
        setAuth(auth);
      } catch (_error) {}
    };
    // 1. page loads
    handler();

    // 2. window is focused (in case user logs out of another window)
    window.addEventListener("focus", handler);
    return () => window.removeEventListener("focus", handler);
  }, [setAuth]);

  useEffect(() => {
    if (walletConnectorError) {
      toast({
        title: "Error connecting wallet",
        description: walletConnectorError.message,
        variant: "destructive",
      });
      reset();
    }
  }, [walletConnectorError, toast, reset]);

  useEffect(() => {
    if (signInError) {
      toast({
        title: "Error signing in",
        description: signInError.message,
        variant: "destructive",
      });
      setSignInError(undefined);
    }
  }, [signInError, toast]);

  const onSignInSuccess = ({ auth }: { auth: Auth | undefined }) => {
    if (auth) {
      setAuth(auth);
      router.push(`/${auth.personalTeam.slug}`);
    } else {
      setShowRegisterDialog(true);
    }
  };

  const onSignInError = ({ error }: { error: Error }) => {
    setSignInError(error);
  };

  const onRegisterSuccess = (auth: Auth) => {
    setAuth(auth);
    setShowRegisterDialog(false);
    router.push(`/${auth.personalTeam.slug}`);
  };

  const onRegisterCancel = () => {
    setShowRegisterDialog(false);
  };

  const onSignOut = async () => {
    router.push("/");
    await logout();
    setAuth(undefined);
  };

  return (
    <div className="flex flex-row gap-2">
      {isConnected && (
        <>
          {/* Wallet content goes here */}
          {address && <AddressDisplay address={address} copy />}
          {auth ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={`https://avatar.vercel.sh/${auth.personalTeam.slug}.png`}
                      alt={auth.personalTeam.name}
                    />
                    <AvatarFallback>
                      {auth.personalTeam.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {auth.personalTeam.name}
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
                <DropdownMenuItem onClick={onSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                  {/* <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut> */}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <SignInButton onSuccess={onSignInSuccess} onError={onSignInError} />
          )}
        </>
      )}
      {!isConnected && (
        <Button
          onClick={() => connect({ connector: connectors[0] })}
          disabled={isLoading}
        >
          Connect Wallet
        </Button>
      )}
      <RegistrationDialog
        showDialog={showRegisterDialog}
        onOpenChange={setShowRegisterDialog}
        onSuccess={onRegisterSuccess}
        onCancel={onRegisterCancel}
      />
    </div>
  );
}
