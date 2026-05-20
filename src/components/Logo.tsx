import { Link } from "@tanstack/react-router";

export function Logo() {
  return (
    <Link to="/" className="inline-flex items-center gap-2 font-display font-extrabold text-2xl tracking-tight">
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-hero shadow-glow">
        <span className="text-lg">⚡</span>
      </span>
      <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
        Quizly
      </span>
    </Link>
  );
}
