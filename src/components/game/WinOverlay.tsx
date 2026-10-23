import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { PLAYER_BG, type Player } from "./types";

const CONFETTI = ["bg-p1", "bg-p2", "bg-p3", "bg-p4", "bg-ink"];

export function WinOverlay({
  winner,
  rolls,
  onAgain,
  onSetup,
}: {
  winner: Player;
  rolls: number;
  onAgain: () => void;
  onSetup: () => void;
}) {
  const pieces = useMemo(
    () =>
      Array.from({ length: 60 }).map((_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 1.2,
        duration: 2.4 + Math.random() * 2,
        size: 8 + Math.random() * 10,
        color: CONFETTI[i % CONFETTI.length],
        round: i % 3 === 0,
      })),
    [],
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {pieces.map((c, i) => (
          <span
            key={i}
            className={cn("absolute -top-6 animate-confetti border border-ink", c.color, c.round && "rounded-full")}
            style={{
              left: `${c.left}%`,
              width: c.size,
              height: c.size * (c.round ? 1 : 0.6),
              animationDelay: `${c.delay}s`,
              animationDuration: `${c.duration}s`,
            }}
          />
        ))}
      </div>

      <div className="panel relative w-full max-w-sm p-6 text-center animate-pop-in">
        <div
          className={cn(
            "mx-auto -mt-14 flex h-20 w-20 items-center justify-center rounded-full border-[3px] border-ink font-display text-3xl font-extrabold shadow-hard",
            PLAYER_BG[winner.id],
          )}
        >
          {winner.name.slice(0, 1).toUpperCase()}
        </div>
        <pre className="mx-auto mt-5 inline-block text-left font-mono text-sm font-bold leading-tight" aria-hidden>
{` ___________
|           |
| -You win- |
|___________|`}
        </pre>
        <h2 className="mt-3 font-display text-3xl font-extrabold">{winner.name} made it home!</h2>
        <p className="mt-1 text-muted-foreground">in {rolls} rolls</p>
        <div className="mt-6 grid gap-3">
          <button type="button" onClick={onAgain} className="btn-chunky bg-primary py-3 text-lg text-primary-foreground">
            Play again
          </button>
          <button type="button" onClick={onSetup} className="btn-chunky bg-paper py-3 text-lg">
            Change players
          </button>
        </div>
      </div>
    </div>
  );
}
