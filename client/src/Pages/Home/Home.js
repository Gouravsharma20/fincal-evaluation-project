import {useEffect,useState} from 'react'
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
import Framer from '../../Assets/HomeAssets/CompanyLogo/Framer.png'
import AirtableLogo from '../../Assets/HomeAssets/CompanyLogo/AirTable.png'
import ElasticLogo from '../../Assets/HomeAssets/CompanyLogo/Elastic.png'
import OpendoorLogo from '../../Assets/HomeAssets/CompanyLogo/OpenDoor.png'
import HomePage2 from './HomePage2/HomePage2'
import HomePage3 from './HomePage3/HomePage3'
import LastPage from './LastPage/LastPage'


const CompanyLogos = () => {
  const logos = [
    { src: AdobeLogo, alt: 'Adobe' },
    { src: ElasticLogo, alt: 'Elastic' },
    { src: OpendoorLogo, alt: 'Opendoor' },
    { src: AirtableLogo, alt: 'Airtable' },
    { src: ElasticLogo, alt: 'ElasticLogo' },
    { src: Framer, alt: 'Framer' }
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
  const [isMobile, setIsMobile] = useState( window.innerWidth < 768 )

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  if (isMobile) {
    return (
      <section className="mobile-only-form">
        <MessageForm />
      </section>
    )
  }

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

              <img src={MessageCard} alt="Message" className="overlay message-card" />
              <img src={GraphCard} alt="Graph" className="overlay graph-card" />
              <img src={CalendarCard} alt="Calendar" className="overlay calendar-card" />
            </div>
          </div>
        </div>
        <CompanyLogos />
      </section>

      
      <HomePage2 />
      <HomePage3 />
      <LastPage />
    </>
  )
}

export default Home





