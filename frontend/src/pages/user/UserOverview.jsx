import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function UserOverview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('gymUser'));
    if (!user) return navigate('/');

    fetch(`http://localhost:5000/api/user/${user.id}/overview`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setStats(data);
        setLoading(false);
      });
  }, [navigate]);

  if (loading) return <div>Loading...</div>;
  if (!stats) return <div>No active membership found.</div>;

  const pct = stats.total_days > 0 ? Math.min(100, Math.round((stats.attended_days / stats.total_days) * 100)) : 0;
  const status = stats.days_left > 5 ? 'Active' : stats.days_left > 0 ? 'Expiring' : 'Expired';

  return (
    <div className="section active">
      <div className="metric-grid">
        <div className="metric"><div className="metric-label">Days Attended</div><div className="metric-val accent">{stats.attended_days}</div></div>
        <div className="metric"><div className="metric-label">Days Left</div><div className="metric-val">{stats.days_left}</div></div>
        <div className="metric"><div className="metric-label">Total Days</div><div className="metric-val">{stats.total_days}</div></div>
        <div className="metric"><div className="metric-label">Status</div><div className="metric-val" style={{fontSize: '14px', color: status === 'Expired' ? 'var(--color-text-danger)' : 'inherit'}}>{status}</div></div>
      </div>
      
      <div className="card">
        <div className="card-title">Membership Progress</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
          <span>Start: {stats.start_date}</span>
          <span>{pct}% complete</span>
        </div>
        <div className="progress-bar"><div className="progress-fill" style={{ width: `${pct}%` }}></div></div>
        <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '8px' }}>Membership completes after {stats.total_days} attended days</div>
      </div>

      <div className="card">
        <div className="card-title">Your Package</div>
        <div style={{ fontSize: '14px', fontWeight: 500 }}>{stats.package.name} Package</div>
        <div style={{ fontSize: '13px', color: 'var(--gym-accent)', marginBottom: '10px' }}>₹{stats.package.price}/month</div>
        
        <div className="card-title" style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Included Offers</div>
        {stats.package.offers.length === 0 ? (
          <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>Standard membership — no extra offers</div>
        ) : (
          stats.package.offers.map((offer, idx) => (
            <div key={idx} className="offer-card">
              <div className="offer-name">{offer}</div>
              <span className="badge badge-green">Included</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}