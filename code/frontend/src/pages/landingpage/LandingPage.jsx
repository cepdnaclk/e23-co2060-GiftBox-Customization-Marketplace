// Core libraries and routing
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';

// Layout components
import Header from '../../components/landingpage/Header';
import Footer from '../../components/landingpage/Footer';

// Cart context
import { useCart } from '../../context/CartContext';

// Stylesheet
import './LandingPage.css';
import './ProductsPage.css'; // For Quick View modal styles
import landingPage1Img from '../../assets/landingpage/landing_page_1.png';
import landingPage2Img from '../../assets/landingpage/landing_page_2.png';

// ─── Data ────────────────────────────────────────────────────────────────────

const FEATURES = [
  { icon: '🎨', title: 'Fully Custom',   desc: 'Build your own box from scratch' },
  { icon: '🚀', title: 'Fast Delivery',  desc: 'Same day delivery available'     },
  { icon: '💝', title: 'Luxury Packing', desc: 'Premium gift wrapping included'  },
];

const TESTIMONIALS = [
  { name: 'Priya M.',       location: 'Colombo',   quote: 'Absolutely stunning gift box. My friend was in tears — the packaging alone felt like unwrapping a treasure.',    stars: 5, initial: 'P' },
  { name: 'Roshan S.',      location: 'Kandy',     quote: 'Ordered a corporate hamper for our team. Arrived on time, perfectly curated, and the branding touch was elite.', stars: 5, initial: 'R' },
  { name: 'Anika de Silva', location: 'Galle',     quote: 'Build-your-own feature is genius. I mixed chocolates, flowers, and spa items — came out like a luxury boutique box.',  stars: 5, initial: 'A' },
  { name: 'Dinesh K.',      location: 'Negombo',   quote: "Third time ordering — never disappointed. Giftora has ruined every other gift shop for me. The gold ribbon is *chef's kiss*.",  stars: 5, initial: 'D' },
];

const STATS = [
  { value: '2,800+', label: 'Happy Customers' },
  { value: '150+',   label: 'Local Vendors'   },
  { value: '10K+',   label: 'Gifts Delivered' },
];

// ─── NEW DATA ─────────────────────────────────────────────────────────────────

const PROMOTIONS = [
  {
    id: 1,
    badge: '🔥 Limited Time',
    headline: '20% OFF Sitewide',
    desc: 'This weekend only — use code GIFTLOVE at checkout',
    expiry: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    cta: 'Shop Now',
    gradient: 'linear-gradient(135deg, #C9A961 0%, #D4AF37 100%)',
    accent: '#fff8e8',
    route: '/products',
  },
  {
    id: 2,
    badge: '🌸 Seasonal',
    headline: "Avurudu Gift Collection",
    desc: 'Celebrate the New Year with curated traditional hampers',
    expiry: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
    cta: 'Explore',
    gradient: 'linear-gradient(135deg, #5DADE2 0%, #2E86C1 100%)',
    accent: '#e8f6ff',
    route: '/products?category=Chocolates',
  },
  {
    id: 3,
    badge: '✨ Just Arrived',
    headline: 'New Arrivals This Week',
    desc: 'Fresh picks from our local vendors — first to love them',
    expiry: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    cta: 'Discover',
    gradient: 'linear-gradient(135deg, #1A1A2E 0%, #C9A961 100%)',
    accent: '#f5f0e8',
    route: '/products',
  },
];

const SHOWCASE_BOXES = [
  {
    id: 1,
    name: 'Romantic Bliss Box',
    brand: 'Giftora Exclusive',
    desc: 'A carefully curated collection of romance-sparking treasures — from velvety chocolates to delicate florals, wrapped in signature gold ribbon.',
    price: 'LKR 6,800',
    rating: 4.9,
    reviews: 128,
    items: [
      { icon: '🍫', label: 'Artisan Chocolates' },
      { icon: '🌹', label: 'Red Roses' },
      { icon: '🕯️', label: 'Scented Candle' },
      { icon: '🎀', label: 'Silk Gold Ribbon' },
      { icon: '💌', label: 'Love Note Card' },
    ],
    image: '/boxes/romantic_bliss_box.png',
    accent: '#C9A961',
    tag: 'Best Seller',
  },
  {
    id: 2,
    name: 'Birthday Spectacular',
    brand: 'Giftora Exclusive',
    desc: 'Every birthday deserves extraordinary. Packed with gourmet treats, personalised keepsakes, and a burst of colour that says: you matter.',
    price: 'LKR 4,500',
    rating: 4.8,
    reviews: 214,
    items: [
      { icon: '🎂', label: 'Mini Birthday Cake' },
      { icon: '🎉', label: 'Party Crackers' },
      { icon: '🍬', label: 'Assorted Gummies' },
      { icon: '🎈', label: 'Balloon Kit' },
      { icon: '🍪', label: 'Macarons' },
    ],
    image: '/boxes/birthday_box.png',
    accent: '#C9A961',
    tag: 'Most Popular',
  },
  {
    id: 3,
    name: 'Corporate Prestige Hamper',
    brand: 'Giftora Exclusive',
    desc: 'Make a powerful first impression. Thoughtfully assembled premium items that reflect your company\'s values and deep appreciation for people.',
    price: 'LKR 12,500',
    rating: 5.0,
    reviews: 89,
    items: [
      { icon: '🍷', label: 'Premium Wine' },
      { icon: '🧀', label: 'Imported Cheese' },
      { icon: '📓', label: 'Branded Notebook' },
      { icon: '☕', label: 'Artisan Coffee' },
      { icon: '🖊️', label: 'Gold Pen' },
    ],
    image: '/boxes/corporate_box.png',
    accent: '#D4AF37',
    tag: 'Corporate',
  },
  {
    id: 4,
    name: 'Self-Care Sanctuary',
    brand: 'Giftora Exclusive',
    desc: 'Because she deserves a day just for herself. Luxurious bath, skin, and wellness essentials wrapped in our signature pastel palette.',
    price: 'LKR 7,200',
    rating: 4.9,
    reviews: 176,
    items: [
      { icon: '🛁', label: 'Bath Bombs' },
      { icon: '🧖', label: 'Face Mask Set' },
      { icon: '🧴', label: 'Body Butter' },
      { icon: '🍵', label: 'Herbal Tea' },
      { icon: '😌', label: 'Eye Pillow' },
    ],
    image: '/boxes/selfcare_box.png',
    accent: '#E8C97A',
    tag: 'For Her',
  },
];

const VALUE_STATS = [
  { num: 2800, suffix: '+', label: 'Happy Customers',  desc: 'Smiles delivered island-wide',       icon: '😊' },
  { num: 150,  suffix: '+', label: 'Local Vendors',    desc: 'Trusted Sri Lankan makers & brands', icon: '🏪' },
  { num: 10000,suffix: '+', label: 'Gifts Delivered',  desc: 'Memories created, one box at a time',icon: '📦' },
];

// ─── Occasion Selector Data ───────────────────────────────────────────────────
const OCCASIONS = [
  {
    id: 'avurudu',
    label: 'Avurudu',
    icon: '🌺',
    accentColor: 'cyan',
    starterBoxId: 'avurudu-box',
    popularityTag: 'Seasonal Special',
    featured: true,
  },
  {
    id: 'birthday',
    label: 'Birthday',
    icon: '🎂',
    accentColor: 'gold',
    starterBoxId: 'birthday-box',
    popularityTag: 'Most Picked',
    featured: false,
  },
  {
    id: 'anniversary',
    label: 'Anniversary',
    icon: '💑',
    accentColor: 'gold',
    starterBoxId: 'romantic-box',
    popularityTag: null,
    featured: false,
  },
  {
    id: 'corporate',
    label: 'Corporate',
    icon: '💼',
    accentColor: 'cyan',
    starterBoxId: 'corporate-box',
    popularityTag: null,
    featured: false,
  },
  {
    id: 'wedding',
    label: 'Wedding',
    icon: '💍',
    accentColor: 'gold',
    starterBoxId: 'wedding-box',
    popularityTag: null,
    featured: false,
  },
  {
    id: 'get-well',
    label: 'Get Well',
    icon: '🌸',
    accentColor: 'cyan',
    starterBoxId: 'wellness-box',
    popularityTag: null,
    featured: false,
  },
  {
    id: 'just-because',
    label: 'Just Because',
    icon: '🎁',
    accentColor: 'gold',
    starterBoxId: null,
    popularityTag: null,
    featured: false,
  },
];

// ─── Scroll-reveal hook ───────────────────────────────────────────────────────

function useReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return [ref, visible];
}

// ─── Animated counter hook ────────────────────────────────────────────────────
function useCountUp(target, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

// ─── Countdown Timer ──────────────────────────────────────────────────────────
function CountdownTimer({ expiry }) {
  const [timeLeft, setTimeLeft] = useState({});

  useEffect(() => {
    const calc = () => {
      const diff = expiry - Date.now();
      if (diff <= 0) return setTimeLeft({ d: 0, h: 0, m: 0, s: 0 });
      setTimeLeft({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    calc();
    const iv = setInterval(calc, 1000);
    return () => clearInterval(iv);
  }, [expiry]);

  const pad = n => String(n).padStart(2, '0');

  return (
    <div className="promo-timer">
      <span className="timer-label">Ends in:</span>
      <div className="timer-blocks">
        {timeLeft.d > 0 && <><span className="timer-block">{pad(timeLeft.d)}<span>d</span></span><span className="timer-sep">:</span></>}
        <span className="timer-block">{pad(timeLeft.h)}<span>h</span></span>
        <span className="timer-sep">:</span>
        <span className="timer-block">{pad(timeLeft.m)}<span>m</span></span>
        <span className="timer-sep">:</span>
        <span className="timer-block">{pad(timeLeft.s)}<span>s</span></span>
      </div>
    </div>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

const HeroSection = () => {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [muted, setMuted] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => { setTimeout(() => setMounted(true), 80); }, []);

  const toggleMute = () => {
    setMuted(m => {
      if (videoRef.current) videoRef.current.muted = !m;
      return !m;
    });
  };

  return (
    <section className="hero">
      {/* Video background — falls back to orbs if error */}
      {!videoError && (
        <video
          ref={videoRef}
          className="hero-video"
          autoPlay
          loop
          muted
          playsInline
          onError={() => setVideoError(true)}
          src="https://assets.mixkit.co/videos/preview/mixkit-hands-wrapping-a-gift-2553-large.mp4"
        />
      )}
      <div className="hero-video-overlay" />

      {/* Ambient orbs — always visible, more visible if no video */}
      <div className={`hero-orb hero-orb--gold ${videoError ? 'hero-orb--prominent' : ''}`} />
      <div className={`hero-orb hero-orb--blue ${videoError ? 'hero-orb--prominent' : ''}`} />
      <div className="hero-orb hero-orb--mid" />
      <div className="hero-grain" />

      {/* Mute toggle */}
      {!videoError && (
        <button className="hero-mute-btn" onClick={toggleMute} title={muted ? 'Unmute' : 'Mute'}>
          {muted ? '🔇' : '🔊'}
        </button>
      )}

      <div className={`hero__inner ${mounted ? 'hero--mounted' : ''}`}>
        {/* ── Left content ── */}
        <div className="hero__content">
          <div className="hero__eyebrow">
            <span className="eyebrow-dot" />
            <span>Sri Lanka's #1 Gift Marketplace</span>
          </div>

          <h1 className="hero__title">
            Curate the <br />
            <span className="hero__title-accent">Perfect Gift</span>
          </h1>

          <p className="hero__subtitle">
            Choose items from multiple vendors and we'll hand-pack them into one
            luxury gift box — delivered with love, island-wide.
          </p>

          <div className="hero__cta-group">
            <button className="btn-hero-primary" onClick={() => navigate('/build-box')}>
              <span className="btn-icon">🎁</span>
              <span>Start Customizing</span>
              <span className="btn-arrow">→</span>
            </button>
            <button className="btn-hero-secondary" onClick={() => navigate('/products')}>
              Browse Gifts
            </button>
          </div>

          <div className="hero__stats">
            {STATS.map((s, i) => (
              <div className="hero__stat" key={i}>
                <div className="hero__stat-value">{s.value}</div>
                <div className="hero__stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right cards ── */}
        <div className="hero__cards">
          {FEATURES.map((f, i) => (
            <button key={i} className="hero__feature-card" style={{ animationDelay: `${0.1 + i * 0.12}s` }}>
              <div className="hero__feature-icon">{f.icon}</div>
              <div className="hero__feature-body">
                <div className="hero__feature-title">{f.title}</div>
                <div className="hero__feature-desc">{f.desc}</div>
              </div>
              <span className="hero__feature-arrow">→</span>
            </button>
          ))}

          <div className="hero__vendor-card">
            <div className="vendor-card__glow" />
            <div className="hero__vendor-icon">🏪</div>
            <div className="hero__vendor-title">Are you a Vendor?</div>
            <div className="hero__vendor-desc">
              Join our marketplace and reach thousands of customers island-wide.
            </div>
            <button className="btn-vendor-join" onClick={() => navigate('/vendor-landing')}>
              Join With Us →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

// ─── Marquee trust bar ────────────────────────────────────────────────────────

const TrustBar = () => {
  const brands = ['✦ Choco Heaven', '✦ Flower Paradise', '✦ Glow & Bloom', '✦ Sweet Delights', '✦ Gift Gallery', '✦ Cellar Select', '✦ Pure & Glow', '✦ Blossom Co.'];
  return (
    <div className="trust-bar">
      <div className="trust-bar__label">Trusted Vendors</div>
      <div className="marquee-wrapper">
        <div className="marquee-track">
          {[...brands, ...brands].map((b, i) => (
            <span key={i} className="marquee-item">{b}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── NEW: Promotions & Seasonal Specials Banner ───────────────────────────────

const PromoBanner = () => {
  const navigate = useNavigate();
  const [active, setActive] = useState(0);
  const [ref, visible] = useReveal(0.1);

  // Auto-rotate every 4 seconds
  useEffect(() => {
    const iv = setInterval(() => {
      setActive(a => (a + 1) % PROMOTIONS.length);
    }, 4000);
    return () => clearInterval(iv);
  }, []);

  return (
    <section className={`promo-banner section-reveal ${visible ? 'visible' : ''}`} ref={ref}>
      <div className="promo-track-wrapper">
        <div className="promo-track" style={{ transform: `translateX(-${active * 100}%)` }}>
          {PROMOTIONS.map((p, i) => (
            <div key={p.id} className="promo-card" style={{ '--promo-gradient': p.gradient }}>
              <div className="promo-card__bg" />
              <div className="promo-card__content">
                <span className="promo-badge">{p.badge}</span>
                <h3 className="promo-headline">{p.headline}</h3>
                <p className="promo-desc">{p.desc}</p>
                <CountdownTimer expiry={p.expiry} />
                <button className="promo-cta" onClick={() => navigate(p.route)}>
                  {p.cta} →
                </button>
              </div>
              <div className="promo-card__deco">
                <div className="promo-deco-ring promo-deco-ring--1" />
                <div className="promo-deco-ring promo-deco-ring--2" />
                <div className="promo-deco-ring promo-deco-ring--3" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation dots */}
      <div className="promo-dots">
        {PROMOTIONS.map((_, i) => (
          <button
            key={i}
            className={`promo-dot ${active === i ? 'active' : ''}`}
            onClick={() => setActive(i)}
          />
        ))}
      </div>
    </section>
  );
};

// ─── Occasion Selector ────────────────────────────────────────────────────────

const OccasionTile = ({ occasion, onSelect, isLoading }) => {
  const accent = occasion.accentColor === 'cyan' ? 'var(--cyan)' : 'var(--gold)';
  return (
    <button
      className={[
        'occasion-tile',
        occasion.featured      ? 'occasion-tile--featured' : '',
        isLoading              ? 'occasion-tile--loading'  : '',
      ].join(' ')}
      onClick={() => onSelect(occasion)}
      aria-label={`${occasion.label}, starter box`}
      style={{ '--ot-accent': accent }}
    >
      {/* Popularity / seasonal ribbon */}
      {occasion.popularityTag && (
        <span className="occasion-tile__tag">{occasion.popularityTag}</span>
      )}

      {/* Ambient orb (reuses category-tile pattern) */}
      <div className="occasion-tile__orb" />

      {/* Icon — shows spinner ring while loading */}
      <div className="occasion-tile__icon-wrap">
        <span className="occasion-tile__icon">{occasion.icon}</span>
        {isLoading && <span className="occasion-tile__spinner" />}
      </div>

      <span className="occasion-tile__label">{occasion.label}</span>
    </button>
  );
};

const OccasionToast = ({ message, visible }) => (
  <div
    className={`occasion-toast ${visible ? 'occasion-toast--visible' : ''}`}
    role="status"
    aria-live="polite"
  >
    <span className="occasion-toast__check">✓</span>
    <span className="occasion-toast__msg">{message}</span>
  </div>
);

const OccasionSelector = () => {
  const navigate = useNavigate();
  const [ref, visible] = useReveal(0.1);
  const [loadingId, setLoadingId]   = useState(null);
  const [toast, setToast]           = useState({ visible: false, message: '' });
  const toastTimer = useRef(null);

  const handleSelect = useCallback((occasion) => {
    if (loadingId) return;              // block double-tap
    setLoadingId(occasion.id);

    const msg = occasion.starterBoxId
      ? `Added a ${occasion.label} starter box — customize anything below.`
      : `Opening the builder for ${occasion.label}...`;

    // Show toast immediately
    setToast({ visible: true, message: msg });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() =>
      setToast(t => ({ ...t, visible: false })), 4000);

    // Navigate after brief confirmation pause
    setTimeout(() => {
      const params = new URLSearchParams();
      params.set('occasion', occasion.id);
      if (occasion.starterBoxId) params.set('starter', occasion.starterBoxId);
      navigate(`/build-box?${params.toString()}`);
      setLoadingId(null);
    }, 600);
  }, [loadingId, navigate]);

  // Clean up timer on unmount
  useEffect(() => () => clearTimeout(toastTimer.current), []);

  return (
    <section
      className={`occasion-strip section-reveal ${visible ? 'visible' : ''}`}
      ref={ref}
    >
      <div className="section-inner">
        <div className="occasion-strip__header">
          <div className="section-label center">Start With a Moment</div>
          <h2 className="occasion-strip__title">What's the Occasion?</h2>
          <p className="occasion-strip__sub">
            Pick an occasion and we'll pre-fill your builder with a curated starting point.
          </p>
        </div>

        <div className="occasion-strip__grid" role="group" aria-label="Choose an occasion">
          {OCCASIONS.map(occ => (
            <OccasionTile
              key={occ.id}
              occasion={occ}
              onSelect={handleSelect}
              isLoading={loadingId === occ.id}
            />
          ))}
        </div>
      </div>

      {/* Toast — polite screen-reader announcement + visual confirmation */}
      <OccasionToast message={toast.message} visible={toast.visible} />
    </section>
  );
};

// ─── Gift Box Showcase ─────────────────────────────

const GiftBoxShowcase = () => {
  const navigate = useNavigate();
  const [active, setActive] = useState(0);
  const [imgFading, setImgFading] = useState(false);
  const [ref, visible] = useReveal(0.08);
  const timerRef = useRef(null);

  const switchTo = useCallback((idx) => {
    if (idx === active) return;
    setImgFading(true);
    setTimeout(() => {
      setActive(idx);
      setImgFading(false);
    }, 280);
  }, [active]);

  const resetTimer = (idx) => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActive(a => (a + 1) % SHOWCASE_BOXES.length);
    }, 6000);
    switchTo(idx);
  };

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setActive(a => {
        const next = (a + 1) % SHOWCASE_BOXES.length;
        setImgFading(true);
        setTimeout(() => setImgFading(false), 280);
        return next;
      });
    }, 6000);
    return () => clearInterval(timerRef.current);
  }, []);

  const box = SHOWCASE_BOXES[active];
  const stars = Math.round(box.rating);

  return (
    <section
      className={`scv2 section-reveal ${visible ? 'visible' : ''}`}
      ref={ref}
      style={{ '--box-accent': box.accent }}
    >
      {/* Section header */}
      <div className="scv2__header section-inner">
        <div className="section-label">Curated Collections</div>
        <h2 className="scv2__title">Gift Box Showcase</h2>
      </div>

      {/* 3-column layout */}
      <div className="scv2__stage">

        {/* ── LEFT: Details panel ── */}
        <div className="scv2__left">
          <div className="scv2__brand" style={{ color: box.accent }}>
            {box.brand}
          </div>

          <h2 className="scv2__box-name" style={{ color: box.accent }}>
            {box.name}
          </h2>

          <p className="scv2__desc">{box.desc}</p>

          {/* Star rating */}
          <div className="scv2__rating">
            <span className="scv2__stars">
              {Array.from({ length: 5 }, (_, i) => (
                <span key={i} style={{ color: i < stars ? box.accent : 'rgba(255,255,255,0.2)' }}>★</span>
              ))}
            </span>
            <span className="scv2__rating-num" style={{ color: box.accent }}>
              {box.rating}
            </span>
            <span className="scv2__rating-count">({box.reviews} reviews)</span>
          </div>

          {/* Items in box */}
          <div className="scv2__items-title">What's inside:</div>
          <ul className="scv2__items">
            {box.items.map((item, i) => (
              <li key={i} className="scv2__item">
                <span className="scv2__item-icon">{item.icon}</span>
                <span className="scv2__item-label">{item.label}</span>
              </li>
            ))}
          </ul>

          {/* Price */}
          <div className="scv2__price" style={{ color: box.accent }}>
            {box.price}
          </div>

          {/* CTA */}
          <button
            className="scv2__build-btn"
            style={{ background: `linear-gradient(135deg, ${box.accent} 0%, #D4AF37 100%)` }}
            onClick={() => navigate('/build-box')}
          >
            <span>Build Now</span>
            <span className="scv2__btn-arrow">→</span>
          </button>
        </div>

        {/* ── CENTER: Large image ── */}
        <div className="scv2__center">
          {/* Corner brackets */}
          <span className="scv2__corner scv2__corner--tl" style={{ borderColor: box.accent }} />
          <span className="scv2__corner scv2__corner--tr" style={{ borderColor: box.accent }} />
          <span className="scv2__corner scv2__corner--bl" style={{ borderColor: box.accent }} />
          <span className="scv2__corner scv2__corner--br" style={{ borderColor: box.accent }} />

          {/* Glow behind image */}
          <div className="scv2__img-glow" style={{ background: `radial-gradient(circle at 50% 60%, ${box.accent}22 0%, transparent 70%)` }} />

          {/* The box image */}
          <img
            key={active}
            src={box.image}
            alt={box.name}
            className={`scv2__img ${imgFading ? 'scv2__img--fade' : ''}`}
          />

          {/* Tag badge */}
          <div className="scv2__tag-badge" style={{ background: box.accent }}>
            {box.tag}
          </div>
        </div>

        {/* ── RIGHT: Thumbnail strip ── */}
        <div className="scv2__right">
          <div className="scv2__thumbs">
            {SHOWCASE_BOXES.map((b, i) => (
              <button
                key={b.id}
                className={`scv2__thumb ${active === i ? 'scv2__thumb--active' : ''}`}
                onClick={() => resetTimer(i)}
                style={{ '--t-accent': b.accent }}
              >
                <img src={b.image} alt={b.name} className="scv2__thumb-img" />
                <span className="scv2__thumb-name">{b.name}</span>
              </button>
            ))}
          </div>

          {/* Dot indicators */}
          <div className="scv2__dots">
            {SHOWCASE_BOXES.map((_, i) => (
              <button
                key={i}
                className={`scv2__dot ${active === i ? 'scv2__dot--active' : ''}`}
                onClick={() => resetTimer(i)}
                style={active === i ? { background: box.accent } : {}}
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

// ─── Featured Products (masonry-style) ───────────────────────────────────────

const FeaturedProducts = () => {
  const navigate = useNavigate();
  const [ref, visible] = useReveal();
  const [hovered, setHovered] = useState(null);
  const [dbProducts, setDbProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/products`)
      .then(response => response.json())
      .then(data => {
        setDbProducts(data.slice(0, 6));
        setLoading(false);
      })
      .catch(error => {
        console.error('FETCH ERROR:', error.message);
        setLoading(false);
      });
  }, []);

  return (
    <section className={`featured section-reveal ${visible ? 'visible' : ''}`} ref={ref}>
      <div className="section-inner">
        <div className="featured__header">
          <div>
            <div className="section-label">Curated Picks</div>
            <h2 className="section-title left">🔥 Featured Gifts</h2>
          </div>
          <button className="btn-view-all" onClick={() => navigate('/products')}>
            View All Collection →
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px', color: 'var(--gold)' }}>
            Loading premium gifts...
          </div>
        ) : (
          <div className="featured__grid">
            {dbProducts.map((p, i) => (
              <div
                key={p.id}
                className={`product-card ${i === 0 || i === 5 ? 'product-card--tall' : ''}`}
                onMouseEnter={() => setHovered(p.id)}
                onMouseLeave={() => setHovered(null)}
                style={{ animationDelay: `${i * 0.09}s` }}
              >
                <div className="product-card__image">
                  <img src={p.imageUrl} alt={p.name} className="featured-product-image" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div className="product-card__hover-actions">
                    <button className="product-action-btn">🛒 Add to Cart</button>
                    <button className="product-action-btn product-action-btn--outline">Quick View</button>
                  </div>
                </div>
                <div className="product-card__body">
                  <span className="product-card__tag">Premium</span>
                  <div className="product-card__name">{p.name}</div>
                  <div className="product-card__vendor">by Giftora Exclusive</div>
                  <div className="product-card__meta">
                    <span className="product-card__stars">
                      ★★★★★
                      <span className="product-card__rating-text">5.0 (New)</span>
                    </span>
                  </div>
                  <div className="product-card__footer">
                    <span className="product-card__price">LKR {p.price.toLocaleString()}</span>
                    <button className="btn-add-cart" title="Add to cart">+</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

const CATEGORY_MAP = {
  1: 'Drinks & Beverages', 2: 'Watches', 3: 'Perfume & Fragrance', 
  4: 'Teddy Bears & Plushes', 5: 'Jewelry & Accessories', 6: 'Chocolates & Sweets',
  7: "Men's Watches", 8: "Ladies' Watches", 9: "Minimalist Watches",
  10: "Premium Truffles", 11: "Bakery & Cookies", 12: "Macarons & Cupcakes",
  13: "Men's Fragrances", 14: "Ladies' Perfumes",
  15: "Plush Toys", 16: "Newborn Plushes",
  17: "Bangles & Bracelets", 18: "Necklaces & Pendants", 19: "Earrings",
  20: "Non-Alcoholic Wines", 21: "Gourmet Coffee & Teas",
  22: "Self-Care & Wellness", 23: "Scented Candles", 24: "Organic Soaps & Bath", 25: "Lotions & Skincare",
  26: "Gift Boxes & Packaging", 27: "Wooden Keepsake Boxes", 28: "Magnetic Cardboard Boxes", 29: "Velvet Gift Boxes",
  30: "Flowers & Botanicals", 31: "Fresh Flowers", 32: "Preserved & Dried Flowers", 33: "Mini Succulents"
};

const CAT_ICONS = { 
  All: '🛍️', 
  'Drinks & Beverages': '🍷', Watches: '⌚', 'Perfume & Fragrance': '🌸', 
  'Teddy Bears & Plushes': '🧸', 'Jewelry & Accessories': '💍', 'Chocolates & Sweets': '🍫',
  "Men's Watches": '⌚', "Ladies' Watches": '⌚', "Minimalist Watches": '⌚',
  "Premium Truffles": '🍫', "Bakery & Cookies": '🍪', "Macarons & Cupcakes": '🧁',
  "Men's Fragrances": '🌸', "Ladies' Perfumes": '🌸',
  "Plush Toys": '🧸', "Newborn Plushes": '🧸',
  "Bangles & Bracelets": '💍', "Necklaces & Pendants": '💍', Earrings: '💍',
  "Non-Alcoholic Wines": '🍷', "Gourmet Coffee & Teas": '☕',
  "Self-Care & Wellness": '🧼', "Scented Candles": '🕯️', "Organic Soaps & Bath": '🧼', "Lotions & Skincare": '🧴',
  "Gift Boxes & Packaging": '📦', "Wooden Keepsake Boxes": '📦', "Magnetic Cardboard Boxes": '📦', "Velvet Gift Boxes": '🎁',
  "Flowers & Botanicals": '💐', "Fresh Flowers": '💐', "Preserved & Dried Flowers": '🥀', "Mini Succulents": '🌵'
};

const TrendingGrid = () => {
  const navigate = useNavigate();
  const { addToCart, addedId } = useCart();
  const [ref, visible] = useReveal(0.08);
  const [newProducts, setNewProducts] = useState([]);
  const [hotProducts, setHotProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quickView, setQuickView] = useState(null);

  useEffect(() => {
    const apiBase = process.env.REACT_APP_API_URL || 'https://nexus-backend-axbdfzd2g4c0fwbf.austriaeast-01.azurewebsites.net';
    const fetchNew = fetch(`${apiBase}/api/products/new-arrivals`).then(r => r.ok ? r.json() : Promise.reject());
    const fetchHot = fetch(`${apiBase}/api/products/hot-sellers`).then(r => r.ok ? r.json() : Promise.reject());

    Promise.all([fetchNew, fetchHot])
      .then(([newData, hotData]) => {
        if (Array.isArray(newData) && Array.isArray(hotData)) {
          setNewProducts(newData.slice(0, 8));
          setHotProducts(hotData.slice(0, 8));
          setLoading(false);
        } else {
          throw new Error('Not arrays');
        }
      })
      .catch(() => {
        // Fallback for Azure production database: fetch standard products and sort/slice manually
        fetch(`${apiBase}/api/products`)
          .then(r => r.json())
          .then(data => {
            if (Array.isArray(data)) {
              const activeOnly = data.filter(p => p.isActive === null || p.isActive === 1);
              
              // New Arrivals: sort by id desc, take 8
              const sortedNew = [...activeOnly].sort((a, b) => b.id - a.id);
              // Best Sellers: sort by rating desc, take 8
              const sortedHot = [...activeOnly].sort((a, b) => (b.rating || 0) - (a.rating || 0));

              setNewProducts(sortedNew.slice(0, 8));
              setHotProducts(sortedHot.slice(0, 8));
            } else {
              setNewProducts([]);
              setHotProducts([]);
            }
            setLoading(false);
          })
          .catch(() => {
            setNewProducts([]);
            setHotProducts([]);
            setLoading(false);
          });
      });
  }, []);

  const renderGrid = (items, ribbonText) => (
    <div className="trending-grid">
      {items.map((p, i) => {
        const rating = p.rating ? Number(p.rating).toFixed(1) : '5.0';
        const stars = Math.round(Number(rating));
        return (
          <div
            key={p.id}
            className="t-card"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            {/* Corner Ribbon */}
            <div className="t-card__ribbon">{ribbonText}</div>

            {/* Image */}
            <div className="t-card__image">
              <img src={p.imageUrl} alt={p.name} className="trending-product-image" loading="lazy" />
              {/* Quick View overlay */}
              <div className="t-card__overlay" onClick={() => setQuickView(p)}>
                <span className="t-card__qv-btn">Quick View</span>
              </div>
            </div>

            {/* Body */}
            <div className="t-card__body">
              <span className="t-card__category">
                {CATEGORY_MAP[p.categoryId] || 'Gift Item'}
              </span>
              <div className="t-card__name">{p.name}</div>
              
              {/* Star rating */}
              <div className="t-card__stars">
                {Array.from({ length: 5 }, (_, idx) => (
                  <span key={idx} style={{ color: idx < stars ? 'var(--gold)' : 'rgba(0,0,0,0.15)' }}>★</span>
                ))}
                <span>{rating}</span>
              </div>

              {/* Price & Add to Cart Row */}
              <div className="t-card__footer-row">
                <div className="t-card__price">LKR {Number(p.price).toLocaleString()}</div>
                <button
                  className="t-card__cart-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart(p);
                  }}
                  style={{
                    background: addedId === p.id ? 'var(--navy)' : 'transparent',
                    color: addedId === p.id ? 'var(--gold)' : 'var(--navy)',
                    borderColor: addedId === p.id ? 'var(--gold)' : 'rgba(0,0,0,0.12)'
                  }}
                  title="Add to cart"
                >
                  {addedId === p.id ? '✓' : '🛒'}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <section className={`trending section-reveal ${visible ? 'visible' : ''}`} ref={ref}>
      <div className="section-inner">
        
        {/* ── SECTION 1: New Arrivals ── */}
        <div className="trending__section">
          <div className="trending__section-header">
            <div className="section-label center">Gifts & Items</div>
            <h2 className="trending__section-title">New Arrivals</h2>
            <p className="trending__section-sub">Newly landed products on our store right now. Be the first to get yours!</p>
          </div>

          {loading ? (
            <div className="trending-skeleton">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="trending-skeleton__card">
                  <div className="trending-skeleton__img" />
                  <div className="trending-skeleton__line trending-skeleton__line--short" />
                  <div className="trending-skeleton__line" />
                </div>
              ))}
            </div>
          ) : newProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--muted)' }}>
              No new arrivals available at the moment.
            </div>
          ) : (
            renderGrid(newProducts, 'New Arrival')
          )}
        </div>

        {/* Divider */}
        <div style={{ height: '60px' }} />

        {/* ── SECTION 2: Best Sellers ── */}
        <div className="trending__section">
          <div className="trending__section-header">
            <div className="section-label center">Most Loved</div>
            <h2 className="trending__section-title">Best Sellers</h2>
            <p className="trending__section-sub">The best selling products on our store right now. Check out what is hot!</p>
          </div>

          {loading ? (
            <div className="trending-skeleton">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="trending-skeleton__card">
                  <div className="trending-skeleton__img" />
                  <div className="trending-skeleton__line trending-skeleton__line--short" />
                  <div className="trending-skeleton__line" />
                </div>
              ))}
            </div>
          ) : hotProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--muted)' }}>
              No best sellers available at the moment.
            </div>
          ) : (
            renderGrid(hotProducts, 'Best Seller')
          )}
        </div>

        {/* Explore All Products Button */}
        <div style={{ textAlign: 'center', marginTop: '60px' }}>
          <button className="btn-hero-primary large" onClick={() => navigate('/products')}>
            <span>Explore All Products</span>
            <span className="btn-arrow">→</span>
          </button>
        </div>

      </div>

      {/* Quick View Modal */}
      {quickView && createPortal(
        <div className="qv-backdrop" onClick={() => setQuickView(null)}>
          <div className="qv-modal" onClick={e => e.stopPropagation()}>
            <button className="qv-close" onClick={() => setQuickView(null)}>✕</button>
            <div className="qv-img-side">
              <img src={quickView.imageUrl} alt={quickView.name} />
              <div className="qv-img-grad" />
            </div>
            <div className="qv-info-side">
              <div className="qv-cat-tag">
                {CAT_ICONS[CATEGORY_MAP[quickView.categoryId]] || '🎁'} {CATEGORY_MAP[quickView.categoryId] || 'Gift'}
              </div>
              <h3 className="qv-name">{quickView.name}</h3>
              <div className="qv-stars-row">★★★★★ <span>5.0 · Premium Quality</span></div>
              <div className="qv-price">LKR {Number(quickView.price).toLocaleString()}</div>
              <div className="qv-sep" />
              <p className="qv-desc">{quickView.description || "A premium curated gift from Giftora's exclusive collection. Hand-packed with love, beautifully presented, and ready to create a lasting memory."}</p>
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
                <button className="qv-cta qv-cta--outline" onClick={() => { setQuickView(null); navigate('/products'); }}>View All →</button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </section>
  );
};

// ─── Why Giftora — Value Props Strip ────────────────────────────────────

const StatCounter = ({ num, suffix, start }) => {
  const count = useCountUp(num, 2000, start);
  return <>{count.toLocaleString()}{suffix}</>;
};

const WhyGiftora = () => {
  const [ref, visible] = useReveal(0.2);

  return (
    <section className={`why-giftora section-reveal ${visible ? 'visible' : ''}`} ref={ref}>
      <div className="why-giftora__bg" />
      <div className="section-inner">
        <div className="section-label center">Why Choose Us</div>
        <h2 className="section-title center">The Giftora Difference</h2>
        <p className="section-subtitle">Numbers that speak louder than words</p>

        <div className="why-giftora__grid">
          {VALUE_STATS.map((s, i) => (
            <div key={i} className="why-card" style={{ animationDelay: `${i * 0.15}s` }}>
              <div className="why-card__glow" />
              <div className="why-card__icon">{s.icon}</div>
              <div className="why-card__number">
                <StatCounter num={s.num} suffix={s.suffix} start={visible} />
              </div>
              <div className="why-card__label">{s.label}</div>
              <div className="why-card__desc">{s.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── Testimonials ─────────────────────────────────────────────────────────────

const Testimonials = () => {
  const [ref, visible] = useReveal();
  return (
    <section className={`testimonials section-reveal ${visible ? 'visible' : ''}`} ref={ref}>
      <div className="testimonials__bg" />
      <div className="section-inner">
        <div className="section-label center">Love Notes</div>
        <h2 className="section-title center" style={{ fontSize: '50px'}}>What Our Customers Say</h2>

        <div className="testimonials__grid">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="testimonial-card" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="testimonial-card__quote-icon">"</div>
              <p className="testimonial-card__text">{t.quote}</p>
              <div className="testimonial-card__stars">{'★'.repeat(t.stars)}</div>
              <div className="testimonial-card__author">
                <div className="testimonial-card__avatar">{t.initial}</div>
                <div>
                  <div className="testimonial-card__name">{t.name}</div>
                  <div className="testimonial-card__location">📍 {t.location}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── Gift Builder CTA ─────────────────────────────────────────────────────────

const BuilderCTA = () => {
  const navigate = useNavigate();
  const [ref, visible] = useReveal();
  return (
    <section className={`builder-cta section-reveal ${visible ? 'visible' : ''}`} ref={ref}>
      <div className="builder-cta__orb builder-cta__orb--1" />
      <div className="builder-cta__orb builder-cta__orb--2" />
      <div className="builder-cta__inner">
        <h2 className="builder-cta__title">Design Your Dream Gift Box</h2>
        <p className="builder-cta__desc">
          Mix items from different vendors, add a personal message, choose your ribbon color — then we'll turn it into something unforgettable.
        </p>
        <div className="builder-cta__steps">
          {['Pick Items', 'We Pack', 'They Smile'].map((s, i) => (
            <div key={i} className="builder-step">
              <span className="builder-step__n">{i + 1}</span>
              <span>{s}</span>
            </div>
          ))}
        </div>
        <button className="btn-hero-primary large" onClick={() => navigate('/build')}>
          <span className="btn-icon">✨</span>
          <span>Start Building Now</span>
          <span className="btn-arrow">→</span>
        </button>
      </div>
    </section>
  );
};

// ─── Custom Promotion Banner ───────────────────────────

const CustomPromotionBanner = () => {
  const navigate = useNavigate();
  const [ref, visible] = useReveal(0.1);

  return (
    <section className={`custom-promo section-reveal ${visible ? 'visible' : ''}`} ref={ref}>
      <div className="custom-promo__inner">
        <div className="custom-promo__content">
          <h2 className="custom-promo__title">Curate</h2>
          <h3 className="custom-promo__subtitle">your masterpiece</h3>
          <p className="custom-promo__desc">
            Mix and match premium items from multiple vendors to build an unforgettable gift box.
          </p>
          <button className="btn-hero-primary large" onClick={() => navigate('/build-box')}>
            <span>Build your own box</span>
            <span className="btn-arrow">→</span>
          </button>
        </div>
        <div className="custom-promo__image-wrapper">
          <img src={landingPage1Img} alt="Gift Customization" className="custom-promo__image promo-curate-img" />
        </div>
      </div>
    </section>
  );
};

const CustomHowItWorks = () => {
  const [ref, visible] = useReveal(0.1);

  const steps = [
    { title: "Select Your Box", desc: "Choose from our premium packaging options to set the perfect stage." },
    { title: "Handpick the Gifts", desc: "Mix and match items from top local vendors for a unique curation." },
    { title: "Add a Personal Touch", desc: "Include a heartfelt message and signature gold ribbon." },
    { title: "Delivered with Care", desc: "We assemble and deliver it straight to your loved one's door." },
  ];

  return (
    <section className={`custom-promo custom-promo--reversed section-reveal ${visible ? 'visible' : ''}`} ref={ref}>
      <div className="custom-promo__inner">
        <div className="custom-promo__image-wrapper">
          <img src={landingPage2Img} alt="How It Works" className="custom-promo__image promo-how-it-works-img" />
        </div>
        <div className="custom-promo__content">
          <h2 className="custom-promo__title" style={{ fontSize: '64px' }}>How it Works</h2>
          <h3 className="custom-promo__subtitle" style={{ fontSize: '32px' }}>Simple. Elegant. Yours.</h3>
          
          <div className="custom-steps">
            {steps.map((step, i) => (
              <div key={i} className="custom-step">
                <div className="custom-step__number">{i + 1}</div>
                <div className="custom-step__text">
                  <div className="custom-step__title">{step.title}</div>
                  <div className="custom-step__desc">{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

const LandingPage = () => (
  <div className="home-page">
    <Header />
    <main>
      <HeroSection />
      {/* Wrap everything below Hero in a unified light background */}
      <div className="unified-light-bg">
        {/* <OccasionSelector /> */}
        {/* <PromoBanner /> */}
        <CustomPromotionBanner />
        <CustomHowItWorks />
        <GiftBoxShowcase />
        <TrendingGrid />
        {/* <WhyGiftora /> */}
        <Testimonials />
        <BuilderCTA />
      </div>
    </main>
    <Footer />
  </div>
);

export default LandingPage;