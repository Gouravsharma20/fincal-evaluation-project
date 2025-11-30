import React, { useState, useEffect, useCallback } from 'react'
import './DashBoardStyles.css'
import { useAuthContext } from '../../Hooks/useAuthContext'

const Dashboard = () => {
  const [tickets, setTickets] = useState([])
  const [filteredTickets, setFilteredTickets] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState('all')

  const { token } = useAuthContext()

  const fetchTickets = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const response = await fetch('http://localhost:4000/api/admin/tickets', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      if (!response.ok) throw new Error('Failed to fetch tickets')
      const data = await response.json()
      setTickets(data.tickets || [])
      setError('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [token])

  const applyFilters = (ticketsToFilter, filterType, search) => {
    let filtered = ticketsToFilter
    if (filterType === 'resolved') {
      filtered = filtered.filter(t => t.status === 'resolved')
    } else if (filterType === 'unresolved') {
      filtered = filtered.filter(t => t.status !== 'resolved')
    }
    if (search.trim()) {
      filtered = filtered.filter(t =>
        t.userName.toLowerCase().includes(search.toLowerCase()) ||
        t.userEmail.toLowerCase().includes(search.toLowerCase()) ||
        t.userPhoneNumber.includes(search) ||
        t._id.includes(search)
      )
    }
    setFilteredTickets(filtered)
  }

  useEffect(() => {
    fetchTickets()
  }, [fetchTickets])

  useEffect(() => {
    applyFilters(tickets, filter, searchQuery)
  }, [tickets, filter, searchQuery])

  const handleSearch = (e) => {
    setSearchQuery(e.target.value)
  }

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter)
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-main-content">
        {/* SEARCH HEADER */}
        <div className="admin-search-header">
          <div className="search-wrapper">
            <input
              type="text"
              placeholder="Search for ticket"
              value={searchQuery}
              onChange={handleSearch}
              className="search-input-main"
            />
          </div>
        </div>

        {/* FILTER TABS */}
        <div className="filter-tabs-section">
          <button 
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`} 
            onClick={() => handleFilterChange('all')}
          >
            All Tickets
          </button>
          <button 
            className={`filter-tab ${filter === 'resolved' ? 'active' : ''}`} 
            onClick={() => handleFilterChange('resolved')}
          >
            Resolved
          </button>
          <button 
            className={`filter-tab ${filter === 'unresolved' ? 'active' : ''}`} 
            onClick={() => handleFilterChange('unresolved')}
          >
            Unresolved
          </button>
        </div>

        {/* TICKETS LIST - COLUMN LAYOUT */}
        <div className="tickets-cards-container">
          {loading && <p className="status-text">Loading tickets...</p>}
          {error && <p className="status-text error-text">Error: {error}</p>}
          {!loading && filteredTickets.length === 0 && <p className="status-text">No tickets found</p>}

          {!loading && filteredTickets.map((ticket, idx) => (
            <div key={ticket._id} className="ticket-card-box">
              {/* TICKET ID & TIME */}
              <div className="card-top-section">
                <h3 className="card-ticket-id">Ticket# 2023-{String(idx + 1).padStart(5, '0')}</h3>
                <span className="card-posted-time">
                  Posted at {new Date(ticket.createdAt).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                  })}
                </span>
              </div>

              {/* MESSAGE */}
              <div className="card-message-section">
                <p className="card-initial-message">
                  {ticket.messages[0]?.text || 'No message'}
                </p>
              </div>

              {/* USER INFO */}
              <div className="card-user-info">
                <img
                  src={`https://ui-avatars.com/api/?name=${ticket.userName}&background=random&color=fff&size=48`}
                  alt={ticket.userName}
                  className="card-user-avatar"
                />
                <div className="card-user-details">
                  <p className="card-user-name">{ticket.userName}</p>
                  <p className="card-user-email">{ticket.userEmail}</p>
                  <p className="card-user-phone">+{ticket.userPhoneNumber}</p>
                </div>
              </div>

              {/* BUTTON - SEPARATE, FULL WIDTH */}
              <button className="open-ticket-btn-card" onClick={() => alert('Ticket: ' + ticket._id)}>
                View Ticket
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Dashboard