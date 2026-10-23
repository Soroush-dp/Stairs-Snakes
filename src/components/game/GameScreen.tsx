import { ArrowDown, ArrowUp, Bot, RotateCcw, Settings2, Trophy } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { applyRoll, GOAL, rollDie, START, type RollResult } from "@/lib/game";
import { cn } from "@/lib/utils";
import { Board } from "./Board";
import { Dice } from "./Dice";
import { PLAYER_BG, PLAYER_TEXT, type Player } from "./types";
import { WinOverlay } from "./WinOverlay";

type Phase = "idle" | "rolling" | "moving" | "won";
type LogEntry = RollResult & { player: number; key: number };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function GameScreen({ players, onSetup }: { players: Player[]; onSetup: () => void }) {
  const [positions, setPositions] = useState<number[]>(() => players.map(() => START));
  const [turn, setTurn] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");
  const [dice, setDice] = useState(1);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [jumping, setJumping] = useState<number | null>(null);
  const [highlight, setHighlight] = useState<number | null>(null);
  const [flash, setFlash] = useState<{ kind: "stairs" | "snake"; text: string } | null>(null);
  const [winner, setWinner] = useState<number | null>(null);

  const posRef = useRef(positions);
  posRef.current = positions;
  const gameId = useRef(0);
  const rollCount = useRef<number[]>(players.map(() => 0));

  const current = players[turn] ?? players[0]!;

  const roll = useCallback(async () => {
    if (phase !== "idle") return;
    const id = gameId.current;
    const alive = () => id === gameId.current;
    const who = turn;

    setPhase("rolling");
    setFlash(null);
    for (let i = 0; i < 9; i++) {
      setDice(rollDie());
      await sleep(65);
      if (!alive()) return;
    }
    const value = rollDie();
    setDice(value);
    rollCount.current[who] = (rollCount.current[who] ?? 0) + 1;
    await sleep(250);
    if (!alive()) return;

    const result = applyRoll(posRef.current[who] ?? START, value);
    setPhase("moving");
    for (const step of result.steps) {
      setPositions((p) => p.map((v, i) => (i === who ? step : v)));
      await sleep(210);
      if (!alive()) return;
    }

    if (result.jump) {
      setHighlight(result.landed);
      setFlash({
        kind: result.jump,
        text:
          result.jump === "stairs"
            ? `Stairs! Up from ${result.landed + 1} to ${result.final + 1}`
            : `Snake! Down from ${result.landed + 1} to ${result.final + 1}`,
      });
      await sleep(350);
      if (!alive()) return;
      setJumping(who);
      setPositions((p) => p.map((v, i) => (i === who ? result.final : v)));
      await sleep(750);
      if (!alive()) return;
      setJumping(null);
      setHighlight(null);
    }

    setLog((l) => [{ ...result, player: who, key: Date.now() + Math.random() }, ...l].slice(0, 30));

    if (result.won) {
      setWinner(who);
      setPhase("won");
      return;
    }
    setTurn((t) => (t + 1) % players.length);
    setPhase("idle");
  }, [phase, turn, players.length]);

  // Bots roll on their own.
  useEffect(() => {
    if (phase !== "idle" || current?.kind !== "bot") return;
    const t = setTimeout(roll, 800);
    return () => clearTimeout(t);
  }, [phase, current, roll]);

  // Enter / Space rolls, like the original "Press Enter to roll the Dice".
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "Enter" || e.key === " ") && current?.kind === "human" && phase === "idle") {
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag === "INPUT" || tag === "BUTTON") return;
        e.preventDefault();
        roll();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, phase, roll]);

  const restart = () => {
    gameId.current++;
    rollCount.current = players.map(() => 0);
    setPositions(players.map(() => START));
    setTurn(0);
    setPhase("idle");
    setDice(1);
    setLog([]);
    setJumping(null);
    setHighlight(null);
    setFlash(null);
    setWinner(null);
  };

  const humanTurn = current.kind === "human";
  const ranking = players
    .map((p, i) => ({ p, i, pos: positions[i] ?? START }))
    .sort((a, b) => b.pos - a.pos);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,560px)_minmax(0,1fr)] lg:items-start">
      <Board players={players} positions={positions} turn={turn} jumping={jumping} highlight={highlight} />

      <div className="flex flex-col gap-5">
        {/* Turn + dice */}
        <section className="panel p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-full border-[3px] border-ink font-display text-lg font-extrabold shadow-hard-sm",
                  PLAYER_BG[current.id],
                )}
              >
                {current.name.slice(0, 1).toUpperCase()}
              </span>
              <div>
                <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Now playing</p>
                <p className="font-display text-2xl font-extrabold leading-tight">
                  {current.name}
                  {current.kind === "bot" && <Bot className="ml-1.5 inline h-5 w-5 align-[-2px]" />}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={restart} className="btn-chunky h-10 w-10 bg-paper" aria-label="Restart game" title="Restart">
                <RotateCcw className="h-4 w-4" />
              </button>
              <button type="button" onClick={onSetup} className="btn-chunky h-10 w-10 bg-paper" aria-label="Change players" title="Change players">
                <Settings2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mt-5 flex items-center gap-5">
            <Dice value={dice} rolling={phase === "rolling"} />
            <div className="flex-1">
              <button
                type="button"
                onClick={roll}
                disabled={!humanTurn || phase !== "idle"}
                className="btn-chunky w-full bg-primary py-4 text-xl text-primary-foreground"
              >
                {phase === "rolling" ? "Rolling…" : phase === "moving" ? "Moving…" : humanTurn ? "Roll the dice" : "Bot is thinking…"}
              </button>
              <p className="mt-2 text-center font-mono text-xs text-muted-foreground">
                or press <kbd className="rounded border border-ink/40 bg-muted px-1">Enter</kbd>
              </p>
            </div>
          </div>

          <div className="mt-4 min-h-12">
            {flash && (
              <div
                key={flash.text}
                className={cn(
                  "flex items-center gap-2 rounded-xl border-[3px] border-ink px-3 py-2 font-display font-extrabold animate-pop-in",
                  flash.kind === "stairs" ? "bg-accent" : "bg-snake text-primary-foreground",
                )}
              >
                {flash.kind === "stairs" ? <ArrowUp className="h-5 w-5" /> : <ArrowDown className="h-5 w-5" />}
                {flash.text}
              </div>
            )}
          </div>
        </section>

        {/* Standings */}
        <section className="panel p-5">
          <h3 className="flex items-center gap-2 font-display text-lg font-extrabold">
            <Trophy className="h-5 w-5" /> Race to home
          </h3>
          <ul className="mt-3 space-y-3">
            {ranking.map(({ p, i, pos }) => (
              <li key={p.id} className="flex items-center gap-3">
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-ink text-sm font-extrabold",
                    PLAYER_BG[p.id],
                    i === turn && "ring-2 ring-ink ring-offset-2 ring-offset-paper",
                  )}
                >
                  {p.name.slice(0, 1).toUpperCase()}
                </span>
                <div className="flex-1">
                  <div className="flex justify-between text-sm font-bold">
                    <span>{p.name}</span>
                    <span className="font-mono">
                      {pos + 1}/{GOAL + 1}
                    </span>
                  </div>
                  <div className="mt-1 h-3 overflow-hidden rounded-full border-2 border-ink bg-muted">
                    <div
                      className={cn("h-full transition-[width] duration-300", PLAYER_BG[p.id])}
                      style={{ width: `${(pos / GOAL) * 100}%` }}
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Log */}
        <section className="panel p-5">
          <h3 className="font-display text-lg font-extrabold">Roll history</h3>
          {log.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">No rolls yet. Stairs lift you up, snakes drag you down.</p>
          ) : (
            <ol className="mt-3 max-h-56 space-y-1.5 overflow-y-auto pr-1 font-mono text-sm">
              {log.map((e) => {
                const p = players[e.player]!;
                return (
                  <li key={e.key} className="flex items-center gap-2">
                    <span className={cn("font-bold", PLAYER_TEXT[p.id])}>●</span>
                    <span className="font-bold">{p.name}</span>
                    <span className="text-muted-foreground">rolled</span>
                    <span className="rounded border border-ink bg-paper px-1.5 font-bold">{e.dice}</span>
                    <span className="text-muted-foreground">→</span>
                    <span className="font-bold">{e.final + 1}</span>
                    {e.jump === "stairs" && <span className="ml-auto text-xs font-bold uppercase">stairs ↑</span>}
                    {e.jump === "snake" && <span className="ml-auto text-xs font-bold uppercase text-snake">snake ↓</span>}
                    {e.won && <span className="ml-auto text-xs font-bold uppercase">home!</span>}
                  </li>
                );
              })}
            </ol>
          )}
        </section>
      </div>

      {winner !== null && (
        <WinOverlay
          winner={players[winner]!}
          rolls={rollCount.current[winner] ?? 0}
          onAgain={restart}
          onSetup={onSetup}
        />
      )}
    </div>
  );
}
