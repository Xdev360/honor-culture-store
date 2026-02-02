import { useState, useEffect } from 'react';
import './AdminPanel.css';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const API_URL = import.meta.env.VITE_API_URL || 'https://honor-culture-store.onrender.com/api';

const PRESET_COLORS = [
  { name: 'Black', hex: '#000000' }, { name: 'White', hex: '#FFFFFF' }, { name: 'Navy', hex: '#001F3F' },
  { name: 'Gray', hex: '#808080' }, { name: 'Red', hex: '#FF4136' }, { name: 'Blue', hex: '#0074D9' },
  { name: 'Green', hex: '#2ECC40' }, { name: 'Purple', hex: '#B10DC9' }, { name: 'Pink', hex: '#F012BE' },
  { name: 'Olive', hex: '#3D9970' }, { name: 'Burgundy', hex: '#85144B' }
];

const PRESET_SIZES = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size'];

export default function AdminPanel({ products, onClose, onAddProduct, onDeleteProduct, onUpdateProduct, onAdminLogin, isAuthenticated }) {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [activeTab, setActiveTab] = useState('products');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [adminData, setAdminData] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const [inventoryAlerts, setInventoryAlerts] = useState({ lowStock: [], outOfStock: [], total: 0 });
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '', category: "Men's", price: '',
    images: [{ id: Date.now(), url: '', order: 0, variant: 'front' }],
    description: '', inventory: '', colors: [], sizes: [], variants: [], tags: []
  });

  const [categoryFormData, setCategoryFormData] = useState({ name: '', description: '', subcategories: [] });

  useEffect(() => {
    if (isAuthenticated && adminData?.token) {
      fetchCategories();
      fetchAuditLogs();
      fetchInventoryAlerts();
      fetchOrders();
    }
  }, [isAuthenticated, adminData]);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/categories`);
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchAuditLogs = async () => {
    if (!adminData?.token) return;
    try {
      const response = await fetch(`${API_URL}/audit-log?token=${adminData.token}&limit=100`);
      const data = await response.json();
      setAuditLogs(data);
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
    }
  };

  const fetchInventoryAlerts = async () => {
    if (!adminData?.token) return;
    try {
      const response = await fetch(`${API_URL}/inventory/alerts?token=${adminData.token}&threshold=15`);
      const data = await response.json();
      setInventoryAlerts(data);
    } catch (error) {
      console.error('Failed to fetch inventory alerts:', error);
    }
  };

  const fetchOrders = async () => {
    if (!adminData?.token) return;
    try {
      const response = await fetch(`${API_URL}/orders?token=${adminData.token}`);
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    }
  };

  const generateAdminInvoice = (order) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(0, 0, 0);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text('HONOR CULTURE', 105, 20, { align: 'center' });
    
    doc.setFontSize(14);
    doc.text('Official Invoice', 105, 30, { align: 'center' });
    
    // Order Information
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Order Information', 20, 55);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Order ID: ${order.id}`, 20, 63);
    doc.text(`Order Date: ${new Date(order.date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}`, 20, 70);
    doc.text(`Status: ${order.status}`, 20, 77);
    
    // Customer Information
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Customer Information', 20, 90);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Name: ${order.shippingInfo.fullName}`, 20, 98);
    doc.text(`Email: ${order.shippingInfo.email}`, 20, 105);
    doc.text(`Phone: ${order.shippingInfo.phone}`, 20, 112);
    
    // Shipping Address
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Shipping Address', 110, 90);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(order.shippingInfo.streetAddress, 110, 98);
    doc.text(`${order.shippingInfo.city}, ${order.shippingInfo.state} ${order.shippingInfo.postalCode}`, 110, 105);
    doc.text(order.shippingInfo.country, 110, 112);
    
    // Order Items Table
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Order Items', 20, 130);
    
    const tableData = order.items.map(item => [
      item.name,
      item.variant ? `${item.variant.color || ''} ${item.variant.size || ''}`.trim() : '-',
      item.quantity.toString(),
      `$${item.price.toFixed(2)}`,
      `$${(item.price * item.quantity).toFixed(2)}`
    ]);
    
    doc.autoTable({
      startY: 135,
      head: [['Product', 'Variant', 'Qty', 'Price', 'Total']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 10 },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 40 },
        2: { cellWidth: 20, halign: 'center' },
        3: { cellWidth: 30, halign: 'right' },
        4: { cellWidth: 30, halign: 'right' }
      }
    });
    
    // Totals
    const finalY = doc.lastAutoTable.finalY + 10;
    
    doc.setFont('helvetica', 'normal');
    doc.text('Subtotal:', 140, finalY);
    doc.text(`$${order.total.toFixed(2)}`, 180, finalY, { align: 'right' });
    
    doc.text('Shipping:', 140, finalY + 7);
    doc.text('FREE', 180, finalY + 7, { align: 'right' });
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Total:', 140, finalY + 17);
    doc.text(`$${order.total.toFixed(2)}`, 180, finalY + 17, { align: 'right' });
    
    // Payment Information
    if (order.paymentInfo) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Payment Method: Card ending in ${order.paymentInfo.lastFourDigits || '****'}`, 20, finalY + 30);
    }
    
    // Footer
    doc.setFillColor(240, 240, 240);
    doc.rect(0, 270, 210, 27, 'F');
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 100, 100);
    doc.text('Thank you for your business!', 105, 280, { align: 'center' });
    doc.text('HONOR CULTURE - Premium Athletic Wear', 105, 287, { align: 'center' });
    
    // Save
    doc.save(`Invoice-${order.id}.pdf`);
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`${API_URL}/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: adminData.token, status: newStatus })
      });

      if (response.ok) {
        fetchOrders();
        fetchAuditLogs();
        alert('Order status updated successfully');
      }
    } catch (error) {
      alert('Failed to update order status');
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      if (response.ok) {
        const data = await response.json();
        setAdminData(data);
        onAdminLogin(data.token);
      } else {
        alert('Invalid credentials. Try: admin/admin123 or manager/manager123');
      }
    } catch (error) {
      alert('Connection error. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '', category: "Men's", price: '',
      images: [{ id: Date.now(), url: '', order: 0, variant: 'front' }],
      description: '', inventory: '', colors: [], sizes: [], variants: [], tags: []
    });
    setEditingProduct(null);
    setShowForm(false);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    const imageData = Array.isArray(product.images) 
      ? (typeof product.images[0] === 'string' 
        ? product.images.map((url, idx) => ({ id: Date.now() + idx, url, order: idx, variant: 'product' }))
        : product.images)
      : [{ id: Date.now(), url: '', order: 0, variant: 'front' }];
    
    setFormData({
      name: product.name, category: product.category, price: product.price, images: imageData,
      description: product.description || '', inventory: product.inventory,
      colors: product.colors || [], sizes: product.sizes || [],
      variants: product.variants || [], tags: product.tags || []
    });
    setShowForm(true);
  };

  const handleAddProduct = async () => {
    if (!formData.name || !formData.price) {
      alert('Please fill in all required fields (name and price)');
      return;
    }

    const productData = {
      name: formData.name, category: formData.category, price: parseFloat(formData.price),
      colors: formData.colors, sizes: formData.sizes,
      images: formData.images.filter(img => img.url),
      description: formData.description, inventory: parseInt(formData.inventory) || 0,
      variants: formData.variants, tags: formData.tags
    };

    if (editingProduct) {
      onUpdateProduct(editingProduct.id, productData);
    } else {
      onAddProduct(productData);
    }

    resetForm();
    setTimeout(() => fetchInventoryAlerts(), 1000);
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) return alert('Please select products to delete');
    if (!confirm(`Delete ${selectedProducts.length} product(s)?`)) return;

    try {
      const response = await fetch(`${API_URL}/products/bulk-delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: adminData.token, productIds: selectedProducts })
      });

      if (response.ok) {
        selectedProducts.forEach(id => onDeleteProduct(id));
        setSelectedProducts([]);
        fetchAuditLogs();
        alert('Products deleted successfully');
      }
    } catch (error) {
      alert('Failed to delete products');
    }
  };

  const handleAddImage = () => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, { id: Date.now(), url: '', order: prev.images.length, variant: 'product' }]
    }));
  };

  const handleRemoveImage = (imageId) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter(img => img.id !== imageId).map((img, idx) => ({ ...img, order: idx }))
    }));
  };

  const handleImageChange = (imageId, field, value) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map(img => img.id === imageId ? { ...img, [field]: value } : img)
    }));
  };

  const handleColorToggle = (color) => {
    if (formData.colors.includes(color)) {
      setFormData(prev => ({ ...prev, colors: prev.colors.filter(c => c !== color) }));
    } else {
      setFormData(prev => ({ ...prev, colors: [...prev.colors, color] }));
    }
  };

  const handleSizeToggle = (size) => {
    if (formData.sizes.includes(size)) {
      setFormData(prev => ({ ...prev, sizes: prev.sizes.filter(s => s !== size) }));
    } else {
      setFormData(prev => ({ ...prev, sizes: [...prev.sizes, size] }));
    }
  };

  const handleAddVariant = () => {
    if (formData.colors.length === 0 || formData.sizes.length === 0) {
      return alert('Please add colors and sizes first');
    }

    const newVariant = {
      id: 'v' + Date.now(), color: formData.colors[0], size: formData.sizes[0],
      sku: `${formData.name.substring(0, 3).toUpperCase()}-${formData.colors[0].substring(0, 3).toUpperCase()}-${formData.sizes[0]}`,
      stock: 0, price: parseFloat(formData.price)
    };

    setFormData(prev => ({ ...prev, variants: [...prev.variants, newVariant] }));
  };

  const handleRemoveVariant = (variantId) => {
    setFormData(prev => ({ ...prev, variants: prev.variants.filter(v => v.id !== variantId) }));
  };

  const handleVariantChange = (variantId, field, value) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map(v => v.id === variantId ? { ...v, [field]: value } : v)
    }));
  };

  const handleAddCategory = async () => {
    if (!categoryFormData.name) return alert('Please enter category name');

    try {
      const response = await fetch(`${API_URL}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: adminData.token, ...categoryFormData })
      });

      if (response.ok) {
        fetchCategories();
        fetchAuditLogs();
        setCategoryFormData({ name: '', description: '', subcategories: [] });
        setShowCategoryForm(false);
        alert('Category added successfully');
      }
    } catch (error) {
      alert('Failed to add category');
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!confirm('Delete this category?')) return;

    try {
      const response = await fetch(`${API_URL}/categories/${categoryId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: adminData.token })
      });

      if (response.ok) {
        fetchCategories();
        fetchAuditLogs();
        alert('Category deleted successfully');
      }
    } catch (error) {
      alert('Failed to delete category');
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleProductSelection = (productId) => {
    setSelectedProducts(prev =>
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  const selectAllProducts = () => {
    if (selectedProducts.length === filteredProducts.length && filteredProducts.length > 0) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map(p => p.id));
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="admin-overlay" onClick={onClose}>
        <div className="admin-content" onClick={e => e.stopPropagation()}>
          <button className="close-btn" onClick={onClose}>✕</button>
          <h2>Admin Dashboard</h2>
          <div className="login-form">
            <div className="login-group">
              <label>Username</label>
              <input
                type="text"
                value={credentials.username}
                onChange={e => setCredentials({ ...credentials, username: e.target.value })}
                placeholder="admin"
                onKeyPress={e => e.key === 'Enter' && handleLogin()}
              />
            </div>
            <div className="login-group">
              <label>Password</label>
              <input
                type="password"
                value={credentials.password}
                onChange={e => setCredentials({ ...credentials, password: e.target.value })}
                placeholder="admin123"
                onKeyPress={e => e.key === 'Enter' && handleLogin()}
              />
            </div>
            <button onClick={handleLogin} disabled={loading} className="btn-login">
              {loading ? 'Logging in...' : 'Login'}
            </button>
            <small className="hint">Admin: admin / admin123<br/>Manager: manager / manager123</small>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-overlay" onClick={onClose}>
      <div className="admin-content admin-content-large" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>✕</button>
        
        <div className="admin-header">
          <div>
            <h2>Admin Dashboard</h2>
            <p className="admin-user">Logged in as: <strong>{adminData?.admin?.username}</strong> ({adminData?.admin?.role})</p>
          </div>
          {inventoryAlerts.total > 0 && (
            <div className="alert-badge">
              <span className="badge-icon">⚠️</span>
              <span className="badge-text">{inventoryAlerts.total} Inventory Alerts</span>
            </div>
          )}
        </div>

        <div className="admin-tabs">
          <button className={activeTab === 'products' ? 'tab-active' : ''} onClick={() => setActiveTab('products')}>
            Products ({products.length})
          </button>
          <button className={activeTab === 'orders' ? 'tab-active' : ''} onClick={() => setActiveTab('orders')}>
            Orders ({orders.length})
          </button>
          <button className={activeTab === 'categories' ? 'tab-active' : ''} onClick={() => setActiveTab('categories')}>
            Categories
          </button>
          <button className={activeTab === 'inventory' ? 'tab-active' : ''} onClick={() => setActiveTab('inventory')}>
            Inventory Alerts
          </button>
          <button className={activeTab === 'audit' ? 'tab-active' : ''} onClick={() => setActiveTab('audit')}>
            Audit Log
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'products' && (
            <div className="products-tab">
              <div className="products-toolbar">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="search-input"
                />
                <button className="btn-add-product" onClick={() => { resetForm(); setShowForm(true); }}>
                  + Add Product
                </button>
              </div>

              {selectedProducts.length > 0 && (
                <div className="bulk-actions">
                  <span>{selectedProducts.length} selected</span>
                  <button className="btn-bulk-delete" onClick={handleBulkDelete}>Delete Selected</button>
                </div>
              )}

              {showForm && (
                <div className="product-form">
                  <h3>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
                  
                  <div className="form-section">
                    <label>Product Name *</label>
                    <input
                      type="text"
                      placeholder="Product Name"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-section">
                      <label>Category *</label>
                      <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.name}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-section">
                      <label>Base Price *</label>
                      <input
                        type="number"
                        placeholder="Price"
                        value={formData.price}
                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                        step="0.01"
                      />
                    </div>
                  </div>

                  <div className="form-section">
                    <label>Description</label>
                    <textarea
                      placeholder="Product description"
                      value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>

                  <div className="form-section">
                    <label>Product Images</label>
                    {formData.images.map((image) => (
                      <div key={image.id} className="image-row">
                        <input
                          type="text"
                          placeholder="Image URL"
                          value={image.url}
                          onChange={e => handleImageChange(image.id, 'url', e.target.value)}
                        />
                        <select value={image.variant} onChange={e => handleImageChange(image.id, 'variant', e.target.value)}>
                          <option value="front">Front View</option>
                          <option value="back">Back View</option>
                          <option value="side">Side View</option>
                          <option value="lifestyle">Lifestyle</option>
                          <option value="product">Product</option>
                        </select>
                        <button type="button" className="btn-icon" onClick={() => handleRemoveImage(image.id)}>🗑️</button>
                      </div>
                    ))}
                    <button type="button" className="btn-secondary" onClick={handleAddImage}>+ Add Image</button>
                  </div>

                  <div className="form-section">
                    <label>Available Colors</label>
                    <div className="color-picker-grid">
                      {PRESET_COLORS.map(color => (
                        <div
                          key={color.name}
                          className={`color-option ${formData.colors.includes(color.name) ? 'selected' : ''}`}
                          onClick={() => handleColorToggle(color.name)}
                        >
                          <div className="color-swatch" style={{ backgroundColor: color.hex }}></div>
                          <span>{color.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="form-section">
                    <label>Available Sizes</label>
                    <div className="size-picker-grid">
                      {PRESET_SIZES.map(size => (
                        <button
                          key={size}
                          type="button"
                          className={`size-option ${formData.sizes.includes(size) ? 'selected' : ''}`}
                          onClick={() => handleSizeToggle(size)}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="form-section">
                    <label>Product Variants</label>
                    <button type="button" className="btn-secondary" onClick={handleAddVariant}>+ Add Variant</button>
                    {formData.variants.map(variant => (
                      <div key={variant.id} className="variant-row">
                        <select value={variant.color} onChange={e => handleVariantChange(variant.id, 'color', e.target.value)}>
                          {formData.colors.map(color => (
                            <option key={color} value={color}>{color}</option>
                          ))}
                        </select>
                        <select value={variant.size} onChange={e => handleVariantChange(variant.id, 'size', e.target.value)}>
                          {formData.sizes.map(size => (
                            <option key={size} value={size}>{size}</option>
                          ))}
                        </select>
                        <input
                          type="text"
                          placeholder="SKU"
                          value={variant.sku}
                          onChange={e => handleVariantChange(variant.id, 'sku', e.target.value)}
                        />
                        <input
                          type="number"
                          placeholder="Stock"
                          value={variant.stock}
                          onChange={e => handleVariantChange(variant.id, 'stock', parseInt(e.target.value))}
                        />
                        <input
                          type="number"
                          placeholder="Price"
                          value={variant.price}
                          onChange={e => handleVariantChange(variant.id, 'price', parseFloat(e.target.value))}
                          step="0.01"
                        />
                        <button type="button" className="btn-icon" onClick={() => handleRemoveVariant(variant.id)}>🗑️</button>
                      </div>
                    ))}
                  </div>

                  <div className="form-section">
                    <label>Total Inventory</label>
                    <input
                      type="number"
                      placeholder="Total Inventory"
                      value={formData.inventory}
                      onChange={e => setFormData({ ...formData, inventory: e.target.value })}
                    />
                  </div>

                  <div className="form-actions">
                    <button className="btn-save" onClick={handleAddProduct}>
                      {editingProduct ? 'Update Product' : 'Save Product'}
                    </button>
                    <button className="btn-cancel" onClick={resetForm}>Cancel</button>
                  </div>
                </div>
              )}

              <div className="products-list">
                <div className="list-header">
                  <input
                    type="checkbox"
                    checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                    onChange={selectAllProducts}
                  />
                  <span>Select All</span>
                </div>
                {filteredProducts.map(product => (
                  <div key={product.id} className="product-item">
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product.id)}
                      onChange={() => toggleProductSelection(product.id)}
                    />
                    <div className="product-info">
                      <h4>{product.name}</h4>
                      <p>
                        {product.category} | ${product.price.toFixed(2)} | Stock: {product.inventory}
                        {product.inventory < 15 && <span className="low-stock-badge">⚠️ Low</span>}
                      </p>
                    </div>
                    <div className="product-actions">
                      <button className="btn-edit" onClick={() => handleEditProduct(product)}>Edit</button>
                      <button className="btn-delete" onClick={() => {
                        if (confirm(`Delete "${product.name}"?`)) {
                          onDeleteProduct(product.id);
                          fetchAuditLogs();
                          fetchInventoryAlerts();
                        }
                      }}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="orders-tab">
              <h3>Customer Orders</h3>
              {orders.length === 0 ? (
                <p className="empty-message">No orders yet</p>
              ) : (
                <div className="orders-list">
                  {orders.map(order => (
                    <div key={order.id} className="order-card">
                      <div className="order-header">
                        <div>
                          <h4>Order {order.id}</h4>
                          <p className="order-date">
                            {new Date(order.date).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <div className={`order-status status-${order.status.toLowerCase()}`}>
                          {order.status}
                        </div>
                      </div>

                      <div className="order-customer">
                        <div className="customer-info">
                          <p><strong>Customer:</strong> {order.shippingInfo.fullName}</p>
                          <p><strong>Email:</strong> {order.shippingInfo.email}</p>
                          <p><strong>Phone:</strong> {order.shippingInfo.phone}</p>
                        </div>
                        <div className="shipping-info">
                          <p><strong>Shipping Address:</strong></p>
                          <p>{order.shippingInfo.streetAddress}</p>
                          <p>{order.shippingInfo.city}, {order.shippingInfo.state} {order.shippingInfo.postalCode}</p>
                          <p>{order.shippingInfo.country}</p>
                        </div>
                      </div>

                      <div className="order-items-summary">
                        <p><strong>Items ({order.items.length}):</strong></p>
                        {order.items.map((item, idx) => (
                          <div key={idx} className="order-item-row">
                            <span>{item.name} x{item.quantity}</span>
                            <span>${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="order-total">
                        <strong>Total:</strong>
                        <strong>${order.total.toFixed(2)}</strong>
                      </div>

                      <div className="order-actions">
                        <select 
                          value={order.status} 
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          className="status-select"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                        <button 
                          className="btn-download-invoice" 
                          onClick={() => generateAdminInvoice(order)}
                        >
                          📄 Download Invoice
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="categories-tab">
              <button className="btn-add-product" onClick={() => setShowCategoryForm(!showCategoryForm)}>
                {showCategoryForm ? '✕ Cancel' : '+ Add Category'}
              </button>

              {showCategoryForm && (
                <div className="category-form">
                  <h3>Add New Category</h3>
                  <input
                    type="text"
                    placeholder="Category Name"
                    value={categoryFormData.name}
                    onChange={e => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                  />
                  <textarea
                    placeholder="Description"
                    value={categoryFormData.description}
                    onChange={e => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                  />
                  <button className="btn-save" onClick={handleAddCategory}>Save Category</button>
                </div>
              )}

              <div className="categories-list">
                {categories.map(category => (
                  <div key={category.id} className="category-item">
                    <div>
                      <h4>{category.name}</h4>
                      <p>{category.description}</p>
                      {category.subcategories && category.subcategories.length > 0 && (
                        <small>Subcategories: {category.subcategories.join(', ')}</small>
                      )}
                    </div>
                    <button className="btn-delete" onClick={() => handleDeleteCategory(category.id)}>Delete</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'inventory' && (
            <div className="inventory-tab">
              <div className="inventory-section">
                <h3>Low Stock Products (≤15 units)</h3>
                {inventoryAlerts.lowStock.length === 0 ? (
                  <p className="empty-message">No low stock alerts</p>
                ) : (
                  inventoryAlerts.lowStock.map(product => (
                    <div key={product.id} className="alert-item low-stock">
                      <div>
                        <h4>{product.name}</h4>
                        <p>Current Stock: {product.inventory} units</p>
                      </div>
                      <button className="btn-edit" onClick={() => { handleEditProduct(product); setActiveTab('products'); }}>
                        Update Stock
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="inventory-section">
                <h3>Out of Stock Products</h3>
                {inventoryAlerts.outOfStock.length === 0 ? (
                  <p className="empty-message">No out of stock items</p>
                ) : (
                  inventoryAlerts.outOfStock.map(product => (
                    <div key={product.id} className="alert-item out-of-stock">
                      <div>
                        <h4>{product.name}</h4>
                        <p>Status: Out of Stock</p>
                      </div>
                      <button className="btn-edit" onClick={() => { handleEditProduct(product); setActiveTab('products'); }}>
                        Restock
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="audit-tab">
              <h3>Recent Activity</h3>
              <div className="audit-list">
                {auditLogs.length === 0 ? (
                  <p className="empty-message">No activity logged yet</p>
                ) : (
                  auditLogs.map(log => (
                    <div key={log.id} className="audit-item">
                      <div className="audit-info">
                        <strong>{log.action.replace(/_/g, ' ')}</strong>
                        <p>{JSON.stringify(log.details)}</p>
                      </div>
                      <small>{new Date(log.timestamp).toLocaleString()}</small>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
