import React, { useEffect, useState } from 'react';

export default function HeroCarousel({ slides, title }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5500);

    return () => clearInterval(timer);
  }, [slides.length]);

  const goToSlide = (index) => setCurrentSlide(index);
  const goNext = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const goPrev = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <section className="hero-section" aria-label="Explorador principal">
      <div className="hero-carousel" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
        {slides.map((slide) => (
          <div
            key={slide.id}
            className="hero-slide"
            style={{ backgroundImage: `url(${slide.image})` }}
            aria-label={slide.alt}
          />
        ))}
      </div>

      <div className="hero-overlay">
        <p className="hero-kicker">Descubre actividades, servicios y experiencias locales</p>
        <h1 className="hero-text">{title}</h1>
      </div>

      <button className="hero-control hero-control-prev" onClick={goPrev} aria-label="Imagen anterior" type="button">
        <i className="fa-solid fa-chevron-left" />
      </button>
      <button className="hero-control hero-control-next" onClick={goNext} aria-label="Imagen siguiente" type="button">
        <i className="fa-solid fa-chevron-right" />
      </button>

      <div className="hero-indicators" aria-label="Seleccionar imagen del carrusel">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            type="button"
            className={`hero-indicator ${index === currentSlide ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
            aria-label={`Ir a imagen ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
