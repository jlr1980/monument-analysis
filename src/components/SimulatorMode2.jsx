export default function SimulatorMode2() {
  return (
    <div className="simulator-mode-2-stub">
      <div className="section-eyebrow">Coming next</div>
      <h3 className="mode2-heading">Distribution variants</h3>
      <p>
        The Distribution Variants mode lets a partner adjust the input
        distributions themselves rather than the deterministic scenario
        parameters. Snowpack mean, sales-velocity median, tax-realization
        shape, entitlement-delay scale, Foundation yield mean. Re-run the
        Monte Carlo against the modified distributions and see how the
        failure mechanisms shift.
      </p>
      <p>
        Modes 1 and 3 ship in this build. Mode 2 ships next: same Web Worker
        infrastructure, just with sliders for the five distribution
        parameters instead of the deterministic inputs.
      </p>
      <p className="placeholder-note">
        For now, Mode 1&rsquo;s headline rates are the partnership-facing
        numbers (10,000 iterations from the validated Python kernel). Mode 3
        lets you test custom configurations live.
      </p>
    </div>
  );
}
