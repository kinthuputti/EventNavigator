import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

function Admin() {
  const [events, setEvents] = useState([])
  const [form, setForm] = useState({
    title: '', description: '', location: '',
    dateTime: '', category: '', maxAttendees: '',
    price: '', status: 'UPCOMING', latitude: '', longitude: ''
  })
  const [message, setMessage] = useState('')
  const [editId, setEditId] = useState(null)
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  useEffect(() => {
    if (!token) { navigate('/login'); return }
    fetchEvents()
  }, [])

  const fetchEvents = () => {
    axios.get('https://eventnavigator-production.up.railway.app/events')
      .then(res => setEvents(res.data))
  }

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    try {
      const payload = {
        ...form,
        maxAttendees: parseInt(form.maxAttendees),
        price: parseFloat(form.price),
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
      }

      if (editId) {
        await axios.put(`https://eventnavigator-production.up.railway.app/events/${editId}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setMessage('Event updated successfully!')
        setEditId(null)
      } else {
        await axios.post('https://eventnavigator-production.up.railway.app/events', payload, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setMessage('Event created successfully!')
      }
      setForm({
        title: '', description: '', location: '',
        dateTime: '', category: '', maxAttendees: '',
        price: '', status: 'UPCOMING', latitude: '', longitude: ''
      })
      fetchEvents()
    } catch (err) {
      setMessage('Failed. Make sure you are logged in as admin.')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return
    try {
      await axios.delete(`https://eventnavigator-production.up.railway.app/events/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMessage('Event deleted!')
      fetchEvents()
    } catch {
      setMessage('Failed to delete event.')
    }
  }

  const handleEdit = (event) => {
    setEditId(event.id)
    setForm({
      title: event.title,
      description: event.description,
      location: event.location,
      dateTime: event.dateTime,
      category: event.category,
      maxAttendees: event.maxAttendees,
      price: event.price,
      status: event.status,
      latitude: event.latitude,
      longitude: event.longitude
    })
    window.scrollTo(0, 0)
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Admin Panel</h1>

      <div style={styles.form}>
        <h2 style={styles.formHeading}>{editId ? 'Edit Event' : 'Create New Event'}</h2>
        {message && <p style={styles.message}>{message}</p>}
        <div style={styles.grid}>
          <input style={styles.input} name="title" placeholder="Title" value={form.title} onChange={handleChange} />
          <input style={styles.input} name="category" placeholder="Category" value={form.category} onChange={handleChange} />
          <input style={styles.input} name="location" placeholder="Location" value={form.location} onChange={handleChange} />
          <input style={styles.input} name="dateTime" placeholder="Date & Time (e.g. 2026-06-15T18:00:00)" value={form.dateTime} onChange={handleChange} />
          <input style={styles.input} name="maxAttendees" placeholder="Max Attendees" value={form.maxAttendees} onChange={handleChange} />
          <input style={styles.input} name="price" placeholder="Price (0 for free)" value={form.price} onChange={handleChange} />
          <input style={styles.input} name="latitude" placeholder="Latitude" value={form.latitude} onChange={handleChange} />
          <input style={styles.input} name="longitude" placeholder="Longitude" value={form.longitude} onChange={handleChange} />
          <select style={styles.input} name="status" value={form.status} onChange={handleChange}>
            <option value="UPCOMING">UPCOMING</option>
            <option value="ONGOING">ONGOING</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>
        <textarea
          style={styles.textarea}
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
        />
        <button style={styles.button} onClick={handleSubmit}>
          {editId ? 'Update Event' : 'Create Event'}
        </button>
        {editId && (
          <button style={styles.cancelButton} onClick={() => {
            setEditId(null)
            setForm({
              title: '', description: '', location: '',
              dateTime: '', category: '', maxAttendees: '',
              price: '', status: 'UPCOMING', latitude: '', longitude: ''
            })
          }}>
            Cancel Edit
          </button>
        )}
      </div>

      <h2 style={styles.formHeading}>All Events</h2>
      <div style={styles.eventList}>
        {events.map(event => (
          <div key={event.id} style={styles.eventCard}>
            <div>
              <h3 style={styles.eventTitle}>{event.title}</h3>
              <p style={styles.eventMeta}>📍 {event.location} | 👥 {event.currentAttendees}/{event.maxAttendees} | {event.status}</p>
            </div>
            <div style={styles.actions}>
              <button style={styles.editButton} onClick={() => handleEdit(event)}>Edit</button>
              <button style={styles.deleteButton} onClick={() => handleDelete(event.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const styles = {
  container: { padding: '2rem', backgroundColor: '#f5f5f5', minHeight: '100vh' },
  heading: { color: '#1a1a2e', fontSize: '2rem' },
  form: { backgroundColor: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '2rem' },
  formHeading: { color: '#1a1a2e', marginBottom: '1rem' },
  message: { color: '#e94560', fontWeight: 'bold' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1rem' },
  input: { padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem', width: '100%' },
  textarea: { width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem', minHeight: '100px', marginBottom: '1rem', boxSizing: 'border-box' },
  button: { padding: '0.9rem 2rem', backgroundColor: '#1a1a2e', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer', marginRight: '1rem' },
  cancelButton: { padding: '0.9rem 2rem', backgroundColor: '#666', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer' },
  eventList: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  eventCard: { backgroundColor: 'white', borderRadius: '10px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  eventTitle: { color: '#1a1a2e', margin: '0 0 0.3rem' },
  eventMeta: { color: '#666', fontSize: '0.9rem', margin: 0 },
  actions: { display: 'flex', gap: '0.5rem' },
  editButton: { padding: '0.5rem 1rem', backgroundColor: '#1a1a2e', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' },
  deleteButton: { padding: '0.5rem 1rem', backgroundColor: '#e94560', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' },
}

export default Admin