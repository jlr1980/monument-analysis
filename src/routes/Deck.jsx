import MarkdownPage from "../components/MarkdownPage.jsx";
import deckMarkdown from "../../content/deck.md?raw";

export default function Deck() {
  return <MarkdownPage markdown={deckMarkdown} />;
}
