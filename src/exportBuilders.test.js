import { describe, it, expect } from "vitest";
import { buildKnittingHTML, buildSpinningHTML } from "./exportBuilders.js";
import { createGrid } from "./utils.js";

const STITCHES = [
  { id: "empty", label: "Empty", abbr: "", symbol: "" },
  { id: "knit", label: "Knit", abbr: "K", symbol: "□" },
  { id: "purl", label: "Purl", abbr: "P", symbol: "−" },
];

function project(overrides = {}) {
  return {
    name: "Test Scarf",
    yarn: "Merino",
    needles: "4mm",
    status: "Active",
    created: "2024-01-01",
    notes: "",
    yarnPalette: [],
    ...overrides,
  };
}

function section(overrides = {}) {
  return {
    name: "Main Pattern",
    rows: 2,
    cols: 2,
    grid: createGrid(2, 2),
    currentRow: 1,
    completedRows: [],
    ...overrides,
  };
}

describe("buildKnittingHTML", () => {
  it("produces a full HTML document naming the project", () => {
    const html = buildKnittingHTML(project(), section(), STITCHES, "");
    expect(html).toMatch(/^<!DOCTYPE html>/);
    expect(html).toContain("<title>Test Scarf</title>");
    expect(html).toContain(">Test Scarf<");
  });

  it("only includes stitches actually used in the grid, not the full stitch list", () => {
    const grid = createGrid(1, 2);
    grid[0][0].stitch = "knit";
    grid[0][1].stitch = "empty";
    const html = buildKnittingHTML(project(), section({ rows: 1, cols: 2, grid }), STITCHES, "");
    expect(html).toContain("K — Knit");
    expect(html).not.toContain("P — Purl");
  });

  it("includes the yarn palette", () => {
    const html = buildKnittingHTML(
      project({ yarnPalette: [{ id: "y1", name: "CA – Black", color: "#1a1a1a" }] }),
      section(), STITCHES, ""
    );
    expect(html).toContain("CA – Black");
    expect(html).toContain("#1a1a1a");
  });

  it("includes notes only when present", () => {
    const withNotes = buildKnittingHTML(project({ notes: "Watch row 5" }), section(), STITCHES, "");
    expect(withNotes).toContain("Watch row 5");
    const withoutNotes = buildKnittingHTML(project({ notes: "" }), section(), STITCHES, "");
    expect(withoutNotes).not.toContain("Notes</div>");
  });

  it("includes the attribution line only when given one", () => {
    const withCp = buildKnittingHTML(project(), section(), STITCHES, "Designed by Ellen");
    expect(withCp).toContain("Designed by Ellen");
    const withoutCp = buildKnittingHTML(project(), section(), STITCHES, "");
    expect(withoutCp).not.toContain("Designed by Ellen");
  });

  it("labels non-main sections with their name and dimensions", () => {
    const html = buildKnittingHTML(project(), section({ name: "Sleeve", rows: 3, cols: 4 }), STITCHES, "");
    expect(html).toContain("Section: Sleeve");
  });
});

function spin(overrides = {}) {
  return {
    name: "Merino Single",
    created: "2024-01-01",
    status: "Active",
    fiberType: "Merino",
    fiberWeight: 100,
    log: [],
    photos: [],
    notes: "",
    ...overrides,
  };
}

describe("buildSpinningHTML", () => {
  it("produces a full HTML document naming the project", () => {
    const html = buildSpinningHTML(spin(), "");
    expect(html).toMatch(/^<!DOCTYPE html>/);
    expect(html).toContain("Merino Single");
  });

  it("calculates washed and prepared yield percentages", () => {
    const html = buildSpinningHTML(spin({ washedWeight: 80, preparedWeight: 40 }), "");
    expect(html).toContain("80%"); // washed yield: 80/100
    expect(html).toContain("50%"); // prepared yield: 40/80
  });

  it("shows a blend when multiple fibers are given, a single type otherwise", () => {
    const blend = buildSpinningHTML(spin({ fibers: [{ type: "Merino", pct: 70 }, { type: "Silk", pct: 30 }] }), "");
    expect(blend).toContain("BLEND");
    expect(blend).toContain("70%");
    const single = buildSpinningHTML(spin({ fiberType: "Merino" }), "");
    expect(single).toContain("TYPE");
    expect(single).toContain("Merino");
  });

  it("includes the work log table only when there are log entries", () => {
    const withLog = buildSpinningHTML(spin({ log: [{ date: "2024-01-02", hours: 2, gSpun: 50, note: "Started" }] }), "");
    expect(withLog).toContain("Work Log");
    expect(withLog).toContain("Started");
    const withoutLog = buildSpinningHTML(spin({ log: [] }), "");
    expect(withoutLog).not.toContain("Work Log");
  });

  it("includes notes only when present", () => {
    const withNotes = buildSpinningHTML(spin({ notes: "Slightly overtwisted" }), "");
    expect(withNotes).toContain("Slightly overtwisted");
    const withoutNotes = buildSpinningHTML(spin({ notes: "" }), "");
    expect(withoutNotes).not.toContain("Notes</div>");
  });
});
