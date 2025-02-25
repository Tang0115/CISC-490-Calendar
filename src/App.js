import React, { useState, useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import DayDetails from './components/DayDetails';
import './App.css';

function App() {
  const [selectedDate, setSelectedDate] = useState(new Date('2025-02-03')); 
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState('light'); 
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

  const handleThemeToggle = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <BrowserRouter>
      <div className={`app ${theme}`}>
        <header>
          <div className="header-left">
            <button className="menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
              ☰
            </button>
            <span className="current-time">{currentTime}</span> 
          </div>
          <h1>Daily Planner</h1> 
          <div className="header-right">
            <button onClick={handleThemeToggle} className="theme-toggle-btn">
              {theme === 'light' ? '🌞' : '🌙'}
            </button>
          </div>
          {menuOpen && (
            <div className="menu">
              <button onClick={() => setMenuOpen(false)}>This Button does nothing for now</button> 
            </div>
          )}
        </header>
        <div className="main-content">
          <Routes>
            <Route 
              path="/" 
              element={
                <DayDetails 
                  selectedDate={selectedDate} 
                  setSelectedDate={setSelectedDate} 
                />
              } 
            />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;