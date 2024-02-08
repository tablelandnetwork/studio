import { activate } from "@/hotjar/react-hotjar";

const hj = (...params: any[]) => {
  if (typeof window.hj === "undefined") {
    throw new Error("Hotjar is not initialized");
  }
  window.hj(...params);
};

export const hotjar = {
  initialize: function initialize(id: number, sv: number, win: any) {
    activate(id, sv, win);
  },
  initialized: function initialized() {
    return typeof window !== "undefined" && typeof window?.hj === "function";
  },
  identify: function identify(userId: any, properties: any) {
    hj("identify", userId, properties);
  },
  event: function event(event: any) {
    hj("event", event);
  },
  stateChange: function stateChange(relativePath: string) {
    hj("stateChange", relativePath);
  },
};
