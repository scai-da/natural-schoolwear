// ─────────────────────────────────────────────────────────────
//  Natural Schoolwear site settings
//  Edit these values, commit, and Cloudflare will republish.
// ─────────────────────────────────────────────────────────────

export default {
  name: "Natural Schoolwear",
  url: "https://naturalschoolwear.com.au",
  description:
    "Organic cotton school uniforms for Australian kids: breathable, soft on skin, and made without stain-proof coatings or wrinkle-free resins. Join the waitlist.",
  locale: "en-AU",

  // Contact email shown on the site. Set up free forwarding to your inbox with
  // Cloudflare Email Routing (see README, step 7).
  email: "hello@naturalschoolwear.com.au",

  // ── Forms ────────────────────────────────────────────────
  // Create a free form at https://formspree.io, then paste its endpoint here.
  // It looks like https://formspree.io/f/abcdwxyz
  // You can use one form for both, or create two so they're easier to sort.
  forms: {
    waitlist: "https://formspree.io/f/maeeqqkn",
    contact: "https://formspree.io/f/xljjggvj",
  },

  // ── Social links (leave blank to hide) ───────────────────
  social: {
    instagram: "",
    facebook: "",
    linkedin: "",
  },

  // How many articles to show on the home page
  homePosts: 3,
};
