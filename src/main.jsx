import React, { Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import { inject } from "@vercel/analytics";
import { SpeedInsights } from "@vercel/speed-insights/react";
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
const policyMode = window.location.pathname.replace(/\/+$/, "") === "/fulfillment-policy";
const wholesaleMode = window.location.pathname.replace(/\/+$/, "") === "/wholesale";
const partnerPath = window.location.pathname.replace(/\/+$/, "");
const partnerMode = partnerPath === "/partner-a-drop" || partnerPath === "/partners";
const openThreadChapters = ["santa-ana", "san-juan-capistrano"];
const openThreadChapter = openThreadChapters.find((chapter) => partnerPath === `/open-thread/${chapter}`);
const openThreadHubMode = partnerPath === "/open-thread";
const operationsMode = partnerPath === "/operations";

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
    ) : (
      <Storefront />
    )}

    <SpeedInsights />
  </React.StrictMode>,
);
