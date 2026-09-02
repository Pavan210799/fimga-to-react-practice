import "./HowWeWorks.css";
import briefcase from "../assets/icons/icon-briefcase.svg";

const steps = [
  {
    title: "Create Account",
    background: "rgba(47, 194, 252, 0.1)",
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
        <path d="M28.4 34.3c-1.5.5-3.2.7-5.3.7H12.9c-2.1 0-3.8-.2-5.3-.7.4-4.4 4.9-7.9 10.4-7.9s10 3.5 10.4 7.9Z" stroke="#2FC2FC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M23.1 1H12.9C4.4 1 1 4.4 1 12.9v10.2c0 6.4 1.9 9.9 6.6 11.2.3-4.4 4.9-7.9 10.4-7.9s10 3.5 10.4 7.9c4.6-1.3 6.6-4.8 6.6-11.2V12.9C35 4.4 31.6 1 23.1 1ZM18 21.7c-3.4 0-6.1-2.7-6.1-6.1S14.6 9.5 18 9.5s6.1 2.7 6.1 6.1-2.7 6.1-6.1 6.1Z" stroke="#2FC2FC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Search Job",
    background: "rgba(45, 204, 110, 0.1)",
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <path d="M19.17 36.25c-9.42 0-17.09-7.67-17.09-17.08S9.75 2.08 19.17 2.08s17.08 7.67 17.08 17.09-7.67 17.08-17.08 17.08Zm0-31.67c-8.05 0-14.58 6.55-14.58 14.59 0 8.03 6.53 14.58 14.58 14.58 8.05 0 14.58-6.55 14.58-14.58 0-8.04-6.53-14.59-14.58-14.59Z" fill="#2FCD70" />
        <path d="M36.67 37.92c-.32 0-.64-.12-.89-.37l-3.33-3.33a.83.83 0 0 1 1.18-1.18l3.33 3.34a.83.83 0 0 1-.29 1.54Z" fill="#2FCD70" />
      </svg>
    ),
  },
  {
    title: "Upload Resume",
    background: "rgba(127, 115, 193, 0.1)",
    icon: (
      <svg width="32" height="36" viewBox="0 0 32 36" fill="none" aria-hidden="true">
        <path d="M31 9.3V26c0 5-2.5 8.3-8.3 8.3H9.3C3.5 34.3 1 31 1 26V9.3C1 4.3 3.5 1 9.3 1h13.4C28.5 1 31 4.3 31 9.3Z" stroke="#7F73C1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M20.2 5.2v3.3c0 1.8 1.5 3.3 3.3 3.3h3.3" stroke="#7F73C1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9.3 19.3h6.7M9.3 26h13.4" stroke="#7F73C1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Apply Now",
    background: "rgba(253, 88, 35, 0.1)",
    icon: <img src={briefcase} alt="" width="40" height="40" />,
  },
];

function HowWeWorks() {
  return (
    <section className="how-we-work" id="about">
      <div className="work-cards">
        {steps.map((step) => (
          <article key={step.title} className="work-card">
            <div className="work-icon" style={{ background: step.background }}>
              {step.icon}
            </div>
            <h3>{step.title}</h3>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              <br />
              Imperdiet tempus felis vitae.
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default HowWeWorks;
