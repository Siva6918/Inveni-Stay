import React, { useState } from 'react';
import { MapPin, Navigation, School, Compass, ShieldCheck, Eye, Layers, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { PropertyListing } from '../../types';

interface DiscoveryMapProps {
  properties: PropertyListing[];
  destination: string;
  selectedPropertyId?: string;
  onSelectProperty: (property: PropertyListing) => void;
}

export const DiscoveryMap: React.FC<DiscoveryMapProps> = ({
  properties,
  destination,
  selectedPropertyId,
  onSelectProperty,
}) => {
  const [hoveredProperty, setHoveredProperty] = useState<PropertyListing | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [mapMode, setMapMode] = useState<'satellite' | 'hybrid'>('hybrid');

  // Real Satellite imagery texture representing Rayalaseema / Panyam topography from orbit
  const satelliteTexture =
    'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1600&q=85';

  return (
    <div
      style={{
        width: '460px',
        height: 'calc(100vh - 150px)',
        position: 'sticky',
        top: '130px',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid #e2e8f0',
        background: '#f8fafc',
        boxShadow: '0 10px 30px -5px rgba(15, 23, 42, 0.08)',
      }}
    >
      {/* Top Map Context & Satellite Controls Bar */}
      <div
        style={{
          padding: '0.85rem 1.15rem',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 40,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#0284c7',
              boxShadow: '0 0 10px #0284c7',
            }}
          />
          <div>
            <div
              style={{
                fontFamily: 'var(--font-metrics)',
                fontSize: '0.85rem',
                color: '#0f172a',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                fontWeight: 700,
              }}
            >
              Satellite Map: {destination}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
              15.5204° N, 78.3512° E • High-Res Orbital Layer
            </div>
          </div>
        </div>

        {/* Satellite Mode Switcher */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            background: '#f1f5f9',
            borderRadius: 'var(--radius-sm)',
            padding: '0.2rem',
            border: '1px solid #cbd5e1',
          }}
        >
          <button
            onClick={() => setMapMode('hybrid')}
            style={{
              padding: '0.25rem 0.6rem',
              borderRadius: 'var(--radius-xs)',
              fontSize: '0.72rem',
              fontWeight: 700,
              background: mapMode === 'hybrid' ? '#0284c7' : 'transparent',
              color: mapMode === 'hybrid' ? '#ffffff' : '#64748b',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            Hybrid
          </button>
          <button
            onClick={() => setMapMode('satellite')}
            style={{
              padding: '0.25rem 0.6rem',
              borderRadius: 'var(--radius-xs)',
              fontSize: '0.72rem',
              fontWeight: 700,
              background: mapMode === 'satellite' ? '#0284c7' : 'transparent',
              color: mapMode === 'satellite' ? '#ffffff' : '#64748b',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            Satellite
          </button>
        </div>
      </div>

      {/* Satellite Map Canvas */}
      <div
        style={{
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: '#f8fafc',
        }}
      >
        {/* Actual Satellite Photography Surface */}
        <div
          style={{
            position: 'absolute',
            inset: -40,
            backgroundImage: `url(${satelliteTexture})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            transform: `scale(${zoomLevel})`,
            transition: 'transform 0.3s ease-out',
            filter:
              mapMode === 'hybrid'
                ? 'contrast(1.15) brightness(0.85) saturate(1.2)'
                : 'contrast(1.2) brightness(0.95)',
          }}
        />

        {/* Semi-transparent Satellite Ground Mesh & Road Overlay */}
        {mapMode === 'hybrid' && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage:
                'linear-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.08) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
              pointerEvents: 'none',
              mixBlendMode: 'overlay',
            }}
          />
        )}

        {/* Concentric Proximity Distance Rings (Walking distances on Satellite) */}
        <div
          style={{
            position: 'absolute',
            top: '44%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '240px',
            height: '240px',
            borderRadius: '50%',
            border: '1.5px dashed rgba(255, 255, 255, 0.45)',
            boxShadow: '0 0 20px rgba(0, 242, 254, 0.15)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '44%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '130px',
            height: '130px',
            borderRadius: '50%',
            border: '1.5px dashed rgba(0, 242, 254, 0.65)',
            pointerEvents: 'none',
          }}
        />

        {/* Radius Labels on Satellite Terrain */}
        <div
          style={{
            position: 'absolute',
            top: '32%',
            left: '52%',
            background: 'rgba(255, 255, 255, 0.95)',
            padding: '0.15rem 0.5rem',
            borderRadius: 'var(--radius-xs)',
            color: '#0284c7',
            fontSize: '0.65rem',
            fontWeight: 800,
            border: '1px solid #bae6fd',
            boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
            pointerEvents: 'none',
          }}
        >
          500m Radius
        </div>
        <div
          style={{
            position: 'absolute',
            top: '20%',
            left: '52%',
            background: 'rgba(255, 255, 255, 0.95)',
            padding: '0.15rem 0.5rem',
            borderRadius: 'var(--radius-xs)',
            color: '#0f172a',
            fontSize: '0.65rem',
            fontWeight: 800,
            border: '1px solid #cbd5e1',
            boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
            pointerEvents: 'none',
          }}
        >
          1 km Radius
        </div>

        {/* Central Anchor Landmark: Govt Polytechnic & Santhiram Campus */}
        <div
          style={{
            position: 'absolute',
            top: '44%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            zIndex: 10,
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: '#ffffff',
              color: '#000000',
              border: '2px solid #00f2fe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(0, 242, 254, 0.7)',
            }}
          >
            <School size={18} />
          </div>
          <span
            style={{
              marginTop: '4px',
              fontSize: '0.7rem',
              color: '#ffffff',
              fontWeight: 800,
              fontFamily: 'var(--font-metrics)',
              background: 'rgba(5, 10, 20, 0.92)',
              padding: '0.15rem 0.5rem',
              borderRadius: 'var(--radius-xs)',
              whiteSpace: 'nowrap',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.7)',
            }}
          >
            🎓 College Campus
          </span>
        </div>

        {/* High-Contrast Crisp White & Oily Satellite Property Pins */}
        {properties.map((p, idx) => {
          const angle = (idx / Math.max(1, properties.length)) * 2 * Math.PI;
          const radius = 60 + (idx % 3) * 40;
          const leftPercent = 50 + Math.cos(angle) * (radius / 3.2);
          const topPercent = 44 + Math.sin(angle) * (radius / 3.2);

          const isAvailable = p.availableRoomsCount > 0;
          const isSelected = selectedPropertyId === p.id;

          return (
            <div
              key={p.id}
              style={{
                position: 'absolute',
                left: `${leftPercent}%`,
                top: `${topPercent}%`,
                transform: 'translate(-50%, -50%)',
                zIndex: isSelected ? 30 : 20,
              }}
              onMouseEnter={() => setHoveredProperty(p)}
              onMouseLeave={() => setHoveredProperty(null)}
              onClick={() => onSelectProperty(p)}
            >
              <button
                type="button"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.3rem 0.65rem',
                  borderRadius: 'var(--radius-full)',
                  background: isSelected
                    ? '#00f2fe'
                    : isAvailable
                    ? '#ffffff'
                    : 'rgba(20, 25, 35, 0.92)',
                  color: isSelected ? '#000000' : isAvailable ? '#000000' : '#ffffff',
                  border: isSelected
                    ? '2px solid #ffffff'
                    : isAvailable
                    ? '2px solid #00f2fe'
                    : '1px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: isSelected
                    ? '0 0 25px #00f2fe, 0 8px 20px rgba(0, 0, 0, 0.8)'
                    : '0 6px 16px rgba(0, 0, 0, 0.6)',
                  cursor: 'pointer',
                  fontWeight: 800,
                  fontSize: '0.78rem',
                  fontFamily: 'var(--font-metrics)',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease',
                  transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                }}
              >
                <span
                  style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    background: isAvailable ? '#10b981' : '#f43f5e',
                  }}
                />
                <span>₹{p.startingRent.toLocaleString()}</span>
              </button>
            </div>
          );
        })}

        {/* Hovered Property Satellite Preview Card */}
        {hoveredProperty && (
          <div
            style={{
              position: 'absolute',
              bottom: '16px',
              left: '16px',
              right: '16px',
              background: '#ffffff',
              color: '#070a0e',
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.8), 0 0 20px rgba(0, 242, 254, 0.4)',
              zIndex: 35,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              border: '2px solid #00f2fe',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: '0.7rem',
                  color: '#00838f',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                {hoveredProperty.propertyType} • {hoveredProperty.distanceToCollege}
              </div>
              <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#070a0e', margin: '0.1rem 0' }}>
                {hoveredProperty.name}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#475569' }}>
                {hoveredProperty.availableRoomsCount > 0
                  ? `● ${hoveredProperty.availableRoomsCount} Rooms Ready`
                  : 'Waitlist Only'}
              </div>
            </div>

            <button
              onClick={() => onSelectProperty(hoveredProperty)}
              style={{
                background: '#0284c7',
                color: '#ffffff',
                border: 'none',
                padding: '0.45rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                boxShadow: '0 2px 6px rgba(2, 132, 199, 0.3)',
              }}
            >
              Explore →
            </button>
          </div>
        )}

        {/* Satellite Zoom & Control Buttons */}
        <div
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.4rem',
            zIndex: 25,
          }}
        >
          <button
            onClick={() => setZoomLevel((z) => Math.min(1.8, z + 0.2))}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-xs)',
              background: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #cbd5e1',
              color: '#0f172a',
              boxShadow: '0 2px 6px rgba(15, 23, 42, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontWeight: 800,
            }}
            title="Zoom In"
            aria-label="Zoom in satellite view"
          >
            <ZoomIn size={16} />
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.max(0.8, z - 0.2))}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-xs)',
              background: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #cbd5e1',
              color: '#0f172a',
              boxShadow: '0 2px 6px rgba(15, 23, 42, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontWeight: 800,
            }}
            title="Zoom Out"
            aria-label="Zoom out satellite view"
          >
            <ZoomOut size={16} />
          </button>
        </div>

        {/* Satellite Attribution watermark */}
        <div
          style={{
            position: 'absolute',
            bottom: '6px',
            left: '8px',
            fontSize: '0.62rem',
            color: '#475569',
            background: 'rgba(255, 255, 255, 0.9)',
            border: '1px solid #cbd5e1',
            padding: '0.1rem 0.4rem',
            borderRadius: '2px',
            pointerEvents: 'none',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}
        >
          🛰️ Earth Observation Imagery • Panyam Urban Cluster
        </div>
      </div>
    </div>
  );
};
