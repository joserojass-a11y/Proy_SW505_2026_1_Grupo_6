import React from 'react';

export default function ServiceCard({ service }) {
  return (
    <article className="service-card">
      <img src={service.image} alt={service.name} className="service-card-img" />

      <div className="service-card-body">
        <h4 className="service-card-title">{service.name}</h4>
        <div className="service-card-tags">
          {service.tags.map((tag) => (
            <span key={`${service.id}-${tag}`} className="tag">
              {tag}
            </span>
          ))}
        </div>
        <p className="service-card-desc">{service.description}</p>
      </div>

      <footer className="service-card-footer">
        Ofrecido por: <strong>{service.company}</strong>
      </footer>
    </article>
  );
}
