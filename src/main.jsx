import React from 'react'
import ReactDOM from 'react-dom/client'
import { MotionConfig } from 'framer-motion'
import App from './App.jsx'
import './index.css'

// reducedMotion="user": si la persona pidió menos movimiento en su sistema,
// framer-motion desactiva las animaciones de transformación (giros, latidos,
// escalas, desplazamientos) en todo el sitio.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MotionConfig reducedMotion="user">
      <App />
    </MotionConfig>
  </React.StrictMode>,
)
