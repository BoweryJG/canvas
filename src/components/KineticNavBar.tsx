import { useEffect, useRef, useState } from 'react';
import { navigationStyles } from './KineticStyles';

const KineticNavBar = () => {
  const navRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLAnchorElement>(null);
  const [systemMessage, setSystemMessage] = useState('⏱ AI SYNC 97%');

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
      if (navRef.current) {
        if (window.scrollY > 50) {
          navRef.current.classList.add('scrolled');
        } else {
          navRef.current.classList.remove('scrolled');
        }
      }
      
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

      logo.addEventListener('mousemove', handleMouseMove);
      logo.addEventListener('mouseleave', handleMouseLeave);

      // Cleanup
      return () => {
        logo.removeEventListener('mousemove', handleMouseMove);
        logo.removeEventListener('mouseleave', handleMouseLeave);
      };
    }

    // Status messages with emojis
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
    
    let statusIndex = 0;
    const statusInterval = setInterval(() => {
      statusIndex = (statusIndex + 1) % statusMessages.length;
      setSystemMessage(statusMessages[statusIndex]);
      console.log('Status updated to:', statusMessages[statusIndex]);
    }, 6000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(statusInterval);
    };
  }, []);

  return (
    <>
      <style>{navigationStyles}</style>
      
      <nav className="nav-container" ref={navRef}>
        {/* Edge Mount Indicators */}
        <div className="nav-edge left-edge"></div>
        <div className="nav-edge right-edge"></div>
        
        {/* 4-Point Luxury Screws */}
        <div className="nav-screw screw-tl"></div>
        <div className="nav-screw screw-tr"></div>
        <div className="nav-screw screw-bl"></div>
        <div className="nav-screw screw-br"></div>
        
        {/* Dynamic Nav Rail */}
        <div className="nav-rail">
          <div className="power-node"></div>
          <div className="power-node"></div>
          <div className="power-node"></div>
          <div className="power-node"></div>
        </div>
        
        <div className="nav-inner">
          {/* Logo with Animated Jewel Core */}
          <a href="#" className="nav-logo" ref={logoRef}>
            <div className="nav-logo-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
                <defs>
                  <linearGradient id="navSphereGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#9f58fa', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: '#4B96DC', stopOpacity: 1 }} />
                  </linearGradient>
                  <radialGradient id="navCenterGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" style={{ stopColor: '#ffffff', stopOpacity: 0.8 }} />
                    <stop offset="50%" style={{ stopColor: '#9f58fa', stopOpacity: 0.5 }} />
                    <stop offset="100%" style={{ stopColor: '#4B96DC', stopOpacity: 0 }} />
                  </radialGradient>
                  <radialGradient id="navJewelGradient" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                    <stop offset="30%" stopColor="#ff00ff" stopOpacity="1" />
                    <stop offset="60%" stopColor="#00ffff" stopOpacity="1" />
                    <stop offset="100%" stopColor="#ff00aa" stopOpacity="0.9" />
                  </radialGradient>
                </defs>
                
                {/* Outer sphere ring */}
                <circle cx="16" cy="16" r="12" fill="none" stroke="url(#navSphereGradient)" strokeWidth="2" opacity="0.8"/>
                
                {/* Inner sphere ring */}
                <circle cx="16" cy="16" r="8" fill="none" stroke="url(#navSphereGradient)" strokeWidth="1.5" opacity="0.6"/>
                
                {/* Animated Jewel Core */}
                <circle cx="16" cy="16" r="3" fill="url(#navJewelGradient)" className="logo-jewel">
                  <animate attributeName="r" values="3;4;3" dur="2s" repeatCount="indefinite"/>
                  <animate attributeName="opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite"/>
                </circle>
                
                {/* Orbital dots */}
                <circle cx="16" cy="4" r="1.5" fill="#9f58fa"/>
                <circle cx="28" cy="16" r="1.5" fill="#4B96DC"/>
                <circle cx="16" cy="28" r="1.5" fill="#4bd48e"/>
                <circle cx="4" cy="16" r="1.5" fill="#00d4ff"/>
              </svg>
            </div>
            <span className="nav-logo-text">RepSpheres</span>
          </a>

          {/* System Status - positioned between logo and nav */}
          <div className="nav-status-indicator">
            <span className="nav-status-text">{systemMessage}</span>
          </div>

          {/* Navigation Links */}
          <nav className="nav-links">
            <a href="#market-data" className="nav-link">
              <span className="nav-link-icon icon-market"></span>
              <span>Market Data</span>
            </a>
            <a href="#canvas" className="nav-link">
              <span className="nav-link-icon icon-canvas"></span>
              <span>Canvas</span>
            </a>
            <a href="#sphere-os" className="nav-link">
              <span className="nav-link-icon icon-sphere"></span>
              <span>Sphere oS</span>
            </a>
            <a href="#podcasts" className="nav-link">
              <span className="nav-link-icon icon-podcasts"></span>
              <span>Podcasts</span>
            </a>
          </nav>

          {/* Right Actions */}
          <div className="nav-actions">
            <button className="primary-button nav-primary-button">
              <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
                <use href="#regulatory-window"/>
              </svg>
              SECURE MY TERRITORY
            </button>
            <button className="nav-more" aria-label="More options">
              <div className="nav-more-icon">
                <span className="nav-more-dot"></span>
                <span className="nav-more-dot"></span>
                <span className="nav-more-dot"></span>
              </div>
            </button>
          </div>
        </div>
      </nav>
    </>
  );
};

export default KineticNavBar;