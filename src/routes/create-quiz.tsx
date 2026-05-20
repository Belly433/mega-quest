import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { quizApi, questionApi, type QuestionPayload } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/create-quiz")({
  head: () => ({ meta: [{ title: "Create quiz — Quizly" }] }),
  component: CreateQuiz,
});

type Draft = QuestionPayload;

const ANSWER_STYLES = [
  "bg-answer-red text-answer-red-foreground",
  "bg-answer-blue text-answer-blue-foreground",
  "bg-answer-yellow text-answer-yellow-foreground",
  "bg-answer-green text-answer-green-foreground",
];
const ANSWER_SHAPES = ["▲", "◆", "●", "■"];

function makeBlank(): Draft {
  return { text: "", options: ["", "", "", ""], correctIndex: 0, timeLimit: 20 };
}

function CreateQuiz() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<Draft[]>([makeBlank()]);
  const [active, setActive] = useState(0);
  const [saving, setSaving] = useState(false);

  const q = questions[active];

  function update(patch: Partial<Draft>) {
    setQuestions((qs) => qs.map((it, i) => (i === active ? { ...it, ...patch } : it)));
  }
  function updateOption(idx: number, value: string) {
    update({ options: q.options.map((o, i) => (i === idx ? value : o)) });
  }

  async function save() {
    if (!title.trim()) return toast.error("Add a title");
    if (questions.some((qq) => !qq.text.trim() || qq.options.some((o) => !o.trim()))) {
      return toast.error("Fill in every question and answer");
    }
    setSaving(true);
    try {
      const quiz = await quizApi.create({ title, description });
      for (const qq of questions) {
        await questionApi.add(quiz.id, qq);
      }
      toast.success("Quiz saved");
      navigate({ to: "/dashboard" });
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen">
      <header className="px-6 py-5 max-w-6xl mx-auto w-full flex items-center justify-between">
        <Logo />
        <div className="flex gap-2">
          <Link to="/dashboard" className="px-4 py-2 rounded-xl text-sm hover:bg-card">Cancel</Link>
          <button
            onClick={save}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold shadow-glow disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save quiz"}
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 pb-20 grid lg:grid-cols-[280px_1fr] gap-6">
        {/* Sidebar */}
        <aside className="space-y-4">
          <div className="bg-gradient-card border rounded-2xl p-4 shadow-card space-y-3">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Quiz title"
              className="w-full px-3 py-2 rounded-lg bg-input border font-bold"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optional)"
              rows={2}
              className="w-full px-3 py-2 rounded-lg bg-input border text-sm resize-none"
            />
          </div>

          <div className="bg-gradient-card border rounded-2xl p-3 shadow-card">
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-2 py-1">
              Questions
            </div>
            <div className="space-y-1.5">
              {questions.map((qq, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition ${
                    i === active ? "bg-primary text-primary-foreground font-bold" : "hover:bg-card"
                  }`}
                >
                  <span className="opacity-70">{i + 1}.</span>
                  <span className="truncate">{qq.text || "Untitled"}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                setQuestions((qs) => [...qs, makeBlank()]);
                setActive(questions.length);
              }}
              className="mt-2 w-full px-3 py-2 rounded-lg bg-card border text-sm font-semibold hover:bg-secondary"
            >
              + Add question
            </button>
            {questions.length > 1 && (
              <button
                onClick={() => {
                  setQuestions((qs) => qs.filter((_, i) => i !== active));
                  setActive(Math.max(0, active - 1));
                }}
                className="mt-1 w-full px-3 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10"
              >
                Delete this question
              </button>
            )}
          </div>
        </aside>

        {/* Editor */}
        <section className="bg-gradient-card border rounded-3xl p-6 sm:p-8 shadow-card">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-primary">
              Question {active + 1}
            </h2>
            <label className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Time</span>
              <select
                value={q.timeLimit}
                onChange={(e) => update({ timeLimit: Number(e.target.value) })}
                className="px-3 py-1.5 rounded-lg bg-input border font-bold"
              >
                {[10, 20, 30, 45, 60, 90].map((s) => (
                  <option key={s} value={s}>{s}s</option>
                ))}
              </select>
            </label>
          </div>

          <textarea
            value={q.text}
            onChange={(e) => update({ text: e.target.value })}
            placeholder="Type your question here…"
            rows={3}
            className="mt-4 w-full px-5 py-4 rounded-2xl bg-input border text-xl font-bold text-center resize-none"
          />

          <div className="mt-6 grid sm:grid-cols-2 gap-3">
            {q.options.map((opt, i) => (
              <div
                key={i}
                className={`rounded-2xl p-4 flex items-center gap-3 shadow-card ${ANSWER_STYLES[i]}`}
              >
                <div className="text-2xl font-black w-8 text-center">{ANSWER_SHAPES[i]}</div>
                <input
                  value={opt}
                  onChange={(e) => updateOption(i, e.target.value)}
                  placeholder={`Answer ${i + 1}`}
                  className="flex-1 bg-black/15 placeholder:text-current/60 px-3 py-2 rounded-lg font-bold outline-none"
                />
                <button
                  onClick={() => update({ correctIndex: i })}
                  title="Mark correct"
                  className={`h-9 w-9 rounded-full border-2 flex items-center justify-center font-black transition ${
                    q.correctIndex === i
                      ? "bg-white text-emerald-600 border-white"
                      : "border-white/70 hover:bg-white/10"
                  }`}
                >
                  ✓
                </button>
              </div>
            ))}
          </div>

          <p className="mt-4 text-xs text-muted-foreground text-center">
            Tap the check to mark the correct answer.
          </p>
        </section>
      </main>
    </div>
  );
}
