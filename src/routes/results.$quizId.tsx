import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { playApi, quizApi } from "@/lib/api";

export const Route = createFileRoute("/results/$quizId")({
  head: () => ({ meta: [{ title: "Quiz results — Quizly" }] }),
  component: Results,
});

function Results() {
  const { quizId } = Route.useParams();
  const [board, setBoard] = useState<any[]>([]);
  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      quizApi.get(quizId).catch(() => null),
      playApi.leaderboard(quizId).catch(() => []),
    ]).then(([q, lb]) => {
      setQuiz(q);
      setBoard(Array.isArray(lb) ? lb : lb?.items || []);
      setLoading(false);
    });
  }, [quizId]);

  return (
    <div className="min-h-screen">
      <header className="px-6 py-5 max-w-5xl mx-auto w-full flex items-center justify-between">
        <Logo />
        <Link to="/dashboard" className="text-sm hover:text-primary">← Dashboard</Link>
      </header>

      <main className="max-w-3xl mx-auto px-6 pb-20">
        <h1 className="text-4xl font-extrabold tracking-tight">{quiz?.title || "Results"}</h1>
        <p className="text-muted-foreground mt-1">Final leaderboard</p>

        <div className="mt-8 bg-gradient-card border rounded-3xl p-4 shadow-card">
          {loading ? (
            <div className="p-6 text-center text-muted-foreground">Loading…</div>
          ) : board.length === 0 ? (
            <div className="p-10 text-center text-muted-foreground">No results yet.</div>
          ) : (
            <ol className="divide-y divide-border">
              {board.map((p, i) => (
                <li key={p.id || i} className="flex items-center gap-4 py-3 px-2">
                  <span
                    className={`h-10 w-10 rounded-xl flex items-center justify-center font-black text-lg ${
                      i === 0 ? "bg-answer-yellow text-answer-yellow-foreground"
                      : i === 1 ? "bg-answer-blue text-answer-blue-foreground"
                      : i === 2 ? "bg-answer-red text-answer-red-foreground"
                      : "bg-card border"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span className="flex-1 font-bold">{p.nickname || p.name}</span>
                  <span className="text-primary font-extrabold tabular-nums">{p.score ?? 0}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </main>
    </div>
  );
}
