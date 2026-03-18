import { useState, useEffect, useRef } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation, useSearchParams, useParams } from 'react-router-dom'
import Layout from './Layout.jsx'
import EventPayment from './EventPayment.jsx';


import './App.css'
import './EventRegistration.css'
import './hero-buttons.css'
import QRCode from 'qrcode'
import { postRegistration, getRegistrations, getRegistrationById, updateRegistrationStatus, adminLogin, adminLogout, downloadParticipantsExcel, postCheckin, verifyParticipant, checkinParticipant } from './api.js'
import { Html5QrcodeScanner } from "html5-qrcode";

function SuccessPage() {
  const { id } = useParams();
  const [participant, setParticipant] = useState(null);
  const [qrUrl, setQrUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getRegistrationById(id);
        if (!data) {
          alert('Registration not found');
          navigate('/login');
          return;
        }
        setParticipant(data);
        if (data.status === 'approved') {
          // Generate QR ticket only for approved registrations
          const qrData = data.participantId;
          const url = await QRCode.toDataURL(qrData, {
            width: 256,
            margin: 2,
            color: {
              dark: '#0D0D1A',
              light: '#FFFFFF'
            }
          });
          setQrUrl(url);
        } else {
          setQrUrl('');
        }
      } catch (error) {
        console.error('Success page error:', error);
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id, navigate]);

  const downloadTicket = () => {
    if (!qrUrl || participant.status !== 'approved') {
      alert('QR ticket available only after admin approval!');
      return;
    }
    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = `AIMX2026-${participant.participantId}-ticket.png`;
    link.click();
  };

  if (loading) return <div className="section" style={{paddingTop: '120px'}}><p>Loading ticket...</p></div>;
  if (!participant) return <div className="section" style={{paddingTop: '120px'}}><p>Registration not found</p></div>;

  return (
    <section className="section" style={{paddingTop: '120px'}}>
      <ScrollReveal>
        <div className="success-card ticket-card">
          <h2>🎫 Event Ticket</h2>
          <div className="participant-id">{participant.participantId}</div>
          <div className="ticket-details">
            <p><strong>{participant.name}</strong></p>
            <p>{participant.eventName} {participant.eventSubname && `- ${participant.eventSubname}`}</p>
            <p>📱 {participant.phone}</p>
            <p>Status: <span className={participant.status === 'approved' ? 'approved' : 'pending'}>{participant.status.toUpperCase()}</span></p>
          </div>
          {participant.status === 'approved' && qrUrl ? (
            <div className="ticket-qr-section">
              <p>✅ APPROVED - Scan at entry</p>
              <div className="qr-container">
                <img src={qrUrl} alt="AIMX QR Ticket" className="ticket-qr" />
              </div>
              <button className="btn btn-primary" onClick={downloadTicket}>📥 Download Ticket</button>
            </div>
          ) : (
            <div className="ticket-pending">
              <p>⏳ PENDING - Await Admin Approval</p>
              <p>Your payment/transaction is under admin verification.</p>
              <p>Once approved, your QR ticket will appear here and be sent via email.</p>
              <p><em>Check back later or login to dashboard.</em></p>
            </div>
          )}
          <button className="btn" onClick={() => navigate('/events')}>Back to Events</button>
        </div>
      </ScrollReveal>
    </section>
  );
}

function CheckinPage() {
  const [scannerState, setScannerState] = useState('scan'); // 'scan', 'verify', 'success', 'error'
  const [qrResult, setQrResult] = useState(null);
  const [participant, setParticipant] = useState(null);
  const [loading, setLoading] = useState(false);
  const scannerRef = useRef(null);
  const scanner = useRef(null);

  useEffect(() => {
    scanner.current = new Html5QrcodeScanner(
      "scanner-reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );

    const onScanSuccess = async (decodedText) => {
      setQrResult(decodedText);
      scanner.current.clear();
      await verifyAndShow(decodedText);
    };

    const onScanFailure = (error) => {
      // console.warn(`QR scan error: ${error}`);
    };

    scanner.current.render(onScanSuccess, onScanFailure);

    return () => {
      if (scanner.current) scanner.current.clear();
    };
  }, []);

  const verifyAndShow = async (qrText) => {
    try {
      setLoading(true);
      // Extract registration ID from QR (AIMX2026-XXXX format)
      const match = qrText.match(/AIMX2026-(\w+)/);
      if (!match) {
        setScannerState('error');
        return;
      }
      const registrationId = match[0]; // Full AIMX2026-XXXX
      const data = await verifyParticipant(registrationId);
      setParticipant(data);
      setScannerState('verify');
    } catch (error) {
      console.error('Verify error:', error);
      setScannerState('error');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckin = async () => {
    try {
      setLoading(true);
      const result = await checkinParticipant(participant.registrationId);
      setParticipant(result.participant);
      setScannerState('success');
    } catch (error) {
      if (error.message.includes('already checked in')) {
        setScannerState('error');
      } else {
        alert('Checkin failed: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const restartScan = () => {
    setScannerState('scan');
    setQrResult(null);
    setParticipant(null);
  };

  if (scannerState === 'scan') {
    return (
      <section className="section" style={{paddingTop: '120px'}}>
        <ScrollReveal>
          <div className="scanner-container glass-card">
            <h1 className="scanner-title">🔍 AIMX 2026 Entry Scanner</h1>
            <p className="scanner-instruction">"Scan participant QR ticket"</p>
            <div id="scanner-reader" className="scanner-viewport"></div>
            <button className="btn btn-secondary" onClick={scanner.current?.clear} style={{marginTop: '1rem'}}>
              Stop Scanner
            </button>
          </div>
        </ScrollReveal>
      </section>
    );
  }

  if (scannerState === 'verify') {
    return (
      <section className="section" style={{paddingTop: '120px'}}>
        <ScrollReveal>
          <div className="scanner-container glass-card">
            <h2 className="scanner-title">📋 Ticket Verification</h2>
              <div className="verify-card">
              <h2 style={{color: "white", fontSize: "3rem", marginBottom: "20px"}}>
                {participant.registrationId}
              </h2>
              <p style={{color: "white", fontSize: "1.5rem"}}><strong>Participant:</strong> {participant.name}</p>
              <p style={{color: "white", fontSize: "1.5rem"}}><strong>Event:</strong> {participant.event}</p>
              <p style={{color: "white", fontSize: "1.5rem"}}><strong>Payment:</strong> <span className={participant.paymentStatus === 'Approved' ? 'status-approved' : 'status-pending'}>{participant.paymentStatus}</span></p>
              <p style={{color: "white", fontSize: "1.5rem"}}><strong>Entry:</strong> <span className={participant.checkInStatus ? 'status-checkedin' : 'status-notcheckedin'}>{participant.checkInStatus ? 'Checked In' : 'Not Checked In'}</span></p>
            </div>
            <div className="scanner-actions">
              <button className="btn btn-primary" onClick={handleCheckin} disabled={loading || participant.checkInStatus}>
                {participant.checkInStatus ? 'Already Checked In' : '✅ Mark Check-In'}
              </button>
              <button className="btn btn-secondary" onClick={restartScan}>Scan Another</button>
            </div>
          </div>
        </ScrollReveal>
      </section>
    );
  }

  if (scannerState === 'success') {
    return (
      <section className="section" style={{paddingTop: '120px'}}>
        <ScrollReveal>
          <div className="scanner-container glass-card success-container">
            <h2 className="scanner-title success-title">✅ Check-In Complete</h2>
            <div className="success-checkmark">✓</div>
            <div className="verify-card success-card">
              <p><strong>{participant.name}</strong></p>
              <p>{participant.event}</p>
              <p>ID: {participant.registrationId}</p>
            </div>
            <button className="btn btn-primary" onClick={restartScan}>Scan Next Participant</button>
          </div>
        </ScrollReveal>
      </section>
    );
  }

  if (scannerState === 'error') {
    return (
      <section className="section" style={{paddingTop: '120px'}}>
        <ScrollReveal>
          <div className="scanner-container glass-card error-container">
            <h2 className="scanner-title error-title">❌ Scan Error</h2>
            <p>QR code invalid or participant not found.</p>
            {qrResult && <p><small>Scanned: {qrResult}</small></p>}
            <button className="btn btn-primary" onClick={restartScan}>Try Again</button>
          </div>
        </ScrollReveal>
      </section>
    );
  }

  return null;
}


const eventsData = [
// Technical
{ id: 1, name: 'UI/UX Battle – Vice City Visuals', category: 'Technical', price: 50, teamSize: 1, feeText: '₹50, 1 member', icon: '🎨', badgeColor: 'bg-gradient-to-r from-blue-500 to-purple-600', startTime: '10:00 AM', endTime: '11:30 AM', location: 'Design Lab', head: {name: 'Bhagyesh Pandey', phone: '9075930985'} },
{ id: 2, name: 'Hackathon – Hack Wanted', category: 'Technical', price: 300, teamSize: 4, feeText: '₹300, 2–4 members', icon: '💻', badgeColor: 'bg-gradient-to-r from-blue-500 to-purple-600', startTime: '9:30 AM', endTime: '5:00 PM', location: 'Main Hall', head: {name: 'Aman Tripathi', phone: '8303026772'} },
{ id: 3, name: 'Debugging', category: 'Technical', price: 50, teamSize: 1, feeText: '₹50, 1 member', icon: '🐛', badgeColor: 'bg-gradient-to-r from-blue-500 to-purple-600', startTime: '12:00 PM', endTime: '1:30 PM', location: 'Tech Lab', head: {name: 'Aisha Khan', phone: '9876543212'} },
// Cultural
{ id: 4, name: 'Dance', category: 'Cultural', price: 400, teamSize: 6, feeText: '₹400, 3–6 members', icon: '💃', badgeColor: 'bg-gradient-to-r from-pink-500 to-rose-500', startTime: '5:00 PM', endTime: '6:30 PM', location: 'Main Stage', head: {name: 'Tanisha', phone: '7208577313'} },
{ id: 5, name: 'Ramp Walk', category: 'Cultural', price: 100, teamSize: 1, feeText: '₹100, 1 member', icon: '👗', badgeColor: 'bg-gradient-to-r from-pink-500 to-rose-500', startTime: '4:00 PM', endTime: '5:00 PM', location: 'Stage', head: {name: 'Vaishnavi', phone: '8928002367'} },
{ id: 6, name: 'Singing', category: 'Cultural', price: 100, teamSize: 1, feeText: '₹100, 1 member', icon: '🎤', badgeColor: 'bg-gradient-to-r from-pink-500 to-rose-500', startTime: '3:00 PM', endTime: '4:00 PM', location: 'Auditorium', head: {name: 'Krisha', phone: '9429659108'} },
// E-Sports
{ id: 7, name: 'BGMI Tournament', category: 'E-Sports', price: 300, teamSize: 4, feeText: '₹300, 4 members', icon: '🎮', badgeColor: 'bg-gradient-to-r from-emerald-500 to-teal-500', startTime: '12:00 PM', endTime: '3:00 PM', location: 'Gaming Zone', head: {name: 'Soham Tambade', phone: '8356054488'} },
  // AIMX Talks (Free)
{ id: 8, name: 'Workshop', category: 'AIMX Talks', price: 0, teamSize: 1, feeText: 'FREE, 1 participant', icon: '📚', badgeColor: 'bg-gradient-to-r from-indigo-500 to-violet-500', startTime: '11:00 AM', endTime: '12:00 PM', location: 'Workshop Room', head: {name: 'Maruf', phone: '9040286664'} },
{ id: 9, name: 'Guest Session', subname: 'events head Garima', category: 'AIMX Talks', price: 0, teamSize: 1, feeText: 'FREE, 1 participant', icon: '👥', badgeColor: 'bg-gradient-to-r from-indigo-500 to-violet-500', startTime: '11:45 AM', endTime: '12:15 PM', location: 'Main Hall', head: {name: 'Garima', phone: '9356063809'} },
{ id: 10, name: 'Panel Discussion', category: 'AIMX Talks', price: 0, teamSize: 1, feeText: 'FREE, 1 participant', icon: '💬', badgeColor: 'bg-gradient-to-r from-indigo-500 to-violet-500', startTime: '12:15 PM', endTime: '1:30 PM', location: 'Main Hall', head: {name: 'Prashant', phone: '7208503692'} },
{ id: 11, name: 'Stumble', category: 'E-Sports', price: 30, teamSize: 1, feeText: '₹30, 1 member', icon: '🎮', badgeColor: 'bg-gradient-to-r from-emerald-500 to-teal-500', startTime: '1:00 PM', endTime: '2:30 PM', location: 'Gaming Zone', head: {name: 'Zaid', phone: '9324649291'} }
  ]

// eventPrices no longer needed - use event.price

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
<Link to="/register" className="btn btn-primary hero-register-btn">Register Now</Link>
            <Link to="/events" className="btn btn-neon hero-explore-btn">Explore Events</Link>
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
<div className="stat-card"><div className="stat-number">10</div><div className="stat-label">Events</div></div>
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
            <Link to="/events?cat=Technical" className="category-card"><div className="category-icon">💻</div><h3>Technical</h3><p>3 Events</p></Link>
            <Link to="/events?cat=Cultural" className="category-card"><div className="category-icon">🎭</div><h3>Cultural</h3><p>2 Events</p></Link>
            <Link to="/events?cat=E-Sports" className="category-card"><div className="category-icon">🎮</div><h3>E-Sports</h3><p>3 Events</p></Link>
          </div>
        </ScrollReveal>
      </section>
    </>
  )
}

import PaymentModal from './PaymentModal.jsx';

function Events() {
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const displayEvents = eventsData.filter(event => {
    const matchesFilter = filter === 'all' || event.category === filter
    const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          event.subname?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })
  
  const navigate = useNavigate();
  
  const handleRegisterClick = (event) => {
    const params = new URLSearchParams({ event: event.id });
    navigate(`/register?${params.toString()}`);
  };

  
  return (
    <>
      <section className="section" style={{paddingTop: '120px'}}>
        <ScrollReveal>
          <h1 className="section-title">Events</h1>


          <div className="search-bar">
            <input type="text" placeholder="Search events..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="search-input" />
          </div>
          <div className="events-filter">
            <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All</button>
            <button className={`filter-btn ${filter === 'Technical' ? 'active' : ''}`} onClick={() => setFilter('Technical')}>Technical</button>
            <button className={`filter-btn stumble-btn ${filter === 'Stumble' ? 'active' : ''}`} onClick={() => setFilter('Stumble')}>Stumble</button>
            <button className={`filter-btn ${filter === 'Cultural' ? 'active' : ''}`} onClick={() => setFilter('Cultural')}>Cultural</button>
            <button className={`filter-btn ${filter === 'E-Sports' ? 'active' : ''}`} onClick={() => setFilter('E-Sports')}>E-Sports</button>
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
{(event.id === 1 || event.id === 2 || event.id === 4 || event.id === 5 || event.id === 6 || event.id === 7 || event.id === 11) && (


                    <div className={`event-rules event-id-${event.id}`}>
                      <p><strong>Rules:</strong></p>
                      <ul>
                        {(event.id === 1) && (
                          <>
                            <li>Participants must design the interface using raw elements only.</li>
                            <li>Pre-made UI or website templates are not allowed.</li>
                            <li>The topic will be revealed at the start of the event.</li>
                            <li>Total design time is 90 minutes.</li>
                            <li>Participants must explain their design concept to the judges.</li>
                          </>
                        )}
                        {(event.id === 2) && (
                          <>
                            <li>Team size must be between 2–4 members.</li>
                            <li>Teams must bring their own laptops.</li>
                            <li>Projects must be developed during the event itself.</li>
                            <li>Open-source tools, APIs, and frameworks are allowed.</li>
                            <li>Teams must submit code, documentation, and a short presentation.</li>
                          </>
                        )}
                        {(event.id === 4) && (
                          <>

                            <li>Only group performances are allowed with 4–8 members per team, and all members must be present at the reporting time.</li>
                            <li>Each group must perform within a strict time limit of 3–5 minutes — exceeding 5 minutes results in negative marking, performing under 3 minutes may reduce scores, and music will be stopped once time is over.</li>
                            <li>Performances will be judged on energy & stage presence, synchronization & coordination, creativity & choreography, GTA theme justification, and audience impact.</li>
                            <li>GTA-style elements are encouraged, and safe hand-held props are allowed; however, vulgarity, fire, liquids, sharp objects, or any action that may damage stage or equipment will lead to disqualification.</li>
                            <li>Discipline is mandatory — misbehavior, offensive gestures, or arguments will cause instant disqualification, and judges' and organizers' decisions are final</li>

                          </>
                        )}
                        {(event.id === 5) && (
                          <>
                            <li>Individual or pair participation is allowed.</li>
                            <li>Performance time must be between 1–2 minutes.</li>
                            <li>Music must be submitted before the performance.</li>
                            <li>Proper stage discipline must be maintained.</li>
                            <li>Submission & Time Limit: Music must be submitted in advance, and each performance must be completed within 1–2 minutes maximum.</li>
                            <li>Code of Conduct: Vulgar clothing or gestures are strictly prohibited. Participants must maintain proper stage discipline and presentation.</li>
                            <li>Props Policy: Only hand-held props such as a jacket, cap, sunglasses, fake money, or toy phone are allowed.</li>
                            <li>Judging Authority: All judges' and organizers' decisions are final and binding.</li>
                            <li>Judging Criteria: Performances will be evaluated based on walk & posture, confidence & attitude, costume & styling, and facial expressions & character portrayal.</li>
                          </>
                        )}
                        {(event.id === 7) && (
                          <>
                            <li>Teams must consist of 4 players.</li>
                            <li>Matches will be played in custom rooms.</li>
                            <li>Points will be based on placement and kills.</li>
                            <li>Players must use their registered game ID.</li>
                            <li>Cheating, teaming, or hacking will lead to disqualification.</li>
                          </>
                        )}
                        {(event.id === 11) && (
                          <>
                            <li>Players must use their registered IGN, report on time, and avoid intentional teaming, ghosting, or sharing match details; late entry may lead to disqualification.</li>
                            <li>The tournament will be played in Custom Party / Solo Elimination mode on Stumble Guys mobile</li>
                            <li>Maintain sportsmanlike behavior; abusive, toxic conduct or cheating of any kind will result in immediate disqualification.</li>
                            <li>Participants are responsible for their own device, internet, and power matches will not be restarted due to individual technical issues or game glitches.</li>
                            <li>Players can play multiple times by paying the entry fee for each attempt; every entry is treated as a new game.</li>
                            <li>Players may be disqualified for cheating, rule violations, misbehavior, absence at match time, or sharing room codes or credentials.</li>
                            <li>The organizers' decisions, which are final.</li>
                          </>
                        )}
                      </ul>
                    </div>
                  )}

                        {(event.id === 6) && (
                          <>
                            <li>Only solo performances are allowed, and participants must be present at the reporting time to confirm their participation.</li>
                            <li>Each participant must perform within a strict time limit of 3 minutes. Exceeding the time limit may result in negative marking or disqualification, and the track may be stopped once the allotted time is over.</li>
                            <li>All performances must be completely live, and lip-syncing or pre-recorded vocals are not permitted. </li>
                            <li>Participants must bring their own karaoke track in a compatible format, and they may also bring their own musical instrument if they wish to perform with live accompaniment.</li>
                            <li>Performances will be judged on voice quality, pitch accuracy, rhythm and timing, expression, song selection, confidence, and overall stage presence.</li>
                            <li>Participants must maintain proper discipline and decorum. The use of inappropriate lyrics, offensive content, or any unfair practices will lead to immediate disqualification, and the decisions of the judges and organizers will be final and binding.</li>
                          </>
                        )}

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
                <button className="mission-register-btn" onClick={() => handleRegisterClick(event)}>Register Now</button>
              </div>
            </ScrollReveal>
          ))}
        </div>
        {displayEvents.length === 0 && <p className="no-events">No events found matching your search.</p>}
      </section>

    </>
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
  const [category, setCategory] = useState('')
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [teamMembers, setTeamMembers] = useState([{ name: '', email: '' }])
  const [qrCode, setQrCode] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)
  
  const filteredEvents = eventsData.filter(event => category === '' || event.category === category)
  
  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'transactionId') {
      const numericValue = value.replace(/[^0-9]/g, '').slice(0, 12)
      setFormData({...formData, [name]: numericValue})
    } else {
      setFormData({...formData, [name]: value})
    }
  }
  
  const generateQR = async (amount) => {
    if (amount > 0) {
      const upiLink = `upi://pay?pa=ashutoshdp2003@okaxis&pn=AIMX Events ${selectedEvent?.name || 'Event'}&am=${amount}&cu=INR&tn=AIMX ${selectedEvent?.name || 'Event'}`;
      try {
        const url = await QRCode.toDataURL(upiLink);
        setQrCode(url);
      } catch (error) {
        console.error('QR generation failed:', error);
        setQrCode('');
      }
    } else {
      setQrCode('');
    }
  };

  
  const handleCategoryChange = (e) => {
    const newCategory = e.target.value
    setCategory(newCategory)
    setSelectedEvent(null)
    setFormData(prev => ({...prev, event: ''}))
    setTeamMembers([{ name: '', email: '' }])
  }
  
  const handleEventChange = (e) => {
    const eventId = parseInt(e.target.value)
    const event = eventsData.find(ev => ev.id === eventId)
setFormData(prev => ({...prev, event: eventId.toString(), eventName: event.name, eventSubname: event.subname || '' }))
    setSelectedEvent(event)
    generateQR(event.price)
    // Init team members
    const size = event.teamSize || 1
    setTeamMembers(Array.from({length: size}, (_, i) => ({ name: '', email: '' })))
  }
  
  const handleTeamMemberChange = (index, field, value) => {
    const newMembers = [...teamMembers]
    newMembers[index][field] = value
    setTeamMembers(newMembers)
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
    
    // Validate lead
    if (!formData.name || !formData.email || !formData.phone || !formData.college || !selectedEvent) {
      alert('Please fill all required lead fields and select an event!')
      return
    }
    
    // Validate team members
    for (let member of teamMembers) {
      if (!member.name || !member.email) {
        alert('Please fill all team member details!')
        return
      }
    }
    
    // Payment validation
    if (selectedEvent.price > 0) {
      if (!formData.transactionId || formData.transactionId.length !== 12) {
        alert('Transaction ID must be exactly 12 digits!')
        return
      }
      if (!screenshot) {
        alert('Please upload payment screenshot!')
        return
      }
    }
    
    setLoading(true)
    setError('')
    
    const newRegistration = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      college: formData.college,
      category: category,
      eventId: formData.event,
      eventName: selectedEvent.name,
      eventSubname: selectedEvent.subname || '',
      price: selectedEvent.price,
      amount: selectedEvent.price,
      teamSize: selectedEvent.teamSize,
      teamMembers: teamMembers, // Array of {name, email}
      teamName: formData.teamName || '',
      transactionId: selectedEvent.price > 0 ? formData.transactionId : 'FREE',
      screenshot: selectedEvent.price > 0 ? screenshotPreview : null,
      date: new Date().toLocaleDateString()
    }
    
    try {
      const response = await postRegistration(newRegistration)
      setParticipantId(response.participantId)
      alert('✅ Registration successful! ID: ' + response.participantId + '. Check email for details.')
      navigate(`/success/${response.participantId}`)
    } catch (err) {
      console.error('API failed:', err)
      alert('❌ Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  
  if (submitted) {
    return (
      <section className="section" style={{paddingTop: '120px'}}>
        <ScrollReveal>
          <div className="success-card">
            <h2 style={{color: "white", fontSize: "2.5rem"}}>Registration Successful!</h2>
            <h2 style={{color: "white", fontSize: "3rem", margin: "20px 0"}}>{participantId}</h2>
            <p style={{color: "white", fontSize: "1.5rem"}}>Status: <span style={{color: '#FFC107', fontWeight: 'bold'}}>PENDING</span></p>
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
                <label className="form-label">College *</label>
                <input
                  type="text"
                  name="college"
                  className="form-input"
                  value={formData.college}
                  onChange={handleChange}
                  placeholder="Your College"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Mobile No *</label>
                <input
                  type="tel"
                  name="phone"
                  className="form-input"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="10 digit mobile number"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select
                  className="form-input"
                  value={category}
                  onChange={handleCategoryChange}
                  required
                >
                  <option value="">Select Category</option>
                  <option value="Technical">[ TECHNICAL ]</option>
                  <option value="Cultural">[ CULTURAL ]</option>
                  <option value="E-Sports">[ E-SPORTS ]</option>
                  <option value="AIMX Talks">[ AIMX TALKS ]</option>
                </select>
              </div>
              <div className="form-group">
                <div style={{height: '68px', display: 'flex', alignItems: 'end'}}>
                </div>
              </div>
            </div>

            {category && (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Event *</label>
                    <select
                      name="event"
                      className="form-input"
                      value={formData.event}
                      onChange={handleEventChange}
                      required
                    >
                      <option value="">Select Event</option>
                      {filteredEvents.map((event) => (
                        <option key={event.id} value={event.id}>
                          `[${event.category}] ${event.name} - ${event.feeText}`
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group price-display">
                    {selectedEvent && (
                      <div className="event-price-badge">
                        <span className="price-icon">💰</span>
                        <span className="price-amount">₹{selectedEvent.price}</span>
                        <span className="price-team">({selectedEvent.teamSize} members)</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Dynamic Team Members */}
                <div className="team-members-section">
                  <h3 className="team-title">
                    <span className="team-icon">👥</span>
                    Team Members ({teamMembers.length})
                  </h3>
                  <div className="team-members-grid">
                    {teamMembers.map((member, index) => (
                      <div key={index} className="team-member-row form-row">
                        <div className="form-group">
                          <label className="form-label">Member {index + 1} Name *</label>
                          <input
                            type="text"
                            placeholder={`Member ${index + 1} Name`}
                            className="form-input"
                            value={member.name}
                            onChange={(e) => handleTeamMemberChange(index, 'name', e.target.value)}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Member {index + 1} Email *</label>
                          <input
                            type="email"
                            placeholder={`Member ${index + 1} Email`}
                            className="form-input"
                            value={member.email}
                            onChange={(e) => handleTeamMemberChange(index, 'email', e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
            
            <div className="form-group">
              <label className="form-label">Team Name (Optional)</label>
              <input
                type="text"
                name="teamName"
                className="form-input"
                value={formData.teamName}
                onChange={handleChange}
                placeholder="Enter team name (if applicable)"
              />
            </div>

            {selectedEvent && selectedEvent.price > 0 && (
              <>
                <div className="upi-qr-section">
                  <h4 className="qr-title">Pay with UPI</h4>
                  <div className="upi-qr-container">
                    <div className="payment-event">{selectedEvent.name}</div>
                    <div className="qr-price">₹{selectedEvent.price}</div>
                    <p className="upi-id-small">UPI ID: ashutoshdp2003@okaxis</p>
                    <div className="qr-container-reg">
                      {qrCode ? (
                        <img src={qrCode} alt="Dynamic UPI QR Code" className="dynamic-qr pay-small" />
                      ) : (
                        <div className="qr-placeholder">
                          <p>Select event to generate QR</p>
                        </div>
                      )}
                    </div>
                    <p className="qr-instruction">Scan to pay ₹{selectedEvent?.price || 0} (pre-filled amount)</p>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Transaction ID * (12 digits)</label>

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
              </>
            )}
            {selectedEvent && selectedEvent.price === 0 && (
              <div className="free-payment-note">
                <p style={{color: '#39FF14', textAlign: 'center', fontSize: '1.2rem', padding: '20px', background: 'rgba(57,255,20,0.1)', borderRadius: '12px', border: '2px solid #39FF14'}}>
                  This event is free. No payment required.
                </p>
              </div>
            )}


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
  const [qrUrl, setQrUrl] = useState('')
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

  useEffect(() => {
    if (participant?.status === 'approved' && !qrUrl) {
      const generateQR = async () => {
        try {
          const url = await QRCode.toDataURL(participant.participantId)
          setQrUrl(url)
        } catch (error) {
          console.error('QR gen error:', error)
        }
      }
      generateQR()
    }
  }, [participant, qrUrl])

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
            <h2 style={{color: 'white', fontSize: '2.5rem'}}>Participant Dashboard</h2>
            <span className={`status-badge ${statusClass}`}>{String(participant.status || 'pending').toUpperCase()}</span>
          </div>

          <h2 style={{color: "white", fontSize: "3rem", margin: "20px 0"}}>
            {participant?.participantId}
          </h2>

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

          {participant.status === 'approved' && qrUrl && (
            <div className="qr-ticket-section">
              <h3 style={{color: "white", fontSize: "2rem", marginBottom: "20px"}}>
                🎟 Your Entry QR Ticket
              </h3>
              <div className="qr-container">
                <img src={qrUrl} alt="AIMX QR Ticket" className="ticket-qr" />
              </div>
              <button className="btn btn-primary" onClick={() => {
                const link = document.createElement('a');
                link.href = qrUrl;
                link.download = `AIMX-${participant.participantId}-ticket.png`;
                link.click();
              }}>📥 Download Ticket</button>
              <p>Show this QR at event entry for verification</p>
            </div>
          )}
          {participant.status === 'pending' && (
            <div className="pending-notice">
              <p>⏳ PENDING – Await Admin Approval</p>
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
            <Route path="success/:id" element={<SuccessPage />} />
            <Route path="checkin" element={<CheckinPage />} />
            <Route path="scan" element={<CheckinPage />} />
          </Route>
        </Routes>
      </div>
    </Router>
  )
}

export default App
