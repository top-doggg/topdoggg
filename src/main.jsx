import React,{Suspense,lazy} from "react";
import {createRoot} from "react-dom/client";
import {inject} from "@vercel/analytics";
import {SpeedInsights} from "@vercel/speed-insights/react";
import HomeCover from "./HomeCover.jsx";
import Storefront from "./Storefront.jsx";
import FulfillmentPolicy from "./FulfillmentPolicy.jsx";
import WholesalePreview from "./WholesalePreview.jsx";
import PartnerADrop from "./PartnerADrop.jsx";
import OpenThread from "./OpenThread.jsx";
import OpenThreadHub from "./OpenThreadHub.jsx";
import OperationsDesk from "./OperationsDesk.jsx";
import Work from "./Work.jsx";
import ProjectDetail from "./ProjectDetail.jsx";
import About from "./About.jsx";
import Journal from "./Journal.jsx";
import JournalEntry from "./JournalEntry.jsx";
import ProductDetail from "./ProductDetail.jsx";
import {resolveRoute} from "./app/routes.js";
import {trackDiscoveryLanding} from "./lib/discovery-telemetry.js";
import "./index.css";
const StudioApp=lazy(()=>import("./App.jsx"));
const studioMode=import.meta.env.DEV&&new URLSearchParams(window.location.search).get("studio")==="open";
const route=resolveRoute(window.location.pathname);
if(studioMode){document.title="TRST Studio | Internal Workspace";document.querySelector('meta[name="robots"]')?.setAttribute("content","noindex, nofollow");document.querySelector('link[rel="canonical"]')?.setAttribute("href","https://trststudios.online/");}
inject({framework:"vite"}); trackDiscoveryLanding({routeId:studioMode?"studio":route.id,pathname:window.location.pathname});
createRoot(document.getElementById("root")).render(<React.StrictMode>
{studioMode?<Suspense fallback={<div className="studio-loading">Opening studio…</div>}><StudioApp /></Suspense>
:route.id==="fulfillment"?<FulfillmentPolicy />
:route.id==="wholesale"?<WholesalePreview />
:route.id==="partners"?<PartnerADrop />
:route.id==="openThreadChapter"?<OpenThread chapterKey={route.params.chapter} />
:route.id==="openThread"?<OpenThreadHub />
:route.id==="operations"?<OperationsDesk />
:route.id==="work"?<Work />
:route.id==="about"?<About />
:route.id==="journalEntry"?<JournalEntry slug={route.params.slug} />
:route.id==="journal"?<Journal />
:route.id==="project"?<ProjectDetail projectId={route.params.projectId} />
:route.id==="product"?<ProductDetail productId={route.params.productId} />
:route.id==="shop"?<Storefront />
:<HomeCover />}
<SpeedInsights /></React.StrictMode>);
