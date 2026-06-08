import { createFileRoute, redirect } from "@tanstack/react-router";

// Old quiz page — players now use /play/$pin instead
export const Route = createFileRoute("/quiz/$pin")({
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/play/$pin", params: { pin: params.pin } });
  },
  component: () => null,
});
