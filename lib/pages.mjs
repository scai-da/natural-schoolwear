import {
  layout, careLabel, waitlistForm, waitlistBand, postCard, cover, leaf, esc, fmtDate, site, abs,
} from "./templates.mjs";

// Link to an article only if it's published; otherwise fall back to the blog.
const linkTo = (posts, slug) => (posts.some((p) => p.slug === slug) ? `/blog/${slug}/` : null);

export function home(posts) {
  const latest = posts.slice(0, site.homePosts);
  const reasons = [
    {
      title: "the finish",
      text: "A 2022 study tested 72 stain-resistant children's products, mostly school uniforms. Every one contained PFAS, the “forever chemicals” used to repel stains.",
      slug: "forever-chemicals-pfas-in-school-uniforms",
      link: "What the PFAS study found",
    },
    {
      title: "the fabric",
      text: "Most uniforms are now polyester or poly-cotton. Cotton soaks up sweat and lets air through, which matters at 2pm on a 34-degree day in February.",
      slug: "polyester-vs-cotton-in-an-australian-summer",
      link: "Polyester vs cotton in summer",
    },
    {
      title: "the skin",
      text: "Eczema is common in young Australian children. Soft, smooth, breathable fabric without chemical finishes is gentler on skin that reacts easily.",
      slug: "eczema-and-school-uniforms-a-guide-for-aussie-parents",
      link: "Eczema and school uniforms",
    },
  ];

  const body = `
<section class="hero">
  <div class="wrap hero__grid">
    <div class="hero__copy">
      <h1 class="display display--xl">school uniforms, made gently.</h1>
      <p class="lede">We're making organic cotton school uniforms for Australian kids. Breathable on hot days, soft on sensitive skin, and made without the stain-proof and wrinkle-free chemical finishes many uniforms carry.</p>
      ${waitlistForm({ id: "waitlist-hero", compact: true })}
      <p class="hero__small">For parents, carers and schools. We'll email you when we launch.</p>
    </div>
    <div class="hero__label">
      <div class="seam" aria-hidden="true"></div>
      ${careLabel()}
    </div>
  </div>
</section>

<section class="section" aria-labelledby="why-title">
  <div class="wrap split">
    <div class="split__head">
      <h2 id="why-title" class="display display--l">your child wears it more than anything else they own.</h2>
      <p>Five days a week, forty weeks a year, for thirteen years. Up to ten hours a day against bare skin. So we started asking what goes into a school uniform, and what's added after the fabric is made.</p>
    </div>
    <ul class="reasons">
      ${reasons
        .map((r) => {
          const href = linkTo(posts, r.slug);
          return `<li>
        <h3>${leaf()}${r.title}</h3>
        <p>${r.text}</p>
        ${href ? `<a class="text-link" href="${href}">${r.link}</a>` : ""}
      </li>`;
        })
        .join("")}
    </ul>
  </div>
</section>

<section class="section section--white" aria-labelledby="inout-title">
  <div class="wrap">
    <h2 id="inout-title" class="display display--l">what goes in, and what stays out</h2>
    <div class="inout">
      <div class="inout__col">
        <h3>in</h3>
        <ul>
          <li>Organic cotton, tightly woven so it lasts the year</li>
          <li>Colours from dyes that meet strict textile safety criteria</li>
          <li>Flat, soft seams and printed care labels that don't scratch</li>
          <li>A relaxed cut with room to run, climb and sit cross-legged</li>
        </ul>
      </div>
      <div class="inout__col inout__col--out">
        <h3>out</h3>
        <ul>
          <li>PFAS stain-repellent and water-repellent coatings</li>
          <li>Formaldehyde-based wrinkle-free and easy-care resins</li>
          <li>Chlorine bleach and heavy-metal dyes</li>
          <li>Polyester against your child's skin all day</li>
        </ul>
      </div>
    </div>
    <p class="inout__note">We'll publish our certification details before we sell a single uniform. If a claim can't be backed by a certificate you can check, we won't make it.</p>
  </div>
</section>

<section class="section schools" aria-labelledby="schools-title">
  <div class="wrap schools__grid">
    <h2 id="schools-title" class="display display--l">thinking about a better uniform for your school?</h2>
    <div>
      <p>We're talking with principals, uniform committees and P&amp;Cs about organic cotton options, from a single summer polo to a full uniform list. Tell us what your school needs and we'll share what's possible on colours, logos and supply.</p>
      <a class="button" href="/contact/?topic=school">Request a school information pack</a>
      ${linkTo(posts, "how-to-talk-to-your-school-about-natural-uniforms") ? `<p><a class="text-link" href="/blog/how-to-talk-to-your-school-about-natural-uniforms/">Parents: how to raise it with your school</a></p>` : ""}
    </div>
  </div>
</section>

${latest.length ? `
<section class="section" aria-labelledby="blog-title">
  <div class="wrap">
    <div class="section__head">
      <h2 id="blog-title" class="display display--l">from the blog</h2>
      <a class="text-link" href="/blog/">All articles</a>
    </div>
    <div class="post-grid">${latest.map((p) => postCard(p)).join("")}</div>
  </div>
</section>` : ""}

${waitlistBand()}`;

  return layout({
    path: "/",
    body,
    current: "/",
    jsonld: {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: site.name,
      url: site.url,
      logo: abs("/brand/natural-schoolwear-logo-1200w.png"),
      email: site.email,
      sameAs: Object.values(site.social).filter(Boolean),
    },
  });
}

export function blogIndex(posts) {
  const [first, ...rest] = posts;
  const body = `
<section class="page-head">
  <div class="wrap">
    <h1 class="display display--xl">the blog</h1>
    <p class="lede">Plain-language articles on uniform fabrics, chemical finishes, skin and heat, written for Australian parents. We're honest about what the research shows and what it doesn't.</p>
  </div>
</section>
<section class="section section--tight">
  <div class="wrap">
    ${first ? `
    <article class="post-feature">
      <a class="post-feature__link" href="/blog/${first.slug}/">
        <div class="post-feature__cover">${cover(first, { size: "wide" })}</div>
        <div class="post-feature__text">
          <p class="post-card__meta">${esc(first.topic)}, ${fmtDate(first.date)}</p>
          <h2 class="post-feature__title">${esc(first.title)}</h2>
          <p>${esc(first.description)}</p>
          <span class="text-link">Read the article</span>
        </div>
      </a>
    </article>` : `<p>New articles are on the way. <a href="/#waitlist">Join the waitlist</a> and we'll let you know when they're up.</p>`}
    ${rest.length ? `<div class="post-grid post-grid--index">${rest.map((p) => postCard(p, { heading: "h2" })).join("")}</div>` : ""}
  </div>
</section>
${waitlistBand()}`;
  return layout({
    title: "Blog",
    description: "Articles for Australian parents on school uniform fabrics, PFAS and chemical finishes, eczema, heat and choosing organic.",
    path: "/blog/",
    body,
    current: "/blog/",
  });
}

export function postPage(post, posts) {
  const idx = posts.findIndex((p) => p.slug === post.slug);
  const newer = idx > 0 ? posts[idx - 1] : null;
  const older = idx >= 0 && idx < posts.length - 1 ? posts[idx + 1] : null;
  const body = `
<article class="post">
  <header class="post__head wrap wrap--narrow">
    <p class="post__crumbs"><a href="/blog/">Blog</a> <span aria-hidden="true">/</span> ${esc(post.topic)}</p>
    <h1 class="post__title">${esc(post.title)}</h1>
    <p class="post__meta"><time datetime="${post.date}">${fmtDate(post.date)}</time><span aria-hidden="true">  </span>${post.minutes} min read</p>
    ${post.draft ? `<p class="draft-flag">Draft preview. This article isn't published yet.</p>` : ""}
  </header>
  <div class="post__cover wrap">${cover(post, { size: "hero" })}</div>
  <div class="prose wrap wrap--narrow">
    ${post.html}
  </div>
  ${newer || older ? `
  <nav class="post-nav wrap wrap--narrow" aria-label="More articles">
    ${older ? `<a class="post-nav__link" href="/blog/${older.slug}/"><span>Previous</span>${esc(older.title)}</a>` : "<span></span>"}
    ${newer ? `<a class="post-nav__link post-nav__link--next" href="/blog/${newer.slug}/"><span>Next</span>${esc(newer.title)}</a>` : ""}
  </nav>` : ""}
</article>
${waitlistBand()}`;
  return layout({
    title: post.title,
    description: post.description,
    path: `/blog/${post.slug}/`,
    body,
    current: "/blog/",
    type: "article",
    image: post.cover || undefined,
    noindex: post.draft,
    jsonld: {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.description,
      datePublished: post.date,
      dateModified: post.updated || post.date,
      mainEntityOfPage: abs(`/blog/${post.slug}/`),
      image: abs(post.cover || "/images/og-default.png"),
      author: { "@type": "Organization", name: site.name, url: site.url },
      publisher: { "@type": "Organization", name: site.name, logo: { "@type": "ImageObject", url: abs("/brand/natural-schoolwear-logo-1200w.png") } },
    },
  });
}

export function markdownPage({ title, heading, description, path, html, current }) {
  const body = `
<section class="page-head">
  <div class="wrap wrap--narrow">
    <h1 class="display display--xl">${esc(heading || title.toLowerCase())}</h1>
  </div>
</section>
<section class="section section--tight">
  <div class="prose wrap wrap--narrow">${html}</div>
</section>
${path === "/about/" ? waitlistBand() : ""}`;
  return layout({ title, description, path, body, current });
}

export function contact() {
  const body = `
<section class="page-head">
  <div class="wrap wrap--narrow">
    <h1 class="display display--xl">get in touch</h1>
    <p class="lede">Questions about fabrics, interest from your school, or a supplier or media enquiry. We read every message and reply within two business days.</p>
  </div>
</section>
<section class="section section--tight">
  <div class="wrap wrap--narrow contact">
    <form class="form form--contact" id="contact-form" action="${site.forms.contact}" method="POST" data-form="contact">
      <input type="hidden" name="_subject" value="New message from naturalschoolwear.com.au">
      <input type="hidden" name="form" value="contact">
      <input type="hidden" name="_next" value="${abs("/thanks/?from=contact")}">
      <input type="text" name="_gotcha" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">
      <div class="form__row">
        <div class="field">
          <label for="c-name">Name</label>
          <input id="c-name" type="text" name="name" autocomplete="name" required>
        </div>
        <div class="field">
          <label for="c-email">Email address</label>
          <input id="c-email" type="email" name="email" autocomplete="email" required>
        </div>
      </div>
      <div class="field">
        <label for="c-topic">What's it about?</label>
        <select id="c-topic" name="topic">
          <option value="General question">A general question</option>
          <option value="School information pack">A school information pack</option>
          <option value="Supplier or stockist">Supplying or stocking our uniforms</option>
          <option value="Media">A media enquiry</option>
        </select>
      </div>
      <div class="field" data-show-for="School information pack">
        <label for="c-school">School name and suburb</label>
        <input id="c-school" type="text" name="school">
      </div>
      <div class="field">
        <label for="c-message">Message</label>
        <textarea id="c-message" name="message" rows="6" required></textarea>
      </div>
      <button class="button" type="submit">Send message</button>
      <p class="form__status" role="status" aria-live="polite"></p>
    </form>
    <aside class="contact__aside">
      <p>Prefer email?</p>
      <p><a href="mailto:${site.email}">${site.email}</a></p>
    </aside>
  </div>
</section>`;
  return layout({
    title: "Contact",
    description: "Contact Natural Schoolwear about organic school uniforms, school information packs, supply or media.",
    path: "/contact/",
    body,
    current: "/contact/",
  });
}

export function thanks() {
  const body = `
<section class="page-head page-head--center">
  <div class="wrap wrap--narrow">
    ${leaf("leaf leaf--big")}
    <h1 class="display display--xl" data-thanks-title>you're on the list.</h1>
    <p class="lede" data-thanks-text>Thanks for joining. We'll email you when our first uniforms are ready to order.</p>
    <p><a class="button" href="/blog/">Read the blog while you wait</a></p>
  </div>
</section>
<script>
  if (location.search.includes("from=contact")) {
    document.querySelector("[data-thanks-title]").textContent = "message sent.";
    document.querySelector("[data-thanks-text]").textContent = "Thanks for getting in touch. We'll reply within two business days.";
  }
</script>`;
  return layout({ title: "Thanks", path: "/thanks/", body, noindex: true });
}

export function notFound() {
  const body = `
<section class="page-head page-head--center">
  <div class="wrap wrap--narrow">
    <h1 class="display display--xl">we couldn't find that page.</h1>
    <p class="lede">It may have moved, or the link may have a typo. Try the home page or the blog.</p>
    <p><a class="button" href="/">Go to the home page</a> <a class="button button--ghost" href="/blog/">Browse the blog</a></p>
  </div>
</section>`;
  return layout({ title: "Page not found", path: "/404", body, noindex: true });
}

export function rss(posts) {
  const items = posts
    .slice(0, 30)
    .map(
      (p) => `<item><title>${esc(p.title)}</title><link>${abs(`/blog/${p.slug}/`)}</link><guid>${abs(`/blog/${p.slug}/`)}</guid><pubDate>${new Date(p.date + "T08:00:00+10:00").toUTCString()}</pubDate><description>${esc(p.description)}</description></item>`
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
<title>${site.name} blog</title>
<link>${site.url}/blog/</link>
<description>Articles for Australian parents on school uniform fabrics, finishes, skin and heat.</description>
<language>en-au</language>
${items}
</channel></rss>`;
}

export function sitemap(paths) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map((p) => `<url><loc>${abs(p.path)}</loc>${p.lastmod ? `<lastmod>${p.lastmod}</lastmod>` : ""}</url>`).join("\n")}
</urlset>`;
}
