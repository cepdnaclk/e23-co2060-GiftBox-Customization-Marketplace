// pages/user/CustomerCart.jsx
// Logged-in customer cart — renders inside CustomerLayout via <Outlet />
// NO own Header/Footer — CustomerLayout provides those
// Route: /customer/cart

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import CheckoutModal from '../../components/customer/CheckoutModal.jsx';
import '../landingpage/CartPage.css';

const CustomerCart = () => {
  const navigate = useNavigate();
  const { cartItems, cartTotal, itemCount, removeItem, updateQty, clearCart, loadCart } = useCart();
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  useEffect(() => { loadCart(); }, []);

  return (
    <div className="cart-page" style={{ paddingBottom: '40px' }}>
      <main className="cart-main">

        <div className="cart-hero">
          <div className="cart-hero__orb cart-hero__orb--1" />
          <div className="cart-hero__orb cart-hero__orb--2" />
          <div className="cart-hero__inner">
            <div className="cart-hero__label">Your Selection</div>
            <h1 className="cart-hero__title">Shopping Cart</h1>
            <p className="cart-hero__sub">{itemCount} item{itemCount !== 1 ? 's' : ''} in your cart</p>
          </div>
        </div>

        {cartItems.length === 0 ? (
          <div className="cart-empty-container">
            <div className="cart-empty">
              <div className="cart-empty__icon">🛒</div>
              <h2 className="cart-empty__title">Your cart is empty</h2>
              <p className="cart-empty__desc">Browse our collection and add something special</p>
              <button className="cart-empty__btn" onClick={() => navigate('/home')}>
                Browse Gifts →
              </button>
            </div>
          </div>
        ) : (
        <div className="cart-body">
          <div className="cart-items">
            <div className="cart-items__header">
              <span>Product</span><span>Price</span><span>Quantity</span><span>Subtotal</span><span></span>
            </div>

            {cartItems.map((item, i) => (
              <div key={item.productId} className="cart-item" style={{ animationDelay: `${i * 0.06}s` }}>
                <div className="cart-item__product">
                  <div className="cart-item__img-wrap">
                    <img src={item.imageUrl} alt={item.name} className="cart-item__img" />
                  </div>
                  <div className="cart-item__info">
                    <div className="cart-item__name">{item.name}</div>
                    <div className="cart-item__vendor">Giftora Exclusive</div>
                  </div>
                </div>
                <div className="cart-item__price">LKR {Number(item.price).toLocaleString()}</div>
                <div className="cart-item__qty">
                  <button className="qty-btn" onClick={() => updateQty(item.productId, item.quantity - 1)}>−</button>
                  <span className="qty-value">{item.quantity}</span>
                  <button className="qty-btn" onClick={() => updateQty(item.productId, item.quantity + 1)}>+</button>
                </div>
                <div className="cart-item__subtotal">LKR {Number(item.price * item.quantity).toLocaleString()}</div>
                <button className="cart-item__remove" onClick={() => removeItem(item.productId)} title="Remove">✕</button>
              </div>
            ))}

            <div className="cart-items__footer">
              <button className="cart-clear-btn" onClick={clearCart}>🗑️ Clear Cart</button>
              <button className="cart-continue-btn" onClick={() => navigate('/home')}>← Continue Shopping</button>
            </div>
          </div>

          <div className="cart-summary">
            <div className="cart-summary__title">Order Summary</div>
            <div className="cart-summary__rows">
              <div className="cart-summary__row">
                <span>Subtotal ({itemCount} items)</span>
                <span>LKR {Number(cartTotal).toLocaleString()}</span>
              </div>
              <div className="cart-summary__row"><span>Delivery</span><span className="cart-summary__free">FREE</span></div>
              <div className="cart-summary__row"><span>Gift Wrapping</span><span className="cart-summary__free">Included</span></div>
            </div>
            <div className="cart-summary__divider" />
            <div className="cart-summary__total">
              <span>Total</span>
              <span className="cart-summary__total-amt">LKR {Number(cartTotal).toLocaleString()}</span>
            </div>
            {/* Logged in cart → open checkout modal */}
            <button className="cart-checkout-btn" onClick={() => setIsCheckoutModalOpen(true)}>
              Proceed to Checkout →
            </button>
          </div>
        </div>
        )}
      </main>

      {/* Checkout Modal Overlay */}
      <CheckoutModal 
        isOpen={isCheckoutModalOpen} 
        onClose={() => setIsCheckoutModalOpen(false)} 
      />
    </div>
  );
};

export default CustomerCart;