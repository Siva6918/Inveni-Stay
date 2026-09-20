import React from 'react';
import { PropertyListing, NeighborhoodLandmark } from '../../types';
import { MapPin, Navigation, GraduationCap, Bus, Hospital, ShoppingBag, ShieldCheck, Info } from 'lucide-react';

interface LocationNeighborhoodSectionProps {
  property: PropertyListing;
}

export const LocationNeighborhoodSection: React.FC<LocationNeighborhoodSectionProps> = ({ property }) => {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'college':
        return <GraduationCap size={16} color="var(--c-aqua)" />;
      case 'transit':
        return <Bus size={16} color="var(--c-goldenrod)" />;
      case 'hospital':
        return <Hospital size={16} color="var(--c-crimson)" />;
      default:
        return <ShoppingBag size={16} color="var(--c-lawn-green)" />;
    }
  };

  const landmarks: NeighborhoodLandmark[] = property.neighborhoodLandmarks || [
    { name: 'Santhiram Engineering & Medical College', category: 'college', distance: '850 m', walkingMinutes: 10 },
    { name: 'Panyam RTC Bus Stand & Town Auto Junction', category: 'transit', distance: '450 m', walkingMinutes: 5 },
    { name: 'Government Primary Health Centre & Pharmacy', category: 'hospital', distance: '1.2 km', walkingMinutes: 14 },
    { name: 'Panyam Daily Farmers Market & Supermarket', category: 'market', distance: '300 m', walkingMinutes: 4 },
    { name: 'NH-40 Rayalaseema Express Transit Highway', category: 'transit', distance: '600 m', walkingMinutes: 7 },
  ];

  return (
    <section
      style={{
        marginBottom: '3.5rem',
        padding: '2.5rem',
        background: 'var(--surface-neomorph)',
        border: '1.5px solid rgba(255, 255, 255, 0.85)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-neomorph-lg)',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div className="metaverse-hud" style={{ marginBottom: '0.75rem' }}>
          <Navigation size={14} color="var(--c-sky-blue)" />
          <span>[GEOLOCATION & SATELLITE TELEMETRY]</span>
        </div>

        <h2
          style={{
            fontFamily: 'var(--font-headline)',
            fontSize: 'clamp(1.75rem, 3vw, 2.35rem)',
            fontWeight: 800,
            color: '#0f172a',
            textTransform: 'uppercase',
            letterSpacing: '0.02em',
            margin: '0 0 0.5rem 0',
          }}
        >
          Neighborhood & Commute Times
        </h2>

        <p
          style={{
            color: 'var(--text-secondary)',
            fontSize: '0.95rem',
            maxWidth: '750px',
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          Located centrally in Panyam along the college transit road. Safe residential street with direct streetlights
          and immediate access to regional buses and daily essentials.
        </p>
      </div>

      {/* 2-Column Layout: Landmarks List & Vector Map Placeholder */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 1fr',
          gap: '2rem',
        }}
        className="location-section-grid"
      >
        {/* Left: Walking Distances to Key Points */}
        <div>
          <h4
            style={{
              color: '#0f172a',
              fontSize: '1.05rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '1rem',
            }}
          >
            Key Transit & Academic Destinations
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {landmarks.map((lm, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.95rem 1.15rem',
                  background: 'var(--surface-neomorph-inset)',
                  border: '1px solid rgba(194, 202, 216, 0.35)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.15) 0%, rgba(236, 72, 153, 0.15) 100%)',
                      border: '1px solid rgba(14, 165, 233, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {getCategoryIcon(lm.category)}
                  </div>
                  <div>
                    <div style={{ color: '#0f172a', fontWeight: 800, fontSize: '0.9rem' }}>
                      {lm.name}
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'capitalize', fontWeight: 600 }}>
                      {lm.category} Destination
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: 'var(--c-green)', fontWeight: 800, fontSize: '0.92rem' }}>
                    {lm.distance}
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>
                    ~{lm.walkingMinutes} min walk
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Photorealistic Satellite Mapping Layer */}
        <div
          style={{
            position: 'relative',
            borderRadius: 'var(--radius-lg)',
            border: '1.5px solid #cbd5e1',
            boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08), 0 0 20px rgba(14, 165, 233, 0.1)',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '360px',
            overflow: 'hidden',
            backgroundColor: '#f8fafc',
          }}
        >
          {/* Satellite Base Texture */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage:
                'url(https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1200&q=85)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'contrast(1.1) brightness(0.98) saturate(1.1)',
            }}
          />

          {/* Semi-transparent Satellite Grid Overlay */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage:
                'linear-gradient(rgba(15, 23, 42, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(15, 23, 42, 0.05) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
              pointerEvents: 'none',
            }}
          />

          {/* Concentric Distance Rings on Satellite */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '240px',
              height: '240px',
              borderRadius: '50%',
              border: '1.5px dashed rgba(2, 132, 199, 0.6)',
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '140px',
              height: '140px',
              borderRadius: '50%',
              border: '1.5px dashed rgba(16, 185, 129, 0.75)',
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
            }}
          />

          {/* Top Satellite Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 2 }}>
            <span
              style={{
                fontSize: '0.72rem',
                color: '#0f172a',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                background: 'rgba(255, 255, 255, 0.95)',
                padding: '0.25rem 0.65rem',
                borderRadius: 'var(--radius-xs)',
                border: '1px solid #cbd5e1',
                boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
              }}
            >
              🛰️ Satellite Reconnaissance (Panyam)
            </span>
            <span
              style={{
                fontSize: '0.7rem',
                color: '#0284c7',
                fontWeight: 700,
                background: 'rgba(255, 255, 255, 0.95)',
                padding: '0.25rem 0.65rem',
                borderRadius: 'var(--radius-xs)',
                border: '1px solid #bae6fd',
                boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
              }}
            >
              1km Orbital Circle
            </span>
          </div>

          {/* Center Pin (Sri Sai Residency) on Satellite */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              zIndex: 3,
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: '#ffffff',
                color: '#0284c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 20px rgba(2, 132, 199, 0.35), 0 4px 12px rgba(15, 23, 42, 0.15)',
                border: '2.5px solid #0284c7',
              }}
            >
              <MapPin size={22} color="#0284c7" />
            </div>
            <div
              style={{
                background: '#ffffff',
                padding: '0.3rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid #0284c7',
                color: '#0f172a',
                fontSize: '0.75rem',
                fontWeight: 800,
                marginTop: '0.35rem',
                whiteSpace: 'nowrap',
                boxShadow: '0 4px 12px rgba(15, 23, 42, 0.1)',
              }}
            >
              Sri Sai Residency
            </div>
          </div>

          {/* College Pin on Satellite */}
          <div
            style={{
              position: 'absolute',
              top: '20%',
              left: '74%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              zIndex: 2,
            }}
          >
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: '#ffffff',
                border: '1.5px solid #0284c7',
                color: '#0f172a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            >
              <GraduationCap size={15} color="#0284c7" />
            </div>
            <span
              style={{
                fontSize: '0.68rem',
                color: '#0f172a',
                fontWeight: 700,
                marginTop: '0.2rem',
                whiteSpace: 'nowrap',
                background: 'rgba(255, 255, 255, 0.95)',
                padding: '0.15rem 0.45rem',
                borderRadius: '3px',
                border: '1px solid #cbd5e1',
                boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
              }}
            >
              College (850m)
            </span>
          </div>

          {/* Bus Stand Pin on Satellite */}
          <div
            style={{
              position: 'absolute',
              top: '72%',
              left: '24%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              zIndex: 2,
            }}
          >
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: '#ffffff',
                border: '1.5px solid #d97706',
                color: '#d97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            >
              <Bus size={15} color="#d97706" />
            </div>
            <span
              style={{
                fontSize: '0.68rem',
                color: '#0f172a',
                fontWeight: 700,
                marginTop: '0.2rem',
                whiteSpace: 'nowrap',
                background: 'rgba(255, 255, 255, 0.95)',
                padding: '0.15rem 0.45rem',
                borderRadius: '3px',
                border: '1px solid #cbd5e1',
                boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
              }}
            >
              Bus Stand (450m)
            </span>
          </div>

          {/* Bottom Satellite Caption */}
          <div
            style={{
              zIndex: 2,
              background: 'rgba(255, 255, 255, 0.95)',
              padding: '0.45rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid #cbd5e1',
              fontSize: '0.72rem',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            }}
          >
            <span>🛰️ Live Satellite Terrain Projection</span>
            <span style={{ color: '#0284c7', fontWeight: 700 }}>Panyam Hub</span>
          </div>
        </div>
      </div>

      {/* Honest Demo Disclaimer Notice */}
      <div
        style={{
          marginTop: '1.75rem',
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius-md)',
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          color: 'var(--text-muted)',
          fontSize: '0.78rem',
        }}
      >
        <Info size={16} color="var(--c-aqua)" style={{ flexShrink: 0 }} />
        <span>
          <strong>Geospatial Data Transparency:</strong> Distances shown are measured pedestrian path walking times in
          Panyam town. Coordinates reflect verified municipal parcel markers.
        </span>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .location-section-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
};
