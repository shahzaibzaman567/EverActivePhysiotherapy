import { Link } from 'react-router-dom';
import { useState } from 'react';
import { apiSendContactMessage } from '../services/api';
import {
  Activity, Shield, Heart, Users, Star, ArrowRight,
  CheckCircle, Phone, Calendar, Award, Home as HomeIcon, MapPin, Sparkles, MessageSquare, Clock, Check, X, Loader, Mail
} from 'lucide-react';


const services = [
  {
    icon: <HomeIcon size={28} />,
    title: 'Mobile Home Physiotherapy',
    desc: 'Professional physiotherapy in the comfort of your home. We bring all necessary equipment to help you recover and improve mobility without the need for travel.'
  },
  {
    icon: <Users size={28} />,
    title: 'Care Home Group Sessions',
    desc: 'Specialized group exercise and mobility sessions tailored for care home residents. Engaging, safe, and effective movements to promote social interaction and wellness.'
  },
  {
    icon: <Heart size={28} />,
    title: 'Community Group Physio',
    desc: 'Inclusive group classes held in community centers. Focusing on fall prevention, strength building, and maintaining independence for all ability levels.'
  },
  {
    icon: <Shield size={28} />,
    title: 'Sports Physio & Rehab',
    desc: 'Elite-level injury management for athletes. From acute injury assessment to return-to-play strength conditioning, we keep you at your peak performance.',
    credit: 'Image by Ahmet Kurt'
  },
  {
    icon: <Activity size={28} />,
    title: 'Mobile Physio-Led Personal Training',
    desc: 'Physio-led personal training tailored to your goals. Improve strength, fitness, and movement under professional guidance.'
  }
];

const whyUs = [
  {
    title: 'We Come to You',
    desc: 'No travel, no waiting. We provide professional physiotherapy services in the comfort of your own home or care facility.'
  },
  {
    title: 'Qualified Physiotherapists',
    desc: 'Our team consists of highly skilled and registered professionals dedicated to delivering the highest standard of clinical care.'
  },
  {
    title: 'Fun & Engaging Approach',
    desc: 'We believe in rehabilitation that motivates. Our sessions are designed to be interactive, encouraging, and enjoyable.'
  },
  {
    title: 'Proven Results',
    desc: 'Our evidence-based treatments are focused on measurable progress, helping you feel better and move smarter.'
  }
];

const testimonials = [
  {
    quote: "The mobile service is a game-changer for our residents. EverActive brings energy, expertise, and genuine care to every session. We've seen remarkable progress in mobility and morale.",
    author: "Sarah Jenkins",
    role: "Care Home Manager"
  },
  {
    quote: "Recovering from a sports injury seemed daunting until I started working with EverActive. Their professional approach and tailored rehab plan got me back on the field faster than expected.",
    author: "James Wilson",
    role: "Professional Athlete"
  },
  {
    quote: "Friendly, professional, and incredibly convenient. Having a qualified physiotherapist come to my home saved me so much time and stress. I feel stronger and more mobile every day.",
    author: "Margaret Thompson",
    role: "Individual Client"
  }
];

export default function Home() {
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleEnquire = async (e) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.message) {
      showToast('Please fill out all required fields.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await apiSendContactMessage({ ...formData, service: 'General Enquiry' });
      showToast('Thank you! Your enquiry has been sent. We will get back to you within 24-48 hours.', 'success');
      setFormData({ firstName: '', lastName: '', email: '', message: '' });
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

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

      {/* ── Hero Banner (Redesigned like the ChatGPT reference) ── */}
      <section className="hero" style={{ background: 'linear-gradient(135deg, #bfe3ff 0%, #8ec5ff 55%, #64a7f5 100%)', padding: '4rem 0 6rem' }}>
        <div className="hero-content">
          <div className="hero-grid">
            
            {/* Left Column */}
            <div className="slide-up">
              <span style={{ 
                background: '#e8f0fe', 
                color: 'var(--clr-primary)', 
                padding: '0.4rem 1rem', 
                borderRadius: '9999px', 
                fontSize: '0.78rem', 
                fontWeight: 700, 
                textTransform: 'uppercase', 
                letterSpacing: '0.06em', 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '0.4rem', 
                marginBottom: '1.5rem' 
              }}>
                <Sparkles size={14} /> Your Health. Our Priority.
              </span>
              
              <h1 style={{ fontSize: 'clamp(2.35rem, 5vw, 3.5rem)', fontWeight: 900, color: 'var(--clr-text)', lineHeight: 1.12, marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>
                Move Better.<br />
                <span style={{ color: 'var(--clr-primary)' }}>Live Stronger.</span>
              </h1>
              
              <p style={{ fontSize: '1.15rem', color: 'var(--clr-text-muted)', marginBottom: '2rem', lineHeight: 1.6 }}>
                Expert physiotherapy care tailored to help you recover, move freely, and live pain-free. We come to you — from care homes to elite athletes. Feel better, move smarter, and live stronger.
              </p>
              
              {/* Features List */}
              <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
                {[
                  { icon: <Users size={16} />, label: 'Expert Therapists' },
                  { icon: <Activity size={16} />, label: 'Advanced Treatments' },
                  { icon: <Heart size={16} />, label: 'Personalized Care' }
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem', fontWeight: 600, color: 'var(--clr-text)' }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#e8f0fe', color: 'var(--clr-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {item.icon}
                    </div>
                    {item.label}
                  </div>
                ))}
              </div>
              
              {/* CTAs */}
              <div className="hero-cta" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <a href="#enquire" className="btn btn-primary btn-lg" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Calendar size={18} /> Enquire Now
                </a>
                <Link to="/book-free-session" className="btn btn-lg" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'linear-gradient(135deg,#00b37a,#007a52)', color: '#fff', boxShadow: '0 4px 14px rgba(0,179,122,.35)' }}>
                  <Users size={18} /> Care Homes
                </Link>
                <Link to="/services" className="btn btn-outline btn-lg" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                  Explore Services <ArrowRight size={18} />
                </Link>
              </div>
            </div>

            {/* Right Column */}
            <div className="hero-visual fade-in" style={{ position: 'relative' }}>
              <div className="hero-img-wrap" style={{ 
                borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%', 
                overflow: 'hidden', 
                boxShadow: 'var(--shadow-xl)', 
                border: '5px solid #fff', 
                aspectRatio: '1.1 / 1',
                background: '#f1f5f9'
              }}>
                <img
                  src="/physio_consultation.jpg"
                  alt="EverActive Physiotherapy — expert care session"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              {/* Floating Opening Hours Card */}
              <div className="glass-card" style={{ 
                position: 'absolute', 
                bottom: '8%', 
                left: '-8%', 
                padding: '1.25rem', 
                borderRadius: 'var(--radius-xl)', 
                background: 'rgba(255,255,255,0.96)', 
                border: '1px solid var(--clr-border)', 
                boxShadow: 'var(--shadow-lg)', 
                minWidth: '230px', 
                zIndex: 10 
              }}>
                <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--clr-text)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Clock size={15} color="var(--clr-primary)" /> Opening Hours
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.78rem', fontWeight: 600, color: 'var(--clr-text-muted)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Mon - Fri</span>
                    <span style={{ color: 'var(--clr-text)' }}>8:00 AM - 6:00 PM</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Saturday</span>
                    <span style={{ color: 'var(--clr-text)' }}>Closed</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Sunday</span>
                    <span style={{ color: 'var(--clr-text)' }}>Closed</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Clinic Showcase Banner ── */}
      <section className="section" style={{ background: '#fff', borderTop: '1px solid var(--clr-border)' }}>
        <div className="container">
          <div className="grid-2" style={{ alignItems: 'center', gap: '3rem' }}>
            <div style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', boxShadow: 'var(--shadow-xl)' }}>
              <img
                src="/physio_shoulder.png"
                alt="Physiotherapist providing shoulder treatment"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            </div>
            <div>
              <div className="badge"><Heart size={13} /> Expert Care</div>
              <h2 style={{ marginBottom: '1rem' }}>Move Better. Feel Better.</h2>
              <p style={{ color: 'var(--clr-text-muted)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                From pain relief and injury recovery to manual therapy and personalised exercise plans — our registered physiotherapists deliver safe, effective treatment tailored to your goals.
              </p>
              <Link to="/doctors" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '.5rem' }}>
                Book an Appointment <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Services Section ── */}
      <section className="section" style={{ background: '#f8fafc', borderTop: '1px solid var(--clr-border)' }}>
        <div className="container">
          <div className="section-header">
            <div className="badge"><Activity size={13} /> What We Offer</div>
            <h2>Our Core Services</h2>
            <p>From rehabilitation in care facilities to targeted athletic conditioning, we bring custom-tailored therapy directly to you.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginTop: '2.5rem' }}>
            {services.map(s => (
              <div key={s.title} className="card service-card" style={{ padding: '2rem', background: '#fff', borderRadius: 'var(--radius-xl)', border: '1.5px solid var(--clr-border)', display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div className="service-icon" style={{ width: 56, height: 56, background: '#e8f0fe', color: 'var(--clr-primary)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                  {s.icon}
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.75rem' }}>{s.title}</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--clr-text-muted)', lineHeight: 1.6, flexGrow: 1 }}>{s.desc}</p>
                {s.credit && (
                  <span style={{ fontSize: '0.72rem', color: 'var(--clr-text-muted)', fontStyle: 'italic', display: 'block', margin: '0.5rem 0' }}>
                    {s.credit}
                  </span>
                )}
                <div style={{ marginTop: '1.5rem' }}>
                  {s.title === 'Care Home Group Sessions' ? (
                    <Link to="/book-free-session" className="btn btn-sm btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                      Book Free Taster <ArrowRight size={14} />
                    </Link>
                  ) : (
                    <Link to="/services" className="btn btn-sm btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                      Learn More <ArrowRight size={14} />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Flyer Showcase Section ── */}
      <section className="section" style={{ background: '#fff', borderTop: '1px solid var(--clr-border)', borderBottom: '1px solid var(--clr-border)' }}>
        <div className="container">
          <div className="section-header">
            <div className="badge"><Users size={13} /> Focus Areas</div>
            <h2>Our Highlights & Wellness Info</h2>
            <p>Explore our flyers covering home visits, stroke recovery, cardiovascular fitness, and patient recovery guides.</p>
          </div>

          <div className="grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem', marginTop: '2.5rem' }}>
            {[
              { src: '/expert_care_home.png', alt: 'Expert Care In Your Home - EverActive Physiotherapy', title: 'Home Visits & Care' },
              { src: '/love_life_heart.png', alt: 'Love Life, Love Your Heart - EverActive Physiotherapy', title: 'Cardiovascular Fitness' },
              { src: '/free_consultation.png', alt: 'Book Your Free Consultation - EverActive Physiotherapy', title: 'Free Consultations' },
              { src: '/small_progress.png', alt: 'Small Progress is Still Progress - EverActive Physiotherapy', title: 'Recovery & Support' }
            ].map((img, idx) => (
              <div 
                key={idx} 
                className="card" 
                style={{ 
                  padding: '1rem', 
                  borderRadius: 'var(--radius-xl)', 
                  overflow: 'hidden', 
                  boxShadow: 'var(--shadow-md)', 
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  background: '#fff',
                  cursor: 'pointer',
                  border: '1px solid var(--clr-border)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-xl)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                }}
              >
                <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: '1rem', aspectRatio: '1/1' }}>
                  <img 
                    src={img.src} 
                    alt={img.alt} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, textAlign: 'center', margin: '0.5rem 0' }}>{img.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Real Sessions Gallery ── */}
      <section className="section" style={{ background: 'linear-gradient(135deg, #0a1628 0%, #1a3a6b 100%)', padding: '5rem 0' }}>
        <div className="container">
          <div className="section-header" style={{ color: '#fff' }}>
            <div className="badge" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}>
              <Activity size={13} /> Real Sessions
            </div>
            <h2 style={{ color: '#fff' }}>Physiotherapy That Comes to You</h2>
            <p style={{ color: 'rgba(255,255,255,0.75)' }}>
              From care homes to community centers — see our therapists at work across Greater Manchester.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginTop: '2.5rem' }}>
            {[
              { src: '/care_home_walk.png', alt: 'EverActive physiotherapist assisting elderly resident walking in care home', caption: 'Care Home Visits' },
              { src: '/group_session.png', alt: 'Group physiotherapy session with seniors using resistance bands', caption: 'Group Sessions' },
              { src: '/home_care_stretch.png', alt: 'Home physiotherapy – therapist assisting with arm stretch', caption: 'Home Visits' },
            ].map((img, i) => (
              <div key={i} style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', position: 'relative', aspectRatio: '4/3', cursor: 'pointer' }}
                onMouseEnter={e => { e.currentTarget.querySelector('img').style.transform = 'scale(1.07)'; e.currentTarget.querySelector('.img-caption').style.opacity = 1; }}
                onMouseLeave={e => { e.currentTarget.querySelector('img').style.transform = 'scale(1)'; e.currentTarget.querySelector('.img-caption').style.opacity = 0; }}>
                <img src={img.src} alt={img.alt} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease', display: 'block' }} />
                <div className="img-caption" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.75))', color: '#fff', padding: '2rem 1.25rem 1.25rem', fontWeight: 700, fontSize: '1rem', opacity: 0, transition: 'opacity 0.3s ease' }}>
                  {img.caption}
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
            <Link to="/book-free-session" className="btn btn-lg" style={{ background: '#fff', color: 'var(--clr-primary)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={18} /> Book a Free Session
            </Link>
          </div>
        </div>
      </section>

      {/* ── Why Choose Us ── */}
      <section className="section" style={{ background: '#f8fafc' }}>
        <div className="container">
          <div className="grid-2" style={{ alignItems: 'center', gap: '4rem' }}>
            <div>
              <div className="badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '.4rem', background: '#e8f0fe', color: 'var(--clr-primary)', fontSize: '.75rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', padding: '.35rem .9rem', borderRadius: '9999px', marginBottom: '1rem' }}>
                <Award size={13} /> Why Choose Us
              </div>
              <h2 style={{ marginBottom: '1.5rem' }}>We Put Your Recovery First</h2>
              <p style={{ marginBottom: '2.5rem', fontSize: '1.05rem', color: 'var(--clr-text-muted)' }}>
                EverActive Physiotherapy is dedicated to getting you back to your best. Here is what sets our clinic apart:
              </p>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem' }}>
                {whyUs.map(item => (
                  <div key={item.title}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <CheckCircle size={18} color="var(--clr-success)" />
                      <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--clr-text)' }}>{item.title}</h4>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--clr-text-muted)', lineHeight: 1.5 }}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', boxShadow: 'var(--shadow-xl)', aspectRatio: '4/3' }}>
                <img
                  src="/care_physio_senior.png"
                  alt="EverActive physiotherapist providing senior care"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Client Testimonials ── */}
      <section className="section" style={{ background: '#fff', borderTop: '1px solid var(--clr-border)', borderBottom: '1px solid var(--clr-border)' }}>
        <div className="container">
          <div className="section-header">
            <div className="badge"><MessageSquare size={13} /> Feedback</div>
            <h2>What Our Clients Say</h2>
            <p>Read experiences from care home managers, individual patients, and competitive athletes.</p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginTop: '2.5rem' }}>
            {testimonials.map((t, i) => (
              <div key={i} className="card" style={{ padding: '2rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--clr-border)', background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', color: '#fbbf24', gap: '0.2rem', marginBottom: '1rem' }}>
                  {[...Array(5)].map((_, idx) => <Star key={idx} size={16} fill="currentColor" />)}
                </div>
                <p style={{ fontSize: '0.92rem', fontStyle: 'italic', color: 'var(--clr-text)', lineHeight: 1.6, flexGrow: 1, marginBottom: '1.5rem' }}>
                  "{t.quote}"
                </p>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--clr-text)' }}>{t.author}</h4>
                  <span style={{ fontSize: '0.78rem', color: 'var(--clr-text-muted)', fontWeight: 500 }}>{t.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Audience-Specific Callouts (CTA Cards) ── */}
      <section className="section" style={{ background: '#f8fafc' }}>
        <div className="container">
          <div className="grid-2" style={{ gap: '2.5rem' }}>
            
            {/* Card 1: Care Homes */}
            <div className="card" style={{ 
              padding: '3rem 2.5rem', 
              borderRadius: 'var(--radius-xl)', 
              background: 'linear-gradient(135deg, #0052cc 0%, #003d99 100%)', 
              color: '#fff', 
              boxShadow: 'var(--shadow-lg)'
            }}>
              <span style={{ background: 'rgba(255,255,255,0.2)', padding: '0.3rem 0.8rem', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                For Residential Care
              </span>
              <h3 style={{ fontSize: '1.75rem', fontWeight: 900, marginTop: '1rem', marginBottom: '0.75rem', color: '#fff' }}>Care Homes</h3>
              <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                Improve mobility, resident satisfaction, and social interaction with custom taster group sessions.
              </p>
              <a href="#enquire" className="btn btn-lg" style={{ background: '#fff', color: '#0052cc', fontWeight: 700 }}>
                Book a Free Taster
              </a>
            </div>

            {/* Card 2: Individuals / Athletes */}
            <div className="card" style={{ 
              padding: '3rem 2.5rem', 
              borderRadius: 'var(--radius-xl)', 
              background: '#fff', 
              border: '2px solid var(--clr-primary)',
              boxShadow: 'var(--shadow-lg)'
            }}>
              <span style={{ background: '#e8f0fe', color: 'var(--clr-primary)', padding: '0.3rem 0.8rem', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                For Patients & Sports Rehab
              </span>
              <h3 style={{ fontSize: '1.75rem', fontWeight: 900, marginTop: '1rem', marginBottom: '0.75rem', color: 'var(--clr-text)' }}>Individuals / Athletes</h3>
              <p style={{ color: 'var(--clr-text-muted)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                Book a consultation to review sports conditioning, pain management, or recovery treatment programs at home.
              </p>
              <a href="#enquire" className="btn btn-primary btn-lg">
                Free Consultation
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* ── Enquiry Contact Form Section ── */}
      <section className="section" id="enquire" style={{ background: '#fff', borderTop: '1px solid var(--clr-border)' }}>
        <div className="container">
          <div className="grid-2" style={{ gap: '4rem', alignItems: 'start' }}>
            
            {/* Info Side */}
            <div>
              <div className="badge"><Mail size={13} /> Contact Details</div>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.5rem', marginBottom: '1rem' }}>Get in Touch</h2>
              <p style={{ color: 'var(--clr-text-muted)', marginBottom: '2.5rem', lineHeight: 1.7 }}>
                Have a question about treatment, availability, or coverage areas? Send us a message and we'll get back to you as soon as we can.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#e8f0fe', color: 'var(--clr-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Mail size={20} />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700 }}>Email Us</h4>
                    <a href="mailto:everactivephysiotherapy@gmail.com" style={{ fontSize: '0.85rem', color: 'var(--clr-primary)', fontWeight: 600 }}>
                      everactivephysiotherapy@gmail.com
                    </a>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#e8f0fe', color: 'var(--clr-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Phone size={20} />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700 }}>Call or Message</h4>
                    <a href="tel:+447542221845" style={{ fontSize: '0.85rem', color: 'var(--clr-primary)', fontWeight: 600 }}>
                      +44 7542 221845
                    </a>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#e8f0fe', color: 'var(--clr-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700 }}>Address</h4>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--clr-text-muted)' }}>
                      67 Windsor Road, Prestwich, Manchester, M250DB
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Side */}
            <div className="card" style={{ padding: '2.5rem', border: '1.5px solid var(--clr-border)', borderRadius: 'var(--radius-xl)' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem' }}>Send Us a Message</h3>
              <form onSubmit={handleEnquire}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">First Name*</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.firstName}
                      onChange={(e) => setFormData(p => ({ ...p, firstName: e.target.value }))}
                      placeholder="e.g. John"
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
                      placeholder="e.g. Doe"
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

                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label className="form-label">Message*</label>
                  <textarea
                    className="form-input"
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData(p => ({ ...p, message: e.target.value }))}
                    placeholder="How can we help you?"
                    style={{ resize: 'vertical' }}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', height: '46px', justifyContent: 'center' }}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader size={18} className="spin" style={{ animation: 'spin .8s linear infinite' }} /> Sending...
                    </>
                  ) : (
                    'Send Message'
                  )}
                </button>
              </form>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
