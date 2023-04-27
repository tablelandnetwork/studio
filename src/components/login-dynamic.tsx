import { Team } from "@/db/schema";
import dynamic from "next/dynamic";
import { Suspense } from "react";

const LoginDynamic = ({ personalTeam }: { personalTeam?: Team }) => {
  const Login = dynamic(() => import("./login").then((res) => res.default), {
    ssr: false,
  });

  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <Login personalTeam={personalTeam} />
      </Suspense>
    </div>
  );
};

export default LoginDynamic;
