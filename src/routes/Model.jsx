import ModelInteractive from "../components/ModelInteractive.jsx";

function ModelSection({ eyebrow, heading, children }) {
  return (
    <section className="model-section">
      <div className="section-block">
        <div className="section-eyebrow">{eyebrow}</div>
        <h2 className="section-heading">{heading}</h2>
      </div>
      {children}
    </section>
  );
}

export default function Model() {
  // Static asset path: BASE_URL is "/monument-analysis/" in prod, "/" in dev.
  const href = `${import.meta.env.BASE_URL}monument_engine.xlsx`;

  return (
    <article className="markdown-page model-page">
      <h1>Model</h1>
      <p>
        A parametric engine built for this analysis, separate from the
        team&rsquo;s pro forma. It powers the scenario writeups in the memo,
        produces the deterministic outputs, and serves as the substrate the
        Monte Carlo iterates against. The interactive widget below runs a
        simplified version of the engine in the browser; partners can change
        inputs and watch outputs recompute. The full Excel workbook stays
        available for download (Part 05) for exact reconciliation.
      </p>

      <ModelInteractive />

      <ModelSection eyebrow="Part 01" heading="Engine architecture">
        <p>
          Nine sheets in calculation order. Each sheet reads the ones before
          it; nothing reads backward.
        </p>
        <table>
          <thead>
            <tr>
              <th>Sheet</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Inputs</td>
              <td>
                Active scenario dropdown, parameter table across five scenario
                columns, stochastic drivers block.
              </td>
            </tr>
            <tr>
              <td>Lot Schedule</td>
              <td>
                Phase definition (lot count and price per phase) and annual
                lot closings per scenario.
              </td>
            </tr>
            <tr>
              <td>Revenue</td>
              <td>
                Gross lot sales, Foundation contributions, initiation fees,
                club dues across the horizon.
              </td>
            </tr>
            <tr>
              <td>Development Cost</td>
              <td>
                Three-tier model: fixed amenity, variable per-lot,
                management-fee and contingency derived from the prior two.
              </td>
            </tr>
            <tr>
              <td>Foundation</td>
              <td>
                Annual roll-forward: lot contributions in, grants in, expenses
                out, yield on average principal.
              </td>
            </tr>
            <tr>
              <td>Debt</td>
              <td>
                Pre-existing legacy debt amortization (La Plata and Swans),
                plus a refinance-path option.
              </td>
            </tr>
            <tr>
              <td>Cash Flow</td>
              <td>
                Annual sources and uses, net profit, new-equity distribution
                timing.
              </td>
            </tr>
            <tr>
              <td>Peak Funding</td>
              <td>
                Monthly cash-trough analysis sizing the construction funding
                requirement.
              </td>
            </tr>
            <tr>
              <td>Reconciliation</td>
              <td>
                Six headline outputs versus the team&rsquo;s pro forma with
                tolerance and pass/fail status.
              </td>
            </tr>
          </tbody>
        </table>
      </ModelSection>

      <ModelSection eyebrow="Part 02" heading="Four named scenarios plus Custom">
        <p>
          A dropdown on the Inputs sheet selects among five scenarios. Each
          named scenario answers a different question about what the
          partnership wants the deal to optimize for; the Custom column is the
          partnership&rsquo;s working draft of any hybrid configuration.
        </p>
        <table>
          <thead>
            <tr>
              <th>Scenario</th>
              <th>Lots</th>
              <th>Phase pricing&nbsp;($K)</th>
              <th>Foundation&nbsp;/&nbsp;lot</th>
              <th>Structural choice</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Base</td>
              <td>27</td>
              <td>5,000 / 5,500 / 6,000</td>
              <td>$1.2M</td>
              <td>Team&rsquo;s pro forma as written.</td>
            </tr>
            <tr>
              <td>Staged</td>
              <td>27</td>
              <td>5,500 / 6,000 / 6,500</td>
              <td>$1.4M</td>
              <td>
                Same lot count as Base. Closing-condition protections
                (POF determination, tax counsel opinion, zoning rezone) with
                investor capital in escrow.
              </td>
            </tr>
            <tr>
              <td>Compact</td>
              <td>32</td>
              <td>6,500 (single phase)</td>
              <td>$1.8M</td>
              <td>Reduced mech rec scope; one rezone, smaller political surface.</td>
            </tr>
            <tr>
              <td>Conservation</td>
              <td>25</td>
              <td>7,500 (single phase)</td>
              <td>$3.2M</td>
              <td>
                Regional contribution mandate ($1M/yr for USU partnerships,
                watershed work, dark-sky preservation, civic engagement).
              </td>
            </tr>
            <tr>
              <td>Custom</td>
              <td colSpan="3">User-editable (yellow cells)</td>
              <td>
                The partnership&rsquo;s working draft for any hybrid that does
                not match the named scenarios.
              </td>
            </tr>
          </tbody>
        </table>
      </ModelSection>

      <ModelSection eyebrow="Part 03" heading="Reconciliation framework">
        <p>
          Reconciliation is what earns the engine the right to be trusted.
          Base case must reproduce the team&rsquo;s six headline numbers
          exactly within tolerance; other scenarios reconcile to the extent
          their structural choices flex the engine&rsquo;s parameters.
        </p>
        <table>
          <thead>
            <tr>
              <th>Scenario</th>
              <th>Reconciliation</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Base</td>
              <td>
                All six headline numbers (revenue, levered XIRR, MOIC, net
                profit, Foundation end balance, pre-existing debt service)
                reconcile to the team&rsquo;s pro forma within documented
                tolerance.
              </td>
            </tr>
            <tr>
              <td>Staged</td>
              <td>
                Same lot count and member base as Base. Numbers rest on the
                same reconciled basis; the 10 percent price premium is the
                only material parameter change.
              </td>
            </tr>
            <tr>
              <td>Compact</td>
              <td>
                Revenue, Foundation end balance, peak funding requirement,
                and realized tax benefit reconcile correctly. Precise XIRR
                and MOIC deferred to Monte Carlo for calibration.
              </td>
            </tr>
            <tr>
              <td>Conservation</td>
              <td>
                Same treatment as Compact. Revenue, Foundation, peak funding,
                and tax benefit flex correctly; XIRR and MOIC deferred to
                Monte Carlo.
              </td>
            </tr>
          </tbody>
        </table>
        <p>
          Per-scenario reconciliation deltas are documented sheet-by-sheet in
          the Engine Change Log, with the validation framework and tolerance
          calls recorded across every build session.
        </p>
      </ModelSection>

      <ModelSection eyebrow="Part 04" heading="Stochastic drivers">
        <p>
          The Inputs sheet carries a Stochastic Drivers block held neutral in
          scenario analysis. It activates as the correlation surface for the
          Monte Carlo. Five variables:
        </p>
        <ul>
          <li>
            <strong>Snowpack index</strong> &mdash; normal distribution
            centered at the historical 0.84 mean (16 percent below the 1979
            long-run).
          </li>
          <li>
            <strong>Sales velocity factor</strong> &mdash; lognormal centered
            at 0.9 with wider downside.
          </li>
          <li>
            <strong>Tax realization rate</strong> &mdash; beta distribution
            centered around 0.85 (OBBBA, audit risk, appraisal challenge).
          </li>
          <li>
            <strong>Entitlement delay</strong> &mdash; exponential, mode at
            zero with a long right tail.
          </li>
          <li>
            <strong>Foundation yield</strong> &mdash; normal centered at the
            historical 6 percent mean.
          </li>
        </ul>
        <p>
          The first four are correlated to capture realistic joint movement.
          Full distribution parameters, correlation matrix, and the two-tier
          criteria framework are documented in the Monte Carlo Change Log.
        </p>
      </ModelSection>

      <ModelSection eyebrow="Part 05" heading="Access the workbook">
        <p>
          The full workbook is available for partners who want to verify
          assumptions, modify inputs, or run their own scenarios. Opens in
          Excel. The Inputs sheet is the entry point; the dropdown at the top
          of that sheet drives every downstream calculation.
        </p>
        <p className="model-download">
          <a className="model-download-link" href={href} download>
            Download monument_engine.xlsx
          </a>
        </p>
      </ModelSection>

      <ModelSection eyebrow="Part 06" heading="Technical context">
        <p>
          The Monte Carlo runs on a Python kernel that reimplements the
          deterministic engine for simulation speed. At neutral stochastic
          inputs the kernel reproduces the Excel engine, with documented
          divergences on non-Base scenarios:
        </p>
        <ul>
          <li>
            <strong>Base.</strong> Reconciles exactly to the Excel engine on
            all six headline numbers.
          </li>
          <li>
            <strong>Staged.</strong> Reconciles exactly (same lot count and
            member base as Base).
          </li>
          <li>
            <strong>Compact.</strong> Python kernel diverges +1.6 percent on
            Foundation end balance and similar metrics.
          </li>
          <li>
            <strong>Conservation.</strong> Python kernel diverges &minus;6.6
            percent on Foundation end balance.
          </li>
        </ul>
        <p>
          Citation conventions throughout the analysis: deterministic values
          (the six headline numbers, the per-scenario writeups) reference the
          Excel engine; Monte Carlo distributions (survival rate, objective
          achievement, percentile shapes) reference the Python kernel. Both
          numbers are real outputs from two layers of the same engine
          architecture.
        </p>
      </ModelSection>
    </article>
  );
}
