"use client";

import "client-only";
import TimeAgo from "javascript-time-ago";

export function TimeSince({
  time,
}: React.HTMLAttributes<HTMLElement> & {
  time: string | number | Date;
}) {
  if (!(time instanceof Date)) time = new Date(time);

  const timeAgo = new TimeAgo("en-US");

  return <span>{timeAgo.format(time)}</span>;
}
