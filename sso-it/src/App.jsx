import { useAuth } from 'react-oidc-context';
import './index.css';

function Navigation() {
  return (
    <nav className="global-nav">
      <div className="nav-container">
        <div className="nav-logo">🏢 Acme Corp</div>
        <div className="nav-links">
          <a href="http://localhost:5173" className="nav-link">Portal</a>
          <a href="http://localhost:5174" className="nav-link">HR Hub</a>
          <a href="http://localhost:5175" className="nav-link active">IT Support</a>
        </div>
      </div>
    </nav>
  );
}

function App() {
  const auth = useAuth();

  if (auth.isLoading) {
    return (
      <div className="app-wrapper">
        <Navigation />
        <div className="container">
          <div className="card loading-card">
            <div className="spinner"></div>
            <p>Authenticating...</p>
          </div>
        </div>
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
          <div className="container">
            <div className="card error-card">
              <h1>Oops!</h1>
              <p>Authentication error: {auth.error.message}</p>
              <button className="btn" onClick={() => void auth.removeUser()} style={{marginTop: '16px'}}>
                Return to Login
              </button>
            </div>
          </div>
        </div>
      );
    }
  }

  if (auth.isAuthenticated) {
    return (
      <div className="app-wrapper">
        <Navigation />
        <div className="container">
          <div className="card dashboard-card">
            <div className="dashboard-header">
              <div className="avatar">
                {auth.user?.profile.preferred_username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <h1>IT Support Desk</h1>
                <p className="subtitle">Technical Assistance & Tickets</p>
              </div>
            </div>
            
            <div className="content-area">
              <h3>My Support Tickets</h3>
              <div className="news-item">
                <strong>[TKT-492] Monitor not turning on</strong>
                <p>Status: In Progress | Assigned to: John Doe</p>
              </div>
              <div className="news-item">
                <strong>[TKT-311] Software Installation Request</strong>
                <p>Status: Resolved | Closed on: Oct 12</p>
              </div>
              
              <button className="btn" style={{marginTop: '16px'}}>
                Create New Ticket
              </button>
            </div>

            <button className="btn logout-btn" onClick={() => void auth.signoutRedirect()}>
              Log Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-wrapper">
      <Navigation />
      <div className="container">
        <div className="card landing-card">
          <div className="logo-placeholder">
            💻
          </div>
          <h1>IT Support Desk</h1>
          <p className="description">
            Get help with your devices, software, and access requests.
          </p>
          <button className="btn login-btn" onClick={() => void auth.signinRedirect()}>
            Sign In with SSO
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
