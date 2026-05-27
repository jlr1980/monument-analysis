// Aggregate statistics computed from iteration columnar data.
// Used by both Mode 1 (pre-computed) and Mode 3 (worker output).

export function passRate(boolArr) {
  if (!boolArr || boolArr.length === 0) return 0;
  let s = 0;
  for (const v of boolArr) s += v ? 1 : 0;
  return s / boolArr.length;
}

export function median(arr) {
  const clean = (arr || []).filter((v) => v != null && Number.isFinite(v));
  if (clean.length === 0) return NaN;
  const sorted = [...clean].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

// Survival criteria for the failure-decomposition display.
export const SURV_LABELS = {
  surv_irr_12pct: "IRR ≥ 12%",
  surv_foundation_target: "Foundation ≥ scenario target",
  surv_debt_retired: "Debt retired without refinance",
  surv_scope_maintained: "Scope maintained",
};

export const OBJ_LABELS = {
  obj_irr_20pct: "IRR ≥ 20%",
  obj_moic_2x: "MOIC ≥ 2.0x",
  obj_foundation_80M: "Foundation ≥ $80M",
  obj_debt_retired: "Debt retired",
  obj_scope_maintained: "Scope maintained",
  obj_dues_coverage: "Dues cover club opex",
};
