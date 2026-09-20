import React from 'react';
import { ArrowUpDown, Map, List, CheckCircle2 } from 'lucide-react';
import { SortOption } from '../../types';

interface SortControlsProps {
  totalCount: number;
  availableRoomsCount: number;
  destination: string;
  currentSort: SortOption;
  onSortChange: (sort: SortOption) => void;
  showMap: boolean;
  onToggleMap: () => void;
}

export const SortControls: React.FC<SortControlsProps> = ({
  totalCount,
  availableRoomsCount,
  destination,
  currentSort,
  onSortChange,
  showMap,
  onToggleMap,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        marginBottom: '1.5rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      {/* Result Count and Availability Summary */}
      <div>
        <h2
          style={{
            fontFamily: 'var(--font-metrics)',
            fontSize: '1.35rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            margin: 0,
          }}
        >
          Stays in {destination || 'All Destinations'}
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
          <span>{totalCount} Properties Found</span>
          <span>•</span>
          <span style={{ color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: '#16a34a',
                display: 'inline-block',
              }}
            />
            {availableRoomsCount} Vacant Rooms Available
          </span>
        </div>
      </div>

      {/* Right Controls: Sort Dropdown & Map View Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        {/* Sort Select */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            background: 'var(--surface-1)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.45rem 0.75rem',
          }}
        >
          <ArrowUpDown size={14} color="var(--c-goldenrod)" />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-metrics)' }}>
            Sort:
          </span>
          <select
            value={currentSort}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              fontSize: '0.82rem',
              fontFamily: 'var(--font-ui)',
              fontWeight: 600,
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <option value="recommended" style={{ background: '#ffffff', color: '#0f172a' }}>Recommended (Match Score)</option>
            <option value="availability" style={{ background: '#ffffff', color: '#0f172a' }}>Availability (Most Vacant)</option>
            <option value="price-low" style={{ background: '#ffffff', color: '#0f172a' }}>Price: Low to High</option>
            <option value="price-high" style={{ background: '#ffffff', color: '#0f172a' }}>Price: High to Low</option>
            <option value="distance" style={{ background: '#ffffff', color: '#0f172a' }}>Distance to College</option>
          </select>
        </div>

        {/* Map Toggle Button */}
        <button
          type="button"
          onClick={onToggleMap}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.5rem 0.85rem',
            borderRadius: 'var(--radius-sm)',
            background: showMap ? '#e0f2fe' : 'var(--surface-1)',
            color: showMap ? '#0284c7' : 'var(--text-secondary)',
            border: showMap ? '1px solid #0284c7' : '1px solid var(--border-subtle)',
            fontSize: '0.82rem',
            fontFamily: 'var(--font-metrics)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)',
          }}
          className="desktop-map-toggle"
        >
          {showMap ? <List size={15} /> : <Map size={15} />}
          <span>{showMap ? 'List Only' : 'Map + List'}</span>
        </button>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .desktop-map-toggle { display: none !important; }
        }
      `}</style>
    </div>
  );
};
