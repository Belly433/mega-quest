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
  async create(data: any) {

    const response = await fetch(
      "http://127.0.0.1:8000/quiz/create",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    return await response.json();
  },

  async getQuizzes() {

    const response = await fetch(
      "http://127.0.0.1:8000/quiz/"
    );

    return await response.json();
  },
};
export const questionApi = {
  async add(quizId: number, question: any) {

    const response = await fetch(
      `http://127.0.0.1:8000/question/${quizId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(question),
      }
    );

    return await response.json();
  },
};
export const sessionApi = {

  async createSession(quizId: number) {

    const response = await fetch(
      "http://127.0.0.1:8000/session/create",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quiz_id: quizId,
        }),
      }
    );

    return await response.json();
  }

};