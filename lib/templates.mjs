// Page templates. Each function returns a full HTML string.
import site from "../site.config.mjs";

export const esc = (s = "") =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const abs = (path) => new URL(path, site.url).href;

export const fmtDate = (d) =>
  new Date(d + "T00:00:00").toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" });

// The leaf from the logo, reused as a small glyph.
export const leaf = (cls = "leaf") =>
  `<svg class="${cls}" viewBox="0 0 26 26" aria-hidden="true" focusable="false"><path d="M0 25.5C0 10.62 9.56 0 25.5 0C25.5 15.94 14.87 25.5 0 25.5Z"/></svg>`;

// Simple care symbols, drawn as line icons.
const careIcons = `
<svg viewBox="0 0 32 24" aria-hidden="true"><path d="M3 5h26l-3 15H6z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M3 5c3 3 5 3 8 0s5-3 8 0 5 3 8 0" fill="none" stroke="currentColor" stroke-width="1.4"/><text x="16" y="17.5" text-anchor="middle" font-size="7" fill="currentColor" font-family="Outfit, sans-serif">40</text></svg>
<svg viewBox="0 0 32 24" aria-hidden="true"><path d="M16 3 29 21H3z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M8 4l16 18M24 4 8 22" stroke="currentColor" stroke-width="1.4"/></svg>
<svg viewBox="0 0 32 24" aria-hidden="true"><rect x="5" y="3" width="22" height="18" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M9 5.5c4 4 10 4 14 0" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>
<svg viewBox="0 0 32 24" aria-hidden="true"><path d="M4 19h24c0-7-4-12-11-12H10" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M4 19c0-4 2-7 6-8" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="14" cy="14.5" r="1.1" fill="currentColor"/><circle cx="19" cy="14.5" r="1.1" fill="currentColor"/></svg>`;

export const careLabel = () => `
<figure class="care-label" aria-label="What our uniforms are made of, and what we leave out">
  <div class="care-label__tag">
    <img class="care-label__mark" src="/brand/natural-schoolwear-wordmark.svg" alt="" width="120" height="28">
    <p class="care-label__fibre">organic cotton<span>woven to last, soft from the first wash</span></p>
    <p class="care-label__head">left out</p>
    <ul class="care-label__out">
      <li>stain-repellent coatings (PFAS)</li>
      <li>wrinkle-free resins</li>
      <li>harsh synthetic dyes</li>
    </ul>
    <div class="care-label__care" title="Machine wash warm, do not bleach, line dry, warm iron">${careIcons}</div>
    <p class="care-label__foot">made for long, warm Australian school days</p>
  </div>
</figure>`;

// Generated cover art: a woven swatch in brand colours, varied per article.
const topicStyles = {
  "Chemicals and finishes": { bg: "#2F4A3A", thread: "#F7F6F1", mode: "beads" },
  "Skin and comfort": { bg: "#E4E8DF", thread: "#2F4A3A", mode: "soft" },
  "Heat and sun": { bg: "#F7F6F1", thread: "#2F4A3A", mode: "rays" },
  "Labels and certification": { bg: "#FFFFFF", thread: "#2F4A3A", mode: "stitch" },
  "Everyday choices": { bg: "#3D5C49", thread: "#F7F6F1", mode: "weave" },
};

function hash(str) {
  let h = 2166136261;
  for (const c of str) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return h >>> 0;
}

export function cover(post, { size = "card" } = {}) {
  if (post.cover) {
    return `<img class="cover cover--${size}" src="${esc(post.cover)}" alt="${esc(post.coverAlt || "")}" loading="${size === "hero" ? "eager" : "lazy"}" width="1200" height="750">`;
  }
  const t = topicStyles[post.topic] || topicStyles["Everyday choices"];
  const h = hash(post.slug);
  const id = `w${h.toString(36)}`;
  const g = 16 + (h % 4) * 3; // weave cell size
  const rot = [0, 45, -45, 90][h % 4];
  // Keep the leaf inside the area that survives every crop (16:7 to 16:10).
  const ls = 150 + ((h >>> 9) % 80);
  const lx = 260 + ((h >>> 3) % 680);
  const ly = 200 + ((h >>> 13) % (380 - ls / 2));
  const c = t.thread;
  // Basket weave: two threads across, two threads down, alternating.
  const half = g / 2, th = half / 2 - 1;
  const pattern = `
    <rect x="1" y="1" width="${half - 2}" height="${th}" rx="${th / 2}" fill="${c}"/>
    <rect x="1" y="${half / 2}" width="${half - 2}" height="${th}" rx="${th / 2}" fill="${c}"/>
    <rect x="${half + 1}" y="1" width="${th}" height="${half - 2}" rx="${th / 2}" fill="${c}"/>
    <rect x="${half + half / 2}" y="1" width="${th}" height="${half - 2}" rx="${th / 2}" fill="${c}"/>
    <rect x="1" y="${half + 1}" width="${th}" height="${half - 2}" rx="${th / 2}" fill="${c}"/>
    <rect x="${half / 2}" y="${half + 1}" width="${th}" height="${half - 2}" rx="${th / 2}" fill="${c}"/>
    <rect x="${half + 1}" y="${half + 1}" width="${half - 2}" height="${th}" rx="${th / 2}" fill="${c}"/>
    <rect x="${half + 1}" y="${half + half / 2}" width="${half - 2}" height="${th}" rx="${th / 2}" fill="${c}"/>`;
  let extra = "";
  if (t.mode === "beads") {
    // water beading on a coated fabric
    for (let i = 0; i < 22; i++) {
      const x = 120 + (hash(post.slug + i) % 960);
      const y = 140 + (hash(i + post.slug) % 470);
      const r = 6 + (hash("r" + i + post.slug) % 16);
      extra += `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" opacity=".18"/><circle cx="${x - r / 3}" cy="${y - r / 3}" r="${Math.max(2, r / 4)}" fill="${c}" opacity=".6"/>`;
    }
  } else if (t.mode === "rays") {
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      extra += `<line x1="${lx + Math.cos(a) * ls * 0.85}" y1="${ly + Math.sin(a) * ls * 0.85}" x2="${lx + Math.cos(a) * ls * 1.25}" y2="${ly + Math.sin(a) * ls * 1.25}" stroke="${c}" stroke-width="5" stroke-linecap="round" opacity=".55"/>`;
    }
  } else if (t.mode === "stitch") {
    extra = `<rect x="90" y="150" width="1020" height="450" rx="12" fill="none" stroke="${c}" stroke-width="4" stroke-dasharray="18 12" opacity=".5"/>`;
  } else if (t.mode === "soft") {
    for (let i = 0; i < 5; i++) {
      const y = 180 + i * 95;
      extra += `<path d="M-20 ${y} C 300 ${y - 50}, 600 ${y + 50}, 1220 ${y - 20}" fill="none" stroke="${c}" stroke-width="2.5" opacity=".28"/>`;
    }
  }
  return `<svg class="cover cover--${size}" viewBox="0 0 1200 750" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${esc(post.topic)}">
  <defs><pattern id="${id}" width="${g}" height="${g}" patternUnits="userSpaceOnUse" patternTransform="rotate(${rot})">${pattern}</pattern></defs>
  <rect width="1200" height="750" fill="${t.bg}"/>
  <rect width="1200" height="750" fill="url(#${id})" opacity=".11"/>
  ${extra}
  <g transform="translate(${lx - ls / 2} ${ly - ls / 2}) scale(${ls / 26})"><path d="M0 25.5C0 10.62 9.56 0 25.5 0C25.5 15.94 14.87 25.5 0 25.5Z" fill="${c}"/></g>
</svg>`;
}

// ── Layout ────────────────────────────────────────────────

const nav = [
  { href: "/blog/", label: "Blog" },
  { href: "/about/", label: "About" },
  { href: "/contact/", label: "Contact" },
];

function header(current) {
  const links = nav
    .map((n) => `<li><a href="${n.href}"${current === n.href ? ' aria-current="page"' : ""}>${n.label}</a></li>`)
    .join("");
  return `
<header class="site-header">
  <div class="wrap site-header__inner">
    <a class="site-header__logo" href="/" aria-label="Natural Schoolwear home">
      <img src="/brand/natural-schoolwear-logo.svg" alt="Natural Schoolwear" width="150" height="63">
    </a>
    <nav class="site-nav" aria-label="Main">
      <ul>${links}</ul>
    </nav>
    <a class="button button--small site-header__cta" href="/#waitlist">Join the waitlist</a>
    <details class="mobile-nav">
      <summary aria-label="Menu"><span></span><span></span></summary>
      <ul>${links}<li><a href="/#waitlist">Join the waitlist</a></li></ul>
    </details>
  </div>
</header>`;
}

function footer() {
  const socials = Object.entries(site.social)
    .filter(([, v]) => v)
    .map(([k, v]) => `<li><a href="${esc(v)}" rel="noopener">${k[0].toUpperCase() + k.slice(1)}</a></li>`)
    .join("");
  const year = new Date().getFullYear();
  return `
<footer class="site-footer">
  <div class="wrap site-footer__inner">
    <img class="site-footer__logo" src="/brand/natural-schoolwear-logo-white.svg" alt="Natural Schoolwear" width="170" height="72">
    <div class="site-footer__cols">
      <ul>
        <li><a href="/blog/">Blog</a></li>
        <li><a href="/about/">About</a></li>
        <li><a href="/contact/">Contact</a></li>
        <li><a href="/privacy/">Privacy</a></li>
      </ul>
      <ul>
        <li><a href="mailto:${site.email}">${site.email}</a></li>
        ${socials}
        <li><a href="/rss.xml">RSS feed</a></li>
      </ul>
    </div>
    <p class="site-footer__small">© ${year} Natural Schoolwear. Organic cotton school uniforms for Australian kids.</p>
  </div>
</footer>`;
}

export function layout({ title, description, path, body, current, type = "website", image, jsonld, noindex }) {
  const fullTitle = title ? `${title} | ${site.name}` : `${site.name} | Organic school uniforms for Australian kids`;
  const desc = description || site.description;
  const canonical = abs(path);
  const og = abs(image || "/images/og-default.png");
  return `<!doctype html>
<html lang="${site.locale}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${canonical}">
${noindex ? '<meta name="robots" content="noindex">' : ""}
<meta property="og:type" content="${type}">
<meta property="og:site_name" content="${site.name}">
<meta property="og:title" content="${esc(title || site.name)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${og}">
<meta property="og:locale" content="en_AU">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#2F4A3A">
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="alternate" type="application/rss+xml" title="${site.name} blog" href="/rss.xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500&display=swap">
<link rel="stylesheet" href="/styles.css?v=__CSS_VERSION__">
${jsonld ? `<script type="application/ld+json">${JSON.stringify(jsonld)}</script>` : ""}
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
${header(current)}
<main id="main">
${body}
</main>
${footer()}
<script src="/forms.js?v=__JS_VERSION__" defer></script>
</body>
</html>`;
}

// ── Forms ─────────────────────────────────────────────────

export function waitlistForm({ id = "waitlist-form", compact = false } = {}) {
  if (compact) {
    return `
<form class="form form--inline" id="${id}" action="${site.forms.waitlist}" method="POST" data-form="waitlist">
  <input type="hidden" name="_subject" value="New waitlist signup">
  <input type="hidden" name="form" value="waitlist">
  <input type="hidden" name="_next" value="${abs("/thanks/")}">
  <input type="text" name="_gotcha" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">
  <label class="visually-hidden" for="${id}-email">Email address</label>
  <input id="${id}-email" type="email" name="email" placeholder="Your email address" autocomplete="email" required>
  <button class="button" type="submit">Join the waitlist</button>
  <p class="form__status" role="status" aria-live="polite"></p>
</form>`;
  }
  return `
<form class="form form--full" id="${id}" action="${site.forms.waitlist}" method="POST" data-form="waitlist">
  <input type="hidden" name="_subject" value="New waitlist signup">
  <input type="hidden" name="form" value="waitlist">
  <input type="hidden" name="_next" value="${abs("/thanks/")}">
  <input type="text" name="_gotcha" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">
  <div class="form__row">
    <div class="field">
      <label for="${id}-name">First name <span class="optional">optional</span></label>
      <input id="${id}-name" type="text" name="name" autocomplete="given-name">
    </div>
    <div class="field">
      <label for="${id}-email">Email address</label>
      <input id="${id}-email" type="email" name="email" autocomplete="email" required>
    </div>
  </div>
  <fieldset class="field field--choices">
    <legend>I'm a</legend>
    <label><input type="radio" name="role" value="Parent or carer" checked> parent or carer</label>
    <label><input type="radio" name="role" value="School staff or P&amp;C"> teacher, principal or P&amp;C member</label>
    <label><input type="radio" name="role" value="Other"> something else</label>
  </fieldset>
  <div class="field">
    <label for="${id}-school">School or suburb <span class="optional">optional, helps us plan where to start</span></label>
    <input id="${id}-school" type="text" name="school">
  </div>
  <button class="button button--light" type="submit">Join the waitlist</button>
  <p class="form__note">We'll email you when uniforms are ready to order, and now and then with new articles. Unsubscribe any time. <a href="/privacy/">Privacy</a></p>
  <p class="form__status" role="status" aria-live="polite"></p>
</form>`;
}

export function waitlistBand() {
  return `
<section class="band band--green" id="waitlist" aria-labelledby="waitlist-title">
  <div class="wrap band__grid">
    <div>
      <h2 id="waitlist-title" class="display display--m">be first in line</h2>
      <p class="lede">Our first range is in development. Join the waitlist and we'll let you know when uniforms are ready, which schools we're working with, and when new articles go up.</p>
    </div>
    ${waitlistForm({ id: "waitlist-main" })}
  </div>
</section>`;
}

// ── Pieces ────────────────────────────────────────────────

export function postCard(post, { heading = "h3" } = {}) {
  return `
<article class="post-card">
  <a class="post-card__link" href="/blog/${post.slug}/">
    <div class="post-card__cover">${cover(post)}</div>
    <p class="post-card__meta">${esc(post.topic)}</p>
    <${heading} class="post-card__title">${esc(post.title)}</${heading}>
    <p class="post-card__desc">${esc(post.description)}</p>
  </a>
</article>`;
}

export { site, abs };
