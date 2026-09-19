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
import Work from "./Work.jsx";
import ProjectDetail from "./ProjectDetail.jsx";
import "./index.css";

const StudioApp = lazy(() => import("./App.jsx"));
// Studio is an internal authoring surface and is never exposed in production.
const studioMode =
  import.meta.env.DEV && new URLSearchParams(window.location.search).get("studio") === "open";
const path = window.location.pathname.replace(/\/+$/, "") || "/";
const policyMode = path === "/fulfillment-policy";
const wholesaleMode = path === "/wholesale";
const shopMode = path === "/shop";
const partnerMode = path === "/partner-a-drop" || path === "/partners";
const openThreadChapters = ["santa-ana", "san-juan-capistrano"];
const openThreadChapter = openThreadChapters.find((chapter) => path === `/open-thread/${chapter}`);
const openThreadHubMode = path === "/open-thread";
const operationsMode = path === "/operations";
const workMode = path === "/work";
const projectMatch = path.match(/^\/work\/([^/]+)$/);

if (studioMode) {
  document.title = "TRST Studio | Internal Workspace";
  document
    .querySelector('meta[name="robots"]')
    ?.setAttribute("content", "noindex, nofollow");
  document
    .querySelector('link[rel="canonical"]')
    ?.setAttribute("href", "https://trststudios.online/");
}

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
    ) : workMode ? (
      <Work />
    ) : projectMatch ? (
      <ProjectDetail projectId={projectMatch[1]} />
    ) : shopMode ? (
      <Storefront />
    ) : (
      <ArtistHomepage />
    )}

    <SpeedInsights />
  </React.StrictMode>,
);
