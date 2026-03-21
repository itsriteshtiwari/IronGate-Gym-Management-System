import React, { useState, useEffect } from 'react';

export default function Packages() {
  const [packages, setPackages] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Form State
  const [editId, setEditId] = useState(null); // Tracks if we are editing or adding
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [offers, setOffers] = useState('');

  const fetchPackages = () => {
    fetch('http://localhost:5000/api/admin/packages')
      .then(res => res.json())
      .then(data => { if (data.success) setPackages(data.packages); });
  };

  useEffect(() => { fetchPackages(); }, []);

  // Open modal to Add
  const handleAddNew = () => {
    setEditId(null);
    setName(''); setPrice(''); setOffers('');
    setShowModal(true);
  };

  // Open modal to Edit
  const handleEdit = (pkg) => {
    setEditId(pkg.id);
    setName(pkg.name);
    setPrice(pkg.price_per_month);
    setOffers(pkg.offers || '');
    setShowModal(true);
  };

  // Save (Handles both Add and Edit)
  const handleSave = async () => {
    const url = editId 
      ? `http://localhost:5000/api/admin/packages/${editId}` 
      : 'http://localhost:5000/api/admin/packages';
      
    const method = editId ? 'PUT' : 'POST';

    await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, price: parseInt(price), offers })
    });

    setShowModal(false);
    fetchPackages(); // Refresh list
  };

  // Remove
  const handleDelete = async (pkgId) => {
    if (!window.confirm("Are you sure you want to remove this package? Active users will still keep it until it expires.")) return;

    try {
      const response = await fetch(`http://localhost:5000/api/admin/packages/${pkgId}`, {
        method: 'DELETE'
      });
      const data = await response.json();

      if (data.success) {
        setErrorMsg(''); 
        fetchPackages(); 
      } else {
        setErrorMsg(data.message);
      }
    } catch (err) {
      setErrorMsg('Server connection error.');
    }
  };

  return (
    <div className="section active" style={{ position: 'relative' }}>
      <div className="section-header" style={{ marginBottom: '12px' }}>
        <div className="section-title">Packages</div>
        <button className="btn-add" onClick={handleAddNew}>+ Add Package</button>
      </div>

      {errorMsg && (
        <div style={{ padding: '10px', backgroundColor: '#FCEBEB', color: '#A32D2D', borderRadius: '6px', marginBottom: '15px', fontSize: '13px' }}>
          {errorMsg}
        </div>
      )}
      
      <div id="pkg-list">
        {packages.map(p => {
          // Check if it's a core package
          const isCorePackage = ['basic', 'standard', 'premium'].includes(p.id.toLowerCase());

          return (
            <div className="pkg-card" key={p.id} style={{ position: 'relative' }}>
              
              {/* Action Buttons */}
              <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                {!p.offers ? <span className="badge badge-gray">Basic</span> : <span className="badge badge-blue">With Offers</span>}
                
                <button onClick={() => handleEdit(p)} style={{ background: 'transparent', border: 'none', color: '#185FA5', cursor: 'pointer', fontSize: '12px', fontWeight: '500' }}>
                  Edit
                </button>

                {/* Only show Remove if it is NOT a core package */}
                {!isCorePackage && (
                  <button onClick={() => handleDelete(p.id)} style={{ background: 'transparent', border: 'none', color: 'var(--color-text-danger)', cursor: 'pointer', fontSize: '12px', fontWeight: '500' }}>
                    Remove
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div className="pkg-name">{p.name} {isCorePackage && <span style={{fontSize: '10px', color: 'gray', marginLeft: '5px'}}>(Core)</span>}</div>
                  <div className="pkg-price">₹{p.price_per_month}/month</div>
                </div>
              </div>
              
              <div className="pkg-offers" style={{ marginTop: '8px', paddingRight: '120px' }}>
                {p.offers ? `Includes: ${p.offers}` : 'Standard membership, no extra offers'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Overlay */}
      {showModal && (
        <div className="modal-bg" onClick={() => setShowModal(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ background: 'var(--color-background-primary)', padding: '20px', borderRadius: '12px', width: '400px' }}>
            <div className="modal-title" style={{ marginBottom: '15px', fontWeight: 'bold' }}>
              {editId ? 'Edit Package' : 'Add Package'}
            </div>
            <div className="form-group" style={{ marginBottom: '10px' }}>
              <label>Package Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Summer Promo" style={{ width: '100%', padding: '8px' }}/>
            </div>
            <div className="form-group" style={{ marginBottom: '10px' }}>
              <label>Price per Month (₹)</label>
              <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="999" style={{ width: '100%', padding: '8px' }}/>
            </div>
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label>Offers (comma separated)</label>
              <input type="text" value={offers} onChange={e => setOffers(e.target.value)} placeholder="Trainer, Locker" style={{ width: '100%', padding: '8px' }}/>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className="btn-sm" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-add" onClick={handleSave}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}