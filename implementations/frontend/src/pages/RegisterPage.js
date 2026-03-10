import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

function RegisterPage() {
  const [form, setForm] = useState({
    username: '',
    password: '',
    name: '',
    contact_info: '',
    role: 'GENERAL_USER',
    citizen_id: '',
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
          <label>Role:</label>
          <select name="role" value={form.role} onChange={handleChange}>
            <option value="GENERAL_USER">General User</option>
            <option value="MERCHANT">Merchant</option>
          </select>
        </div>
        {form.role === 'MERCHANT' && (
          <>
            <div>
              <label>Citizen ID:</label>
              <input name="citizen_id" value={form.citizen_id} onChange={handleChange} />
            </div>
            <div>
              <label>Product Description:</label>
              <textarea name="product_description" value={form.product_description} onChange={handleChange} />
            </div>
          </>
        )}
        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default RegisterPage;
