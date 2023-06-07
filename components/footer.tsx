import { Suspense } from "react";

import AuthDebug from "@/components/auth-debug";
import { Auth } from "@/lib/withSession";

export default function Footer({ auth }: { auth: Auth | null }) {
  return (
    <footer className="bg-black p-4 text-white">
      <p>&copy;2023 Tableland. All rights reserved.</p>
      <Suspense fallback={<p>Loading...</p>}>
        <AuthDebug auth={auth} />
      </Suspense>
    </footer>
  );
}
