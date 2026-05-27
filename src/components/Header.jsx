import { ROUTES } from "../lib/router.js";

const TABS = [
  { route: ROUTES.memo, label: "Memo" },
  { route: ROUTES.deck, label: "Deck" },
  { route: ROUTES.model, label: "Model" },
  { route: ROUTES.simulator, label: "Simulator" },
  { route: ROUTES.sources, label: "Sources" },
  { route: ROUTES.changelog, label: "Change Log" },
];

export default function Header({ route }) {
  return (
    <header className="app-header">
      <div className="app-header-inner">
        <a className="app-title" href="#/memo">
          Monument Analysis
        </a>
      </div>
      <nav className="tab-bar-wrap">
        <div className="tab-bar">
          {TABS.map((t) => (
            <a
              key={t.route}
              href={`#/${t.route}`}
              className={`tab ${route === t.route ? "active" : ""}`}
            >
              {t.label}
            </a>
          ))}
        </div>
      </nav>
    </header>
  );
}
