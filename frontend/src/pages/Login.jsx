import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiLogin } from '../services/api';
import { Activity, Eye, EyeOff, Loader, Check, X } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please enter both email and password.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const data = await apiLogin({ email, password });
      login({ token: data.token, user: data.user });
      showToast('Login successful! Redirecting...', 'success');
      setTimeout(() => {
        if (data.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      }, 1000);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      {toast && (
        <div className="toast-container">
          <div className={`toast toast-${toast.type}`}>
            {toast.type === 'success' ? <Check size={18} color="var(--clr-success)" /> : <X size={18} color="var(--clr-danger)" />}
            <span>{toast.msg}</span>
          </div>
        </div>
      )}

      <div className="auth-card">
        <Link to="/" className="auth-logo">
          <div className="logo-icon"><Activity size={22} /></div>
          <span className="brand-name" style={{ fontSize: '1.2rem' }}>EverActive</span>
        </Link>
        
        <h2 className="auth-title">Welcome Back</h2>
        <p className="auth-sub">Log in to manage your appointments and care</p>

        <form onSubmit={handleSubmit}>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.4rem' }}>
              <label className="form-label" style={{ margin: 0 }}>Password</label>
              <Link to="/forgot-password" className="auth-link" style={{ fontSize: '.78rem' }}>Forgot password?</Link>
            </div>
            <div className="input-wrap">
              <input
                type={showPass ? 'text' : 'password'}
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
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

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '.5rem', height: '44px', justifyContent: 'center' }}
            disabled={submitting}
          >
            {submitting ? <><Loader size={18} className="spin" style={{ animation: 'spin .8s linear infinite' }} /> Logging In...</> : 'Log In'}
          </button>
        </form>

        <div className="auth-divider">
          <span>or</span>
        </div>

        <p style={{ textAlign: 'center', fontSize: '.85rem', color: 'var(--clr-text-muted)' }}>
          Don't have an account?{' '}
          <Link to="/signup" className="auth-link">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}
