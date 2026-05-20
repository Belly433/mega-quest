import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { playApi } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/join")({
  head: () => ({ meta: [{ title: "Join a game — Quizly" }] }),
  component: Join,
});

function Join() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"pin" | "name">("pin");
  const [pin, setPin] = useState("");
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!pin.trim() || !nickname.trim()) return;
    setLoading(true);
    try {
      const session = await playApi.join(pin.trim(), nickname.trim());
      sessionStorage.setItem(
        "quiz_player",
        JSON.stringify({ participantId: session.participantId || session.id, nickname })
      );
      const sessionId = session.sessionId || session.id;
      navigate({ to: "/play/$sessionId", params: { sessionId } });
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Could not join. Check the PIN.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-6 max-w-6xl mx-auto w-full">
        <Logo />
      </header>
      <main className="flex-1 flex items-center justify-center px-6 pb-20">
        <div className="w-full max-w-md bg-gradient-card border rounded-3xl p-8 shadow-card text-center">
          {step === "pin" ? (
            <>
              <h1 className="text-3xl font-extrabold">Game PIN</h1>
              <p className="text-muted-foreground mt-1 text-sm">
                Ask your host for the 6-digit code.
              </p>
              <input
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 8))}
                inputMode="numeric"
                placeholder="123456"
                className="mt-6 w-full text-center text-4xl font-black tracking-[0.4em] py-5 rounded-2xl bg-input border outline-none focus:ring-4 focus:ring-primary/30"
              />
              <button
                onClick={() => pin.length >= 4 && setStep("name")}
                className="mt-5 w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold shadow-glow hover:scale-[1.02] transition"
              >
                Enter
              </button>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-extrabold">Your nickname</h1>
              <p className="text-muted-foreground mt-1 text-sm">Pick something fun.</p>
              <input
                value={nickname}
                onChange={(e) => setNickname(e.target.value.slice(0, 20))}
                placeholder="QuizMaster42"
                className="mt-6 w-full text-center text-2xl font-bold py-4 rounded-2xl bg-input border outline-none focus:ring-4 focus:ring-primary/30"
              />
              <button
                onClick={submit}
                disabled={loading || !nickname.trim()}
                className="mt-5 w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold shadow-glow disabled:opacity-60"
              >
                {loading ? "Joining…" : "Let's play"}
              </button>
              <button
                onClick={() => setStep("pin")}
                className="mt-3 text-sm text-muted-foreground hover:text-foreground"
              >
                ← Change PIN
              </button>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
