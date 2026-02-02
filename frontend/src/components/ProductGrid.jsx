import './ProductGrid.css';

export default function ProductGrid({ products, onSelectProduct, onAddToCart }) {
  if (products.length === 0) {
    return <div className="no-products">No products found. Try adjusting your filters.</div>;
  }

  return (
    <section className="products reveal" data-reveal>
      <h2 className="section-title">Featured Collection</h2>
      <div className="product-grid">
        {products.map(product => (
          <div key={product.id} className="product-card">
            <div className="product-image-wrapper">
              <img src={product.images[0]} alt={product.name} className="product-image" />
              <div className="overlay">
                <button className="btn-view" onClick={() => onSelectProduct(product)}>Quick View</button>
              </div>
            </div>
            <div className="product-info">
              <h3 className="product-name">{product.name}</h3>
              <p className="product-category">{product.category}</p>
              <p className="product-price">${product.price.toFixed(2)}</p>
              <button className="btn-add" onClick={() => onAddToCart(product)}>Add to Cart</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
