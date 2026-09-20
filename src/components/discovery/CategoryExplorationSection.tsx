import React, { useState } from 'react';
import {
  Building2,
  DoorOpen,
  Home,
  Building,
  Hotel,
  Store,
  Briefcase,
  MapPin,
  Plus,
  ChevronRight,
  Sparkles,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface CategoryItem {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  badge: string;
  popularCount: string;
  color: string;
  bgLight: string;
}

const PRIMARY_CATEGORIES: CategoryItem[] = [
  {
    id: 'PG',
    name: 'PGs & Co-Living',
    description: 'Hostels and paying guest stays with meals, Wi-Fi, and housekeeping included.',
    icon: Building2,
    badge: 'High Demand',
    popularCount: '48 Stays Ready',
    color: '#0284c7',
    bgLight: 'rgba(2, 132, 199, 0.08)',
  },
  {
    id: 'Room',
    name: 'Single & Shared Rooms',
    description: 'Independent private rooms and sharing options for students and trainees.',
    icon: DoorOpen,
    badge: 'Budget Friendly',
    popularCount: '32 Rooms Ready',
    color: '#16a34a',
    bgLight: 'rgba(22, 163, 74, 0.08)',
  },
  {
    id: 'House',
    name: 'Houses & Independent',
    description: 'Individual family homes and duplexes in quiet residential neighborhoods.',
    icon: Home,
    badge: 'Spacious',
    popularCount: '15 Houses Ready',
    color: '#d97706',
    bgLight: 'rgba(217, 119, 6, 0.08)',
  },
  {
    id: 'Apartment',
    name: 'Apartments & Flats',
    description: '1BHK, 2BHK and gated community apartments with security and lifts.',
    icon: Building,
    badge: 'Modern',
    popularCount: '22 Units Ready',
    color: '#8b5cf6',
    bgLight: 'rgba(139, 92, 246, 0.08)',
  },
  {
    id: 'Hotel',
    name: 'Hotels & Transit Stays',
    description: 'Short-term daily lodges and verified hotel rooms for exam trips and interviews.',
    icon: Hotel,
    badge: 'Instant Move-in',
    popularCount: '14 Stays Ready',
    color: '#ec4899',
    bgLight: 'rgba(236, 72, 153, 0.08)',
  },
  {
    id: 'Shop',
    name: 'Commercial Shops',
    description: 'Ground floor retail and commercial shop spaces facing main arterial roads.',
    icon: Store,
    badge: 'Road Facing',
    popularCount: '9 Spaces Ready',
    color: '#0ea5e9',
    bgLight: 'rgba(14, 165, 233, 0.08)',
  },
  {
    id: 'Office',
    name: 'Offices & Co-Working',
    description: 'Equipped branch offices, consultancy desks, and coaching institute floors.',
    icon: Briefcase,
    badge: 'Plug & Play',
    popularCount: '7 Spaces Ready',
    color: '#059669',
    bgLight: 'rgba(5, 150, 105, 0.08)',
  },
  {
    id: 'Land',
    name: 'Plots & Industrial Land',
    description: 'Commercial plots, warehouse yards, and agricultural holdings near highways.',
    icon: MapPin,
    badge: 'Highway Facing',
    popularCount: '11 Plots Ready',
    color: '#b45309',
    bgLight: 'rgba(180, 83, 9, 0.08)',
  },
];

const EXTRA_CATEGORIES = [
  { name: 'Student Hostels (Govt. Affiliated)', desc: 'Subsidized stays near colleges' },
  { name: 'Corporate Guest Houses', desc: 'Furnished suites for company visits' },
  { name: 'Warehouses & Godowns', desc: 'Secure storage yards along NH 40' },
  { name: 'Studio Micro-Flats', desc: 'Compact modern bachelor studios' },
];

interface CategoryExplorationSectionProps {
  onSelectCategory: (category: string) => void;
}

export const CategoryExplorationSection: React.FC<CategoryExplorationSectionProps> = ({
  onSelectCategory,
}) => {
  const [showMore, setShowMore] = useState<boolean>(false);

  return (
    <section id="categories" className="section-wrapper" style={{ background: '#f8fafc' }}>
      <div className="container">
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 2.75rem' }}>
          <div
            className="pill-badge pill-badge--aqua"
            style={{
              marginBottom: '0.85rem',
              background: '#ffffff',
              border: '1px solid #bae6fd',
              color: '#0284c7',
            }}
          >
            <Layers size={14} color="#0284c7" />
            <span>Structured Discovery Directory</span>
          </div>

          <h2
            style={{
              fontFamily: 'var(--font-headline)',
              fontSize: 'clamp(2rem, 3.8vw, 3rem)',
              color: '#0f172a',
              textTransform: 'uppercase',
              letterSpacing: '0.02em',
              marginBottom: '0.75rem',
              lineHeight: 1.2,
            }}
          >
            Explore <span style={{ fontFamily: 'var(--font-fascinate)', letterSpacing: '0.05em', color: '#0284c7', textTransform: 'none' }}>Curated</span> Stays & Spaces
          </h2>

          <p
            style={{
              fontFamily: 'var(--font-ui)',
              color: '#475569',
              fontSize: '1.02rem',
              lineHeight: 1.6,
            }}
          >
            Whether relocating for college, starting a job, or expanding your enterprise in Andhra Pradesh, find exactly what fits your accommodation timeline.
          </p>
        </div>

        {/* Category Grid: 4 columns on desktop, 2 on tablet, 1 on mobile */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.25rem',
            marginBottom: '2rem',
          }}
        >
          {PRIMARY_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                style={{
                  background: '#ffffff',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  padding: '1.4rem',
                  boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 12px 28px rgba(15, 23, 42, 0.08)';
                  e.currentTarget.style.borderColor = cat.color;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(15, 23, 42, 0.04)';
                  e.currentTarget.style.borderColor = '#e2e8f0';
                }}
              >
                {/* Top Row: Icon + Badge */}
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '1rem',
                    }}
                  >
                    <div
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '12px',
                        background: cat.bgLight,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: cat.color,
                      }}
                    >
                      <Icon size={22} />
                    </div>

                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '0.2rem 0.55rem',
                        borderRadius: '10px',
                        background: '#f8fafc',
                        color: '#64748b',
                        border: '1px solid #e2e8f0',
                        letterSpacing: '0.02em',
                      }}
                    >
                      {cat.badge}
                    </span>
                  </div>

                  {/* Category Name */}
                  <h3
                    style={{
                      fontFamily: 'var(--font-headline)',
                      fontSize: '1.25rem',
                      fontWeight: 800,
                      color: '#0f172a',
                      marginBottom: '0.35rem',
                      textTransform: 'uppercase',
                    }}
                  >
                    {cat.name}
                  </h3>

                  {/* Description */}
                  <p
                    style={{
                      fontFamily: 'var(--font-ui)',
                      fontSize: '0.86rem',
                      color: '#64748b',
                      lineHeight: 1.5,
                      marginBottom: '1rem',
                    }}
                  >
                    {cat.description}
                  </p>
                </div>

                {/* Bottom Row: Count + Action */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid #f1f5f9',
                  }}
                >
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: cat.color }}>
                    {cat.popularCount}
                  </span>

                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: '#0f172a',
                    }}
                  >
                    <span>Browse</span>
                    <ArrowRight size={14} color={cat.color} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* More + Expandable Button */}
        <div style={{ textAlign: 'center' }}>
          <button
            type="button"
            onClick={() => setShowMore(!showMore)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.65rem 1.4rem',
              borderRadius: 'var(--radius-full)',
              background: '#ffffff',
              border: '1.5px solid #cbd5e1',
              color: '#0f172a',
              fontFamily: 'var(--font-ui)',
              fontSize: '0.88rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#0284c7';
              e.currentTarget.style.color = '#0284c7';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#cbd5e1';
              e.currentTarget.style.color = '#0f172a';
            }}
          >
            <Plus size={16} style={{ transform: showMore ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s' }} />
            <span>{showMore ? 'Show Fewer Categories' : 'More Categories & Regional Spaces'}</span>
          </button>
        </div>

        {/* Expanded categories drawer */}
        {showMore && (
          <div
            style={{
              marginTop: '1.5rem',
              padding: '1.5rem',
              background: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1rem',
              animation: 'fadeInDown 0.2s ease-out',
            }}
          >
            {EXTRA_CATEGORIES.map((item, idx) => (
              <div
                key={idx}
                onClick={() => onSelectCategory('PG')}
                style={{
                  padding: '1rem',
                  borderRadius: '10px',
                  background: '#f8fafc',
                  border: '1px solid #f1f5f9',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#f0f9ff')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#f8fafc')}
              >
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>
                  {item.name}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                  {item.desc}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
