import { useState, useEffect, useRef } from 'react';
import { Star, ChevronLeft, ChevronRight, PlusCircle, X, Loader, Check } from 'lucide-react';
import { apiGetReviews, apiCreateReview } from '../services/api';
import { useAuth } from '../context/AuthContext';

/* ─── Static Testimonials (always shown) ─────────────────────────────── */
const STATIC_REVIEWS = [
  {
    _id: 's1',
    name: 'Robert Miller',
    rating: 5,
    text: 'Recovering from my ACL surgery was a nightmare until I started working with EverActive. The therapist is extremely knowledgeable, pushes you safely, and got me back on the football pitch in record time. Highly recommended!',
    createdAt: '2026-06-01T00:00:00Z',
  },
  {
    _id: 's2',
    name: 'Emily Watson',
    rating: 5,
    text: 'Excellent facilities and very professional staff. Dr. Aisha Rahman is an absolute gem. Her neurological rehab session helped my father regain significant balance after his stroke.',
    createdAt: '2026-06-02T00:00:00Z',
  },
  {
    _id: 's3',
    name: 'Kabir Khan',
    rating: 5,
    text: 'Clean clinics, excellent scheduling, and zero waiting times. Booking an appointment online was very straightforward. I feel 80% better after only three sessions.',
    createdAt: '2026-06-03T00:00:00Z',
  },
  {
    _id: 's4',
    name: 'Sophia Chang',
    rating: 5,
    text: "Dr. Jenkins completely resolved my 3-year history of lower back stiffness. Her posture training exercises were simple but incredibly effective. The clinic environment is so premium and relaxing!",
    createdAt: '2026-06-04T00:00:00Z',
  },
];

/* ─── Physio Photo Slideshow Images ──────────────────────────────────── */
const SLIDE_IMAGES = [
  { src: '/care_home_walk.png',     alt: 'EverActive physiotherapist assisting elderly resident walking',  caption: 'Care Home Physiotherapy' },
  { src: '/group_session.png',      alt: 'Group physio session with seniors using resistance bands',        caption: 'Group Wellness Sessions' },
  { src: '/home_care_stretch.png',  alt: 'Home visit – therapist assisting patient with arm stretch',       caption: 'Mobile Home Visits' },
];

/* ─── Helpers ─────────────────────────────────────────────────────────── */
function StarRating({ value, onChange }) {
  return (
    <div className="star-input">
      {[1,2,3,4,5].map(n => (
        <button key={n} type="button"
          className={n <= value ? 'filled' : ''}
          onClick={() => onChange(n)}>★</button>
      ))}
    </div>
  );
}

function ReviewCard({ review }) {
  const initials = review.name?.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();
  return (
    <div className="review-card card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="review-stars" style={{ display: 'flex', gap: '2px', marginBottom: '0.75rem' }}>
        {Array.from({ length: review.rating }).map((_, i) => (
          <Star key={`f${i}`} size={16} fill="#fbbf24" color="#fbbf24" />
        ))}
        {Array.from({ length: 5 - review.rating }).map((_, i) => (
          <Star key={`e${i}`} size={16} color="#d1d5db" />
        ))}
      </div>
      <p className="review-text" style={{ flexGrow: 1, fontSize: '0.92rem', lineHeight: 1.65, fontStyle: 'italic', color: 'var(--clr-text)', marginBottom: '1.25rem' }}>
        "{review.text}"
      </p>
      <div className="review-author" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: 'auto' }}>
        <div className="review-avatar" style={{
          width: 44, height: 44, borderRadius: '50%',
          background: 'var(--clr-primary)', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 800, fontSize: '0.9rem', flexShrink: 0
        }}>{initials}</div>
        <div>
          <div className="review-name" style={{ fontWeight: 700, fontSize: '0.95rem' }}>{review.name}</div>
          <div className="review-date" style={{ fontSize: '0.78rem', color: 'var(--clr-text-muted)' }}>
            {new Date(review.createdAt).toLocaleDateString('en-US', { year:'numeric', month:'long' })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Photo Carousel ─────────────────────────────────────────────────── */
function PhotoCarousel() {
  const [idx, setIdx] = useState(0);
  const timerRef = useRef(null);

  const startTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setIdx(c => (c + 1) % SLIDE_IMAGES.length), 4500);
  };

  useEffect(() => {
    startTimer();
    return () => clearInterval(timerRef.current);
  }, []);

  const go = (i) => { setIdx(i); startTimer(); };
  const prev = () => go((idx - 1 + SLIDE_IMAGES.length) % SLIDE_IMAGES.length);
  const next = () => go((idx + 1) % SLIDE_IMAGES.length);

  return (
    <div style={{ position: 'relative', borderRadius: 'var(--radius-xl)', overflow: 'hidden', boxShadow: 'var(--shadow-xl)', aspectRatio: '16/7', background: '#0a1628' }}>
      {/* Slides */}
      {SLIDE_IMAGES.map((img, i) => (
        <div key={i} style={{
          position: 'absolute', inset: 0,
          opacity: i === idx ? 1 : 0,
          transition: 'opacity 0.8s ease',
          pointerEvents: i === idx ? 'auto' : 'none'
        }}>
          <img src={img.src} alt={img.alt} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 60%)',
          }} />
          <div style={{
            position: 'absolute', bottom: '2rem', left: '2rem',
            color: '#fff', fontWeight: 800, fontSize: '1.35rem',
            textShadow: '0 2px 8px rgba(0,0,0,.5)'
          }}>
            {img.caption}
          </div>
        </div>
      ))}

      {/* Arrows */}
      <button onClick={prev} style={{
        position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)',
        width: 42, height: 42, borderRadius: '50%', background: 'rgba(255,255,255,0.85)',
        border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: 'var(--shadow-md)', zIndex: 5, transition: 'background .2s'
      }}>
        <ChevronLeft size={20} />
      </button>
      <button onClick={next} style={{
        position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)',
        width: 42, height: 42, borderRadius: '50%', background: 'rgba(255,255,255,0.85)',
        border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: 'var(--shadow-md)', zIndex: 5, transition: 'background .2s'
      }}>
        <ChevronRight size={20} />
      </button>

      {/* Dots */}
      <div style={{
        position: 'absolute', bottom: '1rem', right: '1.5rem',
        display: 'flex', gap: '0.45rem', zIndex: 5
      }}>
        {SLIDE_IMAGES.map((_, i) => (
          <button key={i} onClick={() => go(i)} style={{
            width: i === idx ? 24 : 8, height: 8,
            borderRadius: 999, border: 'none', cursor: 'pointer',
            background: i === idx ? '#fff' : 'rgba(255,255,255,0.45)',
            transition: 'width .35s, background .35s', padding: 0
          }} />
        ))}
      </div>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────── */
export default function Reviews() {
  const { user, token } = useAuth();
  const [dbReviews, setDbReviews] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [submitting, setSubmit]   = useState(false);
  const [toast, setToast]         = useState(null);
  const [form, setForm]           = useState({ name: user?.name || '', rating: 5, text: '' });

  useEffect(() => {
    apiGetReviews()
      .then(d => setDbReviews(d.data || []))
      .catch(() => setDbReviews([]))
      .finally(() => setLoading(false));
  }, []);

  const allReviews = [...dbReviews, ...STATIC_REVIEWS];

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.text) { showToast('Please fill name and review text.', 'error'); return; }
    setSubmit(true);
    try {
      const data = await apiCreateReview(token, form);
      setDbReviews(prev => [data.data, ...prev]);
      setShowForm(false);
      setForm({ name: user?.name || '', rating: 5, text: '' });
      showToast('Thank you! Your review has been submitted.');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmit(false);
    }
  };

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div className="toast-container">
          <div className={`toast toast-${toast.type}`}>
            {toast.type === 'success' ? <Check size={18} color="var(--clr-success)" /> : <X size={18} color="var(--clr-danger)" />}
            <span>{toast.msg}</span>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="page-header">
        <div className="container">
          <h1>Patient Stories</h1>
          <p style={{ color:'rgba(255,255,255,.8)', marginTop:'.5rem', fontSize:'1.05rem' }}>
            Real experiences from real patients who restored their movement with EverActive.
          </p>
        </div>
      </div>

      {/* ── Photo Carousel Section ── */}
      <section className="section" style={{ background: '#f8fafc', borderTop: '1px solid var(--clr-border)', borderBottom: '1px solid var(--clr-border)' }}>
        <div className="container">
          <div className="section-header">
            <div className="badge">📸 Our Sessions in Action</div>
            <h2>Physiotherapy That Comes to You</h2>
            <p>From care homes to community centres — see our therapists at work across Greater Manchester.</p>
          </div>
          <div style={{ marginTop: '2.5rem' }}>
            <PhotoCarousel />
          </div>
        </div>
      </section>

      {/* ── Testimonials Grid ── */}
      <section className="section reviews-section">
        <div className="container">
          <div className="section-header">
            <div className="badge"><Star size={13} /> Testimonials</div>
            <h2>What Our Patients Say</h2>
            <p>Honest words from patients who have experienced the EverActive difference.</p>
          </div>

          {loading ? (
            <div className="flex-center" style={{ padding:'4rem' }}><div className="loader-ring" /></div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.75rem',
              marginTop: '2.5rem'
            }}>
              {allReviews.map(r => <ReviewCard key={r._id} review={r} />)}
            </div>
          )}

          {/* Submit review */}
          <div style={{ textAlign:'center', marginTop:'3rem' }}>
            <button className="btn btn-primary" onClick={() => setShowForm(v => !v)}>
              <PlusCircle size={18} /> Share Your Experience
            </button>
          </div>

          {showForm && (
            <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowForm(false); }}>
              <div className="modal">
                <div className="modal-header">
                  <h3>Leave a Review</h3>
                  <button className="modal-close" onClick={() => setShowForm(false)}><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label className="form-label">Your Name</label>
                    <input className="form-input" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} placeholder="e.g. John Smith" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Rating</label>
                    <StarRating value={form.rating} onChange={v => setForm(f => ({...f, rating: v}))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Your Review</label>
                    <textarea className="form-input" rows={4} value={form.text} onChange={e => setForm(f => ({...f, text: e.target.value}))} placeholder="Share your experience…" style={{ resize:'vertical' }} />
                  </div>
                  <div style={{ display:'flex', gap:'.75rem' }}>
                    <button type="button" className="btn btn-outline" style={{ flex:1 }} onClick={() => setShowForm(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary" style={{ flex:1 }} disabled={submitting}>
                      {submitting ? <><Loader size={16} /> Submitting…</> : <><Check size={16} /> Submit</>}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
