import 'leaflet/dist/leaflet.css'
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

function showErrorOverlay(message, stack) {
  const existing = document.getElementById('error-overlay');
  if (existing) existing.remove();
  const overlay = document.createElement('div');
  overlay.id = 'error-overlay';
  overlay.style.position = 'fixed';
  overlay.style.inset = '0';
  overlay.style.background = 'rgba(255,255,255,0.95)';
  overlay.style.color = '#b91c1c';
  overlay.style.zIndex = '9999';
  overlay.style.fontFamily = 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial';
  overlay.style.padding = '24px';
  overlay.style.overflow = 'auto';
  overlay.innerHTML = `<h2 style="margin:0 0 8px 0; font-size:20px;">Runtime Error</h2>
    <pre style="white-space:pre-wrap; font-size:14px; color:#111827;">${message || 'Unknown error'}</pre>
    ${stack ? `<pre style="margin-top:8px; white-space:pre-wrap; font-size:12px; color:#374151;">${stack}</pre>` : ''}`;
  document.body.appendChild(overlay);
}

window.addEventListener('error', (e) => {
  showErrorOverlay(e?.error?.message || e.message, e?.error?.stack);
});
window.addEventListener('unhandledrejection', (e) => {
  const reason = e.reason || {};
  showErrorOverlay(reason.message || String(e.reason), reason.stack);
});

const rootEl = document.getElementById("root");
try {
  createRoot(rootEl).render(<App />);
} catch (err) {
  showErrorOverlay(err?.message, err?.stack);
}