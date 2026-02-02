import './Footer.css';

export default function Footer({ onAdminClick }) {
  return (
    <footer className="footer reveal" data-reveal>
      <div className="footer-content">
        <div className="footer-section">
          <h4>About Honor Culture</h4>
          <p>Premium fitness apparel for active lifestyle</p>
        </div>
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="#/">Shop</a></li>
            <li><a href="#/">About</a></li>
            <li><a href="#/">Contact</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>Legal</h4>
          <ul>
            <li><a href="#/">Privacy</a></li>
            <li><a href="#/">Terms</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2026 HONOR Culture. All rights reserved.</p>
        <button className="admin-link" onClick={onAdminClick}>👨‍💼 Admin</button>
      </div>
    </footer>
  );
}
