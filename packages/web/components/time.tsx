"use client";

import { useEffect, useState } from "react";
import TimeAgo from "javascript-time-ago";

export function TimeSince({
  time,
}: React.HTMLAttributes<HTMLElement> & {
  time: string | number | Date;
}) {
  const [timeStr, setTimeStr] = useState("");
  const timeAgo = new TimeAgo("en-US");

  useEffect(function () {
    if (!(time instanceof Date)) time = new Date(time);

    setTimeStr(timeAgo.format(time));
  });

  return <span>{timeStr}</span>;
}
