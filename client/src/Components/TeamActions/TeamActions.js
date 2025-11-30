import React, { useState } from 'react'
// import './TeamActionsStyles.css'
import AddMessageForm from '../AddMessageForm/AddMessageForm'
import {API_BASE_URL} from '../../config/api'


const TeamActions = ({ ticket, userToken, onMessageAdded, onTicketUpdated }) => {
  const [loading, setLoading] = useState(false)

  const handleResolve = async () => {
    const resolutionNote = prompt('Enter resolution note:')
    if (!resolutionNote) return

    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/team/tickets/${ticket._id}/resolve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`
        },
        body: JSON.stringify({ resolutionNote })
      })

      if (!response.ok) throw new Error('Failed to resolve ticket')
      
      onTicketUpdated({ ...ticket, status: 'resolved' })
    } catch (err) {
      console.error('Error resolving ticket:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='team-actions'>
      <div className='team-messages'>
        <h4>Send Message to Customer</h4>
        <AddMessageForm 
          ticketId={ticket._id}
          onMessageAdded={onMessageAdded}
          endpoint={`/api/team/tickets/${ticket._id}/messages`}
          userToken={userToken}
          isTeamMember={true}
        />
      </div>

      <div className='team-controls'>
        {ticket.status !== 'resolved' && (
          <button 
            className='btn-resolve'
            onClick={handleResolve}
            disabled={loading}
          >
            {loading ? 'Resolving...' : 'Resolve Ticket'}
          </button>
        )}
      </div>
    </div>
  )
}

export default TeamActions