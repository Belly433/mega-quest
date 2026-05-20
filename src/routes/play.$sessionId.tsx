import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { antiCheatApi, playApi } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/play/$sessionId")({
  head: () => ({ meta: [{ title: "Quiz in progress — Quizly" }] }),
  component: Play,
});

const ANSWER_STYLES = [
  "bg-answer-red text-answer-red-foreground",
  "bg-answer-blue text-answer-blue-foreground",
  "bg-answer-yellow text-answer-yellow-foreground",
  "bg-answer-green text-answer-green-foreground",
];
const SHAPES = ["▲", "◆", "●", "■"];

interface Player { participantId: string; nickname: string; }
interface Question { id: string; text: string; options: string[]; timeLimit: number; index?: number; total?: number; }

function Play() {
  const { sessionId } = Route.useParams();
  const navigate = useNavigate();
  const [player] = useState<Player | null>(() => {
    const raw = sessionStorage.getItem("quiz_player");
    return raw ? JSON.parse(raw) : null;
  });
  const [question, setQuestion] = useState<Question | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [warnings, setWarnings] = useState(0);
  const [finished, setFinished] = useState(false);
  const startedAt = useRef<number>(Date.now());
  const pollRef = useRef<number | null>(null);
  const lastQid = useRef<string | null>(null);

  // ---- Anti-cheat: tab blur/focus tracking ----
  useEffect(() => {
    if (!player || finished) return;
    function handleBlur() {
      antiCheatApi.log(sessionId, player!.participantId, "blur", Date.now()).catch(() => {});
      setWarnings((w) => w + 1);
      toast.warning("Tab switch detected — this is logged.", { duration: 4000 });
    }
    function handleFocus() {
      antiCheatApi.log(sessionId, player!.participantId, "focus", Date.now()).catch(() => {});
    }
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) handleBlur(); else handleFocus();
    });
    return () => {
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
    };
  }, [sessionId, player, finished]);

  // ---- Poll current question ----
  useEffect(() => {
    if (!player) return;
    async function tick() {
      try {
        const data = await playApi.current(sessionId);
        if (data?.finished) {
          setFinished(true);
          navigate({ to: "/score/$sessionId", params: { sessionId } });
          return;
        }
        const q: Question = data.question || data;
        if (q && q.id !== lastQid.current) {
          lastQid.current = q.id;
          setQuestion(q);
          setSelected(null);
          setTimeLeft(q.timeLimit || 20);
          startedAt.current = Date.now();
        }
      } catch {
        /* keep polling */
      }
    }
    tick();
    pollRef.current = window.setInterval(tick, 2000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [sessionId, player, navigate]);

  // ---- Countdown ----
  useEffect(() => {
    if (!question || selected !== null) return;
    if (timeLeft <= 0) return;
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, question, selected]);

  async function pick(idx: number) {
    if (selected !== null || !question || !player) return;
    setSelected(idx);
    try {
      await playApi.submit(sessionId, {
        questionId: question.id,
        answerIndex: idx,
        participantId: player.participantId,
        timeTaken: (Date.now() - startedAt.current) / 1000,
      });
    } catch {
      toast.error("Could not submit answer");
    }
  }

  if (!player) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 text-center">
        <div>
          <h1 className="text-2xl font-bold">Session expired</h1>
          <button onClick={() => navigate({ to: "/join" })} className="mt-4 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-bold">
            Rejoin
          </button>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <div className="animate-pulse text-6xl mb-4">🎮</div>
        <h1 className="text-3xl font-extrabold">Waiting for host…</h1>
        <p className="text-muted-foreground mt-2">Hi {player.nickname}, the quiz will start soon.</p>
      </div>
    );
  }

  const pct = question.timeLimit ? (timeLeft / question.timeLimit) * 100 : 0;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-6 py-4 flex items-center justify-between max-w-5xl mx-auto w-full">
        <div className="text-sm font-bold">
          {question.index != null && question.total != null
            ? `Q${question.index + 1} / ${question.total}`
            : "Live"}
        </div>
        <div className="text-sm font-semibold text-muted-foreground">{player.nickname}</div>
      </header>

      {warnings > 0 && (
        <div className="mx-auto w-full max-w-5xl px-6">
          <div className="rounded-xl bg-destructive/15 border border-destructive/40 text-destructive px-4 py-2 text-sm font-semibold">
            ⚠ Suspicious activity detected ({warnings} tab switch{warnings > 1 ? "es" : ""})
          </div>
        </div>
      )}

      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-8 flex flex-col">
        <div className="bg-gradient-card border rounded-3xl p-8 sm:p-12 shadow-card text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-card">
            <div
              className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-1000 ease-linear"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="text-6xl font-black tabular-nums my-3">{timeLeft}</div>
          <h2 className="text-2xl sm:text-3xl font-bold">{question.text}</h2>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
          {question.options.map((opt, i) => {
            const isSelected = selected === i;
            const isLocked = selected !== null;
            return (
              <button
                key={i}
                onClick={() => pick(i)}
                disabled={isLocked || timeLeft <= 0}
                className={`relative rounded-2xl p-6 text-left flex items-center gap-4 shadow-card font-bold text-lg transition ${ANSWER_STYLES[i]} ${
                  isLocked && !isSelected ? "opacity-40" : ""
                } ${!isLocked ? "hover:scale-[1.02] active:scale-[0.99]" : ""} ${
                  isSelected ? "ring-4 ring-white" : ""
                }`}
              >
                <span className="text-3xl font-black">{SHAPES[i]}</span>
                <span className="flex-1">{opt}</span>
                {isSelected && <span className="text-sm font-extrabold">LOCKED</span>}
              </button>
            );
          })}
        </div>

        {selected !== null && (
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Answer locked. Waiting for next question…
          </p>
        )}
      </main>
    </div>
  );
}
