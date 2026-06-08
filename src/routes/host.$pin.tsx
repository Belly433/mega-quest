import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { WS_URL } from "@/lib/api";
import { Logo } from "@/components/Logo";
import { toast } from "sonner";

export const Route = createFileRoute("/host/$pin")({
  head: () => ({ meta: [{ title: "Host Session — Quizly" }] }),
  component: HostPage,
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
  correctIndex: number;
  timeLimit: number;
  index: number;
  total: number;
}

type Phase = "lobby" | "playing" | "reveal" | "finished";

function HostPage() {
  const { pin } = Route.useParams();
  const navigate = useNavigate();

  const wsRef = useRef<WebSocket | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [phase, setPhase] = useState<Phase>("lobby");
  const [players, setPlayers] = useState<string[]>([]);
  const [question, setQuestion] = useState<Question | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [leaderboard, setLeaderboard] = useState<{ username: string; score: number; rank: number }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [wsReady, setWsReady] = useState(false);

  // ── WebSocket connection ───────────────────────────────────────────────────
  useEffect(() => {
    const ws = new WebSocket(`${WS_URL}/session/ws/host/${pin}`);
    wsRef.current = ws;

    ws.onopen = () => setWsReady(true);

    ws.onerror = () => {
      setError("WebSocket connection failed. Is the backend running?");
      toast.error("Cannot connect to server");
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);

      if (msg.type === "player_list") {
        setPlayers(msg.players);
      } else if (msg.type === "question") {
        const q: Question = {
          id: msg.id,
          text: msg.text,
          options: msg.options,
          correctIndex: msg.correctIndex,
          timeLimit: msg.timeLimit,
          index: msg.index,
          total: msg.total,
        };
        setQuestion(q);
        setPhase("playing");
        setAnsweredCount(0);
        setTimeLeft(q.timeLimit);
        startTimer(q.timeLimit);
      } else if (msg.type === "answer_count") {
        setAnsweredCount(msg.answered);
      } else if (msg.type === "game_over") {
        stopTimer();
        setLeaderboard(msg.leaderboard || []);
        setPhase("finished");
      } else if (msg.type === "error") {
        toast.error(msg.message);
      }
    };

    ws.onclose = () => setWsReady(false);

    return () => {
      stopTimer();
      ws.close();
    };
  }, [pin]);

  function startTimer(seconds: number) {
    stopTimer();
    setTimeLeft(seconds);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          stopTimer();
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

  function sendMsg(msg: object) {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    }
  }

  function startQuiz() {
    if (players.length === 0) {
      toast.error("Wait for at least one player to join");
      return;
    }
    sendMsg({ type: "start_quiz" });
  }

  function nextQuestion() {
    stopTimer();
    sendMsg({ type: "next_question" });
  }

  function endQuiz() {
    stopTimer();
    sendMsg({ type: "end_quiz" });
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
            onClick={() => navigate({ to: "/dashboard" })}
            className="mt-6 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-bold"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ── Finished screen ───────────────────────────────────────────────────────
  if (phase === "finished") {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="px-6 py-5 max-w-5xl mx-auto w-full flex items-center justify-between">
          <Logo />
          <button
            onClick={() => navigate({ to: "/dashboard" })}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Dashboard
          </button>
        </header>
        <main className="flex-1 max-w-3xl mx-auto w-full px-6 pb-20">
          <h1 className="text-4xl font-extrabold text-center tracking-tight mt-4">
            Game Over!
          </h1>
          <div className="mt-8 bg-gradient-card border rounded-3xl p-4 shadow-card">
            <h2 className="text-lg font-bold px-2 pt-2 pb-4">Final Leaderboard</h2>
            <ol className="divide-y divide-border">
              {leaderboard.map((p, i) => (
                <li key={p.username} className="flex items-center gap-4 py-3 px-2">
                  <span
                    className={`h-10 w-10 rounded-xl flex items-center justify-center font-black text-lg ${
                      i === 0
                        ? "bg-answer-yellow text-answer-yellow-foreground"
                        : i === 1
                          ? "bg-answer-blue text-answer-blue-foreground"
                          : i === 2
                            ? "bg-answer-red text-answer-red-foreground"
                            : "bg-card border"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span className="flex-1 font-bold">{p.username}</span>
                  <span className="font-extrabold text-primary tabular-nums">{p.score}</span>
                </li>
              ))}
              {leaderboard.length === 0 && (
                <li className="py-8 text-center text-muted-foreground">No scores recorded.</li>
              )}
            </ol>
          </div>
          <button
            onClick={() => navigate({ to: "/dashboard" })}
            className="mt-6 w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-bold shadow-glow"
          >
            Back to Dashboard
          </button>
        </main>
      </div>
    );
  }

  // ── Playing screen ────────────────────────────────────────────────────────
  if (phase === "playing" && question) {
    const pct = (timeLeft / question.timeLimit) * 100;
    return (
      <div className="min-h-screen flex flex-col">
        <header className="px-6 py-4 max-w-5xl mx-auto w-full flex items-center justify-between">
          <div className="text-sm font-bold text-muted-foreground">
            Q{question.index + 1} / {question.total}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {answeredCount} / {players.length} answered
            </span>
            <button
              onClick={nextQuestion}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-bold"
            >
              {question.index + 1 >= question.total ? "End Quiz" : "Next Question →"}
            </button>
          </div>
        </header>

        <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-4 flex flex-col">
          <div className="bg-gradient-card border rounded-3xl p-8 shadow-card text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-card">
              <div
                className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-1000 ease-linear"
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="text-6xl font-black tabular-nums my-2">{timeLeft}</div>
            <h2 className="text-2xl sm:text-3xl font-bold">{question.text}</h2>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {question.options.map((opt, i) => (
              <div
                key={i}
                className={`rounded-2xl p-5 flex items-center gap-3 shadow-card font-bold text-lg ${ANSWER_STYLES[i]} ${
                  i === question.correctIndex ? "ring-4 ring-white" : ""
                }`}
              >
                <span className="text-2xl font-black">{SHAPES[i]}</span>
                <span className="flex-1">{opt}</span>
                {i === question.correctIndex && (
                  <span className="text-sm font-extrabold opacity-80">✓ CORRECT</span>
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 bg-gradient-card border rounded-2xl p-4 shadow-card">
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Players ({players.length})
            </div>
            <div className="flex flex-wrap gap-2">
              {players.map((name) => (
                <span key={name} className="px-3 py-1 bg-primary/15 text-primary rounded-full text-sm font-semibold">
                  {name}
                </span>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ── Lobby screen ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-6 py-5 max-w-5xl mx-auto w-full flex items-center justify-between">
        <Logo />
        <button
          onClick={() => navigate({ to: "/dashboard" })}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Cancel
        </button>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 pb-20">
        {/* PIN display */}
        <div className="mt-6 bg-gradient-card border rounded-3xl p-8 shadow-card text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Game PIN
          </p>
          <div className="text-7xl sm:text-8xl font-black tracking-widest mt-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {pin}
          </div>
          <p className="text-sm text-muted-foreground mt-3">
            Share this PIN with players — they go to <strong>/join</strong>
          </p>
          <div
            className={`mt-3 inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full ${
              wsReady ? "bg-green-500/15 text-green-500" : "bg-yellow-500/15 text-yellow-500"
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${wsReady ? "bg-green-500" : "bg-yellow-500"}`} />
            {wsReady ? "Connected" : "Connecting…"}
          </div>
        </div>

        {/* Players list */}
        <div className="mt-6 bg-gradient-card border rounded-2xl p-5 shadow-card">
          <h2 className="text-lg font-bold">
            Players joined{" "}
            <span className="text-primary">{players.length}</span>
          </h2>
          {players.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Waiting for players to join…
            </p>
          ) : (
            <div className="mt-3 flex flex-wrap gap-2">
              {players.map((name) => (
                <span
                  key={name}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-bold shadow-card animate-in fade-in-0 zoom-in-95"
                >
                  {name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Start button */}
        <button
          onClick={startQuiz}
          disabled={!wsReady || players.length === 0}
          className="mt-6 w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-xl shadow-glow hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:scale-100"
        >
          {players.length === 0 ? "Waiting for players…" : `Start Quiz (${players.length} player${players.length !== 1 ? "s" : ""})`}
        </button>

        <button
          onClick={endQuiz}
          className="mt-3 w-full py-3 rounded-2xl text-sm text-muted-foreground hover:text-foreground hover:bg-card transition"
        >
          End session early
        </button>
      </main>
    </div>
  );
}
