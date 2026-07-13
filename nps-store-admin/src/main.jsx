import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { LanguageProvider } from './context/LanguageContext'
import { CurrencyProvider } from './context/CurrencyContext'
import { AuthProvider } from './context/AuthContext'
import { StoreProvider } from './context/StoreContext'
import './index.css'

// จุดเริ่มต้นของแอปแอดมิน — Language (ภาษา) + Currency (สกุลเงิน) + Auth (ล็อกอิน) + Store (สินค้า/ออเดอร์)
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
