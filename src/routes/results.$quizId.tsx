import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { quizApi } from "@/lib/api";

export const Route = createFileRoute("/results/$quizId")({
  head: () => ({ meta: [{ title: "Quiz results — Quizly" }] }),
  component: Results,
});

function Results() {
  const { quizId } = Route.useParams();
  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    quizApi
      .get(quizId)
      .then(setQuiz)
      .catch(() => setQuiz(null))
      .finally(() => setLoading(false));
  }, [quizId]);

  return (
    <div className="min-h-screen">
      <header className="px-6 py-5 max-w-5xl mx-auto w-full flex items-center justify-between">
        <Logo />
        <Link to="/dashboard" className="text-sm hover:text-primary">
          ← Dashboard
        </Link>
      </header>

      <main className="max-w-3xl mx-auto px-6 pb-20">
        {loading ? (
          <div className="mt-12 text-center text-muted-foreground">Loading…</div>
        ) : !quiz ? (
          <div className="mt-12 text-center text-muted-foreground">Quiz not found.</div>
        ) : (
          <>
            <h1 className="text-4xl font-extrabold tracking-tight">{quiz.title}</h1>
            <p className="text-muted-foreground mt-1">
              {quiz.questions?.length ?? 0} questions
            </p>

            <div className="mt-8 bg-gradient-card border rounded-3xl p-4 shadow-card">
              <h2 className="text-lg font-bold px-2 pt-2 pb-3">Questions</h2>
              <ol className="divide-y divide-border">
                {(quiz.questions || []).map((q: any, i: number) => (
                  <li key={q.id} className="py-4 px-2">
                    <div className="font-semibold">
                      {i + 1}. {q.text}
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-1">
                      {q.options.map((opt: string, j: number) => (
                        <div
                          key={j}
                          className={`text-sm px-3 py-1.5 rounded-lg ${
                            j === q.correctIndex
                              ? "bg-green-500/15 text-green-500 font-bold"
                              : "bg-card border text-muted-foreground"
                          }`}
                        >
                          {opt}
                          {j === q.correctIndex && " ✓"}
                        </div>
                      ))}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
