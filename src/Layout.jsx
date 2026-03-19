import { useLocation, Outlet, Link } from 'react-router-dom'
import React from 'react'

// Navbar and Footer components
function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  
  return (
    <nav className="navbar" style={{backgroundImage: 'url(/assets/gtanav2.png)', backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative'}}>
      <div style={{position: 'absolute', inset: 0, background: 'rgba(13, 13, 26, 0.58)', backdropFilter: 'blur(0.5px)'}}></div>
        <div style={{position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '0 clamp(12px, 4vw, 25px)'}}>
        <Link to="/" className="navbar-logo">AIMX <span></span></Link>
        
        <button className={`hamburger ${isMenuOpen ? 'active' : ''}`} onClick={toggleMenu} aria-label="Toggle menu">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>


      
      <div className={`navbar-links ${isMenuOpen ? 'open' : ''}`}>
        <Link to="/" onClick={() => setIsMenuOpen(false)}>Home</Link>
        <Link to="/events" onClick={() => setIsMenuOpen(false)}>Events</Link>
        <Link to="/schedule" onClick={() => setIsMenuOpen(false)}>Schedule</Link>
        <Link to="/register" onClick={() => setIsMenuOpen(false)}>Register</Link>
        <Link to="/scan" onClick={() => setIsMenuOpen(false)}>Scanner</Link>
        <Link to="/login" onClick={() => setIsMenuOpen(false)}>Login</Link>
      </div>
      
    </nav>
  )
}

function Footer() {
  return (
    <footer className="footer" style={{backgroundImage: 'url(/assets/gtafo.png)', backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative'}}>
      <div style={{position: 'absolute', inset: 0, background: 'rgba(13,13,26,0.3)', backdropFilter: 'blur(2px)'}}></div>
      <div style={{position: 'relative', zIndex: 2}}>
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
      </div>
    </footer>
  )
}

function Layout() {
  const location = useLocation()
  const isEvents = location.pathname === '/events'
  const isSchedule = location.pathname === '/schedule'
  
  return (
    <>
      <div className="vc-skyline"></div>
      <div className="neon-grid"></div>
      <Navbar />
      <div className={isEvents ? 'events-page' : isSchedule ? 'schedule-page' : ''}>
        <Outlet />
      </div>
      <Footer />
    </>
  )
}

export default Layout

