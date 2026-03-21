import React, { useEffect, useState } from 'react';

export default function UserHistory() {
  const [history, setHistory] = useState({});

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('gymUser'));
    fetch(`http://localhost:5000/api/user/${user.id}/history`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          // Group by date
          const grouped = data.history.reduce((acc, curr) => {
            if (!acc[curr.log_date]) acc[curr.log_date] = [];
            acc[curr.log_date].push(curr);
            return acc;
          }, {});
          setHistory(grouped);
        }
      });
  }, []);

  return (
    <div className="section active">
      <div className="card">
        <div className="card-title">Attendance History</div>
        {Object.keys(history).length === 0 ? (
          <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>No attendance history yet</div>
        ) : (
          Object.entries(history).map(([date, sessions]) => (
            <div className="attendance-row" key={date}>
              <div className="att-date" style={{ width: '100px' }}>{new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
              <div className="att-sessions">
                {sessions.map((s, i) => (
                  <div className="att-session" key={i}>
                    in <span>{s.time_in}</span> {s.time_out ? <>· out <span>{s.time_out}</span></> : <>· <span style={{ color: 'var(--gym-accent)' }}>still in</span></>}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}