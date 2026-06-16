import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiGetAppointments, apiUpdateStatus, apiReschedule } from '../services/api';
import { Calendar, Clock, User, Award, AlertCircle, Check, X, Loader, Phone, Mail, MapPin, ArrowLeft, FileText } from 'lucide-react';

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

export default function AppointmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [reschedModal, setReschedModal] = useState(false);
  const [selDate, setSelDate] = useState('');
  const [selSlot, setSelSlot] = useState('');
  const [rescheduling, setRescheduling] = useState(false);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    const loadAppointment = async () => {
      try {
        const data = await apiGetAppointments(token);
        const appt = data.data?.find(a => a._id === id);
        if (appt) {
          setAppointment(appt);
        } else {
          showToast('Appointment not found', 'error');
          setTimeout(() => navigate('/my-appointments'), 2000);
        }
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        setLoading(false);
      }
    };

    if (token) loadAppointment();
  }, [token, id, navigate]);

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await apiUpdateStatus(token, appointment._id, 'Cancelled');
      showToast('Appointment cancelled successfully.');
      setTimeout(() => navigate('/my-appointments'), 2000);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const getAvailableSlots = () => {
    if (!selDate) return [];
    const dayName = DAYS[new Date(selDate + 'T00:00:00').getDay()];
    const sched = appointment.doctor?.availability?.find(a => a.day === dayName);
    return sched?.slots || [];
  };

  const handleReschedule = async () => {
    if (!selDate || !selSlot) {
      showToast('Please select a date and slot.', 'error');
      return;
    }
    setRescheduling(true);
    try {
      await apiReschedule(token, appointment._id, { date: selDate, slot: selSlot });
      showToast('Appointment rescheduled successfully! Pending review.');
      setReschedModal(false);
      setTimeout(() => navigate('/my-appointments'), 2000);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setRescheduling(false);
    }
  };

  const getStatusBadgeStyle = (status) => {
    const styles = {
      'Pending': { bg: '#fef9c3', color: '#854d0e' },
      'Approved': { bg: '#d1fae5', color: '#065f46' },
      'Completed': { bg: '#e0e7ff', color: '#3730a3' },
      'Cancelled': { bg: '#fee2e2', color: '#991b1b' },
    };
    return styles[status] || styles['Pending'];
  };

  if (loading) {
    return (
      <div style={{ background: 'var(--clr-bg-2)', minHeight: 'calc(100vh - 68px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="loader-ring" />
      </div>
    );
  }

  if (!appointment) {
    return (
      <div style={{ background: 'var(--clr-bg-2)', minHeight: 'calc(100vh - 68px)', padding: '3rem' }}>
        <div className="container">
          <div className="card empty-state">
            <div className="empty-state-icon">⚠️</div>
            <h3>Appointment Not Found</h3>
            <p>This appointment does not exist or has been deleted.</p>
          </div>
        </div>
      </div>
    );
  }

  const statusStyle = getStatusBadgeStyle(appointment.status);
  const appointmentDate = appointment.date ? new Date(appointment.date + 'T00:00:00') : null;
  const formattedDate = appointmentDate?.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }) || 'To Be Scheduled';

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

      <div className="container">
        {/* Header with back button */}
        <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <button 
            onClick={() => navigate('/my-appointments')}
            style={{ 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '.5rem',
              color: 'var(--clr-primary)',
              fontSize: '.95rem',
              fontWeight: 600,
              padding: '.5rem'
            }}
          >
            <ArrowLeft size={20} /> Back to Appointments
          </button>
        </div>

        {/* Main Content Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          
          {/* Left: Appointment Details */}
          <div className="card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '2rem', gap: '1rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Appointment Details</h2>
              <span style={{ 
                padding: '.5rem 1rem', 
                borderRadius: 'var(--radius-full)',
                background: statusStyle.bg,
                color: statusStyle.color,
                fontSize: '.85rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '.05em'
              }}>
                {appointment.status}
              </span>
            </div>

            {/* Date & Time */}
            <div style={{ marginBottom: '1.75rem' }}>
              <h4 style={{ fontSize: '.85rem', fontWeight: 700, color: 'var(--clr-text-muted)', margin: 0, marginBottom: '.5rem', textTransform: 'uppercase', letterSpacing: '.05em' }}>
                📅 Schedule
              </h4>
              <div style={{ background: 'var(--clr-bg-2)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
                <p style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0, marginBottom: '.5rem' }}>{formattedDate}</p>
                {appointment.slot ? (
                  <p style={{ fontSize: '.95rem', color: 'var(--clr-primary)', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                    <Clock size={18} /> {appointment.slot}
                  </p>
                ) : (
                  <p style={{ fontSize: '.85rem', color: 'var(--clr-text-muted)', margin: 0, fontStyle: 'italic' }}>
                    ⏰ Time to be confirmed by admin
                  </p>
                )}
              </div>
            </div>

            {/* Appointment ID */}
            <div style={{ marginBottom: '1.75rem', padding: '1rem', background: 'var(--clr-primary-light)', borderRadius: 'var(--radius-md)' }}>
              <p style={{ fontSize: '.8rem', color: 'var(--clr-text-muted)', margin: 0, marginBottom: '.25rem', textTransform: 'uppercase' }}>Booking ID</p>
              <p style={{ fontSize: '.95rem', fontWeight: 700, color: 'var(--clr-primary)', margin: 0, fontFamily: 'monospace' }}>{appointment._id.slice(-8).toUpperCase()}</p>
            </div>

            {/* Appointment Type - Show if free session */}
            {appointment.appointmentType && (
              <div style={{ marginBottom: '1.75rem', padding: '1rem', background: '#fef3c7', borderRadius: 'var(--radius-md)', border: '1.5px solid #fcd34d' }}>
                <p style={{ fontSize: '.8rem', color: '#92400e', margin: 0, marginBottom: '.25rem', textTransform: 'uppercase', fontWeight: 700 }}>Session Type</p>
                <p style={{ fontSize: '1rem', fontWeight: 700, color: '#b45309', margin: 0 }}>
                  {appointment.appointmentType === 'consultation' ? '🎁 Free 15-Minute Consultation' : '🎁 Care Home Free Taster Session'}
                </p>
              </div>
            )}

            {/* Actions */}
            {(appointment.status === 'Pending' || appointment.status === 'Approved') && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem', marginTop: '2rem' }}>
                <button
                  className="btn btn-outline"
                  onClick={() => setReschedModal(true)}
                  style={{ padding: '.65rem' }}
                >
                  📅 Reschedule
                </button>
                <button
                  className="btn btn-danger"
                  onClick={handleCancel}
                  style={{ padding: '.65rem' }}
                >
                  ❌ Cancel
                </button>
              </div>
            )}
          </div>

          {/* Right: Patient & Doctor Info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
            
            {/* Patient Card */}
            <div className="card" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                <User size={20} color="var(--clr-primary)" /> Patient Information
              </h3>
              <div style={{ background: 'var(--clr-bg-2)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
                <p style={{ fontSize: '.85rem', color: 'var(--clr-text-muted)', margin: 0, marginBottom: '.25rem', textTransform: 'uppercase', fontWeight: 700 }}>Name</p>
                <p style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 1rem' }}>{appointment.user?.name}</p>

                <p style={{ fontSize: '.85rem', color: 'var(--clr-text-muted)', margin: 0, marginBottom: '.25rem', textTransform: 'uppercase', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '.3rem' }}>
                  <Mail size={14} /> Email
                </p>
                <p style={{ fontSize: '.95rem', margin: '0 0 1rem', wordBreak: 'break-all' }}>{appointment.user?.email}</p>

                <p style={{ fontSize: '.85rem', color: 'var(--clr-text-muted)', margin: 0, marginBottom: '.25rem', textTransform: 'uppercase', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '.3rem' }}>
                  <Phone size={14} /> Phone
                </p>
                <p style={{ fontSize: '.95rem', margin: '0 0 1rem', fontWeight: 600, color: 'var(--clr-primary)' }}>{appointment.phone || appointment.user?.phone || 'Not provided'}</p>

                {appointment.address && (
                  <>
                    <p style={{ fontSize: '.85rem', color: 'var(--clr-text-muted)', margin: 0, marginBottom: '.25rem', textTransform: 'uppercase', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '.3rem' }}>
                      <MapPin size={14} /> Address
                    </p>
                    <p style={{ fontSize: '.9rem', margin: 0, lineHeight: 1.4, color: 'var(--clr-text-2)' }}>{appointment.address}</p>
                  </>
                )}
              </div>
            </div>

            {/* Specialist Card */}
            {appointment.doctor ? (
              <div className="card" style={{ padding: '2rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                  <Award size={20} color="var(--clr-primary)" /> Specialist Information
                </h3>
                <div style={{ background: 'var(--clr-bg-2)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
                  <p style={{ fontSize: '.85rem', color: 'var(--clr-text-muted)', margin: 0, marginBottom: '.25rem', textTransform: 'uppercase', fontWeight: 700 }}>Name</p>
                  <p style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 .75rem' }}>Dr. {appointment.doctor?.name}</p>

                  <p style={{ fontSize: '.85rem', color: 'var(--clr-text-muted)', margin: 0, marginBottom: '.25rem', textTransform: 'uppercase', fontWeight: 700 }}>Specialty</p>
                  <p style={{ fontSize: '.95rem', color: 'var(--clr-primary)', fontWeight: 600, margin: '0 0 1rem' }}>{appointment.doctor?.specialty}</p>

                  {appointment.doctor?.experience && (
                    <>
                      <p style={{ fontSize: '.85rem', color: 'var(--clr-text-muted)', margin: 0, marginBottom: '.25rem', textTransform: 'uppercase', fontWeight: 700 }}>Experience</p>
                      <p style={{ fontSize: '.95rem', margin: 0 }}>{appointment.doctor?.experience} years of clinical practice</p>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="card" style={{ padding: '2rem', background: 'linear-gradient(135deg, var(--clr-primary-light) 0%, #f0f4ff 100%)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                  <Award size={20} color="var(--clr-primary)" /> Specialist Assignment
                </h3>
                <div style={{ background: 'rgba(255,255,255,.6)', padding: '1.25rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                  <p style={{ fontSize: '.95rem', color: 'var(--clr-primary)', fontWeight: 600, margin: 0 }}>
                    ⏳ Specialist will be assigned after admin review
                  </p>
                  <p style={{ fontSize: '.85rem', color: 'var(--clr-text-muted)', margin: '.5rem 0 0', lineHeight: 1.4 }}>
                    We'll notify you via email once your specialist has been assigned and your appointment is scheduled.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reschedule Modal */}
      {reschedModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setReschedModal(false); }}>
          <div className="modal">
            <div className="modal-header">
              <h3>Reschedule Appointment</h3>
              <button className="modal-close" onClick={() => setReschedModal(false)}><X size={20} /></button>
            </div>

            <div style={{ display: 'flex', gap: '.75rem', alignItems: 'center', background: 'var(--clr-bg-2)', padding: '.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
              <AlertCircle size={18} color="var(--clr-primary)" />
              <div style={{ fontSize: '.8rem', color: 'var(--clr-text-2)', lineHeight: 1.4 }}>
                Your appointment status will reset to <strong>Pending</strong> and require admin review.
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Select New Date</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(56px, 1fr))', gap: '.5rem' }}>
                {getTodayAndNext13().map(d => {
                  const ds = formatDate(d);
                  const dayName = DAYS[d.getDay()];
                  const hasSlot = appointment.doctor?.availability?.some(a => a.day === dayName && a.slots.length > 0);
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
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setReschedModal(false)}>Cancel</button>
              <button
                className="btn btn-primary" style={{ flex: 1 }}
                onClick={handleReschedule}
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
