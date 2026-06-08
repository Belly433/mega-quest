import { createFileRoute, useParams } from "@tanstack/react-router";
import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/play/$pin")({
  component: PlayPage,
});

function PlayPage() {
    const navigate = useNavigate();
  const { pin } = useParams({ strict: false });

  useEffect(() => {

  const socket = new WebSocket(
    `ws://127.0.0.1:8000/session/ws/${pin}`
  );

  socket.onopen = () => {

    socket.send(
      JSON.stringify({
        type: "join",
        player: name,
      })
    );
  };

  socket.onmessage = (event) => {

    const data = JSON.parse(event.data);

    if (data.type === "start_quiz") {

      window.location.href = `/quiz/${pin}`;
    }
  };

  return () => socket.close();

}, [pin, name]);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <h1 className="text-5xl font-bold">
        Connected to game {pin}
      </h1>
    </div>
  );
  
}