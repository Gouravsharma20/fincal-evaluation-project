import React, { useState } from 'react'
// import './AddMessageFormStyles.css'

const AddMessageForm = ({ ticketId, clientSecret, onMessageAdded, endpoint, userToken, isAdmin, isTeamMember }) => {
  const [text, setText] = useState('')
  const [internal, setInternal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!text.trim()) return

    setLoading(true)
    try {
      const headers = { 'Content-Type': 'application/json' }
      const body = { text }

      if (clientSecret) {
        body.clientSecret = clientSecret
      }
      if (isAdmin || isTeamMember) {
        body.internal = internal
        headers.Authorization = `Bearer ${userToken}`
      }

      const response = await fetch(`http://localhost:4000${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      })

      if (!response.ok) throw new Error('Failed to send message')
      
      onMessageAdded({ text, senderType: isAdmin ? 'admin' : isTeamMember ? 'team' : 'user', internal, createdAt: new Date() })
      setText('')
      setInternal(false)
      setError('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className='add-message-form' onSubmit={handleSubmit}>
      <textarea 
        placeholder='Type your message...'
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows='3'
      />
      
      {(isAdmin || isTeamMember) && (
        <label className='internal-checkbox'>
          <input 
            type='checkbox'
            checked={internal}
            onChange={(e) => setInternal(e.target.checked)}
          />
          <span>Internal note (customer won't see this)</span>
        </label>
      )}

      <button type='submit' disabled={loading}>{loading ? 'Sending...' : 'Send'}</button>
      {error && <p className='error'>{error}</p>}
    </form>
  )
}

export default AddMessageForm