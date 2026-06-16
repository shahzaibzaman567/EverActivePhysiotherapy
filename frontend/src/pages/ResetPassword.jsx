import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { apiResetPassword } from '../services/api';
import { Activity, Eye, EyeOff, Loader, Check, X } from 'lucide-react';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
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
    if (!password || !confirmPassword) {
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
      await apiResetPassword(token, password);
      showToast('Password reset successful! Redirecting to login...', 'success');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
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
        
        <h2 className="auth-title">Reset Password</h2>
        <p className="auth-sub">Enter a new secure password for your account</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">New Password</label>
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
            <label className="form-label">Confirm New Password</label>
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
            {submitting ? <><Loader size={18} className="spin" style={{ animation: 'spin .8s linear infinite' }} /> Resetting Password...</> : 'Reset Password'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link to="/login" className="auth-link" style={{ fontSize: '.85rem' }}>
            Back to Log In
          </Link>
        </div>
      </div>
    </div>
  );
}
