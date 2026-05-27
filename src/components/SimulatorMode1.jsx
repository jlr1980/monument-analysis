import { useMemo } from "react";
import SimulatorHistogram from "./SimulatorHistogram.jsx";
import {
  passRate,
  median,
  SURV_LABELS,
  OBJ_LABELS,
} from "../lib/simulator-stats.js";

const SCENARIO_LIST = [
  { id: "base", label: "Base" },
  { id: "staged", label: "Staged" },
  { id: "compact", label: "Compact" },
  { id: "conservation", label: "Conservation" },
];

function fmt(value, decimals = 1) {
  if (!Number.isFinite(value)) return "n/a";
  return value.toFixed(decimals);
}

function HeadlineStat({ label, value, suffix }) {
  return (
    <div className="sim-headline-stat">
      <div className="sim-headline-value">
        {value}
        {suffix ? <span className="sim-headline-suffix">{suffix}</span> : null}
      </div>
      <div className="sim-headline-label">{label}</div>
    </div>
  );
}

function CriterionRow({ label, rate }) {
  const pct = Math.round(rate * 1000) / 10;
  return (
    <div className="criterion-row">
      <div className="criterion-label">{label}</div>
      <div className="criterion-bar-wrap">
        <div className="criterion-bar" style={{ width: `${pct}%` }} />
      </div>
      <div className="criterion-pct">{pct.toFixed(1)}%</div>
    </div>
  );
}

export default function SimulatorMode1({ data, scenario, setScenario }) {
  const sc = data?.scenarios?.[scenario];

  const stats = useMemo(() => {
    if (!sc) return null;
    return {
      survival_rate: passRate(sc.surv_all),
      objective_rate: passRate(sc.obj_all),
      median_xirr: median(sc.xirr),
      median_moic: median(sc.moic),
      median_foundation_end: median(sc.foundation_end),
      median_realized_tax: median(sc.realized_tax_benefit),
      surv: Object.fromEntries(
        Object.keys(SURV_LABELS).map((k) => [k, passRate(sc[k])])
      ),
      obj: Object.fromEntries(
        Object.keys(OBJ_LABELS).map((k) => [k, passRate(sc[k])])
      ),
    };
  }, [sc]);

  if (!data) {
    return (
      <div className="sim-loading">Loading 10,000 iterations per scenario&hellip;</div>
    );
  }

  if (!sc || !stats) {
    return <div className="sim-loading">Scenario data unavailable.</div>;
  }

  return (
    <div className="simulator-mode-1">
      <div className="sim-subselector">
        <div className="section-eyebrow">Scenario</div>
        <div className="scenario-pills">
          {SCENARIO_LIST.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`scenario-pill ${scenario === s.id ? "active" : ""}`}
              onClick={() => setScenario(s.id)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="sim-headlines">
        <HeadlineStat
          label="Survival rate"
          value={(stats.survival_rate * 100).toFixed(2)}
          suffix="%"
        />
        <HeadlineStat
          label="Full objective"
          value={(stats.objective_rate * 100).toFixed(2)}
          suffix="%"
        />
        <HeadlineStat
          label="Median IRR"
          value={(stats.median_xirr * 100).toFixed(1)}
          suffix="%"
        />
        <HeadlineStat
          label="Median MOIC"
          value={fmt(stats.median_moic, 2)}
          suffix="x"
        />
      </div>

      <div className="sim-histograms">
        <SimulatorHistogram
          values={sc.xirr}
          label="Levered IRR"
          formatTick={(v) => `${(v * 100).toFixed(0)}%`}
          formatValue={(v) => `${(v * 100).toFixed(1)}%`}
          medianValue={stats.median_xirr}
        />
        <SimulatorHistogram
          values={sc.moic}
          label="MOIC"
          formatTick={(v) => `${v.toFixed(1)}x`}
          formatValue={(v) => `${v.toFixed(2)}x`}
          medianValue={stats.median_moic}
        />
        <SimulatorHistogram
          values={sc.foundation_end}
          label="Foundation end ($M)"
          formatTick={(v) => `${(v / 1000).toFixed(0)}`}
          formatValue={(v) => `$${(v / 1000).toFixed(1)}M`}
          medianValue={stats.median_foundation_end}
        />
        <SimulatorHistogram
          values={sc.realized_tax_benefit}
          label="Realized tax benefit ($M)"
          formatTick={(v) => `${(v / 1000).toFixed(0)}`}
          formatValue={(v) => `$${(v / 1000).toFixed(1)}M`}
          medianValue={stats.median_realized_tax}
        />
      </div>

      <div className="sim-failure-decomp">
        <div className="failure-group">
          <div className="section-eyebrow">Survival criteria pass rates</div>
          {Object.entries(SURV_LABELS).map(([key, label]) => (
            <CriterionRow key={key} label={label} rate={stats.surv[key] || 0} />
          ))}
        </div>
        <div className="failure-group">
          <div className="section-eyebrow">Objective criteria pass rates</div>
          {Object.entries(OBJ_LABELS).map(([key, label]) => (
            <CriterionRow key={key} label={label} rate={stats.obj[key] || 0} />
          ))}
        </div>
      </div>

      <p className="sim-caveat">
        Pre-computed from the validated Python Monte Carlo kernel: 10,000
        iterations per scenario, five stochastic drivers with correlated
        distributions. The kernel and its validation are documented in the
        Change Log.
      </p>
    </div>
  );
}
