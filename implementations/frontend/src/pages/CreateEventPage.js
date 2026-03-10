import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

function CreateEventPage() {
  const [form, setForm] = useState({
    name: '',
    description: '',
    location: '',
    start_date: '',
    end_date: '',
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/events', form);
      alert('Event created');
      navigate('/events');
    } catch (err) {
      console.error(err);
      alert('Failed to create event');
    }
  };

  return (
    <div>
      <h2>Create Event</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name:</label>
          <input name="name" value={form.name} onChange={handleChange} />
        </div>
        <div>
          <label>Description:</label>
          <textarea name="description" value={form.description} onChange={handleChange} />
        </div>
        <div>
          <label>Location:</label>
          <input name="location" value={form.location} onChange={handleChange} />
        </div>
        <div>
          <label>Start date:</label>
          <input type="date" name="start_date" value={form.start_date} onChange={handleChange} />
        </div>
        <div>
          <label>End date:</label>
          <input type="date" name="end_date" value={form.end_date} onChange={handleChange} />
        </div>
        <button type="submit">Create</button>
      </form>
    </div>
  );
}

export default CreateEventPage;
