import React, { useState } from 'react';
import { RoomUnit, PropertyListing } from '../../types';
import { DoorOpen, ArrowRight, X, CheckCircle2, ShieldCheck, Info, Calendar, Sparkles } from 'lucide-react';

interface StickyReservationBarProps {
  property: PropertyListing;
  selectedRoom: RoomUnit;
  onScrollToFloorPlan: () => void;
  onStartReservation?: (propertyId: string, roomNo: string) => void;
}

export const StickyReservationBar: React.FC<StickyReservationBarProps> = ({
  property,
  selectedRoom,
  onScrollToFloorPlan,
  onStartReservation,
}) => {
  const [showPrepModal, setShowPrepModal] = useState<boolean>(false);
  const isAvailable = selectedRoom.status === 'AVAILABLE';

  const handleReserveClick = () => {
    if (onStartReservation) {
      onStartReservation(property.id, selectedRoom.roomNo);
    } else {
      setShowPrepModal(true);
    }
  };

  return (
    <>
      {/* Sticky Bottom Action Bar (Neomorphic Dock) */}
      <aside
        aria-label="Reservation Summary"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 2000,
          background: 'rgba(230, 236, 245, 0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: '1.5px solid rgba(14, 165, 233, 0.35)',
          padding: '0.85rem 1.5rem',
          boxShadow: '0 -10px 30px rgba(194, 202, 216, 0.6), 0 0 20px rgba(14, 165, 233, 0.15)',
        }}
      >
        <div
          className="container"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            padding: 0,
          }}
        >
          {/* Selected Room Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div
              onClick={onScrollToFloorPlan}
              style={{
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
              }}
              title="Click to view on floor plan"
            >
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: 'var(--radius-sm)',
                  background: isAvailable ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  border: isAvailable ? '2px solid #10b981' : '2px solid #ef4444',
                  boxShadow: isAvailable ? '0 0 10px rgba(16, 185, 129, 0.3)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isAvailable ? '#065f46' : '#991b1b',
                  fontWeight: 800,
                  fontSize: '1rem',
                }}
              >
                {selectedRoom.roomNo}
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: '#0f172a', fontWeight: 800, fontSize: '1rem' }}>
                    Room {selectedRoom.roomNo} ({selectedRoom.type})
                  </span>
                  <span
                    style={{
                      background: isAvailable ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: isAvailable ? 'var(--c-green)' : 'var(--c-red)',
                      border: isAvailable ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid rgba(239, 68, 68, 0.35)',
                      padding: '0.1rem 0.55rem',
                      borderRadius: 'var(--radius-pill)',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                    }}
                  >
                    ● {selectedRoom.status}
                  </span>
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>
                  Floor {selectedRoom.floor} • {property.name}
                </div>
              </div>
            </div>

            {/* Desktop Pricing Display */}
            <div
              className="desktop-rent-display"
              style={{
                borderLeft: '1px solid rgba(194, 202, 216, 0.6)',
                paddingLeft: '1.25rem',
                display: 'flex',
                alignItems: 'baseline',
                gap: '0.35rem',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-metrics)',
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  color: 'var(--c-gold)',
                }}
              >
                ₹{selectedRoom.rent.toLocaleString()}
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>/month with meals</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={onScrollToFloorPlan}
              className="neomorph-btn"
              style={{
                padding: '0.65rem 1.15rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Change Room
            </button>

            {isAvailable ? (
              <button
                onClick={handleReserveClick}
                className="btn-iridescent"
                style={{
                  padding: '0.75rem 1.75rem',
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                }}
              >
                <span>Continue to Reserve Room {selectedRoom.roomNo}</span>
                <ArrowRight size={18} />
              </button>
            ) : (
              <button
                disabled
                style={{
                  background: '#fef2f2',
                  color: '#991b1b',
                  border: '1px solid #fecaca',
                  padding: '0.75rem 1.5rem',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  cursor: 'not-allowed',
                }}
              >
                Room {selectedRoom.roomNo} Unavailable
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Reservation Preparation State Modal */}
      {showPrepModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 5000,
            background: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Reservation Preparation State"
        >
          <div
            style={{
              background: '#ffffff',
              color: '#0f172a',
              border: '1.5px solid #e2e8f0',
              borderRadius: 'var(--radius-xl)',
              width: '100%',
              maxWidth: '560px',
              padding: '2rem',
              boxShadow: '0 20px 50px rgba(15, 23, 42, 0.12)',
              position: 'relative',
            }}
          >
            <button
              onClick={() => setShowPrepModal(false)}
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                background: 'none',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
              }}
              aria-label="Close"
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: 'var(--c-green)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CheckCircle2 size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                  Room {selectedRoom.roomNo} Selection Ready
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--c-sky-blue)', fontWeight: 800 }}>
                  Pre-Reservation Verification State
                </span>
              </div>
            </div>

            <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              You have selected <strong>Room {selectedRoom.roomNo}</strong> at{' '}
              <strong>{property.name}</strong> in {property.town}. Your unit selection has been locked for this demo
              session.
            </p>

            {/* Summary Box */}
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                marginBottom: '1.5rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Unit Allocated</span>
                <span style={{ fontWeight: 800, color: '#0f172a' }}>
                  Room {selectedRoom.roomNo} (Floor {selectedRoom.floor})
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Room Type</span>
                <span style={{ fontWeight: 800, color: '#0f172a' }}>{selectedRoom.type}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Monthly Rent</span>
                <span style={{ fontWeight: 800, color: 'var(--c-gold)' }}>
                  ₹{selectedRoom.rent.toLocaleString()} / month
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Refundable Security Deposit</span>
                <span style={{ fontWeight: 800, color: '#0f172a' }}>
                  ₹{selectedRoom.deposit.toLocaleString()}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Food & Wi-Fi Inclusions</span>
                <span style={{ fontWeight: 800, color: 'var(--c-green)' }}>Included in Rent</span>
              </div>
            </div>

            {/* Phase 3 Scope Notice */}
            <div
              style={{
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.5rem',
                fontSize: '0.82rem',
                color: '#475569',
                display: 'flex',
                gap: '0.65rem',
                alignItems: 'flex-start',
              }}
            >
              <Info size={18} color="var(--c-sky-blue)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Hackathon Scope Notice:</strong> In Phase 3, room-level selection and remote inspection are
                active. The automated checkout contract, landlord digital lease, and payment gateway are scheduled for{' '}
                <strong>Phase 6</strong>.
              </div>
            </div>

            <button
              onClick={() => setShowPrepModal(false)}
              style={{
                width: '100%',
                background: '#0284c7',
                color: '#ffffff',
                padding: '0.85rem',
                borderRadius: 'var(--radius-md)',
                fontWeight: 800,
                fontSize: '0.95rem',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(2, 132, 199, 0.3)',
              }}
            >
              Close & Return to Property Exploration
            </button>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-rent-display {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
};
