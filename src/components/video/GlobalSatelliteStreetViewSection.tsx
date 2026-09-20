import React, { useState } from 'react';
import { Compass, Navigation, Layers, MapPin, Eye, ExternalLink, ShieldCheck, Sparkles, Building2 } from 'lucide-react';
import { StreetViewSatelliteViewer } from '../maps/StreetViewSatelliteViewer';

export const GlobalSatelliteStreetViewSection: React.FC = () => {
  const [activeCityKey, setActiveCityKey] = useState<'panyam' | 'hyderabad' | 'london' | 'tokyo'>('panyam');

  const globalCities = [
    {
      key: 'panyam' as const,
      name: 'Panyam, AP',
      coords: { lat: 15.5185, lng: 78.3492 },
      address: 'Opp. Old Bus Stand Road, Near Govt. Polytechnic, Panyam',
      buildingName: 'Sri Sai Luxury PG & Residency',
      description: 'Educational cluster corridor with direct student access and tar road frontage.',
    },
    {
      key: 'hyderabad' as const,
      name: 'Hyderabad (Hitec City)',
      coords: { lat: 17.4435, lng: 78.3772 },
      address: 'Madhapur / Hitec City Metro Corridor, Hyderabad',
      buildingName: 'Cyber Towers Executive Living',
      description: 'High-density tech corridor with metro transit access and modern amenities.',
    },
    {
      key: 'london' as const,
      name: 'London (Bloomsbury)',
      coords: { lat: 51.5225, lng: -0.1308 },
      address: 'Gower Street, University College London Hub, London',
      buildingName: 'Bloomsbury International Student Studios',
      description: 'Historic academic district with walkable university campuses and transit links.',
    },
    {
      key: 'tokyo' as const,
      name: 'Tokyo (Shinjuku)',
      coords: { lat: 35.6938, lng: 139.7034 },
      address: 'Kabukicho / Shinjuku Station Perimeter, Tokyo',
      buildingName: 'Shinjuku Micro-Living Pods',
      description: 'Ultra-modern compact metropolitan living next to the world’s busiest transit station.',
    },
  ];

  const currentCity = globalCities.find((c) => c.key === activeCityKey) || globalCities[0];

  return (
    <section
      id="street-view-recon"
      className="section-wrapper"
      style={{
        background: 'var(--canvas-bg)',
      }}
    >
      <div className="container">
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto clamp(1.5rem, 3vw, 2.25rem)' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.35rem 0.95rem',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(14, 165, 233, 0.1)',
              border: '1px solid rgba(14, 165, 233, 0.3)',
              marginBottom: '0.75rem',
            }}
          >
            <Navigation size={14} color="var(--c-sky-blue)" />
            <span
              style={{
                fontFamily: 'var(--font-metrics)',
                fontSize: '0.78rem',
                color: 'var(--c-sky-blue)',
                fontWeight: 800,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              Google Maps Street View & Satellite Mapping
            </span>
          </div>

          <h2
            style={{
              fontFamily: 'var(--font-editorial)',
              fontSize: 'clamp(1.75rem, 3.8vw, 2.75rem)',
              color: '#0f172a',
              marginBottom: '0.75rem',
              lineHeight: 1.2,
            }}
          >
            Inspect Any Building In The World{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, var(--c-sky-blue) 0%, var(--c-pink) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Before You Step Foot In Town.
            </span>
          </h2>

          <p
            style={{
              color: '#475569',
              fontSize: 'clamp(0.92rem, 2vw, 1.05rem)',
              lineHeight: 1.55,
              maxWidth: '680px',
              margin: '0 auto',
            }}
          >
            Switch between satellite aerial reconnaissance and street-level perspective for any property across India or globally.
            Check road tar quality, surrounding storefronts, and access gates directly from maps.
          </p>
        </div>

        {/* Global City Selector Tabs */}
        <div
          className="satellite-city-tabs"
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '0.5rem',
            overflowX: 'auto',
            paddingBottom: '0.5rem',
            marginBottom: '1.25rem',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {globalCities.map((city) => {
            const isActive = activeCityKey === city.key;
            return (
              <button
                key={city.key}
                type="button"
                onClick={() => setActiveCityKey(city.key)}
                className="neomorph-btn"
                style={{
                  flex: '0 0 auto',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.5rem 1.1rem',
                  borderRadius: 'var(--radius-full)',
                  background: isActive ? 'var(--c-sky-blue)' : 'var(--surface-neomorph)',
                  color: isActive ? '#ffffff' : '#334155',
                  fontWeight: isActive ? 800 : 600,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  border: isActive ? '1px solid var(--c-sky-blue)' : '1px solid #cbd5e1',
                  boxShadow: isActive ? '0 4px 15px rgba(14, 165, 233, 0.4)' : 'var(--shadow-neomorph-sm)',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                <MapPin size={14} color={isActive ? '#ffffff' : 'var(--c-sky-blue)'} />
                <span>{city.name}</span>
              </button>
            );
          })}
        </div>

        {/* Interactive Street View & Satellite Viewer Frame */}
        <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
          <StreetViewSatelliteViewer
            coordinates={currentCity.coords}
            address={currentCity.address}
            propertyName={currentCity.buildingName}
            town={currentCity.name}
            height="clamp(320px, 50vh, 520px)"
            allowToggle={true}
          />

          {/* Context Explanatory Footer */}
          <div
            className="satellite-footer-meta"
            style={{
              marginTop: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem',
              padding: '0.65rem 1rem',
              background: '#ffffff',
              borderRadius: 'var(--radius-md)',
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
              fontSize: '0.82rem',
              color: '#64748b',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '1 1 280px' }}>
              <Building2 size={16} color="var(--c-sky-blue)" style={{ flexShrink: 0 }} />
              <div>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>{currentCity.buildingName}: </span>
                <span>{currentCity.description}</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--c-lawn-green)', fontWeight: 700, flexShrink: 0 }}>
              <ShieldCheck size={16} />
              <span>Real-Time Map & Street View Active</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
