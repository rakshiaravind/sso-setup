import { useEffect, useState } from 'react';
import { useAuth } from 'react-oidc-context';
import './index.css';

function Navigation() {
  return (
    <nav className="global-nav">
      <div className="nav-container">
        <div className="nav-logo">
          <span>Acme</span> HR Hub
        </div>
        <div className="nav-links">
          <a href="http://localhost:5173" className="nav-link">
            🌐 Portal
          </a>
          <a href="http://localhost:5174" className="nav-link active">
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
  const [notification, setNotification] = useState('');

  // Local state for Leave Requests list
  const [leaveRequests, setLeaveRequests] = useState([
    { id: 1, type: 'Vacation', startDate: '2026-08-10', endDate: '2026-08-14', reason: 'Annual family summer trip', status: 'approved' },
    { id: 2, type: 'Sick Leave', startDate: '2026-05-12', endDate: '2026-05-13', reason: 'Dental surgery recovery', status: 'approved' }
  ]);

  // Form states
  const [leaveType, setLeaveType] = useState('Vacation');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (!auth.isAuthenticated && !auth.isLoading && !auth.activeNavigator && !hasTriedSignin) {
      setHasTriedSignin(true);
      auth.signinSilent().catch(() => {
        // Silent sign-in failed, meaning user is not logged in on Keycloak
        // Our existing error handler will gracefully drop them to the login screen
      });
    }
  }, [auth, hasTriedSignin]);

  const handleLeaveSubmit = (e) => {
    e.preventDefault();
    if (!startDate || !endDate || !reason) {
      alert('Please fill out all fields.');
      return;
    }
    const newRequest = {
      id: Date.now(),
      type: leaveType,
      startDate,
      endDate,
      reason,
      status: 'pending'
    };
    setLeaveRequests([newRequest, ...leaveRequests]);
    showNotification(`Successfully submitted ${leaveType} request for ${startDate} to ${endDate}.`);
    
    // Clear form
    setStartDate('');
    setEndDate('');
    setReason('');
  };

  const downloadPaystub = (period) => {
    showNotification(`Downloading paystub for pay period ${period}...`);
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
            <p style={{ fontWeight: 600, color: 'var(--text-accent)' }}>Checking credentials with Keycloak...</p>
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
              <h1>Authentication Error</h1>
              <p className="description">Error details: {auth.error.message}</p>
              <button className="btn" onClick={() => void auth.removeUser()}>
                Return to Login
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

    return (
      <div className="app-wrapper">
        <Navigation />
        <div className="container">
          <div className="hero-banner">
            <div className="hero-text">
              <h1>Welcome to the HR Hub</h1>
              <p>Manage your vacation requests, view corporate benefits, download recent paystubs, and update profiles.</p>
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
                    <span className="label">Title:</span>
                    <span className="val">Staff Engineer</span>
                  </div>
                  <div className="profile-detail-item">
                    <span className="label">Department:</span>
                    <span className="val">Engineering</span>
                  </div>
                  <div className="profile-detail-item">
                    <span className="label">Manager:</span>
                    <span className="val">Sarah Jenkins</span>
                  </div>
                  <div className="profile-detail-item">
                    <span className="label">Hired Date:</span>
                    <span className="val">Mar 15, 2023</span>
                  </div>
                  <div className="profile-detail-item">
                    <span className="label">Benefits Enrollment:</span>
                    <span className="val" style={{ color: 'var(--primary)' }}>Active (Auto)</span>
                  </div>
                </div>

                <button className="btn logout-btn" onClick={() => void auth.signoutRedirect()}>
                  🔒 Terminate SSO Session
                </button>
              </div>
            </div>

            <div className="main-panel">
              <div className="dashboard-section">
                <h3 className="section-title">✈️ Request Time Off</h3>
                
                <form onSubmit={handleLeaveSubmit} className="leave-form-grid">
                  <div className="form-group">
                    <label className="form-label">Leave Type</label>
                    <select
                      className="form-select"
                      value={leaveType}
                      onChange={(e) => setLeaveType(e.target.value)}
                    >
                      <option value="Vacation">Vacation</option>
                      <option value="Sick Leave">Sick Leave</option>
                      <option value="Parental Leave">Parental Leave</option>
                      <option value="Personal Leave">Personal Leave</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Start Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">End Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="form-group full-width">
                    <label className="form-label">Reason / Notes</label>
                    <textarea
                      className="form-textarea"
                      placeholder="Please state the purpose of your time off request..."
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group full-width" style={{ marginTop: '8px' }}>
                    <button type="submit" className="btn">
                      Submit Time Off Request
                    </button>
                  </div>
                </form>

                <div className="requests-list">
                  <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>Leave Request History</h4>
                  {leaveRequests.map((req) => (
                    <div key={req.id} className="request-item">
                      <div className="request-info">
                        <h5>{req.type}</h5>
                        <p>{req.startDate} to {req.endDate} — <em>"{req.reason}"</em></p>
                      </div>
                      <span className={`request-status ${req.status}`}>
                        {req.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="dashboard-section">
                <h3 className="section-title">💸 Paystubs & Tax Statements</h3>
                <div className="paystubs-table-wrapper">
                  <table className="paystubs-table">
                    <thead>
                      <tr>
                        <th>Pay Period</th>
                        <th>Gross Earnings</th>
                        <th>Net Paid</th>
                        <th>Status</th>
                        <th>Download</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Sep 01, 2026 - Sep 30, 2026</td>
                        <td>$8,450.00</td>
                        <td>$6,230.12</td>
                        <td style={{ color: 'var(--primary)', fontWeight: 600 }}>Paid</td>
                        <td>
                          <button className="paystubs-download-btn" onClick={() => downloadPaystub('Sep 2026')}>
                            📄 Download PDF
                          </button>
                        </td>
                      </tr>
                      <tr>
                        <td>Aug 01, 2026 - Aug 31, 2026</td>
                        <td>$8,450.00</td>
                        <td>$6,230.12</td>
                        <td style={{ color: 'var(--primary)', fontWeight: 600 }}>Paid</td>
                        <td>
                          <button className="paystubs-download-btn" onClick={() => downloadPaystub('Aug 2026')}>
                            📄 Download PDF
                          </button>
                        </td>
                      </tr>
                      <tr>
                        <td>Jul 01, 2026 - Jul 31, 2026</td>
                        <td>$8,450.00</td>
                        <td>$6,230.12</td>
                        <td style={{ color: 'var(--primary)', fontWeight: 600 }}>Paid</td>
                        <td>
                          <button className="paystubs-download-btn" onClick={() => downloadPaystub('Jul 2026')}>
                            📄 Download PDF
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
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
          <div className="logo-placeholder">👥</div>
          <h1>HR Employee Hub</h1>
          <p className="description">
            Access internal human resources policies, view benefits packages, submit vacation leaves, and view historical payroll slips. Secure SSO authentication.
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
