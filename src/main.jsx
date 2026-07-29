import React, { Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import { inject } from "@vercel/analytics";
import { SpeedInsights } from "@vercel/speed-insights/react";
import Storefront from "./Storefront.jsx";
import "./index.css";

const StudioApp = lazy(() => import("./App.jsx"));
const studioMode =
  new URLSearchParams(window.location.search).get("studio") === "open";

inject({ framework: "vite" });

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {studioMode ? (
      <Suspense
        fallback={<div className="studio-loading">Opening studio…</div>}
      >
        <StudioApp />
      </Suspense>
    ) : (
      <Storefront />
    )}

    <SpeedInsights />
  </React.StrictMode>,
);