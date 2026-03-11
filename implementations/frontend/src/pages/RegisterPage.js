import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

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
      alert('Registered successfully, please log in');
      navigate('/login');
    } catch (err) {
      alert('Registration failed');
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card" style={{ maxWidth: 520 }}>
        <h2>Create an account</h2>
        <p className="auth-subtitle">Join BoothOrganizer to discover and reserve booths</p>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Username</label>
              <input className="form-control" name="username" placeholder="Choose a username" value={form.username} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-control" type="password" name="password" placeholder="Choose a password" value={form.password} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-control" name="name" placeholder="Your full name" value={form.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Contact Info</label>
              <input className="form-control" name="contact_info" placeholder="Email or phone" value={form.contact_info} onChange={handleChange} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Account Type</label>
            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '.35rem' }}>
              <label className="form-check">
                <input type="radio" name="role" value="general" checked={form.role === 'general'} onChange={handleChange} />
                <span>General User</span>
              </label>
              <label className="form-check">
                <input type="radio" name="role" value="merchant" checked={form.role === 'merchant'} onChange={handleChange} />
                <span>Merchant</span>
              </label>
            </div>
          </div>
          {form.role === 'merchant' && (
            <>
              <div className="form-group">
                <label className="form-label">Citizen ID</label>
                <input className="form-control" name="citizen_id" placeholder="13-digit citizen ID" value={form.citizen_id} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Seller Information</label>
                <textarea className="form-control" name="seller_information" placeholder="Describe your business…" value={form.seller_information} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Product Description</label>
                <textarea className="form-control" name="product_description" placeholder="What products will you sell?" value={form.product_description} onChange={handleChange} required />
              </div>
            </>
          )}
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '.5rem' }}>Create Account</button>
        </form>
        <div className="auth-footer">
          Already have an account? <a href="/login">Sign in</a>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
