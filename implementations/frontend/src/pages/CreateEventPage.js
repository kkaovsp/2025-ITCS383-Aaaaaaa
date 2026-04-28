import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function CreateEventPage() {
  const [form, setForm] = useState({
    name: '',
    description: '',
    location: '',
    start_date: '',
    end_date: '',
  });
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/events', form);
      alert(t('createEvent.success'));
      navigate('/events');
    } catch (err) {
      console.error(err);
      alert(t('createEvent.failed'));
    }
  };

  return (
    <div className="page-content">
      <div className="page-header"><h2>{t('createEvent.title')}</h2></div>
      <div className="panel" style={{ maxWidth: 560 }}>
        <div className="panel-header"><h3>{t('createEvent.eventDetails')}</h3></div>
        <div className="panel-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">{t('createEvent.eventName')}</label>
              <input className="form-control" name="name" placeholder={t('createEvent.eventNamePlaceholder')} value={form.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">{t('createEvent.description')}</label>
              <textarea className="form-control" name="description" placeholder={t('createEvent.descriptionPlaceholder')} value={form.description} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">{t('createEvent.location')}</label>
              <input className="form-control" name="location" placeholder={t('createEvent.locationPlaceholder')} value={form.location} onChange={handleChange} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">{t('createEvent.startDate')}</label>
                <input className="form-control" type="date" name="start_date" value={form.start_date} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">{t('createEvent.endDate')}</label>
                <input className="form-control" type="date" name="end_date" value={form.end_date} onChange={handleChange} required />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '.75rem', marginTop: '.5rem' }}>
              <button type="submit" className="btn btn-primary">{t('createEvent.submit')}</button>
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/events')}>{t('createEvent.cancel')}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateEventPage;
