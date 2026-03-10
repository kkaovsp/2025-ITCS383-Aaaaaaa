import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

function RegisterPage() {
  const [form, setForm] = useState({
    username: '',
    password: '',
    name: '',
    contact_info: '',
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
    try {
      await api.post('/auth/register', form);
      alert('Registered successfully, please log in');
      navigate('/login');
    } catch (err) {
      alert('Registration failed');
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username:</label>
          <input name="username" value={form.username} onChange={handleChange} />
        </div>
        <div>
          <label>Password:</label>
          <input type="password" name="password" value={form.password} onChange={handleChange} />
        </div>
        <div>
          <label>Name:</label>
          <input name="name" value={form.name} onChange={handleChange} />
        </div>
        <div>
          <label>Contact Info:</label>
          <input name="contact_info" value={form.contact_info} onChange={handleChange} />
        </div>
        <div>
          <label>Citizen ID:</label>
          <input name="citizen_id" value={form.citizen_id} onChange={handleChange} required />
        </div>
        <div>
          <label>Seller Information:</label>
          <textarea name="seller_information" value={form.seller_information} onChange={handleChange} required />
        </div>
        <div>
          <label>Product Description:</label>
          <textarea name="product_description" value={form.product_description} onChange={handleChange} required />
        </div>
        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default RegisterPage;
