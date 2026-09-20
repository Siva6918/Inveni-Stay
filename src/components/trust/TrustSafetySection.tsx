import React from 'react';
import { ShieldCheck, MapPin, Clock, UserCheck, RefreshCw } from 'lucide-react';

export const TrustSafetySection: React.FC = () => {
  const pillars = [
    {
      icon: <ShieldCheck size={28} color="var(--c-goldenrod)" />,
      title: 'Physical On-Site Verification',
      desc: 'Local Inveni coordinators physically inspect every property, verifying door locks, ventilation, water quality, and Wi-Fi speed before awarding the seal.',
      badge: 'Audit Seal #IV-2026',
    },
    {
      icon: <Clock size={28} color="var(--c-lawn-green)" />,
      title: 'Timestamped Availability',
      desc: 'No ghost rooms. Every room vacancy is timestamped with "Updated X minutes ago" directly from the verified host dashboard.',
      badge: 'Real-Time Sync',
    },
    {
      icon: <UserCheck size={28} color="var(--c-aqua)" />,
      title: 'Verified Landlord KYC',
      desc: 'All property managers undergo identity verification, ensuring direct, unmasked telephone and WhatsApp access upon room reservation.',
      badge: 'Direct Host Connect',
    },
    {
      icon: <RefreshCw size={28} color="var(--c-yellow)" />,
      title: '100% Arrival Token Guarantee',
      desc: 'Your ₹500 reservation token is held safely in escrow. If the room does not match its inspection profile upon your arrival, it is refunded instantly.',
      badge: 'Zero Risk Lock',
    },
  ];

  return (
    <section id="trust" className="section-wrapper" style={{ background: 'var(--canvas-bg)' }}>
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 3.5rem' }}>
          <div className="pill-badge pill-badge--verified" style={{ marginBottom: '1rem' }}>
            <ShieldCheck size={14} />
            <span>The Trust Standard</span>
          </div>

          <h2
            style={{
              fontFamily: 'var(--font-editorial)',
              fontSize: 'clamp(2rem, 3.8vw, 3rem)',
              color: 'var(--text-primary)',
              marginBottom: '1rem',
              lineHeight: 1.2,
            }}
          >
            Remote Booking Demands <br />
            <span style={{ color: 'var(--c-goldenrod)' }}>Absolute Transparency.</span>
          </h2>

          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.6 }}>
            When you are 100+ kilometers away, vague assurances are not enough. We built Inveni Stay with an uncompromising verification standard inspired by our verified brand seal.
          </p>
        </div>

        {/* Pillars Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
            gap: '1.5rem',
            maxWidth: '1100px',
            margin: '0 auto',
          }}
        >
          {pillars.map((pillar) => (
            <div
              key={pillar.title}
              className="iridescent-card"
              style={{
                padding: '2rem 1.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div
                  style={{
                    width: '54px',
                    height: '54px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--surface-1)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.25rem',
                  }}
                >
                  {pillar.icon}
                </div>

                <div
                  style={{
                    fontSize: '0.72rem',
                    fontFamily: 'var(--font-metrics)',
                    textTransform: 'uppercase',
                    color: 'var(--c-goldenrod)',
                    letterSpacing: '0.08em',
                    marginBottom: '0.35rem',
                    fontWeight: 600,
                  }}
                >
                  {pillar.badge}
                </div>

                <h3
                  style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: '1.2rem',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    marginBottom: '0.75rem',
                  }}
                >
                  {pillar.title}
                </h3>

                <p
                  style={{
                    fontSize: '0.88rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.6,
                  }}
                >
                  {pillar.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
