import React, { useState, useEffect, useMemo } from 'react';
import { SearchHeader } from './SearchHeader';
import { NaturalLanguageBar } from './NaturalLanguageBar';
import { FilterSidebar } from './FilterSidebar';
import { SortControls } from './SortControls';
import { PropertyResultCard } from './PropertyResultCard';
import { DiscoveryMap } from './DiscoveryMap';
import { PropertyDetailPreviewModal } from './PropertyDetailPreviewModal';
import { EmptyState } from './EmptyState';
import { LoadingSkeleton } from './LoadingSkeleton';
import { propertyService } from '../../services/propertyService';
import { PropertyListing, SearchFilters, SortOption } from '../../types';
import { CheckCircle2, Sparkles, Building2, MapPin, Plus } from 'lucide-react';
import { CreateBuildingModal } from '../creator/CreateBuildingModal';

interface DiscoveryPageProps {
  initialDestination?: string;
  initialBudget?: number;
  initialRoomType?: string;
  onBackToHome: () => void;
  onSelectPropertyForRoomMatrix?: (property: PropertyListing) => void;
  onNavigateToProperty?: (propertyId: string) => void;
}

export const DiscoveryPage: React.FC<DiscoveryPageProps> = ({
  initialDestination = 'Panyam',
  initialBudget = 7000,
  initialRoomType = 'All',
  onBackToHome,
  onSelectPropertyForRoomMatrix,
  onNavigateToProperty,
}) => {
  // Search State
  const [filters, setFilters] = useState<SearchFilters>({
    destination: initialDestination,
    origin: 'Kadapa',
    propertyType: 'All',
    roomType: (initialRoomType as any) || 'All',
    minBudget: 0,
    maxBudget: initialBudget || 7000,
    amenities: ['wifi', 'food'],
    duration: '6-months',
    onlyAvailable: false,
    verifiedOnly: false,
    gender: 'All',
  });

  const [sort, setSort] = useState<SortOption>('recommended');
  const [showMap, setShowMap] = useState<boolean>(true);
  const [showNLP, setShowNLP] = useState<boolean>(false);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [previewProperty, setPreviewProperty] = useState<PropertyListing | null>(null);
  const [selectedMapPropertyId, setSelectedMapPropertyId] = useState<string | undefined>();
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);

  // Fetch and filter properties deterministically
  const results = useMemo(() => {
    return propertyService.searchAndFilterProperties(filters, sort);
  }, [filters, sort]);

  // Simulate smooth loading transition when key filters change
  const handleUpdateFilters = (newFilters: Partial<SearchFilters>) => {
    setIsLoading(true);
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setTimeout(() => {
      setIsLoading(false);
    }, 180);
  };

  const handleResetFilters = () => {
    handleUpdateFilters({
      destination: 'Panyam',
      propertyType: 'All',
      roomType: 'All',
      minBudget: 0,
      maxBudget: 7500,
      amenities: [],
      duration: 'any',
      onlyAvailable: false,
      verifiedOnly: false,
      gender: 'All',
    });
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--canvas-bg)', paddingBottom: '5rem' }}>
      {/* Search Header */}
      <SearchHeader
        filters={filters}
        onUpdateFilters={handleUpdateFilters}
        onOpenNLP={() => setShowNLP(!showNLP)}
        onToggleMobileFilters={() => setIsMobileFiltersOpen(true)}
        onBackToHome={onBackToHome}
      />

      <div className="container" style={{ marginTop: '2rem' }}>
        {/* Optional Expandable Natural Language Intent Bar */}
        {showNLP && (
          <NaturalLanguageBar
            onApplyParsedFilters={(nlpFilters) => {
              handleUpdateFilters(nlpFilters);
              setShowNLP(false);
            }}
            onClose={() => setShowNLP(false)}
          />
        )}

        {/* Main 3-Column / Responsive Discovery Workspace */}
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
          {/* Left Column: Filter Sidebar (Desktop Persistent & Mobile Drawer) */}
          <FilterSidebar
            filters={filters}
            onChange={handleUpdateFilters}
            onReset={handleResetFilters}
            isMobileOpen={isMobileFiltersOpen}
            onCloseMobile={() => setIsMobileFiltersOpen(false)}
          />

          {/* Center Column: Stays List with Categorization */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <SortControls
              totalCount={results.totalMatchingCount}
              availableRoomsCount={results.totalAvailableRooms}
              destination={filters.destination}
              currentSort={sort}
              onSortChange={setSort}
              showMap={showMap}
              onToggleMap={() => setShowMap(!showMap)}
            />

            {/* Global City Selector & Add Building Trigger */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem',
                margin: '1rem 0 1.5rem',
                background: '#ffffff',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--c-sky-blue)' }}>
                  🌍 Worldwide Stays:
                </span>
                {['Panyam', 'Hyderabad', 'Bengaluru', 'London', 'Tokyo', 'New York', 'Dubai', 'Mumbai'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => handleUpdateFilters({ destination: c })}
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      background: filters.destination.toLowerCase().includes(c.toLowerCase()) ? 'var(--c-sky-blue)' : '#f8fafc',
                      color: filters.destination.toLowerCase().includes(c.toLowerCase()) ? '#ffffff' : '#475569',
                      border: '1px solid #cbd5e1',
                      borderRadius: 'var(--radius-full)',
                      padding: '0.2rem 0.65rem',
                      cursor: 'pointer',
                    }}
                  >
                    {c}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setIsCreateOpen(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  background: 'var(--c-lawn-green)',
                  color: '#070a12',
                  border: 'none',
                  borderRadius: 'var(--radius-full)',
                  padding: '0.45rem 1rem',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                <Plus size={15} />
                <span>+ Add Building & Rooms</span>
              </button>
            </div>

            {isLoading ? (
              <LoadingSkeleton />
            ) : results.totalMatchingCount === 0 ? (
              <EmptyState
                filters={filters}
                onResetFilters={handleResetFilters}
                onIncreaseBudget={(newBudget) => handleUpdateFilters({ maxBudget: newBudget })}
                onSwitchToDoubleSharing={() => handleUpdateFilters({ roomType: 'Double' })}
                onSwitchToNearbyNandyal={() => handleUpdateFilters({ destination: 'Nandyal' })}
              />
            ) : (
              <div>
                {/* 1. AVAILABLE NOW SECTION */}
                {results.availableNow.length > 0 && (
                  <div style={{ marginBottom: '2.5rem' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.65rem',
                        marginBottom: '1rem',
                      }}
                    >
                      <span className="radar-pulse" />
                      <h3
                        style={{
                          fontFamily: 'var(--font-metrics)',
                          fontSize: '1rem',
                          color: 'var(--c-lawn-green)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.08em',
                          fontWeight: 700,
                          margin: 0,
                        }}
                      >
                        Available Now ({results.availableNow.length} Properties with Vacancies)
                      </h3>
                    </div>

                    {results.availableNow.map((p) => (
                      <PropertyResultCard
                        key={p.id}
                        property={p}
                        onExplore={(selected) => {
                          if (onNavigateToProperty) {
                            onNavigateToProperty(selected.id);
                          } else {
                            setPreviewProperty(selected);
                          }
                        }}
                        isHighlighted={selectedMapPropertyId === p.id}
                      />
                    ))}
                  </div>
                )}

                {/* 2. STRONG MATCHES SECTION */}
                {results.strongMatches.length > 0 && (
                  <div style={{ marginBottom: '2.5rem' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.65rem',
                        marginBottom: '1rem',
                      }}
                    >
                      <Sparkles size={16} color="var(--c-goldenrod)" />
                      <h3
                        style={{
                          fontFamily: 'var(--font-metrics)',
                          fontSize: '1rem',
                          color: 'var(--c-goldenrod)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.08em',
                          fontWeight: 700,
                          margin: 0,
                        }}
                      >
                        Strong Matches ({results.strongMatches.length} High-Fit Options)
                      </h3>
                    </div>

                    {results.strongMatches.map((p) => (
                      <PropertyResultCard
                        key={p.id}
                        property={p}
                        onExplore={(selected) => {
                          if (onNavigateToProperty) {
                            onNavigateToProperty(selected.id);
                          } else {
                            setPreviewProperty(selected);
                          }
                        }}
                        isHighlighted={selectedMapPropertyId === p.id}
                      />
                    ))}
                  </div>
                )}

                {/* 3. OTHER OPTIONS SECTION */}
                {results.otherOptions.length > 0 && (
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.65rem',
                        marginBottom: '1rem',
                      }}
                    >
                      <Building2 size={16} color="var(--text-muted)" />
                      <h3
                        style={{
                          fontFamily: 'var(--font-metrics)',
                          fontSize: '1rem',
                          color: 'var(--text-muted)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.08em',
                          fontWeight: 700,
                          margin: 0,
                        }}
                      >
                        Additional Regional Stays ({results.otherOptions.length})
                      </h3>
                    </div>

                    {results.otherOptions.map((p) => (
                      <PropertyResultCard
                        key={p.id}
                        property={p}
                        onExplore={(selected) => {
                          if (onNavigateToProperty) {
                            onNavigateToProperty(selected.id);
                          } else {
                            setPreviewProperty(selected);
                          }
                        }}
                        isHighlighted={selectedMapPropertyId === p.id}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Stylized Spatial Map (Desktop only when toggled on) */}
          {showMap && (
            <div className="desktop-map-column">
              <DiscoveryMap
                properties={[...results.availableNow, ...results.strongMatches]}
                destination={filters.destination}
                selectedPropertyId={selectedMapPropertyId}
                onSelectProperty={(p) => {
                  setSelectedMapPropertyId(p.id);
                  if (onNavigateToProperty) {
                    onNavigateToProperty(p.id);
                  } else {
                    setPreviewProperty(p);
                  }
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Property Detail Preview Modal (Foundation for Phase 3 exploration) */}
      <PropertyDetailPreviewModal
        property={previewProperty}
        onClose={() => setPreviewProperty(null)}
        onSelectRoomMatrix={(p) => {
          if (onNavigateToProperty) {
            onNavigateToProperty(p.id);
          } else if (onSelectPropertyForRoomMatrix) {
            onSelectPropertyForRoomMatrix(p);
          }
        }}
      />

      <CreateBuildingModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onBuildingCreated={(newP) => {
          propertyService.addCustomProperty(newP);
          handleUpdateFilters({ destination: newP.town });
          if (onNavigateToProperty) {
            onNavigateToProperty(newP.id);
          }
        }}
      />

      <style>{`
        @media (max-width: 1199px) {
          .desktop-map-column { display: none !important; }
        }
      `}</style>
    </div>
  );
};
