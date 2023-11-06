import { api } from "@/trpc/react";
import { Auth } from "@tableland/studio-api";
import { useEffect, useTransition } from "react";
import { SiweMessage } from "siwe";
import { useAccount, useNetwork, useSignMessage } from "wagmi";
import { Button } from "./ui/button";

export default function SignInButton({
  onSuccess,
  onError,
}: {
  onSuccess: (args: { auth: Auth | undefined }) => void;
  onError: (args: { error: Error }) => void;
}) {
  const [pending, startTransition] = useTransition();

  const { address } = useAccount();
  const { chain } = useNetwork();
  const { signMessageAsync } = useSignMessage();

  const nonce = api.auth.nonce.useMutation({
    onError: (error) => {
      onError({ error: new Error(error.message) });
    },
  });
  const login = api.auth.login.useMutation({
    onSuccess: (res) => {
      onSuccess({ auth: res });
    },
    onError: (error) => {
      onError({ error: new Error(error.message) });
    },
  });

  // Pre-fetch random nonce when button is rendered
  // to ensure deep linking works for WalletConnect
  // users on iOS when signing the SIWE message
  useEffect(() => {
    nonce.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSignIn = async () => {
    startTransition(async () => {
      try {
        const chainId = chain?.id;
        if (!address || !chainId) return;

        // Create SIWE message with pre-fetched nonce and sign with wallet
        const rawMessage = new SiweMessage({
          domain: window.location.host,
          address,
          statement:
            "Sign in to Studio with your wallet address. This only requires a signature, no transaction will be sent.",
          uri: window.location.origin,
          version: "1",
          chainId,
          nonce: nonce.data,
        });
        const message = rawMessage.prepareMessage();
        const signature = await signMessageAsync({ message });

        // Verify signature
        login.mutate({ message, signature });
      } catch (error) {
        onError({ error: error as Error });
        nonce.mutate();
      }
    });
  };

  return (
    <Button onClick={handleSignIn} disabled={!nonce.data || pending}>
      Sign In
    </Button>
  );
}
