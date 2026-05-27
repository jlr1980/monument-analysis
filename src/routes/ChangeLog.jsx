import MarkdownPage from "../components/MarkdownPage.jsx";
import engineChangelog from "../../content/engine_changelog.md?raw";
import monteCarloChangelog from "../../content/monte_carlo_changelog.md?raw";

export default function ChangeLog() {
  const combined = [
    "# Change Log",
    "",
    "Two parallel changelogs document the build of this analysis. The Engine Changelog covers the deterministic parametric engine in `models/monument_engine.xlsx`. The Monte Carlo Changelog covers the probabilistic layer on top of it, the memo and deck revisions that fold the analysis in, and the hub build.",
    "",
    "---",
    "",
    monteCarloChangelog,
    "",
    "---",
    "",
    engineChangelog,
  ].join("\n");
  return <MarkdownPage markdown={combined} />;
}
