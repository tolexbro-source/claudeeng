import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { StoreProvider } from './context/StoreContext'
import { LanguageProvider } from './context/LanguageContext'
import { CurrencyProvider } from './context/CurrencyContext'
import { AuthProvider } from './context/AuthContext'
import './index.css'

// จุดเริ่มต้นของแอป — Language (ภาษา) + Currency (สกุลเงิน) + Auth (ล็อกอิน) + Store (ข้อมูลร้าน)
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LanguageProvider>
      <CurrencyProvider>
        <AuthProvider>
          <StoreProvider>
            <App />
          </StoreProvider>
        </AuthProvider>
      </CurrencyProvider>
    </LanguageProvider>
  </React.StrictMode>
)
