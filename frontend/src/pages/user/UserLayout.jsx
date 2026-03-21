import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

export default function UserLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = (path) => location.pathname.includes(path) ? 'active' : '';

  const handleLogout = () => {
    localStorage.removeItem('gymUser');
    navigate('/');
  };

  // Get name from local storage
  const user = JSON.parse(localStorage.getItem('gymUser') || '{}');
  const firstName = user.name ? user.name.split(' ')[0] : 'Member';

  return (
    <div>
      <div className="topbar">
        <div className="topbar-logo">IRON<span>GATE</span></div>
        <div className="topbar-right">
          <span className="topbar-user">{firstName}</span>
          <button className="btn-sm btn-danger" onClick={handleLogout}>Logout</button>
        </div>
      </div>
      <div className="nav-tabs">
        <button className={`nav-tab ${isActive('overview')}`} onClick={() => navigate('/user/overview')}>Overview</button>
        <button className={`nav-tab ${isActive('checkin')}`} onClick={() => navigate('/user/checkin')}>Check In/Out</button>
        <button className={`nav-tab ${isActive('history')}`} onClick={() => navigate('/user/history')}>History</button>
        <button className={`nav-tab ${isActive('renew')}`} onClick={() => navigate('/user/renew')}>Renew</button>
      </div>
      <div className="content">
        <Outlet /> 
      </div>
    </div>
  );
}