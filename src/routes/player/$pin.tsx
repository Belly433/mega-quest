import { createFileRoute, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/player/$pin")({
  component: PlayerPage,
});

function PlayerPage() {

  const { pin } = useParams({ strict: false });

  const [ws, setWs] = useState<WebSocket | null>(null);

  const [started, setStarted] = useState(false);

  useEffect(() => {

    const socket = new WebSocket(
      `ws://127.0.0.1:8000/session/ws/${pin}`
    );

    setWs(socket);

    socket.onopen = () => {

      socket.send(JSON.stringify({
        type: "join",
        player: localStorage.getItem("player_name"),
      }));
    };

    socket.onmessage = (event) => {

      const data = JSON.parse(event.data);

      if (data.type === "start_quiz") {

        setStarted(true);
      }
    };

    return () => socket.close();

  }, [pin]);

  if (!started) {

    return (

      <div className="min-h-screen bg-black text-white flex items-center justify-center text-4xl">

        Waiting for host...

      </div>
    );
  }

  return (

    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-4">

      <h1 className="text-5xl font-bold">
        Quiz Started
      </h1>

      <button
        onClick={() => {

          ws?.send(JSON.stringify({
            type: "answer",
            player: localStorage.getItem("player_name"),
            answer: "Sample Answer",
          }));

        }}
        className="bg-blue-600 px-8 py-4 rounded text-2xl"
      >
        Submit Answer
      </button>

    </div>
  );
}