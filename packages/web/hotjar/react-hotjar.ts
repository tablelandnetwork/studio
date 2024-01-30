/* eslint-disable */
// @ts-nocheck
// instead of trying to rewrite hotjar's script we are instructing
// typescript to ignore this entire file

declare global {
  interface Window {
    hj: any;
    _hjSettings: any;
  }
}

export function activate(id: number, sv: number, win: any, debug = false) {
  if (typeof win === "undefined") {
    console.log("window is undefined");
    return;
  }
  console.log("window is defined");
  // Hotjar Tracking Code for https://studio.tableland.xyz/
  (function (h, o, t, j, a, r) {
    h.hj =
      h.hj ||
      function () {
        (h.hj.q = h.hj.q || []).push(arguments);
      };

    h._hjSettings = { hjid: id, hjsv: sv, hjDebug: debug };

    a = o.getElementsByTagName("head")[0];
    r = o.createElement("script");
    r.async = 1;
    r.src = t + h._hjSettings.hjid + j + h._hjSettings.hjsv;
    a.appendChild(r);
  })(win, document, "https://static.hotjar.com/c/hotjar-", ".js?sv=");
}
/* eslint-enable */
