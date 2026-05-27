import { MarkdownContent } from "../components/MarkdownPage.jsx";
import engineChangelog from "../../content/engine_changelog.md?raw";
import monteCarloChangelog from "../../content/monte_carlo_changelog.md?raw";

// Drop the leading h1 from the source markdown. Each changelog file has its
// own top-level title ("# Monument Parametric Engine — Change Log", etc.)
// which would compete with the page's "Change Log" h1 and the PART dividers
// if rendered inline. The PART eyebrow + heading take its place.
function stripLeadingH1(md) {
  return md.replace(/^#\s+[^\n]*\n+/, "");
}

function PartDivider({ eyebrow, heading }) {
  return (
    <div className="section-block">
      <div className="section-eyebrow">{eyebrow}</div>
      <h2 className="section-heading">{heading}</h2>
    </div>
  );
}

export default function ChangeLog() {
  return (
    <article className="markdown-page changelog-page">
      <h1>Change Log</h1>

      <p>
        The change log is the audit trail for this analysis. Each entry
        documents what was built, why it was built that way, and what
        decisions were made along the path. Partners do not need to read
        this section to follow the memo&rsquo;s argument or the deck&rsquo;s
        findings. The log is here for partners who want to interrogate how
        the analysis was built or who want to verify a specific decision.
      </p>

      <p>
        The log is in two parts. The Engine Change Log documents the
        parametric financial engine, which is the deterministic foundation
        for the scenario analysis. The Monte Carlo Change Log documents the
        probabilistic layer that sits on top of the engine, including the
        memo and deck revisions that fold the analysis in.
      </p>

      <PartDivider eyebrow="Part 01" heading="Engine Change Log" />
      <MarkdownContent markdown={stripLeadingH1(engineChangelog)} />

      <PartDivider eyebrow="Part 02" heading="Monte Carlo Change Log" />
      <MarkdownContent markdown={stripLeadingH1(monteCarloChangelog)} />
    </article>
  );
}
