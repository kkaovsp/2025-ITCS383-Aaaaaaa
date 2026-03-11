import React, { useEffect, useState } from 'react';
import api from '../services/api';

function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [edit, setEdit] = useState({ name: '', contact_info: '' });
  const [seller, setSeller] = useState({ seller_information: '', product_description: '' });
  const [msg, setMsg] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const resp = await api.get('/users/me');
        setProfile(resp.data);
        setEdit({ name: resp.data.name || '', contact_info: resp.data.contact_info || '' });
        setSeller({ seller_information: resp.data.seller_information || '', product_description: resp.data.product_description || '' });
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, []);

  const saveProfile = async () => {
    try {
      const resp = await api.patch('/users/me', edit);
      setProfile((p) => ({ ...p, name: resp.data.name, contact_info: resp.data.contact_info }));
      setMsg('Profile saved');
    } catch (err) {
      console.error(err);
      setMsg('Failed to save');
    }
  };

  const saveSeller = async () => {
    try {
      const resp = await api.patch('/users/me/seller', seller);
      setProfile((p) => ({ ...p, seller_information: resp.data.seller_information, product_description: resp.data.product_description, approval_status: resp.data.approval_status }));
      setMsg('Seller info saved');
    } catch (err) {
      console.error(err);
      setMsg('Failed to save seller info');
    }
  };

  if (!profile) return <div className="loading">Loading profile…</div>;

  return (
    <div className="page-content">
      <div className="page-header"><h2>👤 My Profile</h2></div>
      {msg && (
        <div className={`alert ${msg.toLowerCase().includes('fail') ? 'alert-error' : 'alert-success'}`}>{msg}</div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        <div className="panel">
          <div className="panel-header"><h3>Account Info</h3></div>
          <div className="panel-body">
            <div className="form-group">
              <label className="form-label">Username</label>
              <div style={{ padding: '.55rem .85rem', background: 'var(--surface-alt)', borderRadius: 'var(--radius-sm)', fontWeight: 600, border: '1.5px solid var(--border)' }}>{profile.username}</div>
            </div>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-control" value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Contact Info</label>
              <input className="form-control" placeholder="Email or phone" value={edit.contact_info} onChange={(e) => setEdit({ ...edit, contact_info: e.target.value })} />
            </div>
            <button className="btn btn-primary" onClick={saveProfile}>Save Profile</button>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h3>Seller Information</h3>
            {profile.approval_status && (
              <span className={`badge ${{ APPROVED: 'badge-success', REJECTED: 'badge-danger', PENDING: 'badge-warning' }[profile.approval_status] || 'badge-gray'}`}>
                {profile.approval_status}
              </span>
            )}
          </div>
          <div className="panel-body">
            <div className="form-group">
              <label className="form-label">Seller Information</label>
              <textarea className="form-control" rows={4} value={seller.seller_information} onChange={(e) => setSeller({ ...seller, seller_information: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Product Description</label>
              <textarea className="form-control" rows={3} value={seller.product_description} onChange={(e) => setSeller({ ...seller, product_description: e.target.value })} />
            </div>
            <button className="btn btn-primary" onClick={saveSeller}>Save Seller Info</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
