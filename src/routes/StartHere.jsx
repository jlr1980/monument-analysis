import MarkdownPage from "../components/MarkdownPage.jsx";
import startHereMarkdown from "../../content/start_here.md?raw";

export default function StartHere() {
  return <MarkdownPage markdown={startHereMarkdown} />;
}
