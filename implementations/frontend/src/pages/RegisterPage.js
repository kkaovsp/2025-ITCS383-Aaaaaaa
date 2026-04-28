import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function RegisterPage() {
  const [form, setForm] = useState({
    username: '',
    password: '',
    name: '',
    contact_info: '',
    role: 'general',
    citizen_id: '',
    seller_information: '',
    product_description: '',
  });

  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const submitForm = { ...form };
    if (form.role === 'general') {
      delete submitForm.citizen_id;
      delete submitForm.seller_information;
      delete submitForm.product_description;
    }
    try {
      await api.post('/auth/register', submitForm);
      alert(t('register.success'));
      navigate('/login');
    } catch (err) {
      alert(t('register.failed'));
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card" style={{ maxWidth: 520 }}>
        <h2>{t('register.title')}</h2>
        <p className="auth-subtitle">{t('register.subtitle')}</p>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">{t('register.username')}</label>
              <input className="form-control" name="username" placeholder={t('register.usernamePlaceholder')} value={form.username} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">{t('register.password')}</label>
              <input className="form-control" type="password" name="password" placeholder={t('register.passwordPlaceholder')} value={form.password} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">{t('register.fullName')}</label>
              <input className="form-control" name="name" placeholder={t('register.fullNamePlaceholder')} value={form.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">{t('register.contactInfo')}</label>
              <input className="form-control" name="contact_info" placeholder={t('register.contactInfoPlaceholder')} value={form.contact_info} onChange={handleChange} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">{t('register.accountType')}</label>
            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '.35rem' }}>
              <label className="form-check">
                <input type="radio" name="role" value="general" checked={form.role === 'general'} onChange={handleChange} />
                <span>{t('register.generalUser')}</span>
              </label>
              <label className="form-check">
                <input type="radio" name="role" value="merchant" checked={form.role === 'merchant'} onChange={handleChange} />
                <span>{t('register.merchant')}</span>
              </label>
            </div>
          </div>
          {form.role === 'merchant' && (
            <>
              <div className="form-group">
                <label className="form-label">{t('register.citizenId')}</label>
                <input className="form-control" name="citizen_id" placeholder={t('register.citizenIdPlaceholder')} value={form.citizen_id} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">{t('register.sellerInfo')}</label>
                <textarea className="form-control" name="seller_information" placeholder={t('register.sellerInfoPlaceholder')} value={form.seller_information} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">{t('register.productDesc')}</label>
                <textarea className="form-control" name="product_description" placeholder={t('register.productDescPlaceholder')} value={form.product_description} onChange={handleChange} required />
              </div>
            </>
          )}
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '.5rem' }}>{t('register.submit')}</button>
        </form>
        <div className="auth-footer">
          {t('register.hasAccount')} <a href="/login">{t('register.loginLink')}</a>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
