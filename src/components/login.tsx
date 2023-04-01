"use client";
import { useCallback, useEffect, useRef } from "react";
import SocialLogin from "@biconomy/web3-auth";
import "@biconomy/web3-auth/dist/src/style.css";
import Button from "./button";

export default function Login() {
  const socialLogin = useRef(new SocialLogin());

  useEffect(() => {
    async function init() {
      await socialLogin.current.init();
    }
    init();
  }, []);

  const onClick = useCallback(() => {
    console.log("hi there");
    socialLogin.current.showWallet();
  }, []);
  return <Button onClick={onClick}>Login</Button>;
}
