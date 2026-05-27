// Stochastic input sampling for the Simulator's Web Worker.
//
// Mirrors simulation/distributions.py from the Monte Carlo build, with the
// simplification that draws are independent (no Gaussian copula). The
// pre-computed Mode 1 data is from the correlated Python kernel; Mode 3 is
// noted as a 1000-iteration approximation with independent draws.
//
// Pure functions, safe to import inside a Web Worker.

// Box-Muller standard normal.
function gaussian(rng) {
  let u1 = 0;
  let u2 = 0;
  while (u1 === 0) u1 = rng();
  u2 = rng();
  return Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
}

function clip(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

// Default distribution parameters (match Python kernel's distributions.py).
export const DEFAULT_DIST_PARAMS = {
  snowpack_mean: 0.84,
  snowpack_std: 0.1,
  sales_velocity_median: 0.9,
  sales_velocity_sigma: 0.35,
  // Beta(8, 2) has mean = 0.8, std ≈ 0.121. We approximate with a clipped normal
  // for sampler simplicity; the moments match.
  tax_realization_mean: 0.8,
  tax_realization_std: 0.121,
  entitlement_delay_scale: 6,
  foundation_yield_mean: 0.06,
  foundation_yield_std: 0.01,
};

export function sampleStochasticInputs(params = {}, rng = Math.random) {
  const p = { ...DEFAULT_DIST_PARAMS, ...params };
  const snow = clip(p.snowpack_mean + p.snowpack_std * gaussian(rng), 0.4, 1.5);
  const vel = clip(
    Math.exp(Math.log(p.sales_velocity_median) + p.sales_velocity_sigma * gaussian(rng)),
    0.2,
    3.0
  );
  const tax = clip(p.tax_realization_mean + p.tax_realization_std * gaussian(rng), 0, 1);
  // Exponential via inverse CDF: -scale * ln(U)
  let u = rng();
  if (u === 0) u = 1e-9;
  const delay = clip(-p.entitlement_delay_scale * Math.log(u), 0, 60);
  const yld = clip(p.foundation_yield_mean + p.foundation_yield_std * gaussian(rng), 0.01, 0.12);
  return {
    snowpack: snow,
    sales_velocity_factor: vel,
    tax_realization: tax,
    entitlement_delay_months: delay,
    foundation_yield: yld,
  };
}

// Scenario-specific Foundation targets, used for survival criterion.
// Matches monte_carlo.py SCENARIO_FOUNDATION_TARGETS after Session 4 calibration.
export const SCENARIO_FOUNDATION_TARGETS = {
  Base: 33348.4,
  Staged: 35377.5,
  Compact: 69053.3,
  Conservation: 76722.2,
  Custom: 33348.4,
};

// Carried club-revenue constants (used by dues-coverage criterion).
export const CLUB_OTHER_REV_TOTAL = 6418.208;
export const FRACTIONAL_CABIN_TOTAL = 12000.0;
