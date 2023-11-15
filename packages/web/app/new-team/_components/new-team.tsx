"use client";

import { useRouter } from "next/navigation";
import TeamForm from "./team-form";

export default function NewTeam() {
  const router = useRouter();

  const handleCancel = () => {
    router.back();
  };

  return <TeamForm cancelButtonBehavior="always" onCancel={handleCancel} />;
}
