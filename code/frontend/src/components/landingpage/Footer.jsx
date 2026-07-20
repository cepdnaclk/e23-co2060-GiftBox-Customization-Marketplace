import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const navigate = useNavigate();

  const FOOTER_COLS = [
    { heading: 'Shop',    links: [
      { label: 'Gift Bundles', path: '/products' },
      { label: 'Build a Box', path: '/build-box' },
      { label: 'Featured', path: '/products' },
      { label: 'New Arrivals', path: '/products' }
    ]},
    { heading: 'Vendors', links: [
      { label: 'Join Giftora', path: '/vendor-register' },
      { label: 'Vendor Login', path: '/login' },
      { label: 'Guidelines', path: '/vendor-landing' },
      { label: 'Benefits', path: '/vendor-landing' }
    ]},
    { heading: 'Support', links: [
      { label: 'Help Center', path: '/about-us' },
      { label: 'Order Tracking', path: '/customer/orders' },
      { label: 'Returns', path: '/about-us' },
      { label: 'Contact Us', path: '/about-us' }
    ]},
  ];

  return (
    <footer className="giftora-footer">
      <div className="footer-inner">

        {/* Brand column */}
        <div className="footer-brand">
          <div className="footer-logo" onClick={() => navigate('/')}>
            <span className="footer-logo__icon">🎁</span>
            <span className="footer-logo__text">Giftora</span>
          </div>
          <p className="footer-tagline">
            Sri Lanka's premium gift marketplace — curating joy since 2023.
          </p>
          <div className="footer-socials">
            {['Instagram', 'Facebook', 'TikTok'].map(s => (
              <button key={s} className="social-btn" title={s}>{s[0]}</button>
            ))}
          </div>
        </div>

        {/* Link columns */}
        <div className="footer-links">
          {FOOTER_COLS.map(col => (
            <div key={col.heading} className="footer-col">
              <div className="footer-col__heading">{col.heading}</div>
              {col.links.map(link => (
                <button 
                  key={link.label} 
                  className="footer-col__link"
                  onClick={() => navigate(link.path)}
                >
                  {link.label}
                </button>
              ))}
            </div>
          ))}
        </div>

      </div>

      <div className="footer-bottom">
        <span>© 2025 Giftora. All rights reserved.</span>
        <span>Made with 💛 in Sri Lanka</span>
      </div>
    </footer>
  );
};

export default Footer;