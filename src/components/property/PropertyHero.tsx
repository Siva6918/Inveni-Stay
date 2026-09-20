import React, { useState } from 'react';
import { PropertyListing } from '../../types';
import {
  MapPin,
  ShieldCheck,
  Star,
  Compass,
  Layers,
  Heart,
  Share2,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface PropertyHeroProps {
  property: PropertyListing;
  onExploreRemotely: () => void;
  onViewRooms: () => void;
  isSaved: boolean;
  onToggleSave: () => void;
}

export const PropertyHero: React.FC<PropertyHeroProps> = ({
  property,
  onExploreRemotely,
  onViewRooms,
  isSaved,
  onToggleSave,
}) => {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div style={{ marginBottom: '2rem' }}>
      {/* Top Meta Bar */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <span
            style={{
              background: 'rgba(50, 205, 50, 0.15)',
              color: 'var(--c-lawn-green)',
              border: '1px solid rgba(50, 205, 50, 0.35)',
              padding: '0.25rem 0.75rem',
              borderRadius: 'var(--radius-pill)',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {property.propertyType} • {property.gender}
          </span>

          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              background: '#e0f2fe',
              color: '#0284c7',
              border: '1px solid #bae6fd',
              padding: '0.25rem 0.75rem',
              borderRadius: 'var(--radius-pill)',
              fontSize: '0.75rem',
              fontWeight: 600,
            }}
          >
            <ShieldCheck size={14} />
            {property.verificationBadge}
          </span>

          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              color: 'var(--c-goldenrod)',
              fontSize: '0.85rem',
              fontWeight: 700,
            }}
          >
            <Star size={15} fill="currentColor" /> {property.rating}
            <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.8rem' }}>
              ({property.reviewsCount} verified reviews)
            </span>
          </span>
        </div>

        {/* Action buttons: Save & Share */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={onToggleSave}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: isSaved ? 'rgba(220, 20, 60, 0.2)' : 'rgba(255, 255, 255, 0.06)',
              color: isSaved ? 'var(--c-crimson)' : 'var(--text-secondary)',
              border: isSaved
                ? '1px solid rgba(220, 20, 60, 0.5)'
                : '1px solid rgba(255, 255, 255, 0.15)',
              padding: '0.45rem 0.9rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            title={isSaved ? 'Saved to Favorites' : 'Save Property'}
          >
            <Heart size={16} fill={isSaved ? 'currentColor' : 'none'} />
            {isSaved ? 'Saved' : 'Save'}
          </button>

          <button
            onClick={handleShare}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'rgba(255, 255, 255, 0.06)',
              color: 'var(--text-secondary)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              padding: '0.45rem 0.9rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            title="Copy Link to Property"
          >
            <Share2 size={16} />
            {copied ? 'Link Copied!' : 'Share'}
          </button>
        </div>
      </div>

      {/* Hero Title & Primary Information */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1.5rem',
        }}
      >
        <div style={{ flex: 1, minWidth: '300px' }}>
          <h1
            style={{
              fontFamily: 'var(--font-headline)',
              fontSize: 'clamp(2rem, 4vw, 2.75rem)',
              fontWeight: 800,
              lineHeight: 1.15,
              color: '#0f172a',
              margin: '0 0 0.5rem 0',
              textTransform: 'uppercase',
              letterSpacing: '0.02em',
            }}
          >
            {property.name}
          </h1>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'var(--text-secondary)',
              fontSize: '0.95rem',
              marginBottom: '0.75rem',
              flexWrap: 'wrap',
            }}
          >
            <MapPin size={18} color="var(--c-green)" style={{ flexShrink: 0 }} />
            <span>
              {property.address}, {property.town}, {property.district}, {property.state}
            </span>
            <span style={{ color: 'var(--c-sky-blue)', fontWeight: 700 }}>
              • {property.distanceToCollege}
            </span>
          </div>

          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: '0.95rem',
              lineHeight: 1.6,
              maxWidth: '750px',
              margin: 0,
            }}
          >
            {property.overview}
          </p>
        </div>

        {/* Pricing & Availability Card (Neomorphic Raised Housing) */}
        <div
          style={{
            background: 'var(--surface-neomorph)',
            border: '1.5px solid rgba(14, 165, 233, 0.35)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.4rem 1.6rem',
            minWidth: '290px',
            boxShadow: 'var(--shadow-metaverse-glow)',
          }}
        >
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
            Monthly Rent (Includes Meals & Wi-Fi)
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', margin: '0.35rem 0' }}>
            <span
              style={{
                fontFamily: 'var(--font-metrics)',
                fontSize: '2.15rem',
                fontWeight: 800,
                color: 'var(--c-gold)',
              }}
            >
              ₹{property.startingRent.toLocaleString()}
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>– ₹6,000 / month</span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.45rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              background:
                property.availableRoomsCount > 0
                  ? 'rgba(16, 185, 129, 0.14)'
                  : 'rgba(239, 68, 68, 0.14)',
              border:
                property.availableRoomsCount > 0
                  ? '1px solid rgba(16, 185, 129, 0.4)'
                  : '1px solid rgba(239, 68, 68, 0.4)',
              boxShadow: property.availableRoomsCount > 0 ? '0 0 12px rgba(16, 185, 129, 0.2)' : 'none',
              marginBottom: '1.15rem',
            }}
          >
            <span
              style={{
                width: '9px',
                height: '9px',
                borderRadius: '50%',
                background:
                  property.availableRoomsCount > 0 ? 'var(--c-green)' : 'var(--c-red)',
                boxShadow: property.availableRoomsCount > 0 ? '0 0 8px var(--c-green)' : 'none',
              }}
            />
            <span
              style={{
                fontSize: '0.82rem',
                fontWeight: 800,
                color:
                  property.availableRoomsCount > 0 ? 'var(--c-green)' : 'var(--c-red)',
              }}
            >
              {property.availableRoomsCount > 0
                ? `● ${property.availableRoomsCount} Rooms Available (Floor 1 & 2)`
                : '● Fully Occupied (Waitlist Only)'}
            </span>
          </div>

          {/* Direct Section CTAs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <button
              onClick={onExploreRemotely}
              className="btn-iridescent"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1rem',
                fontSize: '0.85rem',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              <Compass size={16} /> Explore Remotely Before Arriving
            </button>

            <button
              onClick={onViewRooms}
              className="neomorph-btn"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.7rem 1rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <Layers size={16} color="var(--c-gold)" /> View Interactive Floor Layout & Rooms
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
