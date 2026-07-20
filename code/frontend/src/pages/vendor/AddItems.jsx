import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaArrowLeft, FaPlus, FaUpload, FaBoxOpen, FaDollarSign, FaImage, FaCheck } from 'react-icons/fa';
import './AddItems.css';

// Category icons mapping removed as requested

// ── Reusable field components ──────────────────────────────────
const Label = ({ children, required }) => (
  <label className="ai-label">
    {children} {required && <span className="required">*</span>}
  </label>
);

const Input = ({ className = '', ...props }) => (
  <input className={`ai-input ${className}`} {...props} />
);

const Textarea = ({ className = '', ...props }) => (
  <textarea className={`ai-textarea ${className}`} {...props} />
);

// ── Section Card ───────────────────────────────────────────────
const SectionCard = ({ icon, title, children }) => (
  <div className="ai-card">
    <div className="ai-card-header">
      <span className="icon">{icon}</span>
      <h3>{title}</h3>
    </div>
    <div className="ai-card-body">{children}</div>
  </div>
);

// ── Custom Dropdown Component ─────────────────────────────────
const CustomSelect = ({ options, value, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(o => String(o.id) === String(value));

  return (
    <div className="custom-select-container">
      <div 
        className={`ai-input custom-select-header ${isOpen ? 'open' : ''}`} 
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedOption ? selectedOption.name : placeholder}
        <span className="dropdown-arrow">▼</span>
      </div>
      {isOpen && (
        <div className="custom-select-list">
          {options.map(opt => (
            <div 
              key={opt.id} 
              className={`custom-select-item ${String(value) === String(opt.id) ? 'selected' : ''}`}
              onClick={() => {
                onChange(opt.id);
                setIsOpen(false);
              }}
            >
              {opt.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── 2-Step Category Picker Removed in favor of simple select ──
// ── Main Component ─────────────────────────────────────────────
const AddItems = () => {
  const navigate = useNavigate();
  const [dragOver, setDragOver]   = useState(false);
  const [images, setImages]       = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [categoriesTree, setCategoriesTree] = useState([]);

  useEffect(() => {
    const apiBase = process.env.REACT_APP_API_URL || 'https://nexus-backend-axbdfzd2g4c0fwbf.austriaeast-01.azurewebsites.net';
    axios.get(`${apiBase}/api/categories`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
    })
      .then(res => setCategoriesTree(res.data))
      .catch(err => console.error("Error fetching categories:", err));
  }, []);

  const [form, setForm] = useState({
    name: '', category: '', subCategory: '', price: '', discountPrice: '',
    stock: '', sku: '', description: '',
    is_active: true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  // ── Image handling ──
  const handleImageDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer?.files || e.target.files || []);
    const newImgs = files.slice(0, 5 - images.length).map(f => ({
      id: Date.now() + Math.random(),
      name: f.name,
      url: URL.createObjectURL(f),
      file: f
    }));
    setImages(prev => [...prev, ...newImgs].slice(0, 5));
  };

  const removeImage = (id) => setImages(prev => prev.filter(i => i.id !== id));

  // ── Submit ──
  const handleSubmit = async () => {
    if (!form.name || !form.category || !form.price || !form.stock) {
      alert('Please fill in all required fields including sub-category.');
      return;
    }

    setSubmitted(true);

    try {
      let uploadedImageUrl = '';

      if (images.length > 0) {
        const formData = new FormData();
        formData.append('file', images[0].file);
        formData.append('upload_preset', 'giftora_items');
        formData.append('cloud_name', 'dju3eqysw');

        const cloudinaryRes = await axios.post(
          'https://api.cloudinary.com/v1_1/dju3eqysw/image/upload',
          formData
        );
        uploadedImageUrl = cloudinaryRes.data.secure_url;
      }

      const payload = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        discountPrice: form.discountPrice ? Number(form.discountPrice) : null,
        stockQuantity: parseInt(form.stock, 10),
        sku: form.sku ? form.sku : null,
        isActive: form.is_active ? 1 : 0,
        imageUrl: uploadedImageUrl || 'https://via.placeholder.com/220x150?text=No+Image',
        categoryId: Number(form.category),
        subCategory: form.subCategory
      };

      const SELLER_ID = localStorage.getItem('userId');
      await axios.post(`${process.env.REACT_APP_API_URL}/api/vendors/${SELLER_ID}/products`, payload, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
      });

      setTimeout(() => {
        setSubmitted(false);
        navigate('/vendor/my-items');
      }, 1000);

    } catch (error) {
      console.error('Error saving item:', error);
      alert('Failed to save the item. Please try again.');
      setSubmitted(false);
    }
  };

  return (
    <div className="ai-page">

      {/* ── Page Header ── */}
      <div className="ai-header">
        <div className="ai-header-left">
          <button className="ai-back-btn" onClick={() => navigate('/vendor/my-items')}>
            <FaArrowLeft />
          </button>
          <div>
            <h1>Add New Item</h1>
            <p>Fill in the details to list a new product</p>
          </div>
        </div>
        <div className="ai-header-actions">
          <button className="btn-cancel" onClick={() => navigate('/vendor/my-items')}>Cancel</button>
          <button className={`btn-save${submitted ? ' saved' : ''}`} onClick={handleSubmit}>
            <FaPlus size={12} /> {submitted ? 'Saving…' : 'Save Item'}
          </button>
        </div>
      </div>

      <div className="ai-grid">

        {/* ── Left Column ── */}
        <div>

          {/* Basic Info */}
          <SectionCard icon={<FaBoxOpen />} title="Basic Information">
            <div className="ai-field">
              <Label required>Product Name</Label>
              <Input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Ferrero Rocher 16-piece Box" />
            </div>
            <div className="ai-field">
              <Label required>Description</Label>
              <Textarea name="description" value={form.description} onChange={handleChange} placeholder="Describe your product — what's included, occasion, packaging…" />
            </div>

            {/* Category Dropdown */}
            <div className="ai-row ai-row-2">
              <div className="ai-field">
                <Label required>Main Category</Label>
                <CustomSelect
                  options={categoriesTree}
                  value={form.category}
                  onChange={(val) => setForm(f => ({ ...f, category: val }))}
                  placeholder="Select a category..."
                />
              </div>
              <div className="ai-field">
                <Label required>Product Type (Sub-category)</Label>
                <Input name="subCategory" value={form.subCategory} onChange={handleChange} placeholder="e.g. Watch, Chocolate, Teddy" />
              </div>
            </div>

            {/* Active Toggle */}
            <div className="ai-field">
              <Label>Visibility Status</Label>
              <div className="ai-toggle-row" style={{ marginTop: 0 }}>
                <div className="ai-toggle-label">
                  <p>{form.is_active ? 'Active' : 'Inactive'}</p>
                  <span>{form.is_active ? 'Visible to buyers' : 'Hidden from buyers'}</span>
                </div>
                <div
                  className="ai-toggle"
                  style={{ background: form.is_active ? 'var(--gold)' : '#D0C8B8' }}
                  onClick={() => setForm(f => ({ ...f, is_active: !f.is_active }))}
                >
                  <div className="ai-toggle-knob" style={{ left: form.is_active ? 23 : 3 }} />
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Pricing & Inventory */}
          <SectionCard icon={<FaDollarSign />} title="Pricing & Inventory">
            <div className="ai-row ai-row-2">
              <div>
                <Label required>Price (LKR)</Label>
                <Input name="price" type="number" value={form.price} onChange={handleChange} placeholder="0.00" />
              </div>
              <div>
                <Label>Discount Price (LKR)</Label>
                <Input name="discountPrice" type="number" value={form.discountPrice} onChange={handleChange} placeholder="0.00" />
              </div>
            </div>
            <div className="ai-row ai-row-2">
              <div>
                <Label required>Stock Quantity</Label>
                <Input name="stock" type="number" value={form.stock} onChange={handleChange} placeholder="0" />
              </div>
              <div>
                <Label>SKU <span style={{ fontSize: '11px', color: '#999', fontWeight: 400 }}>(optional)</span></Label>
                <Input name="sku" value={form.sku} onChange={handleChange} placeholder="e.g. CHOC-FERR-001" />
              </div>
            </div>

            {form.price && form.discountPrice && Number(form.discountPrice) < Number(form.price) && (
              <div className="ai-discount-badge">
                💰 Discount:{' '}
                <strong style={{ color: 'var(--green)' }}>
                  {Math.round((1 - form.discountPrice / form.price) * 100)}% off
                </strong>{' '}
                — customer saves{' '}
                <strong style={{ color: 'var(--green)' }}>
                  LKR {(form.price - form.discountPrice).toLocaleString()}
                </strong>
              </div>
            )}
          </SectionCard>

          {/* Image Upload */}
          <SectionCard icon={<FaImage />} title="Product Images">
            <div
              className={`ai-dropzone${dragOver ? ' drag-over' : ''}`}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleImageDrop}
              onClick={() => document.getElementById('imgInput').click()}
            >
              <div><FaUpload className="dz-icon" /></div>
              <p className="dz-title">Drop images here</p>
              <p className="dz-sub">or click to browse · max 5 images</p>
              <input
                id="imgInput"
                type="file"
                accept="image/*"
                multiple
                style={{ display: 'none' }}
                onChange={handleImageDrop}
              />
            </div>

            {images.length > 0 && (
              <div className="ai-img-grid">
                {images.map((img, i) => (
                  <div key={img.id} className={`ai-img-thumb${i === 0 ? ' main-img' : ''}`}>
                    <img src={img.url} alt={img.name} />
                    {i === 0 && <span className="main-badge">MAIN</span>}
                    <button className="remove-btn" onClick={() => removeImage(img.id)}>×</button>
                  </div>
                ))}
              </div>
            )}
            <p className="ai-img-hint">First image will be the main product photo</p>
          </SectionCard>

        </div>

      </div>
    </div>
  );
};

export default AddItems;