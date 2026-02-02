import { useState, useEffect } from 'react';
import './App.css';
import Header from './components/Header';
import ProductGrid from './components/ProductGrid';
import CartDrawer from './components/CartDrawer';
import ProductModal from './components/ProductModal';
import AdminPanel from './components/AdminPanel';
import FilterPanel from './components/FilterPanel';
import Footer from './components/Footer';

const API_URL = 'http://localhost:5000/api';

function App() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showCart, setShowCart] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ category: 'All', minPrice: 0, maxPrice: 200 });
  const [adminToken, setAdminToken] = useState(null);

  useEffect(() => {
    fetchProducts();
    const savedCart = localStorage.getItem('cart');
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  useEffect(() => {
    applyFilters();
  }, [products, filters]);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    const elements = document.querySelectorAll('[data-reveal]');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      },
      { threshold: 0.2 }
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [products]);

  const fetchProducts = async (category, minPrice, maxPrice) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (category && category !== 'All') params.append('category', category);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);
      
      const response = await fetch(`${API_URL}/products${params ? '?' + params : ''}`);
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      alert('Failed to load products. Make sure backend is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = products;
    
    if (filters.category && filters.category !== 'All') {
      filtered = filtered.filter(p => p.category === filters.category);
    }
    
    filtered = filtered.filter(p => p.price >= filters.minPrice && p.price <= filters.maxPrice);
    setFilteredProducts(filtered);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    fetchProducts(newFilters.category, newFilters.minPrice, newFilters.maxPrice);
  };

  const addToCart = (product, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
  };

  const updateCartQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      setCart(cart.filter(item => item.id !== productId));
    } else {
      setCart(cart.map(item =>
        item.id === productId ? { ...item, quantity } : item
      ));
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const handleAddProduct = async (newProduct) => {
    if (!adminToken) return alert('Please login first');
    
    try {
      const response = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newProduct, token: adminToken })
      });
      
      if (response.ok) {
        fetchProducts();
        alert('Product added successfully!');
      } else {
        alert('Failed to add product');
      }
    } catch (error) {
      console.error('Failed to add product:', error);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!adminToken) return alert('Please login first');
    
    try {
      const response = await fetch(`${API_URL}/products/${productId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: adminToken })
      });
      
      if (response.ok) {
        fetchProducts();
        alert('Product deleted successfully!');
      }
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  };

  const handleUpdateProduct = async (productId, updatedProduct) => {
    if (!adminToken) return alert('Please login first');
    
    try {
      const response = await fetch(`${API_URL}/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...updatedProduct, token: adminToken })
      });
      
      if (response.ok) {
        fetchProducts();
        alert('Product updated successfully!');
      } else {
        alert('Failed to update product');
      }
    } catch (error) {
      console.error('Failed to update product:', error);
    }
  };

  const handleAdminLogin = (token) => {
    setAdminToken(token);
  };

  return (
    <div className="app">
      <Header cartCount={cart.length} onCartClick={() => setShowCart(true)} />
      
      <div className="app-container">
        <FilterPanel filters={filters} onFilterChange={handleFilterChange} />
        
        <main className="main-content reveal" id="shop" data-reveal>
          <span className="section-anchor" id="mens"></span>
          <span className="section-anchor" id="womens"></span>
          <span className="section-anchor" id="accessories"></span>
          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
              <p>Loading products...</p>
            </div>
          ) : (
            <ProductGrid 
              products={filteredProducts} 
              onSelectProduct={setSelectedProduct} 
              onAddToCart={addToCart}
            />
          )}
        </main>
      </div>

      {selectedProduct && (
        <ProductModal 
          product={selectedProduct}
          products={products}
          onClose={() => setSelectedProduct(null)} 
          onAddToCart={addToCart}
        />
      )}

      {showCart && (
        <CartDrawer
          items={cart}
          onClose={() => setShowCart(false)}
          onUpdateQuantity={updateCartQuantity}
          onRemove={removeFromCart}
        />
      )}

      <Footer onAdminClick={() => setShowAdmin(true)} />

      {showAdmin && (
        <AdminPanel
          products={products}
          onClose={() => setShowAdmin(false)}
          onAddProduct={handleAddProduct}
          onDeleteProduct={handleDeleteProduct}
          onUpdateProduct={handleUpdateProduct}
          onAdminLogin={handleAdminLogin}
          isAuthenticated={!!adminToken}
        />
      )}
    </div>
  );
}

export default App;
