import React, { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import './LogoutModal.css';
import { useAuth } from '../auth';
import { useNavigate } from 'react-router-dom';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const LogoutModal: React.FC<LogoutModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const modalOverlayRef = useRef<HTMLDivElement>(null);
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  // Calculate session duration (mock data for now)
  const getSessionDuration = () => {
    // In a real app, you'd calculate this from login time
    return '2h 34m';
  };

  useEffect(() => {
    if (!isOpen) return;

    // Register GSAP
    gsap.registerPlugin();

    // Modal entrance animation
    gsap.fromTo(modalRef.current, 
      {
        scale: 0.9,
        opacity: 0
      },
      {
        duration: 0.5,
        scale: 1,
        opacity: 1,
        ease: "power2.out",
        delay: 0.1
      }
    );

    // Screw entrance animation with proper modal scoping
    const screwElements = modalRef.current?.querySelectorAll('.screw');
    if (screwElements && screwElements.length > 0) {
      gsap.from(screwElements, {
        duration: 0.6,
        scale: 0,
        rotation: -180,
        stagger: 0.15, // Slightly longer stagger for better effect
        ease: "back.out(1.7)",
        delay: 0.3
      });
    }

    // Power node animation with proper scoping
    const powerNodes = modalRef.current?.querySelectorAll('.power-node');
    if (powerNodes && powerNodes.length > 0) {
      gsap.from(powerNodes, {
        duration: 0.4,
        scale: 0,
        stagger: 0.1,
        ease: "power2.out",
        delay: 0.5
      });
    }

    // Hover effects for buttons
    const buttons = modalRef.current?.querySelectorAll('.action-btn');
    buttons?.forEach(btn => {
      const handleEnter = (e: Event) => {
        gsap.to(e.target, {
          duration: 0.3,
          y: -1.5,
          ease: "power2.out"
        });
      };

      const handleLeave = (e: Event) => {
        gsap.to(e.target, {
          duration: 0.3,
          y: 0,
          ease: "power2.out"
        });
      };

      btn.addEventListener('mouseenter', handleEnter);
      btn.addEventListener('mouseleave', handleLeave);

      return () => {
        btn.removeEventListener('mouseenter', handleEnter);
        btn.removeEventListener('mouseleave', handleLeave);
      };
    });

    // Screw rotation on hover
    const screws = modalRef.current?.querySelectorAll('.screw');
    screws?.forEach((screw) => {
      const handleEnter = () => {
        gsap.to(screw, {
          duration: 0.4,
          rotation: "+=360",
          ease: "power2.inOut"
        });
      };

      screw.addEventListener('mouseenter', handleEnter);

      return () => {
        screw.removeEventListener('mouseenter', handleEnter);
      };
    });

    // 3D tilt effect on modal
    const modal = modalRef.current;
    if (!modal) return;
    
    let modalRect = modal.getBoundingClientRect();

    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX - modalRect.left - modalRect.width / 2;
      const y = e.clientY - modalRect.top - modalRect.height / 2;
      const rotateX = (y / modalRect.height) * 5;
      const rotateY = -(x / modalRect.width) * 5;
      
      gsap.to(modal, {
        duration: 0.3,
        rotationX: rotateX,
        rotationY: rotateY,
        ease: "power2.out"
      });
    };

    const handleMouseLeave = () => {
      gsap.to(modal, {
        duration: 0.5,
        rotationX: 0,
        rotationY: 0,
        ease: "power2.out"
      });
    };

    modal.addEventListener('mousemove', handleMouseMove);
    modal.addEventListener('mouseleave', handleMouseLeave);

    // Update modal rect on resize
    const handleResize = () => {
      modalRect = modal.getBoundingClientRect();
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      modal.removeEventListener('mousemove', handleMouseMove);
      modal.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen]);

  const handleCancel = useCallback(() => {
    gsap.to(modalRef.current, {
      duration: 0.3,
      scale: 0.9,
      opacity: 0,
      ease: "power2.in",
      onComplete: () => {
        onClose();
      }
    });
  }, [onClose]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleCancel();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleCancel]);

  const handleLogout = async () => {
    setIsLoading(true);
    
    try {
      await signOut();
      
      // Animate modal shrinking
      gsap.to(modalRef.current, {
        duration: 0.6,
        scale: 0,
        rotation: 360,
        opacity: 0,
        ease: "power2.in",
        onComplete: () => {
          onSuccess?.();
          onClose();
          // Navigate to home or login page
          navigate('/');
        }
      });
    } catch (error) {
      console.error('Logout error:', error);
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Animated Starfield */}
      <div className="starfield">
        <div className="stars"></div>
      </div>

      {/* Modal Overlay */}
      <div className="modal-overlay" ref={modalOverlayRef}>
        {/* Logout Modal */}
        <div className="logout-modal" ref={modalRef}>
          {/* Power Rail */}
          <div className="power-rail">
            <div className="power-node"></div>
            <div className="power-node"></div>
            <div className="power-node"></div>
            <div className="power-node"></div>
          </div>

          {/* 4-Point Luxury Screws */}
          <div className="screw screw-tl" style={{'--screw-index': 0} as React.CSSProperties}></div>
          <div className="screw screw-tr" style={{'--screw-index': 1} as React.CSSProperties}></div>
          <div className="screw screw-bl" style={{'--screw-index': 2} as React.CSSProperties}></div>
          <div className="screw screw-br" style={{'--screw-index': 3} as React.CSSProperties}></div>

          {/* Close Button */}
          <button className="close-btn" aria-label="Close" onClick={handleCancel}></button>

          {/* Logo Section */}
          <div className="logo-section">
            <div className="logo-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
                <defs>
                  <linearGradient id="sphereGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{stopColor:'#ff4444', stopOpacity:1}} />
                    <stop offset="100%" style={{stopColor:'#ff6b35', stopOpacity:1}} />
                  </linearGradient>
                  <radialGradient id="jewelGradient" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" style={{stopColor:'#ffffff', stopOpacity:1}} />
                    <stop offset="30%" style={{stopColor:'#ff4444', stopOpacity:1}} />
                    <stop offset="60%" style={{stopColor:'#ff6b35', stopOpacity:1}} />
                    <stop offset="100%" style={{stopColor:'#ff0040', stopOpacity:0.9}} />
                  </radialGradient>
                </defs>
                
                {/* Outer sphere ring */}
                <circle cx="32" cy="32" r="24" fill="none" stroke="url(#sphereGradient)" strokeWidth="3" opacity="0.8"/>
                
                {/* Inner sphere ring */}
                <circle cx="32" cy="32" r="16" fill="none" stroke="url(#sphereGradient)" strokeWidth="2" opacity="0.6"/>
                
                {/* Animated Jewel Core */}
                <circle cx="32" cy="32" r="6" fill="url(#jewelGradient)" className="logo-jewel">
                  <animate attributeName="r" values="6;8;6" dur="3s" repeatCount="indefinite"/>
                  <animate attributeName="opacity" values="0.8;1;0.8" dur="3s" repeatCount="indefinite"/>
                </circle>
                
                {/* Orbital dots */}
                <circle cx="32" cy="8" r="3" fill="#ff4444" opacity="0.8"/>
                <circle cx="56" cy="32" r="3" fill="#ff6b35" opacity="0.8"/>
                <circle cx="32" cy="56" r="3" fill="#ffd93d" opacity="0.8"/>
                <circle cx="8" cy="32" r="3" fill="#ff8866" opacity="0.8"/>
              </svg>
            </div>
            <h1 className="logo-title">Sign Out</h1>
          </div>

          {/* Logout Message */}
          <p className="logout-message">
            Are you sure you want to sign out of your RepSpheres account?
          </p>

          {/* Session Info */}
          <div className="session-info">
            <div className="session-item">
              <span className="session-label">Session Duration</span>
              <span className="session-value">{getSessionDuration()}</span>
            </div>
            <div className="session-item">
              <span className="session-label">Account</span>
              <span className="session-value">{user?.email || 'user@repspheres.com'}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button className="action-btn cancel" onClick={handleCancel} disabled={isLoading}>
              Cancel
            </button>
            <button className="action-btn logout" onClick={handleLogout} disabled={isLoading}>
              Sign Out
            </button>
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <div className="security-text">
              <span className="led-indicator"></span>
              <span>SECURE SESSION TERMINATION</span>
              <span className="led-indicator"></span>
              <span className="led-indicator"></span>
            </div>
          </div>

          {/* Loading Overlay */}
          <div className={`loading-overlay ${isLoading ? 'active' : ''}`} id="loadingOverlay">
            <svg className="loading-jewel" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
              <defs>
                <radialGradient id="loadingGradient">
                  <stop offset="0%" style={{stopColor:'#ffffff', stopOpacity:1}} />
                  <stop offset="30%" style={{stopColor:'#ff4444', stopOpacity:1}} />
                  <stop offset="60%" style={{stopColor:'#ff6b35', stopOpacity:1}} />
                  <stop offset="100%" style={{stopColor:'#ff0040', stopOpacity:0.9}} />
                </radialGradient>
              </defs>
              <circle cx="24" cy="24" r="20" fill="none" stroke="url(#loadingGradient)" strokeWidth="4"/>
              <circle cx="24" cy="24" r="10" fill="url(#loadingGradient)"/>
            </svg>
          </div>
        </div>
      </div>
    </>
  );
};

export default LogoutModal;