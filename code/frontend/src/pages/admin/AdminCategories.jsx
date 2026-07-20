import React, { useState, useEffect } from 'react';
import { FaPlus, FaFolder } from 'react-icons/fa';
import './AdminCategories.css';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = () => {
    fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/api/categories`)
      .then(res => res.json())
      .then(data => {
        setCategories(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching categories:", err);
        setLoading(false);
      });
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    setAdding(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/api/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ name: newCategoryName.trim() })
      });

      if (res.ok) {
        setNewCategoryName('');
        fetchCategories(); // Refresh list
      } else {
        const errData = await res.json();
        alert(`Failed to create category: ${errData.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error("Error adding category:", err);
      alert('Network error while adding category.');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="categories-container">
      <div className="categories-header">
        <div>
          <h1 className="categories-title">Categories</h1>
          <p className="categories-subtitle">Manage product categories</p>
        </div>
      </div>

      <form className="add-category-form" onSubmit={handleAddCategory}>
        <input 
          type="text" 
          className="add-category-input"
          placeholder="New category name (e.g., Watches)" 
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          disabled={adding}
        />
        <button type="submit" className="add-category-btn" disabled={adding || !newCategoryName.trim()}>
          <FaPlus size={14} /> {adding ? 'Adding...' : 'Add Category'}
        </button>
      </form>

      {loading ? (
        <p>Loading categories...</p>
      ) : (
        <div className="categories-grid">
          {categories.map(cat => (
            <div key={cat.id} className="category-card">
              <FaFolder size={20} style={{ color: '#c9a961', marginBottom: '10px' }} />
              <div>{cat.name}</div>
            </div>
          ))}
          {categories.length === 0 && <p>No categories found.</p>}
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
