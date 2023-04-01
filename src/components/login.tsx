"use client";
import { useCallback } from "react";
import Button from "./button";

export default function Login() {
  const onClick = useCallback(() => {
    console.log("hi there");
  }, []);
  return <Button onClick={onClick}>Login</Button>;
}
