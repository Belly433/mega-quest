const API_URL = "http://127.0.0.1:8000";

export const authApi = {
  async login(email: string, password: string) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    return response.json();
  },

  async register(email: string, password: string, username: string) {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        email,
        password,
      }),
    });

    return response.json();
  },
};
export const quizApi = {
  async getQuizzes() {
    const response = await fetch("http://127.0.0.1:8000/quiz/");
    return response.json();
  },
};
export const questionApi = {
  async create(question: any) {
    const response = await fetch("http://127.0.0.1:8000/question/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(question),
    });

    return response.json();
  },
};