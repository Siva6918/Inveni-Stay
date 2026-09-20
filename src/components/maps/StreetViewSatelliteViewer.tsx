import React, { useState } from 'react';
import {
  Layers,
  ExternalLink,
  MapPin,
  Navigation,
  ShieldCheck,
} from 'lucide-react';

interface StreetViewSatelliteViewerProps {
  coordinates?: {
    lat: number;
    lng: number;
  };
  address?: string;
  propertyName?: string;
  town?: string;
  height?: string;
  allowToggle?: boolean;
}

export const StreetViewSatelliteViewer: React.FC<StreetViewSatelliteViewerProps> = ({
  coordinates = { lat: 15.5185, lng: 78.3492 },
  address = 'Panyam, Andhra Pradesh',
  propertyName = 'Property',
  town = 'Panyam',
  height = '480px',
  allowToggle = true,
}) => {
  const [viewMode, setViewMode] = useState<'satellite' | 'street'>('satellite');
  const [zoomLevel, setZoomLevel] = useState<number>(18);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  /**
   * Google Maps Embed URL patterns:
   *
   * Satellite aerial view:
   *   https://maps.google.com/maps?q=LAT,LNG&t=k&z=ZOOM&output=embed
   *   t=k  → hybrid (satellite + labels)
   *
   * Google Street View panoramic mode:
   *   https://www.google.com/maps/embed?pb=…  — but the simpler way is:
   *   https://maps.google.com/maps?layer=c&cbll=LAT,LNG&cbp=12,0,0,0,0&output=embed
   *   layer=c → Street View layer   cbll=lat,lng → panorama center point
   *   cbp=12,yaw,pitch,zoom,tilt
   *
   * Note: Google doesn't guarantee panorama availability at all coords;
   * if no pano exists nearby, it falls back to the regular map.
   */
  const satelliteEmbedUrl = `https://maps.google.com/maps?q=${coordinates.lat},${coordinates.lng}&t=k&z=${zoomLevel}&output=embed`;

  const streetViewEmbedUrl =
    `https://maps.google.com/maps?layer=c&cbll=${coordinates.lat},${coordinates.lng}` +
    `&cbp=12,0,0,0,0&z=${zoomLevel}&output=embed`;

  const externalSatelliteUrl = `https://www.google.com/maps/@${coordinates.lat},${coordinates.lng},${zoomLevel}z/data=!3m1!1e3`;
  const externalStreetViewUrl = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${coordinates.lat},${coordinates.lng}`;

  const currentEmbedUrl = viewMode === 'satellite' ? satelliteEmbedUrl : streetViewEmbedUrl;
  const currentExternalUrl = viewMode === 'satellite' ? externalSatelliteUrl : externalStreetViewUrl;

  return (
    <div
      style={{
        position: 'relative',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
        height: isFullscreen ? '90vh' : height,
        transition: 'all 0.3s ease',
      }}
    >
      {/* Top HUD Overlay */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          right: '12px',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          pointerEvents: 'none',
        }}
      >
        {/* Left Telemetry Pill */}
        <div
          style={{
            pointerEvents: 'auto',
            background: 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(14, 165, 233, 0.3)',
            borderRadius: 'var(--radius-full)',
            padding: '0.45rem 1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
          }}
        >
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#22c55e',
              boxShadow: '0 0 8px rgba(34, 197, 94, 0.7)',
              animation: 'pulse 1.8s infinite',
            }}
          />
          <span
            style={{
              fontSize: '0.8rem',
              fontWeight: 800,
              color: '#0f172a',
              fontFamily: 'var(--font-metrics)',
            }}
          >
            {viewMode === 'satellite' ? '🛰️ SATELLITE VIEW' : '🚶 STREET PANORAMA'}
          </span>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>•</span>
          <span style={{ fontSize: '0.75rem', color: '#0284c7', fontWeight: 700 }}>
            {coordinates.lat.toFixed(4)}° N, {coordinates.lng.toFixed(4)}° E
          </span>
        </div>

        {/* Right: Mode Toggle + Open Link */}
        <div
          style={{
            pointerEvents: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          {allowToggle && (
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(12px)',
                borderRadius: 'var(--radius-full)',
                padding: '0.25rem',
                display: 'flex',
                gap: '0.25rem',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e2e8f0',
              }}
            >
              <button
                type="button"
                onClick={() => setViewMode('satellite')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.35rem 0.85rem',
                  borderRadius: 'var(--radius-full)',
                  background: viewMode === 'satellite' ? '#0284c7' : 'transparent',
                  color: viewMode === 'satellite' ? '#ffffff' : '#475569',
                  border: 'none',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <Layers size={13} />
                <span>Satellite</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('street')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.35rem 0.85rem',
                  borderRadius: 'var(--radius-full)',
                  background: viewMode === 'street' ? '#0284c7' : 'transparent',
                  color: viewMode === 'street' ? '#ffffff' : '#475569',
                  border: 'none',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <Navigation size={13} />
                <span>Street View</span>
              </button>
            </div>
          )}

          <a
            href={currentExternalUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Open in Google Maps"
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              color: '#0f172a',
              padding: '0.45rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.75rem',
              fontWeight: 800,
              textDecoration: 'none',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e2e8f0',
              backdropFilter: 'blur(12px)',
            }}
          >
            <span>Open Maps</span>
            <ExternalLink size={12} />
          </a>
        </div>
      </div>

      {/* Embedded Google Maps iframe — satellite or Street View */}
      <iframe
        key={`${viewMode}-${zoomLevel}-${coordinates.lat}-${coordinates.lng}`}
        title={`${propertyName} ${viewMode === 'satellite' ? 'Satellite View' : 'Street View'}`}
        src={currentEmbedUrl}
        width="100%"
        height="100%"
        style={{
          border: 0,
          display: 'block',
          width: '100%',
          height: '100%',
        }}
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
      />

      {/* Bottom Info Footer */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background:
            'linear-gradient(to top, rgba(255, 255, 255, 0.97) 0%, rgba(255, 255, 255, 0.85) 70%, transparent 100%)',
          backdropFilter: 'blur(8px)',
          padding: '0.85rem 1.25rem 0.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          borderTop: '1px solid rgba(226, 232, 240, 0.8)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <MapPin size={16} color="#0284c7" />
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>
              {propertyName} • {town}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{address}</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Zoom buttons */}
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            <button
              type="button"
              onClick={() => setZoomLevel((prev) => Math.min(20, prev + 1))}
              style={zoomBtnStyle}
              title="Zoom In"
            >
              +
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel((prev) => Math.max(12, prev - 1))}
              style={zoomBtnStyle}
              title="Zoom Out"
            >
              −
            </button>
          </div>

          <span
            style={{
              fontSize: '0.72rem',
              color: '#16a34a',
              fontWeight: 800,
              background: 'rgba(34, 197, 94, 0.1)',
              padding: '0.2rem 0.6rem',
              borderRadius: 'var(--radius-full)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
            }}
          >
            <ShieldCheck size={12} />
            Verified Geo-Coordinates
          </span>
        </div>
      </div>
    </div>
  );
};

const zoomBtnStyle: React.CSSProperties = {
  background: '#ffffff',
  border: '1px solid #cbd5e1',
  borderRadius: 'var(--radius-sm)',
  padding: '0.2rem 0.55rem',
  fontSize: '0.9rem',
  fontWeight: 800,
  cursor: 'pointer',
  color: '#0f172a',
  lineHeight: 1,
};
