import { Suspense } from "react";

import AuthDebug from "@/components/auth-debug";

export default function Footer() {
  return (
    <footer className="p-4 bg-black text-white">
      <p>&copy;2023 Tableland. All rights reserved.</p>
      <Suspense fallback={<p>Loading...</p>}>
        <AuthDebug />
      </Suspense>
    </footer>
  );
}
