import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HeroCarousel from './HeroCarousel';
import FiltersPanel from './FiltersPanel';
import ServiceCard from './ServiceCard';
import PromotionalFooter from './PromotionalFooter';
import '../styles/search.css';

const MOCK_SERVICES = [
  {
    id: 1,
    name: 'Paseo en Globo',
    image: 'https://images.unsplash.com/photo-1517400508447-f8dd518b86db?auto=format&fit=crop&q=80&w=400',
    tags: ['Aventura', 'Turismo'],
    description: 'Disfruta de una vista increíble al amanecer con nuestro paseo en globo aerostático.',
    company: 'SkyHigh Adventures'
  },
  {
    id: 2,
    name: 'Cena Romántica en la Playa',
    image: 'https://images.unsplash.com/photo-1515516089376-88db1e26e9c0?auto=format&fit=crop&q=80&w=400',
    tags: ['Restaurantes', 'Parejas'],
    description: 'Una velada inolvidable con cena a tres tiempos frente al mar.',
    company: 'OceanBreeze Dining'
  },
  {
    id: 3,
    name: 'Clases de Surf Intensivas',
    image: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&q=80&w=400',
    tags: ['Deportes', 'Clases'],
    description: 'Aprende a surfear en solo 3 días con instructores profesionales.',
    company: 'WaveRiders School'
  },
  {
    id: 4,
    name: 'Hotel Boutique Colonial',
    image: 'https://images.unsplash.com/photo-1542314831-c6a4d14248ce?auto=format&fit=crop&q=80&w=400',
    tags: ['Hoteles', 'Hospedaje'],
    description: 'Relájate en el centro histórico con todas las comodidades de lujo.',
    company: 'Boutique Heritage'
  }
];

export default function ServiceSearchPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({
    categories: [],
    startDate: '',
    endDate: '',
    locality: ''
  });
  const [visibleServices, setVisibleServices] = useState(MOCK_SERVICES);

  const heroSlides = [
    {
      id: 'discover-1',
      image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=1400',
      alt: 'Ruta panoramica en montaña'
    },
    {
      id: 'discover-2',
      image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=1400',
      alt: 'Aventura en valle natural'
    },
    {
      id: 'discover-3',
      image: 'https://images.unsplash.com/photo-1504280387307-362035bb9918?auto=format&fit=crop&q=80&w=1400',
      alt: 'Experiencia al aire libre'
    }
  ];

  useEffect(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const filtered = MOCK_SERVICES.filter((service) => {
      if (
        normalizedQuery &&
        !service.name.toLowerCase().includes(normalizedQuery) &&
        !service.description.toLowerCase().includes(normalizedQuery)
      ) {
        return false;
      }

      if (filters.categories.length > 0) {
        const intersectsCategory = filters.categories.some((category) => service.tags.includes(category));
        if (!intersectsCategory) {
          return false;
        }
      }

      if (filters.locality) {
        return service.description.toLowerCase().includes(filters.locality.toLowerCase());
      }

      return true;
    });

    setVisibleServices(filtered);
  }, [query, filters]);

  const handleCategoryChange = (category) => {
    setFilters((prev) => {
      const exists = prev.categories.includes(category);
      return {
        ...prev,
        categories: exists ? prev.categories.filter((item) => item !== category) : [...prev.categories, category]
      };
    });
  };

  const handleFieldChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleClearFilters = () => {
    setFilters({ categories: [], startDate: '', endDate: '', locality: '' });
    setQuery('');
  };

  return (
    <div>
      <HeroCarousel slides={heroSlides} title="Encuentra tu siguiente gran experiencia" />

      <section className="search-container">
        <input
          type="text"
          className="search-bar"
          placeholder="Busca servicios por nombre o descripción..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />

        <div className="main-layout">
          <FiltersPanel
            filters={filters}
            onChangeCategory={handleCategoryChange}
            onChangeField={handleFieldChange}
            onClear={handleClearFilters}
          />

          <div>
            <div className="results-toolbar">
              <p className="results-count">{visibleServices.length} servicios encontrados</p>
            </div>

            <div className="services-grid">
              {visibleServices.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>

            {visibleServices.length === 0 && (
              <div className="empty-state">
                <h3>No encontramos coincidencias</h3>
                <p>Ajusta tu búsqueda o limpia los filtros para explorar más servicios.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <PromotionalFooter onCreateService={() => navigate('/create-service')} />
    </div>
  );
}
