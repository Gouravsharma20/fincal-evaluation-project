
import React, { useState, useEffect, useCallback } from 'react'
import './MessagesStyles.css'
import { useAuthContext } from '../../Hooks/useAuthContext'
import { API_BASE_URL } from '../../config/api'
import sendMessageIcon from '../../Assets/MessagePageAssets/sendMessageIcon.png'
import nameIcon from '../../Assets/MessagePageAssets/nameIcon.png'
import emailIcon from '../../Assets/MessagePageAssets/emailIcon.png'
import phoneIcon from '../../Assets/MessagePageAssets/phoneIcon.png'
import TicketStatus from '../../Assets/MessagePageAssets/ticketStatus.png'

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
  const [sending, setSending] = useState(false)
  const [teamMembers, setTeamMembers] = useState([])
  const [loadingTeamMembers, setLoadingTeamMembers] = useState(false)
  const [showAssignmentModal, setShowAssignmentModal] = useState(false)
  const [pendingAssignment, setPendingAssignment] = useState(null)
  const [assignmentLoading, setAssignmentLoading] = useState(false)

  const { token } = useAuthContext()

  // Determine ticket state
  const isTicketAssigned = openTicket?.assignedTo !== null && openTicket?.assignedTo !== undefined
  const isTicketResolved = openTicket?.status === 'resolved'

  const fetchTeamMembers = useCallback(async () => {
    if (!token) return

    setLoadingTeamMembers(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/team-members`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) throw new Error('Failed to fetch team members')
      const data = await response.json()
      const membersOnly = (data.users || []).filter(user => user.designation !== 'Admin')
      setTeamMembers(membersOnly)
    } catch (err) {
      console.error('Error fetching team members:', err)
      setTeamMembers([])
    } finally {
      setLoadingTeamMembers(false)
    }
  }, [token])

  const fetchSingleTicket = useCallback(async (ticketId) => {
    try {
      console.log('🔍 fetchSingleTicket: Fetching ticket', ticketId)
      const response = await fetch(
        `${API_BASE_URL}/api/admin/tickets/${ticketId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )
      if (response.ok) {
        const data = await response.json()
        const ticket = data.ticket || data
        console.log('🔍 fetchSingleTicket: Success', {
          ticketId,
          isMissedChat: ticket?.isMissedChat,
          hasField: 'isMissedChat' in (ticket || {})
        })
        return ticket
      }
      return null
    } catch (err) {
      console.error('Error fetching ticket:', err)
      return null
    }
  }, [token])

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
      applyFilters(data.tickets || [], filter, searchQuery)

      if (!openTicket && data.tickets && data.tickets.length > 0) {
        const freshTicket = await fetchSingleTicket(data.tickets[0]._id)
        setOpenTicket(freshTicket || data.tickets[0])
        setTicketStatus(freshTicket?.status || data.tickets[0].status || 'unresolved')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [token, filter, searchQuery, openTicket, fetchSingleTicket])

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
  }, [filter, searchQuery, tickets])

  const handleSearch = (e) => {
    setSearchQuery(e.target.value)
  }

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter)
  }

  const handleOpenTicket = async (ticket) => {
    try {
      console.log('\n\n')
      console.log('═══════════════════════════════════════════════════')
      console.log('🟢 STEP 1: Original ticket from list')
      console.log('═══════════════════════════════════════════════════')
      console.log('ticket._id:', ticket._id)
      console.log('ticket.isMissedChat:', ticket.isMissedChat)
      console.log('ticket keys:', Object.keys(ticket).slice(0, 15))

      const freshTicket = await fetchSingleTicket(ticket._id)
      
      console.log('\n🟢 STEP 2: Fresh ticket from API')
      console.log('═══════════════════════════════════════════════════')
      console.log('freshTicket._id:', freshTicket?._id)
      console.log('freshTicket.isMissedChat:', freshTicket?.isMissedChat)
      console.log('freshTicket type:', typeof freshTicket)
      console.log('freshTicket === null:', freshTicket === null)
      console.log('freshTicket === undefined:', freshTicket === undefined)
      if (freshTicket) {
        console.log('freshTicket keys:', Object.keys(freshTicket).slice(0, 15))
      }

      const finalTicket = freshTicket || ticket

      console.log('\n🟢 STEP 3: Final ticket (before spread)')
      console.log('═══════════════════════════════════════════════════')
      console.log('finalTicket._id:', finalTicket._id)
      console.log('finalTicket.isMissedChat:', finalTicket.isMissedChat)

      const updatedTicket = {
        ...finalTicket,
        isMissedChat: freshTicket?.isMissedChat ?? ticket.isMissedChat ?? false
      }

      console.log('\n🟢 STEP 4: Updated ticket (after spread and explicit set)')
      console.log('═══════════════════════════════════════════════════')
      console.log('updatedTicket._id:', updatedTicket._id)
      console.log('updatedTicket.isMissedChat:', updatedTicket.isMissedChat)
      console.log('Has isMissedChat key:', 'isMissedChat' in updatedTicket)
      console.log('Keys in updatedTicket:', Object.keys(updatedTicket).slice(0, 15))

      setOpenTicket(updatedTicket)
      setSelectedTeamMember(null)
      setTicketStatus(freshTicket?.status || ticket.status || 'unresolved')
      
      // Check state after React processes update
      setTimeout(() => {
        console.log('\n🟢 STEP 5: After state update (async check)')
        console.log('═══════════════════════════════════════════════════')
        console.log('openTicket (from state):', openTicket)
        console.log('openTicket?.isMissedChat:', openTicket?.isMissedChat)
        console.log('updatedTicket.isMissedChat:', updatedTicket.isMissedChat)
        console.log('Are they equal?', openTicket?.isMissedChat === updatedTicket.isMissedChat)
        console.log('═══════════════════════════════════════════════════\n')
      }, 0)
      
    } catch (err) {
      console.error('Error opening ticket:', err)
      setOpenTicket(ticket)
      setSelectedTeamMember(null)
      setTicketStatus(ticket.status || 'unresolved')
    }
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

    if (isTicketAssigned || isTicketResolved) {
      setError('Cannot send message - ticket is ' + (isTicketResolved ? 'resolved' : 'assigned'))
      setTimeout(() => setError(''), 3000)
      return
    }

    setSending(true)
    setError('')

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/tickets/${openTicket._id}/messages`,
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

      const updatedResponse = await fetch(
        `${API_BASE_URL}/api/admin/tickets/${openTicket._id}`,
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
        
        const finalTicket = {
          ...updatedTicket,
          isMissedChat: updatedTicket.isMissedChat ?? openTicket.isMissedChat
        }
        
        setOpenTicket(finalTicket)
        setTickets(tickets.map(t => t._id === finalTicket._id ? finalTicket : t))
        setFilteredTickets(filteredTickets.map(t => t._id === finalTicket._id ? finalTicket : t))
      }

      setNewMessage('')
      setError('')
    } catch (err) {
      console.error('Error:', err)
      setError(err.message || 'Failed to send message. Please try again.')
    } finally {
      setSending(false)
    }
  }

  const handleTeamMemberClick = (member) => {
    setPendingAssignment(member)
    setShowAssignmentModal(true)
  }

  const handleConfirmAssignment = async () => {
    if (!openTicket || !pendingAssignment) return

    setAssignmentLoading(true)

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/tickets/${openTicket._id}/assign`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            assignedToId: pendingAssignment._id,
            note: `Assigned to ${pendingAssignment.name}`
          })
        }
      )

      if (!response.ok) throw new Error('Failed to assign')

      const updatedTicket = {
        ...openTicket,
        assignedToType: "team",
        assignedToId: pendingAssignment._id,
        assignedTo: {
          _id: pendingAssignment._id,
          name: pendingAssignment.name,
          email: pendingAssignment.email
        }
      }

      setOpenTicket(updatedTicket)
      setSelectedTeamMember(pendingAssignment)
      setTickets(tickets.map(t => t._id === updatedTicket._id ? updatedTicket : t))
      setFilteredTickets(filteredTickets.map(t => t._id === updatedTicket._id ? updatedTicket : t))
      setShowAssignmentModal(false)
      setPendingAssignment(null)
      setShowTeamDropdown(false)
    } catch (err) {
      console.error('Error:', err)
      setError(err.message)
      setTimeout(() => setError(''), 4000)
    } finally {
      setAssignmentLoading(false)
    }
  }

  const handleCancelAssignment = () => {
    setShowAssignmentModal(false)
    setPendingAssignment(null)
  }

  const handleStatusChange = async () => {
    if (!openTicket) return

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/tickets/${openTicket._id}/resolve`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ resolutionNote: "" })
        }
      )

      if (!response.ok) throw new Error('Failed to resolve')

      const freshResponse = await fetch(
        `${API_BASE_URL}/api/admin/tickets/${openTicket._id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (freshResponse.ok) {
        const freshData = await freshResponse.json()
        const freshTicket = freshData.ticket || freshData

        console.log('Resolved ticket data:', freshTicket)
        console.log('isMissedChat value:', freshTicket.isMissedChat)

        const finalTicket = {
          ...freshTicket,
          status: 'resolved',
          isMissedChat: freshTicket.isMissedChat ?? openTicket.isMissedChat
        }

        setOpenTicket(finalTicket)
        setTickets(tickets.map(t => t._id === finalTicket._id ? finalTicket : t))
        setFilteredTickets(filteredTickets.map(t => t._id === finalTicket._id ? finalTicket : t))
        setTicketStatus('resolved')
        setShowStatusDropdown(false)
      }
    } catch (err) {
      console.error('Error:', err)
      setError(err.message)
      setTimeout(() => setError(''), 3000)
    }
  }

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
              Assign this ticket to <strong>{memberName}</strong>?
            </p>
          </div>
          <div className="modal-footer">
            <button className="modal-btn modal-btn-cancel" onClick={handleCancelAssignment} disabled={assignmentLoading}>
              Cancel
            </button>
            <button className="modal-btn modal-btn-confirm" onClick={handleConfirmAssignment} disabled={assignmentLoading}>
              {assignmentLoading ? 'Processing...' : 'Confirm'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-dashboard">
      <ConfirmationModal isOpen={showAssignmentModal} memberName={pendingAssignment?.name} />

      <div className="admin-main-content">
        {!openTicket && (
          <>
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

            <div className="filter-tabs-section">
              <button className={`filter-tab ${filter === 'all' ? 'active' : ''}`} onClick={() => handleFilterChange('all')}>
                All Tickets
              </button>
              <button className={`filter-tab ${filter === 'resolved' ? 'active' : ''}`} onClick={() => handleFilterChange('resolved')}>
                Resolved
              </button>
              <button className={`filter-tab ${filter === 'unresolved' ? 'active' : ''}`} onClick={() => handleFilterChange('unresolved')}>
                Unresolved
              </button>
            </div>

            <div className="tickets-cards-container">
              {loading && <p className="status-text">Loading tickets...</p>}
              {error && <p className="status-text error-text">Error: {error}</p>}
              {!loading && filteredTickets.length === 0 && <p className="status-text">No tickets found</p>}

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
                      {ticket.messages[ticket.messages.length - 1]?.text}
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
                    <button className="open-ticket-btn-card" onClick={() => handleOpenTicket(ticket)}>
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
            {/* LEFT PANEL - CHATS */}
            <div className="panel-left-chats">
              <div className="chats-header">
                <h3>Chats</h3>
              </div>

              <div className="chats-list">
                {filteredTickets.map((ticket, idx) => {
                  let chatBadgeText = ticket.messages[ticket.messages.length - 1]?.text || 'No message'
                  let showBadge = false
                  if (ticket.status === 'resolved') {
                    chatBadgeText = 'Resolved'
                    showBadge = true
                  } else if (ticket.assignedTo) {
                    chatBadgeText = 'No longer have access - Chat assigned'
                    showBadge = true
                  }

                  return (
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
                        {showBadge ? (
                          <p className={`chat-status-badge ${ticket.status === 'resolved' ? 'resolved' : 'assigned'}`}>
                            {chatBadgeText}
                          </p>
                        ) : (
                          <p className="chat-preview">{chatBadgeText}</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* CENTER PANEL - MESSAGES */}
            <div className="panel-chat">
              <div className="panel-header">
                <p>Ticket#2025-{openTicket._id.slice(0, 5)}</p>
              </div>

              {/* 🔍 DEBUG: Render check */}
              {console.log('🎨 RENDER TIME:', {
                'openTicket._id': openTicket?._id,
                'openTicket.isMissedChat': openTicket?.isMissedChat,
                'isTicketResolved': isTicketResolved,
                'type of isMissedChat': typeof openTicket?.isMissedChat,
                'strictEquality': openTicket?.isMissedChat === true,
                'truthyCheck': openTicket?.isMissedChat ? 'true' : 'false'
              })}

              <div className="messages-list">
                {openTicket.messages && openTicket.messages.length > 0 && (
                  <>
                    <div className="msg-date-separator">
                      <span>
                        {new Date(openTicket.messages[0].createdAt).toLocaleDateString('en-US', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    {openTicket.messages.map((msg, idx) => (
                      <div key={idx} className={`msg-item msg-${msg.senderType}`}>
                        <div className="msg-header">
                          <img
                            src={`https://ui-avatars.com/api/?name=${msg.senderType === 'admin' ? 'Admin' : openTicket.userName}&size=32&background=random&color=fff`}
                            alt="Avatar"
                            className="msg-avatar"
                          />
                          <div className="msg-sender-info">
                            <span className="msg-sender-name">
                              {msg.senderType === 'admin' ? `Admin/${openTicket.userName}` : openTicket.userName}
                            </span>
                            <span className="msg-timestamp">
                              {new Date(msg.createdAt).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true
                              })}
                            </span>
                          </div>
                        </div>
                        <p className="msg-content">{msg.text}</p>
                      </div>
                    ))}
                  </>
                )}
              </div>

              {/* ✅ INDICATOR - MOVED OUTSIDE messages condition */}
              {openTicket?.isMissedChat === true && (
                <div className="missed-chat-indicator" style={{
                  backgroundColor: '#fff3cd',
                  border: '2px solid #ffc107',
                  padding: '15px',
                  borderRadius: '5px',
                  marginTop: '10px'
                }}>
                  <p style={{ color: '#856404', margin: 0, fontWeight: 'bold' }}>
                    {isTicketResolved ? 'This was a missed chat' : 'Replying to missed chat'}
                  </p>
                </div>
              )}

              {/* Message Input Area */}
              {isTicketResolved ? (
                <div className="message-reply-box resolved-state">
                  <div className="no-access-message">
                    <p>Ticket has been Resolved</p>
                  </div>
                </div>
              ) : isTicketAssigned ? (
                <div className="message-reply-box assigned-state">
                  <div className="no-access-message">
                    <p>No longer have access - Chat has been assigned</p>
                  </div>
                </div>
              ) : (
                <div className="message-reply-box">
                  <div className="reply-textarea-wrapper">
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
                      title={sending ? 'Sending...' : 'Send Message'}
                    >
                      <img
                        src={sendMessageIcon}
                        alt="Send"
                        className="send-button-icon"
                      />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT PANEL - PROFILE */}
            <div className="panel-profile">
              <div className="customer-profile-section">

                <div className="profile-header">
                  <img
                    src={`https://ui-avatars.com/api/?name=${openTicket.userName}&size=120&background=random&color=fff`}
                    alt={openTicket.userName}
                    className="profile-avatar-large"
                  />
                  <h3>{openTicket.userName}</h3>
                </div>

                <div className="profile-details">
                  <div className="detail-row">
                    <img src={nameIcon} alt="Name" className="detail-icon" />
                    <div className="detail-text">
                      <p>{openTicket.userName}</p>
                    </div>
                  </div>

                  <div className="detail-row">
                    <img src={emailIcon} alt="Email" className="detail-icon" />
                    <div className="detail-text">
                      <p>{openTicket.userEmail}</p>
                    </div>
                  </div>

                  <div className="detail-row">
                    <img src={phoneIcon} alt="Phone" className="detail-icon" />
                    <div className="detail-text">
                      <p>+{openTicket.userPhoneNumber}</p>
                    </div>
                  </div>
                </div>
              </div>

              {!isTicketAssigned && !isTicketResolved && (
                <>
                  <div className="team-assignment-section">
                    <h3 className="section-heading">Teammates</h3>
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
                            <div className="team-option"><span>Loading...</span></div>
                          ) : teamMembers.length === 0 ? (
                            <div className="team-option"><span>No members</span></div>
                          ) : (

                            teamMembers.map(member => (
                              <button key={member._id}
                                className={`team-option ${selectedTeamMember?._id === member._id ? 'selected' : ''}`}
                                onClick={() => handleTeamMemberClick(member)}
                                type="button"
                              >
                                <div className="team-option-left">
                                  <img
                                    src={member.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random&color=fff&size=64`}
                                    alt={member.name}
                                    className="team-option-avatar"
                                    loading="lazy"
                                  />
                                  <span className="team-option-name">{member.name}</span>
                                </div>
                                <span className="assign-icon">→</span>
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="status-dropdown-section">
                    <h3 className="section-heading">Ticket Status</h3>
                    <div className="status-dropdown-wrapper">
                      <button
                        className="status-dropdown-btn"
                        onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                      >
                        <div className="status-btn-left">
                          <img
                            src={TicketStatus}
                            alt="Ticket Status Icon"
                            className="status-btn-icon"
                          />
                          <span className={`status-badge status-${ticketStatus}`}>
                            {ticketStatus.charAt(0).toUpperCase() + ticketStatus.slice(1)}
                          </span>
                        </div>

                        <span className={`dropdown-icon ${showStatusDropdown ? 'open' : ''}`}>▼</span>
                      </button>

                      {showStatusDropdown && (
                        <div className="status-dropdown-menu">

                          <button
                            className={`status-option ${ticketStatus === 'resolved' ? 'active' : ''}`}
                            onClick={() => handleStatusChange()}
                          >
                            Resolve Ticket
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Messages