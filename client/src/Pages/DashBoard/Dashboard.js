import React, { useState, useEffect, useCallback } from 'react'
import './DashBoardStyles.css'
import { useAuthContext } from '../../Hooks/useAuthContext'
import {API_BASE_URL} from '../../config/api'

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
      const response = await fetch(`${API_BASE_URL}/api/admin/tickets`, {
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

        {/* TICKETS LIST */}
        <div className="tickets-list-container">
          {loading && <p className="status-text">Loading tickets...</p>}
          {error && <p className="status-text error-text">Error: {error}</p>}
          {!loading && filteredTickets.length === 0 && <p className="status-text">No tickets found</p>}

          {!loading && filteredTickets.map((ticket, idx) => (
            <div key={ticket._id} className="ticket-row">
              {/* LEFT SECTION - TICKET INFO */}
              <div className="ticket-left-content">
                {/* TOP: Ticket ID and Posted Time */}
                <div className="ticket-header-row">
                  <h3 className="ticket-id">Ticket# 2023-{String(idx + 1).padStart(5, '0')}</h3>
                  <span className="ticket-posted-time">Posted at {new Date(ticket.createdAt).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                  })}</span>
                </div>

                {/* MIDDLE: Message */}
                <p className="ticket-message">
                  {ticket.messages[0]?.text || 'No message'}
                </p>

                {/* BOTTOM: User Info */}
                <div className="ticket-user-section">
                  <img
                    src={`https://ui-avatars.com/api/?name=${ticket.userName}&background=random&color=fff&size=40`}
                    alt={ticket.userName}
                    className="ticket-avatar"
                  />
                  <div className="ticket-user-details">
                    <p className="user-name">{ticket.userName}</p>
                    <p className="user-phone">+{ticket.userPhoneNumber}</p>
                    <p className="user-email">{ticket.userEmail}</p>
                  </div>
                </div>
              </div>

              {/* RIGHT SECTION - ACTION */}
              <div className="ticket-right-action">
                <a href={`/tickets/${ticket._id}`} className="open-ticket-link">
                  Open Ticket
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Dashboard