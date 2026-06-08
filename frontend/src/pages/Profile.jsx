import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

function Profile() {
  const [user, setUser] = useState(null)
  const [joinedEvents, setJoinedEvents] = useState([])
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }
    axios.get('https://eventnavigator-production.up.railway.app/user/profile', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(async res => {
        setUser(res.data)
        // Fetch joined event details
        const ids = res.data.joinedEventIds || []
        const eventPromises = ids.map(id =>
          axios.get(`https://eventnavigator-production.up.railway.app/events/${id}`).then(r => r.data)
        )
        const events = await Promise.all(eventPromises)
        setJoinedEvents(events)
      })
      .catch(() => setError('Failed to load profile.'))
  }, [])

  if (error) return <div style={styles.center}>{error}</div>
  if (!user) return <div style={styles.center}>Loading...</div>

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.avatar}>{user.name?.charAt(0).toUpperCase()}</div>
        <h2 style={styles.name}>{user.name}</h2>
        <p style={styles.role}>{user.role}</p>
        <div style={styles.details}>
          <div style={styles.row}>
            <span style={styles.label}>Email</span>
            <span>{user.email}</span>
          </div>
          <div style={styles.row}>
            <span style={styles.label}>Location</span>
            <span>{user.location || 'Not set'}</span>
          </div>
          <div style={styles.row}>
            <span style={styles.label}>Events Joined</span>
            <span>{joinedEvents.length}</span>
          </div>
        </div>

        {joinedEvents.length > 0 && (
          <div style={styles.eventsSection}>
            <h3 style={styles.eventsHeading}>My Events</h3>
            {joinedEvents.map(event => (
              <div key={event.id} style={styles.eventCard} onClick={() => navigate(`/events/${event.id}`)}>
                <p style={styles.eventTitle}>{event.title}</p>
                <p style={styles.eventMeta}>📍 {event.location}</p>
                <p style={styles.eventMeta}>🗓 {new Date(event.dateTime).toLocaleDateString('en-IN')}</p>
              </div>
            ))}
          </div>
        )}

        <button style={styles.button} onClick={() => {
          localStorage.removeItem('token')
          navigate('/login')
        }}>Logout</button>
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
    maxWidth: '500px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
    height: 'fit-content',
  },
  avatar: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    backgroundColor: '#1a1a2e',
    color: 'white',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '2rem',
    fontWeight: 'bold',
  },
  name: { color: '#1a1a2e', margin: 0, fontSize: '1.5rem' },
  role: {
    backgroundColor: '#e94560',
    color: 'white',
    padding: '0.2rem 0.8rem',
    borderRadius: '20px',
    fontSize: '0.8rem',
    margin: 0,
  },
  details: { width: '100%', display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '1rem' },
  row: { display: 'flex', justifyContent: 'space-between', padding: '0.8rem', backgroundColor: '#f5f5f5', borderRadius: '8px' },
  label: { color: '#666', fontWeight: 'bold' },
  eventsSection: { width: '100%', marginTop: '1rem' },
  eventsHeading: { color: '#1a1a2e', marginBottom: '0.8rem' },
  eventCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
    padding: '1rem',
    marginBottom: '0.8rem',
    cursor: 'pointer',
  },
  eventTitle: { color: '#1a1a2e', fontWeight: 'bold', margin: '0 0 0.3rem' },
  eventMeta: { color: '#666', fontSize: '0.85rem', margin: '0.2rem 0' },
  button: {
    width: '100%',
    padding: '0.9rem',
    backgroundColor: '#e94560',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    cursor: 'pointer',
    marginTop: '1rem',
  },
  center: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', fontSize: '1.2rem', color: '#666' }
}

export default Profile