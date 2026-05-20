import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { playApi } from "@/lib/api";

export const Route = createFileRoute("/score/$sessionId")({
  head: () => ({ meta: [{ title: "Your score — Quizly" }] }),
  component: Score,
});

function Score() {
  const { sessionId } = Route.useParams();
  const [player] = useState<any>(() => {
    const raw = sessionStorage.getItem("quiz_player");
    return raw ? JSON.parse(raw) : null;
  });
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!player) return;
    playApi.score(sessionId, player.participantId).then(setData).catch(() => setData({ score: 0 }));
  }, [sessionId, player]);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-6 max-w-5xl mx-auto w-full"><Logo /></header>
      <main className="flex-1 flex items-center justify-center px-6 pb-20">
        <div className="w-full max-w-md bg-gradient-card border rounded-3xl p-10 shadow-card text-center">
          <div className="text-6xl mb-2">🎉</div>
          <h1 className="text-3xl font-extrabold">Great game, {player?.nickname || "player"}!</h1>
          <div className="mt-8">
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Final score</div>
            <div className="text-7xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {data?.score ?? "…"}
            </div>
            {data?.rank != null && (
              <div className="mt-2 text-sm text-muted-foreground">Rank #{data.rank}</div>
            )}
          </div>
          <div className="mt-8 flex flex-col gap-2">
            <Link
              to="/leaderboard/$sessionId"
              params={{ sessionId }}
              className="px-5 py-3 rounded-xl bg-primary text-primary-foreground font-bold shadow-glow"
            >
              View leaderboard
            </Link>
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
              Back home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
