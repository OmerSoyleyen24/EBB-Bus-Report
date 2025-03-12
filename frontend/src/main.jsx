import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import App from './App';
import ReportPage from './ReportPage';
import "./index.css"

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Kök eleman bulunamadı!');
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <Router>
    <Routes>
      <Route path="/report" element={<ReportPage />} />
      <Route path="/" element={<App />} />
    </Routes>
  </Router>
);
