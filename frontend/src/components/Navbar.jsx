import { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, Menu, X, User, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react';

const navLinks = [
  { to: '/',         label: 'Home'     },
  { to: '/services', label: 'Services' },
  { to: '/doctors',  label: 'Doctors'  },
  { to: '/reviews',  label: 'Reviews'  },
  { to: '/contact',  label: 'Contact'  },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setDropOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Brand */}
        <Link to="/" className="navbar-brand" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <img src="/logo.jpg" alt="EverActive Physiotherapy Logo" style={{ height: '68px', objectFit: 'contain' }} />
          <span className="brand-name" style={{ fontSize: '1.05rem' }}>EverActive Physiotherapy</span>
        </Link>

        {/* Desktop links */}
        <div className="navbar-links">
          {navLinks.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              {l.label}
            </NavLink>
          ))}
        </div>

        {/* Actions */}
        <div className="navbar-actions">
          {user ? (
            <div style={{ position: 'relative' }}>
              {/* User chip with chevron */}
              <div
                className="user-chip"
                onClick={() => setDropOpen(v => !v)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', userSelect: 'none' }}
              >
                <div className="user-avatar">{user.name?.[0]?.toUpperCase()}</div>
                <span>{user.name?.split(' ')[0]}</span>
                <ChevronDown
                  size={14}
                  style={{
                    transition: 'transform 0.25s ease',
                    transform: dropOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    opacity: 0.65,
                  }}
                />
              </div>

              {/* Dropdown */}
              {dropOpen && (
                <>
                  {/* Click-outside backdrop */}
                  <div
                    style={{ position: 'fixed', inset: 0, zIndex: 150 }}
                    onClick={() => setDropOpen(false)}
                  />
                  {/* Dropdown menu */}
                  <div style={{
                    position: 'absolute', right: 0, top: 'calc(100% + .5rem)',
                    background: '#fff', borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-lg)', border: '1px solid var(--clr-border)',
                    minWidth: 190, zIndex: 200, overflow: 'hidden',
                    animation: 'fadeInDown .15s ease',
                  }}>
                    {/* User info header */}
                    <div style={{ padding: '0.85rem 1rem', borderBottom: '1px solid var(--clr-border)', background: '#f8fafc' }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--clr-text)' }}>{user.name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--clr-text-muted)', marginTop: '0.15rem' }}>{user.email}</div>
                    </div>

                    <Link to="/profile" onClick={() => setDropOpen(false)}
                      style={{ display:'flex', alignItems:'center', gap:'.6rem', padding:'.72rem 1rem', fontSize:'.87rem', color:'var(--clr-text)', textDecoration:'none' }}
                      className="nav-link">
                      <User size={15} /> My Profile
                    </Link>
                    <Link to="/my-appointments" onClick={() => setDropOpen(false)}
                      style={{ display:'flex', alignItems:'center', gap:'.6rem', padding:'.72rem 1rem', fontSize:'.87rem', color:'var(--clr-text)', textDecoration:'none' }}
                      className="nav-link">
                      <Activity size={15} /> My Appointments
                    </Link>
                    {user.role === 'admin' && (
                      <Link to="/admin" onClick={() => setDropOpen(false)}
                        style={{ display:'flex', alignItems:'center', gap:'.6rem', padding:'.72rem 1rem', fontSize:'.87rem', color:'var(--clr-primary)', textDecoration:'none', fontWeight: 600 }}
                        className="nav-link">
                        <LayoutDashboard size={15} /> Admin Panel
                      </Link>
                    )}
                    <hr style={{ margin: 0, borderColor: 'var(--clr-border)' }} />
                    <button onClick={handleLogout}
                      style={{ display:'flex', alignItems:'center', gap:'.6rem', padding:'.72rem 1rem', fontSize:'.87rem', color:'var(--clr-danger)', width:'100%', border:'none', background:'none', cursor:'pointer' }}>
                      <LogOut size={15} /> Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <Link to="/login"  className="btn btn-outline btn-sm">Log In</Link>
              <Link to="/signup" className="btn btn-primary btn-sm">Sign Up</Link>
            </>
          )}
          <button className="hamburger" onClick={() => setMenuOpen(v => !v)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="navbar-mobile-menu" style={{
          position:'fixed', inset:0, top:70, background:'rgba(255,255,255,.97)',
          backdropFilter:'blur(12px)', padding:'2rem 1.5rem',
          display:'flex', flexDirection:'column', gap:'.5rem', zIndex:99
        }}>
          {navLinks.map(l => (
            <NavLink key={l.to} to={l.to} end={l.to=='/'}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              style={{ fontSize:'1.1rem', padding:'.75rem 1rem' }}
              onClick={() => setMenuOpen(false)}>
              {l.label}
            </NavLink>
          ))}
          <hr style={{ borderColor:'var(--clr-border)', margin:'.5rem 0' }} />
          {user ? (
            <>
              <Link to="/profile" className="btn btn-outline" onClick={() => setMenuOpen(false)}>My Profile</Link>
              <Link to="/my-appointments" className="btn btn-outline" onClick={() => setMenuOpen(false)}>My Appointments</Link>
              {user.role === 'admin' && (
                <Link to="/admin" className="btn btn-outline" onClick={() => setMenuOpen(false)}>Admin Panel</Link>
              )}
              <button className="btn btn-danger" onClick={() => { handleLogout(); setMenuOpen(false); }}>Sign Out</button>
            </>
          ) : (
            <>
              <Link to="/login"  className="btn btn-outline"  onClick={() => setMenuOpen(false)}>Log In</Link>
              <Link to="/signup" className="btn btn-primary"  onClick={() => setMenuOpen(false)}>Sign Up</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
