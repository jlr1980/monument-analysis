import { ROUTES } from "../lib/router.js";

const MAIN_TABS = [
  { route: ROUTES.startHere, label: "Start here" },
  { route: ROUTES.memo, label: "Memo" },
  { route: ROUTES.model, label: "Model" },
  { route: ROUTES.simulator, label: "Simulator" },
];

const SUPPORTING_TABS = [
  { route: ROUTES.sources, label: "Sources" },
  { route: ROUTES.changelog, label: "Change Log" },
];

export default function Header({ route }) {
  return (
    <header className="app-header">
      <div className="app-header-inner">
        <a className="app-title" href="#/">
          <span className="app-title-mono">MONUMENT</span>
          <span className="app-title-suffix">ANALYSIS</span>
        </a>
        <span className="app-meta">Confidential</span>
      </div>
      <nav className="tab-bar-wrap">
        <div className="tab-bar">
          {MAIN_TABS.map((t) => (
            <a
              key={t.route || "start"}
              href={`#/${t.route}`}
              className={`tab ${route === t.route ? "active" : ""}`}
            >
              {t.label}
            </a>
          ))}
          <span className="tab-divider" aria-hidden="true" />
          {SUPPORTING_TABS.map((t) => (
            <a
              key={t.route}
              href={`#/${t.route}`}
              className={`tab tab-supporting ${route === t.route ? "active" : ""}`}
            >
              {t.label}
            </a>
          ))}
        </div>
      </nav>
    </header>
  );
}
