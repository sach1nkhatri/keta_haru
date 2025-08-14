import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';
import '../css/AuthPages.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (user) {
    navigate('/dashboard');
    return null;
  }

  return (
    <div className="landing-page">
      {/* Background Elements */}
      <div className="background-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
        <div className="shape shape-4"></div>
      </div>

      <div className="landing-container">
        <div className="landing-content">
          {/* Hero Section */}
          <div className="hero-section">
            <div className="hero-badge">
              <span className="badge-icon">🚀</span>
              <span className="badge-text">Now with Real-time Chat</span>
            </div>
            
            <div className="hero-main">
              <div className="hero-logo">
                <div className="logo-glow"></div>
                <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  <path d="M13 8H7"></path>
                  <path d="M17 12H7"></path>
                </svg>
              </div>
              
              <h1 className="hero-title">
                <span className="title-line">Connect.</span>
                <span className="title-line">Chat.</span>
                <span className="title-line highlight">Collaborate.</span>
              </h1>
              
              <p className="hero-subtitle">
                Experience the future of communication with Ketaharu's cutting-edge real-time messaging platform. 
                Built for modern teams who demand speed, security, and seamless collaboration.
              </p>
              
              <div className="hero-stats">
                <div className="stat-item">
                  <div className="stat-number">10K+</div>
                  <div className="stat-label">Active Users</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">99.9%</div>
                  <div className="stat-label">Uptime</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">50ms</div>
                  <div className="stat-label">Message Speed</div>
                </div>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="features-section">
            <div className="section-header">
              <h2 className="section-title">Why Choose Ketaharu?</h2>
              <p className="section-subtitle">Built with modern technology for the best user experience</p>
            </div>
            
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon-wrapper">
                  <div className="feature-icon">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                      <path d="M2 17l10 5 10-5"></path>
                      <path d="M2 12l10 5 10-5"></path>
                    </svg>
                  </div>
                </div>
                <h3 className="feature-title">Lightning Fast</h3>
                <p className="feature-description">Real-time messaging with sub-50ms delivery. Experience conversations that flow naturally without delays.</p>
                <div className="feature-highlight">⚡ Ultra-low latency</div>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon-wrapper">
                  <div className="feature-icon">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                  </div>
                </div>
                <h3 className="feature-title">Smart Connections</h3>
                <p className="feature-description">Intelligent friend management with seamless requests, approvals, and relationship tracking.</p>
                <div className="feature-highlight">🤝 Smart networking</div>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon-wrapper">
                  <div className="feature-icon">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <circle cx="8.5" cy="8.5" r="1.5"></circle>
                      <polyline points="21,15 16,10 5,21"></polyline>
                    </svg>
                  </div>
                </div>
                <h3 className="feature-title">Modern Design</h3>
                <p className="feature-description">Beautiful, responsive interface with dark mode support and smooth animations throughout.</p>
                <div className="feature-highlight">🎨 Pixel-perfect UI</div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="cta-section">
            <div className="cta-content">
              <h2 className="cta-title">Ready to Get Started?</h2>
              <p className="cta-subtitle">Join thousands of users already connected on Ketaharu</p>
              
              <div className="cta-buttons">
                <button 
                  className="btn btn-primary btn-hero"
                  onClick={() => navigate('/signup')}
                >
                  <span className="btn-text">Start Free Trial</span>
                  <span className="btn-icon">→</span>
                </button>
                <button 
                  className="btn btn-outline btn-hero"
                  onClick={() => navigate('/login')}
                >
                  <span className="btn-text">Sign In</span>
                  <span className="btn-icon">→</span>
                </button>
              </div>
              
              <div className="cta-features">
                <div className="cta-feature">
                  <span className="cta-feature-icon">✓</span>
                  <span>No credit card required</span>
                </div>
                <div className="cta-feature">
                  <span className="cta-feature-icon">✓</span>
                  <span>Free forever plan</span>
                </div>
                <div className="cta-feature">
                  <span className="cta-feature-icon">✓</span>
                  <span>Setup in 2 minutes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage; 