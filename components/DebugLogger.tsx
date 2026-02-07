"use client";

import { useEffect } from "react";

export default function DebugLogger() {
  useEffect(() => {
    console.log("[GoBoop] App loaded", { href: window.location.href });

    const onError = (e: ErrorEvent) => {
      console.error("[GoBoop] Error:", e.message, e.filename, e.lineno);
    };
    const onUnhandled = (e: PromiseRejectionEvent) => {
      console.error("[GoBoop] Unhandled rejection:", String(e.reason));
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
