import React from 'react'
import { useAuthContext } from '../../Hooks/useAuthContext'  // ← Get auth state
import { Link } from 'react-router-dom'                       
import MessageForm from '../../Components/MessageForm/MessageForm'
import './HomeStyles.css'


const Home = () => {
  const { user } = useAuthContext()
  return (
    <section className='hero-section'>
      {!user ? (
        <MessageForm/>
      ): user.role === "admin" ? (
        <div className='dashboard-redirect'>
          <Link to="/dashboard" className='btn-primary'>
            Go to Admin Dashboard
          </Link>
        </div>
      ): user.role === "user" ? (
        <div className='dashboard-redirect'>
          <Link to="/dashboard" className='btn-primary'>Go to Team Dashboard</Link>
        </div>
      ):null}
    </section>
  )
}

export default Home