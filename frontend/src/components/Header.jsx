import { useState } from 'react';
import './Header.css';

export default function Header({ cartCount, onCartClick }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleToggleMenu = () => setIsMenuOpen((prev) => !prev);
  const handleCloseMenu = () => setIsMenuOpen(false);

  return (
    <header className="header">
      <div className="header-content">
        <button
          className="menu-toggle"
          aria-label="Toggle navigation"
          aria-expanded={isMenuOpen}
          onClick={handleToggleMenu}
        >
          <span className="menu-line"></span>
          <span className="menu-line"></span>
        </button>

        <h1 className="logo">HONOR</h1>

        <nav className="nav">
          <a href="#shop">Shop</a>
          <a href="#mens">Men</a>
          <a href="#womens">Women</a>
          <a href="#accessories">Accessories</a>
        </nav>

        <div className="header-actions">
          <div className="search-wrapper">
            <input type="text" placeholder="Search" className="search-bar" />
          </div>
          <button className="cart-btn" onClick={onCartClick}>
            Cart <span className="badge">{cartCount}</span>
          </button>
        </div>
      </div>

      <div className={`mobile-menu ${isMenuOpen ? 'open' : ''}`}>
        <div className="mobile-menu-content">
          <nav className="mobile-nav">
            <a href="#shop" onClick={handleCloseMenu}>Shop</a>
            <a href="#mens" onClick={handleCloseMenu}>Men</a>
            <a href="#womens" onClick={handleCloseMenu}>Women</a>
            <a href="#accessories" onClick={handleCloseMenu}>Accessories</a>
          </nav>
          <div className="mobile-search">
            <input type="text" placeholder="Search" className="search-bar" />
          </div>
          <button className="mobile-cart" onClick={() => { handleCloseMenu(); onCartClick(); }}>
            Open Cart ({cartCount})
          </button>
        </div>
        <button className="mobile-backdrop" onClick={handleCloseMenu} aria-label="Close menu"></button>
      </div>
    </header>
  );
}
