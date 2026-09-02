import "./Download.css";
import phone from "../assets/images/image-21-0338814f.png";

function Download() {
  return (
    <section className="download" id="download">
      <div className="download-inner">
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
