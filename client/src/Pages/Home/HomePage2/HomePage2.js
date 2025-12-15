import React from 'react'
import './HomePage2Styles.css'


import Advertisement from "../../../Assets/HomeAssets/HomePage2/Advertisement.png";
import AdvertisementLowerFrame from "../../../Assets/HomeAssets/HomePage2/AdvertisementLowerFrame.png";

const HomePage2 = () => {
  return (
    <section className="hp2-section">
      <div className="hp2-top">
        <h2 className="hp2-title">At its core, Hubly is a robust CRM solution.</h2>
        <p className="hp2-sub">
          Hubly helps businesses streamline customer interactions, track leads, and automate tasks —
          saving you time and maximizing revenue. Whether you’re a startup or an enterprise, Hubly
          adapts to your needs, giving you the tools to scale efficiently.
        </p>
      </div>

      <div className="hp2-card">
        <div className="hp2-left">
          <h3 className="hp2-left-heading">MULTIPLE PLATFORMS TOGETHER!</h3>
          <p className="hp2-left-lead">
            Email communication is a breeze with our fully integrated, drag &amp; drop email builder.
          </p>

          <div className="hp2-feature">
            <h4 className="feature-title">CLOSE</h4>
            <p className="feature-desc">Capture leads using our landing pages, surveys, forms, calendars, inbound phone system &amp; more!</p>
          </div>

          <div className="hp2-feature">
            <h4 className="feature-title">NURTURE</h4>
            <p className="feature-desc">Capture leads using our landing pages, surveys, forms, calendars, inbound phone system &amp; more!</p>
          </div>
        </div>

        <div className="hp2-right">
          <div className="hp2-right-inner">
            
            <img src={Advertisement} alt="Advertisement icons" className="hp2-ad" />

            
            <div className="hp2-funnel-frame">
              <img src={AdvertisementLowerFrame} alt="Frame" className="hp2-funnel-img" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HomePage2
