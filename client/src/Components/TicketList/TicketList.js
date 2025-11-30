
import React from 'react'
import './TicketListStyles.css'

const TicketList = ({ tickets, selectedTicket, onSelectTicket }) => {
  return (
    <div className='ticket-list'>
      {tickets.length === 0 ? (
        <p className='no-tickets'>No tickets</p>
      ) : (
        tickets.map(ticket => (
          <div 
            key={ticket._id} 
            className={`ticket-item ${selectedTicket?._id === ticket._id ? 'active' : ''}`}
            onClick={() => onSelectTicket(ticket)}
          >
            <div className='ticket-header'>
              <h3>{ticket.userName}</h3>
              <span className={`status ${ticket.status}`}>{ticket.status}</span>
            </div>
            <p className='ticket-email'>{ticket.userEmail}</p>
            <p className='ticket-phone'>{ticket.userPhoneNumber}</p>
            {ticket.messages && ticket.messages[0] && (
              <p className='ticket-preview'>{ticket.messages[0].text?.substring(0, 50)}...</p>
            )}
            <small className='ticket-date'>
              {new Date(ticket.lastMessageAt).toLocaleDateString()}
            </small>
          </div>
        ))
      )}
    </div>
  )
}

export default TicketList