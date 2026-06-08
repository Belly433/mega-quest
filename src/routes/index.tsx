import { createFileRoute, Link } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";
export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Quizly — Real-time Quiz Game Platform" },
      { name: "description", content: "Create live quizzes and play with friends. A modern Kahoot-style quiz game." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-6 py-5 flex items-center justify-between max-w-6xl mx-auto w-full">
        <Logo />
        <nav className="flex items-center gap-2">
          <Link
            to="/login"
            className="px-4 py-2 rounded-xl text-sm font-semibold hover:bg-card transition"
          >
            Sign in
          </Link>
          <Link
            to="/join"
            className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-glow hover:scale-105 transition-transform"
          >
            Join a game
          </Link>
        </nav>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-3xl text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-card border text-xs font-semibold tracking-wide uppercase text-muted-foreground mb-6">
            Live • Real-time • Fun
          </span>
          <h1 className="font-display text-5xl sm:text-7xl font-extrabold tracking-tight leading-[1.05]">
            Learning should feel like a{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              game.
            </span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto">
            Build interactive quizzes in minutes. Host live sessions, watch the leaderboard climb,
            and keep everyone engaged.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/join"
              className="px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-bold shadow-glow hover:scale-105 transition-transform"
            >
              Enter game PIN
            </Link>
            <Link
              to="/dashboard"
              className="px-8 py-4 rounded-2xl bg-card border font-bold hover:bg-secondary transition"
            >
              Create a quiz
            </Link>
          </div>

          <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { t: "Build", d: "Drag-and-drop question editor." },
              { t: "Host", d: "Live timer, locked answers, real-time scores." },
              { t: "Learn", d: "Leaderboards and detailed results." },
            ].map((f) => (
              <div key={f.t} className="bg-gradient-card border rounded-2xl p-5 text-left shadow-card">
                <div className="text-sm font-bold text-primary">{f.t}</div>
                <div className="mt-1 text-sm text-muted-foreground">{f.d}</div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
