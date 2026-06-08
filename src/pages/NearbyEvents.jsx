import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

function NearbyEvents() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        try {
          const res = await axios.get('https://eventnavigator-production.up.railway.app/events/nearby', {
            params: { lat: latitude, lon: longitude, radius: 50 },
            headers: { Authorization: `Bearer ${token}` }
          })
          setEvents(res.data)
        } catch (err) {
          setError('Failed to fetch nearby events.')
        } finally {
          setLoading(false)
        }
      },
      () => {
        setError('Location access denied. Please allow location to see nearby events.')
        setLoading(false)
      }
    )
  }, [])

  if (loading) return <div style={styles.center}>Getting your location...</div>
  if (error) return <div style={styles.center}>{error}</div>

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Events Near You</h1>
      <div style={styles.grid}>
        {events.length === 0 ? (
          <p style={styles.empty}>No events found near your location.</p>
        ) : (
          events.map(event => (
            <div key={event.id} style={styles.card} onClick={() => navigate(`/events/${event.id}`)}>
              <span style={styles.category}>{event.category}</span>
              <h2 style={styles.title}>{event.title}</h2>
              <p style={styles.location}>📍 {event.location}</p>
              <p style={styles.date}>🗓 {new Date(event.dateTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p style={styles.price}>{event.price === 0 ? 'Free' : `₹${event.price}`}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

const styles = {
  container: { padding: '2rem', backgroundColor: '#f5f5f5', minHeight: '100vh' },
  heading: { fontSize: '2rem', color: '#1a1a2e', marginBottom: '1.5rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' },
  card: {
    backgroundColor: 'white',
    borderRadius: '10px',
    padding: '1.5rem',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  category: { backgroundColor: '#1a1a2e', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem' },
  title: { margin: '0.8rem 0 0.4rem', color: '#1a1a2e' },
  location: { color: '#666', fontSize: '0.9rem' },
  date: { color: '#666', fontSize: '0.9rem' },
  price: { color: '#e94560', fontWeight: 'bold', marginTop: '0.5rem' },
  empty: { color: '#666' },
  center: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', fontSize: '1.2rem', color: '#666' }
}

export default NearbyEvents