import React, { useState, useEffect, useCallback } from 'react'
import './TeamStyles.css'
import TicketList from '../../Components/TicketList/TicketList'
import TicketDetail from '../../Components/TicketDetail/TicketDetail'
import { useAuthContext } from '../../Hooks/useAuthContext'

const Team = () => {
  const [tickets, setTickets] = useState([])
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { user, token } = useAuthContext()  // ✅ GET BOTH user AND token

  console.log('🔵 [TEAM] Rendering');
  console.log('   user:', user);
  console.log('   token exists:', !!token);

  const fetchTickets = useCallback(async () => {
    if (!token) {
      console.log('🔴 [TEAM] No token available');
      return;
    }
    
    console.log('🔵 [TEAM] Fetching tickets');
    setLoading(true)
    try {
      const response = await fetch('http://localhost:4000/api/team/tickets', {
        headers: { 
          'Authorization': `Bearer ${token}`,  // ✅ USE token directly
          'Content-Type': 'application/json'
        }
      })
      
      console.log('🟢 [TEAM] Response status:', response.status);

      if (!response.ok) throw new Error('Failed to fetch tickets')
      const data = await response.json()
      
      console.log('✅ [TEAM] Tickets received:', data.tickets.length);
      
      setTickets(data.tickets || [])
      setError('')
    } catch (err) {
      console.log('🔴 [TEAM] Error:', err.message);
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [token])  // ✅ Depend on token, not user?.token

  useEffect(() => {
    fetchTickets()
  }, [fetchTickets]) 

  return (
    <div className='team-container'>
      <h1>My Assigned Tickets</h1>
      
      <div className='team-content'>
        <div className='tickets-column'>
          <h2>Assigned to Me ({tickets.length})</h2>
          {loading && <p>Loading...</p>}
          {error && <p className='error'>{error}</p>}
          <TicketList 
            tickets={tickets}
            selectedTicket={selectedTicket}
            onSelectTicket={setSelectedTicket}
          />
        </div>

        <div className='detail-column'>
          {selectedTicket ? (
            <TicketDetail 
              ticket={selectedTicket}
              userToken={token}  // ✅ PASS token directly
              isAdmin={false}
              isTeamMember={true}
              onTicketUpdate={(updatedTicket) => {
                setTickets(tickets.map(t => t._id === updatedTicket._id ? updatedTicket : t))
                setSelectedTicket(updatedTicket)
                fetchTickets()
              }}
            />
          ) : (
            <p className='no-selection'>Select a ticket to view details</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Team