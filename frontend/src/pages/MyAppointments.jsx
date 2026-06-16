import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { apiGetAppointments, apiUpdateStatus, apiReschedule } from '../services/api';
import { Calendar, Clock, User, Award, AlertCircle, Check, X, Loader, CornerDownRight, ArrowRight } from 'lucide-react';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function getTodayAndNext13() {
  const dates = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    dates.push(d);
  }
  return dates;
}

function formatDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function MyAppointments() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  
  // Rescheduling state
  const [reschedModal, setReschedModal] = useState(null); // holds appointment object
  const [selDate, setSelDate] = useState('');
  const [selSlot, setSelSlot] = useState('');
  const [rescheduling, setRescheduling] = useState(false);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadAppointments = async () => {
    try {
      const data = await apiGetAppointments(token);
      setAppointments(data.data || []);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadAppointments();
    }
  }, [token]);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await apiUpdateStatus(token, id, 'Cancelled');
      showToast('Appointment cancelled successfully.');
      loadAppointments();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const openReschedule = (appt) => {
    setReschedModal(appt);
    setSelDate('');
    setSelSlot('');
  };

  const getAvailableSlots = () => {
    if (!reschedModal || !selDate) return [];
    const dayName = DAYS[new Date(selDate + 'T00:00:00').getDay()];
    // Doctor availability is populated on reschedModal.doctor.availability
    const sched = reschedModal.doctor?.availability?.find(a => a.day === dayName);
    return sched?.slots || [];
  };

  const handleConfirmReschedule = async () => {
    if (!selDate || !selSlot) {
      showToast('Please select a date and slot.', 'error');
      return;
    }
    setRescheduling(true);
    try {
      await apiReschedule(token, reschedModal._id, { date: selDate, slot: selSlot });
      showToast('Appointment rescheduled successfully! It is now pending review.');
      setReschedModal(null);
      loadAppointments();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setRescheduling(false);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Pending': return 'status-pending';
      case 'Approved': return 'status-confirmed';
      case 'Completed': return 'status-completed';
      case 'Cancelled': return 'status-cancelled';
      default: return '';
    }
  };

  const dates = getTodayAndNext13();

  return (
    <div className="my-appointments-page" style={{ background: 'var(--clr-bg-2)', minHeight: 'calc(100vh - 68px)', padding: '3rem 0' }}>
      {toast && (
        <div className="toast-container">
          <div className={`toast toast-${toast.type}`}>
            {toast.type === 'success' ? <Check size={18} color="var(--clr-success)" /> : <X size={18} color="var(--clr-danger)" />}
            <span>{toast.msg}</span>
          </div>
        </div>
      )}

      <div className="container">
        <div className="section-header my-appointments-header" style={{ marginBottom: '2rem' }}>
          <div className="badge"><Calendar size={13} /> Schedule</div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>My Appointments</h1>
          <p>View and manage your scheduled physiotherapy sessions</p>
        </div>

        {loading ? (
          <div className="flex-center" style={{ padding: '5rem 0' }}>
            <div className="loader-ring" />
          </div>
        ) : appointments.length === 0 ? (
          <div className="card empty-state" style={{ padding: '4rem 2rem' }}>
            <div className="empty-state-icon">📅</div>
            <h3>No Appointments Booked</h3>
            <p style={{ margin: '0.5rem 0 1.5rem' }}>You don't have any appointments scheduled at the moment.</p>
            <a href="/doctors" className="btn btn-primary">Book an Appointment</a>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {appointments.map((appt) => (
              <div key={appt._id} className="card appointment-card" style={{ padding: '1.75rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
                <div className="appointment-details" style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', minWidth: 0 }}>
                  
                  {/* Doctor image thumbnail */}
                  <div style={{ width: 70, height: 70, borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1.5px solid var(--clr-border)', flexShrink: 0 }}>
                    <img
                      src={appt.doctor?.image || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200'}
                      alt={appt.doctor?.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }}
                    />
                  </div>

                  {/* Booking details */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', flexWrap: 'wrap' }}>
                      <span className={`appt-status ${getStatusClass(appt.status)}`}>{appt.status}</span>
                      <span style={{ fontSize: '.78rem', color: 'var(--clr-text-muted)', display: 'inline-flex', alignItems: 'center', gap: '.25rem' }}>
                        ID: {appt._id.slice(-6).toUpperCase()}
                      </span>
                    </div>
                    
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '.4rem 0', wordBreak: 'break-word' }}>
                      {appt.appointmentType ? (
                        <span style={{ color: 'var(--clr-primary)' }}>
                          {appt.appointmentType === 'consultation' ? '🎁 Free 15-Min Consultation' : '🎁 Care Home Taster Session'}
                        </span>
                      ) : (
                        <>Dr. {appt.doctor?.name || 'Specialist'}</>
                      )}
                    </h3>
                    <p style={{ fontSize: '.82rem', color: 'var(--clr-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '.3rem' }}>
                      <Award size={14} /> {appt.doctor?.specialty || 'Physiotherapy'}
                    </p>

                    <div style={{ display: 'flex', gap: '1.5rem', marginTop: '.75rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '.85rem', color: 'var(--clr-text-2)', display: 'flex', alignItems: 'center', gap: '.4rem', fontWeight: 500 }}>
                        <Calendar size={15} color="var(--clr-primary)" /> {new Date(appt.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span style={{ fontSize: '.85rem', color: 'var(--clr-text-2)', display: 'flex', alignItems: 'center', gap: '.4rem', fontWeight: 500 }}>
                        <Clock size={15} color="var(--clr-primary)" /> {appt.slot}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="appointment-actions" style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap', alignSelf: 'start', flexDirection: 'column' }}>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => navigate(`/appointment/${appt._id}`)}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem' }}
                  >
                    <ArrowRight size={16} /> View Details
                  </button>
                  {(appt.status === 'Pending' || appt.status === 'Approved') && (
                    <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => openReschedule(appt)}
                      >
                        Reschedule
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleCancel(appt._id)}
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reschedule Modal */}
      {reschedModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setReschedModal(null); }}>
          <div className="modal">
            <div className="modal-header">
              <h3>Reschedule Appointment</h3>
              <button className="modal-close" onClick={() => setReschedModal(null)}><X size={20} /></button>
            </div>

            <div style={{ display: 'flex', gap: '.75rem', alignItems: 'center', background: 'var(--clr-bg-2)', padding: '.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
              <AlertCircle size={18} color="var(--clr-primary)" />
              <div style={{ fontSize: '.8rem', color: 'var(--clr-text-2)', lineHeight: 1.4 }}>
                Rescheduling will change your appointment time. For users, the status will reset to <strong>Pending</strong> review.
              </div>
            </div>

            {/* Date selection */}
            <div className="form-group">
              <label className="form-label">Select New Date</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(56px, 1fr))', gap: '.5rem' }}>
                {dates.map(d => {
                  const ds = formatDate(d);
                  const dayName = DAYS[d.getDay()];
                  const hasSlot = reschedModal.doctor?.availability?.some(a => a.day === dayName && a.slots.length > 0);
                  return (
                    <button
                      key={ds}
                      disabled={!hasSlot}
                      onClick={() => { setSelDate(ds); setSelSlot(''); }}
                      style={{
                        padding: '.5rem .5rem', borderRadius: 'var(--radius-md)', border: '1.5px solid',
                        borderColor: selDate === ds ? 'var(--clr-primary)' : 'var(--clr-border)',
                        background: selDate === ds ? 'var(--clr-primary)' : '#fff',
                        color: selDate === ds ? '#fff' : hasSlot ? 'var(--clr-text)' : 'var(--clr-text-light)',
                        fontSize: '.75rem', fontWeight: 600, cursor: hasSlot ? 'pointer' : 'not-allowed',
                        opacity: hasSlot ? 1 : .4, textAlign: 'center', transition: 'var(--transition)',
                      }}
                    >
                      <div>{dayName.slice(0, 3)}</div>
                      <div style={{ fontSize: '.9rem', fontWeight: 800 }}>{d.getDate()}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Slot selection */}
            {selDate && (
              <div className="form-group">
                <label className="form-label">Select New Time Slot</label>
                {getAvailableSlots().length === 0 ? (
                  <p style={{ fontSize: '.88rem', color: 'var(--clr-text-muted)' }}>No slots available for this day.</p>
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

            <div style={{ display: 'flex', gap: '.75rem', marginTop: '1.5rem' }}>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setReschedModal(null)}>Cancel</button>
              <button
                className="btn btn-primary" style={{ flex: 1 }}
                onClick={handleConfirmReschedule}
                disabled={!selDate || !selSlot || rescheduling}
              >
                {rescheduling ? <><Loader size={16} /> Rescheduling…</> : <><Check size={16} /> Confirm</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
