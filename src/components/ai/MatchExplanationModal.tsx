import React from 'react';
import { AIRoomMatch, UserRequirements } from '../../types';
import { X, ShieldCheck, Check, AlertCircle, Info, Sparkles, MapPin, DollarSign, Home } from 'lucide-react';

interface MatchExplanationModalProps {
  match: AIRoomMatch | null;
  requirements: UserRequirements;
  onClose: () => void;
  onSelectForBooking: (propertyId: string, roomNo: string) => void;
}

export const MatchExplanationModal: React.FC<MatchExplanationModalProps> = ({
  match,
  requirements,
  onClose,
  onSelectForBooking,
}) => {
  if (!match) return null;

  const { property, room, matchScore, matchedFeatures, unmatchedFeatures, isExactMatch } = match;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 6000,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
      }}
    >
      <div
        className="neomorph-card"
        style={{
          width: '100%',
          maxWidth: '640px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          background: '#ffffff',
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.25)',
          border: '1.5px solid rgba(14, 165, 233, 0.35)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.75rem',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, #f8fafc 0%, #edf2f7 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-sm)',
                background: isExactMatch ? 'rgba(34, 197, 94, 0.12)' : 'rgba(218, 165, 32, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isExactMatch ? 'var(--c-lawn-green)' : 'var(--c-goldenrod)',
              }}
            >
              <Sparkles size={18} />
            </div>
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                Why This Match? • {matchScore}% Preference Match
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Transparent explanation of how {property.name} (Room {room.roomNo}) fits your criteria
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '50%',
              width: '34px',
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#475569',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem 1.75rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Quick Property & Room Lockup */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 'var(--radius-md)',
              padding: '1rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}
          >
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                {property.name} • Room #{room.roomNo}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.2rem' }}>
                <MapPin size={14} color="var(--c-sky-blue)" />
                <span>{property.address}</span>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--c-lawn-green)', fontFamily: 'var(--font-metrics)' }}>
                ₹{room.rent.toLocaleString()} <span style={{ fontSize: '0.75rem', color: '#64748b' }}>/mo</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#0284c7', fontWeight: 700 }}>
                {room.type} Occupancy
              </div>
            </div>
          </div>

          {/* Matched Requirements (Green Checkmarks) */}
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#15803d', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.65rem' }}>
              <Check size={16} />
              <span>Satisfied Requirements ({matchedFeatures.length})</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {matchedFeatures.map((feat, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'rgba(34, 197, 94, 0.06)',
                    border: '1px solid rgba(34, 197, 94, 0.25)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.6rem 0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.82rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        background: '#22c55e',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.65rem',
                        fontWeight: 900,
                      }}
                    >
                      ✓
                    </div>
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>{feat.label}:</span>
                    <span style={{ color: '#334155' }}>{feat.detail}</span>
                  </div>
                  {feat.isHardRequirement && (
                    <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#16a34a', textTransform: 'uppercase', background: 'rgba(34, 197, 94, 0.12)', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                      Hard Constraint Met
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Unmatched / Potential Differences */}
          {unmatchedFeatures.length > 0 && (
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#b45309', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.65rem' }}>
                <AlertCircle size={16} />
                <span>Trade-Offs & Differences ({unmatchedFeatures.length})</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {unmatchedFeatures.map((feat, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'rgba(245, 158, 11, 0.06)',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.6rem 0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.82rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div
                        style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          background: '#f59e0b',
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.7rem',
                          fontWeight: 900,
                        }}
                      >
                        •
                      </div>
                      <span style={{ fontWeight: 700, color: '#0f172a' }}>{feat.label}:</span>
                      <span style={{ color: '#64748b' }}>{feat.detail}</span>
                    </div>
                    {feat.isHardRequirement && (
                      <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#b45309', textTransform: 'uppercase', background: 'rgba(245, 158, 11, 0.15)', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                        Constraint Difference
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hallucination Protection Transparency Notice */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px dashed #cbd5e1',
              borderRadius: 'var(--radius-sm)',
              padding: '0.75rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              fontSize: '0.75rem',
              color: '#64748b',
            }}
          >
            <ShieldCheck size={16} color="var(--c-lawn-green)" style={{ flexShrink: 0 }} />
            <span>
              <strong>Zero-Hallucination Guarantee:</strong> All match points and prices above reflect verified property data from our registry. No facts or amenities have been fabricated.
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: '1.25rem 1.75rem',
            borderTop: '1px solid #e2e8f0',
            background: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: '1px solid #cbd5e1',
              padding: '0.65rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              fontWeight: 700,
              fontSize: '0.85rem',
              color: '#64748b',
              cursor: 'pointer',
            }}
          >
            Close Explanation
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onSelectForBooking(property.id, room.roomNo);
            }}
            style={{
              background: 'linear-gradient(135deg, var(--c-lawn-green) 0%, #16a34a 100%)',
              color: '#070a12',
              padding: '0.65rem 1.75rem',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              fontWeight: 800,
              fontSize: '0.88rem',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(34, 197, 94, 0.35)',
            }}
          >
            Reserve Room {room.roomNo} →
          </button>
        </div>
      </div>
    </div>
  );
};
