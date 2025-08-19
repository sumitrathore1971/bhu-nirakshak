import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router'
import { AuthProvider } from './context/AuthContext.jsx'
import GlobalFlash from './components/GlobalFlash.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
     <BrowserRouter>
      <AuthProvider>
        <GlobalFlash />
        <App />
      </AuthProvider>
     </BrowserRouter>
  </StrictMode>,
)
