import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../auth';
import LoginModal from './LoginModal';
import LogoutModal from './LogoutModal';
import './RepSpheresNavBar.css';

const RepSpheresNavBar = () => {
  const navRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLAnchorElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  // Update theme colors based on scroll position
  const updateThemeColors = () => {
    const y = window.scrollY;
    const windowHeight = window.innerHeight;
    const body = document.body;
    const root = document.documentElement;
    
    // Calculate which section we're in
    const section = Math.floor(y / windowHeight);
    
    // Define color themes for each section
    const themes = [
      { impossible: '255, 0, 255', shift: '0, 255, 255', deep: '255, 0, 170' }, // Hero - Magenta/Cyan
      { impossible: '77, 212, 142', shift: '255, 170, 0', deep: '0, 255, 136' }, // Market - Green/Orange
      { impossible: '255, 107, 53', shift: '255, 204, 224', deep: '245, 57, 105' }, // Canvas - Orange/Pink
      { impossible: '75, 150, 220', shift: '159, 88, 250', deep: '0, 212, 255' }, // Sphere OS - Blue/Purple
      { impossible: '245, 57, 105', shift: '255, 0, 255', deep: '159, 88, 250' }  // Podcasts - Pink/Magenta
    ];
    
    const currentTheme = themes[Math.min(section, themes.length - 1)];
    
    // Update CSS variables
    root.style.setProperty('--gem-impossible', `rgb(${currentTheme.impossible})`);
    root.style.setProperty('--gem-shift', `rgb(${currentTheme.shift})`);
    root.style.setProperty('--gem-deep', `rgb(${currentTheme.deep})`);
    
    // For rgba() usage in CSS
    body.style.setProperty('--gem-impossible', currentTheme.impossible);
    body.style.setProperty('--gem-shift', currentTheme.shift);
    body.style.setProperty('--gem-deep', currentTheme.deep);
  };

  useEffect(() => {
    // Initial theme update
    updateThemeColors();

    // Handle scroll for navbar effects
    const handleScroll = () => {
      const offset = window.scrollY * 0.05;
      document.documentElement.style.setProperty('--scroll-offset', `${offset}px`);
      
      setIsScrolled(window.scrollY > 50);
      
      // Update theme colors on scroll
      updateThemeColors();
    };

    window.addEventListener('scroll', handleScroll);

    // 3D Tilt Effect on Logo
    const logo = logoRef.current;
    if (logo) {
      const handleMouseMove = (e: MouseEvent) => {
        const rect = logo.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        const rotateX = (y / rect.height) * 10;
        const rotateY = -(x / rect.width) * 10;
        logo.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      };

      const handleMouseLeave = () => {
        logo.style.transform = '';
      };

      const handleMouseEnter = () => {
        const jewel = logo.querySelector('circle[fill="url(#jewelGradient)"]');
        if (jewel) {
          (jewel as SVGElement).style.filter = 'brightness(1.5)';
          setTimeout(() => {
            (jewel as SVGElement).style.filter = '';
          }, 150);
        }
      };

      logo.addEventListener('mousemove', handleMouseMove);
      logo.addEventListener('mouseleave', handleMouseLeave);
      logo.addEventListener('mouseenter', handleMouseEnter);

      // Cleanup
      return () => {
        logo.removeEventListener('mousemove', handleMouseMove);
        logo.removeEventListener('mouseleave', handleMouseLeave);
        logo.removeEventListener('mouseenter', handleMouseEnter);
        window.removeEventListener('scroll', handleScroll);
      };
    }
  }, []);

  const isLinkActive = (href: string) => {
    return location.pathname === href;
  };

  const handleGetStarted = () => {
    if (user) {
      // Already logged in, maybe redirect to dashboard
      window.location.href = '/';
    } else {
      setLoginModalOpen(true);
    }
  };

  const handleMoreClick = () => {
    if (user) {
      setLogoutModalOpen(true);
    } else {
      setLoginModalOpen(true);
    }
  };

  return (
    <>
      {/* Fixed Header Container */}
      <div className={`header-container ${isScrolled ? 'scrolled' : ''}`}>
        {/* Award-Winning Navigation Bar with Ultimate Features */}
        <nav className="nav-container" ref={navRef}>
          {/* Edge Mount Indicators */}
          <div className="nav-edge left-edge"></div>
          <div className="nav-edge right-edge"></div>

          {/* Advanced Metallic Screws with Wrappers */}
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
            {/* Identity */}
            <Link to="/" className="nav-logo" ref={logoRef}>
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
              <span className="nav-logo-text">Canvas</span>
            </Link>

            {/* Navigation Links */}
            <nav className="nav-links">
              <a 
                href="https://marketdata.repspheres.com/" 
                className={`nav-link ${isLinkActive('/market-data') ? 'active' : ''}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="nav-link-icon icon-market"></span>
                <span>Market Data</span>
              </a>
              <Link 
                to="/" 
                className={`nav-link ${isLinkActive('/') ? 'active' : ''}`}
              >
                <span className="nav-link-icon icon-canvas"></span>
                <span>Canvas</span>
              </Link>
              <a 
                href="https://crm.repspheres.com/" 
                className={`nav-link ${isLinkActive('/sphere-os') ? 'active' : ''}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="nav-link-icon icon-sphere"></span>
                <span>Sphere oS</span>
              </a>
              <a 
                href="https://workshop-homepage.netlify.app/?page=podcast" 
                className={`nav-link ${isLinkActive('/podcasts') ? 'active' : ''}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="nav-link-icon icon-podcasts"></span>
                <span>Podcasts</span>
              </a>
            </nav>

            {/* Right Actions */}
            <div className="nav-actions">
              <button className="nav-cta" onClick={handleGetStarted}>
                {user ? 'Dashboard' : 'Get Started'}
              </button>
              <button className="nav-more" aria-label="More options" onClick={handleMoreClick}>
                <div className="nav-more-icon">
                  <span className="nav-more-dot"></span>
                  <span className="nav-more-dot"></span>
                  <span className="nav-more-dot"></span>
                </div>
              </button>
            </div>
          </div>
        </nav>
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