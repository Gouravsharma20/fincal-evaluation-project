
import React from 'react'
import { useAuthContext } from '../../Hooks/useAuthContext'
import { Link, useNavigate } from 'react-router-dom'
import MessageForm from '../../Components/MessageForm/MessageForm'
import './HomeStyles.css'

import HeroPhoto from '../../Assets/HomeAssets/HomeTalking.png'
import MessageCard from '../../Assets/HomeAssets/HomeMessage.png'
import GraphCard from '../../Assets/HomeAssets/HomeGraph.png'
import CalendarCard from '../../Assets/HomeAssets/HomeCalendar.png'
import PlayIcon from '../../Assets/HomeAssets/HomePlay.png'

import AdobeLogo from '../../Assets/HomeAssets/CompanyLogo/AdobeLogo.png'
import AirtableLogo from '../../Assets/HomeAssets/CompanyLogo/AirTable.png'
import ElasticLogo from '../../Assets/HomeAssets/CompanyLogo/Elastic.png'
import OpendoorLogo from '../../Assets/HomeAssets/CompanyLogo/OpenDoor.png'

const CompanyLogos = () => {
  const logos = [
    { src: AdobeLogo, alt: 'Adobe' },
    { src: ElasticLogo, alt: 'Elastic' },   // 2nd: Elastic
    { src: OpendoorLogo, alt: 'Opendoor' },
    { src: AirtableLogo, alt: 'Airtable' },
    { src: ElasticLogo, alt: 'Elastic' }    // 5th: Elastic (repeated)
  ]

  return (
    <div className="companies-bar">
      <div className="companies-inner">
        {logos.map((l, i) => (
          <div key={i} className="company-item">
            <img src={l.src} alt={l.alt} />
          </div>
        ))}
      </div>
    </div>
  )
}

const Home = () => {
  const { user } = useAuthContext()
  const navigate = useNavigate()



  const handleGetStarted = () => navigate('/signup')
  const handleWatchVideo = () => window.open('https://www.youtube.com', '_blank')

  return (
    <>
      <section className="hero-section">
        {!user ? (
          <MessageForm />
        ) : user.role === 'admin' ? (
          <div className="dashboard-redirect">
            <Link to="/dashboard" className="btn-primary">Go to Admin Dashboard</Link>
          </div>
        ) : user.role === 'user' ? (
          <div className="dashboard-redirect">
            <Link to="/dashboard" className="btn-primary">Go to Team Dashboard</Link>
          </div>
        ) : null}

        <div className="hero-container">
          <div className="hero-left">
            <h1 className="hero-title">
              Grow Your Business Faster
              <br />
              with Hubly CRM
            </h1>

            <p className="hero-sub">
              Manage leads, automate workflows, and close deals effortlessly—all in one powerful platform.
            </p>

            <div className="hero-cta">
              <button className="btn-getstarted" onClick={handleGetStarted}>
                Get started <span className="arrow">→</span>
              </button>

              <button className="btn-watch" onClick={handleWatchVideo} aria-label="Watch video">
                <img src={PlayIcon} alt="play" className="play-icon" />
                Watch Video
              </button>
            </div>
          </div>

          <div className="hero-right">
            <div className="hero-photo">
              <img src={HeroPhoto} alt="People talking" className="hero-main-img" />

              {/* Overlays: message bubble (top-right), graph (mid-right), calendar (bottom-left) */}
              <img src={MessageCard} alt="Message" className="overlay message-card" />
              <img src={GraphCard} alt="Graph" className="overlay graph-card" />
              <img src={CalendarCard} alt="Calendar" className="overlay calendar-card" />
            </div>
          </div>
        </div>
      </section>
      <CompanyLogos />
    </>
  )
}

export default Home
