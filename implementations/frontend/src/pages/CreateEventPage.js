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
    <div className="page-content">
      <div className="page-header"><h2>🎪 Create Event</h2></div>
      <div className="panel" style={{ maxWidth: 560 }}>
        <div className="panel-header"><h3>Event Details</h3></div>
        <div className="panel-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Event Name</label>
              <input className="form-control" name="name" placeholder="e.g. Summer Market 2026" value={form.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-control" name="description" placeholder="Describe your event…" value={form.description} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Location</label>
              <input className="form-control" name="location" placeholder="e.g. Central Park, Bangkok" value={form.location} onChange={handleChange} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Start Date</label>
                <input className="form-control" type="date" name="start_date" value={form.start_date} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">End Date</label>
                <input className="form-control" type="date" name="end_date" value={form.end_date} onChange={handleChange} required />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '.75rem', marginTop: '.5rem' }}>
              <button type="submit" className="btn btn-primary">Create Event</button>
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/events')}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateEventPage;
