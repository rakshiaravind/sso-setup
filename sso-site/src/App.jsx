import { useAuth } from 'react-oidc-context';
import './index.css';

function Navigation() {
  return (
    <nav className="global-nav">
      <div className="nav-container">
        <div className="nav-logo">🏢 Acme Corp</div>
        <div className="nav-links">
          <a href="http://localhost:5173" className="nav-link active">Portal</a>
          <a href="http://localhost:5174" className="nav-link">HR Hub</a>
          <a href="http://localhost:5175" className="nav-link">IT Support</a>
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
    return (
      <div className="app-wrapper">
        <Navigation />
        <div className="container">
          <div className="card error-card">
            <h1>Oops!</h1>
            <p>Authentication error: {auth.error.message}</p>
          </div>
        </div>
      </div>
    );
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
                <h1>Company Portal</h1>
                <p className="subtitle">Welcome back, {auth.user?.profile.name || auth.user?.profile.preferred_username}!</p>
              </div>
            </div>
            
            <div className="content-area">
              <h3>Company Announcements</h3>
              <div className="news-item">
                <strong>Q3 Townhall Meeting</strong>
                <p>Join us next Friday for the quarterly update. Check the HR Hub for details.</p>
              </div>
              <div className="news-item">
                <strong>New IT Security Policies</strong>
                <p>Please review the updated security guidelines on the IT Support Desk.</p>
              </div>
            </div>

            <button className="btn logout-btn" onClick={() => auth.removeUser()}>
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
            🏢
          </div>
          <h1>Company Portal</h1>
          <p className="description">
            Your gateway to Acme Corp's internal tools.
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
