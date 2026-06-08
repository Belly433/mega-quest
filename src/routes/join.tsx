import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { playerApi } from "@/lib/api";
import { Logo } from "@/components/Logo";
import { toast } from "sonner";

export const Route = createFileRoute("/join")({
  head: () => ({ meta: [{ title: "Join Game — Quizly" }] }),
  component: JoinPage,
});

function JoinPage() {
  const navigate = useNavigate();
  const [pin, setPin] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleJoin() {
    const trimPin = pin.trim();
    const trimName = username.trim();

    if (!trimPin || !trimName) {
      toast.error("Please enter your name and the game PIN");
      return;
    }

    setLoading(true);
    try {
      const result = await playerApi.join(trimPin, trimName);
      if (!result.valid) {
        toast.error(result.message || "Could not join — check the PIN");
        return;
      }

      localStorage.setItem("quiz_username", trimName);
      localStorage.setItem("quiz_pin", trimPin);

      navigate({ to: "/play/$pin", params: { pin: trimPin } });
    } catch {
      toast.error("Could not connect to the server");
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
          <h1 className="text-3xl font-extrabold tracking-tight">Join a game</h1>
          <p className="mt-1 text-sm text-muted-foreground">Enter the PIN shown on screen.</p>

          <div className="mt-6 space-y-4">
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Your name
              </span>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                placeholder="e.g. Alex"
                className="mt-1.5 w-full px-4 py-3 rounded-xl bg-input border font-semibold text-lg outline-none focus:ring-2 focus:ring-ring"
              />
            </label>

            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Game PIN
              </span>
              <input
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                placeholder="123456"
                inputMode="numeric"
                maxLength={6}
                className="mt-1.5 w-full px-4 py-3 rounded-xl bg-input border font-black text-2xl text-center tracking-widest outline-none focus:ring-2 focus:ring-ring"
              />
            </label>

            <button
              onClick={handleJoin}
              disabled={loading}
              className="w-full mt-2 py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-lg shadow-glow hover:scale-[1.02] transition-transform disabled:opacity-60"
            >
              {loading ? "Joining…" : "Join Game"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
