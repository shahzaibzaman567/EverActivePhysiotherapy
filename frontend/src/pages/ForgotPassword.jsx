import { useState } from 'react';
import { Link } from 'react-router-dom';
import { apiForgotPassword } from '../services/api';
import { Activity, ArrowLeft, Loader, Check, X } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      showToast('Please enter your email address.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await apiForgotPassword(email);
      setSuccess(true);
      showToast('Password reset link has been sent to your email.');
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

        {success ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'var(--clr-primary-light)', color: 'var(--clr-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.5rem'
            }}>
              <Check size={28} />
            </div>
            <h2 className="auth-title">Check Your Email</h2>
            <p className="auth-sub" style={{ marginBottom: '2rem' }}>
              We have sent a secure password reset link to <strong>{email}</strong>.
              Please check your inbox and click the link to reset your password.
            </p>
            <Link to="/login" className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }}>
              Back to Log In
            </Link>
          </div>
        ) : (
          <>
            <h2 className="auth-title">Forgot Password?</h2>
            <p className="auth-sub">Enter your email and we'll send you a link to reset your password</p>

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

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '.5rem', height: '44px', justifyContent: 'center' }}
                disabled={submitting}
              >
                {submitting ? <><Loader size={18} className="spin" style={{ animation: 'spin .8s linear infinite' }} /> Sending...</> : 'Send Reset Link'}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <Link to="/login" className="auth-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '.4rem', fontSize: '.85rem' }}>
                <ArrowLeft size={14} /> Back to Log In
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
