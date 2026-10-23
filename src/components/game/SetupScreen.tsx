import { Bot, User, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { DEFAULT_NAMES, PLAYER_BG, type Player, type PlayerKind } from "./types";

type Slot = { name: string; kind: PlayerKind | "off" };

const INITIAL: Slot[] = [
  { name: DEFAULT_NAMES[0], kind: "human" },
  { name: DEFAULT_NAMES[1], kind: "bot" },
  { name: DEFAULT_NAMES[2], kind: "off" },
  { name: DEFAULT_NAMES[3], kind: "off" },
];

const KIND_OPTIONS: { kind: Slot["kind"]; label: string; Icon: typeof User }[] = [
  { kind: "human", label: "Player", Icon: User },
  { kind: "bot", label: "Bot", Icon: Bot },
  { kind: "off", label: "Off", Icon: X },
];

export function SetupScreen({ onStart }: { onStart: (players: Player[]) => void }) {
  const [slots, setSlots] = useState<Slot[]>(INITIAL);
  const active = slots.filter((s) => s.kind !== "off").length;

  const update = (i: number, patch: Partial<Slot>) =>
    setSlots((prev) => prev.map((s, j) => (j === i ? { ...s, ...patch } : s)));

  const start = () => {
    const players: Player[] = slots
      .map((s, id) => ({ ...s, id }))
      .filter((s): s is Slot & { id: number; kind: PlayerKind } => s.kind !== "off")
      .map((s) => ({ id: s.id, name: s.name.trim() || DEFAULT_NAMES[s.id] || `P${s.id + 1}`, kind: s.kind }));
    onStart(players);
  };

  return (
    <div className="panel mx-auto w-full max-w-xl p-5 sm:p-8 animate-pop-in">
      <h2 className="font-display text-2xl font-extrabold sm:text-3xl">Who's playing?</h2>
      <p className="mt-1 text-muted-foreground">Up to 4 players. Mix friends and bots.</p>

      <ul className="mt-6 space-y-3">
        {slots.map((slot, i) => (
          <li
            key={i}
            className={cn(
              "flex flex-col gap-3 rounded-xl border-[3px] border-ink bg-card p-3 sm:flex-row sm:items-center",
              slot.kind === "off" && "opacity-60",
            )}
          >
            <div className="flex flex-1 items-center gap-3">
              <span
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-[3px] border-ink font-display font-extrabold shadow-hard-sm",
                  PLAYER_BG[i],
                )}
              >
                {(slot.name || DEFAULT_NAMES[i] || "?").slice(0, 1).toUpperCase()}
              </span>
              <input
                value={slot.name}
                maxLength={14}
                disabled={slot.kind === "off"}
                onChange={(e) => update(i, { name: e.target.value })}
                aria-label={`Name for player ${i + 1}`}
                className="w-full min-w-0 rounded-lg border-2 border-ink/30 bg-paper px-3 py-2 font-display font-bold outline-none focus:border-ink"
              />
            </div>
            <div className="flex gap-1.5">
              {KIND_OPTIONS.map(({ kind, label, Icon }) => {
                const disabled = kind === "off" && i === 0;
                const selected = slot.kind === kind;
                return (
                  <button
                    key={kind}
                    type="button"
                    disabled={disabled}
                    onClick={() => update(i, { kind })}
                    aria-pressed={selected}
                    className={cn(
                      "flex items-center gap-1 rounded-lg border-2 border-ink px-2.5 py-1.5 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-30",
                      selected ? "bg-ink text-paper" : "bg-paper hover:bg-muted",
                    )}
                  >
                    <Icon className="h-4 w-4" /> {label}
                  </button>
                );
              })}
            </div>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={start}
        disabled={active < 1}
        className="btn-chunky mt-6 w-full bg-primary py-4 text-xl text-primary-foreground"
      >
        Start game
      </button>
    </div>
  );
}
