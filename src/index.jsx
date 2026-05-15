import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

const container = document.getElementById('hero');
const app = (
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

// Hydrate if the container has SSG-pre-rendered content; otherwise mount fresh (dev mode).
if (container.childNodes.length > 0) {
  hydrateRoot(container, app);
} else {
  createRoot(container).render(app);
}
