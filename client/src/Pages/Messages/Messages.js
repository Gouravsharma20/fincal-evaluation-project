import React, { useState, useEffect, useCallback } from 'react'
import './MessagesStyles.css'
import { useAuthContext } from '../../Hooks/useAuthContext'
// import Sidebar from '../../Components/Layout/Sidebar/Sidebar'

const Messages = () => {
  const [tickets, setTickets] = useState([])
  const [filteredTickets, setFilteredTickets] = useState([])
  const [openTicket, setOpenTicket] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [newMessage, setNewMessage] = useState('')
  const [selectedTeamMember, setSelectedTeamMember] = useState(null)
  const [showTeamDropdown, setShowTeamDropdown] = useState(false)
  const [ticketStatus, setTicketStatus] = useState('unresolved')
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)
  // eslint-disable-next-line no-unused-vars
  const [sending, setSending] = useState(false)

  const [teamMembers] = useState([
    { id: 1, name: 'John Doe' },
    { id: 2, name: 'Jane Smith' },
    { id: 3, name: 'Mike Johnson' },
    { id: 4, name: 'Sarah Williams' },
  ])

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
      applyFilters(data.tickets || [], filter, searchQuery)
      
      // Auto-open first ticket if not already open
      if (!openTicket && data.tickets && data.tickets.length > 0) {
        setOpenTicket(data.tickets[0])
        setTicketStatus(data.tickets[0].status || 'unresolved')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [token, filter, searchQuery, openTicket])

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
  }, [filter, searchQuery, tickets])

  const handleSearch = (e) => {
    setSearchQuery(e.target.value)
  }

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter)
  }

  const handleOpenTicket = (ticket) => {
    setOpenTicket(ticket)
    setSelectedTeamMember(null)
    setTicketStatus(ticket.status || 'unresolved')
  }

  
  const handleSendMessage = async () => {
    if (!newMessage.trim()) {
      setError('Message cannot be empty')
      setTimeout(() => setError(''), 3000)
      return
    }

    if (!openTicket) {
      setError('No ticket selected')
      return
    }

    setSending(true)
    setError('')

    try {
      // CHANGE: Endpoint URL - use /messages (plural) instead of /message
      const response = await fetch(
        `http://localhost:4000/api/admin/tickets/${openTicket._id}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          // CHANGE: Request body structure - use { text, internal } instead of { message, senderType }
          body: JSON.stringify({
            text: newMessage,          // CHANGE: Field name is "text" not "message"
            internal: false            // CHANGE: Add "internal" field set to false (send to customer)
          })
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to send message')
      }

      const data = await response.json()
      console.log('Message sent successfully:', data)
      
      // CHANGE: API returns only { success, message, ticketId }, not the full updated ticket
      // So we need to fetch the updated ticket separately to get the new messages
      const updatedResponse = await fetch(
        `http://localhost:4000/api/admin/tickets/${openTicket._id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (updatedResponse.ok) {
        const updatedData = await updatedResponse.json()
        const updatedTicket = updatedData.ticket || updatedData
        
        setOpenTicket(updatedTicket)
        setTickets(tickets.map(t => t._id === updatedTicket._id ? updatedTicket : t))
        // CHANGE: Also update filteredTickets to keep chat list in sync
        setFilteredTickets(filteredTickets.map(t => t._id === updatedTicket._id ? updatedTicket : t))
      }
      
      setNewMessage('')
      setError('')
      
    } catch (err) {
      console.error('Error sending message:', err)
      setError(err.message || 'Failed to send message. Please try again.')
    } finally {
      setSending(false)
    }
  }

  const handleAssignTeamMember = async (member) => {
    if (!openTicket) return

    try {
      const response = await fetch(
        `http://localhost:4000/api/admin/tickets/${openTicket._id}/assign`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            teamMemberId: member.id,
            teamMemberName: member.name
          })
        }
      )

      if (!response.ok) throw new Error('Failed to assign ticket')

      const data = await response.json()
      setOpenTicket(data.ticket)
      setSelectedTeamMember(member)
      setTickets(tickets.map(t => t._id === data.ticket._id ? data.ticket : t))
      setShowTeamDropdown(false)
    } catch (err) {
      console.log('Assignment action triggered for:', member.name)
      setSelectedTeamMember(member)
      setShowTeamDropdown(false)
    }
  }

  const handleStatusChange = async (status) => {
    if (!openTicket) return

    try {
      const response = await fetch(
        `http://localhost:4000/api/admin/tickets/${openTicket._id}/status`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status })
        }
      )

      if (!response.ok) throw new Error('Failed to update status')

      const data = await response.json()
      setOpenTicket(data.ticket)
      setTicketStatus(status)
      setTickets(tickets.map(t => t._id === data.ticket._id ? data.ticket : t))
      setShowStatusDropdown(false)
    } catch (err) {
      console.log('Status changed to:', status)
      setTicketStatus(status)
      setShowStatusDropdown(false)
    }
  }

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      {/* <Sidebar userRole="admin" /> */}

      {/* Main Content */}
      <div className="admin-main-content">
        {/* Search View (Initial State) */}
        {!openTicket && (
          <>
            {/* Search Bar */}
            <div className="admin-search-header">
              <div className="search-wrapper">
                <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
                <input
                  type="text"
                  placeholder="Search for ticket"
                  value={searchQuery}
                  onChange={handleSearch}
                  className="search-input-main"
                />
              </div>
            </div>

            {/* Filter Tabs */}
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

            {/* Tickets Cards */}
            <div className="tickets-cards-container">
              {loading && <p className="status-text">Loading tickets...</p>}
              {error && <p className="status-text error-text">Error: {error}</p>}

              {!loading && filteredTickets.length === 0 && (
                <p className="status-text">No tickets found</p>
              )}

              {!loading && filteredTickets.map((ticket, idx) => (
                <div key={ticket._id} className="ticket-card-box">
                  {/* Top Section - ID and Time */}
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

                  {/* Middle Section - Initial Message */}
                  <div className="card-message-section">
                    <p className="card-initial-message">
                      {ticket.messages[0]?.text || 'No message'}
                    </p>
                  </div>

                  {/* Bottom Section - User Info and Button */}
                  <div className="card-bottom-section">
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
                    <button
                      className="open-ticket-btn-card"
                      onClick={() => handleOpenTicket(ticket)}
                    >
                      Open Ticket
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* 3-Panel View (When Ticket Opened) */}
        {openTicket && (
          <div className="three-panel-container">
            {/* LEFT PANEL - CHAT */}
            <div className="panel-left-chats">
              <div className="chats-header">
                <h3>Chats</h3>
              </div>

              <div className="chats-list">
                {filteredTickets.map((ticket, idx) => (
                  <div
                    key={ticket._id}
                    className={`chat-list-item ${openTicket._id === ticket._id ? 'active' : ''}`}
                    onClick={() => handleOpenTicket(ticket)}
                  >
                    <img
                      src={`https://ui-avatars.com/api/?name=${ticket.userName}&background=random&color=fff&size=40`}
                      alt={ticket.userName}
                      className="chat-avatar"
                    />
                    <div className="chat-list-info">
                      <h4 className="chat-name">Chat {idx + 1}</h4>
                      <p className="chat-preview">
                        {ticket.messages[0]?.text || 'No message'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CENTER PANEL - CHAT */}
            <div className="panel-chat">
              <div className="panel-header">
                <p>Ticket#2025-{openTicket._id.slice(0, 5)}</p>
              </div>

              <div className="messages-list">
                {openTicket.messages && openTicket.messages.map((msg, idx) => (
                  <div key={idx} className={`msg-item msg-${msg.senderType}`}>
                    <div className="msg-info">

                      <span className="msg-sender">
                        {openTicket.userName}
                      </span>
                      <span className="msg-timestamp">
                        {new Date(msg.createdAt).toLocaleDateString("en-US", {
                          day: "numeric",
                          month: "long",
                          year: "numeric"
                        })}
                      </span>
                    </div>
                    <p className="msg-content">{msg.text}</p>
                  </div>
                ))}
              </div>

              <div className="message-reply-box">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type here..."
                  className="reply-textarea"
                  rows="4"
                />
                <button
                  className="reply-send-btn"
                  onClick={handleSendMessage}
                >
                  Send Reply
                </button>
              </div>
            </div>

            {/* RIGHT PANEL - PROFILE & ASSIGNMENT */}
            <div className="panel-profile">
              {/* Customer Profile */}
              <div className="customer-profile-section">
                <div className="profile-avatar-container">
                  <img
                    src={`https://ui-avatars.com/api/?name=${openTicket.userName}&size=120&background=random&color=fff`}
                    alt={openTicket.userName}
                    className="profile-avatar-large"
                  />
                </div>

                <div className="profile-details-section">
                  <h3>{openTicket.userName}</h3>
                  <div className="profile-info-item">
                    <label>Email</label>
                    <p>{openTicket.userEmail}</p>
                  </div>
                  <div className="profile-info-item">
                    <label>Phone</label>
                    <p>+{openTicket.userPhoneNumber}</p>
                  </div>
                </div>
              </div>

              {/* Team Members Assignment */}
              <div className="team-assignment-section">
                <h3 className="section-heading">Assign Team Member</h3>

                <div className="team-dropdown-wrapper">
                  <button
                    className="team-dropdown-btn"
                    onClick={() => setShowTeamDropdown(!showTeamDropdown)}
                  >
                    <span className="dropdown-text">
                      {selectedTeamMember ? selectedTeamMember.name : 'Select Team Member'}
                    </span>
                    <span className={`dropdown-icon ${showTeamDropdown ? 'open' : ''}`}>▼</span>
                  </button>

                  {showTeamDropdown && (
                    <div className="team-dropdown-menu">
                      {teamMembers.map(member => (
                        <button
                          key={member.id}
                          className={`team-option ${selectedTeamMember?.id === member.id ? 'selected' : ''}`}
                          onClick={() => handleAssignTeamMember(member)}
                        >
                          <span className="team-option-name">{member.name}</span>
                          <span className="assign-icon">→</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Ticket Status Dropdown */}
              <div className="status-dropdown-section">
                <h3 className="section-heading">Ticket Status</h3>

                <div className="status-dropdown-wrapper">
                  <button
                    className="status-dropdown-btn"
                    onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                  >
                    <span className={`status-badge status-${ticketStatus}`}>
                      {ticketStatus.charAt(0).toUpperCase() + ticketStatus.slice(1)}
                    </span>
                    <span className={`dropdown-icon ${showStatusDropdown ? 'open' : ''}`}>▼</span>
                  </button>

                  {showStatusDropdown && (
                    <div className="status-dropdown-menu">
                      <button
                        className={`status-option ${ticketStatus === 'unresolved' ? 'active' : ''}`}
                        onClick={() => handleStatusChange('unresolved')}
                      >
                        Unresolved
                      </button>
                      <button
                        className={`status-option ${ticketStatus === 'resolved' ? 'active' : ''}`}
                        onClick={() => handleStatusChange('resolved')}
                      >
                        Resolved
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Messages