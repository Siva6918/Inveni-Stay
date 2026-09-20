import React from 'react';
import { SearchX, RotateCcw, ArrowRight, MapPin, Sparkles } from 'lucide-react';
import { SearchFilters } from '../../types';

interface EmptyStateProps {
  filters: SearchFilters;
  onResetFilters: () => void;
  onIncreaseBudget: (newBudget: number) => void;
  onSwitchToDoubleSharing: () => void;
  onSwitchToNearbyNandyal: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  filters,
  onResetFilters,
  onIncreaseBudget,
  onSwitchToDoubleSharing,
  onSwitchToNearbyNandyal,
}) => {
  return (
    <div
      className="iridescent-card"
      style={{
        padding: '3rem 2rem',
        textAlign: 'center',
        border: '1px solid var(--border-medium)',
        background: 'var(--surface-1)',
        maxWidth: '720px',
        margin: '2rem auto',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: '#fee2e2',
          color: '#ef4444',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.25rem',
        }}
      >
        <SearchX size={32} />
      </div>

      <h3
        style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '1.4rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: '0.5rem',
        }}
      >
        No Available Stays Match Your Exact Filters
      </h3>

      <p
        style={{
          color: 'var(--text-secondary)',
          fontSize: '0.92rem',
          maxWidth: '520px',
          margin: '0 auto 1.75rem',
          lineHeight: 1.5,
        }}
      >
        We found zero properties in <strong>{filters.destination}</strong> under ₹{filters.maxBudget.toLocaleString()} matching all requested amenities.
      </p>

      {/* Recommended Alternative Paths */}
      <div
        style={{
          padding: '1.25rem',
          background: 'var(--surface-1)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          textAlign: 'left',
          marginBottom: '2rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--c-goldenrod)', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.75rem', textTransform: 'uppercase', fontFamily: 'var(--font-metrics)' }}>
          <Sparkles size={14} />
          <span>Recommended Adjustments to Unlock Rooms:</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          <button
            type="button"
            onClick={() => onIncreaseBudget(6000)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.65rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--surface-2)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              cursor: 'pointer',
              textAlign: 'left',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#0284c7')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
          >
            <span>Increase budget cap to <strong>₹6,000 / month</strong> (Unlocks Sri Sai PG & 4 others)</span>
            <ArrowRight size={14} color="#0284c7" />
          </button>

          <button
            type="button"
            onClick={onSwitchToDoubleSharing}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.65rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--surface-2)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              cursor: 'pointer',
              textAlign: 'left',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#d97706')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
          >
            <span>Switch to <strong>Double Sharing</strong> (Starting ₹4,200/mo with food)</span>
            <ArrowRight size={14} color="#d97706" />
          </button>

          <button
            type="button"
            onClick={onSwitchToNearbyNandyal}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.65rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--surface-2)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              cursor: 'pointer',
              textAlign: 'left',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#16a34a')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
          >
            <span>Explore <strong>Nandyal Stays</strong> (16 km away with 20-min express bus)</span>
            <ArrowRight size={14} color="#16a34a" />
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={onResetFilters}
        className="btn-secondary"
        style={{ padding: '0.75rem 1.5rem', fontSize: '0.88rem' }}
      >
        <RotateCcw size={16} />
        <span>Reset to Default Search</span>
      </button>
    </div>
  );
};
