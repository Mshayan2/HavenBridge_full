import React, { useEffect } from "react";

function upsertMeta(attr, key, content) {
  if (!content) return;
  const selector = `meta[${attr}="${CSS.escape(key)}"]`;
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertLink(rel, href) {
  if (!href) return;
  const selector = `link[rel="${CSS.escape(rel)}"]`;
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

export default function SEO({ title, description, canonical, image }) {
  useEffect(() => {
    const siteName = "HavenBridge";
    const fullTitle = title ? `${title} | ${siteName}` : siteName;

    document.title = fullTitle;

    if (description) {
      upsertMeta("name", "description", description);
    }

    if (canonical) {
      upsertLink("canonical", canonical);
    }

    // Open Graph
    upsertMeta("property", "og:site_name", siteName);
    upsertMeta("property", "og:title", fullTitle);
    if (description) upsertMeta("property", "og:description", description);
    if (canonical) upsertMeta("property", "og:url", canonical);
    if (image) upsertMeta("property", "og:image", image);

    // Twitter
    upsertMeta("name", "twitter:card", image ? "summary_large_image" : "summary");
    upsertMeta("name", "twitter:title", fullTitle);
    if (description) upsertMeta("name", "twitter:description", description);
    if (image) upsertMeta("name", "twitter:image", image);
  }, [title, description, canonical, image]);

  return null;
}
