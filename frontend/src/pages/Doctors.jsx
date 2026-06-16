import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiGetDoctors, apiBookAppointment } from '../services/api';
import { Clock, Award, Calendar, X, Check, Loader } from 'lucide-react';

const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

function getTodayAndNext6() {
  const dates = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    dates.push(d);
  }
  return dates;
}

function formatDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

export default function Doctors() {
  const { user, token } = useAuth();
  const navigate        = useNavigate();
  const [doctors, setDoctors]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [bookModal, setBookModal] = useState(null); // doctor object
  const [selDate, setSelDate]     = useState('');
  const [selSlot, setSelSlot]     = useState('');
  const [phone, setPhone]         = useState('');
  const [booking, setBooking]     = useState(false);
  const [toast,   setToast]       = useState(null);

  useEffect(() => {
    apiGetDoctors()
      .then(d => setDoctors(d.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const showToast = (msg, type='success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const openBook = (doctor) => {
    if (!user) { navigate('/login'); return; }
    setBookModal(doctor);
    setSelDate(''); setSelSlot('');
    setPhone(user?.phone || '');
  };

  const getAvailableSlots = () => {
    if (!bookModal || !selDate) return [];
    const dayName = DAYS[new Date(selDate + 'T00:00:00').getDay()];
    const sched   = bookModal.availability?.find(a => a.day === dayName);
    return sched?.slots || [];
  };

  const handleBook = async () => {
    if (!selDate || !selSlot) { showToast('Please select a date and time slot.', 'error'); return; }
    setBooking(true);
    try {
      await apiBookAppointment(token, { doctorId: bookModal._id, date: selDate, slot: selSlot, phone });
      showToast('Appointment booked successfully! Check your email for confirmation.');
      setBookModal(null);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setBooking(false);
    }
  };

  const dates = getTodayAndNext6();

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

      {/* Header */}
      <div className="page-header">
        <div className="container">
          <div className="badge" style={{ background:'rgba(255,255,255,.2)', color:'#fff', display:'inline-flex', alignItems:'center', gap:'.4rem', padding:'.35rem .9rem', borderRadius:'9999px', fontSize:'.75rem', fontWeight:700, marginBottom:'1rem', textTransform:'uppercase', letterSpacing:'.08em' }}>
            <Award size={13} /> Our Team
          </div>
          <h1>Meet Our Specialists</h1>
          <p style={{ color:'rgba(255,255,255,.8)', marginTop:'.5rem', fontSize:'1.05rem' }}>
            Book appointments with our experienced, certified physiotherapists.
          </p>
        </div>
      </div>

      {/* Doctors Grid */}
      <section className="section">
        <div className="container">
          {/* Quick Stats Grid */}
          <div className="grid-3" style={{ margin: '-3.5rem auto 3rem', background: '#fff', padding: '1.5rem', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--clr-border)', position: 'relative', zIndex: 10 }}>
            {[
              { num: '1,200+', label: 'Patients Treated', desc: 'Successful recoveries across Greater Manchester' },
              { num: '15+', label: 'Years Experience', desc: 'Providing elite clinical and home-based care' },
              { num: '98%', label: 'Satisfaction Rate', desc: 'Morale and mobility progress reported by clients' }
            ].map(stat => (
              <div key={stat.label} style={{ textAlign: 'center', padding: '0.5rem' }}>
                <div style={{ fontSize: '2.25rem', fontWeight: 900, color: 'var(--clr-primary)', marginBottom: '0.25rem' }}>{stat.num}</div>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--clr-text)', marginBottom: '0.25rem' }}>{stat.label}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)' }}>{stat.desc}</div>
              </div>
            ))}
          </div>

          {loading ? (
            <div className="flex-center" style={{ padding:'5rem' }}>
              <div className="loader-ring" />
            </div>
          ) : (
            <div className="grid-3">
              {doctors.map(doc => (
                <div key={doc._id} className="card doctor-card">
                  <div className="doctor-img-wrap">
                    <img src={doc.image || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400'} alt={doc.name} />
                    <div className="doctor-overlay" />
                  </div>
                  <div className="doctor-info">
                    <span className="doctor-specialty">{doc.specialty}</span>
                    <h3>{doc.name}</h3>
                    {doc.bio && <p style={{ fontSize:'.85rem', marginTop:'.5rem', lineHeight:1.7, display:'-webkit-box', WebkitLineClamp:3, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{doc.bio}</p>}
                    <div className="doctor-meta">
                      <span><Award size={14} /> {doc.experience} yrs exp</span>
                      <span><Clock size={14} /> {doc.availability?.length || 0} days/week</span>
                    </div>
                    <button
                      className="btn btn-primary"
                      style={{ width:'100%', marginTop:'1.25rem' }}
                      onClick={() => openBook(doc)}
                    >
                      <Calendar size={16} /> Book Appointment
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Booking Modal */}
      {bookModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setBookModal(null); }}>
          <div className="modal">
            <div className="modal-header">
              <h3>Book with {bookModal.name}</h3>
              <button className="modal-close" onClick={() => setBookModal(null)}><X size={20} /></button>
            </div>

            <div className="form-group">
              <label className="form-label">Contact Phone</label>
              <input
                type="tel"
                className="form-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+44 7700 900000"
              />
            </div>

            {/* Date selection */}
            <div className="form-group">
              <label className="form-label">Select Date</label>
              <div style={{ display:'flex', gap:'.5rem', flexWrap:'wrap' }}>
                {dates.map(d => {
                  const ds      = formatDate(d);
                  const dayName = DAYS[d.getDay()];
                  const hasSlot = bookModal.availability?.some(a => a.day === dayName && a.slots.length > 0);
                  return (
                    <button
                      key={ds}
                      disabled={!hasSlot}
                      onClick={() => { setSelDate(ds); setSelSlot(''); }}
                      style={{
                        padding:'.5rem .75rem', borderRadius:'var(--radius-md)', border:'1.5px solid',
                        borderColor: selDate === ds ? 'var(--clr-primary)' : 'var(--clr-border)',
                        background:  selDate === ds ? 'var(--clr-primary)' : '#fff',
                        color:       selDate === ds ? '#fff' : hasSlot ? 'var(--clr-text)' : 'var(--clr-text-light)',
                        fontSize:'.78rem', fontWeight:600, cursor: hasSlot ? 'pointer' : 'not-allowed',
                        opacity: hasSlot ? 1 : .4, minWidth:56, textAlign:'center', transition:'var(--transition)',
                      }}
                    >
                      <div>{dayName.slice(0,3)}</div>
                      <div style={{ fontSize:'.9rem', fontWeight:800 }}>{d.getDate()}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Slot selection */}
            {selDate && (
              <div className="form-group">
                <label className="form-label">Select Time Slot</label>
                {getAvailableSlots().length === 0 ? (
                  <p style={{ fontSize:'.88rem', color:'var(--clr-text-muted)' }}>No slots available for this day.</p>
                ) : (
                  <div className="slots-grid">
                    {getAvailableSlots().map(slot => (
                      <button
                        key={slot}
                        className={`slot-btn ${selSlot === slot ? 'selected' : ''}`}
                        onClick={() => setSelSlot(slot)}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div style={{ display:'flex', gap:'.75rem', marginTop:'1.5rem' }}>
              <button className="btn btn-outline" style={{ flex:1 }} onClick={() => setBookModal(null)}>Cancel</button>
              <button
                className="btn btn-primary" style={{ flex:1 }}
                onClick={handleBook}
                disabled={!selDate || !selSlot || booking}
              >
                {booking ? <><Loader size={16} /> Booking…</> : <><Check size={16} /> Confirm</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
