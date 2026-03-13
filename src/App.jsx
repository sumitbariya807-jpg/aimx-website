import { useState, useEffect, useRef } from 'react'
import { HashRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom'
import './App.css'
import { sendConfirmationEmail, sendStatusUpdateEmail } from './useEmail.js'

const eventsData = [
  { id: 1, name: 'Vice City Visuals', subname: 'UI/UX Battle', startTime: '11:00', endTime: '12:30', location: 'Classroom 4.8', category: 'Technical', icon: '🎨', head: { name: 'Bhagyesh Pandey', phone: '9075930985' } },
  { id: 2, name: 'Mission Backtrack', subname: 'Output to Input', startTime: '14:00', endTime: '15:00', location: 'Lab 3', category: 'Technical', icon: '🔍', head: { name: 'Dighita Yerunkar', phone: '9321781602' } },
  { id: 3, name: 'Hack Wanted', subname: 'Hackathon', startTime: '09:00', endTime: '15:00', location: '2nd Floor Lab', category: 'Technical', icon: '💻', head: { name: 'Aman Tripathi', phone: '8303026772' } },
  { id: 4, name: 'Startup Syndicate', subname: 'Shark Tank', startTime: '14:00', endTime: '16:00', location: 'Seminar Hall', category: 'Technical', icon: '🦈', head: { name: 'Garima Joshi', phone: '9356063809' } },
  { id: 5, name: 'City Groove', subname: 'Dance', startTime: '17:00', endTime: '18:30', location: 'Atrium', category: 'Cultural', icon: '💃', head: { name: 'Akanksha Sawant', phone: '8591237321' } },
  { id: 6, name: 'Urban Strut', subname: 'Fashion Show', startTime: '18:30', endTime: '19:00', location: 'Atrium', category: 'Cultural', icon: '👗', head: { name: 'Revati Relekar', phone: '8433564689' } },
  { id: 7, name: 'Urban Warfare', subname: 'BGMI', startTime: '13:00', endTime: '15:30', location: 'Classroom 4.4', category: 'E-Sports', icon: '🎮', head: { name: 'Soham Tambade', phone: '8356054488' } },
  { id: 8, name: 'Chaos in the Streets', subname: 'Stumble Guys', startTime: '14:00', endTime: '15:00', location: 'Classroom 4.2', category: 'E-Sports', icon: '🏃', head: { name: 'Fahim Shaikh', phone: '8291644980' } },
  { id: 9, name: 'The Grand Heist', subname: 'Treasure Hunt', startTime: '12:30', endTime: '14:00', location: 'Library, Canteen, 3rd & 4th Floor', category: 'Indoor', icon: '🗺️', head: { name: 'Amey Gawade', phone: '7900014084' } }
]

const eventPrices = { 1: 150, 2: 100, 3: 300, 4: 200, 5: 150, 6: 200, 7: 400, 8: 50, 9: 150 }

// Floating Particles Component
function Particles() {
  const particles = Array.from({ length: 8 }, (_, i) => ({
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
<Link to="/" className="navbar-logo">AIMX <span></span></Link>
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

// Enhanced Loading Spinner with GTA Style
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

  const generateMatrixChars = () => {
    const chars = []
    for (let i = 0; i < 50; i++) {
      chars.push(
        <div
          key={i}
          className="matrix-char"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${3 + Math.random() * 4}s`,
            '--char': String.fromCharCode(0x30A0 + Math.random() * 96)
          }}
        >
          {String.fromCharCode(0x30A0 + Math.random() * 96)}
        </div>
      )
    }
    return chars
  }

  return (
    <div className="loading-container">
      <div className="crt-scanlines"></div>
      <div className="matrix-rain">
        {generateMatrixChars()}
      </div>
      <div className="vice-city-loader">
        <div className="vc-logo glitch" data-text="VICE CITY">VICE CITY</div>
        <div className="loader-ring" style={{animationDuration: '1s'}}></div>
        <div className="loading-progress">
          <div 
            className="loading-progress-bar" 
            style={{width: `${loadingPercent}%`}}
          ></div>
        </div>
        <div className="loader-text" style={{fontSize: '1.4rem'}}>
          {loadingText} {Math.floor(loadingPercent)}%
        </div>
        <div className="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  )
}

// Scroll Reveal Component
function ScrollReveal({ children, className = '' }) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(entry.target)
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [])

  return (
    <div ref={ref} className={`section-reveal ${isVisible ? 'visible' : ''} ${className}`}>
      {children}
    </div>
  )
}

function Home() {
  return (
    <>
      <section className="hero" style={{position: 'relative', zIndex: 2, backgroundImage: "url('/assets/gtahome3.png')", backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', opacity: 1, display: 'flex', flexDirection: 'column'}}>
        <Particles />

        <div style={{paddingTop: 'clamp(110px, 18vh, 160px)', paddingBottom: '100px', display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
          <h1 className="hero-title">AIMX</h1>
          <p className="hero-subtitle">RULE THE CODE • OWN THE CITY</p>
          <div className="hero-buttons">
            <Link to="/register" className="btn btn-primary">Register Now</Link>
            <Link to="/events" className="btn btn-neon">Explore Events</Link>
          </div>
        </div>
      </section>
      
      <section className="section" style={{position: 'relative', zIndex: 3}}>
        <ScrollReveal>
          <h2 className="section-title">About AIMX</h2>
          <div className="about-content">
            <div className="about-text">
              <h3>Welcome to AIMX 2026</h3>
              <p>The biggest tech fest organized by AIMSR. Join us on 27th March 2026 for an unforgettable experience of technology, creativity, and competition.</p>
              <p style={{marginTop: '15px', color: 'var(--neon-cyan)'}}>🎮 Welcome to the future of tech fests!</p>
            </div>
            <div className="about-stats">
              <div className="stat-card">
                <div className="stat-number">9</div>
                <div className="stat-label">Events</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">15+</div>
                <div className="stat-label">Colleges</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">200+</div>
                <div className="stat-label">Participants</div>
              </div>

              <div className="stat-card">

                <div className="stat-number">🏆</div>

                <div className="stat-label">Exciting Prizes</div>
              </div>

            </div>
          </div>
        </ScrollReveal>
      </section>
      
      <section className="section">
        <ScrollReveal>
          <h2 className="section-title">Event Categories</h2>
          <div className="categories-grid">
            <Link to="/events?cat=Technical" className="category-card">
              <div className="category-icon">💻</div>
              <h3 className="category-title">Technical</h3>
              <p className="category-count">4 Events</p>
            </Link>
            <Link to="/events?cat=Cultural" className="category-card">
              <div className="category-icon">🎭</div>
              <h3 className="category-title">Cultural</h3>
              <p className="category-count">2 Events</p>
            </Link>
            <Link to="/events?cat=E-Sports" className="category-card">
              <div className="category-icon">🎮</div>
              <h3 className="category-title">E-Sports</h3>
              <p className="category-count">2 Events</p>
            </Link>
            <Link to="/events?cat=Indoor" className="category-card">
              <div className="category-icon">🗺️</div>
              <h3 className="category-title">Indoor</h3>
              <p className="category-count">1 Event</p>
            </Link>
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
          <input 
            type="text" 
            placeholder="Search events..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="search-input" 
          />
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

function Registration() {
  const [formData, setFormData] = useState({name: '', email: '', phone: '', college: '', event: '', teamName: '', transactionId: ''})
  const [submitted, setSubmitted] = useState(false)
  const [participantId, setParticipantId] = useState('')
  const [screenshot, setScreenshot] = useState(null)
  const [screenshotPreview, setScreenshotPreview] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
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
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB!')
        return
      }
      setScreenshot(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setScreenshotPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }
  
  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      handleFileSelect(file)
    }
  }
  
  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true) }
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false) }
  const handleFileInput = (e) => { if (e.target.files[0]) handleFileSelect(e.target.files[0]) }
  const removeScreenshot = () => { setScreenshot(null); setScreenshotPreview(null) }
  
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
    
    const id = 'AIMX-' + Math.floor(Math.random() * 900 + 100)
    const selectedEvent = eventsData.find(ev => ev.id === parseInt(formData.event))
    
    const newRegistration = {
      id: id,
      participantId: id,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      college: formData.college,
      eventId: formData.event,
      eventName: selectedEvent ? selectedEvent.name : '',
      eventSubname: selectedEvent ? selectedEvent.subname : '',
      teamName: formData.teamName,
      transactionId: formData.transactionId,
      amount: selectedEvent ? eventPrices[selectedEvent.id] : 0,
      status: 'pending',
      screenshot: screenshotPreview,
      date: new Date().toLocaleDateString()
    }
    
    // Save to localStorage first
    const existingRegs = JSON.parse(localStorage.getItem('aimx_registrations') || '[]')
    const updatedRegs = [...existingRegs, newRegistration]
    localStorage.setItem('aimx_registrations', JSON.stringify(updatedRegs))
    
    // Send confirmation emails
    const emailSent = await sendConfirmationEmail(newRegistration)
    if (emailSent) {
      alert('✅ Registration successful! Confirmation email sent.')
    } else {
      console.warn('⚠️ Registration saved but email failed. Check EmailJS config.')
      alert('✅ Registration saved! (Email notification may have failed - check console)')
    }
    
    setParticipantId(id)
    setSubmitted(true)
  }
  
  const selectedEvent = eventsData.find(e => e.id === parseInt(formData.event))
  const eventFee = selectedEvent ? eventPrices[selectedEvent.id] : 0
  
  if (submitted) {
    return (
      <section className="section" style={{paddingTop: '120px', minHeight: '80vh'}}>
        <ScrollReveal>
          <div className="success-card">
            <h2>Registration Successful!</h2>
            <p>Your Participant ID:</p>
            <div className="participant-id">{participantId}</div>
            <p>Status: <span style={{color: '#FFC107', fontWeight: 'bold'}}>PENDING</span> - Waiting for admin approval</p>
            <p>Use this ID to check your registration status.</p>
            <button className="btn btn-primary" style={{marginTop: '20px'}} onClick={() => navigate('/login')}>Go to Login</button>
          </div>
        </ScrollReveal>
      </section>
    )
  }
  
  return (
    <section className="section events-page" style={{paddingTop: '120px'}}>
      <ScrollReveal>
        <div className="registration-container">
          <form className="registration-form" onSubmit={handleSubmit}>
            <h2 className="form-title">Register for AIMX 2026</h2>
            
            {/* Payment Information */}
            <div style={{
              background: 'rgba(255,107,53,0.1)', 
              border: '2px solid var(--neon-orange)', 
              borderRadius: '16px', 
              padding: '25px', 
              marginBottom: '30px'
            }}>
              <h3 style={{color: 'var(--neon-orange)', marginBottom: '18px', fontSize: '1.3rem', fontFamily: 'var(--font-display)', letterSpacing: '2px'}}>💳 Payment Information</h3>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '18px'}}>
                <div style={{background: 'rgba(0,0,0,0.3)', padding: '18px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)'}}>
                  <p style={{color: 'var(--neon-cyan)', fontSize: '0.9rem', marginBottom: '8px'}}>📱 UPI Payment</p>
                  <p style={{color: '#fff', fontSize: '1.15rem', fontWeight: 'bold'}}>ashutoshdp2003@okaxis</p>
                </div>
                <div style={{background: 'rgba(0,0,0,0.3)', padding: '18px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)'}}>
                  <p style={{color: 'var(--neon-cyan)', fontSize: '0.9rem', marginBottom: '8px'}}>🏦 Bank Transfer</p>
                  <p style={{color: '#fff', fontSize: '0.95rem'}}><strong>Acc No:</strong> 5346933814</p>
                  <p style={{color: '#fff', fontSize: '0.95rem'}}><strong>IFSC:</strong> KKBK0001465</p>
                </div>
              </div>
              {eventFee > 0 && (
                <div style={{background: 'rgba(0,212,255,0.1)', border: '2px solid var(--neon-cyan)', borderRadius: '12px', padding: '18px', marginTop: '18px', textAlign: 'center'}}>
                  <p style={{color: 'var(--neon-cyan)', fontSize: '1.1rem'}}>Event Fee: <strong style={{fontSize: '1.4rem'}}>₹{eventFee}</strong></p>
                </div>
              )}
            </div>
            
            <h3 style={{color: 'var(--neon-cyan)', marginBottom: '18px', fontFamily: 'var(--font-heading)', letterSpacing: '2px'}}>Personal Details</h3>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input type="text" name="name" className="form-input" placeholder="Enter your name" value={formData.name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input type="email" name="email" className="form-input" placeholder="Enter your email" value={formData.email} onChange={handleChange} required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Phone *</label>
                <input type="tel" name="phone" className="form-input" placeholder="Phone number" value={formData.phone} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">College *</label>
                <input type="text" name="college" className="form-input" placeholder="College name" value={formData.college} onChange={handleChange} required />
              </div>
            </div>
            
            <h3 style={{color: 'var(--neon-cyan)', marginBottom: '18px', marginTop: '25px', fontFamily: 'var(--font-heading)', letterSpacing: '2px'}}>Event Details</h3>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Select Event *</label>
                <select name="event" className="form-select" value={formData.event} onChange={handleChange} required>
                  <option value="">Choose event</option>
                  {eventsData.map(e => (
                    <option key={e.id} value={e.id}>{e.name} - {e.subname} (₹{eventPrices[e.id]})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Team Name (Optional)</label>
                <input type="text" name="teamName" className="form-input" placeholder="Team name" value={formData.teamName} onChange={handleChange} />
              </div>
            </div>
            
            <h3 style={{color: 'var(--neon-cyan)', marginBottom: '18px', marginTop: '25px', fontFamily: 'var(--font-heading)', letterSpacing: '2px'}}>💰 Payment Details (Mandatory)</h3>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Transaction ID * (12 digits)</label>
                <input type="text" name="transactionId" className="form-input" placeholder="Enter 12-digit transaction ID" value={formData.transactionId} onChange={handleChange} required maxLength={12} />
                <small style={{color: 'rgba(255,255,255,0.5)'}}>{formData.transactionId.length}/12 digits</small>
              </div>
            </div>
            
            <h3 style={{color: 'var(--neon-cyan)', marginBottom: '18px', marginTop: '25px', fontFamily: 'var(--font-heading)', letterSpacing: '2px'}}>📷 Payment Screenshot (Mandatory)</h3>
            <div 
              onDrop={handleDrop} 
              onDragOver={handleDragOver} 
              onDragLeave={handleDragLeave} 
              onClick={() => document.getElementById('screenshot-input').click()}
              style={{
                border: isDragging ? '2px dashed var(--neon-cyan)' : screenshotPreview ? '2px solid var(--neon-orange)' : '2px dashed rgba(255,255,255,0.2)', 
                borderRadius: '16px', 
                padding: screenshotPreview ? '15px' : '50px', 
                textAlign: 'center', 
                cursor: 'pointer', 
                background: isDragging ? 'rgba(0, 212, 255, 0.1)' : 'rgba(0,0,0,0.2)', 
                transition: 'all 0.3s ease', 
                marginBottom: '25px'
              }}
            >
              {screenshotPreview ? (
                <div style={{position: 'relative', display: 'inline-block'}}>
                  <img src={screenshotPreview} alt="Payment Screenshot" style={{maxWidth: '100%', maxHeight: '250px', borderRadius: '12px', border: '2px solid var(--neon-orange)'}} />
                  <button 
                    type="button" 
                    onClick={(e) => {e.stopPropagation(); removeScreenshot()}} 
                    style={{
                      position: 'absolute', 
                      top: '-12px', 
                      right: '-12px', 
                      background: '#ff4444', 
                      color: '#fff', 
                      border: 'none', 
                      borderRadius: '50%', 
                      width: '32px', 
                      height: '32px', 
                      cursor: 'pointer', 
                      fontWeight: 'bold',
                      fontSize: '1.2rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <>
                  <div style={{fontSize: '3.5rem', marginBottom: '15px'}}>📁</div>
                  <p style={{color: '#fff', marginBottom: '8px'}}>Drag & drop your payment screenshot here</p>
                  <p style={{color: 'rgba(255,255,255,0.5)', fontSize: '0.95rem'}}>OR</p>
                  <button type="button" className="btn" style={{fontSize: '0.95rem', padding: '10px 25px', marginTop: '10px'}}>Browse Files</button>
                </>
              )}
            </div>
            <input type="file" id="screenshot-input" accept="image/*" onChange={handleFileInput} style={{display: 'none'}} />
            
            <div style={{textAlign: 'center', marginTop: '35px'}}>
              <button type="submit" className="btn btn-primary" style={{fontSize: '1.2rem', padding: '18px 60px'}}>Submit Registration</button>
            </div>
          </form>
        </div>
      </ScrollReveal>
    </section>
  )
}

function Login() {
  const [loginType, setLoginType] = useState('participant')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [participantId, setParticipantId] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  
const handleAdminLogin = (e) => {
    e.preventDefault()
    if (username === 'adminaimx2026' && password === 'aimx@aimsr111') {
      localStorage.setItem('adminAuth', 'true')
      navigate('/admin')
    } else {
      setError('Invalid admin credentials!')
    }
  }
  
  const handleParticipantLogin = (e) => {
    e.preventDefault()
    const regs = JSON.parse(localStorage.getItem('aimx_registrations') || '[]')
    const reg = regs.find(r => r.participantId === participantId)
    if (reg) {
      localStorage.setItem('participantAuth', participantId)
      navigate('/participant')
    } else {
      setError('Invalid Participant ID!')
    }
  }
  
  return (
    <section className="section login-page" style={{paddingTop: '120px', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <ScrollReveal>
        <div className="registration-form" style={{maxWidth: '480px', width: '100%'}}>
          <h2 className="form-title">Login to AIMX 2026</h2>
          <div style={{display: 'flex', gap: '18px', marginBottom: '35px'}}>
            <button 
              type="button" 
              className={`btn ${loginType === 'participant' ? 'btn-primary' : ''}`} 
              style={{flex: 1}}
              onClick={() => {setLoginType('participant'); setError('')}}
            >
              Participant
            </button>
            <button 
              type="button" 
              className={`btn ${loginType === 'admin' ? 'btn-primary' : ''}`} 
              style={{flex: 1}}
              onClick={() => {setLoginType('admin'); setError('')}}
            >
              Admin
            </button>
          </div>
          
          {loginType === 'participant' ? (
            <form onSubmit={handleParticipantLogin}>
              <div className="form-group">
                <label className="form-label">Participant ID</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Enter your Participant ID" 
                  value={participantId} 
                  onChange={(e) => setParticipantId(e.target.value)} 
                  required 
                />
              </div>
              {error && <p style={{color: '#ff4444', marginBottom: '18px'}}>{error}</p>}
              <button type="submit" className="btn btn-neon" style={{width: '100%', marginTop: '20px'}}>Check Status</button>
              <p style={{textAlign: 'center', marginTop: '15px'}}>New user? <Link to="/register" style={{color: 'var(--neon-cyan)'}}>Register here</Link></p>
            </form>
          ) : (
            <form onSubmit={handleAdminLogin}>
              <div className="form-group">
                <label className="form-label">Username</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Enter username" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input 
                  type="password" 
                  className="form-input" 
                  placeholder="Enter password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                />
              </div>
              {error && <p style={{color: '#ff4444', marginBottom: '18px'}}>{error}</p>}
              <button type="submit" className="btn btn-neon" style={{width: '100%', marginTop: '20px'}}>Admin Login</button>
              <p style={{textAlign: 'center', marginTop: '22px', color: 'rgba(255,255,255,0.6)'}}>Demo: adminaimx2026 / aimx@aimsr111</p>
            </form>
          )}
        </div>
      </ScrollReveal>
    </section>
  )
}

function ParticipantDashboard() {
  const [participantId] = useState(() => localStorage.getItem('participantAuth'))
  const [registration, setRegistration] = useState(null)
  const navigate = useNavigate()
  
  useEffect(() => {
    if (!participantId) {
      navigate('/login')
      return
    }
    const regs = JSON.parse(localStorage.getItem('aimx_registrations') || '[]')
    const reg = regs.find(r => r.participantId === participantId)
    setRegistration(reg)
  }, [participantId, navigate])
  
  const handleLogout = () => {
    localStorage.removeItem('participantAuth')
    navigate('/login')
  }
  
  if (!registration) {
    return (
      <section className="section" style={{paddingTop: '120px'}}>
        <ScrollReveal>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px'}}>
            <h1 className="section-title" style={{marginBottom: 0}}>My Registration</h1>
            <button className="btn" onClick={handleLogout}>Logout</button>
          </div>
          <div className="success-card">
            <h2>Welcome!</h2>
            <p>Your Participant ID: {participantId}</p>
            <p style={{color: '#ff4444'}}>No registration found!</p>
          </div>
        </ScrollReveal>
      </section>
    )
  }
  
  const getStatusColor = (status) => {
    if (status === 'approved') return '#39FF14'
    if (status === 'rejected') return '#FF0000'
    return '#FFC107'
  }
  
  return (
    <section className="section" style={{paddingTop: '120px'}}>
      <ScrollReveal>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px'}}>
          <h1 className="section-title" style={{marginBottom: 0}}>My Registration</h1>
          <button className="btn" onClick={handleLogout}>Logout</button>
        </div>
        <div className="success-card">
          <h2>Welcome, {registration.name}!</h2>
          <p>Participant ID: <strong>{registration.participantId}</strong></p>
          
          <div style={{marginTop: '25px', padding: '25px', background: 'rgba(0,0,0,0.3)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)'}}>
            <h3 style={{color: 'var(--neon-cyan)', marginBottom: '18px', fontFamily: 'var(--font-display)', letterSpacing: '2px'}}>Registration Details</h3>
            <p><strong>Event:</strong> {registration.eventName} - {registration.eventSubname}</p>
            <p><strong>College:</strong> {registration.college}</p>
            <p><strong>Phone:</strong> {registration.phone}</p>
            <p><strong>Email:</strong> {registration.email}</p>
            {registration.teamName && <p><strong>Team:</strong> {registration.teamName}</p>}
            <p><strong>Amount Paid:</strong> ₹{registration.amount}</p>
            <p><strong>Transaction ID:</strong> {registration.transactionId}</p>
            <p><strong>Registration Date:</strong> {registration.date}</p>
          </div>
          
          <div style={{marginTop: '25px', padding: '25px', background: 'rgba(0,0,0,0.3)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)'}}>
            <p><strong>Status:</strong> <span style={{
              color: getStatusColor(registration.status), 
              fontWeight: 'bold', 
              fontSize: '1.3rem', 
              textTransform: 'uppercase',
              textShadow: `0 0 15px ${getStatusColor(registration.status)}`
            }}>{registration.status}</span></p>
          </div>
        </div>
      </ScrollReveal>
    </section>
  )
}

function AdminDashboard() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [registrations, setRegistrations] = useState([])
  const [selectedScreenshot, setSelectedScreenshot] = useState(null)
  const timeoutRef = useRef(null)

  // Auto-logout after 2 minutes inactivity
  useEffect(() => {
    const resetTimeout = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = setTimeout(() => {
        localStorage.removeItem('adminAuth')
        navigate('/login')
      }, 2 * 60 * 1000) // 2 minutes
    }

    const handleActivity = () => resetTimeout()

    window.addEventListener('mousemove', handleActivity)
    window.addEventListener('keydown', handleActivity)
    window.addEventListener('click', handleActivity)

    resetTimeout()

    return () => {
      window.removeEventListener('mousemove', handleActivity)
      window.removeEventListener('keydown', handleActivity)
      window.removeEventListener('click', handleActivity)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [navigate])

  // Check auth
  useEffect(() => {
    if (localStorage.getItem('adminAuth') !== 'true') {
      navigate('/login')
    }
  }, [navigate])
  
  useEffect(() => {
    const regs = JSON.parse(localStorage.getItem('aimx_registrations') || '[]')
    setRegistrations(regs)
  }, [])
  
  const updateStatus = async (id, newStatus) => {
    const updated = registrations.map(r => r.id === id ? {...r, status: newStatus} : r)
    setRegistrations(updated)
    localStorage.setItem('aimx_registrations', JSON.stringify(updated))
    
    // Send status update email to participant
    const reg = updated.find(r => r.id === id)
    if (reg) {
      await sendStatusUpdateEmail(reg, newStatus)
    }
  }

  const handleDelete = (id) => {
    if (confirm('Delete this registration permanently?')) {
      const updated = registrations.filter(r => r.id !== id)
      setRegistrations(updated)
      localStorage.setItem('aimx_registrations', JSON.stringify(updated))
    }
  }
  
  const exportToExcel = () => {
    const filteredRegs = registrations.filter(r => {
      const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           r.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           r.participantId.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'all' || r.status === statusFilter
      return matchesSearch && matchesStatus
    })
    
    const headers = ['Participant ID', 'Name', 'Email', 'Phone', 'College', 'Event', 'Team Name', 'Amount', 'Transaction ID', 'Status', 'Date']
    let htmlContent = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="utf-8"><title>AIMX 2026 Registrations</title></head><body><table border="1" style="border-collapse: collapse;"><tr style="background: #6B2D8C; color: white;">' + headers.map(h => '<th style="padding: 8px;">' + h + '</th>').join('') + '</tr>'
    
    filteredRegs.forEach(reg => {
      htmlContent += '<tr>' + [
        reg.participantId, reg.name, reg.email, reg.phone, reg.college, 
        reg.eventName + ' - ' + reg.eventSubname, reg.teamName || 'N/A', 
        '₹' + reg.amount, reg.transactionId, reg.status.toUpperCase(), reg.date
      ].map(val => '<td style="padding: 8px;">' + val + '</td>').join('') + '</tr>'
    })
    
    htmlContent += '</table></body></html>'
    
    const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'AIMX2026_Registrations_' + new Date().toISOString().split('T')[0] + '.xls'
    link.click()
  }
  
  const filteredRegs = registrations.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         r.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         r.participantId.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const isAdmin = localStorage.getItem('adminAuth') === 'true'
  const stats = {
    total: registrations.length,
    pending: registrations.filter(r => r.status === 'pending').length,
    approved: registrations.filter(r => r.status === 'approved').length,
    rejected: registrations.filter(r => r.status === 'rejected').length
  }

  if (!isAdmin) {
    navigate('/login')
    return null
  }
  
  const handleLogout = () => {
    localStorage.removeItem('adminAuth')
    navigate('/login')
  }
  
  const getStatusBadge = (status) => {
    const colors = {
      pending: { bg: 'rgba(255, 193, 7, 0.2)', color: '#FFC107' },
      approved: { bg: 'rgba(57, 255, 20, 0.2)', color: '#39FF14' },
      rejected: { bg: 'rgba(255, 0, 0, 0.2)', color: '#FF0000' }
    }
    return (
      <span style={{
        padding: '6px 18px', 
        borderRadius: '25px', 
        background: colors[status].bg, 
        color: colors[status].color, 
        fontWeight: 'bold', 
        textTransform: 'uppercase', 
        fontSize: '0.8rem',
        letterSpacing: '1px'
      }}>
        {status}
      </span>
    )
  }

  return (
    <div style={{paddingTop: '100px', minHeight: '100vh', background: 'var(--vc-dark)'}}>
      {/* Screenshot Modal */}
      {selectedScreenshot && (
        <div 
          style={{
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            background: 'rgba(0,0,0,0.95)', 
            zIndex: 9999, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            flexDirection: 'column',
            backdropFilter: 'blur(10px)'
          }} 
          onClick={() => setSelectedScreenshot(null)}
        >
          <h2 style={{color: 'var(--neon-orange)', marginBottom: '25px', fontFamily: 'var(--font-display)', letterSpacing: '3px'}}>Payment Screenshot</h2>
          <img 
            src={selectedScreenshot} 
            alt="Payment Screenshot" 
            style={{
              maxWidth: '90%', 
              maxHeight: '80vh', 
              borderRadius: '16px', 
              border: '3px solid var(--neon-orange)',
              boxShadow: '0 0 40px rgba(255, 107, 53, 0.4)'
            }} 
          />
          <button 
            className="btn" 
            style={{marginTop: '25px'}}
            onClick={() => setSelectedScreenshot(null)}
          >
            Close
          </button>
        </div>
      )}
      
      {/* Header */}
      <div style={{
        background: 'rgba(13,13,26,0.98)', 
        padding: '25px 50px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        borderBottom: '2px solid var(--neon-orange)',
        flexWrap: 'wrap', 
        gap: '18px'
      }}>
        <div>
          <h1 style={{
            color: 'var(--neon-orange)', 
            fontFamily: 'var(--font-display)', 
            fontSize: '2.8rem', 
            margin: 0,
            letterSpacing: '4px',
            textShadow: '0 0 20px rgba(255, 107, 53, 0.5)'
          }}>
            Admin Dashboard
          </h1>
          <p style={{color: 'rgba(255,255,255,0.7)', margin: '8px 0 0'}}>AIMX 2026 • 27-03-2026</p>
        </div>
        <div style={{display: 'flex', gap: '12px', alignItems: 'center'}}>
          <button onClick={exportToExcel} className="btn" style={{borderColor: 'var(--neon-cyan)', color: 'var(--neon-cyan)'}}>📊 Export Excel</button>
          <button onClick={handleLogout} className="btn" style={{borderColor: 'var(--neon-orange)', color: 'var(--neon-orange)'}}>Logout</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{display: 'flex', gap: '18px', padding: '25px 50px', background: 'rgba(22,33,62,0.9)', flexWrap: 'wrap'}}>
        <div style={{background: 'rgba(255,255,255,0.05)', padding: '20px 30px', borderRadius: '16px', textAlign: 'center', minWidth: '140px', border: '1px solid rgba(255,255,255,0.1)'}}>
          <div style={{fontSize: '2.2rem', fontWeight: 'bold', color: '#fff'}}>{stats.total}</div>
          <div style={{color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', letterSpacing: '2px'}}>Total</div>
        </div>
        <div style={{background: 'rgba(255,193,7,0.15)', padding: '20px 30px', borderRadius: '16px', textAlign: 'center', minWidth: '140px', border: '1px solid rgba(255,193,7,0.3)'}}>
          <div style={{fontSize: '2.2rem', fontWeight: 'bold', color: '#FFC107'}}>{stats.pending}</div>
          <div style={{color: '#FFC107', fontSize: '0.9rem', letterSpacing: '2px'}}>Pending</div>
        </div>
        <div style={{background: 'rgba(57,255,20,0.15)', padding: '20px 30px', borderRadius: '16px', textAlign: 'center', minWidth: '140px', border: '1px solid rgba(57,255,20,0.3)'}}>
          <div style={{fontSize: '2.2rem', fontWeight: 'bold', color: '#39FF14'}}>{stats.approved}</div>
          <div style={{color: '#39FF14', fontSize: '0.9rem', letterSpacing: '2px'}}>Approved</div>
        </div>
        <div style={{background: 'rgba(255,0,0,0.15)', padding: '20px 30px', borderRadius: '16px', textAlign: 'center', minWidth: '140px', border: '1px solid rgba(255,0,0,0.3)'}}>
          <div style={{fontSize: '2.2rem', fontWeight: 'bold', color: '#FF0000'}}>{stats.rejected}</div>
          <div style={{color: '#FF0000', fontSize: '0.9rem', letterSpacing: '2px'}}>Rejected</div>
        </div>
      </div>

      {/* Filters */}
      <div style={{padding: '25px 50px', display: 'flex', gap: '18px', flexWrap: 'wrap', alignItems: 'center'}}>
        <input 
          type="text" 
          placeholder="Search by name, email, ID..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          style={{
            flex: '1', 
            minWidth: '280px', 
            padding: '14px 22px', 
            background: 'rgba(0,0,0,0.3)', 
            border: '2px solid rgba(255,255,255,0.1)', 
            borderRadius: '12px', 
            color: '#fff', 
            fontSize: '1rem'
          }} 
        />
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)} 
          style={{
            padding: '14px 22px', 
            background: 'rgba(0,0,0,0.3)', 
            border: '2px solid rgba(255,255,255,0.1)', 
            borderRadius: '12px', 
            color: '#fff', 
            fontSize: '1rem', 
            minWidth: '160px'
          }}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Table */}
      <div style={{padding: '0 50px 50px'}}>
        <div style={{overflowX: 'auto'}}>
          <table style={{width: '100%', borderCollapse: 'collapse', background: 'rgba(0,0,0,0.3)', borderRadius: '16px', overflow: 'hidden'}}>
            <thead>
              <tr style={{background: 'rgba(107,45,140,0.3)'}}>
                <th style={{padding: '18px', textAlign: 'left', color: 'var(--neon-orange)', borderBottom: '2px solid rgba(255,255,255,0.1)', fontFamily: 'var(--font-heading)', letterSpacing: '1px'}}>Participant ID</th>
                <th style={{padding: '18px', textAlign: 'left', color: 'var(--neon-orange)', borderBottom: '2px solid rgba(255,255,255,0.1)', fontFamily: 'var(--font-heading)', letterSpacing: '1px'}}>Name</th>
                <th style={{padding: '18px', textAlign: 'left', color: 'var(--neon-orange)', borderBottom: '2px solid rgba(255,255,255,0.1)', fontFamily: 'var(--font-heading)', letterSpacing: '1px'}}>Event</th>
                <th style={{padding: '18px', textAlign: 'left', color: 'var(--neon-orange)', borderBottom: '2px solid rgba(255,255,255,0.1)', fontFamily: 'var(--font-heading)', letterSpacing: '1px'}}>Contact</th>
                <th style={{padding: '18px', textAlign: 'left', color: 'var(--neon-orange)', borderBottom: '2px solid rgba(255,255,255,0.1)', fontFamily: 'var(--font-heading)', letterSpacing: '1px'}}>College</th>
                <th style={{padding: '18px', textAlign: 'left', color: 'var(--neon-orange)', borderBottom: '2px solid rgba(255,255,255,0.1)', fontFamily: 'var(--font-heading)', letterSpacing: '1px'}}>Amount</th>
                <th style={{padding: '18px', textAlign: 'left', color: 'var(--neon-orange)', borderBottom: '2px solid rgba(255,255,255,0.1)', fontFamily: 'var(--font-heading)', letterSpacing: '1px'}}>Transaction</th>
                <th style={{padding: '18px', textAlign: 'left', color: 'var(--neon-orange)', borderBottom: '2px solid rgba(255,255,255,0.1)', fontFamily: 'var(--font-heading)', letterSpacing: '1px'}}>Screenshot</th>
                <th style={{padding: '18px', textAlign: 'left', color: 'var(--neon-orange)', borderBottom: '2px solid rgba(255,255,255,0.1)', fontFamily: 'var(--font-heading)', letterSpacing: '1px'}}>Status</th>
                <th style={{padding: '18px', textAlign: 'center', color: 'var(--neon-orange)', borderBottom: '2px solid rgba(255,255,255,0.1)', fontFamily: 'var(--font-heading)', letterSpacing: '1px'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRegs.length === 0 ? (
                <tr>
                  <td colSpan="10" style={{padding: '50px', textAlign: 'center', color: 'rgba(255,255,255,0.5)'}}>No registrations found</td>
                </tr>
              ) : filteredRegs.map(reg => (
                <tr key={reg.id} style={{borderBottom: '1px solid rgba(255,255,255,0.05)'}}>
                  <td style={{padding: '18px', color: 'var(--neon-cyan)', fontWeight: 'bold'}}>{reg.participantId}</td>
                  <td style={{padding: '18px', color: '#fff'}}>
                    <div>{reg.name}</div>
                    <div style={{fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)'}}>{reg.email}</div>
                  </td>
                  <td style={{padding: '18px', color: '#fff'}}>
                    <div style={{fontWeight: 'bold'}}>{reg.eventName}</div>
                    <div style={{fontSize: '0.85rem', color: 'var(--neon-pink)'}}>{reg.eventSubname}</div>
                  </td>
                  <td style={{padding: '18px', color: '#fff'}}>{reg.phone}</td>
                  <td style={{padding: '18px', color: 'rgba(255,255,255,0.7)'}}>{reg.college}</td>
                  <td style={{padding: '18px', color: 'var(--neon-orange)', fontWeight: 'bold'}}>₹{reg.amount}</td>
                  <td style={{padding: '18px', color: '#fff', fontFamily: 'monospace', fontSize: '0.9rem'}}>{reg.transactionId}</td>
                  <td style={{padding: '18px'}}>
                    {reg.screenshot ? (
                      <button 
                        onClick={() => setSelectedScreenshot(reg.screenshot)} 
                        style={{
                          padding: '6px 14px', 
                          background: 'rgba(107,45,140,0.3)', 
                          color: '#fff', 
                          border: '1px solid var(--neon-pink)', 
                          borderRadius: '8px', 
                          cursor: 'pointer',
                          fontSize: '0.85rem'
                        }}
                      >
                        View
                      </button>
                    ) : <span style={{color: 'rgba(255,255,255,0.5)'}}>N/A</span>}
                  </td>
                  <td style={{padding: '18px'}}>{getStatusBadge(reg.status)}</td>
                  <td style={{padding: '18px'}}>
                    <div style={{display: 'flex', gap: '6px', justifyContent: 'center'}}>
                      <button 
                        onClick={() => updateStatus(reg.id, 'approved')} 
                        title="Approve" 
                        style={{
                          padding: '6px 12px', 
                          background: 'rgba(57,255,20,0.15)', 
                          color: '#39FF14', 
                          border: '1px solid #39FF14', 
                          borderRadius: '8px', 
                          cursor: 'pointer',
                          fontSize: '1rem'
                        }}
                      >
                        ✓
                      </button>
                      <button 
                        onClick={() => updateStatus(reg.id, 'pending')} 
                        title="Pending" 
                        style={{
                          padding: '6px 12px', 
                          background: 'rgba(255,193,7,0.15)', 
                          color: '#FFC107', 
                          border: '1px solid #FFC107', 
                          borderRadius: '8px', 
                          cursor: 'pointer',
                          fontSize: '1rem'
                        }}
                      >
                        ⏳
                      </button>
                      <button 
                        onClick={() => updateStatus(reg.id, 'rejected')} 
                        title="Reject" 
                        style={{
                          padding: '6px 12px', 
                          background: 'rgba(255,0,0,0.15)', 
                          color: '#FF0000', 
                          border: '1px solid #FF0000', 
                          borderRadius: '8px', 
                          cursor: 'pointer',
                          fontSize: '1rem'
                        }}
                      >
                        ✗
                      </button>
                      <button 
                        onClick={() => handleDelete(reg.id)} 
                        title="Delete" 
                        style={{
                          padding: '6px 12px', 
                          background: 'rgba(255,0,0,0.3)', 
                          color: '#FF4444', 
                          border: '1px solid #FF4444', 
                          borderRadius: '8px', 
                          cursor: 'pointer',
                          fontSize: '1.1rem',
                          fontWeight: 'bold'
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

import Layout from './Layout.jsx'

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

