import React from 'react'
import ReactDOM from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3500,
        style: {
          background: '#1e1b4b',
          color: '#fff',
          borderRadius: '12px',
          fontSize: '14px',
          fontWeight: '500',
        },
        success: { iconTheme: { primary: '#a78bfa', secondary: '#fff' } },
        error: { iconTheme: { primary: '#f87171', secondary: '#fff' } },
      }}
    />
  </React.StrictMode>
)
