"use client";

import { type Auth } from "@tableland/studio-api";
import { useAtom } from "jotai";
import { LogOut, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAccount, useConnect } from "wagmi";
import HashDisplay from "./hash-display";
import RegistrationDialog from "./registration-dialog";
import SignInButton from "./sign-in-button";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";
import { api } from "@/trpc/react";
import { authAtom } from "@/store/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Profile({
  hideAddress = false,
  dontRedirect = false,
}: {
  hideAddress?: boolean;
  dontRedirect?: boolean;
}) {
  const [auth, setAuth] = useAtom(authAtom);
  const { isConnected, address } = useAccount();
  const {
    connect,
    connectors,
    error: walletConnectorError,
    isLoading,
    reset,
  } = useConnect();
  const authenticated = api.auth.authenticated.useQuery();
  const logout = api.auth.logout.useMutation({
    onSuccess: () => {
      setAuth(undefined);
      router.push("/");
      router.refresh();
    },
  });
  const [signInError, setSignInError] = useState<Error | undefined>(undefined);
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const { theme, setTheme } = useTheme();

  // Fetch user when:
  useEffect(() => {
    const handler = () => {
      authenticated
        .refetch()
        .then(() => console.log("authenticated.refetch success"))
        .catch((err) => console.error(err));
    };
    // 1. window is focused (in case user logs out of another window)
    window.addEventListener("focus", handler);
    return () => window.removeEventListener("focus", handler);
  }, [authenticated]);

  useEffect(() => {
    // in order to keep types correct we need to use logical operator
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    setAuth(authenticated.data || undefined);
  }, [authenticated.data, setAuth]);

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
      router.refresh();
      setAuth(auth);
      if (!dontRedirect) {
        router.push(`/${auth.personalTeam.slug}`);
      }
    } else {
      setShowRegisterDialog(true);
    }
  };

  const onSignInError = ({ error }: { error: Error }) => {
    setSignInError(error);
  };

  const onRegisterSuccess = (auth: Auth) => {
    router.refresh();
    setAuth(auth);
    setShowRegisterDialog(false);
    if (!dontRedirect) {
      router.push(`/${auth.personalTeam.slug}`);
    }
  };

  const onRegisterCancel = () => {
    setShowRegisterDialog(false);
  };

  return (
    <div className="flex flex-row gap-2">
      {isConnected && (
        <>
          {/* Wallet content goes here */}
          {address && !hideAddress && <HashDisplay hash={address} copy />}
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
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <Sun className="mr-2 h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                      <Moon className="absolute mr-2 h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                      Theme
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent>
                        <DropdownMenuRadioGroup
                          value={theme}
                          onValueChange={setTheme}
                        >
                          <DropdownMenuRadioItem value="light">
                            Light
                          </DropdownMenuRadioItem>
                          <DropdownMenuRadioItem value="dark">
                            Dark
                          </DropdownMenuRadioItem>
                          <DropdownMenuRadioItem value="system">
                            System
                          </DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logout.mutate()}>
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
