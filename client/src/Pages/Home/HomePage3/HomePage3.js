import React from "react";
import { Link } from "react-router-dom";
import "./HomePage3Styles.css";

import CheckIcon from "../../../Assets/HomeAssets/HomePage3/CheckIcon.png";

const featuresStarter = [
  "Unlimited Users",
  "GMB Messaging",
  "Reputation Management",
  "GMB Call Tracking",
  "24/7 Award Winning Support",
];

const featuresGrow = [
  "Pipeline Management",
  "Marketing Automation Campaigns",
  "Live Call Transfer",
  "GMB Messaging",
  "Embed-able Form Builder",
  "Reputation Management",
  "24/7 Award Winning Support",
];

const PlanCard = ({ title, desc, price, features }) => (
  <div className="hp3-plan-card">
    <h3 className="hp3-plan-title">{title}</h3>
    <p className="hp3-plan-desc">{desc}</p>

    <div className="hp3-price-row">
      <span className="hp3-price">${price}</span>
      <span className="hp3-month">/monthly</span>
    </div>

    <h4 className="hp3-whats">What's included</h4>

    <ul className="hp3-features">
      {features.map((f, i) => (
        <li key={i} className="hp3-feature-item">
          <img src={CheckIcon} alt="check" className="hp3-check" />
          <span>{f}</span>
        </li>
      ))}
    </ul>

    <Link to="/signup" className="hp3-cta">
      <button className="hp3-cta-btn">SIGN UP FOR STARTER</button>
    </Link>
  </div>
);

const HomePage3 = () => {
  return (
    <section className="hp3-section">
      <div className="hp3-inner">
        <header className="hp3-header">
          <h2 className="hp3-heading">We have plans for everyone!</h2>
          <p className="hp3-sub">
            We started with a strong foundation, then simply built all of the sales and
            marketing tools ALL businesses need under one platform.
          </p>
        </header>

        <div className="hp3-cards">
          <PlanCard
            title="STARTER"
            desc="Best for local businesses needing to improve their online reputation."
            price="199"
            features={featuresStarter}
          />
          <PlanCard
            title="GROW"
            desc="Best for all businesses that want to take full control of their marketing automation and track their leads, click to close."
            price="399"
            features={featuresGrow}
          />
        </div>
      </div>
    </section>
  );
};

export default HomePage3;

