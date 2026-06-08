import { createFileRoute, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/host/$pin")({
  component: HostPage,
});

function HostPage() {

  const { pin } = useParams({ strict: false });

  const [players, setPlayers] = useState<any[]>([]);
  const [ws, setWs] = useState<WebSocket | null>(null);

useEffect(() => {

  const socket = new WebSocket(
    `ws://127.0.0.1:8000/session/ws/${pin}`
  );

  setWs(socket);
  const loadPlayers = async () => {

  const response = await fetch(
    `http://127.0.0.1:8000/player/${pin}`
  );

  const data = await response.json();

  setPlayers(data);
};

loadPlayers();

  socket.onmessage = (event) => {

    const data = JSON.parse(event.data);

    if (data.type === "join") {

      setPlayers((prev) => {

        if (prev.includes(data.player)) return prev;

        return [...prev, data.player];
      });
    }

    if (data.type === "start_quiz") {

      window.location.href = `/quiz/${pin}`;
    }
  };

  return () => socket.close();

}, [pin]);

 return (
  <div className="min-h-screen bg-black text-white p-10">
    <h1 className="text-6xl font-bold mb-8">
      HOST SESSION
    </h1>

    <h2 className="text-4xl mb-10">
      PIN: {pin}
    </h2>

    <div>
      <h3 className="text-2xl mb-4">
        Players Joined:
      </h3>
      <div className="mt-4 space-y-2">
  {players.map((player: any, index: number) => (
    <div
      key={index}
      className="bg-zinc-800 px-4 py-2 rounded-xl text-xl"
    >
      {player.username}
    </div>
  ))}
</div>
      <button
  onClick={() => {
    ws?.send(
      JSON.stringify({
        type: "start_quiz",
      })
    );
  }}
  className="bg-green-600 px-6 py-3 rounded mt-6"
>
  Start Quiz
</button>

      <div className="mt-4 flex flex-col gap-2">
        {players.map((player, index) => (
          <div
            key={index}
            className="bg-purple-700 px-4 py-2 rounded w-fit"
          >
            {player}
          </div>
        ))}
      </div>
    </div>
  </div>
);
}
