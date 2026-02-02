import { useState, useEffect } from 'react';
import './CartDrawer.css';
import jsPDF from 'jspdf';

const API_URL = import.meta.env.VITE_API_URL || 'https://honor-culture-store.onrender.com/api';

export default function CartDrawer({ items, onClose, onUpdateQuantity, onRemove }) {
  const [currentStep, setCurrentStep] = useState(1); // 1: Shipping, 2: Payment, 3: Success
  const [shippingData, setShippingData] = useState({
    fullName: '',
    email: '',
    phone: '',
    country: '',
    state: '',
    city: '',
    streetAddress: '',
    postalCode: ''
  });
  const [paymentData, setPaymentData] = useState({
    cardHolderName: '',
    cardNumber: '',
    expirationDate: '',
    cvv: '',
    message: ''
  });
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [orderResult, setOrderResult] = useState(null);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Address autocomplete using browser's geolocation API
  const handleAddressSearch = async (value) => {
    if (value.length < 3) {
      setAddressSuggestions([]);
      return;
    }

    // Simulate address suggestions (in production, use Google Places API or similar)
    // For now, we'll provide manual input support
    setIsLoadingAddress(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (shippingData.streetAddress) {
        handleAddressSearch(shippingData.streetAddress);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [shippingData.streetAddress]);

  const validateShippingForm = () => {
    const errors = {};
    
    if (shippingData.fullName.trim().length < 2) {
      errors.fullName = 'Full name is required (minimum 2 characters)';
    }
    if (!shippingData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingData.email)) {
      errors.email = 'Valid email address is required';
    }
    if (!shippingData.phone || shippingData.phone.length < 10) {
      errors.phone = 'Valid phone number is required';
    }
    if (!shippingData.country) {
      errors.country = 'Country is required';
    }
    if (!shippingData.state) {
      errors.state = 'State/Province is required';
    }
    if (!shippingData.city) {
      errors.city = 'City is required';
    }
    if (!shippingData.streetAddress || shippingData.streetAddress.length < 5) {
      errors.streetAddress = 'Street address is required';
    }
    if (!shippingData.postalCode) {
      errors.postalCode = 'Postal/ZIP code is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePaymentForm = () => {
    const errors = {};
    
    if (paymentData.cardHolderName.trim().length < 2) {
      errors.cardHolderName = 'Card holder name is required';
    }
    if (!paymentData.cardNumber || paymentData.cardNumber.length < 16) {
      errors.cardNumber = 'Valid card number is required (16 digits)';
    }
    if (!paymentData.expirationDate || paymentData.expirationDate.length < 4) {
      errors.expirationDate = 'Valid expiration date is required';
    }
    if (!paymentData.cvv || paymentData.cvv.length < 3) {
      errors.cvv = 'Valid CVV is required (3 digits)';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleShippingNext = () => {
    if (validateShippingForm()) {
      setCurrentStep(2);
      setFormErrors({});
    }
  };

  const generateCustomerInvoice = (orderId) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('HONOR CULTURE', 105, 20, { align: 'center' });
    
    doc.setFontSize(16);
    doc.text('Order Confirmation', 105, 30, { align: 'center' });
    
    // Order Info
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Order ID: ${orderId}`, 20, 50);
    doc.text(`Date: ${new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}`, 20, 58);
    
    // Thank you message
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Thank you for your patronage!', 105, 75, { align: 'center' });
    
    // Security notice box
    doc.setFillColor(240, 240, 240);
    doc.rect(15, 85, 180, 50, 'F');
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('SECURITY NOTICE', 105, 95, { align: 'center' });
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const securityText = 'You will receive a detailed invoice in your email before any amount is deducted, for security reasons and to confirm your order before shipping.';
    const splitText = doc.splitTextToSize(securityText, 170);
    doc.text(splitText, 20, 105);
    
    // Footer
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text('This is a confirmation document only. Not a billing invoice.', 105, 150, { align: 'center' });
    doc.text('Please check your email for the complete order details.', 105, 157, { align: 'center' });
    
    // Save
    doc.save(`Order-Confirmation-${orderId}.pdf`);
  };

  const handlePayment = async () => {
    if (!validatePaymentForm()) return;

    try {
      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            images: item.images
          })),
          shippingInfo: shippingData,
          paymentInfo: {
            cardHolderName: paymentData.cardHolderName,
            cardNumber: paymentData.cardNumber
          },
          total
        })
      });

      const data = await response.json();

      if (data.success) {
        setOrderResult({ success: true, orderId: data.orderId, message: data.message });
        setCurrentStep(3);
        
        // Generate and download customer invoice
        generateCustomerInvoice(data.orderId);

        // Store verified purchases
        const stored = localStorage.getItem('verifiedPurchases');
        const verified = stored ? JSON.parse(stored) : [];
        const updated = Array.from(new Set([...verified, ...items.map(item => item.id)]));
        localStorage.setItem('verifiedPurchases', JSON.stringify(updated));
      } else {
        setOrderResult({ success: false, message: data.message || 'Order failed' });
      }
    } catch (error) {
      setOrderResult({ success: false, message: 'Connection error. Please try again.' });
    }
  };

  const handleSelectAddress = (suggestion) => {
    setShippingData({
      ...shippingData,
      streetAddress: suggestion.streetAddress,
      city: suggestion.city,
      state: suggestion.state,
      postalCode: suggestion.postalCode,
      country: suggestion.country
    });
    setAddressSuggestions([]);
  };

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer-content" onClick={e => e.stopPropagation()}>
        <div className="drawer-header">
          <h2>Checkout</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Step Indicator */}
        {items.length > 0 && currentStep < 3 && (
          <div className="checkout-steps">
            <div className={`step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
              <div className="step-number">{currentStep > 1 ? '✓' : '1'}</div>
              <div className="step-label">Shipping</div>
            </div>
            <div className="step-line"></div>
            <div className={`step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
              <div className="step-number">{currentStep > 2 ? '✓' : '2'}</div>
              <div className="step-label">Payment</div>
            </div>
            <div className="step-line"></div>
            <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
              <div className="step-number">3</div>
              <div className="step-label">Complete</div>
            </div>
          </div>
        )}
        
        {items.length === 0 ? (
          <div className="empty-cart">
            <p>🛒 Your cart is empty</p>
            <small>Add items to get started</small>
          </div>
        ) : (
          <>
            {/* Cart Items Summary */}
            {currentStep < 3 && (
              <div className="cart-items">
                {items.map(item => (
                  <div key={item.id} className="cart-item">
                    <img src={item.images[0]} alt={item.name} />
                    <div className="item-info">
                      <h4>{item.name}</h4>
                      <p className="item-price">${item.price.toFixed(2)}</p>
                    </div>
                    <div className="item-controls">
                      <button onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}>−</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}>+</button>
                    </div>
                    <button className="remove-btn" onClick={() => onRemove(item.id)}>🗑️</button>
                  </div>
                ))}
              </div>
            )}

            {currentStep < 3 && (
              <div className="cart-total-section">
                <div className="total-row">
                  <span>Subtotal</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="total-row">
                  <span>Shipping</span>
                  <span>FREE</span>
                </div>
                <div className="final-total">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            )}

            {/* Step 1: Shipping Information */}
            {currentStep === 1 && (
              <div className="shipping-form">
                <h3>Shipping Information</h3>
                <p className="form-subtitle">Please enter your delivery details</p>

                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={shippingData.fullName}
                    onChange={e => setShippingData({ ...shippingData, fullName: e.target.value.replace(/[^a-zA-Z\s]/g, '') })}
                  />
                  {formErrors.fullName && <p className="field-error-text">{formErrors.fullName}</p>}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Email Address *</label>
                    <input
                      type="email"
                      placeholder="john@example.com"
                      value={shippingData.email}
                      onChange={e => setShippingData({ ...shippingData, email: e.target.value })}
                    />
                    {formErrors.email && <p className="field-error-text">{formErrors.email}</p>}
                  </div>

                  <div className="form-group">
                    <label>Phone Number *</label>
                    <input
                      type="tel"
                      placeholder="+1 234 567 8900"
                      value={shippingData.phone}
                      onChange={e => setShippingData({ ...shippingData, phone: e.target.value.replace(/[^0-9+\s]/g, '') })}
                    />
                    {formErrors.phone && <p className="field-error-text">{formErrors.phone}</p>}
                  </div>
                </div>

                <div className="form-group address-autocomplete">
                  <label>Street Address *</label>
                  <input
                    type="text"
                    placeholder="123 Main Street, Apt 4B"
                    value={shippingData.streetAddress}
                    onChange={e => setShippingData({ ...shippingData, streetAddress: e.target.value })}
                  />
                  {isLoadingAddress && <span className="loading-indicator">🔍 Searching...</span>}
                  {addressSuggestions.length > 0 && (
                    <div className="address-suggestions">
                      {addressSuggestions.map((suggestion, idx) => (
                        <div key={idx} className="suggestion-item" onClick={() => handleSelectAddress(suggestion)}>
                          {suggestion.fullAddress}
                        </div>
                      ))}
                    </div>
                  )}
                  {formErrors.streetAddress && <p className="field-error-text">{formErrors.streetAddress}</p>}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>City *</label>
                    <input
                      type="text"
                      placeholder="New York"
                      value={shippingData.city}
                      onChange={e => setShippingData({ ...shippingData, city: e.target.value })}
                    />
                    {formErrors.city && <p className="field-error-text">{formErrors.city}</p>}
                  </div>

                  <div className="form-group">
                    <label>State/Province *</label>
                    <input
                      type="text"
                      placeholder="NY"
                      value={shippingData.state}
                      onChange={e => setShippingData({ ...shippingData, state: e.target.value })}
                    />
                    {formErrors.state && <p className="field-error-text">{formErrors.state}</p>}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Postal/ZIP Code *</label>
                    <input
                      type="text"
                      placeholder="10001"
                      value={shippingData.postalCode}
                      onChange={e => setShippingData({ ...shippingData, postalCode: e.target.value })}
                    />
                    {formErrors.postalCode && <p className="field-error-text">{formErrors.postalCode}</p>}
                  </div>

                  <div className="form-group">
                    <label>Country *</label>
                    <input
                      type="text"
                      placeholder="United States"
                      value={shippingData.country}
                      onChange={e => setShippingData({ ...shippingData, country: e.target.value })}
                    />
                    {formErrors.country && <p className="field-error-text">{formErrors.country}</p>}
                  </div>
                </div>

                <button className="btn-next" onClick={handleShippingNext}>
                  Continue to Payment →
                </button>
              </div>
            )}

            {/* Step 2: Payment Information */}
            {currentStep === 2 && (
              <div className="payment-form">
                <h3>Payment Information</h3>
                <p className="form-subtitle">Enter your payment details</p>

                <div className="form-group">
                  <label>Card Holder's Name *</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={paymentData.cardHolderName}
                    onChange={e => setPaymentData({ ...paymentData, cardHolderName: e.target.value.replace(/[^a-zA-Z\s]/g, '') })}
                  />
                  {formErrors.cardHolderName && <p className="field-error-text">{formErrors.cardHolderName}</p>}
                </div>

                <div className="form-group">
                  <label>Card Number *</label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    maxLength="16"
                    value={paymentData.cardNumber}
                    onChange={e => setPaymentData({ ...paymentData, cardNumber: e.target.value.replace(/\D/g, '') })}
                  />
                  {formErrors.cardNumber && <p className="field-error-text">{formErrors.cardNumber}</p>}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Expiration Date *</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      maxLength="4"
                      value={paymentData.expirationDate}
                      onChange={e => setPaymentData({ ...paymentData, expirationDate: e.target.value.replace(/\D/g, '') })}
                    />
                    {formErrors.expirationDate && <p className="field-error-text">{formErrors.expirationDate}</p>}
                  </div>

                  <div className="form-group">
                    <label>CVV *</label>
                    <input
                      type="text"
                      placeholder="123"
                      maxLength="3"
                      value={paymentData.cvv}
                      onChange={e => setPaymentData({ ...paymentData, cvv: e.target.value.replace(/\D/g, '') })}
                    />
                    {formErrors.cvv && <p className="field-error-text">{formErrors.cvv}</p>}
                  </div>
                </div>

                <div className="form-group">
                  <label>Message (Optional)</label>
                  <textarea
                    placeholder="Special delivery instructions..."
                    rows="3"
                    maxLength="500"
                    value={paymentData.message}
                    onChange={e => setPaymentData({ ...paymentData, message: e.target.value })}
                  />
                </div>

                <div className="security-notice">
                  <p>🔒 <strong>Secure Payment</strong></p>
                  <p>Your payment information is encrypted and secure.</p>
                </div>

                <div className="button-group">
                  <button className="btn-back" onClick={() => setCurrentStep(1)}>
                    ← Back to Shipping
                  </button>
                  <button className="btn-submit" onClick={handlePayment}>
                    Complete Payment
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Success */}
            {currentStep === 3 && orderResult && (
              <div className={`order-result ${orderResult.success ? 'success' : 'failure'}`}>
                <div className="result-icon">
                  {orderResult.success ? '✓' : '✗'}
                </div>
                <h2>{orderResult.success ? 'Order Successful!' : 'Order Failed'}</h2>
                {orderResult.success && (
                  <>
                    <p className="order-id">Order ID: <strong>{orderResult.orderId}</strong></p>
                    <p className="success-message">Your order confirmation has been downloaded.</p>
                    
                    <div className="email-notice">
                      <div className="notice-icon">📧</div>
                      <div className="notice-content">
                        <h4>Important Security Notice</h4>
                        <p>A detailed invoice will be sent to your email (<strong>{shippingData.email}</strong>) before any amount is deducted.</p>
                        <p>This is for security reasons and to confirm your order before shipping.</p>
                      </div>
                    </div>

                    <div className="order-summary-box">
                      <h4>Order Summary</h4>
                      <p><strong>Items:</strong> {items.length}</p>
                      <p><strong>Total:</strong> ${total.toFixed(2)}</p>
                      <p><strong>Shipping to:</strong> {shippingData.city}, {shippingData.state}</p>
                    </div>
                  </>
                )}
                {!orderResult.success && (
                  <p className="error-message">{orderResult.message}</p>
                )}
                <button className="btn-close-success" onClick={onClose}>
                  {orderResult.success ? 'Continue Shopping' : 'Try Again'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
