import sanitizeHtml from "sanitize-html";

// Allow-list for user/agent-provided rich text (project descriptions).
// Only formatting tags — no scripts, styles, links, images, iframes, event
// handlers, etc. Anything outside this list is stripped, keeping stored HTML
// safe to render with dangerouslySetInnerHTML on the public site.
const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "p",
    "br",
    "strong",
    "b",
    "em",
    "i",
    "u",
    "ul",
    "ol",
    "li",
  ],
  allowedAttributes: {}, // no attributes at all (no style, no class, no href)
  // Drop the content of anything not allowed (e.g. <script>…</script>).
  disallowedTagsMode: "discard",
  // Normalise <b>/<i> from some editors to the semantic tags we keep.
  transformTags: {
    b: "strong",
    i: "em",
  },
};

/**
 * Sanitize a rich-text HTML string for safe storage/rendering.
 * Empty/whitespace-only input returns "".
 */
export function sanitizeRichText(input: unknown): string {
  if (typeof input !== "string") return "";
  const clean = sanitizeHtml(input, OPTIONS).trim();
  // Treat an editor's "empty" markup as truly empty.
  if (clean === "<p></p>" || clean === "<br />" || clean === "<br>") return "";
  return clean;
}

/**
 * Convert plain text (with newlines) into simple HTML paragraphs.
 * Used for content that arrives as plain text (e.g. the external agent) so it
 * renders with correct line breaks once the site outputs HTML.
 * If the input already contains block/format tags, it's treated as HTML and
 * only sanitized (not re-wrapped).
 */
export function plainTextToHtml(input: unknown): string {
  if (typeof input !== "string") return "";
  const text = input.replace(/\r\n/g, "\n").trim();
  if (!text) return "";

  // Already HTML? (contains one of our formatting tags) → just sanitize.
  if (/<(p|br|strong|b|em|i|u|ul|ol|li)\b/i.test(text)) {
    return sanitizeRichText(text);
  }

  // Plain text: split on blank lines into paragraphs, single \n → <br>.
  const paragraphs = text
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => `<p>${escapeText(block).replace(/\n/g, "<br>")}</p>`)
    .join("");

  return sanitizeRichText(paragraphs);
}

// Escape text so user characters like < & are not misread as markup.
function escapeText(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Strip all tags to plain text (for previews / card excerpts where formatting
 * would break line-clamp). Collapses whitespace.
 */
export function htmlToPlainText(input: unknown): string {
  if (typeof input !== "string") return "";
  const stripped = sanitizeHtml(input, { allowedTags: [], allowedAttributes: {} });
  // Decode a couple of common entities and collapse whitespace.
  return stripped
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}
