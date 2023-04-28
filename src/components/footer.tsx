import AuthDebug from "@/components/auth-debug";
import { Suspense } from "react";

export default function Footer() {
  return (
    <footer className="p-5">
      <p>&copy;2023 Tableland. All rights reserved.</p>
      <Suspense fallback={<p>Loading...</p>}>
        <AuthDebug />
      </Suspense>
    </footer>
  );
}
