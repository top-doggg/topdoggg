import React, { Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import { inject } from "@vercel/analytics";
import { SpeedInsights } from "@vercel/speed-insights/react";
import ArtistHomepage from "./ArtistHomepage.jsx";
import Storefront from "./Storefront.jsx";
import FulfillmentPolicy from "./FulfillmentPolicy.jsx";
import WholesalePreview from "./WholesalePreview.jsx";
import PartnerADrop from "./PartnerADrop.jsx";
import OpenThread from "./OpenThread.jsx";
import OpenThreadHub from "./OpenThreadHub.jsx";
import OperationsDesk from "./OperationsDesk.jsx";
import "./index.css";

const StudioApp = lazy(() => import("./App.jsx"));
const studioMode =
  new URLSearchParams(window.location.search).get("studio") === "open";
const path = window.location.pathname.replace(/\/+$/, "") || "/";
const policyMode = path === "/fulfillment-policy";
const wholesaleMode = path === "/wholesale";
const shopMode = path === "/shop";
const partnerMode = path === "/partner-a-drop" || path === "/partners";
const openThreadChapters = ["santa-ana", "san-juan-capistrano"];
const openThreadChapter = openThreadChapters.find((chapter) => path === `/open-thread/${chapter}`);
const openThreadHubMode = path === "/open-thread";
const operationsMode = path === "/operations";

const SITE_URL = "https://trststudios.online";
const DEFAULT_SOCIAL_IMAGE = `${SITE_URL}/instagram/realest-feeling.jpg`;

const routeMetadata = (() => {
  const home = {
    title: "Jorge S. Ruiz / DE.LA.COSTA | TRST Studios",
    description: "Multidisciplinary art, photography, film, design, wearable work, and community-rooted projects by Jorge S. Ruiz / DE.LA.COSTA.",
    canonical: `${SITE_URL}/`,
    robots: "index, follow",
  };

  if (studioMode) {
    return {
      title: "TRST Studio | Internal Workspace",
      description: "Internal TRST Studios production workspace.",
      canonical: `${SITE_URL}/`,
      robots: "noindex, nofollow",
    };
  }

  if (operationsMode) {
    return {
      title: "TRST Operations | Internal",
      description: "Private TRST Studios operations workspace.",
      canonical: `${SITE_URL}/operations`,
      robots: "noindex, nofollow",
    };
  }

  if (wholesaleMode) {
    return {
      title: "Retail Partner Preview | TRST Studios",
      description: "Private retail partner preview for TRST Studios / DE.LA.COSTA Edition 001.",
      canonical: `${SITE_URL}/wholesale`,
      robots: "noindex, nofollow",
    };
  }

  if (shopMode) {
    return {
      title: "Shop DE.LA.COSTA Edition 001 | TRST Studios",
      description: "Shop DE.LA.COSTA Edition 001 from TRST Studios—artist-led apparel and wearable work rooted in place, memory, and community.",
      canonical: `${SITE_URL}/shop`,
      robots: "index, follow",
    };
  }

  if (policyMode) {
    return {
      title: "Shipping & Returns Policy | TRST Studios",
      description: "TRST Studios made-to-order shipping, returns, and issue-resolution policy.",
      canonical: `${SITE_URL}/fulfillment-policy`,
      robots: "index, follow",
    };
  }

  if (partnerMode) {
    return {
      title: "Partner With TRST | TRST Studios",
      description: "Sponsorship and strategic partnership opportunities with TRST Studios and DE.LA.COSTA.",
      canonical: `${SITE_URL}/partners`,
      robots: "index, follow",
    };
  }

  if (openThreadChapter) {
    const city = openThreadChapter === "santa-ana" ? "Santa Ana" : "San Juan Capistrano";
    return {
      title: `Open Thread: ${city} | TRST Studios`,
      description: `A participatory TRST Studios community archive for ${city}, California.`,
      canonical: `${SITE_URL}/open-thread/${openThreadChapter}`,
      robots: "index, follow",
    };
  }

  if (openThreadHubMode) {
    return {
      title: "Open Thread | TRST Studios",
      description: "TRST Open Thread collects permissioned local stories and turns them into a public creative record.",
      canonical: `${SITE_URL}/open-thread`,
      robots: "index, follow",
    };
  }

  return home;
})();

function setMetaContent(selector, content) {
  document.querySelector(selector)?.setAttribute("content", content);
}

function applyRouteMetadata(metadata) {
  document.title = metadata.title;
  document.querySelector('link[rel="canonical"]')?.setAttribute("href", metadata.canonical);
  setMetaContent('meta[name="description"]', metadata.description);
  setMetaContent('meta[name="robots"]', metadata.robots);
  setMetaContent('meta[property="og:title"]', metadata.title);
  setMetaContent('meta[property="og:description"]', metadata.description);
  setMetaContent('meta[property="og:url"]', metadata.canonical);
  setMetaContent('meta[property="og:image"]', DEFAULT_SOCIAL_IMAGE);
  setMetaContent('meta[name="twitter:title"]', metadata.title);
  setMetaContent('meta[name="twitter:description"]', metadata.description);
  setMetaContent('meta[name="twitter:image"]', DEFAULT_SOCIAL_IMAGE);
}

applyRouteMetadata(routeMetadata);

inject({ framework: "vite" });

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {studioMode ? (
      <Suspense
        fallback={<div className="studio-loading">Opening studio…</div>}
      >
        <StudioApp />
      </Suspense>
    ) : policyMode ? (
      <FulfillmentPolicy />
    ) : wholesaleMode ? (
      <WholesalePreview />
    ) : partnerMode ? (
      <PartnerADrop />
    ) : openThreadChapter ? (
      <OpenThread chapterKey={openThreadChapter} />
    ) : openThreadHubMode ? (
      <OpenThreadHub />
    ) : operationsMode ? (
      <OperationsDesk />
    ) : shopMode ? (
      <Storefront />
    ) : (
      <ArtistHomepage />
    )}

    <SpeedInsights />
  </React.StrictMode>,
);
