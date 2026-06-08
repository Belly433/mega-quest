import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/join")({
  component: JoinPage,
});

function JoinPage() {
  const navigate = useNavigate();

  const [pin, setPin] = useState("");
  const [username, setUsername] = useState("");

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="p-10 border rounded-3xl w-[400px] text-center bg-zinc-900">

        <h1 className="text-5xl font-bold mb-8">
          Join Game
        </h1>

        <input
  value={username}
  onChange={(e) => setUsername(e.target.value)}
  placeholder="Enter Username"
  className="w-full p-4 rounded-xl bg-zinc-800 border border-zinc-600 text-white placeholder:text-zinc-300 text-center text-xl mb-4"
/>

<input
  value={pin}
  onChange={(e) => setPin(e.target.value)}
  placeholder="Enter PIN"
  className="w-full p-4 rounded-xl bg-zinc-800 border border-zinc-600 text-white placeholder:text-zinc-300 text-center text-xl"
/>

        <button
          onClick={() => {

  if (!pin || !username) {
    alert("Please enter username and PIN");
    return;
  }

  fetch("http://127.0.0.1:8000/player/join", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      pin,
      username,
    }),
  });

  localStorage.setItem("username", username);

  navigate({
    to: "/quiz/$pin",
    params: { pin },
  });
}}
          className="w-full mt-5 p-4 bg-blue-500 rounded-xl text-xl font-bold"
        >
          Join
        </button>

      </div>
    </div>
  );
}