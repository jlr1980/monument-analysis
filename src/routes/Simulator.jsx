function Section({ eyebrow, heading, children, className = "" }) {
  return (
    <section className={`simulator-section ${className}`}>
      <div className="section-block">
        <div className="section-eyebrow">{eyebrow}</div>
        <h2 className="section-heading">{heading}</h2>
      </div>
      {children}
    </section>
  );
}

function ModeCard({ eyebrow, heading, description }) {
  return (
    <div className="card-light simulator-mode-card">
      <div className="source-eyebrow">{eyebrow}</div>
      <h3 className="source-title">{heading}</h3>
      <p className="source-description">{description}</p>
    </div>
  );
}

function Stat({ value, label }) {
  return (
    <div className="simulator-stat">
      <div className="stat-number">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

export default function Simulator() {
  return (
    <article className="markdown-page simulator-page">
      <h1>Simulator</h1>
      <p>
        This is where the analysis becomes interactive. Partners will be able
        to interrogate scenarios directly, test their own assumptions, and
        see how outcomes shift across the parameter space. The static
        analysis ships first; the interactive layer follows.
      </p>

      <Section eyebrow="What's coming" heading="Interactive scenario analysis">
        <p>
          Three modes of interaction, designed to support different ways
          partners might want to engage with the analysis. The default mode
          presents the named scenarios alongside their Monte Carlo
          distributions. The variant mode lets partners adjust the input
          assumptions behind the analysis. The custom mode lets partners
          design configurations outside the four named scenarios entirely.
        </p>
      </Section>

      <Section eyebrow="Interface" heading="Three modes">
        <p>
          Each mode targets a different question. Together they let a partner
          move from &ldquo;what does the team&rsquo;s deal look like under
          variation&rdquo; to &ldquo;what would my own configuration look
          like.&rdquo;
        </p>
        <div className="simulator-modes">
          <ModeCard
            eyebrow="Mode 01"
            heading="Named scenarios"
            description="The default mode. Select Base, Staged, Compact, or Conservation. See the deterministic outputs alongside the Monte Carlo distribution: median, 5th and 95th percentile, full histogram, survival and objective achievement rates."
          />
          <ModeCard
            eyebrow="Mode 02"
            heading="Distribution variants"
            description="Adjust the input assumptions. Widen or narrow distributions on snowpack, sales velocity, tax realization, or Foundation yield. Change correlation between variables. Re-run and watch the failure mechanisms shift."
          />
          <ModeCard
            eyebrow="Mode 03"
            heading="Custom configurations"
            description="Design parameter sliders. Configure lot count, phase pricing, Foundation contribution per lot, sales velocity, entitlement timeline. Build a configuration outside the four named scenarios and see how it performs end to end."
          />
        </div>
      </Section>

      <section className="simulator-engine">
        <div className="card-dark simulator-engine-card">
          <div className="section-eyebrow">What&rsquo;s behind it</div>
          <h2 className="section-heading">10,000 iterations, five drivers</h2>
          <p>
            The simulator runs the same Monte Carlo described in Section 6 of
            the memo. Every iteration draws five correlated stochastic inputs,
            runs the parametric engine, and records the six headline numbers
            plus pass-fail flags on two tiers of structural criteria. The
            engine itself is documented in the Model tab.
          </p>
          <div className="simulator-stats">
            <Stat value="10,000" label="Iterations per scenario" />
            <Stat value="5" label="Stochastic drivers" />
            <Stat value="4×4" label="Correlation matrix" />
            <Stat value="2-tier" label="Success criteria" />
          </div>
          <p>
            Full distribution parameters, the correlation matrix, and the
            survival and objective criteria framework are documented in the
            Monte Carlo Change Log.
          </p>
        </div>
      </section>

      <Section eyebrow="Status" heading="Phase 2">
        <p>
          The simulator is Phase 2. The static analysis (memo, deck, model,
          sources, change log) ships first; the interactive layer follows.
          The underlying simulation engine has already been built and
          validated against the deterministic Excel engine; the work that
          remains is the front-end interface partners interact with.
        </p>
        <p>
          Partners with specific scenarios they want simulated before the
          interactive layer ships can request them directly. The infrastructure
          is in place; running a custom configuration through the Monte Carlo
          is a matter of hours, not weeks.
        </p>
      </Section>
    </article>
  );
}
