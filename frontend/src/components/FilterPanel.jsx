import './FilterPanel.css';

export default function FilterPanel({ filters, onFilterChange }) {
  const categories = ['All', "Men's", "Women's", 'Accessories'];

  return (
    <aside className="filter-panel reveal" data-reveal>
      <h3>Filters</h3>
      
      <div className="filter-group">
        <label>Category</label>
        <div className="filter-buttons">
          {categories.map(cat => (
            <button
              key={cat}
              className={`filter-btn ${filters.category === cat ? 'active' : ''}`}
              onClick={() => onFilterChange({ ...filters, category: cat })}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <label>Price Range</label>
        <div className="price-inputs">
          <div className="input-group">
            <label>Min</label>
            <input
              type="number"
              value={filters.minPrice}
              onChange={(e) => onFilterChange({ ...filters, minPrice: parseFloat(e.target.value) || 0 })}
              placeholder="0"
            />
          </div>
          <div className="input-group">
            <label>Max</label>
            <input
              type="number"
              value={filters.maxPrice}
              onChange={(e) => onFilterChange({ ...filters, maxPrice: parseFloat(e.target.value) || 200 })}
              placeholder="200"
            />
          </div>
        </div>
        <div className="price-display">
          ${filters.minPrice.toFixed(2)} - ${filters.maxPrice.toFixed(2)}
        </div>
      </div>
    </aside>
  );
}
