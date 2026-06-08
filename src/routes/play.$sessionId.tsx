import { createFileRoute, redirect } from "@tanstack/react-router";

// This route is superseded by /play/$pin — redirect legacy URLs
export const Route = createFileRoute("/play/$sessionId")({
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/play/$pin", params: { pin: params.sessionId } });
  },
  component: () => null,
});
