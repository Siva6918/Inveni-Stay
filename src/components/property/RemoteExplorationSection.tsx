import React, { useState } from 'react';
import { PropertyListing } from '../../types';
import {
  Compass,
  Info,
  Layers,
  Eye,
  Map,
  Bed,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

import { StreetViewSatelliteViewer } from '../maps/StreetViewSatelliteViewer';
import { ThreeRoomViewer } from '../room/ThreeRoomViewer';

interface RemoteExplorationSectionProps {
  property: PropertyListing;
  onSelectRoomOnFloorPlan: (roomNo: string) => void;
}

export const RemoteExplorationSection: React.FC<RemoteExplorationSectionProps> = ({
  property,
  onSelectRoomOnFloorPlan,
}) => {
  const [activeSpatialTab, setActiveSpatialTab] = useState<string>('3droom');
  const [selectedRoomNo, setSelectedRoomNo] = useState<string>(
    property.rooms[0]?.roomNo ?? '101',
  );
  const [showRoomPicker, setShowRoomPicker] = useState(false);

  // Get the currently selected room unit
  const selectedRoom = property.rooms.find((r) => r.roomNo === selectedRoomNo) ?? property.rooms[0];

  // Static spatial gallery tabs (non-interactive)
  const galleryTabs = [
    {
      id: 'exterior',
      label: 'Building Exterior',
      icon: '🏢',
      img:
        property.heroImage ??
        'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80',
      specs: {
        frontage: '40 ft road-facing',
        security: 'CCTV 24/7',
        gate: 'Iron security gate',
        parking: '8 two-wheelers',
      },
      desc: `Main entrance of ${property.name} on ${property.address}. Tar road frontage with CCTV coverage.`,
    },
    {
      id: 'corridor',
      label: 'Floor Corridor',
      icon: '🚶',
      img: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
      specs: {
        width: '6 ft passage',
        lighting: 'LED + Emergency',
        ventilation: 'Cross-ventilation',
        exits: '2 fire exits',
      },
      desc: 'Wide, well-ventilated corridor connecting all rooms with clean flooring and emergency exit access.',
    },
    {
      id: 'mess',
      label: 'Mess & Dining',
      icon: '🍲',
      img: 'https://images.unsplash.com/photo-1567521464027-f127ff144326?auto=format&fit=crop&w=1200&q=80',
      specs: {
        seating: '24 simultaneous',
        hygiene: 'Stainless steel tables',
        water: 'RO UV-purified',
        meals: property.foodSchedule ?? '3 times daily',
      },
      desc: `Ground-floor dining facility serving ${property.foodSchedule ?? 'homestyle meals'}.`,
    },
  ];

  const navTabs = [
    { id: '3droom', label: '360° Room Tour', icon: '🥽' },
    { id: 'streetview', label: 'Street View & Satellite', icon: '🗺️' },
    ...galleryTabs.map((g) => ({ id: g.id, label: g.label, icon: g.icon })),
  ];

  const currentGallery = galleryTabs.find((g) => g.id === activeSpatialTab);

  // Available rooms for the room picker (only for 3D room tab)
  const availableForPicker = property.rooms;

  return (
    <section
      id="remote-exploration"
      style={{
        marginBottom: '3.5rem',
        padding: '2.5rem',
        background: 'var(--surface-neomorph)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-neomorph-lg)',
        border: '1.5px solid rgba(255, 255, 255, 0.85)',
      }}
    >
      {/* Section Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div className="metaverse-hud" style={{ marginBottom: '0.75rem' }}>
          <Compass size={15} color="var(--c-sky-blue)" />
          <span>REMOTE SPATIAL EXPLORATION</span>
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
          Explore Before You Arrive
        </h2>
        <p
          style={{
            color: 'var(--text-secondary)',
            fontSize: '0.98rem',
            maxWidth: '780px',
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          Walk through any room in 360°, inspect the building exterior from satellite, and check the
          real street view — all before stepping foot in town.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.55rem',
          overflowX: 'auto',
          padding: '0.4rem',
          background: 'var(--surface-neomorph-inset)',
          borderRadius: 'var(--radius-full)',
          boxShadow: 'var(--shadow-neomorph-inset-sm)',
          border: '1px solid rgba(194,202,216,0.35)',
          marginBottom: '1.5rem',
        }}
      >
        {navTabs.map((tab) => {
          const isActive = activeSpatialTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSpatialTab(tab.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.6rem 1.15rem',
                borderRadius: 'var(--radius-full)',
                background: isActive
                  ? 'linear-gradient(135deg, var(--c-sky-blue) 0%, #2563eb 100%)'
                  : 'transparent',
                border: 'none',
                color: isActive ? '#ffffff' : '#334155',
                fontWeight: isActive ? 800 : 600,
                fontSize: '0.84rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
                boxShadow: isActive ? '0 0 18px rgba(14,165,233,0.4)' : 'none',
                flexShrink: 0,
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── 360° Room Tour Viewer ── */}
      {activeSpatialTab === '3droom' && (
        <div>
          {/* Room Picker */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              marginBottom: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Bed size={16} color="#0284c7" />
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>
                Viewing Room {selectedRoomNo} — {selectedRoom?.type ?? 'Single'} ·{' '}
                <span style={{ color: '#0284c7' }}>₹{(selectedRoom?.rent ?? 5500).toLocaleString()}/mo</span>
              </span>
            </div>

            {/* Room Selector Dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setShowRoomPicker((v) => !v)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  borderRadius: 'var(--radius-full)',
                  background: '#f0f9ff',
                  border: '1.5px solid #bae6fd',
                  color: '#0369a1',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                <span>Switch Room</span>
                {showRoomPicker ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              {showRoomPicker && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 6px)',
                    right: 0,
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: 14,
                    boxShadow: '0 8px 32px rgba(15,23,42,0.12)',
                    padding: '0.5rem',
                    minWidth: 220,
                    zIndex: 100,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                  }}
                >
                  {availableForPicker.map((room) => {
                    const isSel = room.roomNo === selectedRoomNo;
                    const statusColor =
                      room.status === 'AVAILABLE'
                        ? '#047857'
                        : room.status === 'OCCUPIED'
                        ? '#b91c1c'
                        : room.status === 'RESERVED'
                        ? '#b45309'
                        : '#64748b';
                    return (
                      <button
                        key={room.roomNo}
                        type="button"
                        onClick={() => {
                          setSelectedRoomNo(room.roomNo);
                          setShowRoomPicker(false);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.6rem 0.9rem',
                          borderRadius: 10,
                          background: isSel ? '#e0f2fe' : 'transparent',
                          border: isSel ? '1px solid #bae6fd' : '1px solid transparent',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'background 0.1s',
                        }}
                      >
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                            Room {room.roomNo} — {room.type}
                          </div>
                          <div style={{ fontSize: 11, color: '#64748b' }}>
                            Floor {room.floor} · ₹{room.rent.toLocaleString()}/mo
                          </div>
                        </div>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            padding: '2px 7px',
                            borderRadius: 6,
                            background: `${statusColor}15`,
                            color: statusColor,
                            border: `1px solid ${statusColor}40`,
                          }}
                        >
                          {room.status}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <ThreeRoomViewer
            roomNo={selectedRoom?.roomNo ?? '101'}
            roomType={selectedRoom?.type ?? 'Single'}
            monthlyRent={selectedRoom?.rent ?? 5500}
            propertyId={property.id}
            onSwitchToFloorPlan={() => onSelectRoomOnFloorPlan(selectedRoom?.roomNo ?? '101')}
            onSwitchToGallery={() => setActiveSpatialTab('exterior')}
          />
        </div>
      )}

      {/* ── Live Street View & Satellite ── */}
      {activeSpatialTab === 'streetview' && (
        <div>
          {/* Explain what they're seeing */}
          <div
            style={{
              display: 'flex',
              gap: '1rem',
              marginBottom: '1rem',
              flexWrap: 'wrap',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                background: '#f0f9ff',
                border: '1px solid #bae6fd',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.82rem',
                color: '#0369a1',
                fontWeight: 700,
              }}
            >
              <Map size={14} color="#0284c7" />
              <span>📍 {property.address}</span>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.82rem',
                color: '#15803d',
                fontWeight: 700,
              }}
            >
              📡 {property.coordinates.lat.toFixed(4)}° N, {property.coordinates.lng.toFixed(4)}° E
            </div>
          </div>

          <StreetViewSatelliteViewer
            coordinates={property.coordinates}
            address={property.address}
            propertyName={property.name}
            town={property.town}
            height="520px"
            allowToggle={true}
          />
        </div>
      )}

      {/* ── Static Gallery Tabs ── */}
      {currentGallery && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.4fr 1fr',
            gap: '1.5rem',
            background: 'var(--surface-neomorph)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid rgba(255,255,255,0.9)',
            boxShadow: 'var(--shadow-neomorph)',
            overflow: 'hidden',
          }}
          className="spatial-inspector-grid"
        >
          {/* Photo */}
          <div style={{ position: 'relative', minHeight: 320 }}>
            <img
              src={currentGallery.img}
              alt={currentGallery.label}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
            <div
              style={{
                position: 'absolute',
                top: '1rem',
                left: '1rem',
                background: 'rgba(15,23,42,0.85)',
                backdropFilter: 'blur(8px)',
                padding: '0.4rem 0.9rem',
                borderRadius: 'var(--radius-pill)',
                border: '1px solid rgba(14,165,233,0.45)',
                fontSize: '0.78rem',
                fontWeight: 800,
                color: 'var(--c-sky-blue)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <Eye size={13} /> {currentGallery.label}
            </div>
          </div>

          {/* Specs */}
          <div
            style={{
              padding: '1.75rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div
                style={{
                  color: '#16a34a',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '0.35rem',
                }}
              >
                Physical Specification
              </div>
              <h3 style={{ color: '#0f172a', fontSize: '1.4rem', fontWeight: 800, margin: '0 0 0.5rem' }}>
                {currentGallery.label}
              </h3>
              <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                {currentGallery.desc}
              </p>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.75rem',
                }}
              >
                {Object.entries(currentGallery.specs).map(([key, val]) => (
                  <div
                    key={key}
                    style={{
                      background: 'var(--surface-neomorph-inset)',
                      border: '1px solid rgba(194,202,216,0.4)',
                      padding: '0.75rem 0.95rem',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '0.72rem',
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        fontWeight: 700,
                        marginBottom: 2,
                      }}
                    >
                      {key}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#0f172a', fontWeight: 800 }}>{val}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div
        style={{
          marginTop: '1.5rem',
          padding: '0.85rem 1.15rem',
          borderRadius: 'var(--radius-md)',
          background: 'var(--surface-neomorph-inset)',
          border: '1px solid rgba(194,202,216,0.35)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          color: '#475569',
          fontSize: '0.8rem',
        }}
      >
        <Info size={18} color="var(--c-sky-blue)" style={{ flexShrink: 0 }} />
        <span>
          <strong>Transparency Note:</strong> 360° room tours use equirectangular panoramas representative
          of the room type. Satellite and Street View data is sourced live from Google Maps. Property
          coordinates are verified at the time of listing.
        </span>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .spatial-inspector-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
};
