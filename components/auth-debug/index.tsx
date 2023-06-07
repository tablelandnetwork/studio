import dynamic from "next/dynamic";

const AuthDebugDynamic = dynamic(
  () => import("./auth-debug").then((res) => res.default),
  {
    ssr: false,
  }
);

export default AuthDebugDynamic;
