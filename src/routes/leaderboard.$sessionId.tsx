import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { sessionApi } from "@/lib/api";

export const Route = createFileRoute("/leaderboard/$sessionId")({
  head: () => ({ meta: [{ title: "Leaderboard — Quizly" }] }),
  component: Board,
});

interface Entry {
  username: string;
  score: number;
  rank: number;
}

function Board() {
  const { sessionId } = Route.useParams();
  const navigate = useNavigate();
  const [board, setBoard] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // First try localStorage (set by WS game_over), then fall back to API
    const raw = localStorage.getItem("game_result");
    if (raw) {
      try {
        const data = JSON.parse(raw);
        if (Array.isArray(data.leaderboard) && data.leaderboard.length > 0) {
          setBoard(data.leaderboard);
          setLoading(false);
          return;
        }
      } catch {
        // fall through to API
      }
    }

    sessionApi
      .getLeaderboard(sessionId)
      .then((data) => {
        if (Array.isArray(data)) setBoard(data);
      })
      .catch(() => setBoard([]))
      .finally(() => setLoading(false));
  }, [sessionId]);

  const podium = board.slice(0, 3);
  const rest = board.slice(3);

  return (
    <div className="min-h-screen">
      <header className="p-6 max-w-5xl mx-auto w-full flex items-center justify-between">
        <Logo />
        <Link to="/" className="text-sm hover:text-primary">
          Home
        </Link>
      </header>

      <main className="max-w-3xl mx-auto px-6 pb-20">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-center tracking-tight">
          Leaderboard
        </h1>

        {loading ? (
          <div className="mt-12 text-center text-muted-foreground">Loading…</div>
        ) : (
          <>
            {podium.length > 0 && (
              <div className="mt-10 grid grid-cols-3 gap-3 items-end">
                {[1, 0, 2].map((order) => {
                  const p = podium[order];
                  if (!p) return <div key={order} />;
                  const heights = ["h-44", "h-32", "h-24"][order];
                  const colors = [
                    "bg-answer-yellow text-answer-yellow-foreground",
                    "bg-answer-blue text-answer-blue-foreground",
                    "bg-answer-red text-answer-red-foreground",
                  ][order];
                  const medal = ["🥇", "🥈", "🥉"][order];
                  return (
                    <div key={order} className="text-center">
                      <div className="text-3xl mb-1">{medal}</div>
                      <div className="font-bold truncate text-sm">{p.username}</div>
                      <div
                        className={`mt-2 rounded-t-2xl flex items-center justify-center font-black text-2xl ${heights} ${colors}`}
                      >
                        {p.score}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {rest.length > 0 && (
              <ol className="mt-6 bg-gradient-card border rounded-2xl divide-y divide-border shadow-card">
                {rest.map((p, i) => (
                  <li key={p.username} className="flex items-center gap-4 py-3 px-4">
                    <span className="text-muted-foreground font-bold w-8">{i + 4}</span>
                    <span className="flex-1 font-semibold">{p.username}</span>
                    <span className="font-extrabold text-primary tabular-nums">{p.score}</span>
                  </li>
                ))}
              </ol>
            )}

            {board.length === 0 && (
              <div className="mt-12 text-center text-muted-foreground">
                No results yet.
              </div>
            )}

            <button
              onClick={() => navigate({ to: "/" })}
              className="mt-8 w-full py-3.5 rounded-xl bg-card border font-semibold hover:bg-secondary"
            >
              Back Home
            </button>
          </>
        )}
      </main>
    </div>
  );
}
