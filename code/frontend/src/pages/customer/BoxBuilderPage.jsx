// BoxBuilderPage.jsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext'; 
import './BoxBuilderPage.css';

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
  { id: 'Classic Gold', color: '#C9A961', ribbon: '#FFFFFF' },
  { id: 'Rose Pink', color: '#E8A0BF', ribbon: '#333333' },
  { id: 'Midnight Blue', color: '#1A1A2E', ribbon: '#C9A961' }
];

const MAX_ITEMS_GLOBAL = 8;

const BoxBuilderPage = () => {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  
  const { cartItems } = useCart(); 
  const availableItems = cartItems || [];

  // Wizard Navigation
  const [activeStep, setActiveStep] = useState(1);

  // Form States
  const [occasion, setOccasion] = useState(OCCASIONS[0].id); // Defaulting for visual workflow smoothness
  const [boxSize, setBoxSize] = useState(BOX_SIZES[1]); // Defaulting to Medium
  const [selectedItems, setSelectedItems] = useState({}); 
  const [wrappingStyle, setWrappingStyle] = useState(WRAPPING_STYLES[0].id);
  
  // Personalization States
  const [recipientName, setRecipientName] = useState('');
  const [giftMessage, setGiftMessage] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Hero Intro Transition Effect
  useEffect(() => {
    const t = setTimeout(() => {
      if (heroRef.current) heroRef.current.classList.add('bb-hero--visible');
    }, 80);
    return () => clearTimeout(t);
  }, []);

  // Sync Item Trim Constraints when Box Size Decreases
  useEffect(() => {
    if (!boxSize) return;
    let count = Object.values(selectedItems).reduce((sum, q) => sum + q, 0);
    if (count <= boxSize.limit) return;

    const updated = { ...selectedItems };
    const keys = Object.keys(updated);
    for (let i = keys.length - 1; i >= 0 && count > boxSize.limit; i--) {
      const remove = Math.min(updated[keys[i]], count - boxSize.limit);
      updated[keys[i]] -= remove;
      count -= remove;
      if (updated[keys[i]] <= 0) delete updated[keys[i]];
    }
    setSelectedItems(updated);
    setValidationError(`Box scaled down. Items automatically adjusted to match the ${boxSize.title} limit.`);
  }, [boxSize]);

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
    setValidationError('');
    const currentLimit = boxSize ? boxSize.limit : MAX_ITEMS_GLOBAL;
    
    if (totalItemsCount >= currentLimit) {
      setValidationError(`Your selected ${boxSize?.title || 'Box'} has reached its limit (${currentLimit} items). Upgrade your size to add more.`);
      return;
    }
    setSelectedItems(prev => ({ ...prev, [product.productId]: (prev[product.productId] || 0) + 1 }));
  };

  const handleRemoveItem = (productId) => {
    setValidationError('');
    setSelectedItems(prev => {
      const updated = { ...prev };
      if (updated[productId] > 1) updated[productId] -= 1;
      else delete updated[productId];
      return updated;
    });
  };

  const handleBoxSizeSelect = (size) => {
    setValidationError('');
    setBoxSize(size);
  };

  const currentWrapData = useMemo(() => {
    return WRAPPING_STYLES.find(w => w.id === wrappingStyle) || WRAPPING_STYLES[0];
  }, [wrappingStyle]);

  const canPlaceOrder = () => {
    return occasion && totalItemsCount > 0 && boxSize && 
           recipientName.trim() && giftMessage.trim() && 
           wrappingStyle && deliveryAddress.trim();
  };

  const handlePlaceOrder = async () => {
    if (!canPlaceOrder()) return;
    
    setSubmitting(true);
    const orderPayload = {
      customerId: 5, 
      deliveryAddress, 
      occasion, 
      boxSize: boxSize.id,
      giftMessage, 
      recipientName, 
      wrappingStyle,
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
      setValidationError('Error placing order: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="bb-page">
        <div className="bb-success-screen">
          <div className="bb-success-icon">🎁</div>
          <h2 className="bb-success-title">Your Box is Being Prepared!</h2>
          <p className="bb-success-desc">Thank you for choosing Giftora. Our premium vendors are carefully assembling your personalized gift box.</p>
          <button className="bb-btn-primary" onClick={() => navigate('/')}>Return to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="bb-page">
      
      {/* HEADER HERO ELEMENT */}
      <section className="bb-hero-clean">
        <div className="bb-hero-inner" ref={heroRef}>
          <span className="bb-hero-badge">Giftora Studio</span>
          <h1>Curate a Premium Gift Box</h1>
          <p>Configure a custom arrangement across our boutique inventory collections, beautifully bound and personalized.</p>
        </div>
      </section>

      {/* HORIZONTAL WIZARD PROGRESS FLOW BAR */}
      <div className="bb-wizard-stepper">
        {[
          { step: 1, label: '1. Framework & Size' },
          { step: 2, label: '2. Wrapping Stock' },
          { step: 3, label: '3. Pack Items' },
          { step: 4, label: '4. Delivery & Note' }
        ].map((item) => (
          <button
            key={item.step}
            className={`bb-step-tab ${activeStep === item.step ? 'active' : ''} ${activeStep > item.step ? 'completed' : ''}`}
            onClick={() => setActiveStep(item.step)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* CORE WORKFLOW SCREEN DISPLAY LAYOUT */}
      <div className="bb-split-workspace">
        
        {/* LEFT WORKSPACE VIEW PANEL */}
        <div className="bb-interactive-card">
          {validationError && (
            <div className="bb-inline-alert">
              <span>⚠️ {validationError}</span>
              <button onClick={() => setValidationError('')}>×</button>
            </div>
          )}

          {/* STEP 1: SIZE & OCCASION BASE */}
          {activeStep === 1 && (
            <div className="bb-wizard-pane view-fade">
              <h3>Select Celebration Theme</h3>
              <div className="bb-occasion-grid-v2">
                {OCCASIONS.map(occ => (
                  <button 
                    key={occ.id} 
                    className={`bb-occ-card ${occasion === occ.id ? 'active' : ''}`}
                    onClick={() => setOccasion(occ.id)}
                  >
                    <span className="occ-emoji">{occ.icon}</span>
                    <span className="occ-label">{occ.label}</span>
                  </button>
                ))}
              </div>

              <h3 className="section-spacer">Choose Box Dimensions & Load Capacity</h3>
              <div className="bb-sizes-column">
                {BOX_SIZES.map(size => (
                  <div 
                    key={size.id} 
                    className={`bb-size-row-card ${boxSize?.id === size.id ? 'active' : ''}`}
                    onClick={() => handleBoxSizeSelect(size)}
                  >
                    <div className="row-details">
                      <h4>{size.title}</h4>
                      <p>{size.desc}</p>
                      <span className="row-limit">Cap Limit: Up to {size.limit} unique items</span>
                    </div>
                    <div className="row-pricing">
                      <span className="fee-amt">LKR {size.fee.toLocaleString()}</span>
                      <span className="fee-lbl">Packaging Fee</span>
                    </div>
                  </div>
                ))}
              </div>

              <button className="bb-action-forward" onClick={() => setActiveStep(2)}>
                Continue to Wrap Presentation →
              </button>
            </div>
          )}

          {/* STEP 2: WRAPPING STOCK STYLING */}
          {activeStep === 2 && (
            <div className="bb-wizard-pane view-fade">
              <h3>Select Custom Exterior Wrapping</h3>
              <p className="pane-subtitle">Choose a design layer to swaddle your gift box bundle box frame presentation.</p>
              
              <div className="bb-wrap-swatch-grid">
                {WRAPPING_STYLES.map(style => (
                  <div 
                    key={style.id}
                    className={`bb-swatch-box-option ${wrappingStyle === style.id ? 'active' : ''}`}
                    onClick={() => setWrappingStyle(style.id)}
                  >
                    <div className="swatch-preview-block" style={{ backgroundColor: style.color }} />
                    <div className="swatch-meta">
                      <h5>{style.id}</h5>
                      <p>Premium Heavy Cardstock Coating</p>
                    </div>
                  </div>
                ))}
              </div>

              <button className="bb-action-forward" onClick={() => setActiveStep(3)}>
                Proceed to Item Inventory Selection →
              </button>
            </div>
          )}

          {/* STEP 3: CURATED CATALOGUE LOADING */}
          {activeStep === 3 && (
            <div className="bb-wizard-pane view-fade">
              <div className="pane-header-flex">
                <div>
                  <h3>Pack Box Contents</h3>
                  <p className="pane-subtitle">Incorporate curated options into your designated container framework allocation.</p>
                </div>
                <div className="pane-load-counter">
                  <span>Usage Load: <strong>{totalItemsCount} / {boxSize?.limit} Max</strong></span>
                  <div className="load-meter-track">
                    <div className="load-meter-fill" style={{ width: `${(totalItemsCount / (boxSize?.limit || 1)) * 100}%` }} />
                  </div>
                </div>
              </div>

              {availableItems.length === 0 ? (
                <div className="bb-catalog-fallback">
                  <div className="fallback-art">🛒</div>
                  <h4>No active cart entities mapped</h4>
                  <p>Explore the boutique platform repository to cache selectable items inside your working directory.</p>
                  <button className="bb-btn-primary" onClick={() => navigate('/products')}>
                    Browse Premium Catalog
                  </button>
                </div>
              ) : (
                <>
                  <div className="bb-item-catalog-matrix">
                    {availableItems.map(p => {
                      const qty = selectedItems[p.productId] || 0;
                      const currentLimit = boxSize ? boxSize.limit : MAX_ITEMS_GLOBAL;
                      const isMaxedOut = totalItemsCount >= currentLimit && qty === 0;

                      return (
                        <div key={p.productId} className={`bb-catalog-unit ${qty > 0 ? 'active' : ''}`}>
                          <div className="unit-img-frame">
                            <img src={p.imageUrl} alt={p.name} loading="lazy" />
                            {qty > 0 && <span className="unit-floating-badge">{qty}</span>}
                          </div>
                          <div className="unit-body">
                            <h5>{p.name}</h5>
                            <span className="unit-cost">LKR {p.price.toLocaleString()}</span>
                            
                            <div className="unit-control-footer">
                              {qty > 0 ? (
                                <div className="unit-qty-spinner">
                                  <button onClick={() => handleRemoveItem(p.productId)}>−</button>
                                  <span className="spinner-val">{qty}</span>
                                  <button onClick={() => handleAddItem(p)} disabled={isMaxedOut}>+</button>
                                </div>
                              ) : (
                                <button 
                                  className="unit-btn-append" 
                                  onClick={() => handleAddItem(p)}
                                  disabled={isMaxedOut}
                                >
                                  {isMaxedOut ? 'Full' : '+ Pack'}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="bb-catalog-routing-footer">
                    <button className="bb-btn-secondary" onClick={() => navigate('/products')}>
                      + Add other items from storefront
                    </button>
                  </div>
                </>
              )}

              <button className="bb-action-forward space-top" disabled={totalItemsCount === 0} onClick={() => setActiveStep(4)}>
                Next: Personalize & Greeting →
              </button>
            </div>
          )}

          {/* STEP 4: GREETINGS & SHIPMENT TARGETING */}
          {activeStep === 4 && (
            <div className="bb-wizard-pane view-fade">
              <h3>Personalization & Target Address</h3>
              <p className="pane-subtitle">Complete final logistical routing and decorative gift arrangements.</p>
              
              <div className="bb-field-structure">
                <div className="bb-field-block">
                  <label>Recipient Full Name</label>
                  <input 
                    type="text" 
                    value={recipientName} 
                    onChange={e => setRecipientName(e.target.value)} 
                    placeholder="Enter recipient designation..." 
                  />
                </div>

                <div className="bb-field-block">
                  <label>
                    Gift Message Note Block
                    <span className="character-tally">{giftMessage.length}/150</span>
                  </label>
                  <textarea 
                    maxLength={150} 
                    rows={4} 
                    value={giftMessage} 
                    onChange={e => setGiftMessage(e.target.value)} 
                    placeholder="Provide a handwritten card statement..."
                  />
                </div>

                <div className="bb-field-block">
                  <label>Consignee Shipping Destination Address</label>
                  <input 
                    type="text" 
                    value={deliveryAddress} 
                    onChange={e => setDeliveryAddress(e.target.value)} 
                    placeholder="Provide complete shipping destination details..." 
                  />
                </div>
              </div>

              <button 
                className={`bb-submission-finalizer ${addedToCart ? 'success' : ''}`} 
                onClick={handlePlaceOrder}
                disabled={submitting || !canPlaceOrder()}
              >
                {submitting ? 'Processing Dispatch...' : `Submit Order Setup • LKR ${total.toLocaleString()}`}
              </button>
            </div>
          )}
        </div>

        {/* RIGHT PRESENTATION PREVIEW PANEL AREA */}
        <aside className="bb-presentation-panel">
          <span className="panel-hdr-label">Live Visual Presentation</span>
          
          {/* THE DIGITAL 3D BOX CANVAS SIMULATOR */}
          <div className="bb-digital-canvas" style={{ backgroundColor: currentWrapData.color }}>
            {/* CROSS STRIP DECORATIVE LAYER MOCKUPS */}
            <div className="bb-ribbon-h" style={{ backgroundColor: currentWrapData.ribbon }} />
            <div className="bb-ribbon-v" style={{ backgroundColor: currentWrapData.ribbon }} />
            
            {/* FLOATING GREETING TAG OVERLAY */}
            <div className="bb-canvas-gift-tag">
              <div className="tag-anchor-eyelet" />
              <div className="tag-interior-typography">
                <span className="tag-branding">GIFTORA PRESTIGE</span>
                <span className="tag-target-name">{recipientName ? `To: ${recipientName}` : 'Recipient Name'}</span>
                <p className="tag-body-excerpt">
                  {giftMessage ? `"${giftMessage}"` : 'Your dynamic text layout prints here live as you type...'}
                </p>
              </div>
            </div>

            <div className="bb-canvas-badge-descriptor">
              <span>{boxSize ? boxSize.title : 'No Box Framework Selected'}</span>
            </div>
          </div>

          {/* ITEM INVENTORY CONDENSED BREAKDOWN */}
          <div className="bb-receipt-card-ledger">
            <h5>Item Inventory Matrix</h5>
            <div className="ledger-entry">
              <span>Container Base ({boxSize ? boxSize.title : 'None Selected'})</span>
              <span>LKR {boxSize ? boxSize.fee.toLocaleString() : '0'}</span>
            </div>
            <div className="ledger-entry">
              <span>Theme Ribbon Layer ({occasion || 'None Selected'})</span>
              <span className="ledger-complementary">INCLUDED</span>
            </div>
            <div className="ledger-entry">
              <span>Outer Wrap Cover Coat ({wrappingStyle || 'None Selected'})</span>
              <span className="ledger-complementary">INCLUDED</span>
            </div>

            {Object.entries(selectedItems).map(([id, qty]) => {
              const p = availableItems.find(prod => prod.productId === parseInt(id));
              if (!p) return null;
              return (
                <div key={id} className="ledger-entry nested-item-row">
                  <span>{p.name} <strong className="qty-indicator">×{qty}</strong></span>
                  <span>LKR {(p.price * qty).toLocaleString()}</span>
                </div>
              );
            })}

            <div className="ledger-border-dashed" />
            <div className="ledger-total-line">
              <span>Grand Total</span>
              <span>LKR {total.toLocaleString()}</span>
            </div>
            
            {!canPlaceOrder() && activeStep === 4 && (
              <p className="ledger-footer-tip">⚠️ Make sure all fields, delivery coordinates, and greetings are filled out before checking out.</p>
            )}
          </div>
        </aside>

      </div>
    </div>
  );
};

export default BoxBuilderPage;