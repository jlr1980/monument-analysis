import { useState, useEffect } from "react";
import SimulatorMode1 from "../components/SimulatorMode1.jsx";
import SimulatorMode3 from "../components/SimulatorMode3.jsx";
import { SCENARIOS } from "../lib/engine.js";

const MODES = [
  {
    id: "named",
    label: "Named scenarios",
    caption: "Pre-computed Monte Carlo for the four named scenarios",
  },
  {
    id: "custom",
    label: "Custom configurations",
    caption: "Run the Monte Carlo live against your own inputs",
  },
];

export default function Simulator() {
  const [mode, setMode] = useState("named");

  // Pre-computed iteration data, lazy-loaded on first mount.
  const [iterData, setIterData] = useState(null);
  const [loadError, setLoadError] = useState(null);

  // Named-scenarios state: which scenario is shown.
  const [namedScenario, setNamedScenario] = useState("base");

  // Custom state: scenario starting point + inputs + results.
  const [customScenarioId, setCustomScenarioId] = useState("base");
  const [customInputs, setCustomInputs] = useState({ ...SCENARIOS.base });
  const [customResults, setCustomResults] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const url = `${import.meta.env.BASE_URL}iteration-data.json`;
    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        if (!cancelled) setIterData(data);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <article className="markdown-page simulator-page">
      <h1>Simulator</h1>
      <p>
        Interactive Monte Carlo across the four named scenarios. Named
        scenarios show the pre-computed 10,000-iteration distribution for each
        scenario. Custom configurations run a live 1,000-iteration sample
        against any set of inputs. The underlying engine and stochastic drivers
        are the same; see Memo Section 6 for the analytical framing and the
        Change Log for the build history.
      </p>

      <div className="mode-selector">
        <div className="section-eyebrow">Mode</div>
        <div className="mode-buttons">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              className={`mode-button ${mode === m.id ? "active" : ""}`}
              onClick={() => setMode(m.id)}
            >
              <div className="mode-button-label">{m.label}</div>
              <div className="mode-button-caption">{m.caption}</div>
            </button>
          ))}
        </div>
      </div>

      {loadError ? (
        <div className="sim-loading">
          Unable to load iteration data ({loadError}). Named scenarios
          unavailable; custom configurations still run live.
        </div>
      ) : null}

      {mode === "named" ? (
        <SimulatorMode1
          data={iterData}
          scenario={namedScenario}
          setScenario={setNamedScenario}
        />
      ) : null}

      {mode === "custom" ? (
        <SimulatorMode3
          inputs={customInputs}
          setInputs={setCustomInputs}
          scenarioId={customScenarioId}
          setScenarioId={setCustomScenarioId}
          results={customResults}
          setResults={setCustomResults}
          baselineData={iterData}
        />
      ) : null}
    </article>
  );
}
