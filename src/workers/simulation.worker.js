// Monte Carlo simulation worker. Runs computeEngine() over N stochastic draws.
//
// Vite imports this with the ?worker query suffix in the main thread.
// Receives: { inputs, iterations, distParams } via postMessage.
// Posts back: progress updates and a final results object.

import { computeEngine, SCENARIOS } from "../lib/engine.js";
import {
  sampleStochasticInputs,
  SCENARIO_FOUNDATION_TARGETS,
  CLUB_OTHER_REV_TOTAL,
  FRACTIONAL_CABIN_TOTAL,
} from "../lib/sampling.js";

self.onmessage = (event) => {
  const { inputs, iterations, distParams } = event.data;
  const N = iterations || 1000;
  const foundationTarget = SCENARIO_FOUNDATION_TARGETS[inputs.name] || 33348.4;

  // Columnar results, same shape as the pre-computed Mode 1 data.
  const results = {
    inputs: { snowpack: [], sales_velocity_factor: [], tax_realization: [], entitlement_delay_months: [], foundation_yield_drawn: [] },
    outputs: { xirr: [], moic: [], foundation_end: [], net_profit: [], realized_tax_benefit: [] },
    survival: { surv_irr_12pct: [], surv_foundation_target: [], surv_debt_retired: [], surv_scope_maintained: [], surv_all: [] },
    objective: { obj_irr_20pct: [], obj_moic_2x: [], obj_foundation_80M: [], obj_debt_retired: [], obj_scope_maintained: [], obj_dues_coverage: [], obj_all: [] },
  };

  // RNG seeded with a deterministic prng so that re-runs with the same inputs
  // produce the same distribution shape. Mulberry32, lightweight and fast.
  let seed = 20260528;
  const rng = () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  for (let i = 0; i < N; i++) {
    const stoch = sampleStochasticInputs(distParams, rng);
    // Merge stochastic inputs into the deterministic scenario state.
    const merged = {
      ...inputs,
      snowpack_index: stoch.snowpack,
      sales_velocity_factor: stoch.sales_velocity_factor,
      tax_realization_rate: stoch.tax_realization,
      foundation_yield_annual: stoch.foundation_yield,
      // entitlement_delay_months is recorded but not propagated in the JS engine
      // (the engine doesn't shift the velocity schedule by months in this port).
    };

    const out = computeEngine(merged);

    const xirr = Number.isFinite(out.xirr) ? out.xirr : NaN;
    const moic = Number.isFinite(out.moic) ? out.moic : 0;
    const fdnEnd = out.foundation_end || 0;
    const netP = out.net_profit || 0;
    const realizedTax = out.realized_tax || 0;

    // Criteria mirror monte_carlo.py
    const surv_irr_12pct = Number.isFinite(xirr) && xirr >= 0.12 ? 1 : 0;
    const surv_foundation_target = fdnEnd >= foundationTarget ? 1 : 0;
    // Simplified PFR proxy: deal didn't exceed total commitment if net_profit positive
    // (full PFR would require the cash-flow trough analysis which isn't in the JS engine).
    const surv_debt_retired = netP >= -10000 ? 1 : 0;
    const surv_scope_maintained = netP >= 0 ? 1 : 0;
    const surv_all_v = surv_irr_12pct && surv_foundation_target && surv_debt_retired && surv_scope_maintained ? 1 : 0;

    const obj_irr_20pct = Number.isFinite(xirr) && xirr >= 0.2 ? 1 : 0;
    const obj_moic_2x = moic >= 2.0 ? 1 : 0;
    const obj_foundation_80M = fdnEnd >= 80000 ? 1 : 0;
    const obj_debt_retired = surv_debt_retired;
    const obj_scope_maintained = surv_scope_maintained;
    // Dues coverage: total club revenue (excluding Foundation yield) ≥ club opex.
    const clubRev = (out.dues_total || 0) + (out.if_net_total || 0) + CLUB_OTHER_REV_TOTAL + FRACTIONAL_CABIN_TOTAL;
    const clubOpex = out.club_opex_total || 0;
    const obj_dues_coverage = clubRev >= clubOpex ? 1 : 0;
    const obj_all_v =
      obj_irr_20pct &&
      obj_moic_2x &&
      obj_foundation_80M &&
      obj_debt_retired &&
      obj_scope_maintained &&
      obj_dues_coverage
        ? 1
        : 0;

    results.inputs.snowpack.push(stoch.snowpack);
    results.inputs.sales_velocity_factor.push(stoch.sales_velocity_factor);
    results.inputs.tax_realization.push(stoch.tax_realization);
    results.inputs.entitlement_delay_months.push(stoch.entitlement_delay_months);
    results.inputs.foundation_yield_drawn.push(stoch.foundation_yield);

    results.outputs.xirr.push(Number.isFinite(xirr) ? xirr : null);
    results.outputs.moic.push(moic);
    results.outputs.foundation_end.push(fdnEnd);
    results.outputs.net_profit.push(netP);
    results.outputs.realized_tax_benefit.push(realizedTax);

    results.survival.surv_irr_12pct.push(surv_irr_12pct);
    results.survival.surv_foundation_target.push(surv_foundation_target);
    results.survival.surv_debt_retired.push(surv_debt_retired);
    results.survival.surv_scope_maintained.push(surv_scope_maintained);
    results.survival.surv_all.push(surv_all_v);

    results.objective.obj_irr_20pct.push(obj_irr_20pct);
    results.objective.obj_moic_2x.push(obj_moic_2x);
    results.objective.obj_foundation_80M.push(obj_foundation_80M);
    results.objective.obj_debt_retired.push(obj_debt_retired);
    results.objective.obj_scope_maintained.push(obj_scope_maintained);
    results.objective.obj_dues_coverage.push(obj_dues_coverage);
    results.objective.obj_all.push(obj_all_v);

    if ((i + 1) % 50 === 0 || i === N - 1) {
      self.postMessage({ type: "progress", iteration: i + 1, total: N });
    }
  }

  self.postMessage({ type: "complete", results });
};
