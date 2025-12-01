// import React, { useState, useEffect, useCallback } from 'react'
// import './TeamStyles.css'
// import TicketList from '../../Components/TicketList/TicketList'
// import TicketDetail from '../../Components/TicketDetail/TicketDetail'
// import { useAuthContext } from '../../Hooks/useAuthContext'

// const Team = () => {
//   const [tickets, setTickets] = useState([])
//   const [selectedTicket, setSelectedTicket] = useState(null)
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState('')
//   const { user, token } = useAuthContext()  // ✅ GET BOTH user AND token

//   console.log('🔵 [TEAM] Rendering');
//   console.log('   user:', user);
//   console.log('   token exists:', !!token);

//   const fetchTickets = useCallback(async () => {
//     if (!token) {
//       console.log('🔴 [TEAM] No token available');
//       return;
//     }
    
//     console.log('🔵 [TEAM] Fetching tickets');
//     setLoading(true)
//     try {
//       const response = await fetch('http://localhost:4000/api/team/tickets', {
//         headers: { 
//           'Authorization': `Bearer ${token}`,  // ✅ USE token directly
//           'Content-Type': 'application/json'
//         }
//       })
      
//       console.log('🟢 [TEAM] Response status:', response.status);

//       if (!response.ok) throw new Error('Failed to fetch tickets')
//       const data = await response.json()
      
//       console.log('✅ [TEAM] Tickets received:', data.tickets.length);
      
//       setTickets(data.tickets || [])
//       setError('')
//     } catch (err) {
//       console.log('🔴 [TEAM] Error:', err.message);
//       setError(err.message)
//     } finally {
//       setLoading(false)
//     }
//   }, [token])  // ✅ Depend on token, not user?.token

//   useEffect(() => {
//     fetchTickets()
//   }, [fetchTickets]) 

//   return (
//     <div className='team-container'>
//       <h1>My Assigned Tickets</h1>
      
//       <div className='team-content'>
//         <div className='tickets-column'>
//           <h2>Assigned to Me ({tickets.length})</h2>
//           {loading && <p>Loading...</p>}
//           {error && <p className='error'>{error}</p>}
//           <TicketList 
//             tickets={tickets}
//             selectedTicket={selectedTicket}
//             onSelectTicket={setSelectedTicket}
//           />
//         </div>

//         <div className='detail-column'>
//           {selectedTicket ? (
//             <TicketDetail 
//               ticket={selectedTicket}
//               userToken={token}  // ✅ PASS token directly
//               isAdmin={false}
//               isTeamMember={true}
//               onTicketUpdate={(updatedTicket) => {
//                 setTickets(tickets.map(t => t._id === updatedTicket._id ? updatedTicket : t))
//                 setSelectedTicket(updatedTicket)
//                 fetchTickets()
//               }}
//             />
//           ) : (
//             <p className='no-selection'>Select a ticket to view details</p>
//           )}
//         </div>
//       </div>
//     </div>
//   )
// }

// export default Team



import React, { useState, useEffect, useCallback } from 'react'
import './Team.css'  // Same CSS as Messages if available
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
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)
  const [sending, setSending] = useState(false)

  const { token, user } = useAuthContext()

  // Determine ticket state
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

  // ✅ Open ticket and fetch fresh data
  const handleOpenTicket = async (ticket) => {
    try {
      const freshTicket = await fetchSingleTicket(ticket._id)
      const finalTicket = freshTicket || ticket

      setOpenTicket(finalTicket)
    } catch (err) {
      console.error('Error opening ticket:', err)
      setOpenTicket(ticket)
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

      const responseData = await response.json()
      const resolvedTicket = responseData.ticket || responseData

      // ✅ Preserve isMissedChat after resolution
      const finalTicket = {
        ...resolvedTicket,
        status: 'resolved',
        isMissedChat: resolvedTicket.isMissedChat ?? openTicket.isMissedChat
      }

      setOpenTicket(finalTicket)
      setTickets(tickets.map(t => t._id === finalTicket._id ? finalTicket : t))
      setFilteredTickets(filteredTickets.map(t => t._id === finalTicket._id ? finalTicket : t))
      setShowStatusDropdown(false)
    } catch (err) {
      console.error('Error:', err)
      setError(err.message)
      setTimeout(() => setError(''), 3000)
    }
  }

  return (
    <div className="admin-dashboard">
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
                <h3>Assigned Tickets</h3>
              </div>

              <div className="chats-list">
                {filteredTickets.map((ticket, idx) => {
                  let chatBadgeText = ticket.messages[ticket.messages.length - 1]?.text || 'No message'
                  let showBadge = false
                  if (ticket.status === 'resolved') {
                    chatBadgeText = 'Resolved'
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

            {/* CENTER PANEL - MESSAGES */}
            <div className="panel-chat">
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
                    {openTicket.messages.map((msg, idx) => (
                      <div key={idx} className={`msg-item msg-${msg.senderType}`}>
                        <div className="msg-header">
                          <img
                            src={`https://ui-avatars.com/api/?name=${msg.senderType === 'team' ? 'Team' : openTicket.userName}&size=32&background=random&color=fff`}
                            alt="Avatar"
                            className="msg-avatar"
                          />
                          <div className="msg-sender-info">
                            <span className="msg-sender-name">
                              {msg.senderType === 'team' ? `${user?.name || 'Team Member'}` : openTicket.userName}
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

              {/* ✅ isMissedChat Indicator for Team Members */}
              {openTicket?.isMissedChat === true && (
                <div className="missed-chat-indicator">
                  <p>{isTicketResolved ? 'This was a missed chat' : 'Replying to missed chat'}</p>
                </div>
              )}

              {/* Message Input Area */}
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
            </div>

            {/* RIGHT PANEL - CUSTOMER INFO */}
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
                        <span className="status-badge status-in_progress">
                          In Progress
                        </span>
                      </div>

                      <span className={`dropdown-icon ${showStatusDropdown ? 'open' : ''}`}>▼</span>
                    </button>

                    {showStatusDropdown && (
                      <div className="status-dropdown-menu">
                        <button
                          className="status-option"
                          onClick={() => handleStatusChange()}
                        >
                          Resolve Ticket
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Team