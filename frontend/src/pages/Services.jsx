import { Activity, Shield, Heart, Users, Zap, Home as HomeIcon } from 'lucide-react';

const services = [
  {
    icon: <HomeIcon size={32} />, color: '#0052cc', bg: '#e8f0fe',
    title: 'Mobile Home Physiotherapy',
    desc: 'Professional physiotherapy in the comfort of your home. We bring all necessary equipment to help you recover and improve mobility without the need for travel.',
    features: ['Musculoskeletal Treatment', 'Mobility Improvement', 'No Travel Required', 'Personalized Assessment'],
  },
  {
    icon: <Users size={32} />, color: '#7c3aed', bg: '#f3e8ff',
    title: 'Care Home Group Sessions',
    desc: 'Specialized group exercise and mobility sessions tailored for care home residents. Engaging, safe, and effective movements to promote social interaction and wellness.',
    features: ['Resident Exercise Groups', 'Safe Mobility Training', 'Social Interaction', 'Morale Boost'],
  },
  {
    icon: <Shield size={32} />, color: '#db2777', bg: '#fce7f3',
    title: 'Sports Physiotherapy & Rehab',
    desc: 'Elite-level injury management for athletes. From acute injury assessment to return-to-play strength conditioning, we keep you at your peak performance.',
    features: ['Injury Rehabilitation', 'Strength Conditioning', 'Return-To-Play Planning', 'Athletic Assessment'],
  },
  {
    icon: <Activity size={32} />, color: '#059669', bg: '#d1fae5',
    title: 'Community Physiotherapy Group Classes',
    desc: 'Inclusive group classes held in community centers. Focusing on fall prevention, strength building, and maintaining independence for all ability levels.',
    features: ['Strength Building', 'Fall Prevention', 'Independence Focus', 'All Ability Levels'],
  },
  {
    icon: <Zap size={32} />, color: '#d97706', bg: '#fef3c7',
    title: 'Mobile Physio-Led Personal Training',
    desc: 'Physio-led personal training tailored to your goals. Improve strength, fitness, and movement under professional guidance.',
    features: ['Physio-Led Workouts', 'Strength & Fitness', 'Tailored Training Goals', 'Professional Guidance'],
  },
];

export default function Services() {
  return (
    <div>
      {/* Page Header */}
      <div className="page-header" style={{
        background: 'linear-gradient(rgba(0, 42, 92, 0.82), rgba(0, 82, 204, 0.78)), url(/hero_stretch.png) center/cover no-repeat',
      }}>
        <div className="container">
          <div className="badge" style={{ background:'rgba(255,255,255,.2)', color:'#fff', display:'inline-flex', alignItems:'center', gap:'.4rem', padding:'.35rem .9rem', borderRadius:'9999px', fontSize:'.75rem', fontWeight:700, marginBottom:'1rem', textTransform:'uppercase', letterSpacing:'.08em' }}>
            <Activity size={13} /> Our Services
          </div>
          <h1>Comprehensive Physiotherapy Care</h1>
          <p style={{ color:'rgba(255,255,255,.8)', fontSize:'1.05rem', marginTop:'.5rem', maxWidth:560 }}>
            We offer a full spectrum of physiotherapy services, delivered by experienced clinicians with a passion for patient outcomes.
          </p>
        </div>
      </div>

      {/* Services Grid */}
      <section className="section">
        <div className="container">
          <div className="grid-2" style={{ gap:'2rem' }}>
            {services.map((s, i) => (
              <div key={i} className="card" style={{ padding:'2rem', display:'flex', gap:'1.5rem', alignItems:'flex-start' }}>
                <div style={{
                  width:64, height:64, minWidth:64, borderRadius:'var(--radius-md)',
                  background:s.bg, color:s.color,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  transition:'var(--transition)',
                }}>
                  {s.icon}
                </div>
                <div>
                  <h3 style={{ marginBottom:'.6rem' }}>{s.title}</h3>
                  <p style={{ fontSize:'.9rem', marginBottom:'1rem', lineHeight:1.7 }}>{s.desc}</p>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:'.4rem' }}>
                    {s.features.map(f => (
                      <span key={f} style={{
                        background:s.bg, color:s.color,
                        fontSize:'.75rem', fontWeight:600, padding:'.25rem .7rem',
                        borderRadius:'9999px',
                      }}>{f}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
