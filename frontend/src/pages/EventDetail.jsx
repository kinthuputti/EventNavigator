import { useState, useEffect } from 'react'
import axios from 'axios'
import { useParams, useNavigate } from 'react-router-dom'
import { Client } from '@stomp/stompjs'

function EventDetail() {
  const [event, setEvent] = useState(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [notification, setNotification] = useState('')
  const { id } = useParams()
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  useEffect(() => {
    axios.get(`https://eventnavigator-production.up.railway.app/events/${id}`)
      .then(res => setEvent(res.data))
      .catch(() => setError('Event not found.'))
  }, [id])

  useEffect(() => {
  const client = new Client({
    brokerURL: 'wss://eventnavigator-production.up.railway.app/ws',
    onConnect: () => {
      client.subscribe(`/topic/events/${id}`, (msg) => {
        const data = JSON.parse(msg.body)
        setNotification(`🔔 ${data.userName} just joined this event!`)
        setTimeout(() => setNotification(''), 5000)
        
        // Update attendee count in real time
        setEvent(prev => ({
          ...prev,
          currentAttendees: prev.currentAttendees + 1
        }))
      })
    }
  })
  client.activate()
  return () => client.deactivate()
}, [id])

  const handleJoin = async () => {
    if (!token) {
      navigate('/login')
      return
    }
    try {
      const res = await axios.post(`https://eventnavigator-production.up.railway.app/events/${id}/join`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMessage(res.data)
    } catch (err) {
      setMessage(err.response?.data || 'Failed to join event.')
    }
  }

  if (error) return <div style={styles.center}>{error}</div>
  if (!event) return <div style={styles.center}>Loading...</div>

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <span style={styles.category}>{event.category}</span>
        <h1 style={styles.title}>{event.title}</h1>
        <p style={styles.description}>{event.description}</p>
        <div style={styles.details}>
          <p>📍 {event.location}</p>
          <p>🗓 {new Date(event.dateTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
          <p>👥 {event.currentAttendees} / {event.maxAttendees} attendees</p>
          <p>💰 {event.price === 0 ? 'Free' : `₹${event.price}`}</p>
          <p>📌 Status: {event.status}</p>
        </div>
        {notification && <p style={styles.notification}>{notification}</p>}
        {message && <p style={styles.message}>{message}</p>}
        <button style={styles.button} onClick={handleJoin}>
          {token ? 'Join Event' : 'Login to Join'}
        </button>
        <button style={styles.back} onClick={() => navigate(-1)}>← Back</button>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    display: 'flex',
    justifyContent: 'center',
    padding: '2rem',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '2.5rem',
    boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '600px',
    height: 'fit-content',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  category: { backgroundColor: '#1a1a2e', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', width: 'fit-content' },
  title: { color: '#1a1a2e', margin: 0 },
  description: { color: '#444', lineHeight: '1.6' },
  details: { display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#555' },
  notification: { backgroundColor: '#e8f5e9', color: '#2e7d32', padding: '0.8rem', borderRadius: '8px', fontWeight: 'bold' },
  message: { color: '#e94560', fontWeight: 'bold' },
  button: {
    padding: '0.9rem',
    backgroundColor: '#e94560',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    cursor: 'pointer',
  },
  back: {
    padding: '0.9rem',
    backgroundColor: 'transparent',
    color: '#1a1a2e',
    border: '1px solid #1a1a2e',
    borderRadius: '8px',
    fontSize: '1rem',
    cursor: 'pointer',
  },
  center: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', fontSize: '1.2rem', color: '#666' }
}

export default EventDetail