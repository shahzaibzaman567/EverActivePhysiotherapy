import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiSignup } from '../services/api';
import { Activity, Eye, EyeOff, Loader, Check, X } from 'lucide-react';

export default function Signup() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      showToast('All fields are required.', 'error');
      return;
    }
    if (password !== confirmPassword) {
      showToast('Passwords do not match.', 'error');
      return;
    }
    if (password.length < 6) {
      showToast('Password must be at least 6 characters long.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const data = await apiSignup({ name, email, password });
      login({ token: data.token, user: data.user });
      showToast('Registration successful! Welcome!', 'success');
      setTimeout(() => {
        navigate('/login');
      }, 1000);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page" style={{ padding: '1.5rem' }}>
      {toast && (
        <div className="toast-container">
          <div className={`toast toast-${toast.type}`}>
            {toast.type === 'success' ? <Check size={18} color="var(--clr-success)" /> : <X size={18} color="var(--clr-danger)" />}
            <span>{toast.msg}</span>
          </div>
        </div>
      )}

      <div className="auth-card" style={{ maxWidth: '460px', padding: '2rem 2.5rem' }}>
        <Link to="/" className="auth-logo">
          <div className="logo-icon"><Activity size={22} /></div>
          <span className="brand-name" style={{ fontSize: '1.2rem' }}>EverActive</span>
        </Link>
        
        <h2 className="auth-title">Create Account</h2>
        <p className="auth-sub">Register today to book and manage appointments</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-wrap">
              <input
                type={showPass ? 'text' : 'password'}
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
              />
              <button
                type="button"
                className="eye-btn"
                onClick={() => setShowPass(!showPass)}
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <div className="input-wrap">
              <input
                type={showConfirmPass ? 'text' : 'password'}
                className="form-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                required
              />
              <button
                type="button"
                className="eye-btn"
                onClick={() => setShowConfirmPass(!showConfirmPass)}
              >
                {showConfirmPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '.5rem', height: '44px', justifyContent: 'center' }}
            disabled={submitting}
          >
            {submitting ? <><Loader size={18} className="spin" style={{ animation: 'spin .8s linear infinite' }} /> Creating Account...</> : 'Create Account'}
          </button>
        </form>

        <div className="auth-divider">
          <span>or</span>
        </div>

        <p style={{ textAlign: 'center', fontSize: '.85rem', color: 'var(--clr-text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" className="auth-link">Log In</Link>
        </p>
      </div>
    </div>
  );
}
