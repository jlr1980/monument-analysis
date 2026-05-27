import MarkdownPage from "../components/MarkdownPage.jsx";
import memoMarkdown from "../../content/memo.md?raw";

export default function Memo() {
  return <MarkdownPage markdown={memoMarkdown} />;
}
