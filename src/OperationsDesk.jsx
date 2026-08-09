import { useEffect, useMemo, useState } from "react";
import "./operations.css";
import "./crm.css";

const statuses = ["new", "approved", "follow-up", "declined", "published"];
const contactTypes = ["collector", "curator", "gallery", "designer", "cultural organization", "collaborator", "warm contact"];

function loadToken() {
  const token = new URLSearchParams(window.location.search).get("token");
  if (token) sessionStorage.setItem("trst-operations-token", token);
  return token || sessionStorage.getItem("trst-operations-token") || "";
}

function recordLabel(record) {
  if (record.type === "signal") return "Community signal";
  if (record.type === "artwork") return "Artwork inquiry";
  return "Partner inquiry";
}

function recordTitle(record) {
  if (record.type === "signal") return `${record.chapter === "santa-ana" ? "Santa Ana" : "San Juan Capistrano"} signal`;
  if (record.type === "artwork") return record.artworkTitle;
  return record.organization;
}

function recordBody(record) {
  if (record.type === "signal") return record.signal;
  if (record.type === "artwork") return record.message;
  return record.idea;
}

function recordMeta(record) {
  if (record.type === "signal") return `${record.permissionToPublish ? "Permission granted" : "No publication permission"} · ${record.utm?.utm_source || "direct"}`;
  if (record.type === "artwork") return `${record.name} · ${record.email} · ${record.inquiryType} · ${record.consentStatus}`;
  return `${record.name} · ${record.email}`;
}

function inferContactType(record) {
  const text = `${record.organization || ""} ${record.inquiryType || ""} ${record.idea || ""} ${record.message || ""}`.toLowerCase();
  if (record.type === "artwork" && record.inquiryType === "original") return "collector";
  if (text.includes("curator") || record.inquiryType === "exhibition") return "curator";
  if (text.includes("gallery")) return "gallery";
  if (text.includes("design") || record.inquiryType === "licensing") return "designer";
  if (record.organization || text.includes("museum") || text.includes("center") || text.includes("community")) return "cultural organization";
  if (record.inquiryType === "collaboration" || record.type === "partner") return "collaborator";
  return "warm contact";
}

function buildContacts(records) {
  const contacts = new Map();
  records.forEach((record) => {
    const email = String(record.email || "").trim().toLowerCase();
    if (!email) return;
    const existing = contacts.get(email) || { email, name: record.name || "", organization: record.organization || "", type: inferContactType(record), records: [], lastContact: record.receivedAt };
    existing.records.push(record);
    if (!existing.name && record.name) existing.name = record.name;
    if (!existing.organization && record.organization) existing.organization = record.organization;
    if (new Date(record.receivedAt) > new Date(existing.lastContact)) existing.lastContact = record.receivedAt;
    if (existing.type === "warm contact") existing.type = inferContactType(record);
    contacts.set(email, existing);
  });
  return [...contacts.values()].sort((a, b) => new Date(b.lastContact) - new Date(a.lastContact));
}

function downloadContacts(contacts) {
  const quote = (value) => `"${String(value || "").replaceAll('"', '""')}"`;
  const rows = [["name", "email", "organization", "relationship_type", "last_contact", "touchpoints", "stage"], ...contacts.map((contact) => [contact.name, contact.email, contact.organization, contact.type, contact.lastContact, contact.records.length, contact.records[0]?.reviewStatus || "new"])];
  const blob = new Blob([rows.map((row) => row.map(quote).join(",")).join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `trst-collector-crm-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function OperationsDesk() {
  const [token] = useState(loadToken);
  const [email, setEmail] = useState("");
  const [records, setRecords] = useState([]);
  const [state, setState] = useState(token ? "loading" : "idle");
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("all");
  const [view, setView] = useState("pipeline");
  const [contactFilter, setContactFilter] = useState("all");
  const visibleRecords = useMemo(() => records.filter((record) => filter === "all" || (record.reviewStatus || "new") === filter), [records, filter]);
  const contacts = useMemo(() => buildContacts(records), [records]);
  const visibleContacts = useMemo(() => contacts.filter((contact) => contactFilter === "all" || contact.type === contactFilter), [contacts, contactFilter]);

  async function refresh() {
    setState("loading");
    const response = await fetch(`/api/operations?token=${encodeURIComponent(token)}`);
    const body = await response.json();
    if (!response.ok) {
      sessionStorage.removeItem("trst-operations-token");
      setState("idle");
      setMessage(body.error || "Your access link has expired.");
      return;
    }
    setRecords(body.records || []);
    setState("ready");
  }

  useEffect(() => { if (token) refresh(); }, []);

  async function requestAccess(event) {
    event.preventDefault();
    setState("loading");
    const response = await fetch("/api/operations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
    setState("idle");
    setMessage(response.ok ? "If the address is authorized, a private link is on its way." : "Could not request access.");
  }

  async function update(record, reviewStatus) {
    const reviewNote = window.prompt("Optional private note:", record.reviewNote || "");
    if (reviewNote === null) return;
    const response = await fetch(`/api/operations?token=${encodeURIComponent(token)}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pathname: record.pathname, reviewStatus, reviewNote }) });
    const body = await response.json();
    if (!response.ok) {
      setMessage(body.error || "Could not save the review.");
      return;
    }
    setRecords((current) => current.map((item) => item.pathname === record.pathname ? body.record : item));
  }

  if (!token || state === "idle") {
    return <main className="ops-login"><a href="/">TRST STUDIOS</a><section><p>Private operations</p><h1>Keep the thread moving.</h1><form onSubmit={requestAccess}><label>Operations email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label><button>Send private access link</button></form>{message && <small>{message}</small>}</section></main>;
  }

  return (
    <main className="ops-desk">
      <header><a href="/">TRST STUDIOS</a><div><p>TRST operations</p><h1>{view === "pipeline" ? "Review desk" : "Collector CRM"}</h1></div><button onClick={refresh}>Refresh</button></header>
      <div className="ops-view-switch"><button className={view === "pipeline" ? "active" : ""} onClick={() => setView("pipeline")}>Pipeline</button><button className={view === "contacts" ? "active" : ""} onClick={() => setView("contacts")}>Contacts</button>{view === "contacts" && <button onClick={() => downloadContacts(visibleContacts)}>Export CSV</button>}</div>
      <nav>{view === "pipeline" ? ["all", ...statuses].map((item) => <button className={filter === item ? "active" : ""} key={item} onClick={() => setFilter(item)}>{item}</button>) : ["all", ...contactTypes].map((item) => <button className={contactFilter === item ? "active" : ""} key={item} onClick={() => setContactFilter(item)}>{item}</button>)}</nav>
      {message && <p>{message}</p>}
      {state === "loading" ? <p>Loading private records...</p> : view === "contacts" ? (
        <section className="ops-contacts">{visibleContacts.length ? visibleContacts.map((contact) => (
          <article key={contact.email}>
            <div><small>{contact.type}</small><strong>{contact.records[0]?.reviewStatus || "new"}</strong></div>
            <h2>{contact.name || contact.email}</h2>
            {contact.organization && <p className="ops-org">{contact.organization}</p>}
            <p className="ops-meta">{contact.email}<br />Last contact {new Date(contact.lastContact).toLocaleDateString()} · {contact.records.length} touchpoint{contact.records.length === 1 ? "" : "s"}</p>
            <ul>{contact.records.slice(0, 3).map((record) => <li key={record.pathname}>{recordLabel(record)} · {recordTitle(record)}</li>)}</ul>
          </article>
        )) : <p>No contacts in this view yet.</p>}</section>
      ) : (
        <section>{visibleRecords.length ? visibleRecords.map((record) => (
          <article key={record.pathname}>
            <div><small>{recordLabel(record)}</small><strong>{record.reviewStatus || "new"}</strong></div>
            <h2>{recordTitle(record)}</h2>
            <blockquote>{recordBody(record)}</blockquote>
            <p className="ops-meta">{recordMeta(record)}<br />{new Date(record.receivedAt).toLocaleString()}</p>
            {record.reviewNote && <p className="ops-note">{record.reviewNote}</p>}
            <footer>{statuses.map((item) => <button key={item} onClick={() => update(record, item)}>{item}</button>)}</footer>
          </article>
        )) : <p>No records in this view yet.</p>}</section>
      )}
    </main>
  );
}
