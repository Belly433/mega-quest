import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/score/$sessionId")({
  head: () => ({ meta: [{ title: "Your score — Quizly" }] }),
  component: Score,
});

function Score() {
  const { sessionId } = Route.useParams();
  const navigate = useNavigate();
  const [gameResult, setGameResult] = useState<{
    score: number;
    rank: number | null;
    username: string;
    leaderboard: { username: string; score: number; rank: number }[];
  } | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("game_result");
    if (raw) {
      try {
        setGameResult(JSON.parse(raw));
      } catch {
        setGameResult(null);
      }
    }
  }, []);

  if (!gameResult) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 text-center">
        <div>
          <h1 className="text-2xl font-bold">No score data</h1>
          <p className="mt-2 text-muted-foreground">
            It looks like this session has expired.
          </p>
          <button
            onClick={() => navigate({ to: "/" })}
            className="mt-6 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-bold"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-6 max-w-5xl mx-auto w-full">
        <Logo />
      </header>
      <main className="flex-1 flex items-center justify-center px-6 pb-20">
        <div className="w-full max-w-md bg-gradient-card border rounded-3xl p-10 shadow-card text-center">
          <div className="text-6xl mb-2">🎉</div>
          <h1 className="text-3xl font-extrabold">
            Great game, {gameResult.username}!
          </h1>
          <div className="mt-8">
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Final score
            </div>
            <div className="text-7xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {gameResult.score}
            </div>
            {gameResult.rank != null && (
              <div className="mt-2 text-sm text-muted-foreground">
                Rank #{gameResult.rank} of {gameResult.leaderboard?.length}
              </div>
            )}
          </div>
          <div className="mt-8 flex flex-col gap-2">
            <button
              onClick={() =>
                navigate({
                  to: "/leaderboard/$sessionId",
                  params: { sessionId },
                })
              }
              className="px-5 py-3 rounded-xl bg-primary text-primary-foreground font-bold shadow-glow"
            >
              View Leaderboard
            </button>
            <button
              onClick={() => navigate({ to: "/" })}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Back Home
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
