import { useEffect, useRef, useState } from "react";
import "./HowToApply.css";

const SUBSCRIBED_RESET_MS = 1500;

function HowToApply() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const resetTimer = useRef(null);

  useEffect(() => {
    return () => {
      if (resetTimer.current) {
        window.clearTimeout(resetTimer.current);
      }
    };
  }, []);

  function handleSubmit(event) {
    event.preventDefault();
    if (!email.trim()) return;

    setSubscribed(true);
    setEmail("");

    if (resetTimer.current) {
      window.clearTimeout(resetTimer.current);
    }

    resetTimer.current = window.setTimeout(() => {
      setSubscribed(false);
    }, SUBSCRIBED_RESET_MS);
  }

  return (
    <section className="how-to-apply" id="apply">
      <div className="section-header">
        <h2>
          To learn more about the application
          <br />
          or <span className="text-green">how to apply</span> in the job
        </h2>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nec suspendisse
          fermentum nunc enim dignissim duis dapibus. Ornare eget elementum vel at.
          Fusce nibh et at aliquet nullam viverra.
        </p>
      </div>

      <form className="subscribe-bar" onSubmit={handleSubmit}>
        <input
          type="email"
          required
          placeholder="Enter your email address"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={subscribed}
        />
        <button
          type="submit"
          className={`btn btn-primary${subscribed ? " is-subscribed" : ""}`}
          disabled={subscribed}
        >
          {subscribed ? "Subscribed" : "Subscribe"}
        </button>
      </form>

      <div className="apply-dots" aria-hidden="true">
        {Array.from({ length: 40 }, (_, index) => (
          <span key={index} />
        ))}
      </div>
    </section>
  );
}

export default HowToApply;
