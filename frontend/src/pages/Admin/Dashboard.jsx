import React, { useEffect, useState } from 'react';

export default function Dashboard() {
  const [data, setData] = useState({
    totalMembers: 0, activeToday: 0, activeMembers: 0, expired: 0, inGym: [], activity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/admin/dashboard')
      .then(res => res.json())
      .then(resData => {
        if(resData.success) {
          setData({
            totalMembers: resData.total_members,
            activeToday: resData.active_today,
            activeMembers: resData.active_members,
            expired: resData.expired,
            inGym: resData.in_gym,
            activity: resData.activity
          });
        }
        setLoading(false);
      })
      .catch(err => { console.error(err); setLoading(false); });
  }, []);

  if (loading) return <div style={{ padding: '20px' }}>Loading...</div>;

  return (
    <div className="section active">
      <div className="metric-grid">
        <div className="metric"><div className="metric-label">Total Members</div><div className="metric-val">{data.totalMembers}</div></div>
        <div className="metric"><div className="metric-label">Active Today</div><div className="metric-val accent">{data.activeToday}</div></div>
        <div className="metric"><div className="metric-label">Active Members</div><div className="metric-val">{data.activeMembers}</div></div>
        <div className="metric"><div className="metric-label">Expired</div><div className="metric-val">{data.expired}</div></div>
      </div>
      
      <div className="card">
        <div className="card-title">Currently In Gym</div>
        <table className="tbl">
          <thead><tr><th>Member</th><th>Check-in</th><th>Package</th></tr></thead>
          <tbody>
            {data.inGym.length === 0 ? (
              <tr><td colSpan="3" style={{color: 'var(--color-text-secondary)'}}>No one currently checked in</td></tr>
            ) : (
              data.inGym.map((m, i) => (
                <tr key={i}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div className="avatar">{m.name.charAt(0)}</div>{m.name}
                    </div>
                  </td>
                  <td>{m.time_in}</td>
                  <td><span className="badge badge-blue">{m.package_name || 'Basic'}</span></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="card">
        <div className="card-title">Today's Activity</div>
        <table className="tbl">
          <thead><tr><th>Member</th><th>In</th><th>Out</th></tr></thead>
          <tbody>
            {data.activity.length === 0 ? (
              <tr><td colSpan="3" style={{color: 'var(--color-text-secondary)'}}>No activity today</td></tr>
            ) : (
              data.activity.map((a, i) => (
                <tr key={i}>
                  <td>{a.name}</td>
                  <td>{a.time_in}</td>
                  <td>{a.time_out ? a.time_out : <span className="badge badge-green">In Gym</span>}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}