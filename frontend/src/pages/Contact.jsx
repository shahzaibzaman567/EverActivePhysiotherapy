import { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Send, Check, X, Loader, Smartphone, HelpCircle } from 'lucide-react';
import { apiSendContactMessage } from '../services/api';

export default function Contact() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    service: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.service || !formData.message) {
      showToast('All fields marked with * are required.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await apiSendContactMessage(formData);
      showToast('We have received your request! We will respond within 24–48 hours.', 'success');
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        service: '',
        message: ''
      });
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const faqs = [
    {
      q: "Do you offer home visits?",
      a: "Yes. EverActive Physiotherapy specialises in mobile physiotherapy and rehabilitation. We can visit you at home, at your workplace, or at a suitable community space across Greater Manchester."
    },
    {
      q: "Can I book a free consultation?",
      a: "We offer a short introductory phone consultation to discuss your needs, answer questions, and recommend next steps before you commit to a full session."
    },
    {
      q: "Do I need a referral?",
      a: "You do not usually need a GP referral to see us. However, if you have complex medical conditions or recent surgery, we may ask for relevant medical information to keep you safe."
    },
    {
      q: "What areas do you cover?",
      a: "We primarily cover Greater Manchester. If you are just outside this area, get in touch and we'll let you know if we can visit or suggest alternatives."
    }
  ];

  return (
    <div>
      {/* Toast Notification */}
      {toast && (
        <div className="toast-container">
          <div className={`toast toast-${toast.type}`}>
            {toast.type === 'success' ? <Check size={18} color="var(--clr-success)" /> : <X size={18} color="var(--clr-danger)" />}
            <span>{toast.msg}</span>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="page-header" style={{ padding: '4.5rem 0', background: 'linear-gradient(135deg, var(--clr-primary) 0%, #003d99 100%)' }}>
        <div className="container">
          <div className="badge" style={{ background: 'rgba(255,255,255,.2)', color: '#fff', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.75rem', padding: '0.35rem 0.9rem', borderRadius: '9999px', marginBottom: '1rem' }}>
            <Smartphone size={13} /> Using Smartphone
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.5rem', color: '#fff' }}>Ready to Start Moving Better?</h1>
          <p style={{ color: 'rgba(255,255,255,.8)', marginTop: '.5rem', fontSize: '1.1rem', maxWidth: '580px' }}>
            Get expert physiotherapy support tailored to your needs.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <section className="section" style={{ background: '#fff' }}>
        <div className="container">
          <div className="contact-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))', gap: '2.5rem', alignItems: 'start' }}>
            
            {/* Contact details side */}
            <div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '1.5rem' }}>Other Ways to Reach Us</h2>
              <p style={{ color: 'var(--clr-text-muted)', marginBottom: '2.5rem', lineHeight: 1.7 }}>
                Prefer to reach out directly? Use the details below. We are committed to responding to all direct communications within one business day.
              </p>

              <div className="contact-info-item" style={{ display: 'flex', gap: '1rem', marginBottom: '1.75rem' }}>
                <div className="contact-icon" style={{ width: 44, height: 44, borderRadius: '50%', background: '#e8f0fe', color: 'var(--clr-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 44 }}><Mail size={20} /></div>
                <div>
                  <h4 style={{ margin: '0 0 0.25rem', fontSize: '0.95rem', fontWeight: 800 }}>Email</h4>
                  <p style={{ margin: '0 0 0.25rem' }}><a href="mailto:everactivephysiotherapy@gmail.com" style={{ fontWeight: 600, color: 'var(--clr-primary)' }}>everactivephysiotherapy@gmail.com</a></p>
                  <p style={{ fontSize: '.8rem', color: 'var(--clr-text-muted)', margin: 0 }}>Best for general enquiries and follow-up questions.</p>
                </div>
              </div>

              <div className="contact-info-item" style={{ display: 'flex', gap: '1rem', marginBottom: '1.75rem' }}>
                <div className="contact-icon" style={{ width: 44, height: 44, borderRadius: '50%', background: '#e8f0fe', color: 'var(--clr-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 44 }}><Phone size={20} /></div>
                <div>
                  <h4 style={{ margin: '0 0 0.25rem', fontSize: '0.95rem', fontWeight: 800 }}>Phone</h4>
                  <p style={{ margin: '0 0 0.25rem' }}><a href="tel:+447542221845" style={{ fontWeight: 600, color: 'var(--clr-primary)' }}>+44 7542 221845</a></p>
                  <p style={{ fontSize: '.8rem', color: 'var(--clr-text-muted)', margin: 0 }}>Call us to discuss your needs or check availability.</p>
                </div>
              </div>

              <div className="contact-info-item" style={{ display: 'flex', gap: '1rem', marginBottom: '1.75rem' }}>
                <div className="contact-icon" style={{ width: 44, height: 44, borderRadius: '50%', background: '#e8f0fe', color: 'var(--clr-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 44 }}><MapPin size={20} /></div>
                <div>
                  <h4 style={{ margin: '0 0 0.25rem', fontSize: '0.95rem', fontWeight: 800 }}>Service Area & Address</h4>
                  <p style={{ margin: '0 0 0.25rem', fontSize: '0.9rem', color: 'var(--clr-text)' }}>67 Windsor Road, Prestwich, Manchester, M250DB</p>
                  <p style={{ fontSize: '.8rem', color: 'var(--clr-text-muted)', margin: 0 }}>Mobile physiotherapy and rehabilitation across Greater Manchester.</p>
                </div>
              </div>

              <div className="contact-info-item" style={{ display: 'flex', gap: '1rem', marginBottom: '1.75rem' }}>
                <div className="contact-icon" style={{ width: 44, height: 44, borderRadius: '50%', background: '#e8f0fe', color: 'var(--clr-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 44 }}><Clock size={20} /></div>
                <div>
                  <h4 style={{ margin: '0 0 0.25rem', fontSize: '0.95rem', fontWeight: 800 }}>Operating Hours</h4>
                  <p style={{ fontSize: '.85rem', color: 'var(--clr-text)', margin: 0 }}>Typical hours: Mon–Fri, 8:00am–6:00pm</p>
                  <p style={{ fontSize: '.8rem', color: 'var(--clr-text-muted)', margin: 0 }}>Sat - Sun: Closed</p>
                </div>
              </div>
            </div>

            {/* Contact form side */}
            <div className="card" style={{ padding: 'clamp(1.25rem, 5vw, 2.5rem)', border: '1.5px solid var(--clr-border)', borderRadius: 'var(--radius-xl)' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>Send Us a Message</h3>
              <p style={{ color: 'var(--clr-text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                Share a few details below and we’ll respond within 24–48 hours.
              </p>
              
              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 160px), 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">First Name*</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.firstName}
                      onChange={(e) => setFormData(p => ({ ...p, firstName: e.target.value }))}
                      placeholder="e.g. Jane"
                      required
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Last Name*</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.lastName}
                      onChange={(e) => setFormData(p => ({ ...p, lastName: e.target.value }))}
                      placeholder="e.g. Smith"
                      required
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Email Address*</label>
                  <input
                    type="email"
                    className="form-input"
                    value={formData.email}
                    onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                    placeholder="email@example.com"
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={formData.phone}
                    onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))}
                    placeholder="+44 7542221845"
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Service Interested In*</label>
                  <select
                    className="form-input"
                    value={formData.service}
                    onChange={(e) => setFormData(p => ({ ...p, service: e.target.value }))}
                    required
                    style={{ background: '#fff', cursor: 'pointer' }}
                  >
                    <option value="">-- Please Select --</option>
                    <option value="Mobile Home Physiotherapy">Mobile Home Physiotherapy</option>
                    <option value="Care Home Group Sessions">Care Home Group Sessions</option>
                    <option value="Sports Physiotherapy">Sports Physiotherapy</option>
                    <option value="Community Physiotherapy Group Classes">Community Physiotherapy Group Classes</option>
                    <option value="Mobile Physio-Led Personal Training">Mobile Physio-Led Personal Training</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label className="form-label">Message</label>
                  <textarea
                    className="form-input"
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData(p => ({ ...p, message: e.target.value }))}
                    placeholder="Describe your needs or questions here..."
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', height: '46px', justifyContent: 'center', marginTop: '.5rem' }}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader size={18} className="spin" style={{ animation: 'spin .8s linear infinite' }} /> Sending...
                    </>
                  ) : (
                    <>
                      <Send size={16} /> Send Message
                    </>
                  )}
                </button>
                <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--clr-text-muted)', marginTop: '0.75rem' }}>
                  We aim to respond to all enquiries within 24–48 hours.
                </p>
              </form>
            </div>

          </div>

          {/* FAQ Section */}
          <div style={{ marginTop: '5rem', borderTop: '1px solid var(--clr-border)', paddingTop: '4rem' }}>
            <div className="section-header" style={{ marginBottom: '3rem' }}>
              <div className="badge"><HelpCircle size={13} /> FAQ</div>
              <h2>Frequently Asked Questions</h2>
              <p>Quick answers to common questions about our physiotherapy and rehabilitation services.</p>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '2rem' }}>
              {faqs.map((faq, i) => (
                <div key={i} style={{ background: '#f8fafc', padding: '1.75rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--clr-border)' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--clr-text)', marginBottom: '0.75rem' }}>{faq.q}</h4>
                  <p style={{ fontSize: '0.88rem', color: 'var(--clr-text-muted)', lineHeight: 1.6, margin: 0 }}>{faq.a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Map Section */}
          <div className="contact-map" style={{ marginTop: '5rem', borderRadius: 'var(--radius-xl)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)', border: '1.5px solid var(--clr-border)', height: 380 }}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!11m18!1m12!1m3!1d151978.89139598285!2d-2.4282361664161726!3d53.50689438902506!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x487a0c10842db131%3A0xd68925527a29930f!2sGreater%20Manchester%2C%20UK!5e0!3m2!1sen!2sus!4v1718428800000!5m2!1sen!2sus"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Clinic location map"
            />
          </div>

        </div>
      </section>
    </div>
  );
}
