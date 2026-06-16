import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Phone, Mail, Check, X, Loader, User, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiBookFreeSession } from '../services/api';

export default function BookFreeSession() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [activeForm, setActiveForm] = useState(null); // 'consultation' | 'taster'
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSubmit = (type) => async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone) {
      showToast('Please fill in your name, email and phone number.', 'error');
      return;
    }

    if (!token) {
      showToast('Please log in to book a free session.', 'error');
      setTimeout(() => navigate('/login'), 1500);
      return;
    }

    setSubmitting(true);
    try {
      const data = await apiBookFreeSession(token, {
        type,
        phone: form.phone,
        address: form.address,
        notes: form.notes,
      });

      showToast(`✅ ${type === 'consultation' ? 'Free 15-Minute Consultation' : 'Care Home Taster Session'} request submitted! We'll call you within 24 hours.`);
      setForm({ name: '', email: '', phone: '', address: '', notes: '' });
      setActiveForm(null);
      setTimeout(() => navigate('/my-appointments'), 2000);
    } catch (err) {
      showToast(err.message || 'Failed to submit booking. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {toast && (
        <div className="toast-container">
          <div className={`toast toast-${toast.type}`}>
            {toast.type === 'success' ? <Check size={18} color="var(--clr-success)" /> : <X size={18} color="var(--clr-danger)" />}
            <span>{toast.msg}</span>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="page-header" style={{ background: 'linear-gradient(135deg, var(--clr-primary) 0%, #003d99 100%)', padding: '4rem 0' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h1 style={{ color: '#fff', fontSize: '2.5rem', fontWeight: 900 }}>Free Consultation and Taster Session</h1>
          <p style={{ color: 'rgba(255,255,255,.85)', marginTop: '0.75rem', fontSize: '1.05rem', maxWidth: 560, margin: '0.75rem auto 0' }}>
            Take the first step toward better movement and a healthier life — completely free, no obligation.
          </p>
        </div>
      </div>

      {/* Two Cards Section */}
      <section className="section" style={{ background: '#f8fafc' }}>
        <div className="container">
          <div className="grid-2" style={{ gap: '2.5rem' }}>

            {/* Card 1: Free 15-Minute Consultation */}
            <div className="card" style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)', border: '1.5px solid var(--clr-border)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: 300, overflow: 'hidden' }}>
                <img
                  src="/physio_consultation.jpg"
                  alt="Free 15-minute physiotherapy consultation"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', transition: 'transform 0.5s ease' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                />
              </div>

              <div style={{ padding: '2rem', textAlign: 'center', flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--clr-text)' }}>
                  Free 15-Minute Consultation
                </h2>
                <p style={{ color: 'var(--clr-text-muted)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.75rem', maxWidth: 360 }}>
                  Speak with one of our qualified physiotherapists about your condition, goals, and how we can help — at no cost.
                </p>
                <button
                  className="btn btn-primary btn-lg"
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                  onClick={() => setActiveForm(activeForm === 'consultation' ? null : 'consultation')}
                >
                  <Calendar size={18} /> Book Now
                </button>

                {activeForm === 'consultation' && (
                  <form onSubmit={handleSubmit('consultation')} style={{ width: '100%', marginTop: '2rem', textAlign: 'left' }}>
                    <div className="form-group">
                      <label className="form-label">Full Name *</label>
                      <input className="form-input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Jane Smith" required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email Address *</label>
                      <input type="email" className="form-input" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="email@example.com" required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phone Number *</label>
                      <input type="tel" className="form-input" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+44 7700 900000" required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Home Address</label>
                      <input className="form-input" value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} placeholder="Street, City, Postcode" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Brief Description of Your Concern</label>
                      <textarea className="form-input" rows={3} value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="e.g. lower back pain for 3 weeks…" style={{ resize: 'vertical' }} />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', height: 46, justifyContent: 'center' }} disabled={submitting}>
                      {submitting ? <><Loader size={16} style={{ animation: 'spin .8s linear infinite' }} /> Sending…</> : 'Confirm Booking Request'}
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Card 2: Care Home Free Taster Session */}
            <div className="card" style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)', border: '1.5px solid var(--clr-border)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: 300, overflow: 'hidden' }}>
                <img
                  src="/care_home_walk.png"
                  alt="Care home physiotherapy taster session"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                />
              </div>
              <div style={{ padding: '2rem', textAlign: 'center', flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--clr-text)' }}>
                  Care Home Free Taster Session
                </h2>
                <p style={{ color: 'var(--clr-text-muted)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.75rem', maxWidth: 360 }}>
                  Let us bring a complimentary group session to your care home so residents can experience the benefits of physiotherapy first-hand.
                </p>
                <button
                  className="btn btn-primary btn-lg"
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                  onClick={() => setActiveForm(activeForm === 'taster' ? null : 'taster')}
                >
                  <Calendar size={18} /> Book Now
                </button>

                {activeForm === 'taster' && (
                  <form onSubmit={handleSubmit('taster')} style={{ width: '100%', marginTop: '2rem', textAlign: 'left' }}>
                    <div className="form-group">
                      <label className="form-label">Your Name / Manager Name *</label>
                      <input className="form-input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Sarah Jenkins" required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email Address *</label>
                      <input type="email" className="form-input" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="email@carehome.com" required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phone Number *</label>
                      <input type="tel" className="form-input" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+44 7700 900000" required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Care Home Name & Address *</label>
                      <input className="form-input" value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} placeholder="e.g. Rosewood Care, 14 Oak Lane, Manchester" required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Number of Residents / Any Special Requirements</label>
                      <textarea className="form-input" rows={3} value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="e.g. 20 residents, some use wheelchairs…" style={{ resize: 'vertical' }} />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', height: 46, justifyContent: 'center' }} disabled={submitting}>
                      {submitting ? <><Loader size={16} style={{ animation: 'spin .8s linear infinite' }} /> Sending…</> : 'Confirm Taster Request'}
                    </button>
                  </form>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Impression Gallery */}
      <section className="section" style={{ background: '#fff', borderTop: '1px solid var(--clr-border)' }}>
        <div className="container">
          <div className="section-header">
            <h2>See What We Do</h2>
            <p>Real sessions. Real progress. Real results across homes, care facilities and community groups.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginTop: '2.5rem' }}>
            {[
              { src: '/group_session.png', alt: 'Group physiotherapy session with seniors using resistance bands' },
              { src: '/home_care_stretch.png', alt: 'Home physiotherapy – therapist assisting elderly lady with arm stretch' },
              { src: '/care_physio_senior.png', alt: 'Mobile home physiotherapy session with senior patient' },
            ].map((img, i) => (
              <div key={i} style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', boxShadow: 'var(--shadow-md)', aspectRatio: '4/3' }}>
                <img src={img.src} alt={img.alt} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Strip */}
      <section style={{ background: 'linear-gradient(135deg, var(--clr-primary) 0%, #003d99 100%)', padding: '3.5rem 0' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ color: '#fff', marginBottom: '0.75rem' }}>Prefer to Call Us Directly?</h2>
          <p style={{ color: 'rgba(255,255,255,.8)', marginBottom: '1.75rem' }}>Our team is happy to answer any questions before you commit.</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="tel:+447542221845" className="btn btn-lg" style={{ background: '#fff', color: 'var(--clr-primary)', fontWeight: 700 }}>
              <Phone size={18} /> +44 7542 221845
            </a>
            <a href="mailto:everactivephysiotherapy@gmail.com" className="btn btn-ghost btn-lg">
              <Mail size={18} /> Email Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
