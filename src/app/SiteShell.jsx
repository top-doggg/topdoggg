import { useState } from "react";
import { footerNavigation, primaryNavigation } from "./site-navigation.js";
import "./site-shell.css";

export default function SiteShell({ children, mainId = "main" }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const pathname = typeof window === "undefined" ? "/" : window.location.pathname;
  const isCurrent = (href) => pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

  return (
    <div className="site-shell">
      <a className="site-shell-skip" href={`#${mainId}`}>Skip to content</a>
      <header className="site-shell-header">
        <a className="site-shell-brand" href="/" onClick={close}>
          <strong>DE.LA.COSTA</strong>
          <small>TRST Studios</small>
        </a>
        <button className="site-shell-menu" type="button" aria-expanded={open} aria-controls="site-shell-navigation" onClick={() => setOpen((value) => !value)}>
          {open ? "Close" : "Menu"}
        </button>
        <nav id="site-shell-navigation" className={open ? "open" : ""} aria-label="Primary navigation">
          {primaryNavigation.map((item) => (
            <a href={item.href} key={item.href} onClick={close} aria-current={isCurrent(item.href) ? "page" : undefined}>
              {item.label}
            </a>
          ))}
          <a href="/about" onClick={close} aria-current={isCurrent("/about") ? "page" : undefined}>About</a>
        </nav>
      </header>
      {children}
      <footer className="site-shell-footer">
        <strong>DE.LA.COSTA / TRST STUDIOS</strong>
        <nav aria-label="Footer navigation">
          {footerNavigation.map((item) => <a href={item.href} key={item.href}>{item.label}</a>)}
          <a href="/about">About</a>
          <a href="/journal">Journal</a>
        </nav>
      </footer>
    </div>
  );
}
