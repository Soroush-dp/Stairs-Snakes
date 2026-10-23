import { Crown, Flag } from "lucide-react";
import { useMemo } from "react";
import {
  CELL_COUNT,
  cellCenter,
  cellToGrid,
  cellsInScreenOrder,
  COLS,
  GOAL,
  ROWS,
  SNAKES,
  START,
  STAIRS,
} from "@/lib/game";
import { cn } from "@/lib/utils";
import type { Player } from "./types";
import { PLAYER_BG } from "./types";

const W = COLS * 100;
const H = ROWS * 100;

function snakePath(head: { x: number; y: number }, tail: { x: number; y: number }) {
  const dx = tail.x - head.x;
  const dy = tail.y - head.y;
  const len = Math.hypot(dx, dy);
  const nx = -dy / len;
  const ny = dx / len;
  const waves = Math.max(1.5, len / 140);
  const amp = 26;
  const pts: string[] = [];
  const N = 60;
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const taper = Math.sin(Math.PI * Math.min(1, t * 1.3));
    const off = Math.sin(t * waves * Math.PI * 2) * amp * taper;
    pts.push(`${(head.x + dx * t + nx * off).toFixed(1)},${(head.y + dy * t + ny * off).toFixed(1)}`);
  }
  return `M${pts.join(" L")}`;
}

function Snake({ from, to }: { from: number; to: number }) {
  const head = cellCenter(from);
  const tail = cellCenter(to);
  const d = snakePath(head, tail);
  const angle = (Math.atan2(tail.y - head.y, tail.x - head.x) * 180) / Math.PI + 180;
  return (
    <g>
      <path d={d} fill="none" stroke="var(--ink)" strokeWidth={28} strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} fill="none" stroke="var(--snake)" strokeWidth={20} strokeLinecap="round" strokeLinejoin="round" />
      <path
        d={d}
        fill="none"
        stroke="var(--snake-stripe)"
        strokeWidth={20}
        strokeDasharray="6 22"
        strokeLinejoin="round"
      />
      <g transform={`translate(${head.x} ${head.y}) rotate(${angle})`}>
        <path d="M 28 0 L 44 -6 M 28 0 L 44 6" stroke="var(--snake)" strokeWidth={4} strokeLinecap="round" />
        <ellipse cx={0} cy={0} rx={30} ry={22} fill="var(--snake)" stroke="var(--ink)" strokeWidth={4} />
        <circle cx={12} cy={-9} r={6} fill="var(--paper)" stroke="var(--ink)" strokeWidth={2.5} />
        <circle cx={12} cy={9} r={6} fill="var(--paper)" stroke="var(--ink)" strokeWidth={2.5} />
        <circle cx={14} cy={-9} r={2.6} fill="var(--ink)" />
        <circle cx={14} cy={9} r={2.6} fill="var(--ink)" />
      </g>
    </g>
  );
}

function Stairs({ from, to }: { from: number; to: number }) {
  const a = cellCenter(from);
  const b = cellCenter(to);
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy);
  const ux = dx / len;
  const uy = dy / len;
  const nx = -uy * 18;
  const ny = ux * 18;
  const inset = 12;
  const s = { x: a.x - ux * inset, y: a.y - uy * inset };
  const e = { x: b.x + ux * inset, y: b.y + uy * inset };
  const rungs: { x: number; y: number }[] = [];
  const count = Math.floor((len + inset * 2) / 34);
  for (let i = 1; i < count; i++) {
    const t = i / count;
    rungs.push({ x: s.x + (e.x - s.x) * t, y: s.y + (e.y - s.y) * t });
  }
  const rail = (sign: 1 | -1) =>
    `M${s.x + nx * sign},${s.y + ny * sign} L${e.x + nx * sign},${e.y + ny * sign}`;
  return (
    <g strokeLinecap="round">
      {rungs.map((r, i) => (
        <g key={i}>
          <line x1={r.x + nx} y1={r.y + ny} x2={r.x - nx} y2={r.y - ny} stroke="var(--ink)" strokeWidth={11} />
          <line x1={r.x + nx} y1={r.y + ny} x2={r.x - nx} y2={r.y - ny} stroke="var(--gold)" strokeWidth={5} />
        </g>
      ))}
      {[1, -1].map((sg) => (
        <g key={sg}>
          <path d={rail(sg as 1 | -1)} stroke="var(--ink)" strokeWidth={14} />
          <path d={rail(sg as 1 | -1)} stroke="var(--ladder)" strokeWidth={7} />
        </g>
      ))}
    </g>
  );
}

const TOKEN_OFFSETS: Record<number, [number, number][]> = {
  1: [[0, 0]],
  2: [[-22, -12], [22, 12]],
  3: [[-22, -16], [22, -16], [0, 18]],
  4: [[-20, -20], [20, -20], [-20, 20], [20, 20]],
};

interface BoardProps {
  players: Player[];
  positions: number[];
  turn: number;
  jumping: number | null;
  highlight: number | null;
}

export function Board({ players, positions, turn, jumping, highlight }: BoardProps) {
  const order = useMemo(() => cellsInScreenOrder(), []);

  const tokens = players.map((p, i) => {
    const cell = positions[i] ?? START;
    const sameCell = players.map((_, j) => j).filter((j) => positions[j] === cell);
    const offsets = TOKEN_OFFSETS[sameCell.length] ?? [[0, 0]];
    const [ox, oy] = offsets[sameCell.indexOf(i)] ?? [0, 0];
    const { x, y } = cellCenter(cell);
    return { p, i, left: ((x + ox) / W) * 100, top: ((y + oy) / H) * 100 };
  });

  return (
    <div className="panel relative w-full overflow-hidden p-2 sm:p-3">
      <div className="relative aspect-[6/7] w-full overflow-hidden rounded-xl border-[3px] border-ink">
        <div className="grid h-full w-full grid-cols-6 grid-rows-7">
          {order.map((cell) => {
            const { row, col } = cellToGrid(cell);
            const isStart = cell === START;
            const isGoal = cell === GOAL;
            return (
              <div
                key={cell}
                className={cn(
                  "relative border-ink/25",
                  col < COLS - 1 && "border-r",
                  row < ROWS - 1 && "border-b",
                  (row + col) % 2 === 0 ? "bg-cell-a" : "bg-cell-b",
                  isGoal && "bg-gold",
                  isStart && "bg-accent",
                  highlight === cell && "ring-4 ring-inset ring-primary",
                )}
              >
                <span className="absolute left-1.5 top-1 font-mono text-[10px] font-bold text-ink/60 sm:text-xs">
                  {cell + 1}
                </span>
                {isGoal && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <Crown className="h-1/3 w-1/3 animate-wiggle text-ink" strokeWidth={2.5} />
                    <span className="font-display text-[9px] font-extrabold uppercase tracking-wider sm:text-xs">
                      Home
                    </span>
                  </div>
                )}
                {isStart && (
                  <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
                    <Flag className="h-1/4 w-1/4 text-ink" strokeWidth={2.5} />
                    <span className="font-display text-[9px] font-extrabold uppercase tracking-wider sm:text-xs">
                      Start
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="pointer-events-none absolute inset-0 h-full w-full"
          aria-hidden
        >
          {Object.entries(STAIRS).map(([f, t]) => (
            <Stairs key={`s${f}`} from={Number(f)} to={t} />
          ))}
          {Object.entries(SNAKES).map(([f, t]) => (
            <Snake key={`n${f}`} from={Number(f)} to={t} />
          ))}
        </svg>

        {tokens.map(({ p, i, left, top }) => (
          <div
            key={p.id}
            aria-label={`${p.name} on cell ${(positions[i] ?? START) + 1}`}
            className={cn(
              "absolute z-10 flex aspect-square w-[11%] items-center justify-center rounded-full border-[3px] border-ink font-display text-xs font-extrabold text-ink shadow-hard-sm sm:text-sm",
              PLAYER_BG[p.id],
              jumping === i
                ? "transition-[left,top] duration-700 ease-in-out"
                : "transition-[left,top] duration-200 ease-out",
              i === turn ? "animate-token-bob z-20" : "-translate-x-1/2 -translate-y-1/2",
            )}
            style={{ left: `${left}%`, top: `${top}%` }}
          >
            {p.name.slice(0, 1).toUpperCase()}
          </div>
        ))}
      </div>
      <span className="sr-only">{CELL_COUNT} cell board</span>
    </div>
  );
}
