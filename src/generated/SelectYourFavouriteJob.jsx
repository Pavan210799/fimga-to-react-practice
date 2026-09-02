import { useState } from "react";
import "./SelectYourFavouriteJob.css";
import arrowRight from "../assets/icons/vuesax-linear-arrow-right.svg";
import add from "../assets/icons/vuesax-linear-add.svg";
import tcs from "../assets/icons/company-tcs.svg";
import facebook from "../assets/icons/company-facebook.svg";
import dribbble from "../assets/icons/company-dribbble.svg";
import google from "../assets/icons/company-google.svg";
import ibm from "../assets/icons/company-ibm.svg";
import pwc from "../assets/icons/company-pwc.svg";
import a1 from "../assets/images/ellipse-5-f51f7a51.png";
import a2 from "../assets/images/ellipse-6-7ed6e64d.png";
import a3 from "../assets/images/ellipse-7-ffc00c64.png";
import a4 from "../assets/images/ellipse-8-5d50bca8.png";

const jobs = [
  { id: 1, company: "TCS, Torantoo", title: "Sr. UI/UX Designer", posted: "3 days ago", logo: tcs },
  { id: 2, company: "Facebook, London", title: "Sr. UI/UX Designer", posted: "3 days ago", logo: facebook },
  { id: 3, company: "Dribbble, Canada", title: "Sr. UI/UX Designer", posted: "7 days ago", logo: dribbble },
  { id: 4, company: "Google, US", title: "Sr. UI/UX Designer", posted: "2 days ago", logo: google },
  { id: 5, company: "IBM, India", title: "Sr. UI/UX Designer", posted: "3 days ago", logo: ibm },
  { id: 6, company: "PWC, UAE", title: "Sr. UI/UX Designer", posted: "3 days ago", logo: pwc },
];

const avatars = [a1, a2, a3, a4];

function BookmarkIcon({ active }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z"
        stroke={active ? "#2FCD70" : "rgba(2,2,2,0.5)"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17 2.44V12.42C17 14.39 15.59 15.16 13.86 14.12L12.54 13.33C12.24 13.15 11.76 13.15 11.46 13.33L10.14 14.12C8.41 15.15 7 14.39 7 12.42V2.44"
        fill={active ? "#2FCD70" : "none"}
        stroke={active ? "#2FCD70" : "rgba(2,2,2,0.5)"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SelectYourFavouriteJob() {
  const [saved, setSaved] = useState([]);
  const [pulsingId, setPulsingId] = useState(null);

  function toggleSaved(id) {
    setPulsingId(id);
    setSaved((current) => (current.includes(id) ? current.filter((jobId) => jobId !== id) : [...current, id]));
  }

  return (
    <section className="favourite-job" id="jobs">
      <div className="section-header">
        <h2>
          Select your <span className="text-green">favourite</span> job
        </h2>
        <p>
          Nulla in ornare egestas volutpat egestas commodo justo ridiculus.
          Vulputate sagittis tincidunt nunc dictumst. Faucibus aliquet in potenti
          lectus orci elementum in id cras. Sem cras rutrum gravida massa tempus
          ullamcorper.
        </p>
      </div>

      <div className="job-grid">
        {jobs.map((job) => {
          const isSaved = saved.includes(job.id);
          return (
            <article key={job.id} className={`job-card${isSaved ? " is-saved" : ""}`}>
              <div className="job-card-header">
                <img src={job.logo} alt="" className="company-logo" width="47" height="47" />
                <div className="job-info">
                  <span className="company-location">{job.company}</span>
                  <span className="job-title">{job.title}</span>
                  <span className="job-time">{job.posted}</span>
                </div>
                <button
                  type="button"
                  className={`bookmark-btn${isSaved ? " is-active" : ""}${pulsingId === job.id ? " is-pulsing" : ""}`}
                  aria-label={isSaved ? "Unsave job" : "Save job"}
                  aria-pressed={isSaved}
                  onClick={() => toggleSaved(job.id)}
                >
                  <span
                    className="bookmark"
                    onAnimationEnd={() => {
                      setPulsingId((current) => (current === job.id ? null : current));
                    }}
                  >
                    <BookmarkIcon active={isSaved} />
                  </span>
                </button>
              </div>
              <p className="job-desc">
                Nulla in ornare egestas volutpat egestas commodo justo ridiculus.
                Vulputate sagittis tincidunt nunc dictumst.
              </p>
              <div className="job-card-footer">
                <a href="#apply" className="apply-link">
                  Apply now
                  <img src={arrowRight} alt="" width="16" height="16" />
                </a>
                <div className="avatar-stack-small">
                  {avatars.map((src) => (
                    <img key={src} src={src} alt="" className="avatar-sm" />
                  ))}
                  <span className="avatar-add-sm">
                    <img src={add} alt="" width="14" height="14" />
                  </span>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default SelectYourFavouriteJob;
