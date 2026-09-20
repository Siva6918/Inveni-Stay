import React, { useState } from 'react';
import { ShieldCheck, MapPin, Star, Utensils, Wifi, ShowerHead, Wind, Clock, ArrowRight, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { PropertyListing } from '../../types';

interface PropertyResultCardProps {
  property: PropertyListing;
  onExplore: (property: PropertyListing) => void;
  isHighlighted?: boolean;
}

export const PropertyResultCard: React.FC<PropertyResultCardProps> = ({
  property,
  onExplore,
  isHighlighted = false,
}) => {
  const [showMatchDetails, setShowMatchDetails] = useState(false);

  const isAvailable = property.availableRoomsCount > 0;
  const match = property.matchResult;

  const availableRoomNumbers = property.rooms
    .filter((r) => r.status === 'AVAILABLE')
    .map((r) => `#${r.roomNo} (${r.type})`);

  return (
    <div
      className="iridescent-card"
      style={{
        padding: '1.75rem',
        border: isHighlighted
          ? '1.5px solid #0284c7'
          : isAvailable
          ? '1px solid var(--border-medium)'
          : '1px solid var(--border-subtle)',
        boxShadow: isHighlighted ? '0 12px 36px rgba(2, 132, 199, 0.15)' : 'var(--shadow-md)',
        opacity: isAvailable ? 1 : 0.85,
        marginBottom: '1.5rem',
        transition: 'all var(--transition-normal)',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.75rem',
          alignItems: 'start',
        }}
      >
        {/* Left Column: Visual Media & Availability Badges */}
        <div style={{ position: 'relative' }}>
          <div
            style={{
              position: 'relative',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              aspectRatio: '16 / 10',
              background: 'var(--surface-1)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img
              src={property.heroImage || property.images[0] || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80'}
              alt={`${property.name} facade preview`}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80';
              }}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'transform 0.4s ease',
              }}
            />

            {/* Availability Pill (Top Left) */}
            <div
              style={{
                position: 'absolute',
                top: '0.75rem',
                left: '0.75rem',
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(8px)',
                border: isAvailable ? '1.5px solid #16a34a' : '1.5px solid #dc2626',
                color: isAvailable ? '#16a34a' : '#dc2626',
                fontFamily: 'var(--font-metrics)',
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                boxShadow: '0 2px 8px rgba(15, 23, 42, 0.1)',
              }}
            >
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: isAvailable ? '#16a34a' : '#dc2626',
                  boxShadow: `0 0 6px ${isAvailable ? '#16a34a' : '#dc2626'}`,
                }}
              />
              <span>
                {isAvailable
                  ? `${property.availableRoomsCount} Room${property.availableRoomsCount > 1 ? 's' : ''} Available`
                  : 'Fully Occupied'}
              </span>
            </div>

            {/* Gender / Property Type (Top Right) */}
            <div
              style={{
                position: 'absolute',
                top: '0.75rem',
                right: '0.75rem',
                padding: '0.25rem 0.6rem',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(255, 255, 255, 0.92)',
                backdropFilter: 'blur(8px)',
                color: '#92400e',
                fontFamily: 'var(--font-metrics)',
                fontSize: '0.72rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                border: '1px solid #fde68a',
                boxShadow: '0 2px 8px rgba(15, 23, 42, 0.08)',
              }}
            >
              {property.gender} {property.propertyType}
            </div>

            {/* Verified On-Site Watermark (Bottom Left) */}
            {property.verifiedStatus && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '0.65rem',
                  left: '0.65rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.7rem',
                  color: '#0284c7',
                  background: 'rgba(255, 255, 255, 0.92)',
                  backdropFilter: 'blur(8px)',
                  padding: '0.2rem 0.5rem',
                  borderRadius: 'var(--radius-xs)',
                  border: '1px solid #bae6fd',
                  fontWeight: 700,
                  boxShadow: '0 2px 8px rgba(15, 23, 42, 0.08)',
                }}
              >
                <ShieldCheck size={13} />
                <span>On-Site Verified</span>
              </div>
            )}
          </div>

          {/* Available Room Numbers Preview Pills */}
          {isAvailable && availableRoomNumbers.length > 0 && (
            <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-metrics)', textTransform: 'uppercase' }}>
                Vacant Units:
              </span>
              {availableRoomNumbers.slice(0, 3).map((rNo, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: '0.72rem',
                    fontFamily: 'var(--font-ui)',
                    padding: '0.15rem 0.5rem',
                    borderRadius: 'var(--radius-xs)',
                    background: 'rgba(50, 205, 50, 0.12)',
                    border: '1px solid rgba(50, 205, 50, 0.3)',
                    color: 'var(--c-lawn-green)',
                    fontWeight: 600,
                  }}
                >
                  {rNo}
                </span>
              ))}
              {availableRoomNumbers.length > 3 && (
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  +{availableRoomNumbers.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Title, Distance, Match Score, Rent, Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
          <div>
            {/* Rating & Match Score Row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--c-goldenrod)' }}>
                <Star size={15} fill="var(--c-goldenrod)" />
                <strong style={{ fontFamily: 'var(--font-metrics)', fontSize: '0.9rem' }}>{property.rating}</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({property.reviewsCount} reviews)</span>
              </div>

              {/* Requirement Match Pill */}
              {match && (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.25rem 0.65rem',
                    borderRadius: 'var(--radius-full)',
                    background:
                      match.score >= 85
                        ? '#ecfdf5'
                        : match.score >= 70
                        ? '#f0f9ff'
                        : '#f8fafc',
                    border:
                      match.score >= 85
                        ? '1px solid #a7f3d0'
                        : match.score >= 70
                        ? '1px solid #bae6fd'
                        : '1px solid var(--border-subtle)',
                    color:
                      match.score >= 85
                        ? '#047857'
                        : match.score >= 70
                        ? '#0284c7'
                        : 'var(--text-secondary)',
                    fontFamily: 'var(--font-metrics)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                  }}
                  onClick={() => setShowMatchDetails(!showMatchDetails)}
                  title="Click to view match explanation"
                >
                  <span>{match.score}% Requirement Match</span>
                  {showMatchDetails ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </div>
              )}
            </div>

            {/* Property Name */}
            <h3
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '1.45rem',
                fontWeight: 800,
                color: 'var(--text-primary)',
                marginBottom: '0.35rem',
                lineHeight: 1.3,
              }}
            >
              {property.name}
            </h3>

            {/* Location & Distance to Destination */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: '#0284c7',
                fontSize: '0.82rem',
                marginBottom: '0.75rem',
                fontWeight: 600,
              }}
            >
              <MapPin size={15} style={{ flexShrink: 0 }} />
              <span>{property.distanceToCollege} • {property.address}</span>
            </div>

            {/* Match Breakdown Expandable Drawer */}
            {match && showMatchDetails && (
              <div
                style={{
                  padding: '0.75rem',
                  background: 'var(--surface-1)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-medium)',
                  marginBottom: '1rem',
                  fontSize: '0.78rem',
                }}
              >
                <div style={{ fontWeight: 700, color: 'var(--c-goldenrod)', marginBottom: '0.35rem' }}>
                  Why this stay matches your search:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  {match.reasons.map((r, i) => (
                    <div key={i} style={{ color: 'var(--c-lawn-green)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <CheckCircle2 size={12} />
                      <span>{r}</span>
                    </div>
                  ))}
                  {match.caveats?.map((c, i) => (
                    <div key={i} style={{ color: 'var(--c-orange)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span>•</span>
                      <span>{c}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Key Amenities Icons */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                <Utensils size={14} color="#d97706" />
                <span>Mess Meals</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                <Wifi size={14} color="#0284c7" />
                <span>Wi-Fi Fiber</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                <ShowerHead size={14} color="#16a34a" />
                <span>Attached Bath</span>
              </div>
            </div>
          </div>

          {/* Pricing & CTA Bottom Row */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              paddingTop: '1rem',
              borderTop: '1px solid var(--border-subtle)',
            }}
          >
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Starting Rent
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-metrics)',
                    fontSize: '1.55rem',
                    color: '#16a34a',
                    fontWeight: 700,
                  }}
                >
                  ₹{property.startingRent.toLocaleString()}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>/ month</span>
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                Updated 14m ago (Demo availability)
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <button
                type="button"
                onClick={() => onExplore(property)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.65rem 1rem',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: '#0f172a',
                  cursor: 'pointer',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                }}
                title="View live Street View & Satellite map"
              >
                <span>🗺️ Street View</span>
              </button>

              <button
                type="button"
                onClick={() => onExplore(property)}
                className={isAvailable ? 'btn-primary' : 'btn-secondary'}
                style={{
                  padding: '0.65rem 1.35rem',
                  fontSize: '0.88rem',
                }}
              >
                <span>Explore Property</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
