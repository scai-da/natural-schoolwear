// A small, dependency-free Markdown converter.
// Supports: headings, paragraphs, bold, italic, links, inline code,
// ordered/unordered lists (one level of nesting), blockquotes, tables,
// horizontal rules, images and fenced code blocks.

const esc = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/&[a-z]+;/g, "")
    .replace(/['’"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export function inline(text) {
  // Protect inline code first
  const codes = [];
  let s = text.replace(/`([^`]+)`/g, (_, c) => {
    codes.push(`<code>${esc(c)}</code>`);
    return `\u0000${codes.length - 1}\u0000`;
  });
  s = esc(s);
  // Images ![alt](src)
  s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+&quot;([^&]*)&quot;)?\)/g, (_, alt, src, title) =>
    `<img src="${src}" alt="${alt}" loading="lazy"${title ? ` title="${title}"` : ""}>`
  );
  // Links [text](url)
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, href) => {
    const external = /^https?:\/\//.test(href);
    return `<a href="${href}"${external ? ' rel="noopener" target="_blank"' : ""}>${label}</a>`;
  });
  // Bold then italic
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/__([^_]+)__/g, "<strong>$1</strong>");
  s = s.replace(/(^|[^*])\*([^*\s][^*]*?)\*(?!\*)/g, "$1<em>$2</em>");
  s = s.replace(/(^|[\s(])_([^_\s][^_]*?)_(?=[\s).,;:!?]|$)/g, "$1<em>$2</em>");
  // Typographic quotes and dashes are left as written by the author.
  s = s.replace(/\u0000(\d+)\u0000/g, (_, i) => codes[+i]);
  return s;
}

export function markdown(src, { headingIds = true } = {}) {
  const lines = src.replace(/\r\n?/g, "\n").split("\n");
  const out = [];
  let i = 0;

  const isBlank = (l) => /^\s*$/.test(l);
  const isUl = (l) => /^\s*[-*+]\s+/.test(l);
  const isOl = (l) => /^\s*\d+[.)]\s+/.test(l);
  const isTableSep = (l) => /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)*\|?\s*$/.test(l);
  const splitRow = (l) =>
    l.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());

  while (i < lines.length) {
    const line = lines[i];

    if (isBlank(line)) { i++; continue; }

    // Raw HTML block (passed through untouched until the next blank line)
    if (/^<(p|div|h[1-6]|ul|ol|table|figure|blockquote|img|iframe|section|aside|details|!--)[\s>/]/i.test(line.trim())) {
      const buf = [];
      while (i < lines.length && !isBlank(lines[i])) buf.push(lines[i++]);
      out.push(buf.join("\n"));
      continue;
    }

    // Fenced code
    if (/^```/.test(line)) {
      const buf = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) buf.push(lines[i++]);
      i++;
      out.push(`<pre><code>${esc(buf.join("\n"))}</code></pre>`);
      continue;
    }

    // Headings
    const h = line.match(/^(#{1,6})\s+(.*?)\s*#*\s*$/);
    if (h) {
      const level = h[1].length;
      const html = inline(h[2]);
      const id = headingIds ? ` id="${slugify(h[2])}"` : "";
      out.push(`<h${level}${id}>${html}</h${level}>`);
      i++;
      continue;
    }

    // Horizontal rule
    if (/^\s*([-*_])(\s*\1){2,}\s*$/.test(line)) { out.push("<hr>"); i++; continue; }

    // Blockquote
    if (/^\s*>/.test(line)) {
      const buf = [];
      while (i < lines.length && /^\s*>/.test(lines[i])) buf.push(lines[i++].replace(/^\s*>\s?/, ""));
      out.push(`<blockquote>${markdown(buf.join("\n"), { headingIds: false })}</blockquote>`);
      continue;
    }

    // Table
    if (line.includes("|") && i + 1 < lines.length && isTableSep(lines[i + 1])) {
      const head = splitRow(line);
      const aligns = splitRow(lines[i + 1]).map((c) =>
        c.startsWith(":") && c.endsWith(":") ? "center" : c.endsWith(":") ? "right" : ""
      );
      i += 2;
      const rows = [];
      while (i < lines.length && lines[i].includes("|") && !isBlank(lines[i])) rows.push(splitRow(lines[i++]));
      const cell = (tag, c, j) =>
        `<${tag}${aligns[j] ? ` style="text-align:${aligns[j]}"` : ""}${tag === "th" && j === 0 && !c ? ' aria-label="Feature"' : ""}>${inline(c)}</${tag}>`;
      out.push(
        `<div class="table-wrap"><table><thead><tr>${head.map((c, j) => cell("th", c, j)).join("")}</tr></thead>` +
          `<tbody>${rows.map((r) => `<tr>${r.map((c, j) => (j === 0 ? cell("th", c, j).replace("<th", '<th scope="row"') : cell("td", c, j))).join("")}</tr>`).join("")}</tbody></table></div>`
      );
      continue;
    }

    // Lists
    if (isUl(line) || isOl(line)) {
      const ordered = isOl(line);
      const items = [];
      while (i < lines.length && (isUl(lines[i]) || isOl(lines[i]) || (/^\s{2,}\S/.test(lines[i]) && items.length))) {
        const l = lines[i];
        const indent = l.match(/^\s*/)[0].length;
        if (indent >= 2 && items.length) {
          items[items.length - 1].children.push(l.slice(Math.min(indent, 4)));
        } else {
          items.push({ text: l.replace(/^\s*([-*+]|\d+[.)])\s+/, ""), children: [] });
        }
        i++;
        // allow a single blank line between items of the same list
        if (i < lines.length && isBlank(lines[i]) && i + 1 < lines.length && (ordered ? isOl(lines[i + 1]) : isUl(lines[i + 1]))) i++;
      }
      const tag = ordered ? "ol" : "ul";
      out.push(
        `<${tag}>${items
          .map((it) => `<li>${inline(it.text)}${it.children.length ? markdown(it.children.join("\n"), { headingIds: false }) : ""}</li>`)
          .join("")}</${tag}>`
      );
      continue;
    }

    // Paragraph
    const buf = [];
    while (
      i < lines.length &&
      !isBlank(lines[i]) &&
      !/^(#{1,6})\s/.test(lines[i]) &&
      !/^```/.test(lines[i]) &&
      !/^\s*>/.test(lines[i]) &&
      !isUl(lines[i]) &&
      !isOl(lines[i])
    ) buf.push(lines[i++].trim());
    const text = buf.join(" ");
    // A paragraph that is entirely italic is treated as an aside/note.
    if (/^\*[^*].*\*$/.test(text) && !text.slice(1, -1).includes("*")) {
      out.push(`<p class="aside">${inline(text.slice(1, -1))}</p>`);
    } else {
      out.push(`<p>${inline(text)}</p>`);
    }
  }
  return out.join("\n");
}

// Minimal YAML front matter parser for simple key: value pairs and [a, b] lists.
export function frontmatter(src) {
  const m = src.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { data: {}, body: src };
  const data = {};
  for (const raw of m[1].split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const kv = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!kv) continue;
    let [, k, v] = kv;
    v = v.trim();
    if (/^\[.*\]$/.test(v)) {
      v = v.slice(1, -1).split(",").map((x) => x.trim().replace(/^["']|["']$/g, "")).filter(Boolean);
    } else if (/^(true|false)$/i.test(v)) {
      v = v.toLowerCase() === "true";
    } else if (/^".*"$/.test(v) || /^'.*'$/.test(v)) {
      v = v.slice(1, -1).replace(/\\"/g, '"').replace(/''/g, "'");
    }
    data[k] = v;
  }
  return { data, body: m[2] };
}
