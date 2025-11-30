// ========================================
// Components/AdminActions/AdminActions.js
// ========================================
import React, { useState } from 'react'
import './AdminActionsStyles.css'
import AddMessageForm from '../AddMessageForm/AddMessageForm'

const AdminActions = ({ ticket, userToken, onMessageAdded, onTicketUpdated }) => {
  const [showAssign, setShowAssign] = useState(false)
  const [teamMembers, setTeamMembers] = useState([])
  const [selectedMember, setSelectedMember] = useState('')
  const [assignNote, setAssignNote] = useState('')
  const [loading, setLoading] = useState(false)

  const fetchTeamMembers = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/admin/users', {
        headers: { Authorization: `Bearer ${userToken}` }
      })
      const data = await response.json()
      setTeamMembers(data.users || [])
    } catch (err) {
      console.error('Failed to fetch team members:', err)
    }
  }

  const handleAssignClick = async () => {
    if (!selectedMember) return
    
    setLoading(true)
    try {
      const response = await fetch(`http://localhost:4000/api/admin/tickets/${ticket._id}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`
        },
        body: JSON.stringify({
          assignedToId: selectedMember,
          note: assignNote
        })
      })

      if (!response.ok) throw new Error('Failed to assign ticket')
      
      onTicketUpdated({ ...ticket, status: 'assigned', assignedToType: 'team', assignedToId: selectedMember })
      setShowAssign(false)
      setSelectedMember('')
      setAssignNote('')
    } catch (err) {
      console.error('Error assigning ticket:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleResolve = async () => {
    const resolutionNote = prompt('Enter resolution note:')
    if (!resolutionNote) return

    setLoading(true)
    try {
      const response = await fetch(`http://localhost:4000/api/admin/tickets/${ticket._id}/resolve`, {
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
    <div className='admin-actions'>
      <div className='admin-messages'>
        <h4>Send Message</h4>
        <AddMessageForm 
          ticketId={ticket._id}
          onMessageAdded={onMessageAdded}
          endpoint={`/api/admin/tickets/${ticket._id}/messages`}
          userToken={userToken}
          isAdmin={true}
        />
      </div>

      <div className='admin-controls'>
        <button 
          className='btn-assign'
          onClick={() => {
            fetchTeamMembers()
            setShowAssign(!showAssign)
          }}
        >
          Assign to Team Member
        </button>

        {showAssign && (
          <div className='assign-panel'>
            <select 
              value={selectedMember}
              onChange={(e) => setSelectedMember(e.target.value)}
            >
              <option value=''>Select Team Member</option>
              {teamMembers.map(member => (
                <option key={member._id} value={member._id}>
                  {member.name} ({member.email})
                </option>
              ))}
            </select>
            <input 
              type='text'
              placeholder='Add note (optional)'
              value={assignNote}
              onChange={(e) => setAssignNote(e.target.value)}
            />
            <button onClick={handleAssignClick} disabled={loading}>
              {loading ? 'Assigning...' : 'Assign'}
            </button>
          </div>
        )}

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

export default AdminActions