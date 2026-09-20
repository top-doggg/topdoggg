const SITE_URL = "https://trststudios.online";
const PERSON_ID = SITE_URL + "/#jorge-s-ruiz";
const WEBSITE_ID = SITE_URL + "/#website";

export function routeSchema(route) {
  const common = {
    "@id": route.canonical + "#webpage",
    url: route.canonical,
    name: route.title,
    description: route.description,
    isPartOf: { "@id": WEBSITE_ID },
  };

  if (route.canonical === SITE_URL + "/about") {
    return {
      "@context": "https://schema.org",
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

  if (route.work) {
    return {
      "@context": "https://schema.org",
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
  return {
    "@context": "https://schema.org",
    "@type": collectionPaths.includes(path) ? "CollectionPage" : "WebPage",
    ...common,
    about: { "@id": PERSON_ID },
  };
}

export function injectRouteSchema(html, schema) {
  const json = JSON.stringify(schema).replace(/</g, "\\u003c");
  return html.replace("</head>", "    <script type=\"application/ld+json\">" + json + "</script>\n  </head>");
}
