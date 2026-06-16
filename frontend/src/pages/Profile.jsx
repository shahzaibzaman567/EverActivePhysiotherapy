import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiGetMe, apiUpdateMe } from '../services/api';
import { User, Mail, Shield, Calendar, Edit2, Loader, Check, X, Phone } from 'lucide-react';

export default function Profile() {
  const { token, login } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    if (token) {
      apiGetMe(token)
        .then((data) => {
          setProfile(data.user);
          setName(data.user.name || '');
          setEmail(data.user.email || '');
          setPhone(data.user.phone || '');
        })
        .catch((err) => {
          showToast(err.message, 'error');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email) {
      showToast('Name and email cannot be blank.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const data = await apiUpdateMe(token, { name, email, phone });
      setProfile(data.user);
      login({ token, user: data.user }); // update context
      showToast('Profile updated successfully!');
      setEditing(false);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '60vh' }}>
        <div className="loader-ring" />
      </div>
    );
  }

  const userAvatar = profile?.name?.[0]?.toUpperCase() || 'U';

  return (
    <div style={{ background: 'var(--clr-bg-2)', minHeight: 'calc(100vh - 68px)', padding: '3rem 0' }}>
      {toast && (
        <div className="toast-container">
          <div className={`toast toast-${toast.type}`}>
            {toast.type === 'success' ? <Check size={18} color="var(--clr-success)" /> : <X size={18} color="var(--clr-danger)" />}
            <span>{toast.msg}</span>
          </div>
        </div>
      )}

      <div className="container" style={{ maxWidth: 640 }}>
        <div className="card" style={{ padding: '2.5rem' }}>
          
          {/* Header / Avatar */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '2.5rem' }}>
            <div style={{
              width: 90, height: 90, borderRadius: '50%',
              background: 'var(--clr-primary)', color: '#fff',
              fontSize: '2.2rem', fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: 'var(--shadow-md)', marginBottom: '1rem',
              lineHeight: '90px', textTransform: 'uppercase', textAlign: 'center'
            }}>
              {userAvatar}
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--clr-text)' }}>{profile?.name}</h2>
            <div className="badge" style={{ marginTop: '.4rem' }}>
              <Shield size={12} /> {profile?.role?.toUpperCase()}
            </div>
          </div>

          <hr style={{ borderColor: 'var(--clr-border)', marginBottom: '2rem' }} />

          {/* Edit form / View profile details */}
          {editing ? (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
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
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  className="form-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+44 7700 900000"
                />
              </div>

              <div style={{ display: 'flex', gap: '.75rem', marginTop: '2rem' }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setEditing(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submitting}>
                  {submitting ? <><Loader size={16} className="spin" style={{ animation: 'spin .8s linear infinite' }} /> Saving...</> : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'var(--clr-primary-light)', color: 'var(--clr-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <User size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '.78rem', color: 'var(--clr-text-muted)', fontWeight: 500 }}>Full Name</div>
                    <div style={{ fontSize: '.95rem', fontWeight: 600, color: 'var(--clr-text)' }}>{profile?.name}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'var(--clr-primary-light)', color: 'var(--clr-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Mail size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '.78rem', color: 'var(--clr-text-muted)', fontWeight: 500 }}>Email Address</div>
                    <div style={{ fontSize: '.95rem', fontWeight: 600, color: 'var(--clr-text)' }}>{profile?.email}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'var(--clr-primary-light)', color: 'var(--clr-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Phone size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '.78rem', color: 'var(--clr-text-muted)', fontWeight: 500 }}>Phone Number</div>
                    <div style={{ fontSize: '.95rem', fontWeight: 600, color: 'var(--clr-text)' }}>{profile?.phone || 'Not added'}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'var(--clr-primary-light)', color: 'var(--clr-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Shield size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '.78rem', color: 'var(--clr-text-muted)', fontWeight: 500 }}>Account Role</div>
                    <div style={{ fontSize: '.95rem', fontWeight: 600, color: 'var(--clr-text)', textTransform: 'capitalize' }}>{profile?.role}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'var(--clr-primary-light)', color: 'var(--clr-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Calendar size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '.78rem', color: 'var(--clr-text-muted)', fontWeight: 500 }}>Member Since</div>
                    <div style={{ fontSize: '.95rem', fontWeight: 600, color: 'var(--clr-text)' }}>
                      {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                    </div>
                  </div>
                </div>

              </div>

              <button
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '2.5rem', justifyContent: 'center' }}
                onClick={() => setEditing(true)}
              >
                <Edit2 size={16} /> Edit Profile Info
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
