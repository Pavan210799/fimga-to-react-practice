import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "./HeroSection.css";
import arrowDown from "../assets/icons/vuesax-linear-arrow-down.svg";
import search from "../assets/icons/vuesax-outline-search-normal.svg";
import heroBlob from "../assets/images/hero-blob.svg";
import heroBlobMask from "../assets/images/hero-blob-mask.svg";
import heroPerson from "../assets/images/hero-person.png";
import iconSms from "../assets/icons/icon-sms.svg";
import iconTick from "../assets/icons/icon-tick.svg";
import add from "../assets/icons/vuesax-linear-add.svg";
import avatar1 from "../assets/images/ellipse-5-f51f7a51.png";
import avatar2 from "../assets/images/ellipse-6-7ed6e64d.png";
import avatar3 from "../assets/images/ellipse-7-ffc00c64.png";
import avatar4 from "../assets/images/ellipse-8-5d50bca8.png";

const fields = [
  {
    key: "job",
    label: "Search for job",
    options: ["UI/UX Designer", "Developer", "Product Designer", "Remote roles"],
  },
  {
    key: "category",
    label: "Categories",
    options: ["Design", "Development", "Marketing", "Remote", "Internship"],
  },
  {
    key: "type",
    label: "Type",
    options: ["Full-time", "Part-time", "Contract", "Freelance"],
  },
];

function HeroSection() {
  const visualRef = useRef(null);
  const [openField, setOpenField] = useState(null);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 700);
  const [selections, setSelections] = useState({
    job: null,
    category: null,
    type: null,
  });

  useEffect(() => {
    function update() {
      setIsMobile(window.innerWidth <= 700);
    }
    update();
    window.addEventListener("resize", update);
    const media = window.matchMedia("(max-width: 700px)");
    media.addEventListener("change", update);
    return () => {
      window.removeEventListener("resize", update);
      media.removeEventListener("change", update);
    };
  }, []);

  useEffect(() => {
    const visual = visualRef.current;
    if (!visual) return undefined;

    function updateScale() {
      const width = visual.clientWidth;
      if (!width) return;
      visual.style.setProperty("--hero-scale", String(Math.min(1, width / 630)));
    }

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(visual);
    window.addEventListener("resize", updateScale);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateScale);
    };
  }, []);

  useEffect(() => {
    function onPointerDown(event) {
      if (event.target.closest(".search-dropdown-backdrop")) {
        setOpenField(null);
        return;
      }
      if (event.target.closest(".search-field-wrap, .search-dropdown")) {
        return;
      }
      setOpenField(null);
    }

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  function handleSelect(fieldKey, option) {
    setSelections((current) => ({ ...current, [fieldKey]: option }));
    setOpenField(null);
  }

  function handleSearch() {
    setOpenField(null);
    const section = document.getElementById("jobs");
    if (!section) return;
    const top = Math.max(0, section.getBoundingClientRect().top + window.scrollY - 78);
    window.scrollTo({ top, behavior: "smooth" });
  }

  const openFieldData = fields.find((field) => field.key === openField);

  const dropdownItems = openFieldData
    ? openFieldData.options.map((option) => (
        <button
          key={option}
          type="button"
          className={`search-dropdown-item${selections[openFieldData.key] === option ? " is-selected" : ""}`}
          onClick={() => handleSelect(openFieldData.key, option)}
        >
          {option}
        </button>
      ))
    : null;

  return (
    <>
    <section className="hero" id="home">
      <div className="hero-content">
        <div className="hero-badge">
          <span className="badge-new">NEW</span>
          <span className="badge-text">
            Stay Connect with us to get all the notification about new job
          </span>
        </div>

        <h1 className="hero-title">
          Find part time job &{" "}
          <br />
          increase your skills
        </h1>

        <p className="hero-subtitle">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          <br />
          Imperdiet tempus felis vitae sit est quisque.
        </p>

        <div className="search-bar">
          <div className="search-fields">
            {fields.map((field, index) => (
              <div key={field.key} className="search-group">
                {index > 0 ? <span className="search-divider" /> : null}
                <div className={`search-field-wrap${openField === field.key ? " is-open" : ""}`}>
                  <button
                    type="button"
                    className={`search-field search-field-${field.key}`}
                    aria-expanded={openField === field.key}
                    onClick={() => setOpenField(openField === field.key ? null : field.key)}
                  >
                    <span>{selections[field.key] ?? field.label}</span>
                    <img src={arrowDown} alt="" width="18" height="18" />
                  </button>
                  {!isMobile && openField === field.key ? (
                    <div className="search-dropdown" role="listbox">
                      {dropdownItems}
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
          <button type="button" className="search-btn" aria-label="Search" onClick={handleSearch}>
            <img src={search} alt="" width="24" height="24" />
          </button>
        </div>
      </div>

      <div className="hero-visual" ref={visualRef}>
        <div className="hero-image">
          <img src={heroBlob} alt="" className="hero-blob" aria-hidden="true" />
          <div
            className="hero-mask"
            style={{ "--hero-mask-url": `url("${heroBlobMask}")` }}
          >
            <img src={heroPerson} alt="" className="hero-person hero-person-masked" />
          </div>
          <div className="hero-person-top">
            <img src={heroPerson} alt="Person" className="hero-person" />
          </div>

          <div className="hero-circle hero-circle-white hero-motion hero-motion--1" style={{ top: 188, left: 122, width: 44, height: 44 }} />
          <div className="hero-circle hero-circle-green-outline hero-motion hero-motion--2" style={{ top: 240, left: 561, width: 35, height: 35 }} />
          <div className="hero-circle hero-circle-green-outline hero-motion hero-motion--3" style={{ top: 481, left: 30, width: 29, height: 29 }} />
          <div className="hero-circle hero-circle-white-small hero-motion hero-motion--4" style={{ top: 642, left: 477, width: 24, height: 24 }} />

          <div className="congrats-card hero-card-motion hero-card-motion--1">
            <div className="congrats-icon" aria-hidden="true">
              <img src={iconSms} alt="" width="24" height="24" />
            </div>
            <div className="congrats-text">
              <span className="congrats-title">Congratulation</span>
              <span className="congrats-sub">You have got a mail</span>
            </div>
            <div className="congrats-check" aria-hidden="true">
              <img src={iconTick} alt="" width="16" height="16" />
            </div>
          </div>

          <div className="stats-card-hero hero-card-motion hero-card-motion--2">
            <p className="stats-card-text">50K+ Job holder get job</p>
            <div className="avatar-row">
              <img src={avatar1} alt="" />
              <img src={avatar2} alt="" />
              <img src={avatar3} alt="" />
              <img src={avatar4} alt="" />
              <span className="avatar-add">
                <img src={add} alt="" width="14" height="14" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
    {isMobile && openFieldData
      ? createPortal(
          <>
            <div className="search-dropdown-backdrop" aria-hidden="true" />
            <div className="search-dropdown search-dropdown--page" role="listbox">
              {dropdownItems}
            </div>
          </>,
          document.body
        )
      : null}
    </>
  );
}

export default HeroSection;
