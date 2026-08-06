import { useEffect, useMemo, useState } from "react";
import "./operations.css";

const statuses = ["new", "approved", "follow-up", "declined", "published"];

function loadToken() {
  const token = new URLSearchParams(window.location.search).get("token");
  if (token) sessionStorage.setItem("trst-operations-token", token);
  return token || sessionStorage.getItem("trst-operations-token") || "";
}

export default function OperationsDesk() {
  const [token] = useState(loadToken);
  const [email, setEmail] = useState("");
  const [records, setRecords] = useState([]);
  const [state, setState] = useState(token ? "loading" : "idle");
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("all");
  const visibleRecords = useMemo(() => records.filter((record) => filter === "all" || (record.reviewStatus || "new") === filter), [records, filter]);

  async function refresh() {
    setState("loading");
    const response = await fetch(`/api/operations?token=${encodeURIComponent(token)}`);
    const body = await response.json();
    if (!response.ok) { sessionStorage.removeItem("trst-operations-token"); setState("idle"); setMessage(body.error || "Your access link has expired."); return; }
    setRecords(body.records || []); setState("ready");
  }

  useEffect(() => { if (token) refresh(); }, []);

  async function requestAccess(event) {
    event.preventDefault(); setState("loading");
    const response = await fetch("/api/operations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
    setState("idle"); setMessage(response.ok ? "If the address is authorized, a private link is on its way." : "Could not request access.");
  }

  async function update(record, reviewStatus) {
    const reviewNote = window.prompt("Optional private note:", record.reviewNote || "");
    if (reviewNote === null) return;
    const response = await fetch(`/api/operations?token=${encodeURIComponent(token)}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pathname: record.pathname, reviewStatus, reviewNote }) });
    const body = await response.json();
    if (!response.ok) { setMessage(body.error || "Could not save the review."); return; }
    setRecords((current) => current.map((item) => item.pathname === record.pathname ? body.record : item));
  }

  if (!token || state === "idle") return <main className="ops-login"><a href="/">TRST STUDIOS</a><section><p>Private operations</p><h1>Keep the thread moving.</h1><form onSubmit={requestAccess}><label>Operations email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label><button>Send private access link</button></form>{message && <small>{message}</small>}</section></main>;
  return <main className="ops-desk"><header><a href="/">TRST STUDIOS</a><div><p>Open Thread operations</p><h1>Review desk</h1></div><button onClick={refresh}>Refresh</button></header><nav>{["all", ...statuses].map((item) => <button className={filter === item ? "active" : ""} key={item} onClick={() => setFilter(item)}>{item}</button>)}</nav>{message && <p>{message}</p>}{state === "loading" ? <p>Loading private records...</p> : <section>{visibleRecords.length ? visibleRecords.map((record) => <article key={record.pathname}><div><small>{record.type === "signal" ? "Community signal" : "Partner inquiry"}</small><strong>{record.reviewStatus || "new"}</strong></div><h2>{record.type === "signal" ? `${record.chapter === "santa-ana" ? "Santa Ana" : "San Juan Capistrano"} signal` : record.organization}</h2><blockquote>{record.type === "signal" ? record.signal : record.idea}</blockquote><p className="ops-meta">{record.type === "signal" ? `${record.permissionToPublish ? "Permission granted" : "No publication permission"} · ${record.utm?.utm_source || "direct"}` : `${record.name} · ${record.email}`}<br />{new Date(record.receivedAt).toLocaleString()}</p>{record.reviewNote && <p className="ops-note">{record.reviewNote}</p>}<footer>{statuses.map((item) => <button key={item} onClick={() => update(record, item)}>{item}</button>)}</footer></article>) : <p>No records in this view yet.</p>}</section>}</main>;
}
