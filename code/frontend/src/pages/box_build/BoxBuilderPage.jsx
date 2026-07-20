import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/landingpage/Header';
import Footer from '../../components/landingpage/Footer';
import './BoxBuilderPage.css';

// Import CartContext to read cart items for the box builder
import { useCart } from '../../context/CartContext'; 

const OCCASIONS = [
  { id: 'Birthday', icon: '🎂', label: 'Birthday' },
  { id: 'Anniversary', icon: '💑', label: 'Anniversary' },
  { id: 'Wedding', icon: '💍', label: 'Wedding' },
  { id: 'Corporate', icon: '💼', label: 'Corporate' },
  { id: 'Just Because', icon: '🌸', label: 'Just Because' }
];

const BOX_SIZES = [
  { id: 'SMALL', title: 'Small Box', limit: 3, fee: 500, desc: 'Perfect for a few thoughtful items.' },
  { id: 'MEDIUM', title: 'Medium Box', limit: 5, fee: 800, desc: 'The most popular choice.' },
  { id: 'LARGE', title: 'Large Box', limit: 8, fee: 1200, desc: 'For making a grand impression.' }
];

const WRAPPING_STYLES = [
  { id: 'Classic Gold', color: '#C9A961' },
  { id: 'Rose Pink', color: '#E8A0BF' },
  { id: 'Midnight Blue', color: '#1A1A2E' }
];

const MAX_ITEMS_GLOBAL = 8; // Maximum item capacity (largest box size)

const BoxBuilderPage = () => {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  
  const { cartItems } = useCart(); 
  const availableItems = cartItems || [];

  // Form State
  const [occasion, setOccasion] = useState(null);
  const [selectedItems, setSelectedItems] = useState({}); // { productId: quantity }
  const [boxSize, setBoxSize] = useState(null);
  
  // Personalization State
  const [recipientName, setRecipientName] = useState('');
  const [giftMessage, setGiftMessage] = useState('');
  const [wrappingStyle, setWrappingStyle] = useState(null);
  const [deliveryAddress, setDeliveryAddress] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Hero Animation
  useEffect(() => {
    const t = setTimeout(() => {
      if (heroRef.current) heroRef.current.classList.add('bb-hero--visible');
    }, 80);
    return () => clearTimeout(t);
  }, []);

  // Calculations
  const totalItemsCount = Object.values(selectedItems).reduce((sum, q) => sum + q, 0);
  
  const subtotal = useMemo(() => {
    return Object.entries(selectedItems).reduce((sum, [id, qty]) => {
      const product = availableItems.find(p => p.productId === parseInt(id));
      return sum + (product ? product.price * qty : 0);
    }, 0);
  }, [selectedItems, availableItems]);

  const total = subtotal + (boxSize?.fee || 0);

  // Handlers
  const handleAddItem = (product) => {
    // Check against the selected box's item limit, or the global max if no box is selected yet
    const currentLimit = boxSize ? boxSize.limit : MAX_ITEMS_GLOBAL;
    
    if (totalItemsCount >= currentLimit) {
      if (boxSize) {
        alert(`Your ${boxSize.title} is full! Please upgrade to a larger box in Step 3 to add more items.`);
      } else {
        alert("You have reached the maximum capacity (8 items).");
      }
      return;
    }

    setSelectedItems(prev => ({ ...prev, [product.productId]: (prev[product.productId] || 0) + 1 }));
  };

  const handleRemoveItem = (productId) => {
    setSelectedItems(prev => {
      const updated = { ...prev };
      if (updated[productId] > 1) updated[productId] -= 1;
      else delete updated[productId];
      return updated;
    });
  };

  const handleBoxSizeSelect = (size) => {
    if (totalItemsCount > size.limit) {
      alert(`You have selected ${totalItemsCount} items, but the ${size.title} only holds ${size.limit}. Please remove some items first.`);
      return;
    }
    setBoxSize(size);
  };

  const canPlaceOrder = () => {
    return occasion && totalItemsCount > 0 && boxSize && 
           recipientName.trim() && giftMessage.trim() && 
           wrappingStyle && deliveryAddress.trim();
  };

  const handlePlaceOrder = async () => {
    if (!canPlaceOrder()) return;
    
    setSubmitting(true);
    const orderPayload = {
      customerId: 5, deliveryAddress, occasion, boxSize: boxSize.id,
      giftMessage, recipientName, wrappingStyle,
      items: Object.entries(selectedItems).map(([id, qty]) => ({ productId: parseInt(id), quantity: qty }))
    };

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/orders/custom-box`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });
      if (!res.ok) throw new Error('Failed to place order');
      setSubmitSuccess(true);
      window.scrollTo(0, 0);
    } catch (err) {
      alert('Error placing order: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="bb-page">
        <Header />
        <div className="bb-success-screen">
          <div className="bb-success-icon">🎁</div>
          <h2 className="bb-success-title">Your Box is Being Prepared!</h2>
          <p className="bb-success-desc">Thank you for choosing Giftora. Our premium vendors are carefully assembling your personalized gift box.</p>
          <button className="bb-btn-primary" onClick={() => navigate('/')}>Return to Home</button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bb-page">
      <Header />

      {/* ── HERO ── */}
      <section className="bb-hero">
        <div className="bb-hero__orb bb-hero__orb--1" />
        <div className="bb-hero__orb bb-hero__orb--2" />
        <div className="bb-hero__grid" />

        <div className="bb-hero__inner" ref={heroRef}>
          <div className="bb-hero__label">Giftora Exclusive</div>
          <h1 className="bb-hero__title">
            Curate Your <br />
            <span className="bb-hero__title-accent">Perfect Box</span>
          </h1>
          <p className="bb-hero__sub">
            Follow the sections below to build a deeply personal, beautifully packaged gift. Hand-picked by you, delivered by us.
          </p>
        </div>
        
        <div className="bb-hero__pills">
          {['1. Occasion', '2. Add Items', '3. Box Size', '4. Personalize', '5. Checkout'].map((p) => (
            <span key={p} className="bb-hero-pill">{p}</span>
          ))}
        </div>
      </section>

      {/* ── MAIN SCROLLING LAYOUT ── */}
      <div className="bb-layout-wrapper">
        <div className="bb-main-content">
          
          {/* STEP 01: OCCASION */}
          <section className="bb-section" id="step-occasion">
            <div className="bb-section-header">
              <div className="bb-section-label">Step 01</div>
              <h2 className="bb-section-title">What are we celebrating?</h2>
            </div>
            <div className="bb-grid-occasion">
              {OCCASIONS.map(occ => (
                <div 
                  key={occ.id} 
                  className={`bb-card ${occasion === occ.id ? 'bb-card--active' : ''}`}
                  onClick={() => setOccasion(occ.id)}
                >
                  <div className="bb-card-icon">{occ.icon}</div>
                  <h4 className="bb-card-title">{occ.label}</h4>
                </div>
              ))}
            </div>
          </section>

          {/* STEP 02: ITEMS (CART ITEMS ONLY) */}
          <section className="bb-section" id="step-items">
            <div className="bb-section-header">
              <div className="bb-section-label">Step 02</div>
              <h2 className="bb-section-title">Pick your premium items</h2>
              <p className="bb-section-sub">Select items directly from your cart to add into the box.</p>
            </div>

            {availableItems.length === 0 ? (
              <div className="bb-empty-cart">
                <div className="bb-empty-icon">🛒</div>
                <p>Your cart is currently empty.</p>
                <button className="bb-btn-primary" onClick={() => navigate('/products')}>
                  Browse Premium Items
                </button>
              </div>
            ) : (
              <>
                <div className="bb-grid-products">
                  {availableItems.map(p => {
                    const qty = selectedItems[p.productId] || 0;
                    const currentLimit = boxSize ? boxSize.limit : MAX_ITEMS_GLOBAL;
                    const isMaxedOut = totalItemsCount >= currentLimit && qty === 0;

                    return (
                      <div key={p.productId} className="bb-product-card">
                        <img src={p.imageUrl} alt={p.name} className="bb-product-img" loading="lazy" />
                        <div className="bb-product-body">
                          <h4 className="bb-product-title">{p.name}</h4>
                          <div className="bb-product-price">LKR {p.price.toLocaleString()}</div>
                          
                          {qty > 0 ? (
                            <div className="bb-qty-controls">
                              <button onClick={() => handleRemoveItem(p.productId)}>−</button>
                              <span>{qty}</span>
                              <button onClick={() => handleAddItem(p)} disabled={isMaxedOut}>+</button>
                            </div>
                          ) : (
                            <button 
                              className="bb-btn-add" 
                              onClick={() => handleAddItem(p)}
                              disabled={isMaxedOut}
                            >
                              {isMaxedOut ? 'Limit Reached' : 'Add to Box'}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="bb-show-more-wrap">
                  <button className="bb-btn-secondary" onClick={() => navigate('/products')}>
                    + Explore more products
                  </button>
                </div>
              </>
            )}
          </section>

          {/* STEP 03: SIZE */}
          <section className="bb-section" id="step-size">
            <div className="bb-section-header">
              <div className="bb-section-label">Step 03</div>
              <h2 className="bb-section-title">Choose your box size</h2>
              {totalItemsCount > 0 && <p className="bb-section-sub">You have selected {totalItemsCount} items. Choose a box that fits!</p>}
            </div>
            <div className="bb-grid-size">
              {BOX_SIZES.map(size => {
                const isTooSmall = totalItemsCount > size.limit;
                return (
                  <div 
                    key={size.id} 
                    className={`bb-card bb-size-card ${boxSize?.id === size.id ? 'bb-card--active' : ''} ${isTooSmall ? 'bb-card--disabled' : ''}`}
                    onClick={() => handleBoxSizeSelect(size)}
                  >
                    <h4 className="bb-card-title">{size.title}</h4>
                    <p className="bb-card-desc">{size.desc}</p>
                    <div className="bb-size-fee">+LKR {size.fee.toLocaleString()} box fee</div>
                    <div className="bb-size-limit">Up to {size.limit} items</div>
                    
                    {isTooSmall && <div className="bb-size-warning">Too small for selected items</div>}
                  </div>
                );
              })}
            </div>
          </section>

          {/* STEP 04: PERSONALIZE */}
          <section className="bb-section bb-section--dark" id="step-personalize">
            <div className="bb-section-header">
              <div className="bb-section-label" style={{color: 'var(--gold)'}}>Step 04</div>
              <h2 className="bb-section-title" style={{color: 'var(--white)'}}>Personalize your gift</h2>
            </div>
            
            <div className="bb-form-grid">
              <div className="bb-input-group">
                <label>Recipient Name</label>
                <input type="text" value={recipientName} onChange={e => setRecipientName(e.target.value)} placeholder="Who is this for?" />
              </div>
              
              <div className="bb-input-group bb-col-span-full">
                <label>
                  Gift Message
                  <span className="bb-char-count">{giftMessage.length}/150</span>
                </label>
                <textarea 
                  maxLength={150} rows={3} value={giftMessage} 
                  onChange={e => setGiftMessage(e.target.value)} 
                  placeholder="Write a heartfelt message to be printed on a premium card..."
                />
              </div>

              <div className="bb-input-group bb-col-span-full">
                <label>Wrapping Style</label>
                <div className="bb-wrap-options">
                  {WRAPPING_STYLES.map(style => (
                    <div 
                      key={style.id}
                      className={`bb-wrap-card ${wrappingStyle === style.id ? 'bb-wrap-card--active' : ''}`}
                      onClick={() => setWrappingStyle(style.id)}
                    >
                      <div className="bb-color-swatch" style={{ backgroundColor: style.color }} />
                      <span>{style.id}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bb-input-group bb-col-span-full">
                <label>Delivery Address</label>
                <input type="text" value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)} placeholder="Full delivery address" />
              </div>
            </div>
          </section>
        </div>

        {/* ── STICKY SIDEBAR (Order Summary) ── */}
        <aside className="bb-sidebar">
          <div className="bb-sticky-panel">
            <h3 className="bb-sticky-title">Your Custom Box</h3>
            
            <div className="bb-sticky-section">
              <div className="bb-sticky-row">
                <span className="bb-label">Occasion</span>
                <span className="bb-value">{occasion || '—'}</span>
              </div>
              <div className="bb-sticky-row">
                <span className="bb-label">Box Size</span>
                <span className="bb-value">{boxSize ? boxSize.title : '—'}</span>
              </div>
            </div>

            <div className="bb-sticky-items">
              <div className="bb-items-header">
                <span className="bb-label">Items Selected</span>
                <span className="bb-capacity">{totalItemsCount} / {boxSize ? boxSize.limit : MAX_ITEMS_GLOBAL}</span>
              </div>
              
              {Object.entries(selectedItems).length === 0 ? (
                <div className="bb-empty-items">No items added yet.</div>
              ) : (
                <div className="bb-item-list">
                  {Object.entries(selectedItems).map(([id, qty]) => {
                    const p = availableItems.find(prod => prod.id === parseInt(id));
                    if (!p) return null;
                    return (
                      <div key={id} className="bb-item-row">
                        <span className="bb-item-name">{qty}x {p.name}</span>
                        <span className="bb-item-price">LKR {(p.price * qty).toLocaleString()}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="bb-sticky-totals">
              <div className="bb-total-row">
                <span>Items Subtotal</span>
                <span>LKR {subtotal.toLocaleString()}</span>
              </div>
              <div className="bb-total-row">
                <span>Box & Packaging Fee</span>
                <span>LKR {boxSize ? boxSize.fee.toLocaleString() : '0'}</span>
              </div>
              <div className="bb-total-row bb-grand-total">
                <span>Total</span>
                <span>LKR {total.toLocaleString()}</span>
              </div>
            </div>

            <button 
              className="bb-btn-submit" 
              onClick={handlePlaceOrder}
              disabled={submitting || !canPlaceOrder()}
            >
              {submitting ? 'Processing...' : 'Place Order 🎁'}
            </button>
            
            {!canPlaceOrder() && (
              <p className="bb-help-text">Complete all sections to enable checkout.</p>
            )}
          </div>
        </aside>
      </div>

      <Footer />
    </div>
  );
};

export default BoxBuilderPage;