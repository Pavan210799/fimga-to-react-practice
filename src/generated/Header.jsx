import { useEffect, useRef, useState } from "react";
import "./Header.css";
import logo from "../assets/icons/random-symboles-9.svg";
import arrowDown from "../assets/icons/vuesax-linear-arrow-down.svg";
import upload from "../assets/icons/vuesax-linear-document-upload.svg";

const NAV_LINKS = [
  { label: "Home", href: "#home", id: "home" },
  { label: "About Us", href: "#about", id: "about" },
  { label: "Job Categories", href: "#jobs", id: "jobs", dropdown: true },
  { label: "Our App", href: "#app", id: "app" },
  { label: "Contact Us", href: "#contact", id: "contact" },
];

const SPY_SECTIONS = ["home", "about", "jobs", "app", "contact"];
const HEADER_OFFSET = 78;

function Header() {
  const [activeId, setActiveId] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pendingNav = useRef(null);

  useEffect(() => {
    let idleTimer = 0;

    function getSections() {
      return SPY_SECTIONS.map((id) => document.getElementById(id)).filter(Boolean);
    }

    function syncActive() {
      if (pendingNav.current) return;

      const sections = getSections();
      if (!sections.length) return;

      const marker = window.scrollY + HEADER_OFFSET + 48;
      let current = "home";

      if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 48) {
        setActiveId("contact");
        return;
      }

      for (const section of sections) {
        if (section.getBoundingClientRect().top + window.scrollY <= marker) {
          current = section.id;
        }
      }

      setActiveId(current);
    }

    function onScroll() {
      setScrolled(window.scrollY > 12);

      if (pendingNav.current) {
        window.clearTimeout(idleTimer);
        idleTimer = window.setTimeout(() => {
          pendingNav.current = null;
          syncActive();
        }, 180);
        return;
      }

      syncActive();
    }

    setScrolled(window.scrollY > 12);
    syncActive();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", syncActive);
    return () => {
      window.clearTimeout(idleTimer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", syncActive);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    const shell = document.querySelector(".header-shell");
    shell?.classList.toggle("is-scrolled", scrolled);
    return () => {
      shell?.classList.remove("is-scrolled");
    };
  }, [scrolled]);

  function handleNavClick(event, id) {
    event.preventDefault();
    setActiveId(id);
    setMenuOpen(false);
    pendingNav.current = { id };

    if (id === "home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      const section = document.getElementById(id);
      if (section) {
        const top = Math.max(0, section.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET);
        window.scrollTo({ top, behavior: "smooth" });
      }
    }

    const { pathname, search } = window.location;
    window.history.replaceState(null, "", `${pathname}${search}#${id}`);
  }

  return (
    <header className={`header${scrolled ? " is-scrolled" : ""}${menuOpen ? " is-menu-open" : ""}`}>
      <div className="header-inner">
        <a href="#home" className="logo" onClick={(event) => handleNavClick(event, "home")}>
          <img src={logo} alt="Job Finder" width="38" height="50" />
        </a>

        <nav className={`nav${menuOpen ? " is-open" : ""}`} aria-label="Main">
          {NAV_LINKS.map((link) => (
            <a
              key={link.id}
              href={link.href}
              className={`nav-link${link.dropdown ? " nav-dropdown" : ""}${activeId === link.id ? " is-active" : ""}`}
              onClick={(event) => handleNavClick(event, link.id)}
            >
              {link.label}
              {link.dropdown ? <img src={arrowDown} alt="" width="18" height="18" /> : null}
            </a>
          ))}

          <div className="header-actions header-actions-mobile">
            <a href="#apply" className="upload-resume" onClick={() => setMenuOpen(false)}>
              <img src={upload} alt="" width="24" height="24" />
              Upload Resume
            </a>
            <a href="#apply" className="btn btn-primary header-create" onClick={() => setMenuOpen(false)}>
              Create Account
            </a>
          </div>
        </nav>

        <div className="header-actions header-actions-desktop">
          <a href="#apply" className="upload-resume">
            <img src={upload} alt="" width="24" height="24" />
            Upload Resume
          </a>
          <a href="#apply" className="btn btn-primary header-create">
            Create Account
          </a>
        </div>

        <button
          type="button"
          className={`menu-toggle${menuOpen ? " is-open" : ""}`}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}

export default Header;
