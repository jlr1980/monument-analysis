// Deterministic engine — JS port of simulation/engine.py (Monte Carlo kernel).
//
// Calculation order mirrors the Python kernel: Inputs → Lot Schedule → Revenue
// → Development Cost → Foundation → Debt → Cash Flow → Headlines.
//
// Targets within 2% of the Python kernel at scenario defaults. Conservation
// foundation_end diverges from the Excel deterministic by -6.6% (documented
// in Memo Section 6.1 and the Monte Carlo Change Log Session 5).

const N_YEARS = 12;

// "Carried-from-team" constants from the Cash Flow sheet.
const FRACTIONAL_CABIN_TOTAL = 12000.0;
const INTEREST_ON_CASH_TOTAL = 4008.042;
const OTHER_CLUB_REVENUE_TOTAL = 6418.208;
const CABIN_CONSTRUCTION_TOTAL_BASE = 28559.0;
const CLUB_EQUIPMENT_TOTAL = 2382.29;
const CONSTRUCTION_LOAN_INTEREST_TOTAL = 1140.456;

// Club operating expenses (Session 2 rewire: flexes by member count).
const CLUB_OPEX_TOTAL_BASE = 43096.393;
const CLUB_OPEX_FIXED_PCT = 0.7;
const CLUB_OPEX_VARIABLE_PCT = 0.3;
const CLUB_OPEX_BASE_MEMBERS = 92;

// Foundation tightening constants.
const FOUNDATION_EXPENSE_WEIGHT = 0.458;
const FOUNDATION_EXPENSE_BASE_AT_MULT_1 = [
  -542.9, -515.75, -1353.55, -1712.45, -2137.89, -2404.05,
  -2461.16, -2483.12, -2505.73, -2529.02, -2553.01, -2577.72,
].map((v) => v / 0.6);

const FOUNDATION_GRANT_RAMP = [0.0, 0.125, 0.75, 1, 1, 1, 1, 1, 1, 1, 1, 1];

const DEV_COST_PHASING = [
  0.0443, 0.087, 0.1737, 0.2467, 0.2605, 0.1831, 0.0046, 0, 0, 0, 0, 0,
];

const CABIN_PHASING = [
  0, 0, 0, 6 / 24, 12 / 24, 6 / 24, 0, 0, 0, 0, 0, 0,
];

const _OPEX_RAW = [0.02, 0.04, 0.08, 0.1, 0.11, 0.11, 0.11, 0.11, 0.11, 0.11, 0.11, 0.11];
const _OPEX_SUM = _OPEX_RAW.reduce((a, b) => a + b, 0);
const CLUB_OPEX_PHASING = _OPEX_RAW.map((v) => v / _OPEX_SUM);

const BASE_DUES_TARGET = 17451.25;
const EQUITY_2026_FRAC = 0.63179;
const TEAM_DIST_PATTERN = [
  0, 0, 0, 11809.48, 838.98, 716.31, 345.02, 377.27, 359.71, 341.62, 322.99, 2803.79,
];

// Helpers ------------------------------------------------------------
function sum(arr) {
  return arr.reduce((a, b) => a + b, 0);
}
function cumsum(arr) {
  let s = 0;
  return arr.map((v) => (s += v));
}
function clip(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function scenarioClubOpex(ranchMembers, socialMembers) {
  const members = ranchMembers + socialMembers;
  return (
    CLUB_OPEX_TOTAL_BASE *
    (CLUB_OPEX_FIXED_PCT + (CLUB_OPEX_VARIABLE_PCT * members) / CLUB_OPEX_BASE_MEMBERS)
  );
}

function applyVelocityFactor(velocity, factor, capPerYear = 12.0) {
  const scaled = velocity.map((v) => v * factor);
  const capped = scaled.map((v) => Math.min(v, capPerYear));
  const origTotal = sum(velocity);
  const cappedTotal = sum(capped);
  if (cappedTotal > 0 && origTotal > 0) {
    return capped.map((v) => v * (origTotal / cappedTotal));
  }
  return capped;
}

// Scale a velocity schedule so its total equals `targetLots`.
function scaleVelocityToLotCount(velocity, targetLots) {
  const total = sum(velocity);
  if (total <= 0) return velocity.slice();
  const scale = targetLots / total;
  return velocity.map((v) => v * scale);
}

// XIRR via damped Newton's method (annual cash flows).
function xirrFromAnnual(annualCfs) {
  const allPos = annualCfs.every((v) => v >= 0);
  const allNeg = annualCfs.every((v) => v <= 0);
  if (allPos || allNeg) return NaN;

  const years = annualCfs.map((_, i) => i);
  let r = 0.1;
  let converged = false;

  for (let iter = 0; iter < 200; iter++) {
    let f = 0;
    let fprime = 0;
    for (let i = 0; i < annualCfs.length; i++) {
      f += annualCfs[i] / Math.pow(1 + r, years[i]);
      fprime += (-years[i] * annualCfs[i]) / Math.pow(1 + r, years[i] + 1);
    }
    if (Math.abs(fprime) < 1e-12) break;
    let delta = f / fprime;
    if (Math.abs(delta) > 1.0) delta = Math.sign(delta) * 1.0;
    let rNew = r - delta;
    if (rNew < -0.99) rNew = -0.99;
    if (Math.abs(rNew - r) < 1e-9) {
      r = rNew;
      converged = true;
      break;
    }
    r = rNew;
  }

  if (!converged || !isFinite(r) || r < -0.99 || r > 5.0) return NaN;
  const finalF = annualCfs.reduce(
    (acc, v, i) => acc + v / Math.pow(1 + r, i),
    0
  );
  const scale = annualCfs.reduce((acc, v) => acc + Math.abs(v), 0);
  if (scale > 0 && Math.abs(finalF) > 1e-3 * scale) return NaN;
  return r;
}

// Scenario defaults ---------------------------------------------------
const SCENARIO_BASE = {
  name: "Base",
  revenue_lots: 27,
  master_plan_lots: 50,
  phase1_lots: 10,
  phase2_lots: 12,
  phase3_lots: 5,
  sales_velocity: [0, 1, 6, 7, 9, 4, 0, 0, 0, 0, 0, 0],
  phase1_price_K: 5000,
  phase2_price_K: 5500,
  phase3_price_K: 6000,
  vertical_amenity_K: 39974.7,
  amenity_scope_multiplier: 1.0,
  offsite_K: 2937,
  club_equipment_K: 3514,
  well_unit_cost_K: 60,
  water_rights_unit_K: 30,
  road_base_miles: 18.41,
  road_cost_K_per_mile: 300,
  road_band_threshold_lots: 30,
  road_upper_band_uplift: 0.2,
  in_tract_power_K: 2000,
  in_tract_sewer_K: 295,
  in_tract_land_imp_K: 3750,
  management_fee_rate: 0.05427,
  contingency_rate: 0.04293,
  foundation_contribution_per_lot_K: 1200,
  foundation_yield_annual: 0.07,
  foundation_grants_steady_K: 500,
  foundation_expense_multiplier: 0.6,
  foundation_initial_K: 1000,
  new_equity_K: 10000,
  revolver_limit_K: 10000,
  opening_cash_K: 5000,
  tax_realization_rate: 1.0,
  tax_leverage_ratio: 3.0,
  ranch_members: 42,
  social_members: 50,
  ranch_dues_K_yr: 25,
  social_dues_K_yr: 15,
  ranch_if_K: 100,
  social_if_K: 125,
  sales_commission_rate: 0.03,
  closing_costs_K: 365,
  if_reconciling_adj: 0.01,
  water_rights_acquisition_factor: 0.5,
  pre_dev_cost_K: 3915,
  sm_rate_of_gross_re: 0.007692,
  cabin_scope_multiplier: 1.0,
  sales_velocity_factor: 1.0,
  snowpack_index: 1.0,
};

const SCENARIO_STAGED = {
  ...SCENARIO_BASE,
  name: "Staged",
  phase1_price_K: 5500,
  phase2_price_K: 6000,
  phase3_price_K: 6500,
  foundation_contribution_per_lot_K: 1400,
  foundation_yield_annual: 0.06,
  foundation_grants_steady_K: 250,
  tax_realization_rate: 0.8,
};

const SCENARIO_COMPACT = {
  ...SCENARIO_BASE,
  name: "Compact",
  revenue_lots: 32,
  master_plan_lots: 32,
  phase1_lots: 32,
  phase2_lots: 0,
  phase3_lots: 0,
  sales_velocity: [0, 2, 8, 10, 8, 4, 0, 0, 0, 0, 0, 0],
  phase1_price_K: 6500,
  phase2_price_K: 0,
  phase3_price_K: 0,
  amenity_scope_multiplier: 0.8,
  foundation_contribution_per_lot_K: 1800,
  foundation_yield_annual: 0.06,
  foundation_grants_steady_K: 250,
  tax_realization_rate: 0.8,
  ranch_members: 32,
  cabin_scope_multiplier: 0.8,
};

const SCENARIO_CONSERVATION = {
  ...SCENARIO_BASE,
  name: "Conservation",
  revenue_lots: 25,
  master_plan_lots: 25,
  phase1_lots: 25,
  phase2_lots: 0,
  phase3_lots: 0,
  sales_velocity: [0, 0, 2, 5, 7, 6, 5, 0, 0, 0, 0, 0],
  phase1_price_K: 7500,
  phase2_price_K: 0,
  phase3_price_K: 0,
  amenity_scope_multiplier: 0.6,
  foundation_contribution_per_lot_K: 3200,
  foundation_yield_annual: 0.05,
  foundation_grants_steady_K: 0,
  foundation_expense_multiplier: 0.8,
  tax_realization_rate: 0.8,
  ranch_members: 25,
  ranch_dues_K_yr: 30,
  social_dues_K_yr: 18,
  ranch_if_K: 125,
  social_if_K: 150,
  cabin_scope_multiplier: 0.6,
};

const SCENARIO_CUSTOM = { ...SCENARIO_BASE, name: "Custom" };

export const SCENARIOS = {
  base: SCENARIO_BASE,
  staged: SCENARIO_STAGED,
  compact: SCENARIO_COMPACT,
  conservation: SCENARIO_CONSERVATION,
  custom: SCENARIO_CUSTOM,
};

// Main compute function -----------------------------------------------
export function computeEngine(s) {
  // Scale velocity schedule to current lot count so input edits flow through.
  const velocityScaled = scaleVelocityToLotCount(s.sales_velocity, s.revenue_lots);
  const velocity = applyVelocityFactor(velocityScaled, s.sales_velocity_factor || 1.0);
  const annualLots = velocity;
  const cumLots = cumsum(annualLots);

  // Per-year lot count by phase
  const annualP1 = new Array(N_YEARS).fill(0);
  const annualP2 = new Array(N_YEARS).fill(0);
  const annualP3 = new Array(N_YEARS).fill(0);
  let cumStart = 0;
  for (let i = 0; i < N_YEARS; i++) {
    const cumEnd = cumStart + annualLots[i];
    annualP1[i] = Math.max(
      0,
      Math.min(s.phase1_lots, cumEnd) - Math.min(s.phase1_lots, cumStart)
    );
    let p2 = Math.min(s.phase1_lots + s.phase2_lots, cumEnd) - Math.max(s.phase1_lots, cumStart);
    annualP2[i] = Math.max(0, p2);
    let p3 = cumEnd - Math.max(s.phase1_lots + s.phase2_lots, cumStart);
    annualP3[i] = Math.max(0, p3);
    cumStart = cumEnd;
  }

  // Snowpack price multiplier (held neutral at 1.0)
  const snow = s.snowpack_index || 1.0;
  const priceMultSnow = clip(1.0 + 0.5 * (snow - 1.0), 0.5, 1.5);

  const annualGrossRe = annualP1.map(
    (p1, i) =>
      p1 * s.phase1_price_K * priceMultSnow +
      annualP2[i] * s.phase2_price_K * priceMultSnow +
      annualP3[i] * s.phase3_price_K * priceMultSnow
  );
  const grossReTotal = sum(annualGrossRe);

  // Selling costs and net RE
  const annualSellingCosts = annualGrossRe.map((v) => s.sales_commission_rate * v);
  annualSellingCosts[0] += s.closing_costs_K;
  const annualNetRe = annualGrossRe.map((v, i) => v - annualSellingCosts[i]);

  // Foundation contribution with contract-led recognition
  const lotRecognition = [...annualLots];
  if (N_YEARS >= 5 && annualLots[1] >= 0 && annualLots[4] > 0) {
    lotRecognition[1] += 1.0;
    lotRecognition[4] -= 1.0;
  }
  const annualFoundationContrib = lotRecognition.map(
    (v) => v * s.foundation_contribution_per_lot_K
  );
  const foundationContribTotal = sum(annualFoundationContrib);

  // IF revenue
  const annualRanchIf = annualLots.map((v) => v * s.ranch_if_K);
  const socialIfSchedule = new Array(N_YEARS).fill(0);
  const lots03 = annualLots.slice(0, 3);
  const lots03Sum = sum(lots03);
  if (lots03Sum > 0) {
    for (let i = 0; i < 3; i++) {
      socialIfSchedule[i] = (annualLots[i] / lots03Sum) * s.social_members * s.social_if_K;
    }
  }
  const annualIfGross = annualRanchIf.map((v, i) => v + socialIfSchedule[i]);
  const annualIfNet = annualIfGross.map((v) => v * (1 - s.if_reconciling_adj));

  // Club dues with calibration to Base target
  const steadyDuesPerYear = s.ranch_members * s.ranch_dues_K_yr + s.social_members * s.social_dues_K_yr;
  const ranchMemberFraction = cumLots.map((v) => Math.min(1.0, v / Math.max(1.0, s.revenue_lots)));
  const socialIfCum = cumsum(socialIfSchedule);
  const socialIfSum = sum(socialIfSchedule);
  const socialRamp = socialIfCum.map((v) => Math.min(1.0, v / Math.max(1.0, socialIfSum > 0 ? socialIfSum : 1.0)));
  let annualDues = ranchMemberFraction.map(
    (f, i) => f * s.ranch_members * s.ranch_dues_K_yr + socialRamp[i] * s.social_members * s.social_dues_K_yr
  );
  const baseSteady = 42 * 25 + 50 * 15;
  const duesSum = sum(annualDues);
  let scale;
  if (s.name === "Base" || s.name === "Custom") {
    scale = duesSum > 0 ? BASE_DUES_TARGET / duesSum : 1.0;
  } else {
    const scaleTarget = BASE_DUES_TARGET * (steadyDuesPerYear / baseSteady);
    scale = duesSum > 0 ? scaleTarget / duesSum : 1.0;
  }
  annualDues = annualDues.map((v) => v * scale);

  // Development cost (three-tier)
  const tier1Amenity = s.vertical_amenity_K * s.amenity_scope_multiplier;
  const tier1 = tier1Amenity + s.offsite_K + s.club_equipment_K;
  const wells = s.well_unit_cost_K * s.master_plan_lots;
  const waterRights = s.water_rights_unit_K * s.master_plan_lots * s.water_rights_acquisition_factor;
  const roadMultiplier = 1.0 + (s.revenue_lots > s.road_band_threshold_lots ? s.road_upper_band_uplift : 0.0);
  const roads = s.road_base_miles * s.road_cost_K_per_mile * roadMultiplier;
  const tier2 = wells + waterRights + roads + s.in_tract_power_K + s.in_tract_sewer_K + s.in_tract_land_imp_K;
  const derivedBase = tier1Amenity + s.offsite_K + tier2;
  const tier3 = derivedBase * (s.management_fee_rate + s.contingency_rate);
  const devCostTotal = tier1 + tier2 + tier3;
  const annualDevCost = DEV_COST_PHASING.map((p) => p * devCostTotal);

  // Foundation roll-forward (monthly-compounded effective rate)
  const foundationYield = Math.pow(1 + s.foundation_yield_annual / 12, 12) - 1;
  const foundationGrantsAnnual = FOUNDATION_GRANT_RAMP.map((r) => r * s.foundation_grants_steady_K);
  const foundationExpensesAnnual = FOUNDATION_EXPENSE_BASE_AT_MULT_1.map(
    (v) => v * s.foundation_expense_multiplier
  );
  const foundationYieldAnnual = new Array(N_YEARS).fill(0);
  let bal = s.foundation_initial_K;
  for (let i = 0; i < N_YEARS; i++) {
    const contributions = annualFoundationContrib[i];
    const grants = foundationGrantsAnnual[i];
    const expenses = foundationExpensesAnnual[i];
    const avgBalance = bal + 0.5 * (contributions + grants) + FOUNDATION_EXPENSE_WEIGHT * expenses;
    const y = avgBalance * foundationYield;
    foundationYieldAnnual[i] = y;
    bal = bal + contributions + grants + expenses + y;
  }
  const foundationEndBalance = bal;

  // Debt service (always sales-funded per engine wiring)
  const laPlataPmt = (11000 * 0.06) / (1 - Math.pow(1.06, -20));
  const swansPmt = (13000 * 0.04) / (1 - Math.pow(1.04, -30));
  const annualDebtService = new Array(N_YEARS).fill(0);
  for (let i = 0; i < 6; i++) annualDebtService[i] = laPlataPmt + swansPmt;
  function remainingBalance(principal, rate, pmt, years) {
    let b = principal;
    for (let i = 0; i < years; i++) {
      b -= pmt - b * rate;
    }
    return b;
  }
  const combinedBalloon =
    remainingBalance(11000, 0.06, laPlataPmt, 6) + remainingBalance(13000, 0.04, swansPmt, 6);
  annualDebtService[6] = combinedBalloon;
  const debtServiceTotal = sum(annualDebtService);

  // Cash flow: sources
  const openingCashAnnual = new Array(N_YEARS).fill(0);
  openingCashAnnual[0] = s.opening_cash_K;
  const annualDeveloperLotProceeds = annualNetRe.map((v, i) => v - annualFoundationContrib[i]);
  const fractionalCabinPhasing = new Array(N_YEARS).fill(0);
  for (let i = 2; i < 7; i++) fractionalCabinPhasing[i] = 0.2;
  const annualFractionalCabin = fractionalCabinPhasing.map((p) => p * FRACTIONAL_CABIN_TOTAL);
  const annualFoundationContribToFdn = new Array(N_YEARS).fill(0);
  annualFoundationContribToFdn[0] = s.foundation_initial_K;
  for (let i = 0; i < N_YEARS; i++) annualFoundationContribToFdn[i] += annualFoundationContrib[i];
  const annualInterestOnCash = new Array(N_YEARS).fill(INTEREST_ON_CASH_TOTAL / N_YEARS);
  const otherClubPhasing = new Array(N_YEARS).fill(0);
  for (let i = 3; i < N_YEARS; i++) otherClubPhasing[i] = 1 / (N_YEARS - 3);
  const annualOtherClub = otherClubPhasing.map((p) => p * OTHER_CLUB_REVENUE_TOTAL);

  let totalSources = 0;
  for (let i = 0; i < N_YEARS; i++) {
    totalSources +=
      openingCashAnnual[i] +
      annualDeveloperLotProceeds[i] +
      annualFractionalCabin[i] +
      annualFoundationContribToFdn[i] +
      foundationYieldAnnual[i] +
      foundationGrantsAnnual[i] +
      annualIfNet[i] +
      annualDues[i] +
      annualInterestOnCash[i] +
      annualOtherClub[i];
  }

  // Cash flow: uses
  const annualPreDev = new Array(N_YEARS).fill(0);
  annualPreDev[0] = s.pre_dev_cost_K;
  const annualSm = annualGrossRe.map((v) => v * s.sm_rate_of_gross_re);
  const annualCabin = CABIN_PHASING.map((p) => p * CABIN_CONSTRUCTION_TOTAL_BASE * s.cabin_scope_multiplier);
  const clubOpexTotal = scenarioClubOpex(s.ranch_members, s.social_members);
  const annualClubOpex = CLUB_OPEX_PHASING.map((p) => p * clubOpexTotal);
  const annualClubEquipment = fractionalCabinPhasing.map((p) => p * CLUB_EQUIPMENT_TOTAL);
  const annualConstructionInterest = DEV_COST_PHASING.map((p) => p * CONSTRUCTION_LOAN_INTEREST_TOTAL);

  let totalUses = 0;
  for (let i = 0; i < N_YEARS; i++) {
    totalUses +=
      annualDevCost[i] +
      annualPreDev[i] +
      annualSm[i] +
      annualCabin[i] +
      annualClubOpex[i] +
      annualClubEquipment[i] +
      annualDebtService[i] +
      annualConstructionInterest[i];
  }
  totalUses += foundationEndBalance; // terminal use

  const netProfit = totalSources - totalUses;
  const totalDistributions = s.new_equity_K + netProfit;
  const moic = s.new_equity_K > 0 ? totalDistributions / s.new_equity_K : 0;

  // XIRR using team's distribution timing scaled
  const equityContrib = new Array(N_YEARS).fill(0);
  equityContrib[0] = -s.new_equity_K * EQUITY_2026_FRAC;
  equityContrib[1] = -s.new_equity_K * (1 - EQUITY_2026_FRAC);
  const teamDistTotal = sum(TEAM_DIST_PATTERN);
  const annualDistributions = TEAM_DIST_PATTERN.map(
    (v, i) => (teamDistTotal > 0 ? (v * totalDistributions) / teamDistTotal : 0) + equityContrib[i]
  );
  const xirr = xirrFromAnnual(annualDistributions);

  // Realized tax benefit
  const realizedTax =
    s.foundation_contribution_per_lot_K * s.revenue_lots * s.tax_leverage_ratio * s.tax_realization_rate;

  return {
    revenue: grossReTotal,
    foundation_contribution_total: foundationContribTotal,
    foundation_end: foundationEndBalance,
    realized_tax: realizedTax,
    net_profit: netProfit,
    moic,
    xirr,
    debt_service: debtServiceTotal,
    dev_cost_total: devCostTotal,
    club_opex_total: clubOpexTotal,
  };
}
