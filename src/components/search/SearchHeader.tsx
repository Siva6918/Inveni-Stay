import React, { useState } from 'react';
import { MapPin, Navigation, Search, Sparkles, ArrowRight, ArrowLeft, Filter, SlidersHorizontal } from 'lucide-react';
import { POPULAR_DESTINATIONS } from '../../data/mockProperties';
import { SearchFilters } from '../../types';

interface SearchHeaderProps {
  filters: SearchFilters;
  onUpdateFilters: (newFilters: Partial<SearchFilters>) => void;
  onOpenNLP: () => void;
  onToggleMobileFilters: () => void;
  onBackToHome: () => void;
}

export const SearchHeader: React.FC<SearchHeaderProps> = ({
  filters,
  onUpdateFilters,
  onOpenNLP,
  onToggleMobileFilters,
  onBackToHome,
}) => {
  const [destinationInput, setDestinationInput] = useState(filters.destination);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleSelectDestination = (dest: string) => {
    setDestinationInput(dest);
    onUpdateFilters({ destination: dest });
    setShowSuggestions(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateFilters({ destination: destinationInput });
    setShowSuggestions(false);
  };

  return (
    <div
      style={{
        position: 'sticky',
        top: '68px',
        zIndex: 900,
        background: 'rgba(8, 12, 17, 0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-medium)',
        padding: '1rem 0',
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          {/* Left: Back button & Destination Search Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flex: '1 1 360px', position: 'relative' }}>
            <button
              type="button"
              onClick={onBackToHome}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.6rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--surface-1)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
                fontSize: '0.82rem',
                fontFamily: 'var(--font-metrics)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#ffffff';
                e.currentTarget.style.borderColor = 'var(--c-goldenrod)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-secondary)';
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
              }}
              aria-label="Back to Home"
            >
              <ArrowLeft size={16} />
              <span>Home</span>
            </button>

            {/* Destination Input with Live Dropdown */}
            <form onSubmit={handleSearchSubmit} style={{ flex: 1, position: 'relative' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  background: 'var(--surface-1)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.55rem 0.95rem',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <MapPin size={18} color="var(--c-lawn-green)" style={{ flexShrink: 0 }} />
                <input
                  type="text"
                  value={destinationInput}
                  onChange={(e) => setDestinationInput(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="Where are you moving? (e.g. Panyam, Nandyal)"
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-ui)',
                    fontSize: '0.92rem',
                    fontWeight: 600,
                  }}
                />
                <button
                  type="submit"
                  style={{
                    color: 'var(--c-goldenrod)',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0.2rem',
                  }}
                  aria-label="Search destination"
                >
                  <Search size={16} />
                </button>
              </div>

              {/* Suggestions Dropdown */}
              {showSuggestions && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    marginTop: '0.5rem',
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: '0 12px 30px rgba(15, 23, 42, 0.1)',
                    padding: '0.75rem',
                    zIndex: 1000,
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.72rem',
                      fontFamily: 'var(--font-metrics)',
                      textTransform: 'uppercase',
                      color: 'var(--text-muted)',
                      letterSpacing: '0.06em',
                      marginBottom: '0.5rem',
                    }}
                  >
                    Popular Relocation Destinations
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {POPULAR_DESTINATIONS.map((d) => (
                      <button
                        key={d.name}
                        type="button"
                        onClick={() => handleSelectDestination(d.name)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.55rem 0.75rem',
                          borderRadius: 'var(--radius-sm)',
                          background: destinationInput.toLowerCase() === d.name.toLowerCase() ? 'rgba(0, 180, 216, 0.1)' : 'transparent',
                          color: 'var(--text-primary)',
                          textAlign: 'left',
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          transition: 'background var(--transition-fast)',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f5f9')}
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background =
                            destinationInput.toLowerCase() === d.name.toLowerCase() ? 'rgba(0, 180, 216, 0.1)' : 'transparent')
                        }
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <MapPin size={14} color={d.highlight ? '#16a34a' : 'var(--text-muted)'} />
                          <strong>{d.name}</strong>, {d.state}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: d.highlight ? '#d97706' : 'var(--text-muted)' }}>
                          {d.tag}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Right: Natural Language Action & Mobile Filter Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Natural Language Trigger Button */}
            <button
              type="button"
              onClick={onOpenNLP}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.55rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(2, 132, 199, 0.08)',
                border: '1px solid rgba(2, 132, 199, 0.3)',
                color: '#0284c7',
                fontSize: '0.85rem',
                fontFamily: 'var(--font-ui)',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(2, 132, 199, 0.15)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(2, 132, 199, 0.08)')}
            >
              <Sparkles size={16} />
              <span>Tell Us What You Need</span>
            </button>

            {/* Mobile Filter Toggle */}
            <button
              type="button"
              onClick={onToggleMobileFilters}
              className="mobile-filter-trigger"
              style={{
                display: 'none',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.55rem 0.95rem',
                borderRadius: 'var(--radius-md)',
                background: '#ffffff',
                border: '1px solid var(--border-medium)',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                fontFamily: 'var(--font-metrics)',
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              <SlidersHorizontal size={16} color="var(--c-goldenrod)" />
              <span>Filters</span>
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 991px) {
          .mobile-filter-trigger { display: inline-flex !important; }
        }
      `}</style>
    </div>
  );
};
