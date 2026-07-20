// Core libraries and routing
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './VendorLanding.css';

// Layout components
import Header from '../../components/landingpage/Header';
import Footer from '../../components/landingpage/Footer';

// ─── Data for Vendors ────────────────────────────────────────────────────────

const VENDOR_FEATURES = [
  { icon: '🚀', title: 'Island-wide Reach', desc: 'Instantly get your products in front of thousands of active buyers across Sri Lanka.' },
  { icon: '📦', title: 'We Handle Packing', desc: 'You supply the items, we hand-assemble them into luxury gift boxes with other brands.' },
  { icon: '💸', title: 'Zero Listing Fees', desc: 'No upfront costs. You only pay a small commission when your item successfully sells.' },
];

const VENDOR_STEPS = [
  { icon: '📝', title: 'Apply',       desc: 'Fill out our quick vendor registration form with your business details.' },
  { icon: '🤝', title: 'Approval',    desc: 'Our team reviews your application to ensure premium quality standards.' },
  { icon: '📸', title: 'List Items',  desc: 'Upload your products through our easy-to-use Seller Dashboard.' },
  { icon: '💰', title: 'Get Paid',    desc: 'We sell, we pack, we deliver. You get paid directly to your bank account.' },
];

const VENDOR_TESTIMONIALS = [
  { name: 'Sarah L.',       shop: 'Sweet Delights', quote: 'Joining Giftora changed our bakery. We went from 10 orders a week to 50+ just from people adding our brownies to custom gift boxes!', stars: 5, initial: 'S' },
  { name: 'Malik F.',       shop: 'Glow Candles',   quote: 'The fact that I don’t have to worry about the final luxury packaging or island-wide delivery is a lifesaver. Highly recommended.', stars: 5, initial: 'M' },
  { name: 'Nethmi de Silva',shop: 'Blossom Co.',    quote: 'The dashboard is so easy to use. I can track my inventory and see exactly what is trending right now.', stars: 5, initial: 'N' },
  { name: 'Sarah L.',       shop: 'Sweet Delights', quote: 'Joining Giftora changed our bakery. We went from 10 orders a week to 50+ just from people adding our brownies to custom gift boxes!', stars: 5, initial: 'S' },
];

const VALUE_STATS = [
  { num: 10000, suffix: '+', label: 'Active Customers', desc: 'Looking for the perfect gift daily', icon: '🛍️' },
  { num: 30,    suffix: '%', label: 'Avg. Sales Boost', desc: 'Growth seen by our top vendors', icon: '📈' },
  { num: 0,     suffix: '',  label: 'Listing Fees',     desc: 'Start selling with zero upfront risk', icon: '🛡️' },
];

// ─── Scroll-reveal hook (Reused from HomePage) ────────────────────────────────

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

// ─── Animated counter hook (Reused from HomePage) ─────────────────────────────
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

const StatCounter = ({ num, suffix, start }) => {
  const count = useCountUp(num, 2000, start);
  return <>{count.toLocaleString()}{suffix}</>;
};

// ─── Sections ─────────────────────────────────────────────────────────────────

const VendorHero = () => {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setTimeout(() => setMounted(true), 80); }, []);

  return (
    <section className="about-hero">
      <div className="about-hero__orb about-hero__orb--1" />
      <div className="about-hero__orb about-hero__orb--2" />
      <div className="about-hero__orb about-hero__orb--3" />
      <div className="about-hero__grid" />

      <div className={`about-hero__inner ${mounted ? 'about-hero--visible' : ''}`} style={{ textAlign: 'left', paddingBottom: '0px' }}>
        <div className="about-hero__label" style={{display: 'flex', gap: '8px' , justifyContent: 'flex-start', alignItems: 'center'}}>
          <span className="eyebrow-dot" style={{ width: '6px', height: '6px', background: 'var(--gold)', borderRadius: '50%', display: 'inline-block', alignSelf: 'center' }} />
          <span>Partner With Giftora</span>
        </div>

        <h1 className="about-hero__title" style={{ fontSize: '4.5rem' }}>
          Grow Your Brand.<br />
          <span className="about-hero__title-accent">Zero Hassle.</span>
        </h1>

        <p className="about-hero__sub" style={{ margin: '0 0 40px 0', textAlign: 'left' }}>
          Join Sri Lanka's fastest-growing premium gifting marketplace. You focus on creating amazing products, and we'll handle the marketing, luxury packaging, and delivery.
        </p>

        <div className="about-hero__actions" style={{marginBottom: '50px' }}>
          <button className="btn-hero-primary" onClick={() => navigate('/vendor-register')}>
            <span className="btn-icon">🏪</span>
            <span>Register Your Shop</span>
            <span className="btn-arrow">→</span>
          </button>
        </div>
      </div>
    </section>
  );
};

const VendorBenefits = () => {
  const [ref, visible] = useReveal();
  return (
    <section className={`how-it-works section-reveal ${visible ? 'visible' : ''}`} ref={ref}>
      <div className="how-it-works__bg-accent" />
      <div className="section-inner">
        <div className="section-label center" style={{ fontSize: '15px' }}>Benefits</div>
        <h2 className="section-title center" style={{ fontSize: '45px' }}>Why Sell on Giftora?</h2>
        
        <div className="how-it-works__steps" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px', marginTop: '40px' }}>
          {VENDOR_FEATURES.map((f, i) => (
            <div key={i} className="step-card" style={{ animationDelay: `${i * 0.13}s`, textAlign: 'center', width: '100%' }}>
              <div className="step-card__icon" style={{ margin: '0 auto' }}>{f.icon}</div>
              <div className="step-card__title">{f.title}</div>
              <p className="step-card__desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const VendorHowItWorks = () => {
  const [ref, visible] = useReveal();
  return (
    <section className={`how-it-works section-reveal ${visible ? 'visible' : ''}`} ref={ref}>
      <div className="section-inner">
        <div className="section-label center" style={{ fontSize: '15px' }}>Process</div>
        <h2 className="section-title center" style={{ fontSize: '45px' }}>How Becoming a Partner Works</h2>

        <div className="how-it-works__steps">
          {VENDOR_STEPS.map((step, i) => (
            <React.Fragment key={i}>
              <div className="step-card" style={{ animationDelay: `${i * 0.13}s` }}>
                <div className="step-card__badge">{i + 1}</div>
                <div className="step-card__icon">{step.icon}</div>
                <div className="step-card__title">{step.title}</div>
                <p className="step-card__desc">{step.desc}</p>
              </div>
              {i < VENDOR_STEPS.length - 1 && <div className="step-connector" />}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};

const VendorStats = () => {
  const [ref, visible] = useReveal(0.2);
  return (
    <section className={`why-giftora section-reveal ${visible ? 'visible' : ''}`} ref={ref}>
      <div className="why-giftora__bg" />
      <div className="section-inner">
        <div className="section-label center">By The Numbers</div>
        <h2 className="section-title center">Your Business, Scaled</h2>

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

const VendorTestimonials = () => {
  const [ref, visible] = useReveal();
  return (
    <section className={`testimonials section-reveal ${visible ? 'visible' : ''}`} ref={ref}>
      <div className="testimonials__bg" />
      <div className="section-inner">
        <div className="section-label center" style={{ fontSize: '15px' }}>Success Stories</div>
        <h2 className="section-title center" style={{ fontSize: '45px' }} >Hear From Our Partners</h2>

        <div className="testimonials__grid">
          {VENDOR_TESTIMONIALS.map((t, i) => (
            <div key={i} className="testimonial-card" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="testimonial-card__quote-icon">"</div>
              <p className="testimonial-card__text">{t.quote}</p>
              <div className="testimonial-card__stars">{'★'.repeat(t.stars)}</div>
              <div className="testimonial-card__author">
                <div className="testimonial-card__avatar">{t.initial}</div>
                <div>
                  <div className="testimonial-card__name">{t.name}</div>
                  <div className="testimonial-card__location">🏪 {t.shop}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const VendorCTA = () => {
  const navigate = useNavigate();
  const [ref, visible] = useReveal();
  return (
    <section className={`builder-cta section-reveal ${visible ? 'visible' : ''}`} ref={ref}>
      <div className="builder-cta__orb builder-cta__orb--1" />
      <div className="builder-cta__orb builder-cta__orb--2" />
      <div className="builder-cta__inner">
        <div className="builder-cta__emoji">🚀</div>
        <h2 className="builder-cta__title">Ready to Boost Your Sales?</h2>
        <p className="builder-cta__desc">
          Takes less than 2 minutes to apply. Join the premier marketplace for luxury gifting today.
        </p>
        <button className="btn-hero-primary large" onClick={() => navigate('/vendor-register')}>
          <span className="btn-icon">✨</span>
          <span>Apply as a Vendor</span>
          <span className="btn-arrow">→</span>
        </button>
      </div>
    </section>
  );
};

const VendorLanding = () => (
  <div className="home-page">
    <Header />
    <main>
      <VendorHero />
      <div className="unified-light-bg">
        {/* <VendorStats /> */}
        <VendorBenefits />
        <VendorHowItWorks />
        <VendorTestimonials />
        <VendorCTA />
      </div>
    </main>
    <Footer />
  </div>
);

export default VendorLanding;