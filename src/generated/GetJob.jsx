import "./GetJob.css";
import img1 from "../assets/images/rectangle-42-dc2af69d.png";
import img2 from "../assets/images/rectangle-43-f7fce3f6.png";
import img3 from "../assets/images/rectangle-44-9076f7c3.png";
import img4 from "../assets/images/rectangle-45-05b91ae8.png";
import img5 from "../assets/images/rectangle-46-3586aec4.png";
import img6 from "../assets/images/rectangle-47-471d7d8c.png";
import img7 from "../assets/images/rectangle-48-7f72a1d8.png";

const GRID_WIDTH = 516;
const GRID_HEIGHT = 556;

const grid = [
  { src: img1, top: 134, left: 0, background: "#5BB1E1" },
  { src: img2, top: 40, left: 188, background: "#FF4F60" },
  { src: img3, top: 322, left: 0, background: "#FFC042" },
  { src: img4, top: 228, left: 188, background: "#FF6E30" },
  { src: img5, top: 134, left: 376, background: "#CB5AF2" },
  { src: img6, top: 322, left: 376, background: "#2FCD70" },
  { src: img7, top: 416, left: 188, background: "#7B61FF" },
];

const dots = [
  { className: "grid-dot grid-dot-purple", top: 82, left: 112 },
  { className: "grid-dot grid-dot-orange", top: 512, left: 126 },
  { className: "grid-dot grid-dot-green", top: 0, left: 376 },
];

function gridStyle(top, left) {
  return {
    "--item-top": `${(top / GRID_HEIGHT) * 100}%`,
    "--item-left": `${(left / GRID_WIDTH) * 100}%`,
  };
}

function GetJob() {
  return (
    <>
      <div className="section-dots" aria-hidden="true">
        <div className="section-dots-grid">
          {Array.from({ length: 64 }, (_, index) => (
            <span key={index} />
          ))}
        </div>
      </div>
      <section className="get-job" id="app">
      <div className="get-job-content">
        <div className="get-job-text">
          <h2>
            <span className="text-green">55K+</span> Job holder get job
          </h2>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nec
            suspendisse fermentum nunc enim dignissim duis dapibus. Ornare eget
            elementum vel at. Fusce nibh et at aliquet nullam viverra. Ac mauris
            cursus rhoncus lorem pellentesque erat nisl fermentum.
            <br />
            Nulla in ornare egestas volutpat egestas commodo justo ridiculus.
            Vulputate sagittis tincidunt nunc dictumst.
          </p>
        </div>
        <a href="#jobs" className="btn btn-primary">
          Explore More
        </a>
      </div>

      <div className="get-job-images-canvas">
        {grid.map((item) => (
          <div
            key={item.src}
            className="grid-item"
            style={{ ...gridStyle(item.top, item.left), background: item.background }}
          >
            <img src={item.src} alt="" />
          </div>
        ))}
        {dots.map((dot, index) => (
          <div
            key={dot.className}
            className={`${dot.className} grid-dot-motion grid-dot-motion--${index + 1}`}
            style={gridStyle(dot.top, dot.left)}
          />
        ))}
      </div>
    </section>
    </>
  );
}

export default GetJob;
