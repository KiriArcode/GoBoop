import dynamic from "next/dynamic";

// #region agent log
const log = (msg: string, data?: object) => {
  fetch("http://127.0.0.1:7243/ingest/1e0bdbe2-926d-4093-9cba-195f03892070", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ location: "page.tsx", message: msg, data: data ?? {}, timestamp: Date.now() }),
  }).catch(() => {});
};
// #endregion

const GoBoopApp = dynamic(
  () =>
    import("@/components/GoBoopApp")
      // #region agent log
      .then((mod) => {
        log("dynamic-import-success", { hasDefault: !!mod.default });
        return mod;
      })
      .catch((err) => {
        log("dynamic-import-failed", { err: String(err), stack: err?.stack?.slice(0, 200) });
        throw err;
      }),
  // #endregion
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="text-neutral-400 animate-pulse">Загрузка...</div>
      </div>
    ),
  }
);

export default function Home() {
  return (
    <main>
      <GoBoopApp />
    </main>
  );
}
