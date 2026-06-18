import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from 'react-oidc-context'
import './index.css'
import App from './App.jsx'

const oidcConfig = {
  authority: "http://localhost:8050/realms/master",
  client_id: "sso-site-client",
  redirect_uri: window.location.origin,
  onSigninCallback: (_user) => {
    window.history.replaceState(
      {},
      document.title,
      window.location.pathname
    )
  }
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider {...oidcConfig}>
      <App />
    </AuthProvider>
  </StrictMode>,
)
