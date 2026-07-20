import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSpinner } from 'react-icons/fa';

// Assets and resources
import { assets } from '../../assets/login/assets';

// Stylesheet
import './Login.css';

// PASSWORD STRENGTH CHECKER
const getPasswordStrength = (password) => {
  if (!password) return { score: 0, label: '', color: '' };

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { score, label: 'Weak', color: '#e74c3c' };
  if (score <= 4) return { score, label: 'Medium', color: '#f39c12' };
  return { score, label: 'Strong', color: '#2ecc71' };
};

// ============================================================================
// LOGIN & SIGNUP COMPONENT (Main Component)
// ============================================================================
const Login = () => {
  // ── State Management ────────────────────────────────────────────────────
  const [state, setState] = useState('Login');
  const navigate = useNavigate();

  // Form field states for login and registration
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form validation errors
  const [errors, setErrors] = useState({});

  // Password strength
  const passwordStrength = getPasswordStrength(password);

  // ── Toggle between Login and Sign Up ────────────────────────────────────
  const toggleState = () => {
    setState(state === 'Sign Up' ? 'Login' : 'Sign Up');
    setName('');
    setUsername('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setErrors({});
  };

  // ── Validate login form ─────────────────────────────────────────────────
  const validateLoginForm = () => {
    const newErrors = {};
    if (!username.trim()) newErrors.username = 'Username is required';
    if (!password) newErrors.password = 'Password is required';
    if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Validate signup form ────────────────────────────────────────────────
  const validateSignupForm = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Full name is required';
    if (!username.trim()) newErrors.username = 'Username is required';
    if (username.length < 3) newErrors.username = 'Username must be at least 3 characters';
    if (!email.trim()) newErrors.email = 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Please enter a valid email';
    if (!password) newErrors.password = 'Password is required';
    if (password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (passwordStrength.label === 'Weak') newErrors.password = 'Password is too weak. Add uppercase, numbers or symbols.';
    if (!confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    if (confirmPassword && password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Form Submit Handler ─────────────────────────────────────────────────
  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (state === 'Sign Up') {
      if (!validateSignupForm()) return;
    } else {
      if (!validateLoginForm()) return;
    }

    setLoading(true);

    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080';

      if (state === 'Sign Up') {
        // ── REGISTRATION FLOW ──────────────────────────────────
        const response = await fetch(`${apiUrl}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, username, email, password }),
        });

        const data = await response.json();

        if (data.success === true) {
          sessionStorage.setItem('verifyEmail', email);
          setTimeout(() => {
            navigate('/verify', { state: { email: email } });
          }, 500);
        } else {
          const errorMessage = data.message || 'Registration failed. Please try again.';
          if (errorMessage.toLowerCase().includes('email')) {
            setErrors(prev => ({ ...prev, email: errorMessage }));
          } else if (errorMessage.toLowerCase().includes('username')) {
            setErrors(prev => ({ ...prev, username: errorMessage }));
          } else {
            setErrors(prev => ({ ...prev, general: errorMessage }));
          }
        }
      } else {
        // ── LOGIN FLOW WITH JWT ────────────────────────────────
        const response = await fetch(`${apiUrl}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (data.success === true && data.accessToken) {
          // ✅ Store JWT tokens in localStorage
          localStorage.setItem('accessToken', data.accessToken);
          localStorage.setItem('refreshToken', data.refreshToken);
          localStorage.setItem('role', data.role);
          localStorage.setItem('userId', data.userId);
          localStorage.setItem('username', username);

          console.log('✅ Login successful! JWT Token stored.');

          // ── Route user based on role ──────────────────────────
          const userRole = data.role;
          
          if (userRole === 'ADMIN') {
            navigate('/admin');
          } else if (userRole === 'VENDOR' || userRole === 'SELLER' || userRole === 'PARTNER') {
            navigate('/vendor');
          } else if (userRole === 'CUSTOMER') {
            navigate('/customer/home');
          } else if (userRole === 'ASSEMBLER') {
            navigate('/assembler-dashboard');
          } else {
            navigate('/');
          }
        } else {
          const errorMessage = data.message || 'Login failed. Please check your credentials.';
          setPassword('');
          if (errorMessage.toLowerCase().includes('username')) {
            setErrors(prev => ({ ...prev, username: errorMessage }));
          } else if (errorMessage.toLowerCase().includes('password')) {
            setErrors(prev => ({ ...prev, password: errorMessage }));
          } else if (errorMessage.toLowerCase().includes('verify')) {
            setErrors(prev => ({ ...prev, general: '📧 Please verify your email first. Check your inbox!' }));
          } else {
            setErrors(prev => ({ ...prev, general: errorMessage }));
          }
        }
      }
    } catch (error) {
      console.error('API Error:', error);
      const errorMessage = error.message === 'Failed to fetch'
        ? 'Could not connect to server. Please check your internet connection.'
        : 'Something went wrong. Please try again.';
      setErrors(prev => ({ ...prev, general: errorMessage }));
    } finally {
      setLoading(false);
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className="login-page">
      {/* Logo */}
      <img src={assets.logo} alt="Giftora Logo" className="login-logo" />

      {/* 3D Flip Card */}
      <div className="login-card-wrapper">
        <div className={`login-card-inner ${state === 'Sign Up' ? 'flipped' : ''}`}>

          {/* ── LOGIN FORM (Front of card) ─────────────────────────────── */}
          <div className="login-card-front">
            <h2>Welcome Back</h2>
            <p className="login-sub">Login to your account</p>
            <form onSubmit={onSubmitHandler}>
              {errors.general && <p className="login-error login-general-error">{errors.general}</p>}

              {/* Username Input */}
              <div className="login-input-row">
                <img src={assets.person_icon} alt="" />
                <input
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (errors.username) setErrors(prev => ({ ...prev, username: '' }));
                  }}
                  value={username}
                  type="text"
                  placeholder="Username"
                  disabled={loading}
                  required
                />
              </div>
              {errors.username && <p className="login-error">{errors.username}</p>}

              {/* Password Input */}
              <div className="login-input-row">
                <img src={assets.lock_icon} alt="" />
                <input
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
                  }}
                  value={password}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  className="login-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  <img src={showPassword ? assets.Open_Eye : assets.Close_Eye} alt="Toggle Visibility" />
                </button>
              </div>
              {errors.password && <p className="login-error">{errors.password}</p>}

              <p className="login-forgot" onClick={() => navigate('/email-verify')}>
                Forgot Password?
              </p>

              <button type="submit" className="login-submit-btn" disabled={loading}>
                {loading ? <><FaSpinner className="spinner-icon" /> Logging in...</> : 'Login'}
              </button>
            </form>

            <p className="login-toggle-text">
              Don't have an account?{' '}
              <span className="login-toggle-link" onClick={toggleState}>Sign Up</span>
            </p>
          </div>

          {/* ── SIGNUP FORM (Back of card) ─────────────────────────────── */}
          <div className="login-card-back">
            <h2>Create Account</h2>
            <p className="login-sub">Join us to customize your gifts</p>
            <form onSubmit={onSubmitHandler}>
              {errors.general && <p className="login-error login-general-error">{errors.general}</p>}

              {/* Full Name Input */}
              <div className="login-input-row">
                <img src={assets.person_icon} alt="" />
                <input
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
                  }}
                  value={name}
                  type="text"
                  placeholder="Full Name"
                  disabled={loading}
                  required
                />
              </div>
              {errors.name && <p className="login-error">{errors.name}</p>}

              {/* Username Input */}
              <div className="login-input-row">
                <img src={assets.person_icon} alt="" />
                <input
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (errors.username) setErrors(prev => ({ ...prev, username: '' }));
                  }}
                  value={username}
                  type="text"
                  placeholder="Choose a Username"
                  disabled={loading}
                  required
                />
              </div>
              {errors.username && <p className="login-error">{errors.username}</p>}

              {/* Email Input */}
              <div className="login-input-row">
                <img src={assets.mail_icon} alt="" />
                <input
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                  }}
                  value={email}
                  type="email"
                  placeholder="Email"
                  disabled={loading}
                  required
                />
              </div>
              {errors.email && <p className="login-error">{errors.email}</p>}

              {/* Password Input */}
              <div className="login-input-row">
                <img src={assets.lock_icon} alt="" />
                <input
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
                  }}
                  value={password}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  className="login-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  <img src={showPassword ? assets.Open_Eye : assets.Close_Eye} alt="Toggle Visibility" />
                </button>
              </div>

              {/* ── PASSWORD STRENGTH INDICATOR ── */}
              {password && (
                <div className="password-strength">
                  <div className="strength-bars">
                    <div className="strength-bar" style={{ backgroundColor: passwordStrength.score >= 1 ? passwordStrength.color : '#444' }} />
                    <div className="strength-bar" style={{ backgroundColor: passwordStrength.score >= 3 ? passwordStrength.color : '#444' }} />
                    <div className="strength-bar" style={{ backgroundColor: passwordStrength.score >= 5 ? passwordStrength.color : '#444' }} />
                  </div>
                  <span className="strength-label" style={{ color: passwordStrength.color }}>
                    {passwordStrength.label}
                  </span>
                </div>
              )}

              {/* ── PASSWORD REQUIREMENTS CHECKLIST ── */}
              {password && (
                <ul className="password-requirements">
                  <li style={{ color: password.length >= 8 ? '#2ecc71' : '#aaa' }}>✓ At least 8 characters</li>
                  <li style={{ color: /[A-Z]/.test(password) ? '#2ecc71' : '#aaa' }}>✓ One uppercase letter (A-Z)</li>
                  <li style={{ color: /[0-9]/.test(password) ? '#2ecc71' : '#aaa' }}>✓ One number (0-9)</li>
                  <li style={{ color: /[^A-Za-z0-9]/.test(password) ? '#2ecc71' : '#aaa' }}>✓ One special character (!@#$...)</li>
                </ul>
              )}

              {errors.password && <p className="login-error">{errors.password}</p>}

              {/* Confirm Password Input */}
              <div className="login-input-row">
                <img src={assets.lock_icon} alt="" />
                <input
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: '' }));
                  }}
                  value={confirmPassword}
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm Password"
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  className="login-eye-btn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                >
                  <img src={showConfirmPassword ? assets.Open_Eye : assets.Close_Eye} alt="Toggle Visibility" />
                </button>
              </div>
              {errors.confirmPassword && <p className="login-error">{errors.confirmPassword}</p>}

              <button type="submit" className="login-submit-btn" disabled={loading}>
                {loading ? <><FaSpinner className="spinner-icon" /> Creating Account...</> : 'Sign Up'}
              </button>
            </form>

            <p className="login-toggle-text">
              Already have an account?{' '}
              <span className="login-toggle-link" onClick={toggleState}>Login</span>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;