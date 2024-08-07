"use client";

import { type schema } from "@tableland/studio-store";
import { useAtomValue } from "jotai";
import { Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { authAtom } from "@/store/auth";
import { Button } from "@/components/ui/button";

const Profile = dynamic(
  async function () {
    return await import("@/components/profile");
  },
  { ssr: false },
);

export default function InviteHandler({
  seal,
  targetOrg,
}: {
  seal: string;
  targetOrg: schema.Org;
}) {
  const auth = useAtomValue(authAtom);
  const router = useRouter();

  const acceptInvite = api.invites.acceptInvite.useMutation({
    onSuccess: () => {
      router.push(`/${targetOrg.slug}`);
      router.refresh();
    },
  });

  const ignoreInvite = api.invites.ignoreInvite.useMutation({
    onSuccess: () => {
      router.push("/");
    },
  });

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
        onClick={() => ignoreInvite.mutate({ seal })}
        disabled={ignoreInvite.isPending || acceptInvite.isPending}
      >
        {ignoreInvite.isPending && (
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        )}
        Ignore
      </Button>
      {!auth && <Profile hideAddress dontRedirect />}
      {auth && (
        <Button
          onClick={() => acceptInvite.mutate({ seal })}
          disabled={acceptInvite.isPending || ignoreInvite.isPending}
        >
          {acceptInvite.isPending && (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          )}
          Accept
        </Button>
      )}
    </div>
  );
}
