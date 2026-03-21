// src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [role, setRole] = useState('admin');
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    // Clear any previous errors
    setError('');

    try {
      // 1. Send the data to your Python backend
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          pin: pin,
          role: role
        }),
      });

      // 2. Parse the JSON response from Python
      const data = await response.json();

      // 3. Check if login was successful
      if (response.ok && data.success) {
        // Save the user data to the browser so other pages can use it
        localStorage.setItem('gymUser', JSON.stringify(data.user));

        // Redirect based on role
        if (role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/user/overview');
        }
      } else {
        // Display the error message from Python (e.g., "Invalid credentials")
        setError(data.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      console.error("Failed to connect to server:", err);
      setError('Cannot connect to the server. Is Python running?');
    }
  };

  return (
    <div className="login-wrap">
      <div className="login-logo">IRON<span>GATE</span> GYM</div>
      <div className="login-sub">Management System</div>
      <div className="login-card">
        <div className="role-tabs">
          <button className={`role-tab ${role === 'admin' ? 'active' : ''}`} onClick={() => setRole('admin')}>Admin</button>
          <button className={`role-tab ${role === 'user' ? 'active' : ''}`} onClick={() => setRole('user')}>Member</button>
        </div>
        <div className="field">
          <label>Username / Member ID</label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter username" />
        </div>
        <div className="field">
          <label>Password / PIN</label>
          <input type="password" value={pin} onChange={(e) => setPin(e.target.value)} placeholder="Enter password" />
        </div>
        <button className="btn-primary" onClick={handleLogin}>Login</button>
        <div className="error-msg">{error}</div>
      </div>
    </div>
  );
}