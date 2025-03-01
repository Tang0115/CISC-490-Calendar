import React, { useState, useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import DayDetails from './components/DayDetails';
import CalendarView from './components/CalendarView';
import './App.css';

function App() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState('light');
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  const [view, setView] = useState('day');

  const [events, setEvents] = useState(() => {
    const savedTasks = localStorage.getItem('tasks');
    return savedTasks ? JSON.parse(savedTasks) : [];
  });

  const handleThemeToggle = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(events));
  }, [events]);

  const switchView = (newView) => {
    if (newView === 'day') {
      setSelectedDate(new Date()); // Reset to today when switching to Day View
    }
    setView(newView);
    setMenuOpen(false);
  };

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
          <h1>Calendar</h1>
          <div className="header-right">
            <button onClick={handleThemeToggle} className="theme-toggle-btn">
              {theme === 'light' ? '☀️' : '🌙'}
            </button>
          </div>
          {menuOpen && (
            <div className="menu">
              <button
                className={view === 'day' ? 'active' : ''}
                onClick={() => switchView('day')}
              >
                Day View
              </button>
              <button
                className={view === 'calendar' ? 'active' : ''}
                onClick={() => switchView('calendar')}
              >
                Calendar View
              </button>
            </div>
          )}
        </header>
        <div className="main-content">
          <Routes>
            <Route
              path="/"
              element={
                view === 'day' ? (
                  <DayDetails
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                    events={events}
                    setEvents={setEvents}
                  />
                ) : (
                  <CalendarView
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                    events={events}
                    setEvents={setEvents}
                  />
                )
              }
            />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;