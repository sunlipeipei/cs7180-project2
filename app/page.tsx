import CircularTimer from "@/components/CircularTimer";

export default function Home() {
  return (
    <main className="min-h-screen bg-black flex flex-col items-center justify-center p-8 font-[family-name:var(--font-geist-sans)]">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-2">DeepWork</h1>
        <p className="text-zinc-400">Flexible, non-coercive focus timer</p>
      </div>

      <CircularTimer defaultFocusMinutes={25} defaultBreakMinutes={5} />
    </main>
  );
}
