import axios from "axios";

// Configure your FastAPI backend URL via Vite env: VITE_API_URL
const baseURL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

// Attach auth token if present
api.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("quiz_token") : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// --- Auth ---
export const authApi = {
  login: (email: string, password: string) =>
    api.post("/auth/login", { email, password }).then((r) => r.data),
  register: (email: string, password: string, name: string) =>
    api.post("/auth/register", { email, password, name }).then((r) => r.data),
  me: () => api.get("/auth/me").then((r) => r.data),
};

// --- Quiz management (creator) ---
export const quizApi = {
  list: () => api.get("/quizzes").then((r) => r.data),
  get: (id: string) => api.get(`/quizzes/${id}`).then((r) => r.data),
  create: (data: { title: string; description?: string }) =>
    api.post("/quizzes", data).then((r) => r.data),
  remove: (id: string) => api.delete(`/quizzes/${id}`).then((r) => r.data),
  start: (id: string) => api.post(`/quizzes/${id}/start`).then((r) => r.data),
};

// --- Questions ---
export interface QuestionPayload {
  text: string;
  options: string[];
  correctIndex: number;
  timeLimit: number;
}
export const questionApi = {
  add: (quizId: string, q: QuestionPayload) =>
    api.post(`/quizzes/${quizId}/questions`, q).then((r) => r.data),
  list: (quizId: string) => api.get(`/quizzes/${quizId}/questions`).then((r) => r.data),
};

// --- Participant / gameplay ---
export const playApi = {
  join: (code: string, nickname: string) =>
    api.post(`/sessions/${code}/join`, { nickname }).then((r) => r.data),
  current: (sessionId: string) =>
    api.get(`/sessions/${sessionId}/current`).then((r) => r.data),
  submit: (sessionId: string, payload: { questionId: string; answerIndex: number; participantId: string; timeTaken: number }) =>
    api.post(`/sessions/${sessionId}/answers`, payload).then((r) => r.data),
  score: (sessionId: string, participantId: string) =>
    api.get(`/sessions/${sessionId}/participants/${participantId}/score`).then((r) => r.data),
  leaderboard: (sessionId: string) =>
    api.get(`/sessions/${sessionId}/leaderboard`).then((r) => r.data),
};

// --- Anti-cheat ---
export const antiCheatApi = {
  log: (sessionId: string, participantId: string, event: "blur" | "focus", at: number) =>
    api.post(`/sessions/${sessionId}/activity`, { participantId, event, at }).then((r) => r.data),
};
