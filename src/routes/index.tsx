import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { GameScreen } from "@/components/game/GameScreen";
import { SetupScreen } from "@/components/game/SetupScreen";
import type { Player } from "@/components/game/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Stairs & Snakes — roll the dice, race home" },
      {
        name: "description",
        content: "A playful stairs and snakes board game for up to 4 players and bots, right in your browser.",
      },
      { property: "og:title", content: "Stairs & Snakes" },
      {
        property: "og:description",
        content: "Roll the dice, climb the stairs, dodge the snakes. Play with friends or bots.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [players, setPlayers] = useState<Player[] | null>(null);
  const [round, setRound] = useState(0);

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-6 sm:py-10">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3 sm:mb-8">
        <h1 className="font-display text-4xl font-extrabold leading-none tracking-tight sm:text-6xl">
          Stairs <span className="text-primary">&amp;</span> Snakes
        </h1>
        <p className="max-w-xs font-mono text-xs text-muted-foreground sm:text-sm">
          First to reach cell 42 wins. Stairs lift you up, snakes drag you down.
        </p>
      </header>

      {players ? (
        <GameScreen key={round} players={players} onSetup={() => setPlayers(null)} />
      ) : (
        <SetupScreen
          onStart={(p) => {
            setPlayers(p);
            setRound((r) => r + 1);
          }}
        />
      )}
    </main>
  );
}
