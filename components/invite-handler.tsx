"use client";

import { acceptInvite, ignoreInvite } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Team } from "@/db/schema";
import { authAtom } from "@/store/wallet";
import { useAtomValue } from "jotai";
import { Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

const UserActions = dynamic(
  () => import("@/components/user-actions").then((res) => res.default),
  { ssr: false }
);

export default function InviteHandler({
  seal,
  targetTeam,
}: {
  seal: string;
  targetTeam: Team;
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
      {!auth && <UserActions />}
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
