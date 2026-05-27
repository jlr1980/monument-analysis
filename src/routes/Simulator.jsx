export default function Simulator() {
  return (
    <article className="markdown-page">
      <h1>Simulator</h1>
      <p>
        The interactive simulator is a Phase 2 deliverable. It will sit here,
        in this section, and run the same parametric engine the Model section
        downloads as an Excel workbook.
      </p>
      <h2>What it will do</h2>
      <ul>
        <li>
          Let a partner pick a scenario from a dropdown and see the six
          headline numbers recalculate live.
        </li>
        <li>
          Expose the Custom column as editable inputs, with the engine
          recomputing on every change.
        </li>
        <li>
          Run a Monte Carlo distribution against the active scenario and
          show survival and objective achievement rates, plus distribution
          shapes for the key metrics.
        </li>
        <li>
          Surface the failure mechanism analysis from Section 6.3 of the
          memo: which stochastic drivers correlate with which criterion
          failures, per scenario.
        </li>
      </ul>
      <p className="placeholder-note">
        Until the simulator ships, the Model section provides the Excel
        workbook and the Memo and Deck sections carry the analytical
        conclusions the simulator would let a partner re-derive interactively.
      </p>
    </article>
  );
}
