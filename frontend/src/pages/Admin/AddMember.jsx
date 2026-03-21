import React, { useState, useEffect } from 'react';

export default function AddMember() {
  const [isScanning, setIsScanning] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [packages, setPackages] = useState([]);
  const [message, setMessage] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '', phone: '', email: '', age: '', packageId: '', duration: '1', pin: ''
  });

  // Fetch packages for the dropdown
  useEffect(() => {
    fetch('http://localhost:5000/api/admin/packages')
      .then(res => res.json())
      .then(data => {
        if (data.success) setPackages(data.packages);
      });
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const registerFingerprint = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setIsRegistered(true);
    }, 1500);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.packageId || !formData.pin) {
      setMessage('Please fill in Name, Package, and PIN.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/admin/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          fingerprint: isRegistered
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage(`Success! Member registered with ID: ${data.new_id}`);
        // Reset form
        setFormData({ name: '', phone: '', email: '', age: '', packageId: '', duration: '1', pin: '' });
        setIsRegistered(false);
      } else {
        setMessage(data.error || 'Failed to register member.');
      }
    } catch (err) {
      setMessage('Server connection error.');
    }
  };

  return (
    <div className="section active">
      <div className="card">
        <div className="card-title">Add New Member</div>
        <div className="form-grid">
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Full name" />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="Phone number" />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Email address" />
          </div>
          <div className="form-group">
            <label>Age</label>
            <input type="number" name="age" value={formData.age} onChange={handleInputChange} placeholder="Age" />
          </div>
          <div className="form-group">
            <label>Package</label>
            <select name="packageId" value={formData.packageId} onChange={handleInputChange}>
              <option value="">-- Select Package --</option>
              {packages.map(p => (
                <option key={p.id} value={p.id}>{p.name} — ₹{p.price_per_month}/mo</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Duration (months)</label>
            <select name="duration" value={formData.duration} onChange={handleInputChange}>
              <option value="1">1 Month</option>
              <option value="3">3 Months</option>
              <option value="6">6 Months</option>
              <option value="12">1 Year</option>
            </select>
          </div>
          <div className="form-group full">
            <label>PIN (4 digits)</label>
            <input type="password" name="pin" value={formData.pin} onChange={handleInputChange} placeholder="Set member PIN" maxLength="4" />
          </div>
        </div>
        
        <div className="divider"></div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="btn-add" onClick={handleSubmit}>Register Member</button>
          <span className="fp-status" style={{ color: message.includes('Success') ? 'var(--color-text-success)' : 'inherit' }}>
            {message || (isRegistered ? 'Fingerprint registered successfully' : 'Tap below to register fingerprint')}
          </span>
        </div>
        
        <div className="fp-area" style={{ padding: '12px 0' }}>
          <div className={`fp-icon ${isScanning ? 'scanning' : ''} ${isRegistered ? 'success' : ''}`} onClick={registerFingerprint}>
            <svg className="fp-svg" viewBox="0 0 36 36" fill="none"><path d="M18 4C10.27 4 4 10.27 4 18c0 4.42 1.97 8.38 5.08 11.08" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M18 8C12.48 8 8 12.48 8 18c0 2.76.97 5.28 2.57 7.24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M18 12c-3.31 0-6 2.69-6 6 0 1.66.67 3.16 1.76 4.24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </div>
        </div>
      </div>
    </div>
  );
}