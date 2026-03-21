import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Pages
import Login from './pages/Login';

// Admin Components
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Members from './pages/admin/Members';
import Attendance from './pages/admin/Attendance';
import Packages from './pages/admin/Packages';
import AddMember from './pages/admin/AddMember';

// User Components
import UserLayout from './pages/user/UserLayout';
import UserOverview from './pages/user/UserOverview';
import UserHistory from './pages/user/UserHistory';
import UserRenew from './pages/user/UserRenew';
import UserCheckin from './pages/user/UserCheckin';

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<Login />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="members" element={<Members />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="packages" element={<Packages />} />
            <Route path="add-member" element={<AddMember />} />
          </Route>

          {/* User Routes */}
          <Route path="/user" element={<UserLayout />}>
           <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<UserOverview />} />
            <Route path="checkin" element={<UserCheckin />} />
            <Route path="history" element={<UserHistory />} />
            <Route path="renew" element={<UserRenew />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;