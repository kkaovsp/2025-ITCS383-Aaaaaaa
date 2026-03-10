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

  if (!profile) return <div>Loading profile...</div>;

  return (
    <div>
      <h2>My Profile</h2>
      {msg && <div style={{ color: 'green' }}>{msg}</div>}
      <div style={{ marginBottom: '1rem' }}>
        <div><strong>Username:</strong> {profile.username}</div>
        <div>
          <label>Name: <input value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} /></label>
        </div>
        <div>
          <label>Contact info: <input value={edit.contact_info} onChange={(e) => setEdit({ ...edit, contact_info: e.target.value })} /></label>
        </div>
        <button onClick={saveProfile}>Save Profile</button>
      </div>

      <h3>Seller Information</h3>
      <div>
        <div><strong>Merchant Status:</strong> {profile.approval_status || 'N/A'}</div>
        <div>
          <label>Seller information:<br />
            <textarea rows={4} style={{ width: '100%' }} value={seller.seller_information} onChange={(e) => setSeller({ ...seller, seller_information: e.target.value })} />
          </label>
        </div>
        <div>
          <label>Product description:<br />
            <textarea rows={3} style={{ width: '100%' }} value={seller.product_description} onChange={(e) => setSeller({ ...seller, product_description: e.target.value })} />
          </label>
        </div>
        <button onClick={saveSeller}>Save Seller Info</button>
      </div>
    </div>
  );
}

export default ProfilePage;
