import { describe, it, expect } from "vitest";
import {
  createGrid,
  newId,
  today,
  contrastText,
  hexToRgba,
  formatFlexDate,
  parsePurchaseDate,
  makeSection,
  extractSelection,
  rotateCW,
  flipH,
  flipV,
  migrateSection,
  migrateProject,
  fiberDisplay,
} from "./utils.js";

describe("createGrid", () => {
  it("creates the requested number of rows and columns of empty cells", () => {
    const grid = createGrid(2, 3);
    expect(grid).toHaveLength(2);
    grid.forEach((row) => {
      expect(row).toHaveLength(3);
      row.forEach((cell) => expect(cell).toEqual({ stitch: "empty", yarn: null }));
    });
  });

  it("gives every cell its own object, so editing one never affects another", () => {
    const grid = createGrid(2, 2);
    grid[0][0].stitch = "knit";
    expect(grid[0][1].stitch).toBe("empty");
    expect(grid[1][0].stitch).toBe("empty");
  });
});

describe("newId", () => {
  it("returns a non-empty string", () => {
    expect(typeof newId()).toBe("string");
    expect(newId().length).toBeGreaterThan(0);
  });

  it("doesn't repeat across many calls", () => {
    const ids = new Set(Array.from({ length: 1000 }, () => newId()));
    expect(ids.size).toBe(1000);
  });
});

describe("today", () => {
  it("returns today's date as YYYY-MM-DD", () => {
    expect(today()).toBe(new Date().toISOString().slice(0, 10));
    expect(today()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("contrastText", () => {
  it("picks dark text for light backgrounds", () => {
    expect(contrastText("#ffffff")).toBe("#222");
  });

  it("picks light text for dark backgrounds", () => {
    expect(contrastText("#000000")).toBe("#fff");
  });

  it("falls back to black when no color is given", () => {
    expect(contrastText(null)).toBe("#000");
    expect(contrastText(undefined)).toBe("#000");
    expect(contrastText("")).toBe("#000");
  });
});

describe("hexToRgba", () => {
  it("converts a hex color and alpha into an rgba() string", () => {
    expect(hexToRgba("#ff0000", 0.5)).toBe("rgba(255,0,0,0.5)");
    expect(hexToRgba("#000000", 1)).toBe("rgba(0,0,0,1)");
  });
});

describe("formatFlexDate", () => {
  it("returns an empty string for no date", () => {
    expect(formatFlexDate("")).toBe("");
    expect(formatFlexDate(null)).toBe("");
  });

  it("returns just the year when only a year is given", () => {
    expect(formatFlexDate("2024")).toBe("2024");
  });

  it("returns 'Month Year' when only year and month are given", () => {
    expect(formatFlexDate("2024-03")).toBe("March 2024");
  });

  it("returns 'D Month Year' when a full date is given", () => {
    expect(formatFlexDate("2024-03-05")).toBe("5 March 2024");
  });
});

describe("parsePurchaseDate", () => {
  it("returns empty parts for no date", () => {
    expect(parsePurchaseDate("")).toEqual({ y: "", m: "", day: "" });
    expect(parsePurchaseDate(null)).toEqual({ y: "", m: "", day: "" });
  });

  it("splits a full date into year, month, day", () => {
    expect(parsePurchaseDate("2024-03-05")).toEqual({ y: "2024", m: "03", day: "05" });
  });

  it("fills in missing parts with empty strings", () => {
    expect(parsePurchaseDate("2024")).toEqual({ y: "2024", m: "", day: "" });
  });
});

describe("makeSection", () => {
  it("uses sensible defaults", () => {
    const s = makeSection();
    expect(s.name).toBe("Section 1");
    expect(s.rows).toBe(20);
    expect(s.cols).toBe(30);
    expect(s.currentRow).toBe(19);
    expect(s.grid).toHaveLength(20);
    expect(s.grid[0]).toHaveLength(30);
  });

  it("respects custom name/rows/cols", () => {
    const s = makeSection("Sleeve", 5, 10);
    expect(s.name).toBe("Sleeve");
    expect(s.rows).toBe(5);
    expect(s.cols).toBe(10);
    expect(s.currentRow).toBe(4);
    expect(s.grid).toHaveLength(5);
    expect(s.grid[0]).toHaveLength(10);
  });

  it("gives each section its own id", () => {
    expect(makeSection().id).not.toBe(makeSection().id);
  });
});

function cellGrid(rows) {
  return rows.map((row) => row.map((v) => ({ stitch: v, yarn: null })));
}
function symbols(cells) {
  return cells.map((row) => row.map((c) => c.stitch));
}

describe("extractSelection", () => {
  const grid = cellGrid([
    ["A", "B", "C"],
    ["D", "E", "F"],
    ["G", "H", "I"],
  ]);

  it("extracts the rectangle between two corners", () => {
    const result = extractSelection(grid, { r1: 0, c1: 0, r2: 1, c2: 1 });
    expect(symbols(result.cells)).toEqual([
      ["A", "B"],
      ["D", "E"],
    ]);
  });

  it("normalizes the selection when corners are given in reverse order", () => {
    const result = extractSelection(grid, { r1: 1, c1: 1, r2: 0, c2: 0 });
    expect(result).toMatchObject({ r1: 0, r2: 1, c1: 0, c2: 1 });
    expect(symbols(result.cells)).toEqual([
      ["A", "B"],
      ["D", "E"],
    ]);
  });

  it("returns a deep copy — editing the result never touches the original grid", () => {
    const result = extractSelection(grid, { r1: 0, c1: 0, r2: 0, c2: 0 });
    result.cells[0][0].stitch = "changed";
    expect(grid[0][0].stitch).toBe("A");
  });
});

describe("rotateCW", () => {
  it("rotates a grid 90 degrees clockwise", () => {
    const cells = cellGrid([
      ["A", "B", "C"],
      ["D", "E", "F"],
    ]);
    expect(symbols(rotateCW(cells))).toEqual([
      ["D", "A"],
      ["E", "B"],
      ["F", "C"],
    ]);
  });
});

describe("flipH", () => {
  it("mirrors each row left-to-right", () => {
    const cells = cellGrid([
      ["A", "B", "C"],
      ["D", "E", "F"],
    ]);
    expect(symbols(flipH(cells))).toEqual([
      ["C", "B", "A"],
      ["F", "E", "D"],
    ]);
  });
});

describe("flipV", () => {
  it("mirrors the rows top-to-bottom", () => {
    const cells = cellGrid([
      ["A", "B", "C"],
      ["D", "E", "F"],
    ]);
    expect(symbols(flipV(cells))).toEqual([
      ["D", "E", "F"],
      ["A", "B", "C"],
    ]);
  });
});

describe("migrateSection", () => {
  it("fills in fields introduced after older saves were created", () => {
    const old = { id: "s1", name: "Old Section", rows: 10, cols: 10 };
    const migrated = migrateSection(old);
    expect(migrated.id).toBe("s1");
    expect(migrated.rowNotes).toEqual({});
    expect(migrated.mistakeMarkers).toEqual({});
    expect(migrated.stitchMarkers).toEqual([]);
    expect(migrated.completedRows).toEqual([]);
  });

  it("never overwrites data that's already present", () => {
    const s = { id: "s1", rowNotes: { 0: "cast on here" }, completedRows: [0, 1] };
    const migrated = migrateSection(s);
    expect(migrated.rowNotes).toEqual({ 0: "cast on here" });
    expect(migrated.completedRows).toEqual([0, 1]);
  });
});

describe("migrateProject", () => {
  it("fills in defaults for a bare-bones old project", () => {
    const migrated = migrateProject({ id: "p1", name: "Old Project" });
    expect(migrated.yarnPalette).toEqual([]);
    expect(migrated.photos).toEqual([]);
    expect(migrated.log).toEqual([]);
    expect(migrated.notes).toBe("");
    expect(migrated.sections).toEqual([]);
  });

  it("migrates every section inside the project too", () => {
    const migrated = migrateProject({
      id: "p1",
      sections: [{ id: "s1" }, { id: "s2" }],
    });
    expect(migrated.sections).toHaveLength(2);
    migrated.sections.forEach((s) => expect(s.rowNotes).toEqual({}));
  });

  it("never overwrites data that's already present", () => {
    const migrated = migrateProject({ id: "p1", notes: "keep me", sections: [] });
    expect(migrated.notes).toBe("keep me");
  });
});

describe("fiberDisplay", () => {
  it("joins a multi-fibre blend, showing each percentage", () => {
    const p = { fibers: [{ type: "Merino", pct: 70 }, { type: "Silk", pct: 30 }] };
    expect(fiberDisplay(p)).toBe("70% Merino / 30% Silk");
  });

  it("omits the percentage for a fibre that makes up the whole thing", () => {
    expect(fiberDisplay({ fibers: [{ type: "Merino", pct: 100 }] })).toBe("Merino");
  });

  it("falls back to the legacy fiberType field when there's no fibers array", () => {
    expect(fiberDisplay({ fiberType: "Corriedale" })).toBe("Corriedale");
  });

  it("prefers the fibers array over the legacy field when both exist", () => {
    const p = { fibers: [{ type: "Alpaca", pct: 100 }], fiberType: "Merino" };
    expect(fiberDisplay(p)).toBe("Alpaca");
  });

  it("returns an empty string when there's no fibre data at all", () => {
    expect(fiberDisplay({})).toBe("");
    expect(fiberDisplay({ fibers: [] })).toBe("");
    expect(fiberDisplay({ fiberType: "" })).toBe("");
  });

  it("skips blank entries in a blend rather than leaving stray separators", () => {
    const p = { fibers: [{ type: "Merino", pct: 100 }, { type: "", pct: 100 }] };
    expect(fiberDisplay(p)).toBe("Merino");
  });
});
