import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { X, MapPin, Phone, CreditCard, Banknote, ShieldCheck } from 'lucide-react';
import './CheckoutModal.css';

const CheckoutModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { cartItems, clearCart } = useCart();

  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Form states
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');

  const userId = localStorage.getItem('userId') ? parseInt(localStorage.getItem('userId')) : 5;

  useEffect(() => {
    if (isOpen) {
      // Reset states
      setSuccess(false);
      setError(null);
      
      // Fetch user data for pre-fill
      const fetchUserData = async () => {
        setLoadingData(true);
        try {
          const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/api/users/${userId}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
          });
          if (res.ok) {
            const data = await res.json();
            
            // Format address nicely
            const parts = [data.addressLine1, data.addressLine2, data.city, data.district, data.province, data.postalCode]
              .filter(p => p && p.trim() !== '');
            if (parts.length > 0) {
              setDeliveryAddress(parts.join(', '));
            }
            
            if (data.phoneNumber) {
              setMobileNumber(data.phoneNumber);
            }
          }
        } catch (err) {
          console.error("Failed to fetch user profile", err);
        } finally {
          setLoadingData(false);
        }
      };

      fetchUserData();
    }
  }, [isOpen, userId]);

  if (!isOpen) return null;

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!deliveryAddress.trim()) {
      setError('Delivery address is required');
      return;
    }
    if (!mobileNumber.trim()) {
      setError('Mobile number is required');
      return;
    }

    setSubmitting(true);
    setError(null);

    // Prepare standard order request matching CreateOrderRequest DTO
    // We bundle payment and phone into address string if backend doesn't support it natively,
    // or just pass as address. We will append them to delivery address for visibility.
    const finalAddress = `${deliveryAddress.trim()} | Phone: ${mobileNumber.trim()} | Payment: ${paymentMethod.toUpperCase()}`;

    const orderPayload = {
      customerId: userId,
      deliveryAddress: finalAddress,
      items: cartItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      }))
    };

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/api/orders/standard`, {
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
    } catch (err) {
      console.error('Error placing order:', err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const closeAndNavigate = (path) => {
    onClose();
    if (path) navigate(path);
  };

  return (
    <div className="co-modal-overlay">
      <div className="co-modal-content" onClick={e => e.stopPropagation()}>
        <button className="co-modal-close" onClick={onClose}><X size={20} /></button>

        {success ? (
          <div className="co-modal-success">
            <div className="co-modal-success-icon">✨</div>
            <h2>Order Placed Successfully!</h2>
            <p>Thank you for shopping with Giftora. Your order has been sent to our premium vendors for assembly.</p>
            <div className="co-modal-success-actions">
              <button className="co-modal-btn co-modal-btn--gold" onClick={() => closeAndNavigate('/customer/orders')}>
                View My Orders
              </button>
              <button className="co-modal-btn co-modal-btn--outline" onClick={() => closeAndNavigate('/home')}>
                Continue Shopping
              </button>
            </div>
          </div>
        ) : (
          <div className="co-modal-body">
            <div className="co-modal-header">
              <h2>Secure Checkout</h2>
              <p>Review your details and complete the order.</p>
            </div>

            {loadingData ? (
              <div className="co-modal-loading">Loading your details...</div>
            ) : (
              <form onSubmit={handlePlaceOrder} className="co-modal-form">
                
                <div className="co-form-section">
                  <h3>Delivery Details</h3>
                  
                  <div className="co-form-group">
                    <label>
                      <MapPin size={16} /> Delivery Address
                    </label>
                    <textarea 
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Enter full delivery address"
                      rows="3"
                      required
                    ></textarea>
                  </div>

                  <div className="co-form-group">
                    <label>
                      <Phone size={16} /> Mobile Number
                    </label>
                    <input 
                      type="tel"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      placeholder="e.g. +94 77 123 4567"
                      required
                    />
                  </div>
                </div>

                <div className="co-form-section">
                  <h3>Payment Method</h3>
                  <div className="co-payment-methods">
                    <label className={`co-payment-option ${paymentMethod === 'card' ? 'selected' : ''}`}>
                      <input 
                        type="radio" 
                        name="payment" 
                        value="card"
                        checked={paymentMethod === 'card'}
                        onChange={() => setPaymentMethod('card')}
                      />
                      <CreditCard size={20} />
                      <span>Credit/Debit Card</span>
                    </label>

                    <label className={`co-payment-option ${paymentMethod === 'cash' ? 'selected' : ''}`}>
                      <input 
                        type="radio" 
                        name="payment" 
                        value="cash"
                        checked={paymentMethod === 'cash'}
                        onChange={() => setPaymentMethod('cash')}
                      />
                      <Banknote size={20} />
                      <span>Cash on Delivery</span>
                    </label>

                    <label className={`co-payment-option ${paymentMethod === 'paypal' ? 'selected' : ''}`}>
                      <input 
                        type="radio" 
                        name="payment" 
                        value="paypal"
                        checked={paymentMethod === 'paypal'}
                        onChange={() => setPaymentMethod('paypal')}
                      />
                      <ShieldCheck size={20} />
                      <span>PayPal</span>
                    </label>
                  </div>
                </div>

                {error && <div className="co-modal-error">{error}</div>}

                <div className="co-modal-footer">
                  <button type="button" className="co-modal-btn-cancel" onClick={onClose}>
                    Cancel
                  </button>
                  <button type="submit" className="co-modal-btn co-modal-btn--gold" disabled={submitting}>
                    {submitting ? 'Processing...' : 'Confirm Order'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutModal;
