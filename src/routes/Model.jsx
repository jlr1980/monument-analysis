export default function Model() {
  // Base path comes from Vite at build time (BASE_URL = "/monument-analysis/" in production,
  // "/" in development). Static assets in public/ are served at BASE_URL + filename.
  const href = `${import.meta.env.BASE_URL}monument_engine.xlsx`;

  return (
    <article className="markdown-page">
      <h1>Model</h1>
      <p>
        The deterministic parametric engine that powers the scenario writeups
        and the Monte Carlo analysis. Nine sheets in calculation order: Inputs,
        Lot Schedule, Revenue, Development Cost, Foundation, Debt, Cash Flow,
        Peak Funding, Reconciliation. The Inputs sheet drives the active
        scenario via a dropdown; all downstream sheets recalculate.
      </p>
      <p>
        Base Case reconciles to the team&rsquo;s pro forma at the six headline
        numbers within the documented tolerances. Compact and Conservation
        diverge by +1.6 percent and &minus;6.6 percent respectively at the
        Foundation end balance; details in the Change Log.
      </p>
      <p className="model-download">
        <a className="model-download-link" href={href} download>
          Download monument_engine.xlsx
        </a>
      </p>
      <p className="model-note">
        Opens in Excel. The simulator section will eventually expose the same
        engine through an in-browser interface; for now, the workbook itself
        is the partnership-facing artifact.
      </p>
    </article>
  );
}
