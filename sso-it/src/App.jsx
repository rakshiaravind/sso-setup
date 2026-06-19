import { useEffect, useState } from 'react';
import { useAuth } from 'react-oidc-context';
import './index.css';

function Navigation() {
  return (
    <nav className="global-nav">
      <div className="nav-container">
        <div className="nav-logo">
          <span>Acme</span> IT Support
        </div>
        <div className="nav-links">
          <a href="http://localhost:5173" className="nav-link">
            🌐 Portal
          </a>
          <a href="http://localhost:5174" className="nav-link">
            👥 HR Hub
          </a>
          <a href="http://localhost:5175" className="nav-link active">
            🛠️ IT Support
          </a>
        </div>
      </div>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="global-footer">
      <p>© 2026 Acme Corp. All rights reserved. Centralized Single Sign-On Gateway (OIDC & Keycloak Protected).</p>
    </footer>
  );
}

function App() {
  const auth = useAuth();
  const [hasTriedSignin, setHasTriedSignin] = useState(false);
  const [notification, setNotification] = useState('');
  
  // Local tickets state
  const [tickets, setTickets] = useState([
    { id: 'TKT-492', title: 'Monitor not turning on', status: 'in_progress', category: 'Hardware', priority: 'high', date: 'Oct 14, 2026', desc: 'Main workspace monitor does not power on even after swapping cables.' },
    { id: 'TKT-311', title: 'Software Installation Request (Figma Pro)', status: 'resolved', category: 'Software', priority: 'low', date: 'Oct 12, 2026', desc: 'Need Figma Professional access for designing frontend specs.' },
    { id: 'TKT-285', title: 'Access to staging database denied', status: 'open', category: 'Access', priority: 'medium', date: 'Oct 10, 2026', desc: 'Getting credential refusal errors when connecting to the PostgreSQL staging database.' }
  ]);

  // Filters
  const [activeFilter, setActiveFilter] = useState('all');

  // Form states
  const [ticketTitle, setTicketTitle] = useState('');
  const [category, setCategory] = useState('Hardware');
  const [priority, setPriority] = useState('medium');
  const [description, setDescription] = useState('');

  // FAQ states (track index of expanded FAQ, null if closed)
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  useEffect(() => {
    if (!auth.isAuthenticated && !auth.isLoading && !auth.activeNavigator && !hasTriedSignin) {
      setHasTriedSignin(true);
      auth.signinSilent().catch(() => {
        // Silent sign-in failed, meaning user is not logged in on Keycloak
        // Our existing error handler will gracefully drop them to the login screen
      });
    }
  }, [auth, hasTriedSignin]);

  const handleTicketSubmit = (e) => {
    e.preventDefault();
    if (!ticketTitle || !description) {
      alert('Please enter a ticket title and description.');
      return;
    }
    const randomNum = Math.floor(100 + Math.random() * 900);
    const newTicket = {
      id: `TKT-${randomNum}`,
      title: ticketTitle,
      status: 'open',
      category,
      priority,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      desc: description
    };
    
    setTickets([newTicket, ...tickets]);
    showNotification(`Ticket ${newTicket.id} created successfully! IT support team has been alerted.`);
    
    // Clear form
    setTicketTitle('');
    setDescription('');
  };

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification('');
    }, 4000);
  };

  if (auth.isLoading) {
    return (
      <div className="app-wrapper">
        <Navigation />
        <div className="container landing-container">
          <div className="landing-card loading-card">
            <div className="spinner"></div>
            <p style={{ fontWeight: 600, color: 'var(--text-accent)' }}>Authenticating Secure IT Session...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (auth.error) {
    if (auth.error.message === 'Session not active' || auth.error.message === 'login_required' || auth.error.message.includes('Session not active')) {
      setTimeout(() => { void auth.removeUser(); }, 0);
    } else {
      return (
        <div className="app-wrapper">
          <Navigation />
          <div className="container landing-container">
            <div className="landing-card error-card">
              <div className="logo-placeholder" style={{ background: 'rgba(244, 63, 94, 0.1)' }}>⚠️</div>
              <h1>Access Denied</h1>
              <p className="description">IT Support authentication error: {auth.error.message}</p>
              <button className="btn" onClick={() => void auth.removeUser()}>
                Return to Portal
              </button>
            </div>
          </div>
          <Footer />
        </div>
      );
    }
  }

  if (auth.isAuthenticated) {
    const username = auth.user?.profile.preferred_username || 'Employee';
    const fullName = auth.user?.profile.name || username;
    const email = auth.user?.profile.email || `${username}@acme.corp`;

    // Filter tickets
    const filteredTickets = tickets.filter(t => {
      if (activeFilter === 'all') return true;
      return t.status === activeFilter;
    });

    return (
      <div className="app-wrapper">
        <Navigation />
        <div className="container">
          <div className="hero-banner">
            <div className="hero-text">
              <h1>IT Support Desk</h1>
              <p>Create helpdesk tickets, monitor real-time infrastructure status, and search for troubleshooting guidelines.</p>
            </div>
          </div>

          {notification && (
            <div className="alert-toast">
              <span>🔔</span> {notification}
            </div>
          )}

          <div className="dashboard-grid">
            <div className="sidebar-panel">
              <div className="profile-card">
                <div className="avatar-wrapper">
                  <div className="avatar">
                    {username.charAt(0).toUpperCase()}
                  </div>
                  <div className="status-badge"></div>
                </div>
                <h2>{fullName}</h2>
                <div className="subtitle">{email}</div>
                
                <div className="profile-details-list">
                  <div className="profile-detail-item">
                    <span className="label">Access Role:</span>
                    <span className="val">Staff Engineer</span>
                  </div>
                  <div className="profile-detail-item">
                    <span className="label">Registered Device:</span>
                    <span className="val">MacBook Pro 16"</span>
                  </div>
                  <div className="profile-detail-item">
                    <span className="label">Office IP:</span>
                    <span className="val">10.200.4.15</span>
                  </div>
                  <div className="profile-detail-item">
                    <span className="label">Compliance Check:</span>
                    <span className="val" style={{ color: 'var(--success)', fontWeight: 'bold' }}>Passed</span>
                  </div>
                </div>

                <button className="btn logout-btn" onClick={() => void auth.signoutRedirect()}>
                  🔒 Terminate SSO Session
                </button>
              </div>

              <div className="profile-card" style={{ padding: '24px', textAlign: 'left' }}>
                <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: 'white', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>Infrastructure Health</h4>
                <div className="health-indicators-grid" style={{ gridTemplateColumns: '1fr' }}>
                  <div className="health-card">
                    <div className="health-dot operational"></div>
                    <div className="health-info">
                      <h5>SSO Gateway</h5>
                      <p>Operational</p>
                    </div>
                  </div>
                  <div className="health-card">
                    <div className="health-dot operational"></div>
                    <div className="health-info">
                      <h5>Corporate Email</h5>
                      <p>Operational</p>
                    </div>
                  </div>
                  <div className="health-card">
                    <div className="health-dot operational"></div>
                    <div className="health-info">
                      <h5>HR Hub Portal</h5>
                      <p>Operational</p>
                    </div>
                  </div>
                  <div className="health-card">
                    <div className="health-dot maintenance"></div>
                    <div className="health-info">
                      <h5>Global VPN</h5>
                      <p>Scheduled Maintenance</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="main-panel">
              <div className="dashboard-section">
                <h3 className="section-title">📂 Raise Support Ticket</h3>
                <form onSubmit={handleTicketSubmit} className="ticket-form-grid">
                  <div className="form-group full-width">
                    <label className="form-label">Subject / Ticket Title</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Cannot connect to office printer Acme-Floor2"
                      value={ticketTitle}
                      onChange={(e) => setTicketTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                      className="form-select"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <option value="Hardware">Hardware</option>
                      <option value="Software">Software</option>
                      <option value="Access">Access / IAM</option>
                      <option value="Network">Network / WiFi</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Urgency</label>
                    <select
                      className="form-select"
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                    >
                      <option value="low">Low - General inquiry</option>
                      <option value="medium">Medium - Disrupted work</option>
                      <option value="high">High - Critical blocker</option>
                    </select>
                  </div>

                  <div className="form-group full-width">
                    <label className="form-label">Detailed Description</label>
                    <textarea
                      className="form-textarea"
                      placeholder="Describe what occurred, any error messages, and what steps you took..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group full-width" style={{ marginTop: '8px' }}>
                    <button type="submit" className="btn">
                      Create Support Ticket
                    </button>
                  </div>
                </form>
              </div>

              <div className="dashboard-section">
                <h3 className="section-title">🎫 My Support Tickets</h3>
                
                <div className="filter-tabs">
                  <button className={`filter-tab ${activeFilter === 'all' ? 'active' : ''}`} onClick={() => setActiveFilter('all')}>All Tickets</button>
                  <button className={`filter-tab ${activeFilter === 'open' ? 'active' : ''}`} onClick={() => setActiveFilter('open')}>Open</button>
                  <button className={`filter-tab ${activeFilter === 'in_progress' ? 'active' : ''}`} onClick={() => setActiveFilter('in_progress')}>In Progress</button>
                  <button className={`filter-tab ${activeFilter === 'resolved' ? 'active' : ''}`} onClick={() => setActiveFilter('resolved')}>Resolved</button>
                </div>

                <div className="tickets-list">
                  {filteredTickets.length > 0 ? (
                    filteredTickets.map((t) => (
                      <div key={t.id} className="ticket-item">
                        <div>
                          <div className="ticket-title-row">
                            <span className="ticket-id">{t.id}</span>
                            <span className="ticket-title">{t.title}</span>
                            <span className={`badge status-${t.status}`}>{t.status.replace('_', ' ')}</span>
                            <span className={`badge priority-${t.priority}`}>{t.priority}</span>
                          </div>
                          <div className="ticket-meta">
                            <span><strong>Category:</strong> {t.category}</span>
                            <span><strong>Created:</strong> {t.date}</span>
                          </div>
                          <p style={{ marginTop: '10px', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                            {t.desc}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                      No tickets found for status "{activeFilter}".
                    </div>
                  )}
                </div>
              </div>

              <div className="dashboard-section">
                <h3 className="section-title">❓ Frequently Asked Questions</h3>
                <div className="faq-list">
                  <div className={`faq-item ${openFaqIndex === 0 ? 'active' : ''}`}>
                    <button className="faq-question-btn" onClick={() => toggleFaq(0)}>
                      <span>🔐 How do I reset my VPN password?</span>
                      <span className="faq-icon-arrow">➔</span>
                    </button>
                    <div className="faq-answer">
                      Your VPN password is synchronized with your central LDAP directory credentials. To change or reset your global password, please navigate to the central Keycloak account page or click reset password on the main portal authentication screen.
                    </div>
                  </div>

                  <div className={`faq-item ${openFaqIndex === 1 ? 'active' : ''}`}>
                    <button className="faq-question-btn" onClick={() => toggleFaq(1)}>
                      <span>💾 What software is pre-approved for installation?</span>
                      <span className="faq-icon-arrow">➔</span>
                    </button>
                    <div className="faq-answer">
                      Pre-approved software includes development runtimes, IDEs (VS Code, IntelliJ, PyCharm), collaboration tools (Slack, Teams), and design software (Figma). Unlisted tools must undergo security review before installation.
                    </div>
                  </div>

                  <div className={`faq-item ${openFaqIndex === 2 ? 'active' : ''}`}>
                    <button className="faq-question-btn" onClick={() => toggleFaq(2)}>
                      <span>🌐 How do I connect my device to Acme corporate Wi-Fi?</span>
                      <span className="faq-icon-arrow">➔</span>
                    </button>
                    <div className="faq-answer">
                      Use the network SSID "Acme-Corporate". Select WPA2-Enterprise security and sign in using your standard LDAP username and password credentials. Trust the corporate certificate if prompted by your system.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="app-wrapper">
      <Navigation />
      <div className="container landing-container">
        <div className="landing-card">
          <div className="logo-placeholder">🛠️</div>
          <h1>IT Support Desk</h1>
          <p className="description">
            Access automated diagnostics, request hardware upgrades, submit helpdesk requests, or view system status dashboards. Secure SSO portal.
          </p>
          <button className="btn" onClick={() => void auth.signinRedirect()}>
            🔐 Sign In with SSO
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default App;
