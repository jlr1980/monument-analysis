import { useState, useEffect } from "react";
import SimulatorMode1 from "../components/SimulatorMode1.jsx";
import SimulatorMode2 from "../components/SimulatorMode2.jsx";
import SimulatorMode3 from "../components/SimulatorMode3.jsx";
import { SCENARIOS } from "../lib/engine.js";

const MODES = [
  { id: 1, label: "Named scenarios", caption: "Pre-computed Monte Carlo for the four named scenarios" },
  { id: 2, label: "Distribution variants", caption: "Adjust the input distributions (coming next)" },
  { id: 3, label: "Custom configurations", caption: "Run the Monte Carlo against your own inputs" },
];

export default function Simulator() {
  const [mode, setMode] = useState(1);

  // Pre-computed iteration data, lazy-loaded on first mount.
  const [iterData, setIterData] = useState(null);
  const [loadError, setLoadError] = useState(null);

  // Mode 1 state: which scenario is shown.
  const [mode1Scenario, setMode1Scenario] = useState("base");

  // Mode 3 state: scenario starting point + inputs + results.
  const [mode3ScenarioId, setMode3ScenarioId] = useState("base");
  const [mode3Inputs, setMode3Inputs] = useState({ ...SCENARIOS.base });
  const [mode3Results, setMode3Results] = useState(null);

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
        Interactive Monte Carlo across the four named scenarios. Mode 1
        shows the pre-computed 10,000-iteration distribution for each
        scenario. Mode 3 runs a live 1,000-iteration sample against any
        custom configuration. The underlying engine and stochastic drivers
        are the same; see the Memo Section 6 for the analytical framing and
        the Change Log for the build history.
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
          Unable to load iteration data ({loadError}). Mode 1 unavailable;
          Mode 3 still runs live.
        </div>
      ) : null}

      {mode === 1 ? (
        <SimulatorMode1
          data={iterData}
          scenario={mode1Scenario}
          setScenario={setMode1Scenario}
        />
      ) : null}

      {mode === 2 ? <SimulatorMode2 /> : null}

      {mode === 3 ? (
        <SimulatorMode3
          inputs={mode3Inputs}
          setInputs={setMode3Inputs}
          scenarioId={mode3ScenarioId}
          setScenarioId={setMode3ScenarioId}
          results={mode3Results}
          setResults={setMode3Results}
          baselineData={iterData}
        />
      ) : null}
    </article>
  );
}
