import { useAuth } from 'react-oidc-context';
import './index.css';

function App() {
  const auth = useAuth();

  if (auth.isLoading) {
    return (
      <div className="container">
        <div className="card loading-card">
          <div className="spinner"></div>
          <p>Authenticating...</p>
        </div>
      </div>
    );
  }

  if (auth.error) {
    return (
      <div className="container">
        <div className="card error-card">
          <h1>Oops!</h1>
          <p>Authentication error: {auth.error.message}</p>
        </div>
      </div>
    );
  }

  if (auth.isAuthenticated) {
    return (
      <div className="container">
        <div className="card dashboard-card">
          <div className="dashboard-header">
            <div className="avatar">
              {auth.user?.profile.preferred_username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h1>Welcome, {auth.user?.profile.preferred_username}!</h1>
              <p className="subtitle">You have successfully authenticated via SSO.</p>
            </div>
          </div>
          
          <div className="profile-details">
            <div className="detail-item">
              <span className="label">Name</span>
              <span className="value">{auth.user?.profile.name || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="label">Email</span>
              <span className="value">{auth.user?.profile.email || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="label">Subject ID</span>
              <span className="value">{auth.user?.profile.sub}</span>
            </div>
          </div>

          <button className="btn logout-btn" onClick={() => auth.removeUser()}>
            Log Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card landing-card">
        <div className="logo-placeholder">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="url(#paint0_linear)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 16V12" stroke="url(#paint0_linear)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 8H12.01" stroke="url(#paint0_linear)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <defs>
              <linearGradient id="paint0_linear" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                <stop stopColor="#6366f1"/>
                <stop offset="1" stopColor="#ec4899"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        <h1>SSO Portal</h1>
        <p className="description">
          Experience seamless authentication powered by OpenID Connect and Keycloak.
        </p>
        <button className="btn login-btn" onClick={() => void auth.signinRedirect()}>
          Sign In with SSO
        </button>
      </div>
    </div>
  );
}

export default App;
