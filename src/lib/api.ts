const API_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  "http://localhost:8000";

export const WS_URL = API_URL.replace(/^http/, "ws");

async function post(path: string, body: unknown) {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

async function get(path: string) {
  const res = await fetch(`${API_URL}${path}`);
  return res.json();
}

export const authApi = {
  login: (email: string, password: string) =>
    post("/auth/login", { email, password }),

  register: (email: string, password: string, username: string) =>
    post("/auth/register", { username, email, password }),
};

export const quizApi = {
  create: (data: { title: string; description: string }) =>
    post("/quiz/create", data),

  getQuizzes: () => get("/quiz/"),

  get: (quizId: string | number) => get(`/quiz/${quizId}`),
};

export const questionApi = {
  add: (quizId: number, question: unknown) =>
    post(`/question/${quizId}`, question),
};

export const sessionApi = {
  createSession: (quizId: number) =>
    post("/session/create", { quiz_id: quizId }),

  getSession: (pin: string) => get(`/session/${pin}`),

  getLeaderboard: (pin: string) => get(`/session/${pin}/leaderboard`),
};

export const playerApi = {
  join: (pin: string, username: string) =>
    post("/player/join", { pin, username }),
};

// Stubs — anti-cheat is handled server-side via WebSocket answers
export const antiCheatApi = {
  log: async (_sessionId: string, _participantId: string, _event: string, _ts: number) => {},
};

// Stubs — score/play now handled via WebSocket game_over payload
export const playApi = {
  current: async (_sessionId: string) => null,
  submit: async (_sessionId: string, _data: unknown) => {},
  score: async (_sessionId: string, _participantId: string) => null,
  leaderboard: async (_quizId: string) => [],
};
