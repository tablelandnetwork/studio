"use client";

import { useEffect } from "react";
import { hotjar } from "@/hotjar";

export default function Hotjar() {
  useEffect(() => {
    hotjar.initialize(3842183, 6, window);
  });

  return <span id="hotjar-el"></span>;
}
