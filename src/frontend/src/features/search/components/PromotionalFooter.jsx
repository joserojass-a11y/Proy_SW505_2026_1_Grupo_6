import React from 'react';

export default function PromotionalFooter({ onCreateService }) {
  return (
    <footer className="modern-footer">
      <div className="footer-cta">
        <h3>¿Tienes un servicio que necesita clientes? Únete a nuestra red</h3>
        <button className="btn-primary" onClick={onCreateService} type="button">
          Crear mi servicio
        </button>
      </div>

      <div className="footer-links" aria-label="Enlaces de apoyo">
        <a href="#" className="footer-link">Enlaces útiles</a>
        <a href="#" className="footer-link">Contacto</a>
        <a href="#" className="footer-link">Soporte</a>
        <a href="#" className="footer-link">Información legal</a>
      </div>
    </footer>
  );
}
