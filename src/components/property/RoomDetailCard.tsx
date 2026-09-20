import React from 'react';
import { RoomUnit, PropertyMedia } from '../../types';
import {
  DoorOpen,
  CheckCircle2,
  Clock,
  Sparkles,
  Maximize2,
  Scale,
  ShieldCheck,
  Zap,
  Droplets,
  Sun,
  LayoutGrid,
} from 'lucide-react';

interface RoomDetailCardProps {
  room: RoomUnit;
  allRooms: RoomUnit[];
  media?: PropertyMedia[];
  onSelectForReservation: (room: RoomUnit) => void;
  onOpenCompare: () => void;
  onOpenRoomMedia: (roomId: string) => void;
  isSelectedForBooking: boolean;
}

export const RoomDetailCard: React.FC<RoomDetailCardProps> = ({
  room,
  allRooms,
  media = [],
  onSelectForReservation,
  onOpenCompare,
  onOpenRoomMedia,
  isSelectedForBooking,
}) => {
  const isAvailable = room.status === 'AVAILABLE';

  // Specific room photos
  const roomPhotos = [
    { title: 'Bedroom & Bed Layout', url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80' },
    { title: 'Attached Washroom', url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80' },
    { title: 'Study Desk & Bookshelf', url: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=600&q=80' },
    { title: 'Window Daylight View', url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=600&q=80' },
  ];

  return (
    <div
      style={{
        background: 'var(--surface-neomorph)',
        border: isSelectedForBooking
          ? '2.5px solid var(--c-sky-blue)'
          : isAvailable
          ? '1.5px solid rgba(16, 185, 129, 0.45)'
          : '1.5px solid rgba(255, 255, 255, 0.85)',
        borderRadius: 'var(--radius-xl)',
        padding: '2.25rem',
        boxShadow: isSelectedForBooking
          ? 'var(--shadow-metaverse-glow)'
          : 'var(--shadow-neomorph-lg)',
        marginBottom: '3.5rem',
      }}
    >
      {/* Header Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1rem',
          borderBottom: '1px solid #e2e8f0',
          paddingBottom: '1.25rem',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span
              style={{
                background: 'rgba(14, 165, 233, 0.12)',
                color: 'var(--c-sky-blue)',
                padding: '0.2rem 0.6rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.75rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Floor {room.floor}
            </span>

            <span
              style={{
                background: isAvailable ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                color: isAvailable ? 'var(--c-green)' : 'var(--c-red)',
                border: isAvailable
                  ? '1px solid rgba(16, 185, 129, 0.4)'
                  : '1px solid rgba(239, 68, 68, 0.4)',
                padding: '0.2rem 0.65rem',
                borderRadius: 'var(--radius-pill)',
                fontSize: '0.75rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: isAvailable ? 'var(--c-green)' : 'var(--c-red)',
                }}
              />
              ● {room.status}
            </span>

            <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Clock size={12} /> Demo availability updated 12 mins ago
            </span>
          </div>

          <h3
            style={{
              fontFamily: 'var(--font-headline)',
              fontSize: '1.85rem',
              fontWeight: 800,
              color: '#0f172a',
              margin: '0.25rem 0',
            }}
          >
            Room {room.roomNo} — {room.type} Room
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
            {room.dimensions || '12ft x 10ft'} • {room.windowOrientation || 'North-facing window'} • {room.attachedBath ? 'Private Attached Bathroom' : 'Shared Washroom'}
          </p>
        </div>

        {/* Pricing Summary */}
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Monthly Tariff
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
            <span
              style={{
                fontFamily: 'var(--font-metrics)',
                fontSize: '2rem',
                fontWeight: 800,
                color: 'var(--c-gold)',
              }}
            >
              ₹{room.rent.toLocaleString()}
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>/mo</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Refundable Deposit: ₹{room.deposit.toLocaleString()}
          </div>
        </div>
      </div>

      {/* 2-Column Room Details Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.1fr 1fr',
          gap: '2rem',
          marginBottom: '2rem',
        }}
        className="room-detail-grid"
      >
        {/* Left: Unit Specifications */}
        <div>
          <h4
            style={{
              color: '#0f172a',
              fontSize: '0.95rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <Sparkles size={16} color="var(--c-sky-blue)" /> Unit Specifications & Furnishings
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {(room.furnishings || [
              'Attached western washroom with 24/7 running water & geyser point',
              'Teak finish study table with storage shelf & ergonomic chair',
              'Single box bed with 6-inch high-density orthopaedic mattress',
              'Full-length steel wardrobe with secure locker & mirror',
              'Independent electricity sub-meter and multi-plug charging strip',
              'Mesh insect screen on window for comfortable natural airflow',
            ]).map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.65rem',
                  fontSize: '0.88rem',
                  color: '#334155',
                  lineHeight: 1.4,
                }}
              >
                <CheckCircle2 size={16} color="var(--c-green)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Room Photos */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <h4
              style={{
                color: '#0f172a',
                fontSize: '0.95rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                margin: 0,
              }}
            >
              Room {room.roomNo} Inspection Media
            </h4>
            <span style={{ fontSize: '0.75rem', color: 'var(--c-sky-blue)', fontWeight: 700 }}>
              4 Verified Photos
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.65rem',
            }}
          >
            {roomPhotos.map((photo, pIdx) => (
              <div
                key={pIdx}
                onClick={() => onOpenRoomMedia(room.roomNo)}
                style={{
                  position: 'relative',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  aspectRatio: '16/11',
                  border: '1px solid #e2e8f0',
                  cursor: 'pointer',
                  background: '#f8fafc',
                }}
              >
                <img
                  src={photo.url}
                  alt={photo.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(15, 23, 42, 0.85) 0%, transparent 60%)',
                    display: 'flex',
                    alignItems: 'flex-end',
                    padding: '0.5rem 0.65rem',
                  }}
                >
                  <span style={{ color: '#ffffff', fontSize: '0.72rem', fontWeight: 600 }}>
                    {photo.title}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div
        style={{
          borderTop: '1px solid #e2e8f0',
          paddingTop: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <button
          onClick={onOpenCompare}
          className="neomorph-btn"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.65rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          <Scale size={16} color="var(--c-gold)" /> Compare Room {room.roomNo} with Other Rooms
        </button>

        {isAvailable ? (
          <button
            onClick={() => onSelectForReservation(room)}
            className="btn-iridescent"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.75rem 1.75rem',
              fontSize: '0.95rem',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            <DoorOpen size={18} />
            {isSelectedForBooking
              ? `✓ Room ${room.roomNo} Selected (Ready to Continue)`
              : `Select Room ${room.roomNo} for Reservation`}
          </button>
        ) : (
          <div
            style={{
              color: 'var(--c-red)',
              fontSize: '0.85rem',
              fontWeight: 700,
              padding: '0.65rem 1.25rem',
              background: 'rgba(239, 68, 68, 0.1)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
            }}
          >
            Room {room.roomNo} is currently {room.status.toLowerCase()}. Select an available room above.
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 850px) {
          .room-detail-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};
