import { nonce as getNonce, login } from "@/app/actions";
import { Auth } from "@tableland/studio-api";
import { useEffect, useState, useTransition } from "react";
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
  const [nonce, setNonce] = useState<string | undefined>(undefined);

  const { address } = useAccount();
  const { chain } = useNetwork();
  const { signMessageAsync } = useSignMessage();

  const fetchNonce = async () => {
    try {
      const nonce = await getNonce();
      setNonce(nonce);
    } catch (error) {
      onError({ error: error as Error });
    }
  };

  // Pre-fetch random nonce when button is rendered
  // to ensure deep linking works for WalletConnect
  // users on iOS when signing the SIWE message
  useEffect(() => {
    fetchNonce();
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
          nonce,
        });
        const message = rawMessage.prepareMessage();
        const signature = await signMessageAsync({ message });

        // Verify signature
        const res = await login(message, signature);
        if (res.error) {
          throw new Error(res.error);
        }
        onSuccess({ auth: res.auth });
      } catch (error) {
        onError({ error: error as Error });
        fetchNonce();
      }
    });
  };

  return (
    <Button onClick={handleSignIn} disabled={!nonce || pending}>
      Sign In
    </Button>
  );
}
