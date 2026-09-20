import React from 'react';
import { Filter, X, RotateCcw, Check, ShieldCheck, IndianRupee } from 'lucide-react';
import { SearchFilters, PropertyType, RoomTypePreference, StayDuration } from '../../types';

interface FilterSidebarProps {
  filters: SearchFilters;
  onChange: (newFilters: Partial<SearchFilters>) => void;
  onReset: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  onChange,
  onReset,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const toggleAmenity = (amenity: string) => {
    const next = filters.amenities.includes(amenity)
      ? filters.amenities.filter((a) => a !== amenity)
      : [...filters.amenities, amenity];
    onChange({ amenities: next });
  };

  const content = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.75rem',
      }}
    >
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '0.85rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={16} color="var(--c-goldenrod)" />
          <span
            style={{
              fontFamily: 'var(--font-metrics)',
              fontSize: '1rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            Refine Stays
          </span>
        </div>

        <button
          type="button"
          onClick={onReset}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            background: 'transparent',
            border: 'none',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--c-goldenrod)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          <RotateCcw size={12} />
          <span>Reset All</span>
        </button>
      </div>

      {/* 1. Availability Toggles */}
      <div>
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.65rem 0.85rem',
            background: filters.onlyAvailable ? 'rgba(50, 205, 50, 0.12)' : 'var(--surface-1)',
            border: filters.onlyAvailable ? '1px solid var(--c-lawn-green)' : '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            marginBottom: '0.65rem',
            transition: 'all var(--transition-fast)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: 'var(--c-lime)',
              }}
            />
            <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600 }}>
              Only Vacant Rooms
            </span>
          </div>
          <input
            type="checkbox"
            checked={filters.onlyAvailable}
            onChange={(e) => onChange({ onlyAvailable: e.target.checked })}
            style={{ accentColor: 'var(--c-lawn-green)', cursor: 'pointer' }}
          />
        </label>

        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.65rem 0.85rem',
            background: filters.verifiedOnly ? 'rgba(218, 165, 32, 0.12)' : 'var(--surface-1)',
            border: filters.verifiedOnly ? '1px solid var(--c-goldenrod)' : '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={16} color="var(--c-goldenrod)" />
            <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600 }}>
              Verified On-Site Only
            </span>
          </div>
          <input
            type="checkbox"
            checked={filters.verifiedOnly}
            onChange={(e) => onChange({ verifiedOnly: e.target.checked })}
            style={{ accentColor: 'var(--c-goldenrod)', cursor: 'pointer' }}
          />
        </label>
      </div>

      {/* 2. Maximum Budget Slider */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
          <span
            style={{
              fontFamily: 'var(--font-metrics)',
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            Max Rent / Month
          </span>
          <span
            style={{
              fontFamily: 'var(--font-metrics)',
              fontSize: '1rem',
              color: 'var(--c-lawn-green)',
              fontWeight: 700,
            }}
          >
            ₹{filters.maxBudget.toLocaleString()}
          </span>
        </div>

        <input
          type="range"
          min={3500}
          max={10000}
          step={500}
          value={filters.maxBudget}
          onChange={(e) => onChange({ maxBudget: Number(e.target.value) })}
          style={{
            width: '100%',
            accentColor: 'var(--c-goldenrod)',
            cursor: 'pointer',
          }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
          <span>₹3,500</span>
          <span>₹10,000+</span>
        </div>
      </div>

      {/* 3. Room Type Preference */}
      <div>
        <div
          style={{
            fontFamily: 'var(--font-metrics)',
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: '0.65rem',
          }}
        >
          Room Occupancy
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.45rem' }}>
          {(['All', 'Single', 'Double', 'Triple'] as RoomTypePreference[]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => onChange({ roomType: type })}
              style={{
                padding: '0.55rem 0.5rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
                fontFamily: 'var(--font-ui)',
                fontWeight: filters.roomType === type ? 700 : 500,
                background: filters.roomType === type ? '#e0f2fe' : 'var(--surface-1)',
                color: filters.roomType === type ? '#0284c7' : 'var(--text-secondary)',
                border: filters.roomType === type ? '1px solid #0284c7' : '1px solid var(--border-subtle)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
            >
              {type === 'All' ? 'Any Sharing' : `${type} Room`}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Gender Category */}
      <div>
        <div
          style={{
            fontFamily: 'var(--font-metrics)',
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: '0.65rem',
          }}
        >
          Hostel Gender
        </div>

        <div style={{ display: 'flex', gap: '0.45rem' }}>
          {(['All', 'Boys', 'Girls', 'Co-ed'] as const).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => onChange({ gender: g })}
              style={{
                flex: 1,
                padding: '0.5rem 0.35rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.78rem',
                fontFamily: 'var(--font-ui)',
                fontWeight: filters.gender === g ? 700 : 500,
                background: filters.gender === g ? '#fef3c7' : 'var(--surface-1)',
                color: filters.gender === g ? '#b45309' : 'var(--text-secondary)',
                border: filters.gender === g ? '1px solid #d97706' : '1px solid var(--border-subtle)',
                cursor: 'pointer',
              }}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* 5. Essential Amenities */}
      <div>
        <div
          style={{
            fontFamily: 'var(--font-metrics)',
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: '0.65rem',
          }}
        >
          Must-Have Amenities
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {[
            { id: 'food', label: 'Andhra Mess Food Included' },
            { id: 'wifi', label: 'High-Speed Wi-Fi & Power Backup' },
            { id: 'attachedBath', label: 'Attached Bathroom & Geyser' },
            { id: 'ac', label: 'Air Conditioning (AC)' },
          ].map((item) => (
            <label
              key={item.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                fontSize: '0.82rem',
                color: filters.amenities.includes(item.id) ? 'var(--text-primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '0.35rem 0',
              }}
            >
              <input
                type="checkbox"
                checked={filters.amenities.includes(item.id)}
                onChange={() => toggleAmenity(item.id)}
                style={{ accentColor: '#0284c7' }}
              />
              <span>{item.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 6. Expected Stay Duration */}
      <div>
        <div
          style={{
            fontFamily: 'var(--font-metrics)',
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: '0.65rem',
          }}
        >
          Stay Duration
        </div>

        <select
          value={filters.duration}
          onChange={(e) => onChange({ duration: e.target.value as StayDuration })}
          style={{
            width: '100%',
            padding: '0.65rem 0.85rem',
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-ui)',
            fontSize: '0.85rem',
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          <option value="any">Flexible / Any Duration</option>
          <option value="1-month">1 Month (Exam / Short Visit)</option>
          <option value="3-months">3 Months (Trainee / Course)</option>
          <option value="6-months">6 Months (Semester Stay)</option>
          <option value="1-year">1 Year (Full Academic Year)</option>
        </select>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className="iridescent-card desktop-filter-sidebar"
        style={{
          width: '280px',
          padding: '1.75rem 1.25rem',
          height: 'fit-content',
          flexShrink: 0,
          border: '1px solid var(--border-medium)',
        }}
      >
        {content}
      </aside>

      {/* Mobile Drawer / Bottom Sheet */}
      {isMobileOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(8px)',
            zIndex: 2500,
            display: 'flex',
            alignItems: 'flex-end',
          }}
          onClick={onCloseMobile}
        >
          <div
            style={{
              width: '100%',
              maxHeight: '85vh',
              overflowY: 'auto',
              background: '#ffffff',
              borderTop: '1px solid var(--border-medium)',
              borderTopLeftRadius: 'var(--radius-xl)',
              borderTopRightRadius: 'var(--radius-xl)',
              padding: '1.75rem',
              boxShadow: '0 -10px 40px rgba(15, 23, 42, 0.15)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
              <button
                type="button"
                onClick={onCloseMobile}
                style={{
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                }}
                aria-label="Close filters"
              >
                <X size={22} />
              </button>
            </div>
            {content}
            <button
              type="button"
              onClick={onCloseMobile}
              className="btn-primary"
              style={{ width: '100%', marginTop: '1.5rem' }}
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 991px) {
          .desktop-filter-sidebar { display: none !important; }
        }
      `}</style>
    </>
  );
};
