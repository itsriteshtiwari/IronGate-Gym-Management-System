import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname.includes(path) ? 'active' : '';

  const handleLogout = () => {
    localStorage.removeItem('gymUser');
    navigate('/');
  };

  return (
    <div>
      <div className="topbar">
        <div className="topbar-logo">IRON<span>GATE</span></div>
        <div className="topbar-right">
          <span className="topbar-user">Admin</span>
          <button className="btn-sm btn-danger" onClick={handleLogout}>Logout</button>
        </div>
      </div>
      <div className="nav-tabs">
        <button className={`nav-tab ${isActive('dashboard')}`} onClick={() => navigate('/admin/dashboard')}>Dashboard</button>
        <button className={`nav-tab ${isActive('members')}`} onClick={() => navigate('/admin/members')}>Members</button>
        <button className={`nav-tab ${isActive('attendance')}`} onClick={() => navigate('/admin/attendance')}>Attendance</button>
        <button className={`nav-tab ${isActive('packages')}`} onClick={() => navigate('/admin/packages')}>Packages</button>
        <button className={`nav-tab ${isActive('add-member')}`} onClick={() => navigate('/admin/add-member')}>Add Member</button>
      </div>
      <div className="content">
        <Outlet /> 
      </div>
    </div>
  );
}