import { useEffect, useState } from 'react';
import { useAuth } from 'react-oidc-context';
import './index.css';

const ANNOUNCEMENTS = [
  {
    id: 1,
    title: 'Q3 Townhall Meeting',
    category: 'event',
    date: 'Oct 20, 2026',
    summary: 'Join us next Friday for the quarterly company update. We will cover the product roadmap, financial goals, and Q&A.',
    content: 'Our Q3 Townhall is scheduled for Friday, October 30th at 10:00 AM EST. The executive team will share updates on our international expansion, product roadmap milestones, and Q3 financial performance. There will be a 20-minute Q&A at the end. You can pre-submit questions in the HR Hub or ask live.'
  },
  {
    id: 2,
    title: 'New IT Security Policies',
    category: 'security',
    date: 'Oct 18, 2026',
    summary: 'Please review the updated security guidelines. All employees are required to complete training by month-end.',
    content: 'With the rise of sophisticated phishing attempts, Acme Corp is rolling out updated security protocols. Essential updates include mandatory MFA key rotation, stricter password requirements, and compliance checks on personal devices used for work. All staff must complete the security module on the IT Support Desk portal by October 31st.'
  },
  {
    id: 3,
    title: 'Open Enrollment Begins Soon',
    category: 'info',
    date: 'Oct 15, 2026',
    summary: 'Open enrollment for healthcare benefits begins next month. Learn about updated plans and options.',
    content: 'Our annual open benefits enrollment period will run from November 1st to November 20th. This year we have introduced a new HSA-matching plan option and expanded mental wellness coverages. Check the HR Hub portal for the full brochure, rate calculators, and details on optional info webinars.'
  },
  {
    id: 4,
    title: 'Office Renovation Update',
    category: 'info',
    date: 'Oct 10, 2026',
    summary: 'Renovations on the 3rd floor are almost complete. Preview the new collaboration spaces.',
    content: 'The 3rd floor construction is winding down! Beginning next Monday, the new layout featuring 12 focus phone booths, open-concept collaboration spaces, and an espresso bar will be fully open. Feel free to book rooms via the local calendar. We thank everyone for their patience during the construction noise.'
  }
];

function Navigation() {
  return (
    <nav className="global-nav">
      <div className="nav-container">
        <div className="nav-logo">
          <span>Acme</span> Corp Portal
        </div>
        <div className="nav-links">
          <a href="http://localhost:5173" className="nav-link active">
            🌐 Portal
          </a>
          <a href="http://localhost:5174" className="nav-link">
            👥 HR Hub
          </a>
          <a href="http://localhost:5175" className="nav-link">
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
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModalItem, setActiveModalItem] = useState(null);
  const [greeting, setGreeting] = useState('Welcome back');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  useEffect(() => {
    if (!auth.isAuthenticated && !auth.isLoading && !auth.activeNavigator && !hasTriedSignin) {
      setHasTriedSignin(true);
      auth.signinSilent().catch(() => {
        // Silent sign-in failed, meaning user is not logged in on Keycloak
        // Our existing error handler will gracefully drop them to the login screen
      });
    }
  }, [auth, hasTriedSignin]);

  if (auth.isLoading) {
    return (
      <div className="app-wrapper">
        <Navigation />
        <div className="container landing-container">
          <div className="landing-card loading-card">
            <div className="spinner"></div>
            <p style={{ fontWeight: 600, color: 'var(--text-accent)' }}>Authenticating with Keycloak SSO...</p>
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
              <h1>Authentication Failed</h1>
              <p className="description">Error details: {auth.error.message}</p>
              <button className="btn" onClick={() => void auth.removeUser()}>
                Return to Sign In screen
              </button>
            </div>
          </div>
          <Footer />
        </div>
      );
    }
  }

  if (auth.isAuthenticated) {
    const filteredAnnouncements = ANNOUNCEMENTS.filter(item =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const username = auth.user?.profile.preferred_username || 'Employee';
    const fullName = auth.user?.profile.name || username;

    return (
      <div className="app-wrapper">
        <Navigation />
        <div className="container">
          <div className="hero-banner">
            <div className="hero-text">
              <h1>{greeting}, {fullName}!</h1>
              <p>Welcome to your central Acme intranet portal. Your sessions are securely managed via Single Sign-On.</p>
            </div>
          </div>

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
                <div className="subtitle">@{username}</div>
                
                <div className="profile-details-list">
                  <div className="profile-detail-item">
                    <span className="label">Auth Provider:</span>
                    <span className="val">Keycloak</span>
                  </div>
                  <div className="profile-detail-item">
                    <span className="label">SSO Client:</span>
                    <span className="val">sso-site-client</span>
                  </div>
                  <div className="profile-detail-item">
                    <span className="label">Security Level:</span>
                    <span className="val" style={{ color: 'var(--success)' }}>Highly Secure</span>
                  </div>
                </div>

                <button className="btn logout-btn" onClick={() => void auth.signoutRedirect()}>
                  🔒 Terminate SSO Session
                </button>
              </div>
            </div>

            <div className="main-panel">
              <div className="dashboard-section">
                <div className="section-header-row">
                  <h3 className="section-title">🏢 Connected Departments</h3>
                </div>
                <div className="tools-grid">
                  <a href="http://localhost:5174" className="tool-card">
                    <div className="tool-icon">👥</div>
                    <h4>HR Hub</h4>
                    <p>Access vacation requests, benefits enrollment, salary slips, and corporate policies.</p>
                    <span className="tool-arrow">Launch App →</span>
                  </a>
                  <a href="http://localhost:5175" className="tool-card">
                    <div className="tool-icon">🛠️</div>
                    <h4>IT Support Desk</h4>
                    <p>Submit IT tickets, check live system status, read FAQs, or request hardware upgrades.</p>
                    <span className="tool-arrow">Launch App →</span>
                  </a>
                  <div className="tool-card" style={{ cursor: 'not-allowed', opacity: 0.7 }}>
                    <div className="tool-icon">📚</div>
                    <h4>Corporate Wiki</h4>
                    <p>Central documentation site containing engineering guides, product specs, and brand assets.</p>
                    <span className="tool-arrow" style={{ color: 'var(--text-muted)' }}>Under Maintenance</span>
                  </div>
                </div>
              </div>

              <div className="dashboard-section">
                <div className="section-header-row">
                  <h3 className="section-title">📢 Company Announcements</h3>
                  <div className="search-container">
                    <svg className="search-icon-svg" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      className="search-input"
                      placeholder="Search announcements..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                {filteredAnnouncements.length > 0 ? (
                  <div className="announcements-list">
                    {filteredAnnouncements.map((item) => (
                      <div key={item.id} className="announcement-item" onClick={() => setActiveModalItem(item)}>
                        <div className="announcement-content-left">
                          <div className="announcement-meta">
                            <span className={`tag tag-${item.category}`}>{item.category}</span>
                            <span className="announcement-date">{item.date}</span>
                          </div>
                          <h4>{item.title}</h4>
                          <p>{item.summary}</p>
                        </div>
                        <div className="announcement-readmore">
                          ➔
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-results">
                    No announcements found matching "{searchQuery}".
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {activeModalItem && (
          <div className="modal-overlay" onClick={() => setActiveModalItem(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setActiveModalItem(null)}>✕</button>
              <div className="modal-header">
                <div className="announcement-meta">
                  <span className={`tag tag-${activeModalItem.category}`}>{activeModalItem.category}</span>
                  <span className="announcement-date">{activeModalItem.date}</span>
                </div>
                <h2>{activeModalItem.title}</h2>
              </div>
              <div className="modal-body">
                <p>{activeModalItem.content}</p>
              </div>
            </div>
          </div>
        )}
        <Footer />
      </div>
    );
  }

  return (
    <div className="app-wrapper">
      <Navigation />
      <div className="container landing-container">
        <div className="landing-card">
          <div className="logo-placeholder">🏢</div>
          <h1>Acme Corp Portal</h1>
          <p className="description">
            Your single gateway to Acme Corp's internal departments, communication channels, and employee services. Securely sign in via Keycloak OIDC.
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
