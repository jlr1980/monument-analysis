import { MarkdownContent } from "../components/MarkdownPage.jsx";
import startHereMarkdown from "../../content/start_here.md?raw";

export default function StartHere() {
  return (
    <article className="markdown-page start-here-page">
      <div className="start-here-hero">
        <img
          src={`${import.meta.env.BASE_URL}monument-vista.jpg`}
          alt=""
          loading="eager"
        />
        <div className="start-here-hero-overlay" aria-hidden="true" />
      </div>
      <MarkdownContent markdown={startHereMarkdown} />
    </article>
  );
}
