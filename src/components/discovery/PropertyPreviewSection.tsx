import React from 'react';
import { ShieldCheck, MapPin, Star, Utensils, Wifi, Droplets, ShowerHead, Check, ArrowRight } from 'lucide-react';
import { MOCK_PRIMARY_PROPERTY } from '../../data/mockProperties';

interface PropertyPreviewProps {
  onInspectRoomsClick: () => void;
}

export const PropertyPreviewSection: React.FC<PropertyPreviewProps> = ({ onInspectRoomsClick }) => {
  const p = MOCK_PRIMARY_PROPERTY;

  return (
    <section className="section-wrapper" style={{ background: 'var(--canvas-bg-alt)' }}>
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 3.5rem' }}>
          <div className="pill-badge pill-badge--verified" style={{ marginBottom: '1rem' }}>
            <ShieldCheck size={14} />
            <span>Featured Prototype Listing • Demo Data</span>
          </div>

          <div style={{ marginBottom: '0.5rem' }}>
            <span
              style={{
                fontFamily: 'var(--font-croissant)',
                fontSize: '1.15rem',
                color: '#b45309',
                letterSpacing: '0.02em',
              }}
            >
              your next stay — made personal
            </span>
          </div>

          <h2
            style={{
              fontFamily: 'var(--font-headline)',
              fontSize: 'clamp(2rem, 3.8vw, 3rem)',
              color: '#0f172a',
              textTransform: 'uppercase',
              marginBottom: '1rem',
              lineHeight: 1.2,
            }}
          >
            Real Properties. Exact Vacancies.
          </h2>

          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.6 }}>
            Every property listed on Inveni Stay is verified by local coordinators, with granular room-by-room status so you never face sudden arrival surprises.
          </p>
        </div>

        {/* Big Showcase Property Card */}
        <div
          className="iridescent-card"
          style={{
            maxWidth: '1040px',
            margin: '0 auto',
            padding: '2rem',
            border: '1px solid rgba(218, 165, 32, 0.35)',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '2.5rem',
              alignItems: 'center',
            }}
          >
            {/* Left: Property Graphic & Verified Seal */}
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  position: 'relative',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  aspectRatio: '4 / 3',
                  background: 'var(--surface-1)',
                  border: '1px solid var(--border-medium)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {/* Real Architectural Image with Graceful Fallback */}
                <img
                  src={p.heroImage || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80'}
                  alt="Sri Sai PG Exterior Architecture Preview"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80';
                  }}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />

                {/* Top Floating Badge */}
                <div
                  style={{
                    position: 'absolute',
                    top: '1rem',
                    left: '1rem',
                    background: 'rgba(8, 12, 17, 0.85)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(50, 205, 50, 0.4)',
                    padding: '0.35rem 0.75rem',
                    borderRadius: 'var(--radius-full)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    color: 'var(--c-lawn-green)',
                    fontFamily: 'var(--font-metrics)',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                  }}
                >
                  <span className="radar-pulse" />
                  <span>3 Rooms Vacant Today</span>
                </div>

                {/* Verified Physical Checkmark Stamp */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '1rem',
                    right: '1rem',
                    background: 'rgba(218, 165, 32, 0.15)',
                    border: '1px solid var(--c-goldenrod)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.4rem 0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    color: 'var(--c-goldenrod)',
                    fontSize: '0.75rem',
                    fontFamily: 'var(--font-metrics)',
                    fontWeight: 600,
                  }}
                >
                  <ShieldCheck size={16} />
                  <span>On-Site Verified Host</span>
                </div>
              </div>

              {/* Verified Certificate Metadata Bar */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: '0.85rem',
                  fontSize: '0.78rem',
                  color: 'var(--text-muted)',
                }}
              >
                <span>Audit ID: IV-PAN-2026</span>
                <span>Host: Rameshwar Reddy</span>
                <span>Biometric Entry</span>
              </div>
            </div>

            {/* Right: Details, Pricing, Amenities, Action */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--c-goldenrod)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  <Star size={16} fill="var(--c-goldenrod)" />
                  <strong style={{ fontFamily: 'var(--font-metrics)', fontSize: '0.95rem' }}>4.8</strong>
                </span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                  (38 Verified Student Reviews)
                </span>
              </div>

              <h3
                style={{
                  fontFamily: 'var(--font-headline)',
                  fontSize: '1.85rem',
                  fontWeight: 800,
                  color: '#0f172a',
                  marginBottom: '0.5rem',
                  textTransform: 'uppercase',
                }}
              >
                {p.name}
              </h3>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  color: '#0284c7',
                  fontSize: '0.88rem',
                  marginBottom: '1rem',
                  fontWeight: 500,
                }}
              >
                <MapPin size={16} />
                <span>{p.address} • {p.distanceToCollege}</span>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: '0.6rem',
                  marginBottom: '1.5rem',
                  padding: '0.75rem 1rem',
                  background: 'var(--surface-1)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-metrics)',
                    fontSize: '1.75rem',
                    color: '#16a34a',
                    fontWeight: 700,
                  }}
                >
                  ₹{p.startingRent.toLocaleString()}
                </span>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>/ month (including 3-time meals & Wi-Fi)</span>
                <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Deposit: ₹{p.securityDeposit}</span>
              </div>

              {/* Core Amenities Matrix */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '0.85rem',
                  marginBottom: '2rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <Utensils size={16} color="#d97706" />
                  <span>3 Andhra Meals/Day</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <Wifi size={16} color="#0284c7" />
                  <span>150 Mbps Inverter Wi-Fi</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <ShowerHead size={16} color="#16a34a" />
                  <span>Private Western Bath & Geyser</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <Droplets size={16} color="#0284c7" />
                  <span>24/7 Commercial RO Water</span>
                </div>
              </div>

              {/* Action Buttons: 3D Tour + Room Availability Matrix */}
              <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={onInspectRoomsClick}
                  className="btn-iridescent"
                  style={{ flex: 1, minWidth: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.85rem 1.25rem', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer' }}
                >
                  <span>🥽 Explore in 3D Tour</span>
                </button>

                <button
                  type="button"
                  onClick={onInspectRoomsClick}
                  className="btn-primary"
                  style={{ flex: 1.2, minWidth: '220px' }}
                >
                  <span>Inspect Room Matrix</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
