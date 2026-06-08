import { createFileRoute, redirect } from "@tanstack/react-router";

// Legacy route — redirect to play page
export const Route = createFileRoute("/player/$pin")({
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/play/$pin", params: { pin: params.pin } });
  },
  component: () => null,
});
