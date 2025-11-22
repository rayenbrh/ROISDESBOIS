import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { useUIStore } from './store/uiStore';

// Initialize theme from stored preference
const storedTheme = localStorage.getItem('ui-storage');
if (storedTheme) {
  try {
    const { state } = JSON.parse(storedTheme);
    if (state?.theme === 'dark') {
      document.documentElement.classList.add('dark');
    }
  } catch (e) {
    console.error('Failed to parse stored theme', e);
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
