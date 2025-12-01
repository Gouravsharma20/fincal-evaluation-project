

import React, { useState, useEffect, useCallback } from 'react'
import './DashBoardStyles.css'
import { useAuthContext } from '../../Hooks/useAuthContext'
import {API_BASE_URL} from '../../config/api'
import EnvelopeIcon from '../../Assets/DashBoardAssets/envolope.png'
import itemLister from '../../Assets/DashBoardAssets/itemLister.png'

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
        (t.userName || '').toLowerCase().includes(search.toLowerCase()) ||
        (t.userEmail || '').toLowerCase().includes(search.toLowerCase()) ||
        (t.userPhoneNumber || '').includes(search) ||
        (t._id || '').includes(search)
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
          <h2 className="dashboard-title">Dashboard</h2>
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

        {/* FILTER TABS - styled as links */}
        <div className="filter-tabs-section" role="tablist" aria-label="Ticket filters">
          <button
            type="button"
            className={`filter-link ${filter === 'all' ? 'active' : ''}`}
            onClick={() => handleFilterChange('all')}
            role="tab"
            aria-selected={filter === 'all'}
          >
            <img src={EnvelopeIcon} alt="" className="filter-icon-img" aria-hidden="true" />
            <span className="filter-text">All Tickets</span>
          </button>

          <button
            type="button"
            className={`filter-link ${filter === 'resolved' ? 'active' : ''}`}
            onClick={() => handleFilterChange('resolved')}
            role="tab"
            aria-selected={filter === 'resolved'}
          >
            <span className="filter-text">Resolved</span>
          </button>

          <button
            type="button"
            className={`filter-link ${filter === 'unresolved' ? 'active' : ''}`}
            onClick={() => handleFilterChange('unresolved')}
            role="tab"
            aria-selected={filter === 'unresolved'}
          >
            <span className="filter-text">Unresolved</span>
          </button>
        </div>

        {/* TICKETS LIST */}
        <div className="tickets-list-container">
          {loading && <p className="status-text">Loading tickets...</p>}
          {error && <p className="status-text error-text">Error: {error}</p>}
          {!loading && filteredTickets.length === 0 && <p className="status-text">No tickets found</p>}

          {!loading && filteredTickets.map((ticket, idx) => (
            <div key={ticket._id} className="ticket-row">
              <div className="ticket-left-content">
                {/* HEADER: dot + Ticket ID (left)  — posted time (right) */}
                <div className="ticket-header-row">
                  <div className="ticket-id-wrap">
                    <img src={itemLister} alt="" className="ticket-list-dot" />
                    <h3 className="ticket-id">Ticket# 2023-{String(idx + 1).padStart(5, '0')}</h3>
                  </div>

                  <span className="ticket-posted-time">
                    Posted at {new Date(ticket.createdAt || Date.now()).toLocaleTimeString('en-US', {
                      hour: '2-digit', minute: '2-digit', hour12: true
                    })}
                  </span>
                </div>

                {/* MESSAGE (redesigned box look) */}
                <div className="ticket-message-box">
                  <p className="ticket-message">
                    {ticket.messages[ticket.messages.length - 1]?.text}
                  </p>

                  <div className="ticket-meta-right">
                    {/* If you later want to show an inline time/count, you can use this */}
                  </div>
                </div>

                {/* SEPARATOR */}
                <div className="ticket-separator" />

                {/* USER INFO (avatar + details) */}
                <div className="ticket-user-section">
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(ticket.userName || '')}&background=random&color=fff&size=40`}
                    alt={ticket.userName || 'user'}
                    className="ticket-avatar"
                  />

                  <div className="ticket-user-details">
                    <p className="user-name">{ticket.userName || '-'}</p>
                    <p className="user-phone">{ticket.userPhoneNumber ? `+${ticket.userPhoneNumber}` : '-'}</p>
                    <p className="user-email">{ticket.userEmail || '-'}</p>
                  </div>
                </div>
              </div>

              {/* << ADDED: actions column (minimal insertion) */}
              <div className="ticket-actions">
                {ticket.status === 'resolved' ? (
                  <div className="ticket-status resolved">Resolved</div>
                ) : (
                  <button
                    type="button"
                    className="ticket-status open"
                    // onClick={() => openTicket(ticket)}  // << OPTIONAL: enable if you have handler
                  >
                    Open Ticket <span className="arrow">→</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
