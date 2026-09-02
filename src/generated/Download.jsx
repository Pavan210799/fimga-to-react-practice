import "./Download.css";
import phone from "../assets/images/image-21-0338814f.png";

function Download() {
  return (
    <section className="download" id="download">
      <div className="download-inner">
        <svg
          className="download-pattern"
          viewBox="0 0 1140 297"
          preserveAspectRatio="xMidYMax meet"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path d="M-78 90.8597L-62.2266 105.448C68.9912 226.804 271.769 225.836 401.823 103.233L417.667 88.297C539.616 -26.665 729.998 -26.7793 852.084 88.0361L870.297 105.164C965.067 194.29 1108.2 207.827 1218 138.05" />
          <path d="M-78 117.366L-62.2266 131.953C68.9912 253.309 271.769 252.342 401.823 129.739L417.667 114.803C539.616 -0.159123 729.998 -0.273451 852.084 114.542L870.297 131.67C965.067 220.796 1108.2 234.333 1218 164.556" />
          <path d="M-78 143.87L-62.2266 158.458C68.9912 279.814 271.769 278.847 401.823 156.244L417.667 141.308C539.616 26.3458 729.998 26.2314 852.084 141.047L870.297 158.175C965.067 247.301 1108.2 260.838 1218 191.061" />
          <path d="M-78 170.376L-62.2266 184.964C68.9912 306.32 271.769 305.353 401.823 182.75L417.667 167.814C539.616 52.8516 729.998 52.7373 852.084 167.553L870.297 184.681C965.067 273.806 1108.2 287.344 1218 217.567" />
          <path d="M-78 196.882L-62.2266 211.47C68.9912 332.826 271.769 331.859 401.823 209.256L417.667 194.319C539.616 79.3575 729.998 79.2432 852.084 194.059L870.297 211.186C965.067 300.312 1108.2 313.85 1218 244.072" />
          <path d="M-78 223.388L-62.2266 237.976C68.9912 359.332 271.769 358.364 401.823 235.762L417.667 220.825C539.616 105.863 729.998 105.749 852.084 220.564L870.297 237.692C965.067 326.818 1108.2 340.356 1218 270.578" />
        </svg>
        <div className="download-content">
          <h2>Interested in working together? Download my CV</h2>
          <button type="button" className="btn btn-white">
            Download CV
          </button>
        </div>
        <div className="download-phone-wrap">
          <img src={phone} alt="Person" className="download-phone" />
        </div>
        <span className="download-dot download-dot-purple download-dot-motion download-dot-motion--1" />
        <span className="download-dot download-dot-yellow download-dot-motion download-dot-motion--2" />
        <span className="download-dot download-dot-red download-dot-motion download-dot-motion--3" />
      </div>
    </section>
  );
}

export default Download;
