"use client";

import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";

TimeAgo.addDefaultLocale(en);

export const TimeAgoProvider: React.FC<{ children: React.ReactNode }> = (p) => {
  return <>{p.children}</>;
};
