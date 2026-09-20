import React from 'react';
import { X, ShieldCheck, MapPin, Star, Utensils, Wifi, ShowerHead, Check, Bed, ArrowRight, Clock } from 'lucide-react';
import { PropertyListing } from '../../types';

interface PropertyDetailPreviewModalProps {
  property: PropertyListing | null;
  onClose: () => void;
  onSelectRoomMatrix: (property: PropertyListing) => void;
}

export const PropertyDetailPreviewModal: React.FC<PropertyDetailPreviewModalProps> = ({
  property,
  onClose,
  onSelectRoomMatrix,
}) => {
  if (!property) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 3000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
      onClick={onClose}
    >
      <div
        className="iridescent-card"
        style={{
          width: '100%',
          maxWidth: '820px',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 'var(--radius-xl)',
          padding: '2.25rem',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.18)',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            color: 'var(--text-secondary)',
            background: '#f1f5f9',
            border: '1px solid #cbd5e1',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        {/* Top Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.85rem' }}>
          <span
            style={{
              fontFamily: 'var(--font-metrics)',
              fontSize: '0.75rem',
              color: '#16a34a',
              background: 'rgba(34, 197, 94, 0.12)',
              border: '1px solid rgba(34, 197, 94, 0.4)',
              padding: '0.2rem 0.65rem',
              borderRadius: 'var(--radius-full)',
              textTransform: 'uppercase',
              fontWeight: 700,
            }}
          >
            ● {property.availableRoomsCount} Rooms Currently Vacant
          </span>

          {property.verifiedStatus && (
            <span
              style={{
                fontFamily: 'var(--font-metrics)',
                fontSize: '0.75rem',
                color: '#d97706',
                background: 'rgba(217, 119, 6, 0.1)',
                border: '1px solid rgba(217, 119, 6, 0.35)',
                padding: '0.2rem 0.65rem',
                borderRadius: 'var(--radius-full)',
                textTransform: 'uppercase',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <ShieldCheck size={13} />
              <span>Verified On-Site</span>
            </span>
          )}
        </div>

        {/* Title */}
        <h2
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '1.85rem',
            fontWeight: 800,
            color: 'var(--text-primary)',
            marginBottom: '0.4rem',
            paddingRight: '2rem',
          }}
        >
          {property.name}
        </h2>

        {/* Location */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#0284c7', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
          <MapPin size={16} />
          <span>{property.address} • {property.distanceToCollege}</span>
        </div>

        {/* Overview Box */}
        <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
          {property.overview}
        </p>

        {/* Room Numbers Status Breakdown */}
        <div
          style={{
            padding: '1.25rem',
            background: '#f8fafc',
            borderRadius: 'var(--radius-md)',
            border: '1px solid #e2e8f0',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span
              style={{
                fontFamily: 'var(--font-metrics)',
                fontSize: '0.85rem',
                textTransform: 'uppercase',
                color: 'var(--text-primary)',
                letterSpacing: '0.06em',
                fontWeight: 700,
              }}
            >
              Room-Level Availability Breakdown
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Updated 14m ago by {property.ownerName}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.65rem' }}>
            {property.rooms.map((r) => (
              <div
                key={r.roomNo}
                style={{
                  padding: '0.65rem',
                  background: '#ffffff',
                  borderRadius: 'var(--radius-sm)',
                  border: r.status === 'AVAILABLE' ? '1.5px solid #22c55e' : '1px solid #e2e8f0',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'var(--font-metrics)', fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 700 }}>
                    Room #{r.roomNo}
                  </span>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontFamily: 'var(--font-metrics)',
                      textTransform: 'uppercase',
                      color: r.status === 'AVAILABLE' ? '#16a34a' : 'var(--text-muted)',
                      fontWeight: 700,
                    }}
                  >
                    {r.status}
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {r.type} • ₹{r.rent.toLocaleString()}/mo
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Facilities Grid */}
        <div style={{ marginBottom: '2rem' }}>
          <h4
            style={{
              fontFamily: 'var(--font-metrics)',
              fontSize: '0.85rem',
              textTransform: 'uppercase',
              color: 'var(--text-secondary)',
              letterSpacing: '0.06em',
              marginBottom: '0.75rem',
            }}
          >
            Included Verified Amenities
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.65rem' }}>
            {property.facilities.map((f) => (
              <div
                key={f.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  padding: '0.55rem 0.75rem',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.82rem',
                  color: 'var(--text-primary)',
                }}
              >
                <Check size={14} color="#16a34a" style={{ flexShrink: 0 }} />
                <span>{f.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Actions */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid #e2e8f0',
          }}
        >
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Starting Rent</div>
            <div style={{ fontFamily: 'var(--font-metrics)', fontSize: '1.65rem', color: '#16a34a', fontWeight: 700 }}>
              ₹{property.startingRent.toLocaleString()} <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>/ month</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.85rem' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              style={{ padding: '0.75rem 1.25rem', fontSize: '0.85rem' }}
            >
              Back to Stays
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onSelectRoomMatrix(property);
              }}
              className="btn-primary"
              style={{ padding: '0.75rem 1.65rem', fontSize: '0.88rem' }}
            >
              <span>Inspect Room Matrix (Phase 3)</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
