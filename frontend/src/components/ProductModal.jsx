import { useEffect, useMemo, useRef, useState } from 'react';
import './ProductModal.css';

const DEFAULT_REVIEWS = [
  {
    id: 'r1',
    productId: 'p1',
    name: 'Jordan K.',
    rating: 5,
    title: 'Zero distractions',
    comment: 'Fits perfectly and feels premium. Fabric stays cool even on long runs.',
    date: 'Jan 12, 2026',
    verified: true
  },
  {
    id: 'r2',
    productId: 'p2',
    name: 'Amelia R.',
    rating: 4,
    title: 'Supportive and sleek',
    comment: 'Compression is spot on. Would love more colors but overall fantastic.',
    date: 'Jan 22, 2026',
    verified: true
  },
  {
    id: 'r3',
    productId: 'p3',
    name: 'Leo M.',
    rating: 5,
    title: 'Cozy build',
    comment: 'Warm without being heavy. Great for travel and the gym.',
    date: 'Jan 28, 2026',
    verified: true
  }
];

const REVIEWS_KEY = 'productReviews';
const VERIFIED_KEY = 'verifiedPurchases';

const getStoredReviews = () => {
  try {
    const stored = localStorage.getItem(REVIEWS_KEY);
    if (!stored) return DEFAULT_REVIEWS;
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) && parsed.length ? parsed : DEFAULT_REVIEWS;
  } catch (error) {
    return DEFAULT_REVIEWS;
  }
};

const storeReviews = (reviews) => {
  localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));
};

const getVerifiedPurchases = () => {
  try {
    const stored = localStorage.getItem(VERIFIED_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    return [];
  }
};

const getProductMetric = (productId, min, max) => {
  const seed = productId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const range = max - min + 1;
  return min + (seed % range);
};

export default function ProductModal({ product, products = [], onClose, onAddToCart }) {
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const [quantity, setQuantity] = useState(1);
  const [imageIndex, setImageIndex] = useState(0);
  const [allReviews, setAllReviews] = useState(getStoredReviews);
  const [reviewForm, setReviewForm] = useState({ name: '', rating: 5, title: '', comment: '' });
  const [shareStatus, setShareStatus] = useState(null);
  const [wishlisted, setWishlisted] = useState(false);
  const sizeGuideRef = useRef(null);

  const popularity = useMemo(() => getProductMetric(product.id, 84, 99), [product.id]);
  const discount = useMemo(() => getProductMetric(product.id, 12, 28), [product.id]);
  const verifiedPurchases = useMemo(() => getVerifiedPurchases(), [product.id]);
  const isVerifiedBuyer = verifiedPurchases.includes(product.id);

  const productReviews = useMemo(
    () => allReviews.filter(review => review.productId === product.id),
    [allReviews, product.id]
  );

  const ratingStats = useMemo(() => {
    if (productReviews.length === 0) return { average: 0, count: 0 };
    const total = productReviews.reduce((sum, review) => sum + review.rating, 0);
    return { average: total / productReviews.length, count: productReviews.length };
  }, [productReviews]);

  const recommendedProducts = useMemo(() => {
    const related = products.filter(
      item => item.id !== product.id && item.category === product.category
    );
    return related.slice(0, 4);
  }, [products, product]);

  useEffect(() => {
    setSelectedColor(product.colors[0]);
    setSelectedSize(product.sizes[0]);
    setQuantity(1);
    setImageIndex(0);
    setAllReviews(getStoredReviews());
    setReviewForm({ name: '', rating: 5, title: '', comment: '' });
    setShareStatus(null);
    setWishlisted(false);
  }, [product]);

  const handleShare = async () => {
    const shareData = {
      title: product.name,
      text: `Check out ${product.name} from HONOR CULTURE.`
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setShareStatus('Shared successfully');
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        setShareStatus('Link copied');
      } else {
        setShareStatus('Sharing not supported');
      }
    } catch (error) {
      setShareStatus('Unable to share');
    }
  };

  const handleAddReview = () => {
    if (!isVerifiedBuyer) return;
    if (!reviewForm.name.trim() || !reviewForm.comment.trim()) return;

    const newReview = {
      id: `r-${Date.now()}`,
      productId: product.id,
      name: reviewForm.name.trim(),
      rating: Number(reviewForm.rating),
      title: reviewForm.title.trim() || 'Verified review',
      comment: reviewForm.comment.trim(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      verified: true
    };

    const updated = [newReview, ...allReviews];
    setAllReviews(updated);
    storeReviews(updated);
    setReviewForm({ name: '', rating: 5, title: '', comment: '' });
  };

  const scrollToSizeGuide = (event) => {
    event.preventDefault();
    if (sizeGuideRef.current) {
      sizeGuideRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>✕</button>
        
        <div className="modal-grid">
          <div className="modal-images">
            <img src={product.images[imageIndex]} alt={product.name} className="modal-image" />
            {product.images.length > 1 && (
              <div className="image-thumbnails">
                {product.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`View ${idx + 1}`}
                    className={`thumbnail ${idx === imageIndex ? 'active' : ''}`}
                    onClick={() => setImageIndex(idx)}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="modal-info">
            <div className="modal-header">
              <div>
                <h2>{product.name}</h2>
                <p className="modal-category">{product.category}</p>
              </div>
              <div className="engagement-actions">
                <button
                  className={`engage-btn ${wishlisted ? 'active' : ''}`}
                  onClick={() => setWishlisted(prev => !prev)}
                >
                  {wishlisted ? '♥ Wishlisted' : '♡ Add to Wishlist'}
                </button>
                <button className="engage-btn" onClick={handleShare}>Share</button>
              </div>
            </div>
            <p className="modal-price">${product.price.toFixed(2)}</p>
            <div className="rating-summary">
              <div className="stars">
                {'★★★★★'.split('').map((star, idx) => (
                  <span key={star + idx} className={idx < Math.round(ratingStats.average) ? 'filled' : ''}>★</span>
                ))}
              </div>
              <span>{ratingStats.average ? ratingStats.average.toFixed(1) : 'New'} ({ratingStats.count})</span>
            </div>
            <div className="metric-card">
              <div className="metric-row">
                <span>Popularity</span>
                <strong>{popularity}%</strong>
              </div>
              <div className="metric-bar">
                <span style={{ width: `${popularity}%` }}></span>
              </div>
              <p className="metric-note">Limited drop: save {discount}% today</p>
            </div>
            <p className="modal-description">{product.description}</p>

            <div className="trust-badges">
              <div className="trust-badge">🚚 Free Shipping</div>
              <div className="trust-badge">🔒 Secure Payment</div>
              <div className="trust-badge">🛡️ Privacy Guaranteed</div>
              <div className="trust-badge">✅ Order Guarantee</div>
            </div>

            <div className="modal-options">
              <div className="option-group">
                <label>Color:</label>
                <div className="color-options">
                  {product.colors.map(color => (
                    <button
                      key={color}
                      className={`color-btn ${selectedColor === color ? 'selected' : ''}`}
                      onClick={() => setSelectedColor(color)}
                      title={color}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              <div className="option-group">
                <div className="option-row">
                  <label>Size:</label>
                  <a href="#size-guide" className="size-guide-link" onClick={scrollToSizeGuide}>Size guide</a>
                </div>
                <div className="size-options">
                  {product.sizes.map(size => (
                    <button
                      key={size}
                      className={`size-btn ${selectedSize === size ? 'selected' : ''}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="option-group">
                <label>Quantity:</label>
                <div className="quantity-control">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
                  <input type="number" value={quantity} onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} />
                  <button onClick={() => setQuantity(quantity + 1)}>+</button>
                </div>
              </div>
            </div>

            <button 
              className="btn-add-modal" 
              onClick={() => {
                onAddToCart({ ...product, selectedColor, selectedSize }, quantity);
                onClose();
              }}
            >
              Add {quantity} to Cart
            </button>

            {shareStatus && <p className="share-status">{shareStatus}</p>}

            <div className="review-section">
              <div className="review-header">
                <h3>Verified Purchase Reviews</h3>
                <span>{ratingStats.count} reviews</span>
              </div>
              <div className="review-list">
                {productReviews.length === 0 ? (
                  <p className="empty-review">Be the first verified buyer to review this item.</p>
                ) : (
                  productReviews.map(review => (
                    <div key={review.id} className="review-card">
                      <div className="review-top">
                        <div>
                          <h4>{review.title}</h4>
                          <p className="review-meta">{review.name} · {review.date}</p>
                        </div>
                        <div className="review-badges">
                          {review.verified && <span className="verified-badge">Verified</span>}
                          <span className="review-rating">{'★'.repeat(review.rating)}</span>
                        </div>
                      </div>
                      <p className="review-comment">{review.comment}</p>
                    </div>
                  ))
                )}
              </div>

              <div className="review-form">
                <h4>Add your review</h4>
                {!isVerifiedBuyer ? (
                  <p className="review-lock">Only verified purchasers can leave a review. Complete checkout to unlock.</p>
                ) : (
                  <>
                    <div className="review-field">
                      <label>Your name</label>
                      <input
                        type="text"
                        value={reviewForm.name}
                        onChange={event => setReviewForm({ ...reviewForm, name: event.target.value })}
                        placeholder="Name"
                      />
                    </div>
                    <div className="review-field">
                      <label>Rating</label>
                      <select
                        value={reviewForm.rating}
                        onChange={event => setReviewForm({ ...reviewForm, rating: event.target.value })}
                      >
                        {[5, 4, 3, 2, 1].map(value => (
                          <option key={value} value={value}>{value} Stars</option>
                        ))}
                      </select>
                    </div>
                    <div className="review-field">
                      <label>Headline</label>
                      <input
                        type="text"
                        value={reviewForm.title}
                        onChange={event => setReviewForm({ ...reviewForm, title: event.target.value })}
                        placeholder="Short summary"
                      />
                    </div>
                    <div className="review-field">
                      <label>Comment</label>
                      <textarea
                        rows="3"
                        value={reviewForm.comment}
                        onChange={event => setReviewForm({ ...reviewForm, comment: event.target.value })}
                        placeholder="Tell us about the fit, feel, and finish"
                      />
                    </div>
                    <button className="btn-review" onClick={handleAddReview}>Submit Review</button>
                  </>
                )}
              </div>
            </div>

            {recommendedProducts.length > 0 && (
              <div className="recommended-section" data-reveal>
                <h3>Recommended for you</h3>
                <div className="recommended-grid">
                  {recommendedProducts.map(item => (
                    <div key={item.id} className="recommended-card">
                      <img src={item.images[0]} alt={item.name} />
                      <div>
                        <h4>{item.name}</h4>
                        <p>${item.price.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="size-guide" id="size-guide" ref={sizeGuideRef}>
              <h3>Size guide</h3>
              <p>Find your best fit. Sizes are in inches.</p>
              <div className="size-table">
                <div className="size-row size-head">
                  <span>Size</span>
                  <span>Chest</span>
                  <span>Waist</span>
                  <span>Hip</span>
                </div>
                {['XS', 'S', 'M', 'L', 'XL'].map(size => (
                  <div key={size} className="size-row">
                    <span>{size}</span>
                    <span>{size === 'XS' ? '32-34' : size === 'S' ? '35-37' : size === 'M' ? '38-40' : size === 'L' ? '41-43' : '44-46'}</span>
                    <span>{size === 'XS' ? '24-26' : size === 'S' ? '27-29' : size === 'M' ? '30-32' : size === 'L' ? '33-35' : '36-38'}</span>
                    <span>{size === 'XS' ? '34-36' : size === 'S' ? '37-39' : size === 'M' ? '40-42' : size === 'L' ? '43-45' : '46-48'}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
