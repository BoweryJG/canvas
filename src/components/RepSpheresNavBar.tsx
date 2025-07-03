import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../auth';
import LoginModal from './LoginModal';
import LogoutModal from './LogoutModal';
import SignUpModal from './SignUpModal';
import './RepSpheresNavBar.css';

interface NavLink {
  href: string;
  label: string;
  icon: string;
  external?: boolean;
}

interface RepSpheresNavBarProps {
  customLinks?: NavLink[];
  logoHref?: string;
}

const RepSpheresNavBar = ({ 
  customLinks = [],
  logoHref = '/'
}: RepSpheresNavBarProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [telemetryStatus, setTelemetryStatus] = useState(0);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [signUpModalOpen, setSignUpModalOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  // Default navigation links
  const defaultLinks = [
    { href: 'https://marketdata.repspheres.com/', label: 'Market Data', icon: 'market', external: true },
    { href: '/', label: 'Canvas', icon: 'canvas' },
    { href: '#pipeline', label: 'Pipeline', icon: 'pipeline' },
    { href: 'https://crm.repspheres.com/', label: 'Sphere oS', icon: 'sphere', external: true },
    { href: 'https://workshop-homepage.netlify.app/?page=podcast', label: 'Podcasts', icon: 'podcasts', external: true }
  ];

  const navLinks = customLinks.length > 0 ? customLinks : defaultLinks;

  // Telemetry status messages
  const statusMessages = [
    '⏱ AI SYNC 97%',
    '🔗 NEURAL LINK ACTIVE',
    '⚡ QUANTUM CORE 100%',
    '📊 DATA STREAM LIVE',
    '🛡️ SECURITY OPTIMAL',
    '🌐 NETWORK STABLE',
    '💎 GEMS ALIGNED',
    '🔮 PREDICTION MODE'
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetryStatus((prev) => (prev + 1) % statusMessages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Prevent body scroll when mobile menu is open
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    // If it's a hash link, handle smooth scroll
    if (href.startsWith('#')) {
      e.preventDefault();
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setIsMobileMenuOpen(false);
  };

  const handleLogin = () => {
    setLoginModalOpen(true);
  };

  const handleSignup = () => {
    setSignUpModalOpen(true);
  };

  const handleSignOut = () => {
    setLogoutModalOpen(true);
  };

  return (
    <>
      <div className={`repspheres-header-container ${isScrolled ? 'scrolled' : ''}`}>
        <nav className="repspheres-nav-container">
          {/* Edge Mount Indicators */}
          <div className="nav-edge left-edge"></div>
          <div className="nav-edge right-edge"></div>

          {/* Metallic Screws */}
          <div className="nav-screws">
            <div className="screw-wrapper screw-wrapper-top-left">
              <div className="screw">
                <div className="screw-jewel"></div>
              </div>
            </div>
            <div className="screw-wrapper screw-wrapper-top-right">
              <div className="screw">
                <div className="screw-jewel"></div>
              </div>
            </div>
            <div className="screw-wrapper screw-wrapper-bot-left">
              <div className="screw">
                <div className="screw-jewel"></div>
              </div>
            </div>
            <div className="screw-wrapper screw-wrapper-bot-right">
              <div className="screw">
                <div className="screw-jewel"></div>
              </div>
            </div>
          </div>

          <div className="nav-inner">
            {/* Logo */}
            <Link to={logoHref} className="nav-logo">
              <div className="nav-logo-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
                  <defs>
                    <linearGradient id="sphereGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#9f58fa" />
                      <stop offset="100%" stopColor="#4B96DC" />
                    </linearGradient>
                    <radialGradient id="jewelGradient" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#fff" stopOpacity="1" />
                      <stop offset="30%" stopColor="#ff00ff" stopOpacity="1" />
                      <stop offset="60%" stopColor="#00ffff" stopOpacity="1" />
                      <stop offset="100%" stopColor="#ff00aa" stopOpacity="0.9" />
                    </radialGradient>
                    <filter id="glowTrail">
                      <feGaussianBlur in="SourceGraphic" stdDeviation="0.6" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                  <circle cx="16" cy="16" r="12" fill="none" stroke="url(#sphereGradient)" strokeWidth="2" opacity="0.8" />
                  <circle cx="16" cy="16" r="8" fill="none" stroke="url(#sphereGradient)" strokeWidth="1.5" opacity="0.5" />
                  <circle cx="16" cy="16" r="3" fill="url(#jewelGradient)">
                    <animate attributeName="r" values="3;4;3" dur="2s" repeatCount="indefinite"/>
                    <animate attributeName="opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite"/>
                  </circle>
                  <circle cx="16" cy="4" r="1.5" fill="#9f58fa" filter="url(#glowTrail)">
                    <animateTransform attributeName="transform" type="rotate" from="0 16 16" to="360 16 16" dur="6s" repeatCount="indefinite"/>
                  </circle>
                  <circle cx="28" cy="16" r="1.5" fill="#4B96DC" filter="url(#glowTrail)">
                    <animateTransform attributeName="transform" type="rotate" from="0 16 16" to="360 16 16" dur="8s" repeatCount="indefinite"/>
                  </circle>
                  <circle cx="16" cy="28" r="1.5" fill="#4bd48e" filter="url(#glowTrail)">
                    <animateTransform attributeName="transform" type="rotate" from="0 16 16" to="360 16 16" dur="10s" repeatCount="indefinite"/>
                  </circle>
                </svg>
              </div>
              <span className="nav-logo-text">RepSpheres</span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="nav-links">
              {navLinks.map((link, index) => (
                link.external ? (
                  <a 
                    key={index} 
                    href={link.href} 
                    className="nav-link"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className={`nav-link-icon icon-${link.icon}`}></span>
                    <span>{link.label}</span>
                  </a>
                ) : (
                  <Link 
                    key={index} 
                    to={link.href} 
                    className={`nav-link ${location.pathname === link.href ? 'active' : ''}`}
                    onClick={(e) => handleLinkClick(e, link.href)}
                  >
                    <span className={`nav-link-icon icon-${link.icon}`}></span>
                    <span>{link.label}</span>
                  </Link>
                )
              ))}
              {user && (
                <Link
                  to="/analytics/shares"
                  className={`nav-link ${location.pathname === '/analytics/shares' ? 'active' : ''}`}
                >
                  <span className="nav-link-icon icon-analytics"></span>
                  <span>Analytics</span>
                </Link>
              )}
            </nav>

            {/* Right Actions */}
            <div className="nav-actions">
              {user ? (
                <>
                  <button 
                    className="nav-cta"
                    onClick={handleSignOut}
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <button 
                    className="nav-cta-secondary"
                    onClick={handleLogin}
                  >
                    Login
                  </button>
                  <button 
                    className="nav-cta"
                    onClick={handleSignup}
                  >
                    Sign Up
                  </button>
                </>
              )}
              <button className="nav-more" aria-label="More options">
                <div className="nav-more-icon">
                  <span className="nav-more-dot"></span>
                  <span className="nav-more-dot"></span>
                  <span className="nav-more-dot"></span>
                </div>
              </button>
              <button 
                className={`nav-hamburger ${isMobileMenuOpen ? 'active' : ''}`}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle menu"
              >
                <div className="hamburger-icon">
                  <span className="hamburger-line"></span>
                  <span className="hamburger-line"></span>
                  <span className="hamburger-line"></span>
                </div>
              </button>
            </div>
          </div>
        </nav>

        {/* Telemetry System */}
        <div className="telemetry-container">
          <div className="telemetry-rail-system">
            <div className="telemetry-rail-wrapper unified">
              <div className="telemetry-node left"></div>
              <div className="telemetry-status-inline">
                {statusMessages[telemetryStatus]}
              </div>
              <div className="telemetry-node right"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`mobile-menu-overlay ${isMobileMenuOpen ? 'active' : ''}`}
           onClick={(e) => {
             if ((e.target as HTMLElement).classList.contains('mobile-menu-overlay')) {
               setIsMobileMenuOpen(false);
             }
           }}>
        <div className="mobile-menu">
          <nav className="mobile-menu-links">
            {navLinks.map((link, index) => (
              link.external ? (
                <a 
                  key={index}
                  href={link.href} 
                  className="mobile-menu-link"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className={`nav-link-icon icon-${link.icon}`}></span>
                  <span>{link.label}</span>
                </a>
              ) : (
                <Link 
                  key={index}
                  to={link.href} 
                  className="mobile-menu-link"
                  onClick={(e) => handleLinkClick(e, link.href)}
                >
                  <span className={`nav-link-icon icon-${link.icon}`}></span>
                  <span>{link.label}</span>
                </Link>
              )
            ))}
            {user && (
              <Link
                to="/analytics/shares"
                className="mobile-menu-link"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="nav-link-icon icon-analytics"></span>
                <span>Analytics</span>
              </Link>
            )}
          </nav>
        </div>
      </div>

      {/* Auth Modals */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onSuccess={() => {
          setLoginModalOpen(false);
          window.location.reload();
        }}
      />
      <SignUpModal
        isOpen={signUpModalOpen}
        onClose={() => setSignUpModalOpen(false)}
        onSuccess={() => {
          setSignUpModalOpen(false);
          window.location.reload();
        }}
      />
      <LogoutModal
        isOpen={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        onSuccess={() => {
          setLogoutModalOpen(false);
          window.location.reload();
        }}
      />
    </>
  );
};

export default RepSpheresNavBar;