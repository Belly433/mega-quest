import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { quizApi, sessionApi } from "@/lib/api";
import { Logo } from "@/components/Logo";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Quizly" }] }),
  component: Dashboard,
});

function Dashboard() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hosting, setHosting] = useState<number | null>(null);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!localStorage.getItem("quiz_user_id")) {
      navigate({ to: "/login" });
      return;
    }

    quizApi
      .getQuizzes()
      .then((data) => setQuizzes(Array.isArray(data) ? data : data?.items || []))
      .catch(() => setQuizzes([]))
      .finally(() => setLoading(false));
  }, [navigate]);

  async function startQuiz(id: number) {
    setHosting(id);
    try {
      const session = await sessionApi.createSession(id);
      if (!session.pin) {
        toast.error("Failed to create session");
        return;
      }
      navigate({ to: "/host/$pin", params: { pin: session.pin } });
    } catch {
      toast.error("Could not start session — is the backend running?");
    } finally {
      setHosting(null);
    }
  }

  function logout() {
    localStorage.removeItem("quiz_user_id");
    localStorage.removeItem("quiz_username");
    navigate({ to: "/" });
  }

  return (
    <div className="min-h-screen">
      <header className="px-6 py-5 max-w-6xl mx-auto w-full flex items-center justify-between">
        <Logo />
        <button
          onClick={logout}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Sign out
        </button>
      </header>

      <main className="max-w-6xl mx-auto px-6 pb-20">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">My quizzes</h1>
            <p className="text-muted-foreground mt-1">
              Create, host, and review results.
            </p>
          </div>
          <Link
            to="/create-quiz"
            className="px-5 py-3 rounded-xl bg-primary text-primary-foreground font-bold shadow-glow hover:scale-105 transition-transform"
          >
            + New quiz
          </Link>
        </div>

        {loading ? (
          <SkeletonGrid />
        ) : quizzes.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {quizzes.map((q) => (
              <article
                key={q.id}
                className="bg-gradient-card border rounded-2xl p-5 shadow-card flex flex-col"
              >
                <div className="text-xs uppercase tracking-wider text-primary font-bold">
                  Quiz
                </div>
                <h3 className="mt-1 text-lg font-bold">{q.title}</h3>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {q.description || "No description"}
                </p>
                <div className="text-xs text-muted-foreground mt-3">
                  {q.questionCount ?? q.questions?.length ?? 0} questions
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => startQuiz(q.id)}
                    disabled={hosting === q.id}
                    className="flex-1 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-bold hover:scale-[1.02] transition-transform disabled:opacity-60"
                  >
                    {hosting === q.id ? "Starting…" : "Host"}
                  </button>
                  <Link
                    to="/results/$quizId"
                    params={{ quizId: q.id }}
                    className="px-3 py-2 rounded-lg bg-card border text-sm font-semibold hover:bg-secondary"
                  >
                    Results
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bg-gradient-card border rounded-3xl p-12 text-center shadow-card">
      <div className="text-5xl">🎯</div>
      <h2 className="mt-4 text-2xl font-bold">No quizzes yet</h2>
      <p className="mt-1 text-muted-foreground">
        Create your first quiz to get started.
      </p>
      <Link
        to="/create-quiz"
        className="inline-block mt-6 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold shadow-glow"
      >
        Create quiz
      </Link>
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[0, 1, 2].map((i) => (
        <div key={i} className="bg-card border rounded-2xl p-5 h-44 animate-pulse" />
      ))}
    </div>
  );
}
