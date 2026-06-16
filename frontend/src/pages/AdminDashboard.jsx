import { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useAuth } from '../context/AuthContext';
import {
  apiGetAdminStats,
  apiGetAppointments,
  apiUpdateStatus,
  apiReschedule,
  apiGetDoctors,
  apiCreateDoctor,
  apiUpdateDoctor,
  apiDeleteDoctor,
  apiGetAllUsers,
  apiUpdateUserRole,
} from '../services/api';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Award,
  Clock,
  PlusCircle,
  Edit2,
  Trash2,
  Check,
  X,
  Loader,
  ListFilter,
} from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DEFAULT_SLOTS = [
  '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM'
];

export default function AdminDashboard() {
  const { token, user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [toast, setToast] = useState(null);

  // Stats data
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Appointments data
  const [appointments, setAppointments] = useState([]);
  const [apptsLoading, setApptsLoading] = useState(true);
  const [apptFilter, setApptFilter] = useState('All');

  // Rescheduling modal state (admin level)
  const [reschedModal, setReschedModal] = useState(null);
  const [selDate, setSelDate] = useState('');
  const [selSlot, setSelSlot] = useState('');
  const [rescheduling, setRescheduling] = useState(false);

  // Doctors data
  const [doctors, setDoctors] = useState([]);
  const [docsLoading, setDocsLoading] = useState(true);
  const [docModal, setDocModal] = useState(null); // { mode: 'create' | 'edit', doctor?: obj }
  const [docForm, setDocForm] = useState({
    name: '', specialty: '', experience: '', bio: '', image: '',
    availability: DAYS.map(d => ({ day: d, slots: [] }))
  });
  const [docSubmitting, setDocSubmitting] = useState(false);

  // Users data
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);



  const currentUserId = currentUser?._id || currentUser?.id;

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Loaders
  const loadOverview = async () => {
    setStatsLoading(true);
    try {
      const data = await apiGetAdminStats(token);
      setStats(data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setStatsLoading(false);
    }
  };

  const loadAppointments = async () => {
    setApptsLoading(true);
    try {
      const data = await apiGetAppointments(token);
      setAppointments(data.data || []);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setApptsLoading(false);
    }
  };

  const loadDoctors = async () => {
    setDocsLoading(true);
    try {
      const data = await apiGetDoctors();
      setDoctors(data.data || []);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setDocsLoading(false);
    }
  };

  const loadUsers = async () => {
    setUsersLoading(true);
    try {
      const data = await apiGetAllUsers(token);
      setUsers(data.data || []);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setUsersLoading(false);
    }
  };



  useEffect(() => {
    if (!token) return;
    if (activeTab === 'overview') loadOverview();
    if (activeTab === 'appointments') loadAppointments();
    if (activeTab === 'doctors') loadDoctors();
    if (activeTab === 'users') loadUsers();
  }, [activeTab, token]);

  useEffect(() => {
    if (token) loadOverview();
  }, [token]);

  // Appointment handlers
  const handleApproveStatus = async (id, status) => {
    try {
      await apiUpdateStatus(token, id, status);
      showToast(`Appointment status updated to ${status}.`);
      loadAppointments();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const openRescheduleModal = (appt) => {
    setReschedModal(appt);
    setSelDate(appt.date);
    setSelSlot('');
  };

  const handleAdminReschedule = async () => {
    if (!selDate || !selSlot) {
      showToast('Please specify reschedule date and slot.', 'error');
      return;
    }
    setRescheduling(true);
    try {
      await apiReschedule(token, reschedModal._id, { date: selDate, slot: selSlot });
      showToast('Appointment rescheduled successfully.');
      setReschedModal(null);
      loadAppointments();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setRescheduling(false);
    }
  };

  // User promotion handlers
  const handleUpdateRole = async (userId, newRole) => {
    if (userId === currentUserId) {
      showToast('You cannot modify your own administrator role.', 'error');
      return;
    }
    try {
      await apiUpdateUserRole(token, userId, newRole);
      showToast(`User role updated to ${newRole}.`);
      loadUsers();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Doctor CRUD handlers
  const openDocModal = (mode, doc = null) => {
    if (mode === 'create') {
      setDocForm({
        name: '', specialty: '', experience: '', bio: '', image: '',
        availability: DAYS.map(d => ({ day: d, slots: [] }))
      });
      setDocModal({ mode: 'create' });
    } else {
      setDocForm({
        name: doc.name || '',
        specialty: doc.specialty || '',
        experience: doc.experience || '',
        bio: doc.bio || '',
        image: doc.image || '',
        availability: DAYS.map(dayName => {
          const matched = doc.availability?.find(a => a.day === dayName);
          return { day: dayName, slots: matched ? matched.slots : [] };
        })
      });
      setDocModal({ mode: 'edit', doctor: doc });
    }
  };

  const handleDocSubmit = async (e) => {
    e.preventDefault();
    if (!docForm.name || !docForm.specialty || !docForm.experience) {
      showToast('Please fill in Name, Specialty and Experience.', 'error');
      return;
    }
    setDocSubmitting(true);
    try {
      if (docModal.mode === 'create') {
        await apiCreateDoctor(token, docForm);
        showToast('Specialist added successfully!');
      } else {
        await apiUpdateDoctor(token, docModal.doctor._id, docForm);
        showToast('Specialist profile updated successfully.');
      }
      setDocModal(null);
      loadDoctors();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setDocSubmitting(false);
    }
  };

  const handleDeleteDoctor = async (id) => {
    if (!window.confirm('Are you sure you want to remove this doctor? This action is permanent.')) return;
    try {
      await apiDeleteDoctor(token, id);
      showToast('Doctor deleted successfully.');
      loadDoctors();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const toggleSlotSelection = (dayIndex, slot) => {
    setDocForm(prev => {
      const updatedAvail = [...prev.availability];
      const slots = [...updatedAvail[dayIndex].slots];
      const slotIdx = slots.indexOf(slot);
      if (slotIdx > -1) {
        slots.splice(slotIdx, 1);
      } else {
        slots.push(slot);
      }
      updatedAvail[dayIndex] = { ...updatedAvail[dayIndex], slots };
      return { ...prev, availability: updatedAvail };
    });
  };

  const getAppointmentTypeLabel = (appt) => {
    if (appt.appointmentType === 'consultation') return 'Free 15-Min Consultation';
    if (appt.appointmentType === 'taster') return 'Care Home Taster Session';
    return null;
  };

  const filteredAppointments = appointments.filter(a => {
    if (apptFilter === 'All') return true;
    return a.status === apptFilter;
  });

  const now = new Date();
  const monthName = now.toLocaleString('en-GB', { month: 'long', year: 'numeric' });
  const monthlyTrend = stats?.stats?.monthlyTrend?.length
    ? stats.stats.monthlyTrend
    : [];
  const chartLabels = monthlyTrend.length ? monthlyTrend.map(item => item.label) : ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
  const chartCounts = monthlyTrend.length ? monthlyTrend.map(item => item.count) : [0, 0, 0, 0];
  const currentMonthCounts = stats?.stats?.currentMonthWeekBreakdown?.length
    ? stats.stats.currentMonthWeekBreakdown
    : [0, 0, 0, 0];
  const currentMonthTotal = stats?.stats?.currentMonthPatients ?? currentMonthCounts.reduce((sum, value) => sum + value, 0);
  const monthlyChartData = {
    labels: chartLabels,
    datasets: [
      {
        label: 'Patients',
        data: chartCounts,
        backgroundColor: ['#4f8ef7', '#6366f1', '#0052cc', '#3b82f6', '#0ea5e9', '#2563eb'],
        borderRadius: 8,
      },
    ],
  };
  const monthlyChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (ctx) => `${ctx.parsed.y} patients` } },
    },
    scales: {
      y: { beginAtZero: true, ticks: { precision: 0 } },
      x: { grid: { display: false } },
    },
  };

  return (
    <div className="dashboard">
      {toast && (
        <div className="toast-container">
          <div className={`toast toast-${toast.type}`}>
            {toast.type === 'success' ? <Check size={18} color="var(--clr-success)" /> : <X size={18} color="var(--clr-danger)" />}
            <span>{toast.msg}</span>
          </div>
        </div>
      )}

      <div className="dashboard-layout">
        
        {/* Sidebar Nav */}
        <div className="sidebar" style={{ display: 'flex' }}>
          <div style={{ marginBottom: '1.5rem', paddingLeft: '1rem' }}>
            <h3 style={{ fontSize: '.78rem', color: 'var(--clr-text-muted)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Admin Control</h3>
          </div>
          
          <button onClick={() => setActiveTab('overview')} className={`sidebar-link ${activeTab === 'overview' ? 'active' : ''}`} style={{ border: 0, background: 'none', textAlign: 'left', width: '100%' }}>
            <LayoutDashboard size={18} /> Overview Stats
          </button>
          
          <button onClick={() => setActiveTab('appointments')} className={`sidebar-link ${activeTab === 'appointments' ? 'active' : ''}`} style={{ border: 0, background: 'none', textAlign: 'left', width: '100%' }}>
            <Calendar size={18} /> Appointments
          </button>
          
          <button onClick={() => setActiveTab('doctors')} className={`sidebar-link ${activeTab === 'doctors' ? 'active' : ''}`} style={{ border: 0, background: 'none', textAlign: 'left', width: '100%' }}>
            <Award size={18} /> Manage Doctors
          </button>
          
          <button onClick={() => setActiveTab('users')} className={`sidebar-link ${activeTab === 'users' ? 'active' : ''}`} style={{ border: 0, background: 'none', textAlign: 'left', width: '100%' }}>
            <Users size={18} /> User Roles
          </button>


        </div>

        {/* Dashboard Content Area */}
        <div className="dashboard-content">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div>
              <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Clinic Performance</h1>
                <p style={{ color: 'var(--clr-text-muted)' }}>Real-time clinic activity metrics and trends</p>
              </div>

              {statsLoading ? (
                <div className="flex-center" style={{ padding: '4rem 0' }}><div className="loader-ring" /></div>
              ) : (
                <>
                  <div className="grid-4" style={{ marginBottom: '2.5rem' }}>
                    <div className="stat-card">
                      <h3>This Month Patients</h3>
                      <div className="num">{stats?.stats?.currentMonthPatients || 0}</div>
                      <div className="trend">Bookings in {monthName}</div>
                    </div>
                    <div className="stat-card">
                      <h3>Unique Patients</h3>
                      <div className="num">{stats?.stats?.currentMonthUniquePatients || 0}</div>
                      <div className="trend">Distinct patient accounts</div>
                    </div>
                    <div className="stat-card">
                      <h3>Specialist Staff</h3>
                      <div className="num">{stats?.stats?.totalDoctors || 0}</div>
                      <div className="trend">Active therapists</div>
                    </div>
                    <div className="stat-card">
                      <h3>Bookings Handled</h3>
                      <div className="num">{stats?.stats?.totalAppointments || 0}</div>
                      <div className="trend">Total booking capacity</div>
                    </div>
                  </div>

                  {/* ── Monthly Patients Chart ── */}
                  <div className="card" style={{ padding: '1.75rem', marginTop: '2rem', overflowX: 'auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>Patient Activity</h3>
                        <p style={{ fontSize: '0.78rem', color: 'var(--clr-text-muted)', margin: '0.25rem 0 0' }}>Last 6 months from database</p>
                      </div>
                      <span className="badge" style={{ background: '#e8f0fe', color: 'var(--clr-primary)', fontWeight: 700, fontSize: '0.78rem' }}>
                        Total: {currentMonthTotal} patients
                      </span>
                    </div>
                    <div className="dashboard-chart">
                      <Bar data={monthlyChartData} options={monthlyChartOptions} />
                    </div>
                    <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                      {chartLabels.map((label, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--clr-text-muted)' }}>
                          <div style={{ width: 10, height: 10, borderRadius: 3, background: '#4f8ef7' }} />
                          {label}: <strong style={{ color: 'var(--clr-text)' }}>{chartCounts[i] || 0}</strong>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid-2" style={{ marginTop: '2rem' }}>

                    {/* Doctor appointment distribution */}
                    <div className="card" style={{ padding: '1.75rem' }}>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '1.25rem' }}>Therapist Workloads</h3>
                      {stats?.doctorStats?.length === 0 ? (
                        <p style={{ color: 'var(--clr-text-muted)', fontSize: '.88rem' }}>No therapist profiles configured.</p>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          {stats?.doctorStats?.map((doc, idx) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '.75rem', borderBottom: '1px solid var(--clr-border)' }}>
                              <div>
                                <div style={{ fontSize: '.9rem', fontWeight: 700 }}>Dr. {doc.name}</div>
                                <div style={{ fontSize: '.75rem', color: 'var(--clr-text-muted)' }}>{doc.specialty}</div>
                              </div>
                              <span className="badge" style={{ fontSize: '.78rem', padding: '.25rem .75rem' }}>
                                {doc.appointments} bookings
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Booking Breakdown */}
                    <div className="card" style={{ padding: '1.75rem' }}>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '1.25rem' }}>Booking Distribution</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.88rem' }}>
                          <span>Confirmed Appointments</span>
                          <strong style={{ color: 'var(--clr-success)' }}>{stats?.stats?.approvedAppointments || 0}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.88rem' }}>
                          <span>Completed Sessions</span>
                          <strong style={{ color: 'var(--clr-primary)' }}>{stats?.stats?.completedAppointments || 0}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.88rem' }}>
                          <span>Cancelled Bookings</span>
                          <strong style={{ color: 'var(--clr-danger)' }}>{stats?.stats?.cancelledAppointments || 0}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB 2: APPOINTMENTS */}
          {activeTab === 'appointments' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h1 style={{ fontSize: 'clamp(1.5rem, 5vw, 1.75rem)', fontWeight: 800, marginBottom: '.3rem' }}>Manage Bookings</h1>
                  <p style={{ color: 'var(--clr-text-muted)', fontSize: '.9rem' }}>Approve, cancel, or reschedule sessions</p>
                </div>
                <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center', minWidth: '150px' }}>
                  <ListFilter size={16} color="var(--clr-text-muted)" />
                  <select
                    className="form-input"
                    value={apptFilter}
                    onChange={(e) => setApptFilter(e.target.value)}
                    style={{ padding: '.4rem 2rem .4rem 1rem', fontSize: '.82rem', width: '100%' }}
                  >
                    <option value="All">All Statuses</option>
                    <option value="Pending">Pending Review</option>
                    <option value="Approved">Approved</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {apptsLoading ? (
                <div className="flex-center" style={{ padding: '4rem 0' }}><div className="loader-ring" /></div>
              ) : filteredAppointments.length === 0 ? (
                <div className="card empty-state">
                  <div className="empty-state-icon">📅</div>
                  <h3>No Appointments Found</h3>
                  <p>There are no bookings matching the selected status filter.</p>
                </div>
              ) : (
                <>
                  {/* Desktop Table View */}
                  <div className="appointment-table-desktop card table-scroll">
                    <table>
                      <thead>
                        <tr style={{ background: 'var(--clr-bg-2)', borderBottom: '1px solid var(--clr-border)', fontWeight: 700 }}>
                          <th style={{ padding: '1rem' }}>Patient</th>
                          <th style={{ padding: '1rem' }}>Specialist</th>
                          <th style={{ padding: '1rem' }}>Schedule</th>
                          <th style={{ padding: '1rem' }}>Status</th>
                          <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAppointments.map(appt => (
                          <tr key={appt._id} style={{ borderBottom: '1px solid var(--clr-border)' }}>
                            <td style={{ padding: '1rem' }}>
                              <div style={{ fontWeight: 700 }}>{appt.user?.name || 'Deleted User'}</div>
                              <div style={{ fontSize: '.75rem', color: 'var(--clr-text-muted)' }}>{appt.user?.email}</div>
                              <div style={{ fontSize: '.75rem', color: 'var(--clr-primary)', fontWeight: 600 }}>{appt.phone || appt.user?.phone || 'Phone not provided'}</div>
                            </td>
                            <td style={{ padding: '1rem' }}>
                              <div style={{ fontWeight: 600 }}>
                                {getAppointmentTypeLabel(appt) || `Dr. ${appt.doctor?.name || 'Staff'}`}
                              </div>
                              <div style={{ fontSize: '.75rem', color: 'var(--clr-primary)', fontWeight: 500 }}>
                                {getAppointmentTypeLabel(appt) ? 'Free session — specialist pending' : appt.doctor?.specialty}
                              </div>
                            </td>
                            <td style={{ padding: '1rem' }}>
                              <div>{appt.date || 'Pending scheduling'}</div>
                              <div style={{ fontSize: '.75rem', color: 'var(--clr-text-muted)', display: 'inline-flex', alignItems: 'center', gap: '.25rem' }}>
                                <Clock size={12} /> {appt.slot || 'TBC'}
                              </div>
                            </td>
                            <td style={{ padding: '1rem' }}>
                              <span className={`appt-status ${
                                appt.status === 'Pending' ? 'status-pending' :
                                appt.status === 'Approved' ? 'status-confirmed' :
                                appt.status === 'Completed' ? 'status-completed' : 'status-cancelled'
                              }`} style={{ fontSize: '.72rem', padding: '.15rem .5rem' }}>
                                {appt.status}
                              </span>
                            </td>
                            <td style={{ padding: '1rem', textAlign: 'right' }}>
                              <div style={{ display: 'flex', gap: '.4rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                                {appt.status === 'Pending' && (
                                  <button
                                    className="btn btn-primary btn-sm"
                                    onClick={() => handleApproveStatus(appt._id, 'Approved')}
                                    style={{ padding: '.3rem .6rem' }}
                                    title="Approve Booking"
                                  >
                                    <Check size={14} />
                                  </button>
                                )}
                                {appt.status === 'Approved' && (
                                  <button
                                    className="btn btn-outline btn-sm"
                                    onClick={() => handleApproveStatus(appt._id, 'Completed')}
                                    style={{ padding: '.3rem .6rem', color: 'var(--clr-success)', borderColor: 'var(--clr-success)' }}
                                    title="Complete Session"
                                  >
                                    Done
                                  </button>
                                )}
                                {(appt.status === 'Pending' || appt.status === 'Approved') && appt.doctor && (
                                  <>
                                    <button
                                      className="btn btn-outline btn-sm"
                                      onClick={() => openRescheduleModal(appt)}
                                      style={{ padding: '.3rem .6rem' }}
                                      title="Reschedule Booking"
                                    >
                                      Move
                                    </button>
                                    <button
                                      className="btn btn-danger btn-sm"
                                      onClick={() => handleApproveStatus(appt._id, 'Cancelled')}
                                      style={{ padding: '.3rem .6rem' }}
                                      title="Cancel / Reject"
                                    >
                                      <X size={14} />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="appointment-cards-mobile admin-card-list">
                    {filteredAppointments.map(appt => (
                      <div key={appt._id} className="card" style={{ padding: '1.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem', gap: '.75rem' }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <h4 style={{ fontSize: '.85rem', fontWeight: 700, margin: 0, marginBottom: '.25rem', color: 'var(--clr-text-muted)' }}>PATIENT</h4>
                            <p style={{ fontSize: '.9rem', fontWeight: 600, margin: '0 0 .25rem', wordBreak: 'break-word' }}>{appt.user?.name || 'Deleted User'}</p>
                            <p style={{ fontSize: '.75rem', color: 'var(--clr-text-muted)', margin: 0 }}>{appt.user?.email}</p>
                            <p style={{ fontSize: '.75rem', color: 'var(--clr-primary)', fontWeight: 600, margin: '.25rem 0 0' }}>{appt.phone || appt.user?.phone || 'N/A'}</p>
                          </div>
                          <span className={`appt-status ${
                            appt.status === 'Pending' ? 'status-pending' :
                            appt.status === 'Approved' ? 'status-confirmed' :
                            appt.status === 'Completed' ? 'status-completed' : 'status-cancelled'
                          }`} style={{ fontSize: '.68rem', padding: '.2rem .5rem', flexShrink: 0 }}>
                            {appt.status}
                          </span>
                        </div>

                        <div style={{ borderTop: '1px solid var(--clr-border)', paddingTop: '1rem', marginBottom: '1rem' }}>
                          <h4 style={{ fontSize: '.85rem', fontWeight: 700, margin: 0, marginBottom: '.25rem', color: 'var(--clr-text-muted)' }}>SPECIALIST</h4>
                          <p style={{ fontSize: '.9rem', fontWeight: 600, margin: '0 0 .25rem' }}>
                            {getAppointmentTypeLabel(appt) || `Dr. ${appt.doctor?.name || 'Staff'}`}
                          </p>
                          <p style={{ fontSize: '.75rem', color: 'var(--clr-primary)', fontWeight: 500, margin: 0 }}>
                            {getAppointmentTypeLabel(appt) ? 'Free session — specialist pending' : appt.doctor?.specialty}
                          </p>
                        </div>

                        <div style={{ borderTop: '1px solid var(--clr-border)', paddingTop: '1rem', marginBottom: '1rem' }}>
                          <h4 style={{ fontSize: '.85rem', fontWeight: 700, margin: 0, marginBottom: '.5rem', color: 'var(--clr-text-muted)' }}>SCHEDULE</h4>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                              <span style={{ fontSize: '.75rem', color: 'var(--clr-text-muted)', display: 'block', marginBottom: '.25rem' }}>Date</span>
                              <p style={{ fontSize: '.9rem', fontWeight: 600, margin: 0 }}>{appt.date || 'Pending scheduling'}</p>
                            </div>
                            <div>
                              <span style={{ fontSize: '.75rem', color: 'var(--clr-text-muted)', display: 'block', marginBottom: '.25rem' }}>Time</span>
                              <p style={{ fontSize: '.9rem', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '.3rem' }}>
                                <Clock size={13} /> {appt.slot || 'TBC'}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div style={{ borderTop: '1px solid var(--clr-border)', paddingTop: '1rem' }}>
                          <h4 style={{ fontSize: '.85rem', fontWeight: 700, margin: 0, marginBottom: '.75rem', color: 'var(--clr-text-muted)' }}>ACTIONS</h4>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(70px, 1fr))', gap: '.5rem' }}>
                            {appt.status === 'Pending' && (
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() => handleApproveStatus(appt._id, 'Approved')}
                                style={{ padding: '.4rem .5rem', fontSize: '.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.3rem' }}
                                title="Approve Booking"
                              >
                                <Check size={14} /> Approve
                              </button>
                            )}
                            {appt.status === 'Approved' && (
                              <button
                                className="btn btn-outline btn-sm"
                                onClick={() => handleApproveStatus(appt._id, 'Completed')}
                                style={{ padding: '.4rem .5rem', fontSize: '.75rem', color: 'var(--clr-success)', borderColor: 'var(--clr-success)' }}
                                title="Complete Session"
                              >
                                Done
                              </button>
                            )}
                            {(appt.status === 'Pending' || appt.status === 'Approved') && appt.doctor && (
                              <>
                                <button
                                  className="btn btn-outline btn-sm"
                                  onClick={() => openRescheduleModal(appt)}
                                  style={{ padding: '.4rem .5rem', fontSize: '.75rem' }}
                                  title="Reschedule Booking"
                                >
                                  Reschedule
                                </button>
                                <button
                                  className="btn btn-danger btn-sm"
                                  onClick={() => handleApproveStatus(appt._id, 'Cancelled')}
                                  style={{ padding: '.4rem .5rem', fontSize: '.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.3rem' }}
                                  title="Cancel / Reject"
                                >
                                  <X size={14} /> Cancel
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB 3: DOCTORS CRUD */}
          {activeTab === 'doctors' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                  <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Clinic Specialists</h1>
                  <p style={{ color: 'var(--clr-text-muted)' }}>Configure doctor profiles and schedules</p>
                </div>
                <button className="btn btn-primary" onClick={() => openDocModal('create')}>
                  <PlusCircle size={16} /> Add Specialist
                </button>
              </div>

              {docsLoading ? (
                <div className="flex-center" style={{ padding: '4rem 0' }}><div className="loader-ring" /></div>
              ) : doctors.length === 0 ? (
                <div className="card empty-state">
                  <div className="empty-state-icon">🧑‍⚕️</div>
                  <h3>No Doctors Configured</h3>
                  <p>Add specialist clinic staff to activate availability bookings.</p>
                </div>
              ) : (
                <div className="grid-3">
                  {doctors.map(doc => (
                    <div key={doc._id} className="card doctor-card">
                      <div className="doctor-img-wrap" style={{ height: '180px' }}>
                        <img src={doc.image || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300'} alt={doc.name} />
                      </div>
                      <div className="doctor-info" style={{ padding: '1.25rem' }}>
                        <span className="doctor-specialty">{doc.specialty}</span>
                        <h3 style={{ fontSize: '.95rem' }}>{doc.name}</h3>
                        <p style={{ fontSize: '.78rem', color: 'var(--clr-text-muted)', marginTop: '.25rem' }}>{doc.experience} years of clinical practice</p>
                        
                        <div style={{ display: 'flex', gap: '.5rem', marginTop: '1.25rem' }}>
                          <button
                            className="btn btn-outline btn-sm"
                            style={{ flex: 1, padding: '.4rem' }}
                            onClick={() => openDocModal('edit', doc)}
                          >
                            <Edit2 size={13} /> Edit
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            style={{ padding: '.4rem' }}
                            onClick={() => handleDeleteDoctor(doc._id)}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: USER ROLES */}
          {activeTab === 'users' && (
            <div>
              <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: 'clamp(1.5rem, 5vw, 1.75rem)', fontWeight: 800, marginBottom: '.3rem' }}>Manage Security Roles</h1>
                <p style={{ color: 'var(--clr-text-muted)', fontSize: '.9rem' }}>Promote clients or authorize admin credentials</p>
              </div>

              {usersLoading ? (
                <div className="flex-center" style={{ padding: '4rem 0' }}><div className="loader-ring" /></div>
              ) : users.length === 0 ? (
                <div className="card empty-state">
                  <div className="empty-state-icon">👥</div>
                  <h3>No Users Found</h3>
                  <p>No user accounts in the system yet.</p>
                </div>
              ) : (
                <>
                  {/* Desktop Table View */}
                  <div className="users-table-desktop card table-scroll">
                    <table>
                      <thead>
                        <tr style={{ background: 'var(--clr-bg-2)', borderBottom: '1px solid var(--clr-border)', fontWeight: 700 }}>
                          <th style={{ padding: '1rem' }}>User Profile</th>
                          <th style={{ padding: '1rem' }}>Joined Date</th>
                          <th style={{ padding: '1rem' }}>Current Role</th>
                          <th style={{ padding: '1rem', textAlign: 'right' }}>Authorization Adjustments</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map(u => (
                          <tr key={u._id} style={{ borderBottom: '1px solid var(--clr-border)' }}>
                            <td style={{ padding: '1rem' }}>
                              <div style={{ fontWeight: 700 }}>{u.name}</div>
                              <div style={{ fontSize: '.75rem', color: 'var(--clr-text-muted)' }}>{u.email}</div>
                            </td>
                            <td style={{ padding: '1rem', color: 'var(--clr-text-muted)', fontSize: '.9rem' }}>
                              {new Date(u.createdAt).toLocaleDateString('en-US')}
                            </td>
                            <td style={{ padding: '1rem' }}>
                              <span className="badge" style={{ fontSize: '.72rem', padding: '.15rem .5rem', textTransform: 'uppercase' }}>
                                {u.role}
                              </span>
                            </td>
                            <td style={{ padding: '1rem', textAlign: 'right' }}>
                              {u._id !== currentUserId ? (
                                <div style={{ display: 'flex', gap: '.4rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                                  <button
                                    className="btn btn-outline btn-sm"
                                    onClick={() => handleUpdateRole(u._id, 'user')}
                                    disabled={u.role === 'user'}
                                    style={{ padding: '.25rem .5rem', fontSize: '.75rem' }}
                                  >
                                    Client
                                  </button>
                                  <button
                                    className="btn btn-outline btn-sm"
                                    onClick={() => handleUpdateRole(u._id, 'doctor')}
                                    disabled={u.role === 'doctor'}
                                    style={{ padding: '.25rem .5rem', fontSize: '.75rem' }}
                                  >
                                    Doctor
                                  </button>
                                </div>
                              ) : (
                                <span style={{ fontSize: '.78rem', color: 'var(--clr-text-muted)', fontStyle: 'italic' }}>
                                  Your Account
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="users-cards-mobile admin-card-list">
                    {users.map(u => (
                      <div key={u._id} className="card" style={{ padding: '1.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem', gap: '.75rem' }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <h4 style={{ fontSize: '.85rem', fontWeight: 700, margin: 0, marginBottom: '.25rem', color: 'var(--clr-text-muted)' }}>USER PROFILE</h4>
                            <p style={{ fontSize: '.9rem', fontWeight: 600, margin: '0 0 .25rem', wordBreak: 'break-word' }}>{u.name}</p>
                            <p style={{ fontSize: '.75rem', color: 'var(--clr-text-muted)', margin: 0 }}>{u.email}</p>
                          </div>
                          <span className="badge" style={{ fontSize: '.68rem', padding: '.2rem .5rem', textTransform: 'uppercase', flexShrink: 0 }}>
                            {u.role}
                          </span>
                        </div>

                        <div style={{ borderTop: '1px solid var(--clr-border)', paddingTop: '1rem', marginBottom: '1rem' }}>
                          <h4 style={{ fontSize: '.85rem', fontWeight: 700, margin: 0, marginBottom: '.5rem', color: 'var(--clr-text-muted)' }}>DETAILS</h4>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                              <span style={{ fontSize: '.75rem', color: 'var(--clr-text-muted)', display: 'block', marginBottom: '.25rem' }}>Joined Date</span>
                              <p style={{ fontSize: '.9rem', fontWeight: 600, margin: 0 }}>
                                {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </p>
                            </div>
                            <div>
                              <span style={{ fontSize: '.75rem', color: 'var(--clr-text-muted)', display: 'block', marginBottom: '.25rem' }}>Account Status</span>
                              <p style={{ fontSize: '.9rem', fontWeight: 600, margin: 0, color: 'var(--clr-success)' }}>Active</p>
                            </div>
                          </div>
                        </div>

                        <div style={{ borderTop: '1px solid var(--clr-border)', paddingTop: '1rem' }}>
                          {u._id !== currentUserId ? (
                            <>
                              <h4 style={{ fontSize: '.85rem', fontWeight: 700, margin: 0, marginBottom: '.75rem', color: 'var(--clr-text-muted)' }}>CHANGE ROLE</h4>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: '.5rem' }}>
                                <button
                                  className="btn btn-outline btn-sm"
                                  onClick={() => handleUpdateRole(u._id, 'user')}
                                  disabled={u.role === 'user'}
                                  style={{ padding: '.4rem .5rem', fontSize: '.75rem', opacity: u.role === 'user' ? 0.5 : 1 }}
                                >
                                  Client
                                </button>
                                <button
                                  className="btn btn-outline btn-sm"
                                  onClick={() => handleUpdateRole(u._id, 'doctor')}
                                  disabled={u.role === 'doctor'}
                                  style={{ padding: '.4rem .5rem', fontSize: '.75rem', opacity: u.role === 'doctor' ? 0.5 : 1 }}
                                >
                                  Doctor
                                </button>
                              </div>
                            </>
                          ) : (
                            <div style={{ padding: '.75rem', background: 'var(--clr-primary-light)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                              <p style={{ fontSize: '.8rem', color: 'var(--clr-primary)', fontWeight: 600, margin: 0 }}>
                                👤 This is your account - cannot modify own role
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}



        </div>
      </div>

      {/* Specialist Modal (CRUD) */}
      {docModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setDocModal(null); }}>
          <div className="modal" style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <h3>{docModal.mode === 'create' ? 'Add Specialist Therapist' : 'Edit Specialist Profile'}</h3>
              <button className="modal-close" onClick={() => setDocModal(null)}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleDocSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Specialist Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={docForm.name}
                    onChange={(e) => setDocForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Dr. Sarah Jenkins"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Specialty Core</label>
                  <input
                    type="text"
                    className="form-input"
                    value={docForm.specialty}
                    onChange={(e) => setDocForm(f => ({ ...f, specialty: e.target.value }))}
                    placeholder="e.g. Sports Injury Rehab"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Years of Experience</label>
                  <input
                    type="number"
                    className="form-input"
                    value={docForm.experience}
                    onChange={(e) => setDocForm(f => ({ ...f, experience: e.target.value }))}
                    placeholder="e.g. 10"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Profile Image Link</label>
                  <input
                    type="text"
                    className="form-input"
                    value={docForm.image}
                    onChange={(e) => setDocForm(f => ({ ...f, image: e.target.value }))}
                    placeholder="https://unsplash.com/..."
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Bio Description</label>
                <textarea
                  className="form-input"
                  rows={2}
                  value={docForm.bio}
                  onChange={(e) => setDocForm(f => ({ ...f, bio: e.target.value }))}
                  placeholder="Describe doctor qualifications and treatment approach..."
                  style={{ resize: 'vertical' }}
                />
              </div>

              {/* Availability Setup */}
              <div className="form-group">
                <label className="form-label" style={{ marginBottom: '.75rem' }}>Availability Schedule Slots</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '220px', overflowY: 'auto', border: '1px solid var(--clr-border)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                  {docForm.availability.map((avail, dayIdx) => (
                    <div key={avail.day} style={{ display: 'flex', flexDirection: 'column', gap: '.4rem' }}>
                      <div style={{ fontSize: '.8rem', fontWeight: 700, color: 'var(--clr-text)' }}>{avail.day}</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.3rem' }}>
                        {DEFAULT_SLOTS.map(slot => {
                          const isSelected = avail.slots.includes(slot);
                          return (
                            <button
                              key={slot}
                              type="button"
                              className={`slot-btn ${isSelected ? 'selected' : ''}`}
                              onClick={() => toggleSlotSelection(dayIdx, slot)}
                              style={{ padding: '.25rem .5rem', fontSize: '.72rem' }}
                            >
                              {slot}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '.75rem', marginTop: '2rem' }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setDocModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={docSubmitting}>
                  {docSubmitting ? <><Loader size={16} /> Submitting...</> : 'Save Specialist'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Reschedule Modal */}
      {reschedModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setReschedModal(null); }}>
          <div className="modal">
            <div className="modal-header">
              <h3>Reschedule Appointment</h3>
              <button className="modal-close" onClick={() => setReschedModal(null)}><X size={20} /></button>
            </div>

            <div className="form-group">
              <label className="form-label">New Date (YYYY-MM-DD)</label>
              <input
                type="date"
                className="form-input"
                value={selDate}
                onChange={(e) => { setSelDate(e.target.value); setSelSlot(''); }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Select Time Slot</label>
              <div className="slots-grid">
                {DEFAULT_SLOTS.map(slot => (
                  <button
                    key={slot}
                    type="button"
                    className={`slot-btn ${selSlot === slot ? 'selected' : ''}`}
                    onClick={() => setSelSlot(slot)}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '.75rem', marginTop: '2rem' }}>
              <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setReschedModal(null)}>Cancel</button>
              <button
                type="button"
                className="btn btn-primary"
                style={{ flex: 1 }}
                onClick={handleAdminReschedule}
                disabled={rescheduling}
              >
                {rescheduling ? <><Loader size={16} /> Saving...</> : 'Confirm Reschedule'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
