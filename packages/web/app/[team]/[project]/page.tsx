import { RedirectType, redirect } from "next/navigation";

export default function Page({
  params,
  searchParams,
}: {
  params: { team: string; project: string };
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const table =
    typeof searchParams.table === "string" ? searchParams.table : undefined;
  // TODO: Look up correct env in user session.
  const env = "default";
  const path = table
    ? `/${params.team}/${params.project}/${env}/${table}`
    : `/${params.team}/${params.project}/${env}`;

  redirect(path, RedirectType.replace);
}
