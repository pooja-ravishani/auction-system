import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { AuthProvider } from './context/AuthContext'; // 🧠 import AuthProvider

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    {/* 🧩 Wrap App inside AuthProvider so context works everywhere */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);

// Optional performance monitoring
reportWebVitals();
