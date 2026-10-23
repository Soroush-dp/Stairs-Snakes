export type PlayerKind = "human" | "bot";

export interface Player {
  /** 0..3 — also selects the player's color */
  id: number;
  name: string;
  kind: PlayerKind;
}

export const PLAYER_BG = ["bg-p1", "bg-p2", "bg-p3", "bg-p4"] as const;
export const PLAYER_TEXT = ["text-p1", "text-p2", "text-p3", "text-p4"] as const;
export const DEFAULT_NAMES = ["Red", "Blue", "Green", "Sunny"] as const;
