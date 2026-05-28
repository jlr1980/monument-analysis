import { useState, useMemo } from "react";
import { SCENARIOS, computeEngine } from "../lib/engine.js";

const SCENARIO_LIST = [
  { id: "base", label: "Base" },
  { id: "staged", label: "Staged" },
  { id: "compact", label: "Compact" },
  { id: "conservation", label: "Conservation" },
  { id: "custom", label: "Custom" },
];

function ScenarioSelector({ active, onSelect }) {
  return (
    <div className="scenario-selector">
      <div className="section-eyebrow">Scenario</div>
      <div className="scenario-pills">
        {SCENARIO_LIST.map((sc) => (
          <button
            key={sc.id}
            type="button"
            className={`scenario-pill ${active === sc.id ? "active" : ""}`}
            onClick={() => onSelect(sc.id)}
          >
            {sc.label}
          </button>
        ))}
      </div>
    </div>
  );
}

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
        {/* Always render the suffix slot (empty when none) so every input box
            shares the same right edge regardless of $K / % suffixes. */}
        <span className="input-suffix">{suffix || ""}</span>
      </span>
    </label>
  );
}

function InputsPanel({ inputs, onChange }) {
  const showPhase2 = inputs.phase2_lots > 0;
  const showPhase3 = inputs.phase3_lots > 0;

  return (
    <div className="inputs-panel">
      <div className="section-eyebrow">Inputs</div>
      <h3 className="inputs-heading">Editable assumptions</h3>
      <div className="inputs-grid">
        <NumberInput
          label="Lot count"
          value={inputs.revenue_lots}
          min={20}
          max={50}
          step={1}
          onChange={(v) => onChange("revenue_lots", v)}
        />
        <NumberInput
          label="Phase 1 lot price"
          value={inputs.phase1_price_K}
          min={3000}
          max={10000}
          step={100}
          onChange={(v) => onChange("phase1_price_K", v)}
          suffix="$K"
        />
        {showPhase2 ? (
          <NumberInput
            label="Phase 2 lot price"
            value={inputs.phase2_price_K}
            min={3000}
            max={10000}
            step={100}
            onChange={(v) => onChange("phase2_price_K", v)}
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
            onChange={(v) => onChange("phase3_price_K", v)}
            suffix="$K"
          />
        ) : null}
        <NumberInput
          label="Foundation contribution per lot"
          value={inputs.foundation_contribution_per_lot_K}
          min={500}
          max={5000}
          step={100}
          onChange={(v) => onChange("foundation_contribution_per_lot_K", v)}
          suffix="$K"
        />
        <NumberInput
          label="Tax realization rate"
          value={inputs.tax_realization_rate}
          min={0}
          max={1}
          step={0.05}
          onChange={(v) => onChange("tax_realization_rate", v)}
        />
        <NumberInput
          label="Foundation yield"
          value={Number((inputs.foundation_yield_annual * 100).toFixed(2))}
          min={3}
          max={10}
          step={0.25}
          onChange={(v) => onChange("foundation_yield_annual", v / 100)}
          suffix="%"
        />
        <NumberInput
          label="Sales velocity factor"
          value={inputs.sales_velocity_factor}
          min={0.5}
          max={1.5}
          step={0.05}
          onChange={(v) => onChange("sales_velocity_factor", v)}
        />
      </div>
    </div>
  );
}

function fmt(value, decimals = 1) {
  if (!Number.isFinite(value)) return "n/a";
  return value.toFixed(decimals);
}

function Stat({ label, value, suffix, emphasis = false }) {
  return (
    <div className={`output-stat ${emphasis ? "output-stat-emphasis" : ""}`}>
      <div className="output-value">
        {value}
        {suffix ? <span className="output-suffix">{suffix}</span> : null}
      </div>
      <div className="output-label">{label}</div>
    </div>
  );
}

function OutputsPanel({ outputs, scenarioId }) {
  const isDeferred = scenarioId === "compact" || scenarioId === "conservation";

  return (
    <div className="outputs-panel">
      <div className="section-eyebrow">Outputs</div>
      <h3 className="outputs-heading">Live recompute</h3>
      <div className="outputs-grid">
        <Stat label="Revenue" value={fmt(outputs.revenue / 1000)} suffix="M" emphasis />
        <Stat
          label="Foundation contribution"
          value={fmt(outputs.foundation_contribution_total / 1000)}
          suffix="M"
        />
        <Stat
          label="Foundation end"
          value={fmt(outputs.foundation_end / 1000)}
          suffix="M"
          emphasis
        />
        <Stat label="Realized tax" value={fmt(outputs.realized_tax / 1000)} suffix="M" emphasis />
        <Stat label="Net profit" value={fmt(outputs.net_profit / 1000)} suffix="M" />
        <Stat label="MOIC" value={fmt(outputs.moic, 2)} suffix="x" emphasis />
        <Stat
          label="Levered IRR"
          value={Number.isFinite(outputs.xirr) ? fmt(outputs.xirr * 100, 1) : "n/a"}
          suffix={Number.isFinite(outputs.xirr) ? "%" : ""}
        />
      </div>
      {isDeferred ? (
        <p className="outputs-caveat">
          For Compact and Conservation, the deterministic IRR and MOIC are not
          fully reconciled against smaller-member club operating cost. See Memo
          Section 3.1.
        </p>
      ) : null}
    </div>
  );
}

export default function ModelInteractive() {
  const [scenarioId, setScenarioId] = useState("base");
  const [inputs, setInputs] = useState(SCENARIOS.base);

  const selectScenario = (id) => {
    setScenarioId(id);
    setInputs({ ...SCENARIOS[id] });
  };

  const updateInput = (key, value) => {
    setInputs((prev) => {
      const updated = { ...prev, [key]: value };
      // When lot count changes, also scale the velocity schedule and keep
      // single-phase scenarios' phase1_lots matched to the new lot count.
      if (key === "revenue_lots") {
        const oldTotal = prev.sales_velocity.reduce((a, b) => a + b, 0);
        const scale = oldTotal > 0 ? value / oldTotal : 1.0;
        updated.sales_velocity = prev.sales_velocity.map((v) => v * scale);
        const isSinglePhase = prev.phase2_lots === 0;
        if (isSinglePhase) {
          updated.phase1_lots = value;
        }
      }
    return updated;
    });
  };

  const outputs = useMemo(() => computeEngine(inputs), [inputs]);

  return (
    <section className="model-interactive">
      <ScenarioSelector active={scenarioId} onSelect={selectScenario} />
      <div className="model-interactive-grid">
        <InputsPanel inputs={inputs} onChange={updateInput} />
        <OutputsPanel outputs={outputs} scenarioId={scenarioId} />
      </div>
    </section>
  );
}
