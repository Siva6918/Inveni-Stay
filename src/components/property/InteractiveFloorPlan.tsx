import React, { useState } from 'react';
import { PropertyListing, RoomUnit, FloorPlanData } from '../../types';
import { Layers, CheckCircle2, AlertCircle, Clock, ShieldCheck, DoorOpen, Sparkles } from 'lucide-react';

interface InteractiveFloorPlanProps {
  property: PropertyListing;
  selectedRoomNo: string;
  onSelectRoom: (roomNo: string) => void;
}

export const InteractiveFloorPlan: React.FC<InteractiveFloorPlanProps> = ({
  property,
  selectedRoomNo,
  onSelectRoom,
}) => {
  const [activeFloor, setActiveFloor] = useState<number>(1);

  // Get floor plans or fallback default
  const floorPlans: FloorPlanData[] = property.floorPlans || [];
  const currentFloorPlan = floorPlans.find((fp) => fp.floorNumber === activeFloor) || floorPlans[0];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return {
          bg: '#ecfdf5',
          border: '#10b981',
          color: '#065f46',
          glow: 'rgba(16, 185, 129, 0.25)',
          dot: '#10b981',
          text: 'AVAILABLE',
          shortText: 'AVAIL',
        };
      case 'OCCUPIED':
        return {
          bg: '#fef2f2',
          border: '#ef4444',
          color: '#991b1b',
          glow: 'transparent',
          dot: '#ef4444',
          text: 'OCCUPIED',
          shortText: 'OCC',
        };
      case 'RESERVED':
        return {
          bg: '#fffbeb',
          border: '#f97316',
          color: '#9a3412',
          glow: 'transparent',
          dot: '#f97316',
          text: 'RESERVED',
          shortText: 'RSRV',
        };
      default:
        return {
          bg: '#f1f5f9',
          border: '#94a3b8',
          color: '#475569',
          glow: 'transparent',
          dot: '#94a3b8',
          text: 'MAINTENANCE',
          shortText: 'MAINT',
        };
    }
  };

  // Find room unit details from property.rooms
  const getRoomUnit = (roomNo: string): RoomUnit | undefined => {
    return property.rooms.find((r) => r.roomNo === roomNo);
  };

  return (
    <section
      id="floor-plan-rooms"
      style={{
        marginBottom: '3.5rem',
        padding: '2.5rem',
        background: 'var(--surface-neomorph)',
        border: '1.5px solid rgba(255, 255, 255, 0.85)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-neomorph-lg)',
      }}
    >
      {/* Section Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        <div>
          <div
            className="metaverse-hud"
            style={{
              marginBottom: '0.75rem',
            }}
          >
            <Layers size={14} color="var(--c-sky-blue)" />
            <span>[SPATIAL ARCHITECTURAL BLUEPRINT]</span>
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
            Spatial Floor Map & Room Selection
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
            Click any room on the architectural layout below to inspect its exact position, window orientation,
            attached washroom details, and live availability status.
          </p>
        </div>

        {/* Floor Switcher Tabs (Neomorphic Pill Bay) */}
        <div
          style={{
            display: 'flex',
            background: 'var(--surface-neomorph-inset)',
            padding: '0.4rem',
            borderRadius: 'var(--radius-full)',
            boxShadow: 'var(--shadow-neomorph-inset-sm)',
            border: '1px solid rgba(194, 202, 216, 0.4)',
            gap: '0.35rem',
          }}
        >
          {floorPlans.map((fp) => {
            const isActive = fp.floorNumber === activeFloor;
            return (
              <button
                key={fp.floorNumber}
                onClick={() => setActiveFloor(fp.floorNumber)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.55rem 1.25rem',
                  borderRadius: 'var(--radius-full)',
                  background: isActive ? 'linear-gradient(135deg, var(--c-sky-blue) 0%, var(--c-pink) 100%)' : 'transparent',
                  color: isActive ? '#ffffff' : '#334155',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: isActive ? '0 0 15px rgba(14, 165, 233, 0.45)' : 'none',
                }}
              >
                <span>{fp.floorName}</span>
                <span
                  style={{
                    background: isActive ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.08)',
                    color: isActive ? '#ffffff' : '#0f172a',
                    padding: '0.15rem 0.5rem',
                    borderRadius: 'var(--radius-pill)',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                  }}
                >
                  {fp.vacantRooms} Vacant
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Availability Status Legend (Neomorphic inset bar) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem',
          flexWrap: 'wrap',
          background: 'var(--surface-neomorph-inset)',
          boxShadow: 'var(--shadow-neomorph-inset-sm)',
          padding: '0.75rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid rgba(194, 202, 216, 0.35)',
          marginBottom: '1.5rem',
          fontSize: '0.8rem',
        }}
      >
        <span style={{ fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Status Key:
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
          <strong style={{ color: '#065f46' }}>AVAILABLE</strong>
          <span style={{ color: 'var(--text-muted)' }}>(Ready for move-in)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} />
          <strong style={{ color: '#991b1b' }}>OCCUPIED</strong>
          <span style={{ color: 'var(--text-muted)' }}>(Current resident)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f97316' }} />
          <strong style={{ color: '#9a3412' }}>RESERVED</strong>
          <span style={{ color: 'var(--text-muted)' }}>(Deposit holding)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#94a3b8' }} />
          <strong style={{ color: '#475569' }}>MAINTENANCE</strong>
        </div>
      </div>

      {/* Modern High-Contrast Light Architectural Blueprint Canvas */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: 'clamp(340px, 55vw, 500px)',
          background: 'var(--surface-neomorph-inset)',
          borderRadius: 'var(--radius-lg)',
          border: '2px solid rgba(14, 165, 233, 0.35)',
          boxShadow: 'var(--shadow-neomorph-inset)',
          overflow: 'hidden',
          padding: '1rem',
        }}
      >
        {/* Architectural Light Grid Lines */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(to right, rgba(14, 165, 233, 0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(14, 165, 233, 0.06) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            pointerEvents: 'none',
          }}
        />

        {/* Common Facilities Overlay Blocks */}
        {currentFloorPlan.commonSpaces.map((space, idx) => (
          <div
            key={idx}
            style={{
              position: 'absolute',
              left: `${space.x}%`,
              top: `${space.y}%`,
              width: `${space.w}%`,
              height: `${space.h}%`,
              background: '#f1f5f9',
              border: '1.5px dashed #cbd5e1',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              padding: '0.5rem',
              zIndex: 1,
              pointerEvents: 'none',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-metrics)',
                fontSize: '0.85rem',
                color: '#475569',
                letterSpacing: '0.08em',
                fontWeight: 800,
                textTransform: 'uppercase',
                textAlign: 'center',
              }}
            >
              {space.name}
            </span>
            <span style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.2rem' }}>
              Common Space
            </span>
          </div>
        ))}

        {/* Interactive Data-Driven Room Rectangles */}
        {currentFloorPlan.rooms.map((pos) => {
          const roomUnit = getRoomUnit(pos.roomNo);
          const status = roomUnit?.status || 'OCCUPIED';
          const badge = getStatusBadge(status);
          const isSelected = selectedRoomNo === pos.roomNo;

          return (
            <button
              key={pos.roomNo}
              onClick={() => onSelectRoom(pos.roomNo)}
              className="floor-room-node"
              style={{
                position: 'absolute',
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                width: `${pos.w}%`,
                height: `${pos.h}%`,
                background: isSelected ? '#f0f9ff' : badge.bg,
                border: isSelected
                  ? '2.5px solid var(--c-sky-blue)'
                  : `1.5px solid ${badge.border}`,
                borderRadius: 'var(--radius-md)',
                boxShadow: isSelected
                  ? '0 0 25px rgba(14, 165, 233, 0.35), 0 4px 12px rgba(0, 0, 0, 0.08)'
                  : '0 2px 8px rgba(0, 0, 0, 0.04)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: 'clamp(0.4rem, 1.5vw, 0.85rem)',
                cursor: 'pointer',
                textAlign: 'left',
                zIndex: isSelected ? 10 : 2,
                transition: 'all 0.2s ease',
                overflow: 'hidden',
              }}
              aria-label={`Room ${pos.roomNo}, ${roomUnit?.type} room, ₹${roomUnit?.rent} per month, status ${status}`}
            >
              {/* Room Top Line */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <DoorOpen size={16} color={isSelected ? 'var(--c-sky-blue)' : badge.color} />
                  <span
                    style={{
                      fontFamily: 'var(--font-headline)',
                      fontSize: '1.2rem',
                      fontWeight: 800,
                      color: '#0f172a',
                    }}
                  >
                    {pos.roomNo}
                  </span>
                </div>

                {/* Status Dot with Text */}
                <span
                  style={{
                    background: isSelected ? '#0284c7' : badge.bg,
                    color: isSelected ? '#ffffff' : badge.color,
                    border: `1px solid ${isSelected ? '#0284c7' : badge.border}`,
                    padding: '0.12rem 0.35rem',
                    borderRadius: 'var(--radius-pill)',
                    fontSize: '0.62rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.02em',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    maxWidth: '100%',
                    flexShrink: 1,
                  }}
                >
                  {badge.shortText}
                </span>
              </div>

              {/* Room Body Specs */}
              <div style={{ minWidth: 0, overflow: 'hidden' }}>
                <div style={{ color: '#334155', fontSize: 'clamp(0.65rem, 1.2vw, 0.8rem)', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {roomUnit?.type || 'Single'}
                  {roomUnit?.attachedBath && <span style={{ color: 'var(--c-sky-blue)' }}> • Bath</span>}
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.15rem', marginTop: '0.15rem', flexWrap: 'nowrap' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-metrics)',
                      fontSize: 'clamp(0.8rem, 1.5vw, 1.1rem)',
                      fontWeight: 800,
                      color: 'var(--c-gold)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    ₹{((roomUnit?.rent || 5500) / 1000).toFixed(1)}k
                  </span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>/mo</span>
                </div>
              </div>

              {/* Selection Indicator */}
              <div
                style={{
                  fontSize: 'clamp(0.6rem, 1vw, 0.72rem)',
                  color: isSelected ? 'var(--c-sky-blue)' : 'var(--text-muted)',
                  fontWeight: isSelected ? 800 : 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                }}
              >
                {isSelected ? (
                  <>
                    <CheckCircle2 size={11} color="var(--c-sky-blue)" />
                    <span>Selected</span>
                  </>
                ) : (
                  <span>Click to select</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <style>{`
        .floor-room-node:hover {
          transform: translateY(-2px);
          filter: brightness(1.05);
        }
      `}</style>
    </section>
  );
};
