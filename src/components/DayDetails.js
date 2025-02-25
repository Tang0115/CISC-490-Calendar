import React, { useMemo, useState, useEffect } from 'react';

function DayDetails({ selectedDate, setSelectedDate }) {
  const [newTask, setNewTask] = useState({
    title: '', 
    description: '', 
    startTime: '', 
    endTime: '', 
    category: 'Work',
    priority: 'Medium',
    recurring: false,
  });
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem('tasks');
    return savedTasks ? JSON.parse(savedTasks) : [];
  }); 
  const [showDelete, setShowDelete] = useState(null); 

  const categories = useMemo(() => ['Work', 'Personal', 'School'], []); 
  const priorities = ['Low', 'Medium', 'High', 'Critical'];

  const months = useMemo(() => [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ], []);

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 20 }, (_, i) => currentYear - 10 + i);
  }, []);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const handleAddTask = () => {
    if (newTask.title.trim() && newTask.description.trim() && newTask.startTime && newTask.endTime) {
      const taskData = {
        taskId: Date.now().toString(), 
        title: newTask.title,
        description: newTask.description,
        startTime: newTask.startTime,
        endTime: newTask.endTime,
        category: newTask.category,
        priority: newTask.priority,
        recurring: newTask.recurring,
        metadata: { createdBy: 'CurrentUser', lastUpdated: new Date().toISOString() },
        date: selectedDate.toISOString().split('T')[0], 
      };
      setTasks(prevTasks => [...prevTasks, taskData]);
      setNewTask({
        title: '',
        description: '',
        startTime: '',
        endTime: '',
        category: 'Work',
        priority: 'Medium',
        recurring: false,
      });
    }
  };

  const handleUpdateTask = (taskId, updatedTask) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.taskId === taskId ? { ...task, ...updatedTask, metadata: { ...task.metadata, lastUpdated: new Date().toISOString() } } : task
      )
    );
  };

  const handleDeleteTask = (taskId) => {
    setTasks(prevTasks => prevTasks.filter(task => task.taskId !== taskId));
    setShowDelete(null); 
  };

  const dayTasks = useMemo(() => 
    tasks.filter(task => task.date === selectedDate.toISOString().split('T')[0])
      .sort((a, b) => new Date(`1970/01/01 ${a.startTime}`) - new Date(`1970/01/01 ${b.startTime}`)), // Sort by start time
    [tasks, selectedDate]
  );

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Low': return '#A8CCDC';
      case 'Medium': return '#DDA853';
      case 'High': return '#164046';
      case 'Critical': return '#FF0000';
      default: return '#FFFFFF';
    }
  };

  const toggleTask = (taskId) => {
    const task = tasks.find(t => t.taskId === taskId);
    if (task) {
      const updatedTask = { ...task, completed: !task.completed, metadata: { ...task.metadata, lastUpdated: new Date().toISOString() } };
      handleUpdateTask(taskId, updatedTask);
    }
  };

  const handlePreviousDay = () => {
    const prevDate = new Date(selectedDate);
    prevDate.setDate(prevDate.getDate() - 1);
    setSelectedDate(prevDate);
  };

  const handleNextDay = () => {
    const nextDate = new Date(selectedDate);
    nextDate.setDate(nextDate.getDate() + 1);
    setSelectedDate(nextDate);
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  const handleDateChange = (year, month, day) => {
    const newDate = new Date(year, month, day);
    if (!isNaN(newDate.getTime())) {
      setSelectedDate(newDate);
    }
  };

  const handleInputChange = (field, value) => {
    setNewTask(prev => ({ ...prev, [field]: value }));
  };

  const addSuggestionToTasks = (suggestion) => {
    const dateMatch = suggestion.match(/for (\d{1,2}\/\d{1,2}\/\d{4})/);
    const timeMatch = suggestion.match(/at (\d{1,2}:\d{2} (?:AM|PM))/);
    const titleMatch = suggestion.match(/(Schedule|Plan|Add) (.*) \(/);

    if (dateMatch && timeMatch && titleMatch) {
      const [, dateStr] = dateMatch;
      const [, timeStr] = timeMatch;
      const [, , title] = titleMatch;

      const [month, day, year] = dateStr.split('/').map(Number);
      const [hours, minutes] = timeStr.replace(' ', '').split(':').map(Number);
      const ampm = timeStr.includes('PM') && hours !== 12 ? hours + 12 : (timeStr.includes('AM') && hours === 12 ? 0 : hours);
      const startTime = `${String(ampm).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
      const endTime = `${String(ampm + 1).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`; 

      const taskDate = new Date(year, month - 1, day);
      if (taskDate.toDateString() === selectedDate.toDateString()) {
        const taskData = {
          taskId: Date.now().toString(),
          title: title.trim(),
          description: '',
          startTime,
          endTime,
          category: 'Personal', 
          priority: 'Medium',
          recurring: false,
          metadata: { createdBy: 'AI', lastUpdated: new Date().toISOString() },
          date: selectedDate.toISOString().split('T')[0],
        };
        setTasks(prevTasks => [...prevTasks, taskData]);
      } else {
        alert('Suggestion date does not match the current selected date.');
      }
    } else {
      alert('Could not parse suggestion. Please try another suggestion or add manually.');
    }
  };

  const suggestions = useMemo(() => [
    `Schedule a 30-min workout for ${selectedDate.toLocaleDateString()} at 6:00 PM`,
    `Add a reminder for daily Twitter time on ${selectedDate.toLocaleDateString()} at 8:00 PM`
  ], [selectedDate]);

  return (
    <div className="day-details">
      <h2>Details for {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h2>
      <div className="date-navigation">
        <button onClick={handlePreviousDay}>Previous Day</button>
        <button onClick={handleToday}>Today</button>
        <button onClick={handleNextDay}>Next Day</button>
        <div className="date-selector">
          <select 
            value={selectedDate.getFullYear()} 
            onChange={(e) => handleDateChange(parseInt(e.target.value), selectedDate.getMonth(), selectedDate.getDate())}
          >
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <select 
            value={selectedDate.getMonth()} 
            onChange={(e) => handleDateChange(selectedDate.getFullYear(), parseInt(e.target.value), selectedDate.getDate())}
          >
            {months.map((month, index) => (
              <option key={month} value={index}>{month}</option>
            ))}
          </select>
          <select 
            value={selectedDate.getDate()} 
            onChange={(e) => handleDateChange(selectedDate.getFullYear(), selectedDate.getMonth(), parseInt(e.target.value))}
          >
            {Array.from({ length: new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate() }, (_, i) => i + 1).map(day => (
              <option key={day} value={day}>{day}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="details-content">
        <div className="timeline-section">
          <h3>Today’s Timeline</h3>
          <div className="timeline">
            {dayTasks.map(task => (
              <div 
                key={task.taskId} 
                className="timeline-item" 
                style={{ borderLeft: `5px solid ${getPriorityColor(task.priority)}`, padding: '10px', margin: '10px 0', position: 'relative' }}
                onMouseEnter={() => setShowDelete(task.taskId)}
                onMouseLeave={() => setShowDelete(null)}
              >
                <span className={task.completed ? 'completed' : ''}>
                  Starting Time: {task.startTime} - Ending Time: {task.endTime} - {task.title} - {task.description} - {task.category} [{task.priority}]
                  {task.recurring && <span className="recurring-badge">🔄</span>}
                  <div className="task-metadata">
                    Created by: {task.metadata.createdBy} | Last Updated: {new Date(task.metadata.lastUpdated).toLocaleString()}
                  </div>
                </span>
                <input
                  type="checkbox"
                  checked={task.completed || false}
                  onChange={() => toggleTask(task.taskId)}
                  style={{ marginLeft: '10px' }}
                />
                {showDelete === task.taskId && (
                  <button 
                    className="delete-button" 
                    onClick={() => handleDeleteTask(task.taskId)}
                    style={{ 
                      position: 'absolute', 
                      right: '10px', 
                      top: '50%', 
                      transform: 'translateY(-50%)', 
                      padding: '5px 10px', 
                      backgroundColor: '#FF0000', 
                      color: '#FFFFFF', 
                      border: 'none', 
                      borderRadius: '5px', 
                      cursor: 'pointer',
                      transition: 'background-color 0.3s ease'
                    }}
                  >
                    X
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="right-section">
          <h3>Add Task</h3> 
          <div className="schedule-section">
            <div className="task-input-complex">
              <div className="input-row">
                <label>Task Category:</label>
                <select value={newTask.category} onChange={(e) => handleInputChange('category', e.target.value)}>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option> // Removed "(Advanced)" suffix
                  ))}
                </select>
              </div>
              <div className="input-row">
                <label>Task Title:</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter Task Title..."
                />
              </div>
              <div className="input-row">
                <label>Task Description:</label>
                <input
                  type="text"
                  value={newTask.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter Task Description..."
                />
              </div>
              <div className="input-row">
                <label>Starting Time:</label>
                <input
                  type="time"
                  value={newTask.startTime}
                  onChange={(e) => handleInputChange('startTime', e.target.value)}
                />
              </div>
              <div className="input-row">
                <label>Ending Time:</label>
                <input
                  type="time"
                  value={newTask.endTime}
                  onChange={(e) => handleInputChange('endTime', e.target.value)}
                />
              </div>
              <div className="input-row">
                <label>Priority:</label>
                <select value={newTask.priority} onChange={(e) => handleInputChange('priority', e.target.value)}>
                  {priorities.map(p => (
                    <option key={p} value={p}>{p} Priority</option>
                  ))}
                </select>
              </div>
              <div className="input-row">
                <label>Recurring Task:</label>
                <input type="checkbox" checked={newTask.recurring} onChange={(e) => handleInputChange('recurring', e.target.checked)} />
              </div>
              <div className="input-row">
                <button onClick={handleAddTask}>Add</button> {/* Ensure Add button stays inside the box */}
              </div>
            </div>
          </div>
          <div className="ai-suggestions">
            <h3>AI-Powered Suggestions</h3>
            <ul>
              {suggestions.map((suggestion, index) => (
                <li 
                  key={index} 
                  className="suggestion-item" 
                  onClick={() => addSuggestionToTasks(suggestion)}
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DayDetails;