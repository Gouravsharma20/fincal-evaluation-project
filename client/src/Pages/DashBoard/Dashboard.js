


import React, { useState, useEffect, useCallback } from 'react'
import './DashBoardStyles.css'
import { useAuthContext } from '../../Hooks/useAuthContext'

const Dashboard = () => {
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
  const [sending, setSending] = useState(false)
  const [teamMembers, setTeamMembers] = useState([])
  const [loadingTeamMembers, setLoadingTeamMembers] = useState(false)
  
  // Confirmation Modal State
  const [showAssignmentModal, setShowAssignmentModal] = useState(false)
  const [pendingAssignment, setPendingAssignment] = useState(null)
  const [assignmentLoading, setAssignmentLoading] = useState(false)

  const { token } = useAuthContext()

  const fetchTeamMembers = useCallback(async () => {
    if (!token) return

    setLoadingTeamMembers(true)
    try {
      const response = await fetch('http://localhost:4000/api/admin/team-members', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) throw new Error('Failed to fetch team members')
      const data = await response.json()
      // Filter out admins - only show members
      const membersOnly = (data.users || []).filter(user => user.designation !== 'Admin')
      setTeamMembers(membersOnly)
    } catch (err) {
      console.error('Error fetching team members:', err)
      setTeamMembers([])
    } finally {
      setLoadingTeamMembers(false)
    }
  }, [token])

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
    fetchTeamMembers()
  }, [fetchTickets, fetchTeamMembers])

  useEffect(() => {
    applyFilters(tickets, filter, searchQuery)
  }, [tickets, filter, searchQuery])

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

    // Check if ticket is assigned - prevent message sending if it is
    if (openTicket.assignedTo) {
      setError('This ticket has been assigned. You can no longer send messages.')
      setTimeout(() => setError(''), 3000)
      return
    }

    setSending(true)
    setError('')

    try {
      const response = await fetch(
        `http://localhost:4000/api/admin/tickets/${openTicket._id}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            text: newMessage,
            internal: false
          })
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to send message')
      }

      const data = await response.json()
      console.log('Message sent successfully:', data)

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

  // Function to open confirmation modal
  const handleTeamMemberClick = (member) => {
    console.log('🟢 handleTeamMemberClick called')
    console.log('  Member:', member)
    console.log('  Member ID:', member._id)
    console.log('  Member Name:', member.name)
    
    setPendingAssignment(member)
    console.log('  pendingAssignment state set to:', member)
    
    setShowAssignmentModal(true)
    console.log('  showAssignmentModal set to true')
    console.log('  Modal should now be visible')
  }

  // Function to confirm and process assignment
  const handleConfirmAssignment = async () => {
    console.log('🔵 handleConfirmAssignment called')
    
    if (!openTicket || !pendingAssignment) {
      console.log('❌ Missing openTicket or pendingAssignment')
      return
    }

    console.log('📋 Assignment Details:')
    console.log('  Ticket ID:', openTicket._id)
    console.log('  Member ID:', pendingAssignment._id)
    console.log('  Member Name:', pendingAssignment.name)

    setAssignmentLoading(true)

    try {
      const url = `http://localhost:4000/api/admin/tickets/${openTicket._id}/assign`
      const body = {
        assignedToId: pendingAssignment._id,
        note: `Assigned by admin to ${pendingAssignment.name}`
      }

    
      const response = await fetch(url, {
        method: 'POST',  
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })

      console.log('📥 Response received:')
      console.log('  Status:', response.status)
      console.log('  OK:', response.ok)

      if (!response.ok) {
        const errorData = await response.json()
        console.log('❌ Error Response:', errorData)
        throw new Error(errorData.error || errorData.message || `Failed to assign ticket (${response.status})`)
      }

      const data = await response.json()
      console.log('✅ Success Response:', data)
      
      // Build updated ticket object with assignedTo info for frontend
      const updatedTicket = {
        ...openTicket,
        assignedToType: "team",
        assignedToId: pendingAssignment._id,
        assignedTo: {  // ✅ ADDED assignedTo OBJECT FOR FRONTEND UI
          _id: pendingAssignment._id,
          name: pendingAssignment.name,
          email: pendingAssignment.email
        },
        status: "assigned"
      }
      
      console.log('🔄 Updated ticket with assignedTo:', updatedTicket.assignedTo)
      
      // Update the open ticket
      setOpenTicket(updatedTicket)
      setSelectedTeamMember(pendingAssignment)
      
      // Update tickets lists
      setTickets(tickets.map(t => t._id === updatedTicket._id ? updatedTicket : t))
      setFilteredTickets(filteredTickets.map(t => t._id === updatedTicket._id ? updatedTicket : t))
      
      // Close modal and reset
      setShowAssignmentModal(false)
      setPendingAssignment(null)
      setShowTeamDropdown(false)

      setError('')
      console.log('✅ Ticket assigned successfully to:', pendingAssignment.name)

    } catch (err) {
      console.error('❌ Error in handleConfirmAssignment:', err)
      setError(err.message || 'Failed to assign ticket. Please try again.')
      setTimeout(() => setError(''), 4000)
    } finally {
      setAssignmentLoading(false)
      console.log('🏁 Assignment process completed')
    }
  }

  // Function to cancel assignment
  const handleCancelAssignment = () => {
    setShowAssignmentModal(false)
    setPendingAssignment(null)
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

  // Check if ticket is assigned
  const isTicketAssigned = openTicket?.assignedTo

  // =====================================================
  // CONFIRMATION MODAL COMPONENT (INLINE)
  // =====================================================
  const ConfirmationModal = ({ isOpen, memberName }) => {
    if (!isOpen) return null

    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-header">
            <h2>Confirm Assignment</h2>
            <button className="modal-close" onClick={handleCancelAssignment}>×</button>
          </div>

          <div className="modal-body">
            <p className="modal-message">
              Are you sure you want to assign this ticket to <strong>{memberName}</strong>?
            </p>
            {memberName && (
              <div className="modal-member-info">
                <span className="member-name">{memberName}</span>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button 
              className="modal-btn modal-btn-cancel" 
              onClick={handleCancelAssignment}
              disabled={assignmentLoading}
            >
              Cancel
            </button>
            <button 
              className="modal-btn modal-btn-confirm" 
              onClick={handleConfirmAssignment}
              disabled={assignmentLoading}
            >
              {assignmentLoading ? 'Processing...' : 'Confirm Assignment'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // =====================================================
  // MAIN RENDER
  // =====================================================
  return (
    <div className="admin-dashboard">
      {/* Confirmation Modal */}
      <ConfirmationModal 
        isOpen={showAssignmentModal} 
        memberName={pendingAssignment?.name}
      />

      <div className="admin-main-content">
        {!openTicket && (
          <>
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

            <div className="tickets-cards-container">
              {loading && <p className="status-text">Loading tickets...</p>}
              {error && <p className="status-text error-text">Error: {error}</p>}

              {!loading && filteredTickets.length === 0 && (
                <p className="status-text">No tickets found</p>
              )}

              {!loading && filteredTickets.map((ticket, idx) => (
                <div key={ticket._id} className="ticket-card-box">
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

                  <div className="card-message-section">
                    <p className="card-initial-message">
                      {ticket.messages[0]?.text || 'No message'}
                    </p>
                  </div>

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

        {openTicket && (
          <div className="three-panel-container">
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

            <div className="panel-chat">
              <div className="panel-header">
                <p>Ticket#2025-{openTicket._id.slice(0, 5)}</p>
                {isTicketAssigned && (
                  <div className="assignment-badge">
                    <span>✓ Assigned to {openTicket.assignedTo?.name || 'Team Member'}</span>
                  </div>
                )}
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

              {isTicketAssigned ? (
                <div className="message-reply-box disabled-box">
                  <div className="disabled-message">
                    <p>This ticket has been assigned to <strong>{openTicket.assignedTo?.name}</strong>. You are now viewing as a member.</p>
                  </div>
                </div>
              ) : (
                <div className="message-reply-box">
                  {openTicket?.isMissedChat && (
                    <p style={{ color: 'red', marginBottom: '10px', fontSize: '14px', fontWeight: '500' }}>
                      Replying to missed chat
                    </p>
                  )}
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
                    disabled={sending}
                  >
                    {sending ? 'Sending...' : 'Send Reply'}
                  </button>
                </div>
              )}
            </div>

            <div className="panel-profile">
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

              {!isTicketAssigned && (
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
                        {loadingTeamMembers ? (
                          <div className="team-option">
                            <span>Loading members...</span>
                          </div>
                        ) : teamMembers.length === 0 ? (
                          <div className="team-option">
                            <span>No team members available</span>
                          </div>
                        ) : (
                          teamMembers.map(member => (
                            <button
                              key={member._id}
                              className={`team-option ${selectedTeamMember?._id === member._id ? 'selected' : ''}`}
                              onClick={() => handleTeamMemberClick(member)}
                            >
                              <span className="team-option-name">{member.name}</span>
                              <span className="assign-icon">→</span>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {isTicketAssigned && (
                <div className="assigned-member-section">
                  <h3 className="section-heading">Assigned To</h3>
                  <div className="assigned-member-info">
                    <img
                      src={`https://ui-avatars.com/api/?name=${openTicket.assignedTo?.name}&size=80&background=random&color=fff`}
                      alt={openTicket.assignedTo?.name}
                      className="assigned-member-avatar"
                    />
                    <div className="assigned-member-details">
                      <p className="assigned-member-name">{openTicket.assignedTo?.name}</p>
                      <p className="assigned-member-email">{openTicket.assignedTo?.email}</p>
                      <span className="assigned-badge">✓ Assigned</span>
                    </div>
                  </div>
                </div>
              )}

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

export default Dashboard