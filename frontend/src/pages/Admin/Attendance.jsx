import React, { useState, useEffect } from 'react';

export default function Attendance() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [records, setRecords] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:5000/api/admin/attendance?date=${date}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          // Group by user ID just like your prototype
          const grouped = data.records.reduce((acc, curr) => {
            if (!acc[curr.id]) acc[curr.id] = { name: curr.name, sessions: [] };
            acc[curr.id].sessions.push({ in: curr.time_in, out: curr.time_out });
            return acc;
          }, {});
          setRecords(Object.entries(grouped));
        }
      });
  }, [date]);

  return (
    <div className="section active">
      <div className="card">
        <div className="section-header">
          <div className="section-title">Attendance Log</div>
          <input 
            type="date" 
            value={date} 
            onChange={(e) => setDate(e.target.value)}
            style={{ padding: '5px 10px', fontSize: '12px', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--color-border-secondary)' }} 
          />
        </div>
        <div>
          {records.length === 0 ? (
            <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>No records found for this date.</div>
          ) : (
            records.map(([id, data]) => (
              <div className="attendance-row" key={id}>
                <div className="att-date">{data.name}<br/><span style={{ fontSize: '10px', color: 'var(--color-text-secondary)' }}>{id}</span></div>
                <div className="att-sessions">
                  {data.sessions.map((s, i) => (
                    <div className="att-session" key={i}>
                      in <span>{s.in}</span> {s.out ? <>· out <span>{s.out}</span></> : <>· <span style={{ color: 'var(--gym-accent)' }}>still in</span></>}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}