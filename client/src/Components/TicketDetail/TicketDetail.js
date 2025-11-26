// Components/TicketDetail/TicketDetail.js
// ========================================
import React, { useState } from 'react'
import './TicketDetailStyles.css'
import MessageBox from '../MessageBox/MessageBox'
import AddMessageForm from '../AddMessageForm/AddMessageForm'
import AdminActions from '../AdminActions/AdminActions'
import TeamActions from '../TeamActions/TeamActions'

const TicketDetail = ({ ticket, userToken, isAdmin, isTeamMember, onTicketUpdate }) => {
  const [messages, setMessages] = useState(ticket?.messages || [])

  const handleMessageAdded = (newMessage) => {
    setMessages([...messages, newMessage])
  }

  const handleTicketUpdated = (updatedTicket) => {
    onTicketUpdate(updatedTicket)
  }

  if (!ticket) return null

  return (
    <div className='ticket-detail'>
      <div className='ticket-header-info'>
        <h2>Ticket #{ticket._id?.slice(-6)}</h2>
        <div className='ticket-meta'>
          <p><strong>Customer:</strong> {ticket.userName}</p>
          <p><strong>Email:</strong> {ticket.userEmail}</p>
          <p><strong>Phone:</strong> {ticket.userPhoneNumber}</p>
          <p><strong>Status:</strong> <span className={`status ${ticket.status}`}>{ticket.status}</span></p>
        </div>
      </div>

      <div className='messages-section'>
        <h3>Conversation</h3>
        <MessageBox 
          messages={messages}
          isAdmin={isAdmin}
          isTeamMember={isTeamMember}
        />
      </div>

      {isAdmin && (
        <AdminActions 
          ticket={ticket}
          userToken={userToken}
          onMessageAdded={handleMessageAdded}
          onTicketUpdated={handleTicketUpdated}
        />
      )}

      {isTeamMember && (
        <TeamActions 
          ticket={ticket}
          userToken={userToken}
          onMessageAdded={handleMessageAdded}
          onTicketUpdated={handleTicketUpdated}
        />
      )}

      {!isAdmin && !isTeamMember && (
        <div className='message-input'>
          <AddMessageForm 
            ticketId={ticket._id}
            clientSecret={ticket.clientSecret}
            onMessageAdded={handleMessageAdded}
            endpoint={`/api/tickets/${ticket._id}/messages`}
          />
        </div>
      )}
    </div>
  )
}

export default TicketDetail