"use client";

import { authenticated } from "@/app/actions";
import { authAtom } from "@/store/wallet";
import { useAtomValue } from "jotai";
import { Button } from "../ui/button";

export default function UserId() {
  const auth = useAtomValue(authAtom);

  const checkLogin = async () => {
    const auth = await authenticated();
    console.log("auth:", auth);
  };
  return (
    <div>
      <p>User id (client): {auth?.user.teamId}</p>
      <Button onClick={checkLogin}>Check auth</Button>
    </div>
  );
}
