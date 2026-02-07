import dynamic from "next/dynamic";

const GoBoopApp = dynamic(() => import("@/components/GoBoopApp"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center">
      <div className="text-neutral-400 animate-pulse">Загрузка...</div>
    </div>
  ),
});

export default function Home() {
  return (
    <main>
      <GoBoopApp />
    </main>
  );
}
