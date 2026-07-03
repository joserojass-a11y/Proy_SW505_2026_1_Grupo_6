import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function CreateServiceOptions() {
  const navigate = useNavigate();

  return (
    <div className="container">
      <div className="auth-grid">
        <div className="glass-card auth" style={{maxWidth: '600px', textAlign: 'center'}}>
          <h2 className="card-title" style={{justifyContent: 'center'}}>
            <i className="fa-solid fa-briefcase"></i> ¿Cómo te gustaría ofrecer tu servicio?
          </h2>
          <p style={{marginBottom: '32px', color: '#6b7280'}}>
            Elige la opción que mejor se adapte a tu situación. Puedes publicar servicios como persona independiente o crear una cuenta de empresa gestionada por varios administradores.
          </p>
          
          <div style={{display: 'flex', gap: '24px', flexDirection: 'column'}}>
            <button 
              className="btn-primary" 
              style={{padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', fontSize: '18px'}}
              onClick={() => navigate('/create-service/independent')}
            >
              <i className="fa-solid fa-user-tie" style={{fontSize: '24px'}}></i>
              <div>
                <div style={{fontWeight: '800'}}>Persona Independiente</div>
                <div style={{fontSize: '13px', fontWeight: 'normal', opacity: 0.9}}>Ideal para profesionales independientes o freelancers.</div>
              </div>
            </button>

            <button 
              className="btn-primary" 
              style={{padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', fontSize: '18px', background: '#4b5563'}}
              onClick={() => navigate('/create-service/company')}
            >
              <i className="fa-solid fa-building" style={{fontSize: '24px'}}></i>
              <div>
                <div style={{fontWeight: '800'}}>Empresa</div>
                <div style={{fontSize: '13px', fontWeight: 'normal', opacity: 0.9}}>Ideal para negocios con múltiples colaboradores.</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
