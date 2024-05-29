import { RedirectType, redirect } from "next/navigation";

export default function Page({
  params,
  searchParams,
}: {
  params: { team: string; project: string };
  searchParams: Record<string, string | string[] | undefined>;
}) {
  let table = "";
  if (typeof searchParams.table === "string") {
    table = `/${searchParams.table}`;
  }

  // TODO: Look up correct env in user session.
  redirect(
    `/${params.team}/${params.project}/default${table}`,
    RedirectType.replace,
  );
}
