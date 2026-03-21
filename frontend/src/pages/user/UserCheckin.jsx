import React, { useState } from 'react';

export default function UserCheckin() {
  const [statusMsg, setStatusMsg] = useState('Tap icon to check in/out');
  const [isScanning, setIsScanning] = useState(false);

  const handleScan = async () => {
    setIsScanning(true);
    setStatusMsg('Scanning...');
    const user = JSON.parse(localStorage.getItem('gymUser'));

    try {
      const response = await fetch(`http://localhost:5000/api/user/${user.id}/checkin`, { method: 'POST' });
      const data = await response.json();
      
      setTimeout(() => {
        setIsScanning(false);
        if (data.success) {
          setStatusMsg(data.message);
        } else {
          setStatusMsg('Error communicating with scanner.');
        }
      }, 1000);
    } catch (err) {
      setIsScanning(false);
      setStatusMsg('Server connection failed.');
    }
  };

  return (
    <div className="section active">
      <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
        <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Today</div>
        <div style={{ fontSize: '18px', fontWeight: 500, marginBottom: '20px' }}>{new Date().toLocaleDateString('en-IN')}</div>
        
        <div className="fp-area">
          <div className={`fp-icon ${isScanning ? 'scanning' : ''}`} onClick={handleScan} style={{ width: '88px', height: '88px', cursor: 'pointer' }}>
            <svg style={{ width: '44px', height: '44px' }} viewBox="0 0 36 36" fill="none"><path d="M18 4C10.27 4 4 10.27 4 18c0 4.42 1.97 8.38 5.08 11.08" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M18 8C12.48 8 8 12.48 8 18c0 2.76.97 5.28 2.57 7.24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M18 12c-3.31 0-6 2.69-6 6 0 1.66.67 3.16 1.76 4.24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M18 16c-1.1 0-2 .9-2 2 0 .55.22 1.05.58 1.42" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </div>
          <div className="fp-status" style={{ fontSize: '14px', marginTop: '10px' }}>{statusMsg}</div>
        </div>
      </div>
    </div>
  );
}