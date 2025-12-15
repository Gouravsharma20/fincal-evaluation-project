import React from 'react';
import './LastPageStyles.css'

import Discord from "../../../Assets/HomeAssets/LastPage/SocialIcons/Discord.png";
import Email from "../../../Assets/HomeAssets/LastPage/SocialIcons/Email.png";
import Instagram from "../../../Assets/HomeAssets/LastPage/SocialIcons/Instagram.png";
import Linkdin from "../../../Assets/HomeAssets/LastPage/SocialIcons/Linkdin.png";
import Render from "../../../Assets/HomeAssets/LastPage/SocialIcons/Render.png";
import Twitter from "../../../Assets/HomeAssets/LastPage/SocialIcons/Twitter.png";
import Youtube from "../../../Assets/HomeAssets/LastPage/SocialIcons/Youtube.png";
import appLogo from "../../../Assets/CommonAssets/appLogo.png"

const LastPage = () => {
  const columns = [
    {
      title: 'Product',
      items: [
        'Universal checkout',
        'Payment workflows',
        'Observability',
        'UpliftAI',
        'Apps & integrations'
      ]
    },
    {
      title: 'Why Primer',
      items: [
        'Expand to new markets',
        'Boost payment success',
        'Improve conversion rates',
        'Reduce payments fraud',
        'Recover revenue'
      ]
    },
    {
      title: 'Developers',
      items: [
        'Primer Docs',
        'API Reference',
        'Payment methods guide',
        'Service status',
        'Community'
      ]
    },
    {
      title: 'Resources',
      items: [
        'Blog',
        'Success stories',
        'News room',
        'Terms',
        'Privacy'
      ]
    },
    {
      title: 'Company',
      items: [
        'Careers'
      ]
    }
  ]

  const socialIcons = [
    { src: Email, alt: 'email' },
    { src: Linkdin, alt: 'linkedin' },
    { src: Twitter, alt: 'twitter' },
    { src: Youtube, alt: 'youtube' },
    { src: Discord, alt: 'discord' },
    { src: Render, alt: 'render' },
    { src: Instagram, alt: 'instagram' },
  ]

  return (
    <footer className="lp-footer">
      <div className="lp-inner">
        <div className="lp-left">
          <img src={appLogo} alt="app logo" className="lp-logo" />
        </div>

        <div className="lp-columns">
          {columns.map((col, idx) => (
            <div className="lp-column" key={idx}>
              <h4 className="lp-col-title">{col.title}</h4>
              <ul className="lp-col-list">
                {col.items.map((it, i) => (
                  <li key={i} className="lp-col-item" tabIndex={0} aria-label={it}>{it}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="lp-social">
          <div className="lp-social-row">
            {socialIcons.map((s, i) => (
              <button
                key={i}
                className="lp-social-btn"
                type="button"
                aria-label={s.alt}
                onClick={() => { }}
              >
                <img src={s.src} alt={s.alt} className="lp-social-img" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

export default LastPage