"use client";

import { useRouter } from "next/navigation";
import { Crumb } from "./crumb";

export default function CrumbNewTable({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const router = useRouter();

  return <Crumb title="New Table" onBack={router.back} {...props} />;
}
