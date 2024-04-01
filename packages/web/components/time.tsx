"use client";

import { useEffect, useState } from "react";
import TimeAgo from "javascript-time-ago";

export function TimeSince({
  time,
  ...rest
}: React.HTMLAttributes<HTMLSpanElement> & {
  time: string | number | Date;
}) {
  const [timeStr, setTimeStr] = useState("");
  const timeAgo = new TimeAgo("en-US");

  useEffect(function () {
    const date = time instanceof Date ? time : new Date(time);
    setTimeStr(timeAgo.format(date));
  });

  return <span {...rest}>{timeStr}</span>;
}
