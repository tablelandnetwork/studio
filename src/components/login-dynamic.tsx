"use client";
import dynamic from "next/dynamic";
import { Suspense } from "react";

const LoginDynamic = () => {
  const Login = dynamic(() => import("./login").then((res) => res.default), {
    ssr: false,
  });

  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <Login />
      </Suspense>
    </div>
  );
};

export default LoginDynamic;
