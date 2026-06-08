import { createFileRoute, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/quiz/$pin")({
  component: QuizPage,
});

function QuizPage() {

  const { pin } = useParams({ strict: false });

  const [answered, setAnswered] = useState(false);
const [score, setScore] = useState(0);

const [gameFinished, setGameFinished] = useState(false);

const [message, setMessage] = useState("");
  const [question, setQuestion] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState<number>(20);

  useEffect(() => {

  setQuestion({
    text: "What is the capital of France?",
    options: [
      "London",
      "Paris",
      "Rome",
      "Madrid"
    ],
    correctIndex: 1
  });

}, []);

useEffect(() => {

  const handleVisibility = () => {

    if (document.hidden) {

      alert("Anti-cheat warning!");

    }

  };

  document.addEventListener(
    "visibilitychange",
    handleVisibility
  );

  return () => {
    document.removeEventListener(
      "visibilitychange",
      handleVisibility
    );
  };

}, []);

useEffect(() => {

  const timer = setInterval(() => {

    setTimeLeft((prev: number) => {

      if (prev <= 1) {

        clearInterval(timer);

        return 0;

      }

      return prev - 1;

    });

  }, 1000);

  return () => clearInterval(timer);

}, []);

  const submitAnswer = (answer: string) => {

  if (answered) return;

  setAnswered(true);

  const correct =
    answer === question.options[question.correctIndex];

  if (correct) {

    setScore(100);

    setMessage("Correct Answer!");

  } else {

    setMessage("Wrong Answer!");
  }

  setTimeout(() => {

    setGameFinished(true);

  }, 1500);
};

  if (!question) {

    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading quiz...
      </div>
    );
  }
  if (gameFinished) {

  return (

    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-6">

      <h1 className="text-6xl font-bold text-green-400">
        Quiz Finished
      </h1>
      <h2 className="text-2xl text-yellow-400">
  Score: {score}
</h2>

{message && (

  <div className="bg-white/10 px-6 py-2 rounded-xl text-xl">

    {message}

  </div>
)}

    </div>
  );
}

  return (

    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-6">

      <h1 className="text-5xl font-bold">
        Quiz Game
      </h1>

      <h2 className="text-3xl text-center">
        {question.text}
      </h2>

      <div className="grid grid-cols-2 gap-4">

        {question.options.map((option: string, index: number) => (

          <button
            key={index}
            disabled={answered}
            onClick={() => submitAnswer(option)}
            className="bg-blue-600 px-8 py-6 rounded text-xl"
          >
            {option}
          </button>

        ))}

      </div>

    </div>
  );
}