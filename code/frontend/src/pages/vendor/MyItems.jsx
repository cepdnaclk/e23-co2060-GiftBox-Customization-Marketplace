import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaThLarge, FaList, FaSearch, FaEdit, FaTrash, FaPlus, FaSave, FaTimes } from 'react-icons/fa';
import './MyItems.css'; // Uses the existing MyItems CSS file

const getBadgeClass = (status) => ({
  'Active':        'badge-active',
  'Low Stock':     'badge-low-stock',
  'Out of Stock':  'badge-out-of-stock',
}[status] || '');

const stockColor = (stock) => {
  if (stock === 0)   return '#A32D2D';
  if (stock <= 10)   return '#854F0B';
  return '#1A2340';
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ProductCard — Grid view
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const ProductCard = ({ product, isEditing, editForm, onEditChange, onStartEdit, onSaveEdit, onCancelEdit, onDelete }) => {
  
  // Inline edit form view — rendered when editing mode is active (uses inline styles to preserve original CSS)
  if (isEditing) {
    return (
      <div className="product-card" style={{ padding: '15px', background: '#FDFBF7', border: '1px solid #E0D8C8', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <h4 style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#1A2340' }}>Edit Item</h4>
        
        <input name="name" value={editForm.name} onChange={onEditChange} placeholder="Product Name" style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '13px' }} />
        <input name="price" type="number" value={editForm.price} onChange={onEditChange} placeholder="Price" style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '13px' }} />
        <input name="stock" type="number" value={editForm.stock} onChange={onEditChange} placeholder="Stock" style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '13px' }} />
        
        <select name="status" value={editForm.status} onChange={onEditChange} style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '13px' }}>
          <option value="Active">Active</option>
          <option value="Out of Stock">Out of Stock</option>
        </select>

        <div style={{ display: 'flex', gap: '8px', marginTop: '5px' }}>
          <button onClick={() => onSaveEdit(product.id)} style={{ flex: 1, padding: '8px', background: '#1A2340', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
            <FaSave /> Save
          </button>
          <button onClick={onCancelEdit} style={{ flex: 1, padding: '8px', background: '#fff', color: '#1A2340', border: '1px solid #1A2340', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
            <FaTimes /> Cancel
          </button>
        </div>
      </div>
    );
  }

  // Normal view — displays the product card with its original design unchanged
  return (
    <div className="product-card">
      <div className="card-image-area">
        <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e)=>{e.target.src="https://via.placeholder.com/220x150?text=No+Image"}} />
        <span className={`card-status-badge ${getBadgeClass(product.status)}`}>{product.status}</span>
      </div>
      <div className="card-body">
        <span className="card-category">{product.category}</span>
        <p className="card-name">{product.name}</p>
        <div className="card-price-row">
          <span className="card-price">LKR {Number(product.price).toLocaleString()}</span>
          <span className="card-rating">⭐ {product.rating}</span>
        </div>
        <div className="card-meta">
          <span>Stock: <strong style={{ color: stockColor(product.stock) }}>{product.stock}</strong></span>
          <span>Sold: <strong style={{ color: '#1A2340' }}>{product.sold}</strong></span>
        </div>
        <div className="card-actions">
          <button className="btn-edit" onClick={() => onStartEdit(product)}>
            <FaEdit size={11} /> Edit
          </button>
          <button className="btn-delete" onClick={() => onDelete(product.id)}>
            <FaTrash size={11} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TableRow — List view
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const TableRow = ({ product, index, isEditing, editForm, onEditChange, onStartEdit, onSaveEdit, onCancelEdit, onDelete }) => {
  
  if (isEditing) {
    return (
      <tr style={{ background: '#FDFBF7' }}>
        <td colSpan="8" style={{ padding: '15px' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input name="name" value={editForm.name} onChange={onEditChange} placeholder="Name" style={{ flex: 2, padding: '6px', border: '1px solid #ccc', borderRadius: '4px' }} />
            <input name="price" type="number" value={editForm.price} onChange={onEditChange} placeholder="Price" style={{ flex: 1, padding: '6px', border: '1px solid #ccc', borderRadius: '4px' }} />
            <input name="stock" type="number" value={editForm.stock} onChange={onEditChange} placeholder="Stock" style={{ flex: 1, padding: '6px', border: '1px solid #ccc', borderRadius: '4px' }} />
            <select name="status" value={editForm.status} onChange={onEditChange} style={{ flex: 1, padding: '6px', border: '1px solid #ccc', borderRadius: '4px' }}>
              <option value="Active">Active</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
            <button onClick={() => onSaveEdit(product.id)} style={{ padding: '6px 12px', background: '#1A2340', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}><FaSave /></button>
            <button onClick={onCancelEdit} style={{ padding: '6px 12px', background: '#fff', color: '#1A2340', border: '1px solid #1A2340', borderRadius: '4px', cursor: 'pointer' }}><FaTimes /></button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr style={{ background: index % 2 === 0 ? '#FFFFFF' : '#FDFAF5' }}>
      <td>
        <div className="table-product-cell">
          <img src={product.image} alt={product.name} className="table-product-img" onError={(e)=>{e.target.src="https://via.placeholder.com/50?text=No+Image"}} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover', marginRight: '10px' }} />
          <span className="table-product-name">{product.name}</span>
        </div>
      </td>
      <td className="table-category">{product.category}</td>
      <td className="table-price">{Number(product.price).toLocaleString()}</td>
      <td style={{ fontWeight: 600, color: stockColor(product.stock) }}>{product.stock}</td>
      <td style={{ color: '#5A6478' }}>{product.sold}</td>
      <td><span className="table-rating">⭐ {product.rating}</span></td>
      <td>
        <span className={`card-status-badge ${getBadgeClass(product.status)}`} style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
          {product.status}
        </span>
      </td>
      <td>
        <div className="table-actions">
          <button className="btn-table-edit" onClick={() => onStartEdit(product)}><FaEdit size={10} /> Edit</button>
          <button className="btn-table-delete" onClick={() => onDelete(product.id)}><FaTrash size={10} /> Delete</button>
        </div>
      </td>
    </tr>
  );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EmptyState
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const EmptyState = () => (
  <div className="state-box">
    <div className="state-icon">📦</div>
    <h3 className="state-title">No products found</h3>
    <p className="state-desc">Try adjusting your search or filter</p>
  </div>
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MyItems — Main Component
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const MyItems = () => {
  const navigate = useNavigate();

  const [products, setProducts]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [view, setView]           = useState('grid');
  const [search, setSearch]       = useState('');
  const [category, setCategory]   = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // ── Inline Edit State ──
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', price: '', stock: '', status: '' });

  // Get seller ID from session/context instead of hardcoding
  const SELLER_ID = localStorage.getItem('userId');
  const API_BASE  = `${process.env.REACT_APP_API_URL}/api`;

  const CATEGORIES = useMemo(() => {
    const names = products.map(p => p.category || 'Uncategorized');
    return ['All', ...new Set(names)];
  }, [products]);

  useEffect(() => {
    if (SELLER_ID) {
      fetchProducts();
    } else {
      setError('Seller ID not found');
      setLoading(false);
    }
  }, [SELLER_ID]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/vendors/${SELLER_ID}/products`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
      });
      if (!res.ok) throw new Error('Failed to load products');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Delete Handler ──
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      const res = await fetch(`${API_BASE}/products/${id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
      });
      if (!res.ok) throw new Error('Delete failed');
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      alert(`Error deleting product: ${err.message}`);
    }
  };

  // ── Inline Edit Handlers ──
  const handleStartEdit = (product) => {
    setEditingId(product.id);
    setEditForm({ name: product.name, price: product.price, stock: product.stock, status: product.status });
  };

  const handleEditChange = (e) => {
    setEditForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

// ── Save Edit to Backend ──
  const handleSaveEdit = async (id) => {
    try {
      // Step 1: Parse the new stock value as an integer
      const newStock = parseInt(editForm.stock, 10);
      const isActiveSelected = editForm.status === 'Active';

      // Step 2: Automatically determine the correct status based on stock quantity (mirrors backend logic)
      let newCalculatedStatus = 'Active';
      
      if (!isActiveSelected || newStock <= 0) {
        newCalculatedStatus = 'Out of Stock'; // Mark as Out of Stock if inactive or stock is 0
      } else if (newStock <= 10) {
        newCalculatedStatus = 'Low Stock';    // Mark as Low Stock if stock is 10 or fewer
      }

      // Backend payload
      const payload = {
        name: editForm.name,
        price: parseFloat(editForm.price),
        stockQuantity: newStock,
        isActive: isActiveSelected ? 1 : 0
      };

      const res = await fetch(`${API_BASE}/products/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Update failed');
      
      // Step 3: Immediately update local React state with the new status (optimistic UI update)
      setProducts(prev => prev.map(p => 
        p.id === id ? { 
          ...p, 
          name: editForm.name, 
          price: editForm.price, 
          stock: newStock, 
          status: newCalculatedStatus // Updated status: Active / Low Stock / Out of Stock
        } : p
      ));
      
      setEditingId(null); // Exit edit mode after saving
    } catch (err) {
      alert(`Error saving: ${err.message}`);
    }
  };

  const stats = useMemo(() => [
    { key: 'All',           label: 'Total Products', icon: '📦', value: products.length },
    { key: 'Active',        label: 'Active',         icon: '✅', value: products.filter(p => p.status === 'Active').length },
    { key: 'Low Stock',     label: 'Low Stock',      icon: '⚠️', value: products.filter(p => p.status === 'Low Stock').length },
    { key: 'Out of Stock',  label: 'Out of Stock',   icon: '❌', value: products.filter(p => p.status === 'Out of Stock').length },
  ], [products]);

  const filtered = useMemo(() => products.filter(p => {
    const matchCategory = category === 'All' || p.category === category;
    const matchStatus   = statusFilter === 'All' || p.status === statusFilter;
    const matchSearch   = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchStatus && matchSearch;
  }), [products, search, category, statusFilter]);

  return (
    <div className="my-items-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Items</h1>
          <p className="page-subtitle">Manage your product listings</p>
        </div>
        <button className="btn-add" onClick={() => navigate('/vendor/add-items')}>
          <FaPlus size={12} /> Add New Item
        </button>
      </div>

      <div className="stats-grid">
        {stats.map(s => (
          <button key={s.key} className={`stat-card${statusFilter === s.key ? ' active-filter' : ''}`} onClick={() => setStatusFilter(s.key)}>
            <span className="stat-icon">{s.icon}</span>
            <div><p className="stat-value">{loading ? '—' : s.value}</p><p className="stat-label">{s.label}</p></div>
          </button>
        ))}
      </div>

      <div className="toolbar">
        <div className="search-wrapper">
          <FaSearch className="search-icon" />
          <input className="search-input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." />
        </div>
        <div className="category-filters">
          {CATEGORIES.map(c => <button key={c} className={`btn-category${category === c ? ' selected' : ''}`} onClick={() => setCategory(c)}>{c}</button>)}
        </div>
        <div className="view-toggle">
          {[['grid', <FaThLarge size={13} />, 'Grid'], ['list', <FaList size={13} />, 'List']].map(([v, icon, label]) => (
            <button key={v} className={`btn-view${view === v ? ' active' : ''}`} onClick={() => setView(v)}>{icon} {label}</button>
          ))}
        </div>
      </div>

      {!loading && !error && (
        <p className="results-count">
          Showing <strong>{filtered.length}</strong> of <strong>{products.length}</strong> products
        </p>
      )}

      {loading && <div className="state-box"><div className="spinner" /><p className="state-desc">Loading your products…</p></div>}
      {!loading && error && <div className="state-box"><div className="state-icon">⚠️</div><h3 className="state-title">Failed to load products</h3><p className="state-desc">{error}</p></div>}

      {!loading && !error && view === 'grid' && (
        filtered.length > 0 ? (
          <div className="products-grid">
            {filtered.map(p => (
              <ProductCard 
                key={p.id} product={p} 
                isEditing={editingId === p.id} editForm={editForm}
                onEditChange={handleEditChange} onStartEdit={handleStartEdit} onSaveEdit={handleSaveEdit} onCancelEdit={handleCancelEdit} onDelete={handleDelete} 
              />
            ))}
          </div>
        ) : <EmptyState />
      )}

      {!loading && !error && view === 'list' && (
        filtered.length > 0 ? (
          <div className="table-wrapper">
            <table className="products-table">
              <thead>
                <tr>
                  {['Product', 'Category', 'Price (LKR)', 'Stock', 'Sold', 'Rating', 'Status', 'Actions'].map(h => <th key={h}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => (
                  <TableRow 
                    key={p.id} product={p} index={i}
                    isEditing={editingId === p.id} editForm={editForm}
                    onEditChange={handleEditChange} onStartEdit={handleStartEdit} onSaveEdit={handleSaveEdit} onCancelEdit={handleCancelEdit} onDelete={handleDelete} 
                  />
                ))}
              </tbody>
            </table>
          </div>
        ) : <EmptyState />
      )}
    </div>
  );
};

export default MyItems;