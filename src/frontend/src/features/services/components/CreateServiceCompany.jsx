import React, { useState } from 'react';

export default function CreateServiceCompany() {
  const [formData, setFormData] = useState({
    name: '',
    profileImg: '',
    bannerImg: '',
    location: '',
    phone: '',
    description: ''
  });
  
  const [admins, setAdmins] = useState(['admin_principal@empresa.com']);
  const [newAdmin, setNewAdmin] = useState('');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleAddAdmin = () => {
    if (newAdmin && !admins.includes(newAdmin)) {
      setAdmins([...admins, newAdmin]);
      setNewAdmin('');
    }
  };

  const handleRemoveAdmin = (admin) => {
    setAdmins(admins.filter(a => a !== admin));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Servicio de Empresa creado con los siguientes administradores: ' + admins.join(', '));
    window.location.href = '/';
  };

  return (
    <div className="container">
      <div className="auth-grid">
        <div className="glass-card auth" style={{maxWidth: '700px'}}>
          <h2 className="card-title">
            <i className="fa-solid fa-building"></i> Crear Servicio como Empresa
          </h2>
          <p style={{color: '#6b7280', marginBottom: '16px'}}>
            Configura la cuenta empresarial y los administradores que gestionarán los servicios.
          </p>

          <form onSubmit={handleSubmit} className="form">
              <div className="form-group">
                <label className="label">Nombre de la Empresa / Servicio (Obligatorio)</label>
                <input required type="text" name="name" className="input" placeholder="Ej. Agencia de Viajes Cóndor" onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="label">Ubicación (Ciudad, País)</label>
                <input type="text" name="location" className="input" placeholder="Ej. Cusco, Perú" onChange={handleChange} />
                <small style={{color: '#9ca3af', fontSize: '11px'}}>El sistema configurará tu espacio (Tenant) basado en esta localidad.</small>
              </div>
              <div className="form-group">
                <label className="label">Teléfono de Contacto</label>
                <input type="tel" name="phone" className="input" placeholder="+51 999 999 999" onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="label">Descripción de la Empresa</label>
                <textarea name="description" className="textarea" placeholder="Cuéntanos sobre tu empresa..." onChange={handleChange}></textarea>
              </div>
              
              <div style={{display: 'flex', gap: '16px'}}>
                 <div className="form-group" style={{flex: 1}}>
                  <label className="label">URL Logotipo (Opcional)</label>
                  <input type="url" name="profileImg" className="input" placeholder="https://..." onChange={handleChange} />
                 </div>
                 <div className="form-group" style={{flex: 1}}>
                  <label className="label">URL Banner (Opcional)</label>
                  <input type="url" name="bannerImg" className="input" placeholder="https://..." onChange={handleChange} />
                 </div>
              </div>

              <hr style={{border: 'none', borderTop: '1px solid #e5e7eb', margin: '32px 0'}} />
              
              <h3 style={{fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#111827'}}>
                <i className="fa-solid fa-users-gear"></i> Gestión de Administradores
              </h3>
              <p style={{fontSize: '13px', color: '#6b7280', marginBottom: '16px'}}>
                Añade los correos de las personas que podrán gestionar esta cuenta y sus servicios.
              </p>
              
              <div style={{display: 'flex', gap: '8px', marginBottom: '16px'}}>
                <input 
                  type="email" 
                  className="input" 
                  style={{flex: 1}} 
                  placeholder="nuevo_admin@empresa.com"
                  value={newAdmin}
                  onChange={(e) => setNewAdmin(e.target.value)}
                />
                <button type="button" className="btn-primary" onClick={handleAddAdmin}>Añadir</button>
              </div>

              <div className="list-container" style={{background: '#f9fafb', padding: '16px', borderRadius: '12px', border: '1px solid #e5e7eb'}}>
                {admins.map((admin, idx) => (
                  <div key={idx} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: idx < admins.length -1 ? '1px solid #e5e7eb' : 'none'}}>
                    <span style={{fontSize: '14px', color: '#374151', fontWeight: '500'}}>{admin}</span>
                    {admins.length > 1 && (
                      <button type="button" onClick={() => handleRemoveAdmin(admin)} style={{background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer'}}>
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button type="submit" className="submit-btn" style={{marginTop: '32px'}}>Crear Empresa y Servicio</button>
            </form>
        </div>
      </div>
    </div>
  );
}
