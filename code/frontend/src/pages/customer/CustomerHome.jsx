import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaGift, FaHeart, FaTruck, FaStar, FaArrowRight, 
  FaQuoteLeft, FaSearch, FaFilter, FaTimes 
} from 'react-icons/fa';

import Header from '../../components/customer/Header';
import Footer from '../../components/landingpage/Footer';
import { useCart } from '../../context/CartContext';
import './CustomerHome.css';

// ─── Config ───────────────────────────────────────────
const CAT_ICONS    = { All:'🛍️', Wine:'🍷', Watches:'⌚', Perfume:'🌸', 'Teddy Bears':'🧸', Bangles:'💍', Chocolates:'🍫', Other:'🎁' };
const SORT_OPTIONS = [
  { value:'default',    label:'Featured' },
  { value:'price-asc',  label:'Price: Low → High' },
  { value:'price-desc', label:'Price: High → Low' },
];

// Scroll reveal hook for animations
function useReveal(threshold = 0.1) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold });
    obs.observe(el); return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

const CustomerHome = () => {
  const navigate = useNavigate();
  const { addToCart, addedId } = useCart();
  const [ref, heroVisible] = useReveal(0.05);

  // ─── States ─────────────────────────────────────────────────────────────
  const [allProducts, setAllProducts] = useState([]);
  const [dbCategories, setDbCategories] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy]           = useState('default');
  const [quickView, setQuickView]     = useState(null);

  // Fetch Products and Categories
  useEffect(() => {
    Promise.all([
      fetch(`${process.env.REACT_APP_API_URL}/api/products`).then(res => res.ok ? res.json() : []),
      fetch(`${process.env.REACT_APP_API_URL}/api/categories`).then(res => res.ok ? res.json() : [])
    ])
      .then(([productsData, categoriesData]) => {
        setAllProducts(productsData);
        setDbCategories(categoriesData);
        setLoading(false);
      })
      .catch(err => { 
        setError(err.message); 
        setLoading(false); 
      });
  }, []);

  const getCategoryName = (id) => {
    const cat = dbCategories.find(c => c.id === id);
    return cat ? cat.name : 'Other';
  };

  // ─── Logic (Filtering & Sorting) ────────────────────────────────────────
  const categories = useMemo(() => {
    const names = allProducts.map(p => getCategoryName(p.categoryId));
    return ['All', ...new Set(names)];
  }, [allProducts, dbCategories]);

  const displayProducts = useMemo(() => {
    let f = [...allProducts];
    if (activeCategory !== 'All') f = f.filter(p => getCategoryName(p.categoryId) === activeCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      f = f.filter(p => p.name.toLowerCase().includes(q) || getCategoryName(p.categoryId).toLowerCase().includes(q));
    }
    switch (sortBy) {
      case 'price-asc':  f.sort((a,b) => a.price - b.price); break;
      case 'price-desc': f.sort((a,b) => b.price - a.price); break;
      default: break;
    }
    return f;
  }, [allProducts, activeCategory, searchQuery, sortBy]);

  return (
    <div className="customer-home">
      <Header />

      {/* ── SECTION 1: HERO ── */}
      <section className="hero-section" ref={ref}>
        <div className="hero-glow"></div>
        <div className={`hero-content ${heroVisible ? 'hero--visible' : ''}`}>
          <div className="hero-badge"><span className="badge-dot"></span>Curated with Love</div>
          <h1 className="hero-title">Gift Experiences,<br /><span className="title-accent">Not Just Boxes</span></h1>
          <p className="hero-subtitle">Handcrafted gift collections from Sri Lanka's finest artisans.</p>
          <div className="hero-cta">
            <button className="btn-primary" onClick={() => document.getElementById('marketplace').scrollIntoView({behavior:'smooth'})}>
              Shop Now <FaArrowRight className="btn-icon" />
            </button>
            <button className="btn-secondary" onClick={() => navigate('/build-box')}>Custom Gift Box</button>
          </div>
        </div>
      </section>

      {/* ── SECTION 2: MARKETPLACE (All Features) ── */}
      <section className="featured-section" id="marketplace">
        <div className="section-header">
          <h2 className="section-title">Explore Our Marketplace</h2>
          <p className="section-subtitle">Search, filter, and find the perfect gift</p>
        </div>

        {/* Toolbar: Search + Filter + Sort */}
        <div className="home-toolbar">
          <div className="home-search-bar">
            <FaSearch className="search-icon" />
            <input 
              type="text" 
              placeholder="Search for chocolates, watches, perfumes..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && <FaTimes className="clear-search" onClick={() => setSearchQuery('')} />}
          </div>

          <div className="home-filters">
            <select value={activeCategory} onChange={(e) => setActiveCategory(e.target.value)}>
              {categories.map(cat => <option key={cat} value={cat}>{CAT_ICONS[cat] ? `${CAT_ICONS[cat]} ` : ''}{cat}</option>)}
            </select>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              {SORT_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
        </div>

        {/* Products Grid */}
        <div className="pp-grid" style={{ maxWidth: '1400px', margin: '0 auto' }}>
          {loading && <div className="home-state">Loading your collections...</div>}
          {error && <div className="home-state error">⚠️ {error}</div>}
          
          {!loading && !error && displayProducts.map((p, i) => {
            const catName  = getCategoryName(p.categoryId);
            const justAdded = addedId === p.id;
            
            return (
              <div key={p.id} className="ppc" style={{ animationDelay:`${Math.min(i,8)*0.05}s` }}>
                {/* Image */}
                <div className="ppc-img">
                  <img src={p.imageUrl} alt={p.name} loading="lazy" />
                  <div className="ppc-overlay">
                    <button
                      className="ppc-action ppc-action--primary"
                      onClick={() => addToCart(p)}
                    >
                      {justAdded ? '✓ Added!' : '🛒 Add to Cart'}
                    </button>
                    <button className="ppc-action ppc-action--ghost" onClick={() => setQuickView(p)}>Quick View</button>
                  </div>
                </div>

                {/* Body */}
                <div className="ppc-body">
                  <div className="ppc-name">{p.name}</div>
                  <div className="ppc-vendor">by Giftora Exclusive</div>
                  <div className="ppc-stars-row">
                    <span className="ppc-stars">★★★★★</span>
                    <span className="ppc-rating">5.0</span>
                  </div>
                  <div className="ppc-footer">
                    <span className="ppc-price">LKR {Number(p.price).toLocaleString()}</span>
                    <button
                      className={`ppc-add ${justAdded ? 'ppc-add--added' : ''}`}
                      onClick={() => addToCart(p)}
                      title="Add to cart"
                    >
                      {justAdded
                        ? <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="white" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                        : <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="white" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
                      }
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── SECTION 3: HOW IT WORKS ── */}
      <section className="how-it-works">
        <div className="section-header">
          <h2 className="section-title">Creating Magic is Simple</h2>
        </div>
        <div className="steps-container">
          <div className="step-card">
            <div className="step-number">01</div>
            <div className="step-icon"><FaGift /></div>
            <h3 className="step-title">Choose Your Style</h3>
            <p>Browse curated collections or build your own custom gift box.</p>
          </div>
          <div className="step-card">
            <div className="step-number">02</div>
            <div className="step-icon"><FaHeart /></div>
            <h3 className="step-title">Personalize It</h3>
            <p>Add custom messages and premium wrapping styles.</p>
          </div>
          <div className="step-card">
            <div className="step-number">03</div>
            <div className="step-icon"><FaTruck /></div>
            <h3 className="step-title">We Deliver Joy</h3>
            <p>Receive your beautifully packaged gift, delivered with care.</p>
          </div>
        </div>
      </section>

      {/* ── QUICK VIEW MODAL ── */}
      {quickView && (
        <div className="qv-backdrop" onClick={() => setQuickView(null)}>
          <div className="qv-modal" onClick={e => e.stopPropagation()}>
            <button className="qv-close" onClick={() => setQuickView(null)}><FaTimes /></button>
            <div className="qv-img-side">
              <img src={quickView.imageUrl} alt={quickView.name} />
              <div className="qv-img-grad" />
            </div>
            <div className="qv-info-side">
              <div className="qv-cat-tag">
                {CAT_ICONS[getCategoryName(quickView.categoryId)] ? `${CAT_ICONS[getCategoryName(quickView.categoryId)]} ` : ''}{getCategoryName(quickView.categoryId)}
              </div>
              <h3 className="qv-name">{quickView.name}</h3>
              <div className="qv-stars-row">★★★★★ <span>5.0 · Premium Quality</span></div>
              <div className="qv-price">LKR {Number(quickView.price).toLocaleString()}</div>
              <div className="qv-sep" />
              <p className="qv-desc">A premium curated gift from Giftora's exclusive collection. Hand-packed with love, beautifully presented, and ready to create a lasting memory.</p>
              <div className="qv-features">
                {['🎀 Gift Wrapped','✍️ Personal Note','🚚 Island-wide Delivery'].map((f,i) => <span key={i} className="qv-feat">{f}</span>)}
              </div>
              <div className="qv-actions">
                <button
                  className="qv-cta qv-cta--primary"
                  onClick={() => { addToCart(quickView); setQuickView(null); }}
                >
                  🛒 Add to Cart
                </button>
                <button className="qv-cta qv-cta--outline" onClick={() => { setQuickView(null); document.getElementById('marketplace').scrollIntoView({behavior:'smooth'}); }}>View All →</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Testimonials & CTA remain as they are... */}
    </div>
  );
};

export default CustomerHome;