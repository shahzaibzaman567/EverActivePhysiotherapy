import { Link } from 'react-router-dom';
import { Activity, Phone, Mail, MapPin } from 'lucide-react';

const FacebookIcon = ({ size = 24, ...props }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const InstagramIcon = ({ size = 24, ...props }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const TwitterIcon = ({ size = 24, ...props }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
  </svg>
);

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <div style={{ display:'flex', alignItems:'center', gap:'.75rem', marginBottom:'.75rem' }}>
              <img src="/logo.jpg" alt="EverActive Physiotherapy Logo" style={{ height: '44px', objectFit: 'contain', borderRadius: '4px', background: '#fff', padding: '2px' }} />
            </div>
            <p>Restore movement, restore life. Expert physiotherapy care for all ages and conditions.</p>
            <div className="social-links" style={{ marginTop:'1.25rem' }}>
              <a href="https://web.facebook.com/p/EverActive-Physiotherapy-61577801432024/" target="_blank" rel="noreferrer" className="social-link"><FacebookIcon size={16} /></a>
              <a href="#" className="social-link"><InstagramIcon size={16} /></a>
              <a href="#" className="social-link"><TwitterIcon size={16} /></a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4>Quick Links</h4>
            <ul>
              {[['/', 'Home'], ['/services', 'Services'], ['/doctors', 'Our Doctors'], ['/reviews', 'Reviews'], ['/contact', 'Contact']].map(([to, label]) => (
                <li key={to}><Link to={to}>{label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4>Services</h4>
            <ul>
              {[
                'Mobile Home Physiotherapy',
                'Care Home Group Sessions',
                'Sports Physiotherapy',
                'Community Group Physio',
                'Mobile Physio-Led Personal Training'
              ].map(s => (
                <li key={s}><Link to="/services">{s}</Link></li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4>Contact</h4>
            <ul style={{ gap:'.9rem' }}>
              <li style={{ display:'flex', alignItems:'flex-start', gap:'.6rem', color:'rgba(255,255,255,.7)' }}>
                <MapPin size={15} style={{ minWidth:15, marginTop:3, color:'var(--clr-accent)' }} />
                <span style={{ fontSize:'.85rem' }}>67 Windsor Road, Prestwich, Manchester, M250DB</span>
              </li>
              <li style={{ display:'flex', alignItems:'center', gap:'.6rem', color:'rgba(255,255,255,.7)' }}>
                <Phone size={15} style={{ color:'var(--clr-accent)' }} />
                <a href="tel:+447542221845" style={{ fontSize:'.85rem' }}>+44 7542 221845</a>
              </li>
              <li style={{ display:'flex', alignItems:'center', gap:'.6rem', color:'rgba(255,255,255,.7)' }}>
                <Mail size={15} style={{ color:'var(--clr-accent)' }} />
                <a href="mailto:everactivephysiotherapy@gmail.com" style={{ fontSize:'.85rem' }}>everactivephysiotherapy@gmail.com</a>
              </li>
            </ul>
            <div style={{ marginTop:'1rem', fontSize:'.82rem', color:'rgba(255,255,255,.5)' }}>
              <strong style={{ color:'rgba(255,255,255,.75)' }}>Hours:</strong><br />
              Mon – Fri: 8:00 AM – 6:00 PM<br />
              Saturday & Sunday: Closed
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} EverActive Physiotherapy. All rights reserved.</span>
          <div style={{ display:'flex', gap:'1.5rem' }}>
            <Link to="#" style={{ fontSize:'.82rem' }}>Privacy Policy</Link>
            <Link to="#" style={{ fontSize:'.82rem' }}>Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
