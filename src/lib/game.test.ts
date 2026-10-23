import { describe, expect, it } from "vitest";
import { applyRoll, cellToGrid, cellsInScreenOrder, GOAL } from "./game";

describe("stairs", () => {
  it("2 climbs to 13", () => expect(applyRoll(0, 2).final).toBe(13));
  it("12 climbs to 25", () => expect(applyRoll(8, 4).final).toBe(25));
  it("18 climbs to 31", () => expect(applyRoll(14, 4).final).toBe(31));
});

describe("snakes", () => {
  it("37 slides to 20", () => expect(applyRoll(33, 4).final).toBe(20));
  it("27 slides to 1", () => expect(applyRoll(23, 4).final).toBe(1));
  it("15 slides to 3", () => expect(applyRoll(10, 5).final).toBe(3));
});

describe("winning", () => {
  it("reaching cell 41 wins", () => {
    const r = applyRoll(35, 6);
    expect(r.won).toBe(true);
    expect(r.final).toBe(41);
  });
  it("overshooting 41 still wins", () => {
    expect(applyRoll(39, 6).won).toBe(true);
  });
  it("landing below 41 does not win", () => {
    expect(applyRoll(34, 6).won).toBe(false);
  });
});

describe("movement", () => {
  it("plain cell keeps the landed position", () => {
    const r = applyRoll(4, 1);
    expect(r.final).toBe(5);
    expect(r.jump).toBeNull();
    expect(r.steps).toEqual([5]);
  });
  it("landing on a stairs top does nothing", () => {
    expect(applyRoll(9, 4).final).toBe(13);
  });
});

describe("board layout", () => {
  it("start is bottom-left, goal is top-right", () => {
    expect(cellToGrid(0)).toEqual({ row: 6, col: 0 });
    expect(cellToGrid(GOAL)).toEqual({ row: 0, col: 5 });
  });
  it("rows zig-zag: 6 sits above 5", () => {
    expect(cellToGrid(6)).toEqual({ row: 5, col: 5 });
  });
  it("top row matches the original print order", () => {
    expect(cellsInScreenOrder().slice(0, 12)).toEqual([
      36, 37, 38, 39, 40, 41, 35, 34, 33, 32, 31, 30,
    ]);
  });
});
