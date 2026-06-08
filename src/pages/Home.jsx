import { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

function Home() {
  const [events, setEvents] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
  axios.get('https://eventnavigator-production.up.railway.app/events')
    .then(res => {
      const data = Array.isArray(res.data) ? res.data : []
      setEvents(data)
    })
    .catch(err => console.error(err))
}, [])

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Upcoming Events</h1>
      <p style={styles.sub}>Browse events — <span style={styles.highlight}>login to see events near you</span></p>
      <div style={styles.grid}>
        {events.length === 0 ? (
          <p style={styles.empty}>No events found.</p>
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
  heading: { fontSize: '2rem', color: '#1a1a2e' },
  sub: { color: '#666', marginBottom: '2rem' },
  highlight: { color: '#e94560', fontWeight: 'bold' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' },
  card: {
    backgroundColor: 'white',
    borderRadius: '10px',
    padding: '1.5rem',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s',
  },
  category: { backgroundColor: '#1a1a2e', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem' },
  title: { margin: '0.8rem 0 0.4rem', color: '#1a1a2e' },
  location: { color: '#666', fontSize: '0.9rem' },
  date: { color: '#666', fontSize: '0.9rem' },
  price: { color: '#e94560', fontWeight: 'bold', marginTop: '0.5rem' },
  empty: { color: '#666' }
}

export default Home