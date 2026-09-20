import React from 'react';
import { MapPin, ArrowRight, Building2, Bed, Compass } from 'lucide-react';

interface FeaturedDestinationsSectionProps {
  onSelectDestination: (destination: string) => void;
}

interface DestinationItem {
  name: string;
  state: string;
  propertyCount: number;
  availableRooms: number;
  image: string;
  tag: string;
  isPrimary?: boolean;
}

const DESTINATIONS: DestinationItem[] = [
  {
    name: 'Panyam',
    state: 'Andhra Pradesh',
    propertyCount: 14,
    availableRooms: 23,
    image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80',
    tag: 'Primary Verified Hub • Demo Stay Center',
    isPrimary: true,
  },
  {
    name: 'Hyderabad',
    state: 'Telangana',
    propertyCount: 2,
    availableRooms: 8,
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    tag: 'HITEC City & Gachibowli Corridor',
  },
  {
    name: 'Bengaluru',
    state: 'Karnataka',
    propertyCount: 1,
    availableRooms: 4,
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
    tag: 'Electronic City Tech Stays',
  },
  {
    name: 'Pune',
    state: 'Maharashtra',
    propertyCount: 1,
    availableRooms: 3,
    image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80',
    tag: 'Hinjewadi & Viman Nagar Stays',
  },
  {
    name: 'Chennai',
    state: 'Tamil Nadu',
    propertyCount: 1,
    availableRooms: 5,
    image: 'https://images.unsplash.com/photo-1567521464027-f127ff144326?auto=format&fit=crop&w=800&q=80',
    tag: 'OMR IT Corridor & Student Residences',
  },
];

export const FeaturedDestinationsSection: React.FC<FeaturedDestinationsSectionProps> = ({
  onSelectDestination,
}) => {
  return (
    <section className="section-wrapper" style={{ background: 'var(--canvas-bg-alt)', position: 'relative' }}>
      <div className="container">
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto clamp(2rem, 5vw, 3.5rem)' }}>
          <div
            className="metaverse-hud"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1rem',
            }}
          >
            <Compass size={15} color="#0284c7" />
            <span>[GEOGRAPHIC DESTINATION NETWORKS]</span>
          </div>

          <h2
            style={{
              fontFamily: 'var(--font-headline)',
              fontSize: 'clamp(2rem, 3.8vw, 3rem)',
              color: 'var(--text-primary)',
              marginBottom: '0.4rem',
              lineHeight: 1.15,
              textTransform: 'uppercase',
            }}
          >
            Featured Destinations
          </h2>

          <div style={{ marginBottom: '1.25rem' }}>
            <span
              style={{
                fontFamily: 'var(--font-niconne)',
                fontSize: 'clamp(1.15rem, 3vw, 1.5rem)',
                color: '#0284c7',
                letterSpacing: '0.02em',
              }}
            >
              discover Panyam &amp; beyond — your next chapter
            </span>
          </div>

          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.6 }}>
            Explore verified stays across tier-2 education hubs and major metropolitan growth corridors with live vacant unit counts.
          </p>
        </div>

        {/* Destination Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
            gap: '1.5rem',
          }}
        >
          {DESTINATIONS.map((dest) => (
            <div
              key={dest.name}
              className="glass-card-premium"
              style={{
                borderRadius: 'var(--radius-xl)',
                overflow: 'hidden',
                background: '#ffffff',
                border: dest.isPrimary
                  ? '1.5px solid #0284c7'
                  : '1px solid #e2e8f0',
                boxShadow: dest.isPrimary
                  ? '0 12px 30px rgba(2, 132, 199, 0.15), 0 4px 16px rgba(15, 23, 42, 0.05)'
                  : '0 4px 20px -2px rgba(15, 23, 42, 0.05)',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease',
                cursor: 'pointer',
              }}
              onClick={() => onSelectDestination(dest.name)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.borderColor = '#0284c7';
                e.currentTarget.style.boxShadow = '0 16px 36px rgba(15, 23, 42, 0.1), 0 0 20px rgba(2, 132, 199, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = dest.isPrimary
                  ? '#0284c7'
                  : '#e2e8f0';
                e.currentTarget.style.boxShadow = dest.isPrimary
                  ? '0 12px 30px rgba(2, 132, 199, 0.15), 0 4px 16px rgba(15, 23, 42, 0.05)'
                  : '0 4px 20px -2px rgba(15, 23, 42, 0.05)';
              }}
            >
              {/* Destination Image Cover with Overlay */}
              <div style={{ position: 'relative', height: '180px', overflow: 'hidden' }}>
                <img
                  src={dest.image}
                  alt={dest.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.4s ease',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(15, 23, 42, 0.4) 0%, rgba(15, 23, 42, 0.05) 50%, transparent 100%)',
                  }}
                />

                {/* Primary Tag Pill */}
                <div
                  style={{
                    position: 'absolute',
                    top: '0.85rem',
                    left: '0.85rem',
                    background: 'rgba(255, 255, 255, 0.92)',
                    backdropFilter: 'blur(8px)',
                    padding: '0.3rem 0.75rem',
                    borderRadius: 'var(--radius-full)',
                    border: dest.isPrimary ? '1px solid #0284c7' : '1px solid #cbd5e1',
                    fontSize: '0.72rem',
                    fontFamily: 'var(--font-metrics)',
                    fontWeight: 700,
                    color: dest.isPrimary ? '#0284c7' : 'var(--text-secondary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    boxShadow: '0 2px 8px rgba(15, 23, 42, 0.08)',
                  }}
                >
                  {dest.tag}
                </div>
              </div>

              {/* Destination Body Info */}
              <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <h3
                      style={{
                        fontFamily: 'var(--font-headline)',
                        fontSize: '1.65rem',
                        fontWeight: 800,
                        color: 'var(--text-primary)',
                        margin: 0,
                        textTransform: 'uppercase',
                      }}
                    >
                      {dest.name}
                    </h3>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{dest.state}</span>
                  </div>

                  {/* Metrics: Properties & Vacancies */}
                  <div
                    style={{
                      display: 'flex',
                      gap: '1rem',
                      alignItems: 'center',
                      marginTop: '0.85rem',
                      padding: '0.65rem 0.85rem',
                      background: '#f8fafc',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <Building2 size={15} color="var(--c-sky-blue)" />
                      <span><strong>{dest.propertyCount}</strong> Stays</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#16a34a' }}>
                      <Bed size={15} color="#16a34a" />
                      <span><strong>{dest.availableRooms}</strong> Rooms</span>
                    </div>
                  </div>
                </div>

                {/* Explore CTA */}
                <div
                  style={{
                    marginTop: '1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '0.85rem',
                    borderTop: '1px solid #f1f5f9',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: 800,
                      color: '#0284c7',
                      fontFamily: 'var(--font-metrics)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    Explore Stays
                  </span>
                  <ArrowRight size={16} color="#0284c7" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
