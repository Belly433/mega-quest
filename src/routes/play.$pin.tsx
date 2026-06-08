import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { WS_URL } from "@/lib/api";
import { Logo } from "@/components/Logo";
import { toast } from "sonner";

export const Route = createFileRoute("/play/$pin")({
  head: () => ({ meta: [{ title: "Quiz Game — Quizly" }] }),
  component: PlayPage,
});

const ANSWER_STYLES = [
  "bg-answer-red text-answer-red-foreground",
  "bg-answer-blue text-answer-blue-foreground",
  "bg-answer-yellow text-answer-yellow-foreground",
  "bg-answer-green text-answer-green-foreground",
];
const SHAPES = ["▲", "◆", "●", "■"];

interface Question {
  id: number;
  text: string;
  options: string[];
  timeLimit: number;
  index: number;
  total: number;
}

interface AnswerResult {
  correct: boolean;
  correct_index: number;
  points: number;
  total_score: number;
}

type Phase = "connecting" | "waiting" | "question" | "answered" | "finished";

function PlayPage() {
  const { pin } = Route.useParams();
  const navigate = useNavigate();

  const username = localStorage.getItem("quiz_username") || "";
  const wsRef = useRef<WebSocket | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAtRef = useRef<number>(Date.now());

  const [phase, setPhase] = useState<Phase>("connecting");
  const [question, setQuestion] = useState<Question | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<AnswerResult | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [leaderboard, setLeaderboard] = useState<{ username: string; score: number; rank: number }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState(0);

  // ── Redirect if no username ───────────────────────────────────────────────
  useEffect(() => {
    if (!username) {
      navigate({ to: "/join" });
    }
  }, [username, navigate]);

  // ── Anti-cheat: tab visibility ────────────────────────────────────────────
  useEffect(() => {
    function onVisChange() {
      if (document.hidden && phase === "question") {
        setWarnings((w) => w + 1);
        toast.warning("Tab switch detected — this is logged!", { duration: 4000 });
      }
    }
    document.addEventListener("visibilitychange", onVisChange);
    return () => document.removeEventListener("visibilitychange", onVisChange);
  }, [phase]);

  // ── WebSocket ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!username) return;

    const ws = new WebSocket(`${WS_URL}/session/ws/player/${pin}`);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "player_connect", username }));
    };

    ws.onerror = () => {
      setError("Could not connect to game server. Check your PIN or ask the host.");
      toast.error("Connection failed");
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);

      if (msg.type === "joined") {
        setPhase(msg.phase === "playing" ? "question" : "waiting");
      } else if (msg.type === "question") {
        stopTimer();
        const q: Question = {
          id: msg.id,
          text: msg.text,
          options: msg.options,
          timeLimit: msg.timeLimit,
          index: msg.index,
          total: msg.total,
        };
        setQuestion(q);
        setSelected(null);
        setResult(null);
        setPhase("question");
        startedAtRef.current = Date.now();
        startTimer(q.timeLimit);
      } else if (msg.type === "answer_result") {
        stopTimer();
        setResult({
          correct: msg.correct,
          correct_index: msg.correct_index,
          points: msg.points,
          total_score: msg.total_score,
        });
        setTotalScore(msg.total_score);
        setPhase("answered");
      } else if (msg.type === "game_over") {
        stopTimer();
        const board: { username: string; score: number; rank: number }[] = msg.leaderboard || [];
        setLeaderboard(board);
        setPhase("finished");

        // Store result for score page
        const me = board.find((p) => p.username === username);
        localStorage.setItem(
          "game_result",
          JSON.stringify({
            score: me?.score ?? totalScore,
            rank: me?.rank ?? null,
            username,
            pin,
            leaderboard: board,
          })
        );
      } else if (msg.type === "error") {
        toast.error(msg.message);
        setError(msg.message);
      }
    };

    ws.onclose = () => {
      if (phase !== "finished") {
        setError("Disconnected from server");
      }
    };

    return () => {
      stopTimer();
      ws.close();
    };
  }, [pin, username]);

  function startTimer(seconds: number) {
    stopTimer();
    setTimeLeft(seconds);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          stopTimer();
          // Auto-submit blank if no answer
          if (phase === "question" && wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(
              JSON.stringify({
                type: "answer",
                username,
                answer_index: -1,
                time_taken: seconds,
              })
            );
          }
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }

  function stopTimer() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  function pick(idx: number) {
    if (selected !== null || !question || phase !== "question") return;
    setSelected(idx);
    const timeTaken = (Date.now() - startedAtRef.current) / 1000;
    wsRef.current?.send(
      JSON.stringify({
        type: "answer",
        username,
        answer_index: idx,
        time_taken: timeTaken,
      })
    );
  }

  // ── Error screen ──────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold">Connection Error</h1>
          <p className="mt-2 text-muted-foreground">{error}</p>
          <button
            onClick={() => navigate({ to: "/join" })}
            className="mt-6 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-bold"
          >
            Back to Join
          </button>
        </div>
      </div>
    );
  }

  // ── Connecting ────────────────────────────────────────────────────────────
  if (phase === "connecting") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="animate-spin text-4xl mb-4">⏳</div>
        <p className="text-muted-foreground">Connecting to game {pin}…</p>
      </div>
    );
  }

  // ── Waiting lobby ─────────────────────────────────────────────────────────
  if (phase === "waiting") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <div className="animate-pulse text-7xl mb-6">🎮</div>
        <h1 className="text-3xl font-extrabold">You're in!</h1>
        <p className="mt-2 text-muted-foreground text-lg">
          Welcome, <strong>{username}</strong>
        </p>
        <p className="mt-4 text-sm text-muted-foreground">
          Waiting for the host to start the quiz…
        </p>
        <div className="mt-6 px-4 py-2 bg-card border rounded-xl text-sm">
          PIN: <strong>{pin}</strong>
        </div>
      </div>
    );
  }

  // ── Finished screen ───────────────────────────────────────────────────────
  if (phase === "finished") {
    const me = leaderboard.find((p) => p.username === username);
    return (
      <div className="min-h-screen flex flex-col">
        <header className="p-6 max-w-5xl mx-auto w-full">
          <Logo />
        </header>
        <main className="flex-1 flex items-center justify-center px-6 pb-20">
          <div className="w-full max-w-md bg-gradient-card border rounded-3xl p-10 shadow-card text-center">
            <div className="text-6xl mb-2">🎉</div>
            <h1 className="text-3xl font-extrabold">Great game, {username}!</h1>
            <div className="mt-8">
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Final score
              </div>
              <div className="text-7xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {me?.score ?? totalScore}
              </div>
              {me?.rank != null && (
                <div className="mt-2 text-sm text-muted-foreground">
                  Rank #{me.rank} of {leaderboard.length}
                </div>
              )}
            </div>
            <div className="mt-8 flex flex-col gap-2">
              <button
                onClick={() =>
                  navigate({ to: "/leaderboard/$sessionId", params: { sessionId: pin } })
                }
                className="px-5 py-3 rounded-xl bg-primary text-primary-foreground font-bold shadow-glow"
              >
                View Leaderboard
              </button>
              <button
                onClick={() => navigate({ to: "/" })}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Back Home
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ── Question / Answered ───────────────────────────────────────────────────
  const pct = question ? (timeLeft / question.timeLimit) * 100 : 0;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-6 py-4 flex items-center justify-between max-w-5xl mx-auto w-full">
        <div className="text-sm font-bold">
          {question ? `Q${question.index + 1} / ${question.total}` : "Live"}
        </div>
        <div className="flex items-center gap-3">
          {warnings > 0 && (
            <span className="text-xs text-destructive font-semibold">
              ⚠ {warnings} tab switch{warnings > 1 ? "es" : ""}
            </span>
          )}
          <span className="text-sm font-semibold text-muted-foreground">{username}</span>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-4 flex flex-col">
        {question && (
          <>
            {/* Question card with timer */}
            <div className="bg-gradient-card border rounded-3xl p-8 sm:p-10 shadow-card text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-card">
                <div
                  className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-1000 ease-linear"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div
                className={`text-6xl font-black tabular-nums my-2 ${
                  timeLeft <= 5 && phase === "question" ? "text-destructive animate-pulse" : ""
                }`}
              >
                {timeLeft}
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold">{question.text}</h2>
            </div>

            {/* Answer result banner */}
            {phase === "answered" && result && (
              <div
                className={`mt-3 rounded-2xl px-5 py-3 text-center font-bold ${
                  result.correct
                    ? "bg-green-500/15 border border-green-500/30 text-green-500"
                    : "bg-destructive/15 border border-destructive/30 text-destructive"
                }`}
              >
                {result.correct ? "✓ Correct!" : "✗ Wrong!"}{" "}
                {result.correct && `+${result.points} pts`} — Total: {result.total_score}
              </div>
            )}

            {/* Answer buttons */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
              {question.options.map((opt, i) => {
                const isSelected = selected === i;
                const isLocked = phase === "answered";
                const isCorrect = isLocked && result && i === result.correct_index;
                const isWrong = isLocked && isSelected && !result?.correct;

                return (
                  <button
                    key={i}
                    onClick={() => pick(i)}
                    disabled={isLocked || timeLeft <= 0}
                    className={`relative rounded-2xl p-6 text-left flex items-center gap-4 shadow-card font-bold text-lg transition
                      ${ANSWER_STYLES[i]}
                      ${isLocked && !isSelected && !isCorrect ? "opacity-40" : ""}
                      ${!isLocked ? "hover:scale-[1.02] active:scale-[0.99]" : ""}
                      ${isSelected ? "ring-4 ring-white" : ""}
                      ${isCorrect ? "ring-4 ring-green-400" : ""}
                      ${isWrong ? "ring-4 ring-red-400" : ""}
                    `}
                  >
                    <span className="text-3xl font-black">{SHAPES[i]}</span>
                    <span className="flex-1">{opt}</span>
                    {isCorrect && <span className="text-sm font-extrabold">✓</span>}
                    {isSelected && !isCorrect && isLocked && (
                      <span className="text-sm font-extrabold">✗</span>
                    )}
                  </button>
                );
              })}
            </div>

            {phase === "answered" && (
              <p className="mt-4 text-center text-sm text-muted-foreground">
                Answer locked. Waiting for next question…
              </p>
            )}
          </>
        )}
      </main>
    </div>
  );
}
