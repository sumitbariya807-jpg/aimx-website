import { useState, useEffect, useRef } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import Layout from './Layout.jsx'
import './App.css'
import { postRegistration, getRegistrations, getRegistrationById, updateRegistrationStatus, adminLogin, adminLogout, downloadParticipantsExcel } from './api.js'

const eventsData = [
  { id: 1, name: 'Vice City Visuals', subname: 'UI/UX Battle', startTime: '11:00', endTime: '12:30', location: 'Classroom 4.8', category: 'Technical', icon: '🎨', head: { name: 'Bhagyesh Pandey', phone: '9075930985' } },
  { id: 2, name: 'Mission Backtrack', subname: 'Output to Input', startTime: '14:00', endTime: '15:00', location: 'Lab 3', category: 'Technical', icon: '🔍', head: { name: 'Dighita Yerunkar', phone: '9321781602' } },
  { id: 3, name: 'Hack Wanted', subname: 'Hackathon', startTime: '09:00', endTime: '15:00', location: '2nd Floor Lab', category: 'Technical', icon: '💻', head: { name: 'Aman Tripathi', phone: '8303026772' } },
  { id: 4, name: 'Startup Syndicate', subname: 'Shark Tank', startTime: '14:00', endTime: '16:00', location: 'Seminar Hall', category: 'Technical', icon: '🦈', head: { name: 'Garima Joshi', phone: '9356063809' } },
  { id: 5, name: 'City Groove', subname: 'Dance', startTime: '17:00', endTime: '18:30', location: 'Atrium', category: 'Cultural', icon: '💃', head: { name: 'Akanksha Sawant', phone: '8591237321' } },
  { id: 6, name: 'Fashion Heist', subname: 'Fashion Show', startTime: '16:00', endTime: '17:30', location: 'Auditorium', category: 'Cultural', icon: '👗', head: { name: 'Priya Sharma', phone: '9876543210' } },
  { id: 7, name: 'Urban Warfare', subname: 'Valorant Tournament', startTime: '10:00', endTime: '14:00', location: 'Gaming Zone', category: 'E-Sports', icon: '🎮', head: { name: 'Fahim Shaikh', phone: '8765432109' } },
  { id: 8, name: 'Street Fighter Showdown', subname: 'Retro Gaming', startTime: '15:00', endTime: '17:00', location: 'Arcade Zone', category: 'E-Sports', icon: '👊', head: { name: 'Rohan Desai', phone: '7654321098' } },
  { id: 9, name: 'The Grand Heist', subname: 'Treasure Hunt', startTime: '12:30', endTime: '14:00', location: 'Library, Canteen, 3rd & 4th Floor', category: 'Indoor', icon: '🗺️', head: { name: 'Amey Gawade', phone: '7900014084' } }
]

const eventPrices = { 1: 100, 2: 100, 3: 300, 4: 200, 5: 150, 6: 200, 7: 400, 8: 50, 9: 150 }

// Floating Particles Component
function Particles() {
  const particles = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 5, 
    duration: 10 + Math.random() * 10,
    size: 3 + Math.random() * 4,
    color: ['#FF6B35', '#FF1493', '#00D4FF', '#FFE500'][Math.floor(Math.random() * 4)]
  }))

  return (
    <div className="hero-particles">
      {particles.map(p => (
        <div
          key={p.id}
          className="particle"
          style={{
            left: `${p.left}%`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            width: p.size,
            height: p.size,
            background: p.color,
            boxShadow: `0 0 10px ${p.color}`
          }}
        />
      ))}
    </div>
  )
}

function Navbar() {
  return (
    <nav className="navbar">

      <Link to="/" className="navbar-logo">
        AIMX
      </Link>

      <div className="navbar-links">
        <Link to="/">Home</Link>
        <Link to="/events">Events</Link>
        <Link to="/schedule">Schedule</Link>
        <Link to="/register">Register</Link>
        <Link to="/login">Login</Link>
      </div>

    </nav>
  )
}

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>AIMX 2026</h3>
          <p>Rule the Code, Own the City</p>
          <p>The biggest tech fest of Borivali</p>
        </div>
        <div className="footer-section">
          <h3>Quick Links</h3>
          <Link to="/">Home</Link>
          <Link to="/events">Events</Link>
          <Link to="/schedule">Schedule</Link>
          <Link to="/register">Register</Link>
        </div>
        <div className="footer-section">
          <h3>Contact</h3>
          <p>📍 Aditya Institute of Management Studies and Research</p>
          <p>📞 +91 8070123440 Vishwajit</p>
          <p>✉️ infoaimx2026@gmail.com</p>
        </div>
        <div className="footer-section">
          <h3>Follow Us</h3>
          <a href="https://www.instagram.com/mca.aimsr/" target="_blank" rel="noopener noreferrer" className="social-link">
            <span style={{fontSize: '1.5rem'}}>📸</span> @mca.aimsr
          </a>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2026 AIMX. Made with ❤️ in Mumbai</p>
      </div>
    </footer>
  )
}

// LoadingSpinner, ScrollReveal, Home, Events, Schedule (unchanged from original clean code)
function LoadingSpinner() {
  const [loadingText, setLoadingText] = useState('VICE CITY')
  const [loadingPercent, setLoadingPercent] = useState(0)
  const loadingMessages = ['VICE CITY', 'LOADING...', 'ASSETS OK', 'SCANLINES', 'GLITCH TEST', 'MATRIX READY', 'READY TO ROCK']

  useEffect(() => {
    const percentInterval = setInterval(() => {
      setLoadingPercent(prev => {
        if (prev >= 100) return 100
        return prev + Math.random() * 8
      })
    }, 120)

    const textInterval = setInterval(() => {
      setLoadingText(prev => {
        const currentIndex = loadingMessages.indexOf(prev)
        const nextIndex = (currentIndex + 1) % loadingMessages.length
        return loadingMessages[nextIndex]
      })
    }, 600)

    return () => {
      clearInterval(percentInterval)
      clearInterval(textInterval)
    }
  }, [])

  return (
    <div className="loading-container">
      <div className="crt-scanlines"></div>
      <div className="matrix-rain">
        {Array.from({length: 50}, (_, i) => (
          <div key={i} className="matrix-char" style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${3 + Math.random() * 4}s`
          }}>
            {String.fromCharCode(0x30A0 + Math.random() * 96)}
          </div>
        ))}
      </div>
      <div className="vice-city-loader">
        <div className="vc-logo glitch" data-text="VICE CITY">VICE CITY</div>
        <div className="loader-ring"></div>
        <div className="loading-progress">
          <div className="loading-progress-bar" style={{width: `${loadingPercent}%`}}></div>
        </div>
        <div className="loader-text">{loadingText} {Math.floor(loadingPercent)}%</div>
        <div className="loading-dots">
          <span></span><span></span><span></span>
        </div>
      </div>
    </div>
  )
}

function ScrollReveal({ children, className = '' }) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true)
        observer.unobserve(entry.target)
      }
    }, { threshold: 0.1 })

    if (ref.current) observer.observe(ref.current)

    return () => {
      if (ref.current) observer.unobserve(ref.current)
    }
  }, [])

  return (
    <div ref={ref} className={`section-reveal ${isVisible ? 'visible' : ''} ${className}`}>
      {children}
    </div>
  )
}

// Home, Events, Schedule components (unchanged, using clean original logic)
function Home() {
  return (
    <>
      <section className="hero">
        <Particles />
        <div style={{paddingTop: '150px', paddingBottom: '100px'}}>
          <h1 className="hero-title">AIMX</h1>
          <p className="hero-subtitle">RULE THE CODE • OWN THE CITY</p>
          <div className="hero-buttons">
            <Link to="/register" className="btn btn-primary">Register Now</Link>
            <Link to="/events" className="btn btn-neon">Explore Events</Link>
          </div>
        </div>
      </section>
      
      <section className="section">
        <ScrollReveal>
          <h2 className="section-title">About AIMX</h2>
          <div className="about-content">
            <div className="about-text">
              <h3>Welcome to AIMX 2026</h3>
              <p>The biggest tech fest organized by AIMSR. Join us on 27th March 2026 for an unforgettable experience.</p>
            </div>
            <div className="about-stats">
              <div className="stat-card"><div className="stat-number">9</div><div className="stat-label">Events</div></div>
              <div className="stat-card"><div className="stat-number">15+</div><div className="stat-label">Colleges</div></div>
              <div className="stat-card"><div className="stat-number">200+</div><div className="stat-label">Participants</div></div>
              <div className="stat-card"><div className="stat-number">🏆</div><div className="stat-label">Prizes</div></div>
            </div>
          </div>
        </ScrollReveal>
      </section>
      
      <section className="section">
        <ScrollReveal>
          <h2 className="section-title">Event Categories</h2>
          <div className="categories-grid">
            <Link to="/events?cat=Technical" className="category-card"><div className="category-icon">💻</div><h3>Technical</h3><p>4 Events</p></Link>
            <Link to="/events?cat=Cultural" className="category-card"><div className="category-icon">🎭</div><h3>Cultural</h3><p>2 Events</p></Link>
            <Link to="/events?cat=E-Sports" className="category-card"><div className="category-icon">🎮</div><h3>E-Sports</h3><p>2 Events</p></Link>
            <Link to="/events?cat=Indoor" className="category-card"><div className="category-icon">🗺️</div><h3>Indoor</h3><p>1 Event</p></Link>
          </div>
        </ScrollReveal>
      </section>
    </>
  )
}

function Events() {
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  
  const displayEvents = eventsData.filter(event => {
    const matchesFilter = filter === 'all' || event.category === filter
    const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          event.subname.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })
  
  return (
    <section className="section" style={{paddingTop: '120px'}}>
      <ScrollReveal>
        <h1 className="section-title">Events</h1>
        <div className="search-bar">
          <input type="text" placeholder="Search events..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="search-input" />
        </div>
        <div className="events-filter">
          <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All</button>
          <button className={`filter-btn ${filter === 'Technical' ? 'active' : ''}`} onClick={() => setFilter('Technical')}>Technical</button>
          <button className={`filter-btn ${filter === 'Cultural' ? 'active' : ''}`} onClick={() => setFilter('Cultural')}>Cultural</button>
          <button className={`filter-btn ${filter === 'E-Sports' ? 'active' : ''}`} onClick={() => setFilter('E-Sports')}>E-Sports</button>
          <button className={`filter-btn ${filter === 'Indoor' ? 'active' : ''}`} onClick={() => setFilter('Indoor')}>Indoor</button>
        </div>
      </ScrollReveal>
      
      <div className="events-grid">
        {displayEvents.map((event) => (
          <ScrollReveal key={event.id}>
            <div className="mission-card">
              <div className="mission-card-header">
                <span className="mission-icon">{event.icon}</span>
                <span className="mission-type">{event.category}</span>
              </div>
              <div className="mission-card-body">
                <h3 className="mission-title">{event.name}</h3>
                <p className="mission-subtitle">{event.subname}</p>
                <div className="mission-details">
                  <p>🕐 {event.startTime} - {event.endTime}</p>
                  <p>📍 {event.location}</p>
                </div>
              </div>
              <div className="mission-coordinators">
                <div className="coordinator-section">
                  <span className="coord-label">👤 Event Head</span>
                  <p className="coord-name">{event.head.name}</p>
                  <div className="coord-actions">
                    <button className="coord-btn call-btn" onClick={() => window.location.href = `tel:${event.head.phone}`}>📞 Call</button>
                    <a href={`https://wa.me/${event.head.phone}`} target="_blank" rel="noopener noreferrer" className="coord-btn wa-btn">💬 WhatsApp</a>
                  </div>
                </div>
              </div>
              <Link to={`/register?event=${event.id}`} className="mission-register-btn">Register Now</Link>
            </div>
          </ScrollReveal>
        ))}
      </div>
      {displayEvents.length === 0 && <p className="no-events">No events found matching your search.</p>}
    </section>
  )
}

function Schedule() {
  return (
    <section className="section" style={{paddingTop: '120px'}}>
      <ScrollReveal>
        <h1 className="section-title">Schedule</h1>
        <p style={{textAlign: 'center', marginBottom: '40px', color: 'rgba(255,255,255,0.7)'}}>27th March 2026</p>
      </ScrollReveal>
      
      <div className="schedule-timeline">
        {eventsData.map((event, index) => (
          <ScrollReveal key={index}>
            <div className="schedule-item">
              <div className="schedule-content">
                <span className="schedule-day">{event.startTime} - {event.endTime}</span>
                <h3 className="schedule-event">{event.icon} {event.name}</h3>
                <span className="schedule-category">{event.category}</span>
                <p className="schedule-location">📍 {event.location}</p>
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  )
}

// Registration - API Integrated
function Registration() {
  const [formData, setFormData] = useState({name: '', email: '', phone: '', college: 'AIMSR', event: '', teamName: '', transactionId: ''})
  const [submitted, setSubmitted] = useState(false)
  const [participantId, setParticipantId] = useState('')
  const [screenshot, setScreenshot] = useState(null)
  const [screenshotPreview, setScreenshotPreview] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  
  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'transactionId') {
      const numericValue = value.replace(/[^0-9]/g, '').slice(0, 12)
      setFormData({...formData, [name]: numericValue})
    } else {
      setFormData({...formData, [name]: value})
    }
  }
  
  const handleFileSelect = (file) => {
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB!')
      return
    }
    setScreenshot(file)
    const reader = new FileReader()
    reader.onloadend = () => setScreenshotPreview(reader.result)
    reader.readAsDataURL(file)
  }
  
  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file?.type.startsWith('image/')) handleFileSelect(file)
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.transactionId || formData.transactionId.length !== 12) {
      alert('Transaction ID must be exactly 12 digits!')
      return
    }
    if (!screenshot) {
      alert('Please upload payment screenshot!')
      return
    }
    
    setLoading(true)
    setError('')
    
    const id = 'AIMX-' + Math.floor(Math.random() * 900 + 100)
    const selectedEvent = eventsData.find(ev => ev.id === parseInt(formData.event))
    
    const newRegistration = {
      id,
      participantId: id,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      college: formData.college,
      eventId: formData.event,
      eventName: selectedEvent?.name || '',
      eventSubname: selectedEvent?.subname || '',
      teamName: formData.teamName,
      transactionId: formData.transactionId,
      amount: selectedEvent ? eventPrices[selectedEvent.id] : 0,
      status: 'pending',
      screenshot: screenshotPreview,
      date: new Date().toLocaleDateString()
    }
    
    try {
      // Try API first
      await postRegistration(newRegistration)
      setParticipantId(id)
      setSubmitted(true)
      alert('✅ Registration successful! Check your email.')
    } catch (err) {
      console.error('API failed:', err)
      // Fallback localStorage
      const existingRegs = JSON.parse(localStorage.getItem('aimx_registrations') || '[]')
      const updatedRegs = [...existingRegs, newRegistration]
      localStorage.setItem('aimx_registrations', JSON.stringify(updatedRegs))
      setParticipantId(id)
      setSubmitted(true)
      alert('✅ Registration saved locally (API unavailable).')
    } finally {
      setLoading(false)
    }
  }
  
  if (submitted) {
    return (
      <section className="section" style={{paddingTop: '120px'}}>
        <ScrollReveal>
          <div className="success-card">
            <h2>Registration Successful!</h2>
            <div className="participant-id">{participantId}</div>
            <p>Status: <span style={{color: '#FFC107', fontWeight: 'bold'}}>PENDING</span></p>
            <button className="btn btn-primary" onClick={() => navigate('/login')}>Check Status</button>
          </div>
        </ScrollReveal>
      </section>
    )
  }
  
  return (
    <section className="section" style={{paddingTop: '120px'}}>
      <ScrollReveal>
        <div className="registration-container">
          <form className="registration-form" onSubmit={handleSubmit}>
            <h2 className="form-title">Register for AIMX 2026</h2>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input type="text" name="name" className="form-input" value={formData.name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input type="email" name="email" className="form-input" value={formData.email} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Mobile No *</label>
                <input
                  type="tel"
                  name="phone"
                  className="form-input"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter 10-digit mobile number"
                  pattern="[0-9]{10}"
                  maxLength="10"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Event Name *</label>
                <select
                  name="event"
                  className="form-input"
                  value={formData.event}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Event</option>
                  {eventsData.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.name} ({event.subname}) - ₹{eventPrices[event.id]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Team Name</label>
                <input
                  type="text"
                  name="teamName"
                  className="form-input"
                  value={formData.teamName}
                  onChange={handleChange}
                  placeholder="Enter team name (if applicable)"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Transaction ID *</label>
                <input
                  type="text"
                  name="transactionId"
                  className="form-input"
                  value={formData.transactionId}
                  onChange={handleChange}
                  placeholder="Enter 12-digit transaction ID"
                  maxLength="12"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Transaction Screenshot *</label>
              <div
                className={`upload-dropbox ${isDragging ? 'dragging' : ''}`}
                onDragOver={(e) => {
                  e.preventDefault()
                  setIsDragging(true)
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => document.getElementById('screenshotInput')?.click()}
              >
                {screenshotPreview ? (
                  <div className="upload-preview">
                    <img src={screenshotPreview} alt="Transaction screenshot preview" className="preview-image" />
                    <p>Click or drop another screenshot to replace</p>
                  </div>
                ) : (
                  <div className="upload-placeholder">
                    <p>Drop transaction screenshot here or click to upload</p>
                    <small>PNG, JPG, JPEG up to 5MB</small>
                  </div>
                )}
              </div>
              <input
                id="screenshotInput"
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileSelect(file)
                }}
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Registration'}
            </button>
          </form>
        </div>
      </ScrollReveal>
    </section>
  )
}

// Login, ParticipantDashboard, AdminDashboard - API integrated similarly
function Login() {
  const [loginType, setLoginType] = useState('participant')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [participantId, setParticipantId] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  
  const handleAdminLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await adminLogin(username, password)
      localStorage.setItem('adminAuth', 'true')
      navigate('/admin')
    } catch {
      setError('Invalid admin credentials!')
    } finally {
      setLoading(false)
    }
  }
  
  const handleParticipantLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const reg = await getRegistrationById(participantId.trim())
      if (reg) {
        localStorage.setItem('participantAuth', reg.participantId)
        navigate('/participant')
      } else {
        setError('Invalid Participant ID!')
      }
    } catch {
      setError('API error - check connection')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <section className="section login-page" style={{paddingTop: '120px'}}>
      <ScrollReveal>
        <div className="registration-container">
          <div className="registration-form">
            <h2 className="form-title">Login Portal</h2>

            <div className="events-filter" style={{ marginBottom: '30px' }}>
              <button className={`filter-btn ${loginType === 'participant' ? 'active' : ''}`} onClick={() => setLoginType('participant')}>Participant Login</button>
              <button className={`filter-btn ${loginType === 'admin' ? 'active' : ''}`} onClick={() => setLoginType('admin')}>Admin Login</button>
            </div>

            {error && <p style={{ color: '#ff8080', marginBottom: '16px', textAlign: 'center' }}>{error}</p>}

            {loginType === 'participant' ? (
              <form onSubmit={handleParticipantLogin}>
                <div className="form-group">
                  <label className="form-label">Participant ID</label>
                  <input className="form-input" value={participantId} onChange={(e) => setParticipantId(e.target.value)} placeholder="e.g. AIMX-123" required />
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Checking...' : 'Login as Participant'}</button>
              </form>
            ) : (
              <form onSubmit={handleAdminLogin} className="admin-login-form">
                <div className="admin-login-head">
                  <div className="admin-shield">🛡️</div>
                  <div>
                    <h3 className="admin-login-title">Admin Control Access</h3>
                    <p className="admin-login-subtitle">Authorized personnel only</p>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Admin Username</label>
                  <input className="form-input admin-input" value={username} onChange={(e) => setUsername(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Admin Password</label>
                  <input className="form-input admin-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <button type="submit" className="btn btn-primary admin-login-btn" disabled={loading}>{loading ? 'Logging in...' : 'Login as Admin'}</button>
              </form>
            )}
          </div>
        </div>
      </ScrollReveal>
    </section>
  )
}

function ParticipantDashboard() {
  const [participant, setParticipant] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const load = async () => {
      const id = localStorage.getItem('participantAuth')
      if (!id) {
        navigate('/login')
        return
      }
      const data = await getRegistrationById(id)
      if (!data) {
        localStorage.removeItem('participantAuth')
        navigate('/login')
        return
      }
      setParticipant(data)
      setLoading(false)
    }
    load()
  }, [navigate])

  if (loading) return <section className="section" style={{paddingTop: '120px'}}><p>Loading...</p></section>

  const statusClass = participant?.status === 'approved'
    ? 'approved'
    : participant?.status === 'rejected'
      ? 'rejected'
      : 'pending'

  return (
    <section className="section participant-page" style={{paddingTop: '120px'}}>
      <ScrollReveal>
        <div className="participant-dashboard-card">
          <div className="participant-dashboard-header">
            <h2>Participant Dashboard</h2>
            <span className={`status-badge ${statusClass}`}>{String(participant.status || 'pending').toUpperCase()}</span>
          </div>

          <div className="participant-id">{participant.participantId}</div>

          <div className="participant-details-grid">
            <div className="participant-detail-item"><span>Full Name</span><strong>{participant.name || '-'}</strong></div>
            <div className="participant-detail-item"><span>Email</span><strong>{participant.email || '-'}</strong></div>
            <div className="participant-detail-item"><span>Mobile</span><strong>{participant.phone || '-'}</strong></div>
            <div className="participant-detail-item"><span>College</span><strong>{participant.college || 'AIMSR'}</strong></div>
            <div className="participant-detail-item"><span>Event</span><strong>{participant.eventName || '-'} {participant.eventSubname ? `- ${participant.eventSubname}` : ''}</strong></div>
            <div className="participant-detail-item"><span>Team Name</span><strong>{participant.teamName || '-'}</strong></div>
            <div className="participant-detail-item"><span>Transaction ID</span><strong>{participant.transactionId || '-'}</strong></div>
            <div className="participant-detail-item"><span>Amount Paid</span><strong>₹{participant.amount ?? 0}</strong></div>
            <div className="participant-detail-item"><span>Registration Date</span><strong>{participant.date || '-'}</strong></div>
          </div>

          {participant.screenshot && (
            <div className="participant-screenshot-wrap">
              <h3>Payment Screenshot</h3>
              <img src={participant.screenshot} alt="Payment screenshot" className="participant-screenshot-image" />
              <a className="mission-register-btn" href={participant.screenshot} download={`txn-${participant.participantId}.png`}>
                Download Screenshot
              </a>
            </div>
          )}

          <div className="participant-dashboard-actions">
            <button className="btn btn-neon" onClick={() => { localStorage.removeItem('participantAuth'); navigate('/login') }}>
              Logout
            </button>
          </div>
        </div>
      </ScrollReveal>
    </section>
  )
}

function AdminDashboard() {
  const [participants, setParticipants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const loadParticipants = async () => {
    try {
      const data = await getRegistrations()
      setParticipants(data)
    } catch {
      setError('Failed to load participants. Please login again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!localStorage.getItem('adminAuth')) {
      navigate('/login')
      return
    }
    loadParticipants()
  }, [navigate])

  const handleStatus = async (participantId, status) => {
    try {
      await updateRegistrationStatus(participantId, status)
      await loadParticipants()
    } catch {
      alert('Failed to update status')
    }
  }

  const handleAdminLogout = () => {
    localStorage.removeItem('adminAuth')
    adminLogout()
    navigate('/login')
  }

  // Compute stats
  const stats = participants.reduce((acc, p) => {
    const status = p.status || 'pending'
    acc[status] = (acc[status] || 0) + 1
    acc.total += 1
    return acc
  }, {pending: 0, approved: 0, rejected: 0, total: 0})

  if (loading) return <section className="section admin-panel-section" style={{paddingTop: '120px'}}><p>Loading admin panel...</p></section>

  return (
<section className="section admin-panel-section" style={{paddingTop: '120px'}}>
      <ScrollReveal>
        <h1 className="section-title admin-header">Admin Panel</h1>
        <div className="admin-stats-grid">
          <div className="stat-card admin-stat pending">
            <div className="stat-number">{stats.pending}</div>
            <div className="stat-label">Pending</div>
          </div>
          <div className="stat-card admin-stat approved">
            <div className="stat-number">{stats.approved}</div>
            <div className="stat-label">Approved</div>
          </div>
          <div className="stat-card admin-stat rejected">
            <div className="stat-number">{stats.rejected}</div>
            <div className="stat-label">Rejected</div>
          </div>
          <div className="stat-card admin-stat total">
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">Total</div>
          </div>
        </div>

        {error && <p style={{ color: '#ff8080', marginBottom: '12px' }}>{error}</p>}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={downloadParticipantsExcel}>Download Excel</button>
          <button className="btn btn-neon" onClick={handleAdminLogout}>Logout</button>
        </div>
        <div className="events-grid">
          {participants.map((p) => (
            <div className="mission-card" key={p.participantId}>
              <div className="mission-card-body">
                <h3 className="mission-title">{p.name}</h3>
                <p className="mission-subtitle">{p.participantId}</p>
                <p>📧 {p.email}</p>
                <p>📱 {p.phone}</p>
                <p>🎯 {p.eventName} - {p.eventSubname}</p>
                <p>💰 ₹{p.amount}</p>
                <p>Status: <strong>{p.status.toUpperCase()}</strong></p>
                {p.screenshot && <a className="mission-register-btn" href={p.screenshot} download={`txn-${p.participantId}.png`}>Download Screenshot</a>}
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                  <button className="btn btn-primary" onClick={() => handleStatus(p.participantId, 'approved')}>Approve</button>
                  <button className="btn btn-neon" onClick={() => handleStatus(p.participantId, 'rejected')}>Reject</button>
                  <button className="btn" style={{background: '#dc3545', borderColor: '#dc3545', color: 'white'}} onClick={async () => {
                    if (confirm(`Delete ${p.name} (${p.participantId})?`)) {
                      try {
                        await deleteRegistration(p.participantId);
                        await loadParticipants();
                      } catch {
                        alert('Delete failed');
                      }
                    }
                  }}>🗑️ Delete</button>
                </div>

              </div>
            </div>
          ))}
        </div>
      </ScrollReveal>
    </section>
  )
}

function App() {
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2500)
    return () => clearTimeout(timer)
  }, [])
  
  return (
    <Router>
      {loading && <LoadingSpinner />}
      <div className={loading ? 'app-content hidden' : 'app-content'}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="events" element={<Events />} />
            <Route path="schedule" element={<Schedule />} />
            <Route path="register" element={<Registration />} />
            <Route path="login" element={<Login />} />
            <Route path="participant" element={<ParticipantDashboard />} />
            <Route path="admin" element={<AdminDashboard />} />
          </Route>
        </Routes>
      </div>
    </Router>
  )
}

export default App
