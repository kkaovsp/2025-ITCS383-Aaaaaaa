import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../services/AuthContext';
import { useTranslation } from 'react-i18next';

function ProfilePage() {
  const { refresh } = useAuth();
  const [profile, setProfile] = useState(null);
  const [edit, setEdit] = useState({ name: '', contact_info: '' });
  const [seller, setSeller] = useState({ seller_information: '', product_description: '' });
  const [msg, setMsg] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingSeller, setSavingSeller] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    async function load() {
      try {
        const resp = await api.get('/users/me');
        setProfile(resp.data);
        setEdit({ name: resp.data.name || '', contact_info: resp.data.contact_info || '' });
        setSeller({ seller_information: resp.data.seller_information || '', product_description: resp.data.product_description || '' });
      } catch (err) {
        console.error(err);
        setMsg(t('profile.loadFailed'));
      }
    }
    load();
  }, [t]);

  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      const payload = {
        name: edit.name,
        contact_info: edit.contact_info,
      };
      const resp = await api.patch('/users/me', payload);
      setProfile((p) => ({
        ...p,
        name: resp.data.name,
        contact_info: resp.data.contact_info,
      }));
      if (typeof refresh === 'function') {
        await refresh();
      }
      setMsg(t('profile.profileSaved'));
    } catch (err) {
      console.error(err);
      const detail = err?.response?.data?.detail;
      setMsg(`${t('profile.saveFailed')}${detail ? `: ${detail}` : ''}`);
    } finally {
      setSavingProfile(false);
    }
  };

  const saveSeller = async () => {
    setSavingSeller(true);
    try {
      const resp = await api.patch('/users/me/seller', seller);
      setProfile((p) => ({ ...p, seller_information: resp.data.seller_information, product_description: resp.data.product_description, approval_status: resp.data.approval_status }));
      setMsg(t('profile.sellerSaved'));
    } catch (err) {
      console.error(err);
      const detail = err?.response?.data?.detail;
      setMsg(`${t('profile.sellerFailed')}${detail ? `: ${detail}` : ''}`);
    } finally {
      setSavingSeller(false);
    }
  };

  if (!profile) return <div className="loading">{t('profile.loading')}</div>;

  const showSellerSection = profile.role === 'MERCHANT';

  return (
    <div className="page-content">
      <div className="page-header"><h2>{t('profile.title')}</h2></div>
      {msg && (
        <div className={`alert ${msg.toLowerCase().includes('fail') || msg.toLowerCase().includes('ไม่สามารถ') ? 'alert-error' : 'alert-success'}`}>{msg}</div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        <div className="panel">
          <div className="panel-header"><h3>{t('profile.accountInfo')}</h3></div>
          <div className="panel-body">
            <div className="form-group">
              <label className="form-label">{t('profile.username')}</label>
              <div style={{ padding: '.55rem .85rem', background: 'var(--surface-alt)', borderRadius: 'var(--radius-sm)', fontWeight: 600, border: '1.5px solid var(--border)' }}>{profile.username}</div>
            </div>
            <div className="form-group">
              <label className="form-label">{t('profile.fullName')}</label>
              <input className="form-control" value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">{t('profile.contactInfo')}</label>
              <input className="form-control" placeholder={t('profile.contactPlaceholder')} value={edit.contact_info} onChange={(e) => setEdit({ ...edit, contact_info: e.target.value })} />
            </div>
            <button className="btn btn-primary" onClick={saveProfile} disabled={savingProfile}>{savingProfile ? t('profile.saving') : t('profile.saveProfile')}</button>
          </div>
        </div>

        {showSellerSection && (
          <div className="panel">
            <div className="panel-header">
              <h3>{t('profile.sellerInfo')}</h3>
              {profile.approval_status && (
                <span className={`badge ${{ APPROVED: 'badge-success', REJECTED: 'badge-danger', PENDING: 'badge-warning' }[profile.approval_status] || 'badge-gray'}`}>
                  {profile.approval_status}
                </span>
              )}
            </div>
            <div className="panel-body">
              <div className="form-group">
                <label className="form-label">{t('profile.sellerInfoLabel')}</label>
                <textarea className="form-control" rows={4} value={seller.seller_information} onChange={(e) => setSeller({ ...seller, seller_information: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">{t('profile.productDesc')}</label>
                <textarea className="form-control" rows={3} value={seller.product_description} onChange={(e) => setSeller({ ...seller, product_description: e.target.value })} />
              </div>
              <button className="btn btn-primary" onClick={saveSeller} disabled={savingSeller}>{savingSeller ? t('profile.saving') : t('profile.saveSellerInfo')}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;
