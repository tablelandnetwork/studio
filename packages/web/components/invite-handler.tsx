"use client";

import { acceptInvite, ignoreInvite } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { authAtom } from "@/store/wallet";
import { schema } from "@tableland/studio-store";
import { useAtomValue } from "jotai";
import { Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

const Profile = dynamic(
  () => import("@/components/profile").then((res) => res.default),
  { ssr: false },
);

export default function InviteHandler({
  seal,
  targetTeam,
}: {
  seal: string;
  targetTeam: schema.Team;
}) {
  const auth = useAtomValue(authAtom);
  const router = useRouter();
  const [pendingAccept, startAccept] = useTransition();
  const [pendingIgnore, startIgnore] = useTransition();

  const handleAccept = () => {
    startAccept(async () => {
      await acceptInvite(seal);
      router.push(`/${targetTeam.slug}`);
      router.refresh();
    });
  };

  const handleIgnore = () => {
    startIgnore(async () => {
      await ignoreInvite(seal);
      router.push("/");
    });
  };

  // TODO: Display errors.
  return (
    <div className="flex flex-1 items-center justify-center space-x-3">
      {/* {accpectInvite.isError && (
        <p>Error accepting invite: {accpectInvite.error.message}</p>
      )}
      {ignoreInvite.isError && (
        <p>Error ignoring invite: {ignoreInvite.error.message}</p>
      )} */}
      <Button
        variant={"outline"}
        onClick={handleIgnore}
        disabled={pendingIgnore || pendingAccept}
      >
        {pendingIgnore && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
        Ignore
      </Button>
      {!auth && <Profile hideAddress dontRedirect />}
      {auth && (
        <Button
          onClick={handleAccept}
          disabled={pendingAccept || pendingIgnore}
        >
          {pendingAccept && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
          Accept
        </Button>
      )}
    </div>
  );
}
