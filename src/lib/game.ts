// Core rules of Stairs & Snakes, ported from the original Stairs_Snake.py.
// Board: 42 cells (0..41), 6 columns x 7 rows, zig-zag from bottom-left.

export const COLS = 6;
export const ROWS = 7;
export const CELL_COUNT = COLS * ROWS; // 42
export const START = 0;
export const GOAL = CELL_COUNT - 1; // 41

/** Stairs (ladders): bottom -> top */
export const STAIRS: Record<number, number> = { 2: 13, 12: 25, 18: 31 };
/** Snakes: head -> tail */
export const SNAKES: Record<number, number> = { 37: 20, 27: 1, 15: 3 };

export type JumpKind = "stairs" | "snake";

export interface RollResult {
  from: number;
  dice: number;
  /** Cells walked through one by one, ending on the landed cell. */
  steps: number[];
  /** Cell the dice landed on before any stairs/snake. */
  landed: number;
  /** Final cell after stairs/snake. */
  final: number;
  jump: JumpKind | null;
  won: boolean;
}

export function applyRoll(from: number, dice: number): RollResult {
  const target = from + dice;
  if (target >= GOAL) {
    const steps: number[] = [];
    for (let c = from + 1; c <= GOAL; c++) steps.push(c);
    return { from, dice, steps, landed: GOAL, final: GOAL, jump: null, won: true };
  }
  const steps: number[] = [];
  for (let c = from + 1; c <= target; c++) steps.push(c);
  let final = target;
  let jump: JumpKind | null = null;
  if (STAIRS[target] !== undefined) {
    final = STAIRS[target];
    jump = "stairs";
  } else if (SNAKES[target] !== undefined) {
    final = SNAKES[target];
    jump = "snake";
  }
  return { from, dice, steps, landed: target, final, jump, won: false };
}

export function rollDie(): number {
  return Math.floor(Math.random() * 6) + 1;
}

/** Grid position of a cell. row 0 is the TOP row on screen. */
export function cellToGrid(cell: number): { row: number; col: number } {
  const rowFromBottom = Math.floor(cell / COLS);
  const inRow = cell % COLS;
  const col = rowFromBottom % 2 === 0 ? inRow : COLS - 1 - inRow;
  return { row: ROWS - 1 - rowFromBottom, col };
}

/** Cell center in board units (each cell = 100 x 100). */
export function cellCenter(cell: number): { x: number; y: number } {
  const { row, col } = cellToGrid(cell);
  return { x: col * 100 + 50, y: row * 100 + 50 };
}

/** Cells in on-screen order (top-left to bottom-right). */
export function cellsInScreenOrder(): number[] {
  const out: number[] = [];
  for (let row = 0; row < ROWS; row++) {
    const rowFromBottom = ROWS - 1 - row;
    for (let col = 0; col < COLS; col++) {
      const inRow = rowFromBottom % 2 === 0 ? col : COLS - 1 - col;
      out.push(rowFromBottom * COLS + inRow);
    }
  }
  return out;
}
