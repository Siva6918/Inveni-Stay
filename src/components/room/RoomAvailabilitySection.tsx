import React, { useState } from 'react';
import { Bed, ShieldCheck, Clock, Check, AlertCircle, Sparkles, Key, CheckCircle2 } from 'lucide-react';
import { MOCK_PRIMARY_PROPERTY } from '../../data/mockProperties';
import { RoomUnit } from '../../types';

interface RoomAvailabilitySectionProps {
  onSelectRoomForReservation?: (propertyId: string, roomNo: string) => void;
  onExploreProperty?: (propertyId: string) => void;
}

export const RoomAvailabilitySection: React.FC<RoomAvailabilitySectionProps> = ({
  onSelectRoomForReservation,
  onExploreProperty,
}) => {
  const [selectedRoom, setSelectedRoom] = useState<RoomUnit>(MOCK_PRIMARY_PROPERTY.rooms[0]); // Room 101

  const rooms: RoomUnit[] = MOCK_PRIMARY_PROPERTY.rooms;
  const floor1Rooms: RoomUnit[] = rooms.filter((r: RoomUnit) => r.floor === 1);
  const floor2Rooms: RoomUnit[] = rooms.filter((r: RoomUnit) => r.floor === 2);

  const getStatusBadge = (status: RoomUnit['status']) => {
    switch (status) {
      case 'AVAILABLE':
        return {
          label: 'Available Now',
          bg: '#ecfdf5',
          border: '#a7f3d0',
          text: '#047857',
          dot: '#10b981',
        };
      case 'AVAILABLE_SOON':
        return {
          label: 'Available Soon',
          bg: '#f0f9ff',
          border: '#bae6fd',
          text: '#0284c7',
          dot: '#0ea5e9',
        };
      case 'OCCUPIED':
        return {
          label: 'Occupied',
          bg: '#fef2f2',
          border: '#fecaca',
          text: '#b91c1c',
          dot: '#ef4444',
        };
      case 'RESERVED':
        return {
          label: 'Token Reserved',
          bg: '#fff7ed',
          border: '#fed7aa',
          text: '#c2410c',
          dot: '#f97316',
        };
      case 'MAINTENANCE':
      default:
        return {
          label: 'Painting / Prep',
          bg: '#f8fafc',
          border: '#e2e8f0',
          text: '#64748b',
          dot: '#94a3b8',
        };
    }
  };

  return (
    <section id="room-availability" className="section-wrapper">
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: '820px', margin: '0 auto 3.5rem' }}>
          <div className="pill-badge pill-badge--live" style={{ marginBottom: '1rem' }}>
            <span className="radar-pulse" />
            <span>Core Innovation • Room-Level Availability</span>
          </div>

          <h2
            style={{
              fontFamily: 'var(--font-editorial)',
              fontSize: 'clamp(2rem, 3.8vw, 3rem)',
              color: 'var(--text-primary)',
              marginBottom: '1rem',
              lineHeight: 1.2,
            }}
          >
            We Don't Just List Properties. <br />
            <span style={{ color: '#16a34a' }}>We Show What's Actually Inside.</span>
          </h2>

          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.6 }}>
            Say goodbye to deceptive claims of "PG Vacancies." Inspect individual room numbers, see exact occupancy, floor levels, attached bathroom setups, and reserve the specific bed you want.
          </p>
        </div>

        {/* Room Matrix Architecture Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
            gap: 'clamp(1.25rem, 3vw, 2rem)',
            maxWidth: '1100px',
            margin: '0 auto',
          }}
        >
          {/* Left: Interactive Multi-Floor Room Layout */}
          <div
            className="iridescent-card"
            style={{
              padding: 'clamp(1rem, 3vw, 1.75rem)',
              border: '1px solid var(--border-medium)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1.5rem',
                borderBottom: '1px solid var(--border-subtle)',
                paddingBottom: '0.75rem',
              }}
            >
              <div>
                <h3 style={{ fontFamily: 'var(--font-ui)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Sri Sai PG — Building Floor Plan
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Click any room to inspect unit specifications
                </span>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.75rem',
                  color: 'var(--text-secondary)',
                }}
              >
                <Clock size={13} color="var(--c-goldenrod)" />
                <span>Host updated 14m ago</span>
              </div>
            </div>

            {/* Floor 1 Section */}
            <div style={{ marginBottom: '2rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '0.85rem',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-metrics)',
                    fontSize: '0.85rem',
                    textTransform: 'uppercase',
                    color: 'var(--c-goldenrod)',
                    letterSpacing: '0.06em',
                    fontWeight: 600,
                  }}
                >
                  Floor 1 (Ground & Garden Entrance)
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--c-lawn-green)' }}>2 Single Units Available</span>
              </div>

              <div className="room-floor-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
                {floor1Rooms.map((room: RoomUnit) => {
                  const status = getStatusBadge(room.status);
                  const isSelected = selectedRoom.roomNo === room.roomNo;

                  return (
                    <button
                      key={room.roomNo}
                      type="button"
                      onClick={() => setSelectedRoom(room)}
                      style={{
                        padding: '0.85rem 0.65rem',
                        borderRadius: 'var(--radius-md)',
                        background: isSelected ? '#e0f2fe' : 'var(--surface-1)',
                        border: isSelected ? '2px solid #0284c7' : `1px solid ${status.border}`,
                        boxShadow: isSelected ? '0 4px 12px rgba(2, 132, 199, 0.15)' : 'none',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                        <span
                          style={{
                            fontFamily: 'var(--font-metrics)',
                            fontSize: '1.25rem',
                            fontWeight: 700,
                            color: 'var(--text-primary)',
                          }}
                        >
                          #{room.roomNo}
                        </span>
                        <span
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: status.dot,
                            boxShadow: `0 0 6px ${status.dot}`,
                          }}
                        />
                      </div>

                      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                        {room.type} Room
                      </div>

                      <div
                        style={{
                          fontSize: '0.7rem',
                          color: status.text,
                          fontWeight: 600,
                          textTransform: 'uppercase',
                        }}
                      >
                        {status.label}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Floor 2 Section */}
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '0.85rem',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-metrics)',
                    fontSize: '0.85rem',
                    textTransform: 'uppercase',
                    color: 'var(--text-secondary)',
                    letterSpacing: '0.06em',
                    fontWeight: 600,
                  }}
                >
                  Floor 2 (Quiet Study Level)
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--c-lawn-green)' }}>1 Balcony Unit Available</span>
              </div>

              <div className="room-floor-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
                {floor2Rooms.map((room: RoomUnit) => {
                  const status = getStatusBadge(room.status);
                  const isSelected = selectedRoom.roomNo === room.roomNo;

                  return (
                    <button
                      key={room.roomNo}
                      type="button"
                      onClick={() => setSelectedRoom(room)}
                      style={{
                        padding: '0.85rem 0.65rem',
                        borderRadius: 'var(--radius-md)',
                        background: isSelected ? '#e0f2fe' : 'var(--surface-1)',
                        border: isSelected ? '2px solid #0284c7' : `1px solid ${status.border}`,
                        boxShadow: isSelected ? '0 4px 12px rgba(2, 132, 199, 0.15)' : 'none',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                        <span
                          style={{
                            fontFamily: 'var(--font-metrics)',
                            fontSize: '1.25rem',
                            fontWeight: 700,
                            color: 'var(--text-primary)',
                          }}
                        >
                          #{room.roomNo}
                        </span>
                        <span
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: status.dot,
                            boxShadow: `0 0 6px ${status.dot}`,
                          }}
                        />
                      </div>

                      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                        {room.type} Room
                      </div>

                      <div
                        style={{
                          fontSize: '0.7rem',
                          color: status.text,
                          fontWeight: 600,
                          textTransform: 'uppercase',
                        }}
                      >
                        {status.label}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Selected Room Deep-Dive & Remote Token Action */}
          <div
            className="iridescent-card"
            style={{
              padding: 'clamp(1rem, 3vw, 2rem)',
              border: '1px solid var(--border-medium)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              {/* Status Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-metrics)',
                      fontSize: '1.8rem',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                    }}
                  >
                    Room #{selectedRoom.roomNo}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-ui)',
                      fontSize: '0.8rem',
                      color: '#0284c7',
                      background: '#e0f2fe',
                      padding: '0.2rem 0.55rem',
                      borderRadius: 'var(--radius-sm)',
                      fontWeight: 600,
                    }}
                  >
                    Floor {selectedRoom.floor}
                  </span>
                </div>

                <div
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: 'var(--radius-full)',
                    background: getStatusBadge(selectedRoom.status).bg,
                    color: getStatusBadge(selectedRoom.status).text,
                    border: `1px solid ${getStatusBadge(selectedRoom.status).border}`,
                    fontFamily: 'var(--font-metrics)',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                  }}
                >
                  {getStatusBadge(selectedRoom.status).label}
                </div>
              </div>

              {/* Price Callout */}
              <div
                style={{
                  padding: '1rem',
                  background: 'var(--surface-1)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  marginBottom: '1.5rem',
                }}
              >
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Monthly Rent (All Inclusive)
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.25rem' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-metrics)',
                      fontSize: '2rem',
                      color: 'var(--c-lawn-green)',
                      fontWeight: 700,
                    }}
                  >
                    ₹{selectedRoom.rent.toLocaleString()}
                  </span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>/ month</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Includes 3 Andhra meals, 150 Mbps Wi-Fi, electricity & water. Deposit: ₹{selectedRoom.deposit}.
                </div>
              </div>

              {/* Unit Specifications Checklist */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                  <Check size={16} color="var(--c-lawn-green)" />
                  <span><strong>Occupancy:</strong> {selectedRoom.type} (Dedicated Study Desk & Single Bed)</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                  <Check size={16} color="var(--c-lawn-green)" />
                  <span><strong>Bath:</strong> {selectedRoom.attachedBath ? 'Private Attached Western Toilet + 15L Geyser' : 'Clean Floor Bathroom (Shared by 2)'}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                  <Check size={16} color="var(--c-lawn-green)" />
                  <span><strong>Room Size:</strong> {selectedRoom.dimensions || '12 x 10 ft'} with natural window light</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                  <Check size={16} color="var(--c-lawn-green)" />
                  <span><strong>Storage:</strong> Steel 2-Door Lockable Wardrobe</span>
                </div>
              </div>
            </div>

            {/* Reservation Action Button */}
            <div>
              {selectedRoom.status === 'AVAILABLE' ? (
                <button
                  type="button"
                  onClick={() => {
                    if (onSelectRoomForReservation) {
                      onSelectRoomForReservation('panyam_sri_sai_residency', selectedRoom.roomNo);
                    } else if (onExploreProperty) {
                      onExploreProperty('panyam_sri_sai_residency');
                    }
                  }}
                  className="btn-primary"
                  style={{ width: '100%', padding: '0.95rem' }}
                >
                  <Key size={18} />
                  <span>Reserve Room #{selectedRoom.roomNo}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (onExploreProperty) onExploreProperty('panyam_sri_sai_residency');
                  }}
                  className="btn-secondary"
                  style={{ width: '100%', padding: '0.85rem' }}
                >
                  <span>Inspect Room #{selectedRoom.roomNo} Details</span>
                </button>
              )}

              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.6rem' }}>
                Verified on-site room inventory. 100% refundable reservation deposit if room differs upon arrival.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
