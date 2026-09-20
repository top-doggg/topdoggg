const SITE_URL = "https://trststudios.online";
const PERSON_ID = SITE_URL + "/#jorge-s-ruiz";
const WEBSITE_ID = SITE_URL + "/#website";

function breadcrumbSchema(route) {
  const path = new URL(route.canonical).pathname;
  const parts = [{ name: "TRST Studios", item: SITE_URL + "/" }];
  if (route.work) parts.push({ name: "Work", item: SITE_URL + "/work" }, { name: route.work.title, item: route.canonical });
  else if (route.journal) parts.push({ name: "Journal", item: SITE_URL + "/journal" }, { name: route.journal.title, item: route.canonical });
  else if (path.startsWith("/open-thread/")) parts.push({ name: "Open Thread", item: SITE_URL + "/open-thread" }, { name: route.title.replace(" | TRST Studios", ""), item: route.canonical });
  else if (path !== "/") parts.push({ name: route.title.split(" | ")[0], item: route.canonical });
  if (parts.length < 2) return null;
  return {
    "@type": "BreadcrumbList",
    "@id": route.canonical + "#breadcrumb",
    itemListElement: parts.map((part, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: part.name,
      item: part.item,
    })),
  };
}

function withBreadcrumb(route, primary) {
  const breadcrumb = breadcrumbSchema(route);
  if (!breadcrumb) return { "@context": "https://schema.org", ...primary };
  return { "@context": "https://schema.org", "@graph": [primary, breadcrumb] };
}

export function routeSchema(route) {
  const common = {
    "@id": route.canonical + "#webpage",
    url: route.canonical,
    name: route.title,
    description: route.description,
    isPartOf: { "@id": WEBSITE_ID },
  };

  if (route.canonical === SITE_URL + "/about") {
    return withBreadcrumb(route, {
      "@type": "ProfilePage",
      ...common,
      mainEntity: {
        "@type": "Person",
        "@id": PERSON_ID,
        name: "Jorge S. Ruiz",
        alternateName: ["DE.LA.COSTA", "Cokeys Ruiz"],
        image: SITE_URL + "/api/profile-image",
        description: "Southern California multidisciplinary visual artist working across photography, painting, drawing, film, mixed media, design, and wearable art.",
        sameAs: ["https://www.instagram.com/_de.la.costa_/"],
      },
    };
  }

  if (route.journal) {
    return withBreadcrumb(route, {
      "@type": "BlogPosting",
      ...common,
      headline: route.journal.title,
      abstract: route.journal.copy,
      image: new URL(route.journal.image, SITE_URL).href,
      author: { "@id": PERSON_ID },
      publisher: { "@id": SITE_URL + "/#organization" },
      mainEntityOfPage: route.canonical,
    };
  }

  if (route.work) {
    return withBreadcrumb(route, {
      "@type": "CreativeWork",
      ...common,
      headline: route.work.title,
      creator: { "@id": PERSON_ID },
      image: new URL(route.work.image, SITE_URL).href,
      spatialCoverage: route.work.location ? { "@type": "Place", name: route.work.location } : undefined,
      genre: route.work.medium,
      abstract: route.work.copy,
    };
  }

  const path = new URL(route.canonical).pathname;
  const collectionPaths = ["/work", "/journal", "/shop", "/open-thread"];
  return withBreadcrumb(route, {
    "@type": collectionPaths.includes(path) ? "CollectionPage" : "WebPage",
    ...common,
    about: { "@id": PERSON_ID },
  };
}

export function injectRouteSchema(html, schema) {
  const json = JSON.stringify(schema).replace(/</g, "\\u003c");
  return html.replace("</head>", "    <script type=\"application/ld+json\">" + json + "</script>\n  </head>");
}
