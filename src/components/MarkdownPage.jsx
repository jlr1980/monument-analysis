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

// h2: detect "N. Title" prefix, render as section block with eyebrow + heading.
// Heading text loses the number; the eyebrow shows "SECTION 0N".
function H2({ children, ...rest }) {
  const text = extractText(children);
  const m = text.match(/^(\d+)\.\s+(.+)$/);
  if (m) {
    const num = m[1].padStart(2, "0");
    return (
      <div className="section-block">
        <div className="section-eyebrow">SECTION {num}</div>
        <h2 className="section-heading">{m[2]}</h2>
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

export default function MarkdownPage({ markdown }) {
  return (
    <article className="markdown-page">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {markdown}
      </ReactMarkdown>
    </article>
  );
}
