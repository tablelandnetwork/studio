"use client";

import { useRouter } from "next/navigation";
import { Crumb } from "./crumb";

export function CrumbNewProject({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const router = useRouter();

  return <Crumb title="New Project" onBack={router.back} {...props} />;
}
