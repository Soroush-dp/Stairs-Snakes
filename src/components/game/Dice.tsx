import { cn } from "@/lib/utils";

// 3x3 pip grid indices (0..8) for each face.
const FACES: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

export function Dice({ value, rolling }: { value: number; rolling: boolean }) {
  const pips = FACES[value] ?? [4];
  return (
    <div
      role="img"
      aria-label={`Dice showing ${value}`}
      className={cn(
        "grid aspect-square w-24 grid-cols-3 grid-rows-3 gap-1 rounded-2xl border-[3px] border-ink bg-paper p-3 shadow-hard sm:w-28",
        rolling && "animate-dice-shake",
      )}
    >
      {Array.from({ length: 9 }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "m-auto aspect-square w-full rounded-full",
            pips.includes(i) ? "bg-ink" : "bg-transparent",
          )}
        />
      ))}
    </div>
  );
}
