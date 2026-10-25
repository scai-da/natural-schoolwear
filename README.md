# Natural Schoolwear website

The pre-launch site for **naturalschoolwear.com.au**: home page with waitlist, blog (20 articles ready, 2 published), about, contact and privacy pages.

It's a static site with **no dependencies**. A single script (`build.mjs`) turns the Markdown articles into web pages. Cloudflare Pages runs it each time you push to GitHub, so hosting costs nothing.

---

## What's where

| Folder or file | What it is |
| --- | --- |
| `content/blog/` | One Markdown file per article. The file name becomes the web address. |
| `content/pages/` | About and privacy page text. |
| `site.config.mjs` | Site name, contact email, form endpoints and social links. **Start here.** |
| `public/` | Files copied to the site as-is: logo, favicons, styles, images. |
| `public/images/blog/` | Put article photos here. |
| `lib/` | Page templates and the Markdown converter. You rarely need to touch these. |
| `.pages.yml` | Settings for the free Pages CMS browser editor. |
| `build.mjs` | The build script. |

---

## 1. Preview on your Mac (optional, about 5 minutes)

1. Install **Node.js 22 LTS** from [nodejs.org](https://nodejs.org).
2. Open this folder in VS Code, then open the terminal (**View → Terminal**).
3. Run:

   ```
   npm run dev
   ```

4. Open **http://localhost:4321**. Drafts appear here with a yellow "Draft preview" flag. They don't appear on the live site.

Edits to articles, styles or settings rebuild the preview automatically. Refresh the browser to see them.

---

## 2. Connect the waitlist and contact forms (5 minutes)

The forms send submissions to [Formspree](https://formspree.io), which emails them to you and keeps a list you can export as a spreadsheet.

1. Sign up at formspree.io (free).
2. Create a form called **Waitlist**. Copy its endpoint, which looks like `https://formspree.io/f/abcdwxyz`.
3. Create a second form called **Contact** and copy its endpoint as well.
4. Paste both into `site.config.mjs`:

   ```js
   forms: {
     waitlist: "https://formspree.io/f/abcdwxyz",
     contact: "https://formspree.io/f/efghijkl",
   },
   ```

5. In each Formspree form's settings, add `naturalschoolwear.com.au` as an allowed domain.

**Free plan limit:** 50 submissions a month across your account. That's usually plenty before launch. When the waitlist grows, you have two options:

- Upgrade Formspree.
- Move to an email platform with a free tier, such as Kit or MailerLite. They let you email the waitlist directly when you launch. Paste their form endpoint into the same setting; the field names may need a small change.

---

## 3. Put the code on GitHub (10 minutes)

1. Create a free account at [github.com](https://github.com).
2. Create a new repository called `natural-schoolwear`. Private is fine.
3. Upload this folder. The easiest ways:
   - **VS Code:** open the folder, click the **Source Control** icon, then **Publish to GitHub**.
   - **GitHub Desktop:** **File → Add local repository**, then **Publish repository**.

Leave out the `dist` folder. The included `.gitignore` already does this for VS Code and GitHub Desktop.

---

## 4. Host it on Cloudflare Pages (10 minutes)

1. Create a free account at [dash.cloudflare.com](https://dash.cloudflare.com).
2. Go to **Workers & Pages → Create**, choose the **Pages** tab, then **Connect to Git**. If you only see Workers options, look for the "Looking to deploy Pages?" link.
3. Authorise GitHub and pick the `natural-schoolwear` repository.
4. Use these build settings:

   | Setting | Value |
   | --- | --- |
   | Framework preset | None |
   | Build command | `npm run build` |
   | Build output directory | `dist` |

5. Click **Save and Deploy**. In under a minute you'll have a live site at `natural-schoolwear.pages.dev`.

From now on, every change you push to GitHub republishes the site automatically.

---

## 5. Attach naturalschoolwear.com.au (15 minutes, then up to 24 hours to take effect)

To use the bare domain (no www) on Cloudflare Pages, Cloudflare needs to manage the domain's DNS. You keep the domain registered with GoDaddy; you only change where it points.

**In Cloudflare:**

1. Click **Add a domain**, enter `naturalschoolwear.com.au`, and choose the **Free** plan.
2. Cloudflare scans your existing GoDaddy records. If you already have email on this domain, check the MX records came across.
3. Cloudflare shows you **two nameservers**, for example `ada.ns.cloudflare.com` and `bob.ns.cloudflare.com`. Keep this tab open.

**In GoDaddy:**

4. Go to **My Products**, find `naturalschoolwear.com.au`, and open **DNS → Nameservers**.
5. Click **Change nameservers → I'll use my own nameservers**, paste the two Cloudflare nameservers, and save.

**Back in Cloudflare (once it emails you that the domain is active):**

6. Open your Pages project, go to **Custom domains → Set up a domain**, and add `naturalschoolwear.com.au`.
7. Repeat for `www.naturalschoolwear.com.au`.
8. Go to the domain's **Rules → Redirect Rules**. Create a rule from the **Redirect from WWW to root** template, so everyone lands on the same address.

---

## 6. Redirect naturalschoolwear.com to the .com.au site

1. In Cloudflare, **Add a domain** again with `naturalschoolwear.com` (Free plan), then change its nameservers in GoDaddy the same way as step 5.
2. In the `.com` domain's **DNS** settings, add two records, both with the orange cloud (proxied) switched on:
   - Type `A`, name `@`, IPv4 `192.0.2.1`
   - Type `A`, name `www`, IPv4 `192.0.2.1`

   This address is a placeholder. The redirect rule below catches visitors before they reach it.
3. Go to **Rules → Redirect Rules → Create rule**:
   - **If incoming requests match:** All incoming requests
   - **Then:** Dynamic redirect
   - **Expression:** `concat("https://naturalschoolwear.com.au", http.request.uri.path)`
   - **Status code:** 301
   - Tick **Preserve query string**

Now `naturalschoolwear.com/blog/` goes to `naturalschoolwear.com.au/blog/`, and so on.

---

## 7. Get a free hello@naturalschoolwear.com.au address

The site shows `hello@naturalschoolwear.com.au`. To receive mail at that address without paying for email hosting:

1. In Cloudflare, open the `.com.au` domain and go to **Email → Email Routing**.
2. Create the address `hello@` and set it to forward to your Gmail.

To send email *from* that address, add it in Gmail under **Settings → Accounts → Send mail as**. That needs an SMTP service; Google Workspace is the simplest paid option.

To use a different address, change `email` in `site.config.mjs` and the address in `content/pages/privacy.md`.

---

## 8. Publish articles

All 20 articles are in `content/blog/`. Two are live:

- *Why your child's school uniform deserves a second look*
- *Forever chemicals in school uniforms: what the research found*

The other 18 are drafts, dated weekly from 1 November 2026 as a suggested schedule.

**To publish one:** open the file, change `draft: true` to `draft: false`, set `date:` to today, and push to GitHub. It goes live in about a minute.

Each article starts with front matter like this:

```yaml
---
title: "Stain-resistant uniforms: the hidden trade-off"
description: "Shown in Google results and on article cards. One or two sentences."
date: 2026-11-01
draft: true
topic: Chemicals and finishes
cover: ""            # optional photo, e.g. /images/blog/stain-test.jpg
coverAlt: ""         # describe the photo for screen readers
---
```

Topics set the colour and pattern of the generated cover art. Use one of: `Chemicals and finishes`, `Skin and comfort`, `Heat and sun`, `Labels and certification`, `Everyday choices`.

To add a photo, save it in `public/images/blog/` (ideally 1600 × 1000 px, under 300 KB) and set `cover:` to its path.

### Writing without code: Pages CMS

1. Go to [app.pagescms.org](https://app.pagescms.org) and sign in with GitHub.
2. Pick the `natural-schoolwear` repository.
3. You'll see **Blog articles**, **About page** and **Privacy page**, with a form for each article's details and a rich-text editor for the body. Saving commits to GitHub, and Cloudflare republishes.

---

## Before launch: claims to check

The ACCC watches green and health claims closely, so check each of these with your supplier and certifier, then edit or remove anything you can't back up.

**Home page** (`lib/pages.mjs`, search for "what goes in"):

- Organic cotton across the range
- Dyes that meet strict textile safety criteria
- No PFAS stain-repellent or water-repellent coatings
- No formaldehyde-based wrinkle-free resins
- No chlorine bleach or heavy-metal dyes
- No polyester against skin all day. Change this if any item, such as sportswear, uses polyester.
- The care label in the hero says "organic cotton" and lists the same left-out finishes (`lib/templates.mjs`, `careLabel`).

**Published article:** *Forever chemicals…* says "our uniforms carry no stain-repellent treatments."

**Draft articles:** most end with a short section about the Natural Schoolwear range, covering organic cotton, GOTS certification and finishes left out. Check that closing section in each article before you set it to `draft: false`.

**About page:** written in a neutral "we" voice. Add your own story about why you started the brand. Real founder stories build trust.

**Privacy page:** a plain-English starting point, not legal advice. Have it checked if you're unsure.

---

## Later: selling with Shopify

When stock is ready, you have two paths:

- **Keep this site and add Shopify Buy Buttons** (Starter plan). Shopify gives you a snippet for each product, which you paste into a page here.
- **Move to a full Shopify store** (Basic plan) and point the domain at Shopify. Shopify has its own blog, so you'd move the articles across, or keep this site on a subdomain such as `learn.naturalschoolwear.com.au`.

---

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Preview at localhost:4321 with drafts, rebuilding on save |
| `npm run build` | Build the live site into `dist/` (drafts left out) |
| `npm run preview-drafts` | Build into `dist/` including drafts |
