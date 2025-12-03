import React, { useState, useEffect, useCallback } from 'react'
import './Team.css'
import { useAuthContext } from '../../Hooks/useAuthContext'
import { API_BASE_URL } from '../../config/api'
import sendMessageIcon from '../../Assets/MessagePageAssets/sendMessageIcon.png'
import nameIcon from '../../Assets/MessagePageAssets/nameIcon.png'
import emailIcon from '../../Assets/MessagePageAssets/emailIcon.png'
import phoneIcon from '../../Assets/MessagePageAssets/phoneIcon.png'
import TicketStatus from '../../Assets/MessagePageAssets/ticketStatus.png'

const Team = () => {
  const [tickets, setTickets] = useState([])
  const [filteredTickets, setFilteredTickets] = useState([])
  const [openTicket, setOpenTicket] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [newMessage, setNewMessage] = useState('')
  const [ticketStatus, setTicketStatus] = useState('in_progress')
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)
  const [sending, setSending] = useState(false)

  const { token, user } = useAuthContext()

  const isTicketResolved = openTicket?.status === 'resolved'

  const fetchSingleTicket = useCallback(async (ticketId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/team/tickets/${ticketId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )
      if (response.ok) {
        const data = await response.json()
        return data.ticket || data
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
      const response = await fetch(`${API_BASE_URL}/api/team/tickets`, {
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
        setTicketStatus(freshTicket?.status || data.tickets[0].status || 'in_progress')
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

  const handleOpenTicket = async (ticket) => {
    try {
      const freshTicket = await fetchSingleTicket(ticket._id)
      const finalTicket = freshTicket || ticket

      setOpenTicket(finalTicket)
      setTicketStatus(finalTicket.status || 'in_progress')
    } catch (err) {
      console.error('Error opening ticket:', err)
      setOpenTicket(ticket)
      setTicketStatus(ticket.status || 'in_progress')
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

    if (isTicketResolved) {
      setError('Cannot send message - ticket is resolved')
      setTimeout(() => setError(''), 3000)
      return
    }

    setSending(true)
    setError('')

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/team/tickets/${openTicket._id}/messages`,
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

      const responseData = await response.json()
      const updatedTicket = responseData.ticket || responseData

      setOpenTicket(updatedTicket)
      setTickets(tickets.map(t => t._id === updatedTicket._id ? updatedTicket : t))
      setFilteredTickets(filteredTickets.map(t => t._id === updatedTicket._id ? updatedTicket : t))

      setNewMessage('')
      setError('')
    } catch (err) {
      console.error('Error:', err)
      setError(err.message || 'Failed to send message. Please try again.')
    } finally {
      setSending(false)
    }
  }

  const handleStatusChange = async () => {
    if (!openTicket) return

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/team/tickets/${openTicket._id}/resolve`,
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
        `${API_BASE_URL}/api/team/tickets/${openTicket._id}`,
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

        setOpenTicket(freshTicket)
        setTickets(tickets.map(t => t._id === freshTicket._id ? freshTicket : t))
        setFilteredTickets(filteredTickets.map(t => t._id === freshTicket._id ? freshTicket : t))
        setTicketStatus('resolved')
        setShowStatusDropdown(false)
      }
    } catch (err) {
      console.error('Error:', err)
      setError(err.message)
      setTimeout(() => setError(''), 3000)
    }
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-main-content">
        <div className="three-panel-container">
          <div className="panel-left-chats">
            <div className="chats-header">
              <h3>Chats</h3>
            </div>

            <div className="chats-list">
              {loading && <p className="status-text">Loading tickets...</p>}
              {error && <p className="status-text error-text">Error: {error}</p>}
              {!loading && filteredTickets.length === 0 && <p className="status-text">No tickets found</p>}

              {!loading && filteredTickets.map((ticket, idx) => {
                let chatBadgeText = ticket.messages[ticket.messages.length - 1]?.text || 'No message'
                let showBadge = false
                if (ticket.status === 'resolved') {
                  chatBadgeText = 'Resolved'
                  showBadge = true
                }

                return (
                  <div
                    key={ticket._id}
                    className={`chat-list-item ${openTicket?._id === ticket._id ? 'active' : ''}`}
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
                        <p className={`chat-status-badge ${ticket.status === 'resolved' ? 'resolved' : ''}`}>
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
          <div className="panel-chat">
            {openTicket ? (
              <>
                <div className="panel-header">
                  <p>Ticket#2025-{openTicket._id.slice(0, 5)}</p>
                </div>

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

                      {openTicket.messages.map((msg, idx) => {
                        const isTeamMessage = msg.senderType === 'team' || msg.senderType === 'admin'
                        const senderName = isTeamMessage ? (user?.name || 'Team Member') : openTicket.userName
                        
                        return (
                          <div key={idx} className={`msg-item msg-${msg.senderType}`}>
                            <div className="msg-header">
                              <img
                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(senderName)}&size=32&background=random&color=fff`}
                                alt="Avatar"
                                className="msg-avatar"
                              />
                              <div className="msg-sender-info">
                                <span className="msg-sender-name">
                                  {senderName}
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
                        )
                      })}
                    </>
                  )}
                </div>
                {openTicket?.isMissedChat === true && (
                  <div
                    className="missed-chat-indicator"
                    style={{
                      backgroundColor: '#fff3cd',
                      border: '2px solid #ffc107',
                      padding: '15px',
                      borderRadius: '5px',
                      marginTop: '10px',
                      textAlign: 'center'
                    }}
                  >
                    <p style={{ color: '#856404', margin: 0, fontWeight: 'bold', fontSize: '16px' }}>
                      {isTicketResolved ? ' This was a missed chat' : ' Replying to missed chat'}
                    </p>
                  </div>
                )}

                {isTicketResolved ? (
                  <div className="message-reply-box resolved-state">
                    <div className="no-access-message">
                      <p>Ticket has been Resolved</p>
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
              </>
            ) : (
              <div className="no-ticket-selected">
                <p>Select a ticket to view messages</p>
              </div>
            )}
          </div>

          <div className="panel-profile">
            {openTicket ? (
              <>
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

                {!isTicketResolved && (
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
                            {ticketStatus === 'assigned' ? 'Assigned' : ticketStatus === 'in_progress' ? 'In Progress' : 'Open'}
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
                )}
              </>
            ) : (
              <div className="no-ticket-selected">
                <p>No ticket selected</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Team