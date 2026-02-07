"use client";

import { useEffect } from "react";

// #region agent log
const log = (msg: string, data?: object) => {
  fetch("http://127.0.0.1:7243/ingest/1e0bdbe2-926d-4093-9cba-195f03892070", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ location: "DebugLogger", message: msg, data: data ?? {}, timestamp: Date.now() }),
  }).catch(() => {});
};
// #endregion

export default function DebugLogger() {
  useEffect(() => {
    log("DebugLogger-mounted", { href: window.location.href });
    const onError = (e: ErrorEvent) => {
      log("window-error", { message: e.message, filename: e.filename, lineno: e.lineno });
    };
    const onUnhandled = (e: PromiseRejectionEvent) => {
      log("unhandled-rejection", { reason: String(e.reason) });
    };
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onUnhandled);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onUnhandled);
    };
  }, []);
  return null;
}
