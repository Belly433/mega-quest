import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { authApi } from "@/lib/api";
import { Logo } from "@/components/Logo";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — Quizly" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const data =
        mode === "login"
          ? await authApi.login(email, password)
          : await authApi.register(email, password, name);

      if (data.message === "User not found" || data.message === "Incorrect password") {
        toast.error(data.message);
        return;
      }
      if (!data.user_id) {
        toast.error("Authentication failed — check your credentials");
        return;
      }

      localStorage.setItem("quiz_user_id", String(data.user_id));
      localStorage.setItem("quiz_username", data.username || name);
      toast.success(mode === "login" ? "Welcome back!" : "Account created!");
      navigate({ to: "/dashboard" });
    } catch {
      toast.error("Could not reach the server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-6 max-w-6xl w-full mx-auto">
        <Logo />
      </header>
      <main className="flex-1 flex items-center justify-center px-6 pb-16">
        <div className="w-full max-w-md bg-gradient-card border rounded-3xl p-8 shadow-card">
          <h1 className="text-3xl font-extrabold tracking-tight">
            {mode === "login" ? "Welcome back" : "Create account"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "login"
              ? "Sign in to host quizzes."
              : "Start hosting quizzes in minutes."}
          </p>

          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            {mode === "register" && (
              <Field label="Name">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="quiz-input"
                  placeholder="Jane Doe"
                />
              </Field>
            )}
            <Field label="Email">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="quiz-input"
                placeholder="you@school.edu"
              />
            </Field>
            <Field label="Password">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="quiz-input"
                placeholder="••••••••"
              />
            </Field>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 rounded-xl bg-primary text-primary-foreground font-bold shadow-glow hover:scale-[1.02] transition-transform disabled:opacity-60"
            >
              {loading
                ? "Please wait…"
                : mode === "login"
                  ? "Sign in"
                  : "Create account"}
            </button>
          </form>

          <button
            onClick={() => setMode(mode === "login" ? "register" : "login")}
            className="mt-5 w-full text-sm text-muted-foreground hover:text-foreground"
          >
            {mode === "login"
              ? "No account? Register"
              : "Have an account? Sign in"}
          </button>

          <div className="mt-6 pt-6 border-t text-center text-sm">
            <Link to="/join" className="text-primary font-semibold">
              Just want to play? Join with a PIN →
            </Link>
          </div>
        </div>
      </main>

      <style>{`
        .quiz-input {
          width: 100%;
          padding: 0.85rem 1rem;
          border-radius: 0.75rem;
          background: var(--color-input);
          border: 1px solid var(--color-border);
          color: var(--color-foreground);
          outline: none;
        }
        .quiz-input:focus {
          border-color: var(--color-ring);
          box-shadow: 0 0 0 3px oklch(0.72 0.22 310 / 0.2);
        }
      `}</style>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
