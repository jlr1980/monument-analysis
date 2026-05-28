import { useState, useMemo, useRef, useEffect } from "react";
import { SCENARIOS } from "../lib/engine.js";
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
  { id: "custom", label: "Custom" },
];

function NumberInput({ label, value, min, max, step, onChange, suffix }) {
  return (
    <label className="input-row">
      <span className="input-label">{label}</span>
      <span className="input-control">
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            if (!Number.isNaN(v)) onChange(v);
          }}
        />
        <span className="input-suffix">{suffix || ""}</span>
      </span>
    </label>
  );
}

function fmt(v, d = 1) {
  return Number.isFinite(v) ? v.toFixed(d) : "n/a";
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

const ITER_COUNT = 1000;

export default function SimulatorMode3({ inputs, setInputs, scenarioId, setScenarioId, results, setResults, baselineData }) {
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [compareBaseline, setCompareBaseline] = useState(false);
  const workerRef = useRef(null);

  // Clean up worker on unmount
  useEffect(() => {
    return () => {
      if (workerRef.current) workerRef.current.terminate();
    };
  }, []);

  const selectScenario = (id) => {
    setScenarioId(id);
    setInputs({ ...SCENARIOS[id] });
  };

  const updateInput = (key, value) => {
    setInputs((prev) => {
      const updated = { ...prev, [key]: value };
      if (key === "revenue_lots") {
        const oldTotal = prev.sales_velocity.reduce((a, b) => a + b, 0);
        const scale = oldTotal > 0 ? value / oldTotal : 1;
        updated.sales_velocity = prev.sales_velocity.map((v) => v * scale);
        if (prev.phase2_lots === 0) updated.phase1_lots = value;
      }
      return updated;
    });
  };

  const runSimulation = () => {
    if (running) return;
    setRunning(true);
    setProgress(0);
    // Worker is created fresh per run to avoid state leak.
    const Worker = workerRef.current;
    if (Worker) Worker.terminate();
    // Use Vite's ?worker import
    import("../workers/simulation.worker.js?worker").then((mod) => {
      const w = new mod.default();
      workerRef.current = w;
      w.onmessage = (e) => {
        const msg = e.data;
        if (msg.type === "progress") {
          setProgress(msg.iteration / msg.total);
        } else if (msg.type === "complete") {
          setResults(msg.results);
          setProgress(1);
          setRunning(false);
        }
      };
      w.postMessage({ inputs, iterations: ITER_COUNT });
    });
  };

  const stats = useMemo(() => {
    if (!results) return null;
    const o = results.outputs;
    return {
      survival_rate: passRate(results.survival.surv_all),
      objective_rate: passRate(results.objective.obj_all),
      median_xirr: median(o.xirr),
      median_moic: median(o.moic),
      median_foundation_end: median(o.foundation_end),
      median_realized_tax: median(o.realized_tax_benefit),
      surv: Object.fromEntries(
        Object.keys(SURV_LABELS).map((k) => [k, passRate(results.survival[k])])
      ),
      obj: Object.fromEntries(
        Object.keys(OBJ_LABELS).map((k) => [k, passRate(results.objective[k])])
      ),
    };
  }, [results]);

  // Baseline stats from pre-computed data, for the compare toggle.
  const baselineStats = useMemo(() => {
    if (!compareBaseline || !baselineData || scenarioId === "custom") return null;
    const sc = baselineData.scenarios?.[scenarioId];
    if (!sc) return null;
    return {
      survival_rate: passRate(sc.surv_all),
      objective_rate: passRate(sc.obj_all),
      median_xirr: median(sc.xirr),
      median_moic: median(sc.moic),
    };
  }, [compareBaseline, baselineData, scenarioId]);

  const showPhase2 = inputs.phase2_lots > 0;
  const showPhase3 = inputs.phase3_lots > 0;

  return (
    <div className="simulator-mode-3">
      <div className="mode3-grid">
        <div className="mode3-inputs">
          <div className="section-eyebrow">Starting point</div>
          <div className="scenario-pills">
            {SCENARIO_LIST.map((s) => (
              <button
                key={s.id}
                type="button"
                className={`scenario-pill ${scenarioId === s.id ? "active" : ""}`}
                onClick={() => selectScenario(s.id)}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="section-eyebrow" style={{ marginTop: "1.4rem" }}>
            Inputs
          </div>
          <div className="inputs-grid">
            <NumberInput
              label="Lot count"
              value={inputs.revenue_lots}
              min={20}
              max={50}
              step={1}
              onChange={(v) => updateInput("revenue_lots", v)}
            />
            <NumberInput
              label="Phase 1 lot price"
              value={inputs.phase1_price_K}
              min={3000}
              max={10000}
              step={100}
              onChange={(v) => updateInput("phase1_price_K", v)}
              suffix="$K"
            />
            {showPhase2 ? (
              <NumberInput
                label="Phase 2 lot price"
                value={inputs.phase2_price_K}
                min={3000}
                max={10000}
                step={100}
                onChange={(v) => updateInput("phase2_price_K", v)}
                suffix="$K"
              />
            ) : null}
            {showPhase3 ? (
              <NumberInput
                label="Phase 3 lot price"
                value={inputs.phase3_price_K}
                min={3000}
                max={10000}
                step={100}
                onChange={(v) => updateInput("phase3_price_K", v)}
                suffix="$K"
              />
            ) : null}
            <NumberInput
              label="Foundation per lot"
              value={inputs.foundation_contribution_per_lot_K}
              min={500}
              max={5000}
              step={100}
              onChange={(v) => updateInput("foundation_contribution_per_lot_K", v)}
              suffix="$K"
            />
            <NumberInput
              label="Tax realization rate"
              value={inputs.tax_realization_rate}
              min={0}
              max={1}
              step={0.05}
              onChange={(v) => updateInput("tax_realization_rate", v)}
            />
            <NumberInput
              label="Foundation yield"
              value={Number((inputs.foundation_yield_annual * 100).toFixed(2))}
              min={3}
              max={10}
              step={0.25}
              onChange={(v) => updateInput("foundation_yield_annual", v / 100)}
              suffix="%"
            />
          </div>

          <button
            type="button"
            className="run-sim-button"
            onClick={runSimulation}
            disabled={running}
          >
            {running ? `Running ${Math.round(progress * 100)}%` : `Run ${ITER_COUNT}-iteration simulation`}
          </button>
          {running ? (
            <div className="sim-progress">
              <div className="sim-progress-bar" style={{ width: `${progress * 100}%` }} />
            </div>
          ) : null}
        </div>

        <div className="mode3-output">
          {!results && !running ? (
            <div className="mode3-empty">
              <div className="section-eyebrow">Output</div>
              <p>
                Configure inputs and click <strong>Run simulation</strong> to
                draw {ITER_COUNT} stochastic samples against the current
                configuration. The 10,000-iteration Named scenarios view is
                the authoritative distribution for the four scenarios; this
                mode is for asking &ldquo;what would my own configuration look
                like?&rdquo;
              </p>
            </div>
          ) : null}

          {stats ? (
            <>
              {scenarioId !== "custom" && baselineData ? (
                <label className="compare-toggle">
                  <input
                    type="checkbox"
                    checked={compareBaseline}
                    onChange={(e) => setCompareBaseline(e.target.checked)}
                  />
                  <span>Compare to {scenarioId} baseline (10K-iteration Named scenarios)</span>
                </label>
              ) : null}

              <div className="sim-headlines">
                <HeadlineStat
                  label="Survival rate"
                  value={(stats.survival_rate * 100).toFixed(1)}
                  suffix="%"
                />
                <HeadlineStat
                  label="Full objective"
                  value={(stats.objective_rate * 100).toFixed(1)}
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

              {baselineStats ? (
                <div className="baseline-compare">
                  <div className="section-eyebrow">Baseline ({scenarioId}, 10K iterations)</div>
                  <div className="baseline-stats">
                    <span>Survival {(baselineStats.survival_rate * 100).toFixed(2)}%</span>
                    <span>Objective {(baselineStats.objective_rate * 100).toFixed(2)}%</span>
                    <span>Median IRR {(baselineStats.median_xirr * 100).toFixed(1)}%</span>
                    <span>Median MOIC {fmt(baselineStats.median_moic, 2)}x</span>
                  </div>
                </div>
              ) : null}

              <div className="sim-histograms">
                <SimulatorHistogram
                  values={results.outputs.xirr}
                  label="Levered IRR"
                  formatTick={(v) => `${(v * 100).toFixed(0)}%`}
                  formatValue={(v) => `${(v * 100).toFixed(1)}%`}
                  medianValue={stats.median_xirr}
                />
                <SimulatorHistogram
                  values={results.outputs.moic}
                  label="MOIC"
                  formatTick={(v) => `${v.toFixed(1)}x`}
                  formatValue={(v) => `${v.toFixed(2)}x`}
                  medianValue={stats.median_moic}
                />
                <SimulatorHistogram
                  values={results.outputs.foundation_end}
                  label="Foundation end ($M)"
                  formatTick={(v) => `${(v / 1000).toFixed(0)}`}
                  formatValue={(v) => `$${(v / 1000).toFixed(1)}M`}
                  medianValue={stats.median_foundation_end}
                />
                <SimulatorHistogram
                  values={results.outputs.realized_tax_benefit}
                  label="Realized tax benefit ($M)"
                  formatTick={(v) => `${(v / 1000).toFixed(0)}`}
                  formatValue={(v) => `$${(v / 1000).toFixed(1)}M`}
                  medianValue={stats.median_realized_tax}
                />
              </div>

              <p className="sim-caveat">
                {ITER_COUNT}-iteration sample with independent stochastic
                draws. The Named scenarios view uses 10,000 iterations with
                correlated draws (the full kernel). Use it as the
                authoritative distribution for those four scenarios.
              </p>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
