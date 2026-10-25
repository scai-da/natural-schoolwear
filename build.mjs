#!/usr/bin/env node
// Natural Schoolwear site builder. No dependencies: needs only Node 18+.
//
//   node build.mjs            build the site into ./dist
//   npm run dev               build, serve at http://localhost:4321 and rebuild on change
//   node build.mjs --drafts   include draft articles (marked as drafts)
//
// Scheduling: an article with draft: false and a future date stays hidden until
// that date (Sydney time). A daily scheduled rebuild publishes it on the day.

import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import crypto from "node:crypto";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const args = new Set(process.argv.slice(2));
const SERVE = args.has("--serve");
const DRAFTS = args.has("--drafts") || SERVE;
const OUT = path.join(root, "dist");
// Today's date in Sydney, as YYYY-MM-DD, so scheduled articles go live on the right day.
const TODAY = new Intl.DateTimeFormat("en-CA", { timeZone: "Australia/Sydney" }).format(new Date());

async function load() {
  const md = await import(pathToFileURL(path.join(root, "lib/markdown.mjs")).href);
  const pages = await import(pathToFileURL(path.join(root, "lib/pages.mjs")).href);
  return { md, pages };
}

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    entry.isDirectory() ? copyDir(s, d) : fs.copyFileSync(s, d);
  }
}

function write(rel, content) {
  const file = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

const hashOf = (file) =>
  crypto.createHash("md5").update(fs.readFileSync(file)).digest("hex").slice(0, 8);

async function build() {
  const t0 = Date.now();
  const { md, pages } = await load();

  fs.rmSync(OUT, { recursive: true, force: true });
  copyDir(path.join(root, "public"), OUT);

  // ── Blog posts ──
  const dir = path.join(root, "content/blog");
  const problems = [];
  let posts = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const raw = fs.readFileSync(path.join(dir, f), "utf8");
      const { data, body } = md.frontmatter(raw);
      const slug = f.replace(/\.md$/, "");
      if (!data.title) problems.push(`${f}: missing title`);
      if (!data.description) problems.push(`${f}: missing description`);
      if (!/^\d{4}-\d{2}-\d{2}/.test(String(data.date || ""))) problems.push(`${f}: date should look like 2026-11-01`);
      const words = body.split(/\s+/).filter(Boolean).length;
      return {
        slug,
        title: data.title || slug,
        description: data.description || "",
        date: String(data.date || "2026-01-01").slice(0, 10),
        updated: data.updated ? String(data.updated).slice(0, 10) : "",
        // Future-dated articles are treated like drafts until their date arrives.
        draft: data.draft === true || String(data.date || "").slice(0, 10) > TODAY,
        topic: data.topic || "Everyday choices",
        cover: data.cover || "",
        coverAlt: data.coverAlt || "",
        minutes: Math.max(1, Math.round(words / 220)),
        html: md.markdown(body),
      };
    })
    .filter((p) => DRAFTS || !p.draft)
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.slug.localeCompare(b.slug)));

  if (problems.length) {
    console.warn("\n⚠  Check these articles:\n  " + problems.join("\n  ") + "\n");
  }

  const published = posts.filter((p) => !p.draft);
  // In preview mode, show drafts too so you can check them.
  const listed = DRAFTS ? posts : published;

  write("index.html", pages.home(listed));
  write("blog/index.html", pages.blogIndex(listed));
  for (const p of posts) write(`blog/${p.slug}/index.html`, pages.postPage(p, listed));

  // ── Markdown pages ──
  const pageDefs = [
    { file: "about.md", path: "/about/", current: "/about/" },
    { file: "privacy.md", path: "/privacy/" },
  ];
  for (const def of pageDefs) {
    const raw = fs.readFileSync(path.join(root, "content/pages", def.file), "utf8");
    const { data, body } = md.frontmatter(raw);
    write(
      def.path.replace(/^\//, "") + "index.html",
      pages.markdownPage({ title: data.title, heading: data.heading, description: data.description, path: def.path, html: md.markdown(body), current: def.current })
    );
  }

  write("contact/index.html", pages.contact());
  write("thanks/index.html", pages.thanks());
  write("404.html", pages.notFound());
  write("rss.xml", pages.rss(published));
  write(
    "sitemap.xml",
    pages.sitemap([
      { path: "/" },
      { path: "/blog/" },
      ...published.map((p) => ({ path: `/blog/${p.slug}/`, lastmod: p.updated || p.date })),
      { path: "/about/" },
      { path: "/contact/" },
      { path: "/privacy/" },
    ])
  );

  // Cache-bust CSS and JS
  const cssV = hashOf(path.join(OUT, "styles.css"));
  const jsV = hashOf(path.join(OUT, "forms.js"));
  const walk = (d) =>
    fs.readdirSync(d, { withFileTypes: true }).forEach((e) => {
      const f = path.join(d, e.name);
      if (e.isDirectory()) return walk(f);
      if (f.endsWith(".html")) {
        fs.writeFileSync(f, fs.readFileSync(f, "utf8").replace(/__CSS_VERSION__/g, cssV).replace(/__JS_VERSION__/g, jsV));
      }
    });
  walk(OUT);

  const drafts = posts.length - published.length;
  console.log(
    `✓ Built ${published.length} published article${published.length === 1 ? "" : "s"}` +
      (DRAFTS ? ` + ${drafts} draft${drafts === 1 ? "" : "s"} (preview only)` : "") +
      ` in ${Date.now() - t0}ms`
  );
}

await build();

if (SERVE) {
  const types = {
    ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml",
    ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".ico": "image/x-icon",
    ".xml": "application/xml", ".json": "application/json", ".webmanifest": "application/manifest+json", ".txt": "text/plain",
  };
  const port = Number(process.env.PORT) || 4321;
  http
    .createServer((req, res) => {
      let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
      let file = path.join(OUT, p);
      if (!file.startsWith(OUT)) { res.writeHead(403); return res.end(); }
      if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, "index.html");
      if (!fs.existsSync(file)) { res.writeHead(404, { "content-type": types[".html"] }); return res.end(fs.readFileSync(path.join(OUT, "404.html"))); }
      res.writeHead(200, { "content-type": types[path.extname(file)] || "application/octet-stream" });
      fs.createReadStream(file).pipe(res);
    })
    .listen(port, () => console.log(`\n  Preview: http://localhost:${port}  (drafts shown, Ctrl+C to stop)\n`));

  let timer;
  // Code and config changes restart the process (node --watch); content changes rebuild here.
  for (const d of ["content", "public"]) {
    fs.watch(path.join(root, d), { recursive: true }, () => {
      clearTimeout(timer);
      timer = setTimeout(() => build().catch((e) => console.error(e)), 120);
    });
  }
}
