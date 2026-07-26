import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { FloraProvider } from './state.jsx'
import './styles.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <FloraProvider>
      <App />
    </FloraProvider>
  </StrictMode>,
)
