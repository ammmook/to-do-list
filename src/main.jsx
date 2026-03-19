import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App.jsx'

/**
 * WHY GoogleOAuthProvider wraps the entire app:
 * The Google OAuth library needs a context provider at the top level
 * so any component in the tree can use the GoogleLogin button.
 * Placing it here (not in App.jsx) keeps auth infrastructure
 * separate from application logic.
 */
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={googleClientId}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)
