import React from 'react';
import { MapPin, Navigation, ArrowRight, Compass, Building2, School, Bus } from 'lucide-react';
import { MOCK_CORRIDOR_DATA } from '../../data/mockProperties';

export const CorridorMapVisual: React.FC = () => {
  const d = MOCK_CORRIDOR_DATA;

  return (
    <section className="section-wrapper" style={{ background: 'var(--canvas-bg-alt)' }}>
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 3.5rem' }}>
          <div className="pill-badge pill-badge--aqua" style={{ marginBottom: '1rem' }}>
            <Compass size={14} />
            <span>Spatial Transit Corridor</span>
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
            Bridge The Distance <br />
            <span style={{ color: '#0284c7' }}>From Kadapa to Panyam.</span>
          </h2>

          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.6 }}>
            Understand the geographic journey before you pack. Trace the transit corridor along National Highway 40, distance milestones, and key neighborhood institutions.
          </p>
        </div>

        {/* Map Container */}
        <div
          className="iridescent-card"
          style={{
            maxWidth: '1040px',
            margin: '0 auto',
            padding: '2.5rem',
            border: '1px solid var(--border-medium)',
          }}
        >
          {/* Top Corridor Status Metrics */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
              gap: '1.5rem',
              marginBottom: '2rem',
              borderBottom: '1px solid var(--border-subtle)',
              paddingBottom: '1.5rem',
            }}
          >
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Origin Town</div>
              <div style={{ fontFamily: 'var(--font-metrics)', fontSize: '1.3rem', color: '#0f172a', fontWeight: 700 }}>
                Kadapa (YSR District)
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Transit Route</div>
              <div style={{ fontFamily: 'var(--font-metrics)', fontSize: '1.3rem', color: '#0284c7', fontWeight: 600 }}>
                118 km • NH 40 Highway
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Destination Hub</div>
              <div style={{ fontFamily: 'var(--font-metrics)', fontSize: '1.3rem', color: 'var(--c-goldenrod)', fontWeight: 600 }}>
                Panyam (Nandyal Region)
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Available Verified Beds</div>
              <div style={{ fontFamily: 'var(--font-metrics)', fontSize: '1.3rem', color: 'var(--c-lawn-green)', fontWeight: 600 }}>
                23 Vacant Rooms
              </div>
            </div>
          </div>

          {/* Stylized Spatial Highway Graphic */}
          <div
            style={{
              position: 'relative',
              background: 'radial-gradient(ellipse at center, rgba(15, 26, 38, 0.9) 0%, rgba(8, 12, 17, 0.95) 100%)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              padding: '2.5rem 1.5rem',
              overflow: 'hidden',
            }}
          >
            {/* SVG Transit Line */}
            <svg
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
              }}
            >
              <defs>
                <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#00ffff" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#daa520" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#32cd32" stopOpacity="0.9" />
                </linearGradient>
              </defs>
              <line
                x1="12%"
                y1="50%"
                x2="88%"
                y2="50%"
                stroke="url(#routeGrad)"
                strokeWidth="3"
                strokeDasharray="6 4"
              />
            </svg>

            {/* Visual Milestones along the route */}
            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                zIndex: 1,
              }}
            >
              {/* Origin Point */}
              <div style={{ textAlign: 'center', maxWidth: '140px' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: '#e0f2fe',
                    border: '2px solid #0284c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 0.75rem',
                    color: '#0284c7',
                    boxShadow: '0 4px 14px rgba(2, 132, 199, 0.2)',
                  }}
                >
                  <Navigation size={22} />
                </div>
                <div style={{ fontFamily: 'var(--font-metrics)', fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 700 }}>
                  Kadapa
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Departure Point</div>
              </div>

              {/* Transit Junction: Allagadda */}
              <div style={{ textAlign: 'center', maxWidth: '140px' }} className="transit-midpoint">
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'var(--surface-1)',
                    border: '1px solid var(--border-medium)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 0.5rem',
                    color: 'var(--text-muted)',
                  }}
                >
                  <Bus size={14} />
                </div>
                <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Allagadda
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Km 68 (NH 40)</div>
              </div>

              {/* Destination Point: Panyam */}
              <div style={{ textAlign: 'center', maxWidth: '160px' }}>
                <div
                  style={{
                    width: '54px',
                    height: '54px',
                    borderRadius: '50%',
                    background: '#ecfdf5',
                    border: '2.5px solid #16a34a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 0.75rem',
                    color: '#16a34a',
                    boxShadow: '0 4px 16px rgba(22, 163, 74, 0.2)',
                  }}
                >
                  <MapPin size={26} />
                </div>
                <div style={{ fontFamily: 'var(--font-metrics)', fontSize: '1.2rem', color: 'var(--text-primary)', fontWeight: 800 }}>
                  Panyam
                </div>
                <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600 }}>
                  Target Destination
                </div>
              </div>
            </div>
          </div>

          {/* Key Destination Hotspots in Panyam */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
              gap: '1rem',
              marginTop: '1.5rem',
            }}
          >
            <div
              style={{
                padding: '0.85rem 1rem',
                background: 'var(--surface-1)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
              }}
            >
              <School size={20} color="var(--c-goldenrod)" />
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600 }}>Govt. Polytechnic & Degree</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>750m from Sri Sai PG</div>
              </div>
            </div>

            <div
              style={{
                padding: '0.85rem 1rem',
                background: 'var(--surface-1)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
              }}
            >
              <Building2 size={20} color="#0284c7" />
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600 }}>Panyam Cements Cluster</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Industrial zone & training center</div>
              </div>
            </div>

            <div
              style={{
                padding: '0.85rem 1rem',
                background: 'var(--surface-1)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
              }}
            >
              <Bus size={20} color="var(--c-lawn-green)" />
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600 }}>Panyam Bus Stand</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Direct bus connect to Kadapa & Kurnool</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
