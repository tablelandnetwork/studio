import { cn } from "@/lib/utils";
import React, { ComponentPropsWithoutRef } from "react";

export function Card({
  children,
  className,
  ...rest
}: ComponentPropsWithoutRef<"div">) {
  return (
    <div className="flex flex-col gap-4 rounded-sm border border-gray-200 p-4">
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  className,
  ...rest
}: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={cn("text-xs uppercase text-muted-foreground", className)}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardContent({
  children,
  className,
  ...rest
}: ComponentPropsWithoutRef<"div">) {
  return (
    <div className="flex flex-col gap-2" {...rest}>
      {children}
    </div>
  );
}

export function CardMainContent({
  children,
  className,
  ...rest
}: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={cn("self-center text-3xl font-medium", className)}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardSubContent({
  children,
  className,
  ...rest
}: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={cn("self-center text-sm text-muted-foreground", className)}
      {...rest}
    >
      {children}
    </div>
  );
}
