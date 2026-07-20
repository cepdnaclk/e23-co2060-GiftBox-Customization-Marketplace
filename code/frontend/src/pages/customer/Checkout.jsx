import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { FaTruck, FaLock, FaSpinner, FaShoppingBag } from 'react-icons/fa';
import './Checkout.css';

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, cartTotal, itemCount, clearCart, loadCart } = useCart();
  
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadCart();
  }, []);

  // Redirect if cart is empty and not in success state
  useEffect(() => {
    if (cartItems.length === 0 && !success) {
      navigate('/customer/cart');
    }
  }, [cartItems, success, navigate]);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!deliveryAddress.trim()) {
      setError('Delivery address is required');
      return;
    }

    setSubmitting(true);
    setError(null);

    const customerId = localStorage.getItem('userId') ? parseInt(localStorage.getItem('userId')) : 5;

    // Prepare standard order request matching CreateOrderRequest DTO
    const orderPayload = {
      customerId: customerId,
      deliveryAddress: deliveryAddress.trim(),
      items: cartItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      }))
    };

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/orders/standard`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(orderPayload)
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Failed to place order');
      }

      await clearCart();
      setSuccess(true);
      window.scrollTo(0, 0);
    } catch (err) {
      console.error('Error placing standard order:', err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="co-page">
        <div className="co-success-card">
          <div className="co-success-icon">✨</div>
          <h2 className="co-success-title">Order Placed Successfully!</h2>
          <p className="co-success-desc">
            Thank you for shopping with Giftora. Your orders have been sent to our premium vendors for immediate confirmation and assembly.
          </p>
          <div className="co-success-actions">
            <button className="co-btn-gold" onClick={() => navigate('/customer/orders')}>
              View My Orders
            </button>
            <button className="co-btn-outline" onClick={() => navigate('/home')}>
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="co-page">

      {/* ── Hero Banner ── */}
      <div className="ct-hero">
        <div className="ct-hero__orb ct-hero__orb--1" />
        <div className="ct-hero__orb ct-hero__orb--2" />
        <div className="ct-hero__inner">
          <div className="ct-hero__label">Secure Checkout</div>
          <h1 className="ct-hero__title">Complete Your Order</h1>
          <p className="ct-hero__sub">{itemCount} item{itemCount !== 1 ? 's' : ''} &middot; LKR {Number(cartTotal).toLocaleString()}</p>
        </div>
      </div>

      <div className="ct-body">
      <div className="co-container">
        {/* Left Form */}
        <form onSubmit={handlePlaceOrder} className="co-form-panel">
          <h2 className="co-panel-title">
            <FaTruck className="co-title-icon" /> Shipping Details
          </h2>

          {error && <div className="co-error-banner">{error}</div>}

          <div className="co-input-group">
            <label htmlFor="address">Delivery Address</label>
            <textarea
              id="address"
              placeholder="Enter your complete delivery address (Street, City, Postal Code)"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              disabled={submitting}
              required
            />
          </div>

          <div className="co-payment-info">
            <span className="co-pay-method-badge">COD</span>
            <div className="co-payment-desc">
              <strong>Cash on Delivery (COD)</strong>
              <p>Pay with cash upon receiving your items. Card payments will be supported soon.</p>
            </div>
          </div>

          <button type="submit" className="co-submit-btn" disabled={submitting}>
            {submitting ? (
              <>
                <FaSpinner className="co-spinner" /> Processing Order...
              </>
            ) : (
              <>
                <FaLock className="co-lock-icon" /> Place Order (LKR {Number(cartTotal).toLocaleString()})
              </>
            )}
          </button>
        </form>

        {/* Right Summary */}
        <div className="co-summary-panel">
          <h2 className="co-panel-title">
            <FaShoppingBag className="co-title-icon" /> Order Summary
          </h2>

          <div className="co-items-list">
            {cartItems.map((item) => (
              <div key={item.productId} className="co-item-row">
                <div className="co-item-img-wrap">
                  <img src={item.imageUrl} alt={item.name} />
                  <span className="co-item-qty">{item.quantity}</span>
                </div>
                <div className="co-item-details">
                  <div className="co-item-name">{item.name}</div>
                  <div className="co-item-vendor">Giftora Merchant</div>
                </div>
                <div className="co-item-price">
                  LKR {Number(item.price * item.quantity).toLocaleString()}
                </div>
              </div>
            ))}
          </div>

          <div className="co-summary-divider" />

          <div className="co-totals">
            <div className="co-total-row">
              <span>Subtotal ({itemCount} items)</span>
              <span>LKR {Number(cartTotal).toLocaleString()}</span>
            </div>
            <div className="co-total-row">
              <span>Shipping Fee</span>
              <span className="co-free-shipping">FREE</span>
            </div>
            <div className="co-total-row co-grand-total">
              <span>Grand Total</span>
              <span>LKR {Number(cartTotal).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>{/* end co-container */}
      </div>{/* end ct-body */}
    </div>
  );
};

export default Checkout;
