import './index.css';

import React from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root container not found. Expected an element with id "root" in the page HTML.');
}

createRoot(container).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
