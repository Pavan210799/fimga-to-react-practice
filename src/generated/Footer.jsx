import "./Footer.css";
import logo from "../assets/icons/random-symboles-10.svg";

const columns = [
  {
    title: "Pages",
    links: ["Home", "Features", "Gallery", "Testimonial", "Book a meeting"],
  },
  {
    title: "Useful Links",
    links: ["Mobile App", "Our Projects", "Personal Website", "Support Team", "Events"],
  },
  {
    title: "Utility",
    links: ["FAQ", "Terms & Conditions"],
  },
];

function Footer() {
  return (
    <footer className="footer" id="contact">
      <div className="footer-inner">
        <div className="footer-left">
          <img src={logo} alt="Job Finder" width="38" height="50" />
          <p className="footer-tagline">Get your dream job with us</p>
          <div className="social-links">
            <a href="https://www.facebook.com/" className="social-icon" aria-label="Facebook">
              <svg width="12" height="22" viewBox="0 0 12 22" fill="none">
                <path
                  d="M11.2 12.4 11.8 8.6H8.2V6.1c0-1 .5-2 2.1-2h1.6V.8S10.4.5 8.9.5C5.7.5 3.6 2.5 3.6 5.7v2.9H0v3.8h3.6V22h4.6V12.4h3Z"
                  fill="#fff"
                />
              </svg>
            </a>
            <a href="https://twitter.com/" className="social-icon" aria-label="Twitter">
              <svg width="20" height="16" viewBox="0 0 20 16" fill="none">
                <path
                  d="M20 1.9a8.4 8.4 0 0 1-2.36.65A4.1 4.1 0 0 0 19.45.3a8.2 8.2 0 0 1-2.6 1A4.1 4.1 0 0 0 9.85 4.1a4.3 4.3 0 0 0 .1.94A11.65 11.65 0 0 1 1.4.75a4.1 4.1 0 0 0 1.27 5.48A4.05 4.05 0 0 1 .8 5.7v.05a4.1 4.1 0 0 0 3.29 4.02 4.1 4.1 0 0 1-1.08.14c-.26 0-.52-.02-.77-.07a4.1 4.1 0 0 0 3.83 2.85A8.24 8.24 0 0 1 0 14.18 11.62 11.62 0 0 0 6.29 16c7.55 0 11.68-6.25 11.68-11.68v-.53A8.2 8.2 0 0 0 20 1.9Z"
                  fill="#fff"
                />
              </svg>
            </a>
            <a href="https://www.linkedin.com/" className="social-icon" aria-label="LinkedIn">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path
                  d="M4.05 18H.3V6h3.75v12ZM2.16 4.36A2.18 2.18 0 1 1 2.17 0a2.18 2.18 0 0 1 0 4.36ZM18 18h-3.74v-5.84c0-1.4-.03-3.18-1.94-3.18-1.94 0-2.24 1.51-2.24 3.08V18H6.34V6h3.59v1.64h.05c.5-.95 1.72-1.95 3.54-1.95 3.79 0 4.48 2.5 4.48 5.74V18Z"
                  fill="#fff"
                />
              </svg>
            </a>
          </div>
        </div>

        {columns.map((column) => (
          <div key={column.title} className="footer-col">
            <h4>{column.title}</h4>
            <ul>
              {column.links.map((label) => (
                <li key={label}>
                  <a href="#home">{label}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </footer>
  );
}

export default Footer;
