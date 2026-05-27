import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Extract plain text from react-markdown's children (string or array of strings/nodes).
function extractText(children) {
  if (typeof children === "string") return children;
  if (Array.isArray(children)) {
    return children
      .map((c) => (typeof c === "string" ? c : c?.props?.children ?? ""))
      .join("");
  }
  return "";
}

// h2: detect either "N. Title" (memo section) or "Session N..." (changelog).
function H2({ children, ...rest }) {
  const text = extractText(children);

  // Memo section pattern: "1. Title"
  const sectionMatch = text.match(/^(\d+)\.\s+(.+)$/);
  if (sectionMatch) {
    const num = sectionMatch[1].padStart(2, "0");
    return (
      <div className="section-block">
        <div className="section-eyebrow">SECTION {num}</div>
        <h2 className="section-heading">{sectionMatch[2]}</h2>
      </div>
    );
  }

  // Changelog session pattern: "Session N", "Session N: Title", "Session N -- Title".
  // Rendered as h3 with subsection styling so the PART 01 / PART 02 dividers in
  // ChangeLog.jsx remain the top-level visual hierarchy.
  const sessionMatch = text.match(/^Session\s+(\d+)(?:\s*(?::|--)\s*(.+))?$/i);
  if (sessionMatch) {
    const num = sessionMatch[1].padStart(2, "0");
    const title = sessionMatch[2] || "";
    return (
      <div className="subsection-block">
        <div className="subsection-eyebrow">SESSION {num}</div>
        <h3 className="subsection-heading">{title}</h3>
      </div>
    );
  }

  return <h2 {...rest}>{children}</h2>;
}

// h3: detect "N.M Title" prefix, render as subsection block with smaller eyebrow.
function H3({ children, ...rest }) {
  const text = extractText(children);
  const m = text.match(/^(\d+(?:\.\d+)+)\s+(.+)$/);
  if (m) {
    return (
      <div className="subsection-block">
        <div className="subsection-eyebrow">{m[1]}</div>
        <h3 className="subsection-heading">{m[2]}</h3>
      </div>
    );
  }
  return <h3 {...rest}>{children}</h3>;
}

const components = {
  h2: H2,
  h3: H3,
};

// Inner markdown renderer, no article wrapper. Used by pages that need to
// embed multiple markdown blocks inside their own article (e.g., ChangeLog).
export function MarkdownContent({ markdown }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {markdown}
    </ReactMarkdown>
  );
}

// Default export: full page with article wrapper.
export default function MarkdownPage({ markdown }) {
  return (
    <article className="markdown-page">
      <MarkdownContent markdown={markdown} />
    </article>
  );
}
