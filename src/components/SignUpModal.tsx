import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import './SignUpModal.css';
import { useAuth } from '../auth';
import { useNavigate } from 'react-router-dom';

interface SignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const SignUpModal: React.FC<SignUpModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);
  const modalOverlayRef = useRef<HTMLDivElement>(null);
  const { signUpWithEmail, signInWithProvider } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen) return;

    // Register GSAP
    gsap.registerPlugin();

    // Modal entrance animation with stagger
    if (modalRef.current) {
      gsap.from(modalRef.current, {
        duration: 0.8,
        scale: 0.8,
        rotationX: 10,
        rotationY: 10,
        opacity: 0,
        ease: "elastic.out(1, 0.5)",
        delay: 0.1
      });
    }

    // Only animate screws if they exist
    const screwElements = document.querySelectorAll(".screw");
    if (screwElements.length > 0) {
      gsap.from(screwElements, {
        duration: 0.6,
        scale: 0,
        rotation: -180,
        stagger: 0.1,
        ease: "back.out(1.7)",
        delay: 0.5
      });
    }

    gsap.from(".power-node", {
      duration: 0.4,
      scale: 0,
      stagger: 0.1,
      ease: "power2.out",
      delay: 0.7
    });

    // Form input focus effects
    const inputs = modalRef.current?.querySelectorAll('.form-input');
    inputs?.forEach(input => {
      const handleFocus = (e: Event) => {
        gsap.to(e.target, {
          duration: 0.3,
          scale: 1.02,
          ease: "power2.out"
        });
      };

      const handleBlur = (e: Event) => {
        gsap.to(e.target, {
          duration: 0.3,
          scale: 1,
          ease: "power2.out"
        });
      };

      input.addEventListener('focus', handleFocus);
      input.addEventListener('blur', handleBlur);

      return () => {
        input.removeEventListener('focus', handleFocus);
        input.removeEventListener('blur', handleBlur);
      };
    });

    // Hover effects for buttons
    const buttons = modalRef.current?.querySelectorAll('.social-btn, .submit-btn');
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

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleClose = () => {
    gsap.to(modalRef.current, {
      duration: 0.4,
      scale: 0.8,
      opacity: 0,
      ease: "power2.in",
      onComplete: () => {
        onClose();
        // Reset form
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setError('');
      }
    });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    
    try {
      await signUpWithEmail(email, password);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onSuccess?.();
        onClose();
      }, 800);
    } catch (error: any) {
      console.error('Signup error:', error);
      setError(error.message || 'Failed to create account');
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setIsLoading(true);
    
    try {
      await signInWithProvider('google');
      // OAuth will redirect, so we don't need to do anything here
    } catch (error) {
      console.error('Google signup error:', error);
      setIsLoading(false);
    }
  };

  const switchToLogin = () => {
    // Close this modal and open login modal
    onClose();
    // Navigate to login or trigger login modal
    navigate('/login');
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
        {/* Signup Modal */}
        <div className="signup-modal" ref={modalRef}>
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
          <button className="close-btn" aria-label="Close" onClick={handleClose}></button>

          {/* Logo Section */}
          <div className="logo-section">
            <div className="logo-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
                <defs>
                  <linearGradient id="sphereGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{stopColor:'#ff00aa', stopOpacity:1}} />
                    <stop offset="100%" style={{stopColor:'#00d4ff', stopOpacity:1}} />
                  </linearGradient>
                  <radialGradient id="jewelGradient" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" style={{stopColor:'#ffffff', stopOpacity:1}} />
                    <stop offset="30%" style={{stopColor:'#ff00aa', stopOpacity:1}} />
                    <stop offset="60%" style={{stopColor:'#00ffff', stopOpacity:1}} />
                    <stop offset="100%" style={{stopColor:'#ff00ff', stopOpacity:0.9}} />
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
                <circle cx="32" cy="8" r="3" fill="#ff00aa" opacity="0.8"/>
                <circle cx="56" cy="32" r="3" fill="#00d4ff" opacity="0.8"/>
                <circle cx="32" cy="56" r="3" fill="#4bd48e" opacity="0.8"/>
                <circle cx="8" cy="32" r="3" fill="#9f58fa" opacity="0.8"/>
              </svg>
            </div>
            <h1 className="logo-title">Create Account</h1>
            <p className="logo-subtitle">Join the RepSpheres Network</p>
          </div>

          {/* Form Section */}
          <div className="form-section">
            <form id="signupForm" onSubmit={handleSignup}>
              <input 
                type="email" 
                className="form-input" 
                placeholder="Email address" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
              <input 
                type="password" 
                className="form-input" 
                placeholder="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
              <input 
                type="password" 
                className="form-input" 
                placeholder="Confirm password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required 
              />
              {error && <div className="error-message">{error}</div>}
              <button type="submit" className="submit-btn" disabled={isLoading}>
                Create Account
              </button>
            </form>
          </div>

          {/* Divider */}
          <div className="divider">
            <span className="divider-text">OR SIGN UP WITH</span>
          </div>

          {/* Social Auth Section */}
          <div className="auth-section">
            {/* Google Sign Up */}
            <button className="social-btn google" onClick={handleGoogleSignup} disabled={isLoading}>
              <span className="social-icon">
                <svg width="15" height="15" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
              </span>
              <span>Continue with Google</span>
            </button>
          </div>

          {/* Login Link */}
          <div className="login-link">
            <a href="#" onClick={(e) => { e.preventDefault(); switchToLogin(); }}>
              Already have an account? Sign in
            </a>
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <div className="security-text">
              <span className="led-indicator"></span>
              <span>SECURE ACCOUNT CREATION</span>
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
                  <stop offset="30%" style={{stopColor:'#ff00aa', stopOpacity:1}} />
                  <stop offset="60%" style={{stopColor:'#00ffff', stopOpacity:1}} />
                  <stop offset="100%" style={{stopColor:'#ff00ff', stopOpacity:0.9}} />
                </radialGradient>
              </defs>
              <circle cx="24" cy="24" r="20" fill="none" stroke="url(#loadingGradient)" strokeWidth="4"/>
              <circle cx="24" cy="24" r="10" fill="url(#loadingGradient)"/>
            </svg>
          </div>

          {/* Success Flare */}
          <div className={`success-flare ${showSuccess ? 'active' : ''}`} id="successFlare">
            <svg viewBox="0 0 200 200">
              <defs>
                <radialGradient id="flareGradient">
                  <stop offset="0%" style={{stopColor:'#ff00aa', stopOpacity:1}} />
                  <stop offset="50%" style={{stopColor:'#00ffff', stopOpacity:0.5}} />
                  <stop offset="100%" style={{stopColor:'#ff00ff', stopOpacity:0}} />
                </radialGradient>
              </defs>
              <path d="M100,0 L110,90 L200,100 L110,110 L100,200 L90,110 L0,100 L90,90 Z" fill="url(#flareGradient)"/>
            </svg>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignUpModal;