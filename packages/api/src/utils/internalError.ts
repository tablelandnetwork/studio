import { TRPCError } from "@trpc/server";

export function internalError(message: string, cause: unknown) {
  // ensure we can read the full error in the server logs
  console.log("internalError:");
  console.error(cause);

  return new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message,
    cause,
  });
}
