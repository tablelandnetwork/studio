import { TRPCError } from "@trpc/server";

export function zeroNine(message: string) {
  // ensure we can read the full error in the server logs
  console.log("409 Error:");
  console.error(message);

  return new TRPCError({
    code: "CONFLICT",
    message,
  });
}
