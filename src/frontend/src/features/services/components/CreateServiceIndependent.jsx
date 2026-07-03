import React, { useState } from 'react';

export default function CreateServiceIndependent() {
  const [formData, setFormData] = useState({
    name: '',
    profileImg: '',
    bannerImg: '',
    location: '',
    phone: '',
    description: ''
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Servicio Independiente creado y vinculado al tenant local');
    window.location.href = '/';
  };

  return (
    <div className="container">
      <div className="auth-grid">
        <div className="glass-card auth" style={{maxWidth: '600px'}}>
          <h2 className="card-title">
            <i className="fa-solid fa-user-tie"></i> Crear Servicio Independiente
          </h2>
          <p style={{color: '#6b7280', marginBottom: '16px'}}>
            Completa tu perfil de publicación para registrar un nuevo servicio como persona independiente.
          </p>

          <form onSubmit={handleSubmit} className="form">
              <div className="form-group">
                <label className="label">Nombre del Servicio (Obligatorio)</label>
                <input required type="text" name="name" className="input" placeholder="Ej. Clases de Matemáticas" onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="label">Ubicación (Ciudad, País)</label>
                <input type="text" name="location" className="input" placeholder="Ej. Lima, Perú" onChange={handleChange} />
                <small style={{color: '#9ca3af', fontSize: '11px'}}>El sistema configurará tu espacio (Tenant) basado en esta localidad.</small>
              </div>
              <div className="form-group">
                <label className="label">Teléfono de Contacto</label>
                <input type="tel" name="phone" className="input" placeholder="+51 999 999 999" onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="label">Descripción Breve</label>
                <textarea name="description" className="textarea" placeholder="Cuéntanos un poco sobre lo que ofreces..." onChange={handleChange}></textarea>
              </div>
              
              <div style={{display: 'flex', gap: '16px'}}>
                 <div className="form-group" style={{flex: 1}}>
                  <label className="label">URL Imagen Perfil (Opcional)</label>
                  <input type="url" name="profileImg" className="input" placeholder="https://..." onChange={handleChange} />
                 </div>
                 <div className="form-group" style={{flex: 1}}>
                  <label className="label">URL Banner (Opcional)</label>
                  <input type="url" name="bannerImg" className="input" placeholder="https://..." onChange={handleChange} />
                 </div>
              </div>

              <button type="submit" className="submit-btn" style={{marginTop: '24px'}}>Crear Servicio</button>
            </form>
        </div>
      </div>
    </div>
  );
}
