"use client";

import { useRouter } from "next/navigation";
import { Crumb } from "./crumb";

export default function CrumbBack({
  className,
  title,
  subtitle,
  ...props
}: React.HTMLAttributes<HTMLElement> & { title: string; subtitle?: string }) {
  const router = useRouter();

  return (
    <Crumb title={title} subtitle={subtitle} onBack={router.back} {...props} />
  );
}
