import React, { useState, useEffect } from 'react';

export default function Members() {
  const [searchTerm, setSearchTerm] = useState('');
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch real members from the database
  useEffect(() => {
    fetch('http://localhost:5000/api/admin/members')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setMembers(data.members);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch members:", err);
        setLoading(false);
      });
  }, []);

  const filtered = members.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="section active">
      <div className="card">
        <div className="section-header">
          <div className="section-title">All Members</div>
          <input 
            type="text" 
            placeholder="Search..." 
            style={{ padding: '5px 10px', fontSize: '12px', borderRadius: 'var(--border-radius-md)', border: '0.5px solid var(--color-border-secondary)' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {loading ? (
          <div style={{ padding: '20px', color: 'var(--color-text-secondary)', fontSize: '13px' }}>Loading members...</div>
        ) : (
          <div className="scroll-x">
            <table className="tbl">
              <thead><tr><th>ID</th><th>Name</th><th>Package</th><th>Days Left</th><th>Status</th><th>Joined</th></tr></thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan="6" style={{ color: 'var(--color-text-secondary)', padding: '15px 8px' }}>No members found.</td></tr>
                ) : (
                  filtered.map(m => (
                    <tr key={m.id}>
                      <td style={{ color: 'var(--color-text-secondary)' }}>{m.id}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div className="avatar">{m.name.charAt(0)}</div>{m.name}
                        </div>
                      </td>
                      <td>{m.pkg}</td>
                      <td style={{ fontWeight: 500 }}>{m.left}</td>
                      <td>
                        {m.status === 'Active' && <span className="badge badge-green">Active</span>}
                        {m.status === 'Expiring' && <span className="badge badge-amber">Expiring</span>}
                        {m.status === 'Expired' && <span className="badge badge-red">Expired</span>}
                      </td>
                      <td style={{ color: 'var(--color-text-secondary)' }}>{m.joined}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}