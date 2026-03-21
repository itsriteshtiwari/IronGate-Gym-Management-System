import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function UserRenew() {
  const [packages, setPackages] = useState([]);
  const [selectedPkg, setSelectedPkg] = useState('');
  const [duration, setDuration] = useState('1');
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:5000/api/admin/packages')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.packages.length > 0) {
          setPackages(data.packages);
          setSelectedPkg(data.packages[0].id);
        }
      });
  }, []);

  const pkgDetails = packages.find(p => p.id === selectedPkg);
  const multiplier = duration === '12' ? 10 : duration === '6' ? 5.5 : duration === '3' ? 2.8 : 1;
  const totalAmount = pkgDetails ? Math.round(pkgDetails.price_per_month * multiplier) : 0;

  const handleRenew = async () => {
    const user = JSON.parse(localStorage.getItem('gymUser'));
    const response = await fetch(`http://localhost:5000/api/user/${user.id}/renew`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ packageId: selectedPkg, duration })
    });
    const data = await response.json();
    if (data.success) {
      setMsg('Payment successful! Membership renewed.');
      setTimeout(() => navigate('/user/overview'), 2000);
    } else {
      setMsg('Failed to renew membership.');
    }
  };

  return (
    <div className="section active">
      <div className="card">
        <div className="card-title">Renew Membership</div>
        
        <div className="form-group" style={{ marginBottom: '12px' }}>
          <label>Select Package</label>
          <select value={selectedPkg} onChange={(e) => setSelectedPkg(e.target.value)}>
            {packages.map(p => <option key={p.id} value={p.id}>{p.name} — ₹{p.price_per_month}/mo</option>)}
          </select>
        </div>
        
        <div className="form-group" style={{ marginBottom: '12px' }}>
          <label>Duration</label>
          <select value={duration} onChange={(e) => setDuration(e.target.value)}>
            <option value="1">1 Month (30 days)</option>
            <option value="3">3 Months (90 days)</option>
            <option value="6">6 Months (180 days)</option>
            <option value="12">1 Year (365 days)</option>
          </select>
        </div>
        
        <div className="metric" style={{ marginBottom: '16px' }}>
          <div className="metric-label">Total Amount</div>
          <div className="metric-val accent">₹{totalAmount}</div>
        </div>

        {pkgDetails && pkgDetails.offers && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '6px' }}>Included offers:</div>
            {pkgDetails.offers.split(',').map((o, idx) => (
               <div key={idx} className="offer-card"><div className="offer-name">{o.trim()}</div><span className="badge badge-green">Included</span></div>
            ))}
          </div>
        )}

        <button className="btn-primary" onClick={handleRenew}>Pay & Renew</button>
        {msg && <div style={{ fontSize: '13px', marginTop: '10px', color: 'var(--color-text-success)' }}>{msg}</div>}
      </div>
    </div>
  );
}