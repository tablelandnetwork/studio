import type { SiweMessage } from "siwe";

declare module "iron-session" {
  interface IronSessionData {
    nonce: string | null;
    siweMessage: SiweMessage | null;
  }
}

export {};
