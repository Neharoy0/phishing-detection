// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
//import App from './App';
import { App } from './App';  // Named import (correct)
import './index.css';
import { ThemeProvider } from './components/ThemeProvider';

ReactDOM.createRoot(document.getElementById('root')).render(
  <ThemeProvider>
    <App />
  </ThemeProvider>
);
