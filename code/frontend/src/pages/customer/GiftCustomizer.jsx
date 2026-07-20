// GiftCustomizer.jsx
// This is the main Gift Box Customization page for logged-in customers.
// It lets customers: pick a box size, choose a ribbon color, select items
// from vendors, add a personal message, and add the box to their cart.
 
import React, { useState, useEffect } from "react";
import "./GiftCustomizer.css";
 
// ─── STATIC DATA ────────────────────────────────────────────────────────────
// In the future, boxSizes and catalogItems will come from your Spring Boot API.
// For now they are hardcoded so the page works without a backend.
 
const boxSizes = [
  { id: "small",  label: "Small",       maxItems: 3,  basePrice: 500  },
  { id: "medium", label: "Medium",      maxItems: 5,  basePrice: 850  },
  { id: "large",  label: "Large",       maxItems: 8,  basePrice: 1200 },
  { id: "xlarge", label: "Extra Large", maxItems: 12, basePrice: 1800 },
];
 
const ribbonColors = [
  { id: "ruby",     label: "Ruby",     hex: "#E24B4A" },
  { id: "gold",     label: "Gold",     hex: "#EF9F27" },
  { id: "teal",     label: "Teal",     hex: "#1D9E75" },
  { id: "sky",      label: "Sky",      hex: "#378ADD" },
  { id: "rose",     label: "Rose",     hex: "#D4537E" },
  { id: "lavender", label: "Lavender", hex: "#7F77DD" },
  { id: "silver",   label: "Silver",   hex: "#888780" },
];
 
const catalogItems = [
  { id: "choc",   emoji: "🍫", name: "Chocolate Box",   price: 450,  vendor: "ChocoVend"  },
  { id: "candle", emoji: "🕯️", name: "Scented Candle",  price: 780,  vendor: "GlowVend"   },
  { id: "teddy",  emoji: "🧸", name: "Teddy Bear",      price: 1100, vendor: "ToyVend"    },
  { id: "wine",   emoji: "🍷", name: "Wine Bottle",     price: 2200, vendor: "SipVend"    },
  { id: "spa",    emoji: "🧴", name: "Spa Kit",         price: 650,  vendor: "GlowVend"   },
  { id: "mug",    emoji: "☕", name: "Ceramic Mug",     price: 380,  vendor: "HomeVend"   },
  { id: "cookie", emoji: "🍪", name: "Cookie Tin",      price: 420,  vendor: "ChocoVend"  },
  { id: "flower", emoji: "💐", name: "Dried Flowers",   price: 590,  vendor: "FloraVend"  },
  { id: "book",   emoji: "📚", name: "Bestseller Book", price: 900,  vendor: "BookVend"   },
  { id: "tea",    emoji: "🍵", name: "Tea Collection",  price: 520,  vendor: "SipVend"    },
  { id: "honey",  emoji: "🍯", name: "Artisan Honey",   price: 670,  vendor: "NatureVend" },
  { id: "photo",  emoji: "🖼️", name: "Photo Frame",     price: 840,  vendor: "HomeVend"   },
];
 
// ─── HELPER ─────────────────────────────────────────────────────────────────
// Calculates the running total: box base price + sum of all selected items
function calcTotal(sizeId, selectedItems) {
  const box = boxSizes.find((s) => s.id === sizeId);
  const boxPrice = box ? box.basePrice : 0;
  const itemsPrice = Object.entries(selectedItems).reduce((sum, [id, qty]) => {
    const item = catalogItems.find((i) => i.id === id);
    return sum + (item ? item.price * qty : 0);
  }, 0);
  return boxPrice + itemsPrice;
}
 
// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────
export default function GiftCustomizer() {
  // STATE — React useState stores all the customer's choices
  const [selectedSize, setSelectedSize]     = useState(null);   // which box size
  const [selectedColor, setSelectedColor]   = useState(null);   // which ribbon
  const [selectedItems, setSelectedItems]   = useState({});     // { itemId: qty }
  const [message, setMessage]               = useState("");     // personal message
  const [addedToCart, setAddedToCart]       = useState(false);  // success state
  const [activeStep, setActiveStep]         = useState(1);      // which step is open
 
  // Derived values calculated from state
  const currentBox   = boxSizes.find((s) => s.id === selectedSize);
  const maxItems     = currentBox ? currentBox.maxItems : 0;
  const itemCount    = Object.values(selectedItems).reduce((a, b) => a + b, 0);
  const totalPrice   = calcTotal(selectedSize, selectedItems);
  const canAddToCart = selectedSize && selectedColor && itemCount > 0;
 
  // ── Item selection logic ──────────────────────────────────────────────────
  // When customer clicks an item card:
  // - If item not selected yet and box has space → add 1
  // - If item already selected → increase qty by 1
  // - If box is full → do nothing
  function handleItemClick(itemId) {
    if (!selectedSize) return; // must pick size first
    const currentQty = selectedItems[itemId] || 0;
    if (currentQty === 0 && itemCount >= maxItems) return; // box full
    setSelectedItems((prev) => ({ ...prev, [itemId]: currentQty + 1 }));
  }
 
  // When customer clicks the minus (−) button on a selected item
  function handleItemRemove(itemId) {
    const currentQty = selectedItems[itemId] || 0;
    if (currentQty <= 1) {
      // Remove the item entirely from selectedItems
      const updated = { ...selectedItems };
      delete updated[itemId];
      setSelectedItems(updated);
    } else {
      setSelectedItems((prev) => ({ ...prev, [itemId]: currentQty - 1 }));
    }
  }
 
  // ── When size changes, trim items that exceed new max ────────────────────
  useEffect(() => {
    if (!selectedSize) return;
    const newMax = boxSizes.find((s) => s.id === selectedSize).maxItems;
    let count = Object.values(selectedItems).reduce((a, b) => a + b, 0);
    if (count <= newMax) return;
    // Remove items from the end until within limit
    const updated = { ...selectedItems };
    const keys = Object.keys(updated);
    for (let i = keys.length - 1; i >= 0 && count > newMax; i--) {
      const remove = Math.min(updated[keys[i]], count - newMax);
      updated[keys[i]] -= remove;
      count -= remove;
      if (updated[keys[i]] <= 0) delete updated[keys[i]];
    }
    setSelectedItems(updated);
  }, [selectedSize]);
 
  // ── Add to cart ───────────────────────────────────────────────────────────
  // This sends the customization to your Spring Boot backend.
  // The endpoint POST /api/cart/add receives the box config as JSON.
  async function handleAddToCart() {
    if (!canAddToCart) return;
 
    const payload = {
      boxSize:    selectedSize,
      ribbonColor: selectedColor,
      items: Object.entries(selectedItems).map(([id, qty]) => ({ itemId: id, quantity: qty })),
      message:    message,
      totalPrice: totalPrice,
    };
 
    try {
      // TODO: replace with your actual Spring Boot base URL if different
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/cart/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // If your backend uses JWT auth, add:
        // "Authorization": `Bearer ${localStorage.getItem("token")}`
        body: JSON.stringify(payload),
      });
 
      if (response.ok) {
        setAddedToCart(true);
        // Reset form after 3 seconds
        setTimeout(() => {
          setAddedToCart(false);
          setSelectedSize(null);
          setSelectedColor(null);
          setSelectedItems({});
          setMessage("");
          setActiveStep(1);
        }, 3000);
      } else {
        alert("Something went wrong. Please try again.");
      }
    } catch (error) {
      // If backend is not running yet, just show success for demo
      console.error("Cart API error:", error);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 3000);
    }
  }
 
  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div className="gc-page">
 
      {/* ── Hero Banner ── */}
      <div className="gc-hero">
        <div className="gc-hero__orb gc-hero__orb--1" />
        <div className="gc-hero__orb gc-hero__orb--2" />
        <div className="gc-hero__inner">
          <h1 className="gc-hero__title">Curate the <em style={{color:'#C9A961',fontStyle:'italic'}}>Perfect Gift</em></h1>
          <p className="gc-hero__sub">Choose items from our local vendors — we hand-pack and deliver island-wide.</p>
        </div>
      </div>

      {/* ── Main Layout: Steps (left) + Summary (right) ── */}
      <div className="gc-body">
      <div className="gc-layout">
 
        {/* ════ LEFT PANEL — 4 steps ════ */}
        <div className="gc-steps">
 
          {/* ── STEP 1: Box Size ── */}
          <div className={`gc-step ${activeStep === 1 ? "open" : ""}`}>
            <button className="gc-step-header" onClick={() => setActiveStep(1)}>
              <span className="gc-step-num">1</span>
              <span className="gc-step-label">Choose Box Size</span>
              {selectedSize && (
                <span className="gc-step-done">
                  {currentBox.label} · Rs {currentBox.basePrice}
                </span>
              )}
            </button>
            {activeStep === 1 && (
              <div className="gc-step-body">
                <div className="gc-size-grid">
                  {boxSizes.map((size) => (
                    <button
                      key={size.id}
                      className={`gc-size-card ${selectedSize === size.id ? "active" : ""}`}
                      onClick={() => { setSelectedSize(size.id); setActiveStep(2); }}
                    >
                      <span className="gc-size-name">{size.label}</span>
                      <span className="gc-size-items">Up to {size.maxItems} items</span>
                      <span className="gc-size-price">Rs {size.basePrice}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
 
          {/* ── STEP 2: Ribbon Color ── */}
          <div className={`gc-step ${activeStep === 2 ? "open" : ""}`}>
            <button className="gc-step-header" onClick={() => setActiveStep(2)}>
              <span className="gc-step-num">2</span>
              <span className="gc-step-label">Pick Ribbon Color</span>
              {selectedColor && (
                <span className="gc-step-done">
                  {ribbonColors.find((c) => c.id === selectedColor)?.label}
                </span>
              )}
            </button>
            {activeStep === 2 && (
              <div className="gc-step-body">
                <div className="gc-color-row">
                  {ribbonColors.map((color) => (
                    <button
                      key={color.id}
                      className={`gc-color-dot ${selectedColor === color.id ? "active" : ""}`}
                      style={{ backgroundColor: color.hex }}
                      title={color.label}
                      onClick={() => { setSelectedColor(color.id); setActiveStep(3); }}
                    />
                  ))}
                </div>
                {selectedColor && (
                  <p className="gc-color-label">
                    Selected: <strong>{ribbonColors.find((c) => c.id === selectedColor)?.label}</strong>
                  </p>
                )}
              </div>
            )}
          </div>
 
          {/* ── STEP 3: Select Items ── */}
          <div className={`gc-step ${activeStep === 3 ? "open" : ""}`}>
            <button className="gc-step-header" onClick={() => setActiveStep(3)}>
              <span className="gc-step-num">3</span>
              <span className="gc-step-label">Select Items</span>
              {itemCount > 0 && (
                <span className="gc-step-done">{itemCount} item{itemCount !== 1 ? "s" : ""} added</span>
              )}
            </button>
            {activeStep === 3 && (
              <div className="gc-step-body">
                {/* Progress bar showing how full the box is */}
                {selectedSize && (
                  <div className="gc-capacity">
                    <span className="gc-capacity-text">
                      {itemCount} / {maxItems} items
                    </span>
                    <div className="gc-capacity-bar">
                      <div
                        className="gc-capacity-fill"
                        style={{ width: `${maxItems ? (itemCount / maxItems) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                )}
                {!selectedSize && (
                  <p className="gc-hint">Please select a box size first.</p>
                )}
                {/* Item cards grid */}
                <div className="gc-items-grid">
                  {catalogItems.map((item) => {
                    const qty = selectedItems[item.id] || 0;
                    const atCapacity = itemCount >= maxItems && qty === 0 && selectedSize;
                    return (
                      <div
                        key={item.id}
                        className={`gc-item-card
                          ${qty > 0 ? "selected" : ""}
                          ${atCapacity ? "disabled" : ""}
                        `}
                        onClick={() => handleItemClick(item.id)}
                      >
                        {/* Quantity badge shown when item is in box */}
                        {qty > 0 && <span className="gc-qty-badge">{qty}</span>}
                        <span className="gc-item-emoji">{item.emoji}</span>
                        <span className="gc-item-name">{item.name}</span>
                        <span className="gc-item-vendor">{item.vendor}</span>
                        <span className="gc-item-price">Rs {item.price}</span>
                        {/* Minus button to reduce qty */}
                        {qty > 0 && (
                          <button
                            className="gc-item-minus"
                            onClick={(e) => { e.stopPropagation(); handleItemRemove(item.id); }}
                          >
                            −
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
                {itemCount > 0 && (
                  <button className="gc-next-btn" onClick={() => setActiveStep(4)}>
                    Continue →
                  </button>
                )}
              </div>
            )}
          </div>
 
          {/* ── STEP 4: Personal Message ── */}
          <div className={`gc-step ${activeStep === 4 ? "open" : ""}`}>
            <button className="gc-step-header" onClick={() => setActiveStep(4)}>
              <span className="gc-step-num">4</span>
              <span className="gc-step-label">Add a Message</span>
              {message && <span className="gc-step-done">Added ✓</span>}
            </button>
            {activeStep === 4 && (
              <div className="gc-step-body">
                <textarea
                  className="gc-message-input"
                  placeholder="Write something heartfelt... (optional)"
                  maxLength={150}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <div className="gc-char-count">{message.length} / 150</div>
              </div>
            )}
          </div>
 
        </div>{/* end gc-steps */}
 
        {/* ════ RIGHT PANEL — Order Summary ════ */}
        <div className="gc-summary">
          <h3 className="gc-summary-title">Order Summary</h3>
 
          {/* Box preview visual */}
          <div className="gc-preview">
            <div className="gc-preview-emoji">🎁</div>
            <div
              className="gc-preview-ribbon"
              style={{
                color: selectedColor
                  ? ribbonColors.find((c) => c.id === selectedColor)?.hex
                  : "#888",
              }}
            >
              {selectedColor
                ? `${ribbonColors.find((c) => c.id === selectedColor)?.label} ribbon`
                : "No ribbon selected"}
            </div>
          </div>
 
          {/* Summary rows */}
          <div className="gc-summary-rows">
            <div className="gc-summary-row">
              <span>Box size</span>
              <span>{currentBox ? `${currentBox.label} — Rs ${currentBox.basePrice}` : "—"}</span>
            </div>
            <div className="gc-summary-row">
              <span>Ribbon</span>
              <span>{selectedColor ? ribbonColors.find((c) => c.id === selectedColor)?.label : "—"}</span>
            </div>
            <div className="gc-summary-row">
              <span>Items ({itemCount}/{maxItems || "—"})</span>
              <span>
                Rs {Object.entries(selectedItems).reduce((sum, [id, qty]) => {
                  const item = catalogItems.find((i) => i.id === id);
                  return sum + (item ? item.price * qty : 0);
                }, 0)}
              </span>
            </div>
 
            {/* List of selected items */}
            {Object.entries(selectedItems).map(([id, qty]) => {
              const item = catalogItems.find((i) => i.id === id);
              if (!item || qty === 0) return null;
              return (
                <div key={id} className="gc-summary-item">
                  <span>{item.emoji} {item.name} ×{qty}</span>
                  <span>Rs {item.price * qty}</span>
                </div>
              );
            })}
 
            <div className="gc-summary-row">
              <span>Message</span>
              <span>{message ? `"${message.slice(0, 20)}${message.length > 20 ? "…" : ""}"` : "—"}</span>
            </div>
          </div>
 
          {/* Divider */}
          <div className="gc-summary-divider" />
 
          {/* Total */}
          <div className="gc-total-row">
            <span>Total</span>
            <span>Rs {totalPrice}</span>
          </div>
 
          {/* Add to Cart button */}
          <button
            className={`gc-cart-btn ${addedToCart ? "success" : ""}`}
            disabled={!canAddToCart || addedToCart}
            onClick={handleAddToCart}
          >
            {addedToCart ? "✓ Added to Cart!" : "Add to Cart"}
          </button>
 
          {/* Helper text when button is disabled */}
          {!canAddToCart && (
            <p className="gc-cart-hint">
              {!selectedSize
                ? "Select a box size to start"
                : !selectedColor
                ? "Pick a ribbon color"
                : "Add at least one item"}
            </p>
          )}
        </div>
 
      </div> {/* end gc-layout */}
      </div> {/* end gc-body */}
    </div>
  );
}
 