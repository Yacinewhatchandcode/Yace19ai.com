import { useEffect } from "react";
import type { Locale } from "../App";

const canonicalOrigin = "https://yace19ai.com";
const constellationGraph = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://prime-ai.fr/#constellation",
      name: "PRIME-AI Sovereign Constellation",
      sameAs: [
        "https://yace19ai.com/",
        "https://prime-ai.fr/",
        "https://amlazr.com/",
        "https://www.linkedin.com/in/yacine-benhamou-b26386124/",
      ],
      subOrganization: [
        { "@id": "https://yace19ai.com/#organization" },
        { "@id": "https://prime-ai.fr/#organization" },
        { "@id": "https://amlazr.com/#organization" },
      ],
    },
    {
      "@type": "Organization",
      "@id": "https://yace19ai.com/#organization",
      name: "YACE19AI",
      url: "https://yace19ai.com/",
      parentOrganization: { "@id": "https://prime-ai.fr/#constellation" },
    },
    {
      "@type": "Organization",
      "@id": "https://prime-ai.fr/#organization",
      name: "PRIME-AI",
      url: "https://prime-ai.fr/",
      parentOrganization: { "@id": "https://prime-ai.fr/#constellation" },
    },
    {
      "@type": "Organization",
      "@id": "https://amlazr.com/#organization",
      name: "AMLAZR",
      url: "https://amlazr.com/",
      parentOrganization: { "@id": "https://prime-ai.fr/#constellation" },
    },
    {
      "@type": "WebSite",
      "@id": "https://yace19ai.com/#website",
      url: "https://yace19ai.com/",
      name: "YACE19AI",
      publisher: { "@id": "https://yace19ai.com/#organization" },
      isPartOf: { "@id": "https://prime-ai.fr/#constellation" },
    },
  ],
};

function setMeta(selector: string, attribute: "name" | "property", key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    element.dataset.pageMetadata = "true";
    document.head.append(element);
  }
  element.content = content;
}

export default function PageMetadata({
  pathname,
  locale,
  title,
  description,
  label,
}: {
  pathname: string;
  locale: Locale;
  title: string;
  description: string;
  label: string;
}) {
  useEffect(() => {
    const canonical = `${canonicalOrigin}${pathname === "/" ? "/" : pathname}`;
    const localizedTitle = locale === "fr" ? `${label} | YACE19AI` : title;
    const localizedDescription = locale === "fr"
      ? "YACE19AI explore les modèles du monde, l'IA scientifique et les modèles ouverts par la recherche et l'expérimentation."
      : description;

    document.title = localizedTitle;
    document.documentElement.lang = locale;
    setMeta('meta[name="description"]', "name", "description", localizedDescription);
    setMeta('meta[name="author"]', "name", "author", "YACE19AI");
    const indexableRoutes = new Set(["/", "/fleet", "/philosophy", "/games", "/media"]);
    setMeta('meta[name="robots"]', "name", "robots", indexableRoutes.has(pathname) ? "index, follow" : "noindex, nofollow");
    setMeta('meta[property="og:type"]', "property", "og:type", "website");
    setMeta('meta[property="og:url"]', "property", "og:url", canonical);
    setMeta('meta[property="og:title"]', "property", "og:title", localizedTitle);
    setMeta('meta[property="og:description"]', "property", "og:description", localizedDescription);
    setMeta('meta[property="og:site_name"]', "property", "og:site_name", "YACE19AI");
    setMeta('meta[property="og:image"]', "property", "og:image", `${canonicalOrigin}/og-image.png`);
    setMeta('meta[name="twitter:card"]', "name", "twitter:card", "summary_large_image");
    setMeta('meta[name="twitter:title"]', "name", "twitter:title", localizedTitle);
    setMeta('meta[name="twitter:description"]', "name", "twitter:description", localizedDescription);
    setMeta('meta[name="twitter:image"]', "name", "twitter:image", `${canonicalOrigin}/twitter-card.png`);

    let canonicalLink = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement("link");
      canonicalLink.rel = "canonical";
      document.head.append(canonicalLink);
    }
    canonicalLink.href = canonical;

    let jsonLd = document.head.querySelector<HTMLScriptElement>("#yace19ai-jsonld");
    if (!jsonLd) {
      jsonLd = document.createElement("script");
      jsonLd.type = "application/ld+json";
      jsonLd.id = "yace19ai-jsonld";
      document.head.append(jsonLd);
    }
    const graph = {
      ...constellationGraph,
      "@graph": [
        ...constellationGraph["@graph"],
        {
          "@type": "WebPage",
          "@id": `${canonical}#webpage`,
          url: canonical,
          name: localizedTitle,
          description: localizedDescription,
          inLanguage: locale,
          isPartOf: { "@id": "https://yace19ai.com/#website" },
          about: { "@id": "https://yace19ai.com/#organization" },
          breadcrumb: { "@id": `${canonical}#breadcrumb` },
        },
        {
          "@type": "BreadcrumbList",
          "@id": `${canonical}#breadcrumb`,
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Research", item: `${canonicalOrigin}/` },
            ...(pathname === "/" ? [] : [{ "@type": "ListItem", position: 2, name: label, item: canonical }]),
          ],
        },
      ],
    };
    jsonLd.textContent = JSON.stringify(graph);
  }, [description, label, locale, pathname, title]);

  return null;
}
