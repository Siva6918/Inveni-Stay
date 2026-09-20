import React from 'react';
import { Home, Building, Store, Trees, CheckCircle2, Clock } from 'lucide-react';

export const VisionExpansionSection: React.FC = () => {
  const tiers = [
    {
      title: 'PG & Shared Hostels',
      stage: 'Active MVP Focus',
      active: true,
      icon: <Home size={24} color="var(--c-lawn-green)" />,
      badgeColor: 'var(--c-lawn-green)',
      desc: 'Room-by-room remote discovery for relocating students and young professionals. Meals, Wi-Fi, and attached bathrooms.',
    },
    {
      title: 'Flats & Studio Rentals',
      stage: 'Phase 2 Expansion',
      active: false,
      icon: <Building size={24} color="var(--c-goldenrod)" />,
      badgeColor: 'var(--c-goldenrod)',
      desc: '1BHK & 2BHK apartments in Tier-2/3 district headquarters for visiting faculty, bank staff, and relocating families.',
    },
    {
      title: 'Retail Shops & Office Spaces',
      stage: 'Future Roadmap',
      active: false,
      icon: <Store size={24} color="var(--c-aqua)" />,
      badgeColor: 'var(--c-aqua)',
      desc: 'Commercial shop leases near regional bus stands and college campuses for coaching institutes, clinics, and retail.',
    },
    {
      title: 'Agricultural Land & Plots',
      stage: 'Long-Term Horizon',
      active: false,
      icon: <Trees size={24} color="var(--text-muted)" />,
      badgeColor: 'var(--text-muted)',
      desc: 'Verified land surveying, spatial boundary maps, and remote lease agreements across Bharat’s agricultural belts.',
    },
  ];

  return (
    <section className="section-wrapper" style={{ background: 'var(--canvas-bg)' }}>
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 3.5rem' }}>
          <div className="pill-badge pill-badge--verified" style={{ marginBottom: '1rem' }}>
            <span>Bharat Builds Vision</span>
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
            Starting with PGs. <br />
            <span style={{ color: 'var(--c-goldenrod)' }}>Architecting All of Bharat.</span>
          </h2>

          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.6 }}>
            Our hackathon MVP is relentlessly focused on solving the immediate pain of student relocation to PG rooms. Here is our deliberate growth trajectory across Tier-2 and Tier-3 India.
          </p>
        </div>

        {/* Roadmap Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.5rem',
            maxWidth: '1100px',
            margin: '0 auto',
          }}
        >
          {tiers.map((tier) => (
            <div
              key={tier.title}
              className="iridescent-card"
              style={{
                padding: '2rem 1.5rem',
                border: tier.active ? '1.5px solid #22c55e' : '1px solid #e2e8f0',
                background: tier.active ? '#f0fdf4' : '#ffffff',
                boxShadow: tier.active ? '0 10px 30px rgba(34, 197, 94, 0.1)' : '0 2px 8px rgba(15, 23, 42, 0.04)',
                borderRadius: 'var(--radius-xl)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1.25rem',
                }}
              >
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: 'var(--radius-sm)',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {tier.icon}
                </div>

                <span
                  style={{
                    fontFamily: 'var(--font-metrics)',
                    fontSize: '0.72rem',
                    textTransform: 'uppercase',
                    color: tier.badgeColor,
                    background: 'rgba(255, 255, 255, 0.9)',
                    padding: '0.2rem 0.6rem',
                    borderRadius: 'var(--radius-full)',
                    border: `1px solid ${tier.badgeColor}`,
                    fontWeight: 700,
                  }}
                >
                  {tier.stage}
                </span>
              </div>

              <h3
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  marginBottom: '0.65rem',
                }}
              >
                {tier.title}
              </h3>

              <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {tier.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
