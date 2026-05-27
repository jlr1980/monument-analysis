// Prepare iteration data for the Simulator's Mode 1 (pre-computed view).
//
// Reads the four iteration CSVs from the Monument project's simulation/outputs/
// directory, drops columns that aren't visualization-relevant, rounds numbers
// to reasonable precision, converts booleans to 0/1, and writes a single
// columnar JSON file to public/iteration-data.json.
//
// Columnar layout (per-scenario arrays of values per column) is more compact
// than array-of-objects: no repeated keys, smaller commas-and-brackets
// overhead, gzips well in transit.
//
// Run from the hub repo root:
//   node scripts/prepare-iteration-data.mjs

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const HUB_ROOT = join(__dirname, "..");
const SOURCE_DIR = "C:/Users/jeffr/OneDrive/Documents/Monument/simulation/outputs";
const OUT_PATH = join(HUB_ROOT, "public", "iteration-data.json");

const SCENARIOS = [
  { id: "base", file: "base_iterations.csv", label: "Base" },
  { id: "staged", file: "staged_iterations.csv", label: "Staged" },
  { id: "compact", file: "compact_iterations.csv", label: "Compact" },
  { id: "conservation", file: "conservation_iterations.csv", label: "Conservation" },
];

// Columns we keep. Order matches the columnar schema below.
const INPUT_COLS = [
  "snowpack",
  "sales_velocity_factor",
  "tax_realization",
  "entitlement_delay_months",
  "foundation_yield_drawn",
];

const OUTPUT_COLS = [
  "xirr",
  "moic",
  "foundation_end",
  "net_profit",
  "realized_tax_benefit",
];

const SURV_COLS = [
  "surv_irr_12pct",
  "surv_foundation_target",
  "surv_debt_retired",
  "surv_scope_maintained",
  "surv_all",
];

const OBJ_COLS = [
  "obj_irr_20pct",
  "obj_moic_2x",
  "obj_foundation_80M",
  "obj_debt_retired",
  "obj_scope_maintained",
  "obj_dues_coverage",
  "obj_all",
];

// Rounding rules. Most values are floats with too many digits.
function roundFor(col, value) {
  if (value === "" || value === null || value === undefined) return null;
  if (!isFinite(value)) return null;
  // Booleans are handled separately; here we only see numeric columns.
  if (col === "xirr" || col === "moic") return +value.toFixed(4);
  if (col === "snowpack" || col === "sales_velocity_factor" || col === "tax_realization" ||
      col === "foundation_yield_drawn") return +value.toFixed(4);
  if (col === "entitlement_delay_months") return +value.toFixed(2);
  // dollar columns: round to nearest dollar (values are in $K)
  return +value.toFixed(0);
}

function parseRow(headerCols, line) {
  // Simple CSV split (no embedded commas in these files).
  const cells = line.split(",");
  const row = {};
  for (let i = 0; i < headerCols.length; i++) {
    row[headerCols[i]] = cells[i];
  }
  return row;
}

function toBool(v) {
  return v === "True" || v === "true" || v === "1" ? 1 : 0;
}

function processScenario(id, file) {
  const path = join(SOURCE_DIR, file);
  const text = readFileSync(path, "utf-8");
  const lines = text.split(/\r?\n/).filter((l) => l.length > 0);
  const headerCols = lines[0].split(",");

  // Build columnar storage
  const cols = {};
  for (const c of INPUT_COLS) cols[c] = [];
  for (const c of OUTPUT_COLS) cols[c] = [];
  for (const c of SURV_COLS) cols[c] = [];
  for (const c of OBJ_COLS) cols[c] = [];

  for (let i = 1; i < lines.length; i++) {
    const row = parseRow(headerCols, lines[i]);
    for (const c of INPUT_COLS) {
      cols[c].push(roundFor(c, parseFloat(row[c])));
    }
    for (const c of OUTPUT_COLS) {
      cols[c].push(roundFor(c, parseFloat(row[c])));
    }
    for (const c of SURV_COLS) {
      cols[c].push(toBool(row[c]));
    }
    for (const c of OBJ_COLS) {
      cols[c].push(toBool(row[c]));
    }
  }

  return { id, n: lines.length - 1, cols };
}

function main() {
  console.log("Reading iteration CSVs from", SOURCE_DIR);
  const scenarios = {};
  let totalRows = 0;
  for (const sc of SCENARIOS) {
    console.log(`  ${sc.id} ...`);
    const r = processScenario(sc.id, sc.file);
    scenarios[sc.id] = r.cols;
    totalRows += r.n;
    console.log(`    ${r.n} iterations`);
  }

  const out = {
    meta: {
      generated: new Date().toISOString(),
      total_iterations: totalRows,
      iterations_per_scenario: totalRows / SCENARIOS.length,
      schema: {
        inputs: INPUT_COLS,
        outputs: OUTPUT_COLS,
        survival_criteria: SURV_COLS,
        objective_criteria: OBJ_COLS,
      },
      source: "simulation/outputs/*_iterations.csv (Monte Carlo Session 4 build)",
    },
    scenarios,
  };

  // Make sure public/ exists
  mkdirSync(dirname(OUT_PATH), { recursive: true });

  // Write the JSON. Default minified (no whitespace) for smallest payload.
  const json = JSON.stringify(out);
  writeFileSync(OUT_PATH, json);
  const sizeMB = (json.length / 1024 / 1024).toFixed(2);
  console.log(`\nWrote ${OUT_PATH}`);
  console.log(`Size: ${sizeMB} MB uncompressed (gzip typically ~70% smaller)`);
}

main();
