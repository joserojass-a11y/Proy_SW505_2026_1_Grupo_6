import React from 'react';

const CATEGORIES = ['Deportes', 'Restaurantes', 'Hoteles', 'Turismo', 'Salud', 'Belleza'];

export default function FiltersPanel({ filters, onChangeCategory, onChangeField, onClear }) {
  return (
    <aside className="filters-sidebar" aria-label="Filtros de búsqueda">
      <div className="filter-group">
        <h3 className="filter-title">Categorías</h3>
        <div className="filters-checklist">
          {CATEGORIES.map((category) => (
            <label className="filter-check" key={category}>
              <input
                type="checkbox"
                checked={filters.categories.includes(category)}
                onChange={() => onChangeCategory(category)}
              />
              <span>{category}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <h3 className="filter-title">Rango de fechas</h3>
        <div className="date-range-fields">
          <input
            type="date"
            className="input"
            value={filters.startDate}
            onChange={(event) => onChangeField('startDate', event.target.value)}
          />
          <input
            type="date"
            className="input"
            value={filters.endDate}
            onChange={(event) => onChangeField('endDate', event.target.value)}
          />
        </div>
      </div>

      <div className="filter-group">
        <h3 className="filter-title">Localidad</h3>
        <select
          className="select"
          value={filters.locality}
          onChange={(event) => onChangeField('locality', event.target.value)}
        >
          <option value="">Todas</option>
          <option value="Lima">Lima</option>
          <option value="Cusco">Cusco</option>
          <option value="Arequipa">Arequipa</option>
          <option value="Trujillo">Trujillo</option>
        </select>
      </div>

      <div className="filter-actions">
        <button type="button" className="btn-secondary" onClick={onClear}>
          Limpiar filtros
        </button>
      </div>
    </aside>
  );
}
