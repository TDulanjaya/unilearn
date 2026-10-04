// tags we allow in announcement html
const ALLOWED_TAGS = new Set([
  "p", "br", "b", "strong", "i", "em", "u", "ul", "ol", "li", "a",
  "h1", "h2", "h3", "h4", "blockquote", "span", "div",
]);

// these tags are removed together with everything inside them
const DROP_WITH_CONTENT = new Set([
  "script", "style", "iframe", "object", "embed", "noscript", "template", "svg", "math",
]);

function stripTags(html: string): string {
  return html
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, "")
    .replace(/<[^>]*>/g, "")
    // any left over brackets are shown as text
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .trim();
}

function isSafeHref(href: string): boolean {
  // remove spaces and control chars so "java\nscript:" is caught too
  const clean = href.replace(/[\u0000- ]/g, "").toLowerCase();
  return !(clean.startsWith("javascript:") || clean.startsWith("vbscript:") || clean.startsWith("data:"));
}

function cleanNode(node: Node, doc: Document) {
  const children = Array.from(node.childNodes);
  for (const child of children) {
    if (child.nodeType === Node.TEXT_NODE) continue;

    if (child.nodeType !== Node.ELEMENT_NODE) {
      // comments and other node types are not needed
      node.removeChild(child);
      continue;
    }

    const el = child as Element;
    const tag = el.tagName.toLowerCase();

    if (DROP_WITH_CONTENT.has(tag)) {
      node.removeChild(el);
      continue;
    }

    // clean the children first
    cleanNode(el, doc);

    if (!ALLOWED_TAGS.has(tag)) {
      // keep the text, remove the tag itself
      const frag = doc.createDocumentFragment();
      while (el.firstChild) frag.appendChild(el.firstChild);
      node.replaceChild(frag, el);
      continue;
    }

    // only href is kept, and only on links
    for (const attr of Array.from(el.attributes)) {
      const name = attr.name.toLowerCase();
      if (tag === "a" && name === "href") continue;
      el.removeAttribute(attr.name);
    }

    if (tag === "a") {
      const href = el.getAttribute("href");
      if (href && !isSafeHref(href)) el.removeAttribute("href");
      el.setAttribute("rel", "noopener noreferrer");
      el.setAttribute("target", "_blank");
    }
  }
}

export function sanitizeHtml(html: string | null | undefined): string {
  if (!html) return "";

  // on the server there is no DOMParser, so just send plain text
  if (typeof window === "undefined" || typeof DOMParser === "undefined") {
    return stripTags(html);
  }

  const doc = new DOMParser().parseFromString(html, "text/html");
  cleanNode(doc.body, doc);
  return doc.body.innerHTML;
}
