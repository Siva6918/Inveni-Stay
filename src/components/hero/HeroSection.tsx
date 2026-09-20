import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  MapPin,
  Building2,
  Navigation,
  Compass,
  ArrowRight,
  CheckCircle2,
  Plus,
} from 'lucide-react';
import { InteractiveIntroHeroCard } from './InteractiveIntroHeroCard';
import { RelocationFilterState } from '../../types';

interface HeroSectionProps {
  onSearchSubmit: (criteria: RelocationFilterState) => void;
  onOpenCreateModal?: () => void;
  onOpenAssistant?: (prompt?: string) => void;
}

const DESTINATION_PILLS = ['Panyam', 'Hyderabad', 'Bengaluru', 'Pune', 'Chennai', 'Nandyal', 'Kurnool'];

const REQUIREMENT_SHORTCUTS = [
  'Single room under ₹6000 with food and Wi-Fi',
  'Double sharing under ₹4500 near college',
  'Private AC room with attached bath',
  'Immediate move-in with Andhra meals',
];

export const HeroSection: React.FC<HeroSectionProps> = ({
  onSearchSubmit,
  onOpenCreateModal,
  onOpenAssistant,
}) => {
  const [destination, setDestination] = useState('Panyam');
  const [requirements, setRequirements] = useState('Single room under ₹6000 with food and Wi-Fi');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isExtracted, setIsExtracted] = useState(true);

  // Extracted entities state derived from requirement input
  const [extractedData, setExtractedData] = useState({
    destination: 'Panyam',
    roomType: 'Single',
    budget: 6000,
    food: 'Required',
    wifi: 'Required',
  });

  // Re-parse requirements when text changes
  useEffect(() => {
    const text = requirements.toLowerCase();
    const dest = destination.trim() || 'Panyam';
    const isDouble = text.includes('double') || text.includes('2 sharing');
    const budgetMatch = text.match(/(?:under|below|<=|≤)?\s*₹?\s*(\d{4,5})/i);
    const parsedBudget = budgetMatch ? parseInt(budgetMatch[1], 10) : 6000;
    const hasFood = !text.includes('no food') && (text.includes('food') || text.includes('meal') || text.includes('mess'));
    const hasWifi = !text.includes('no wifi') && (text.includes('wifi') || text.includes('wi-fi') || text.includes('internet'));

    setExtractedData({
      destination: dest,
      roomType: isDouble ? 'Double' : 'Single',
      budget: parsedBudget,
      food: hasFood ? 'Required' : 'Flexible',
      wifi: hasWifi ? 'Required' : 'Flexible',
    });
  }, [destination, requirements]);

  // Subtle mouse move parallax for desktop
  const handleMouseMove = (e: React.MouseEvent) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const { clientX, clientY } = e;
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    setMousePos({
      x: ((clientX - centerX) / centerX) * 6,
      y: ((clientY - centerY) / centerY) * 6,
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsExtracted(true);
    onSearchSubmit({
      destination: extractedData.destination,
      origin: 'Current Location',
      arrivalDate: new Date().toISOString().split('T')[0],
      userType: 'Student',
      budgetMax: extractedData.budget,
      roomPreference: extractedData.roomType as any,
      foodRequired: extractedData.food === 'Required',
      wifiRequired: extractedData.wifi === 'Required',
    });
  };

  return (
    <section
      onMouseMove={handleMouseMove}
      style={{
        position: 'relative',
        paddingTop: '6.5rem',
        paddingBottom: '4.5rem',
        overflow: 'hidden',
        width: '100%',
        minHeight: '85vh',
        display: 'flex',
        alignItems: 'center',
        background: 'transparent',
      }}
    >
      {/* 3D Spatial Background Shaders & Subtle Light Gradients */}
      <div
        style={{
          position: 'absolute',
          top: '-5%',
          left: '15%',
          width: '650px',
          height: '450px',
          background: 'radial-gradient(ellipse at center, rgba(14, 165, 233, 0.07) 0%, rgba(22, 163, 74, 0.04) 45%, transparent 75%)',
          filter: 'blur(75px)',
          pointerEvents: 'none',
          transform: `translate3d(${mousePos.x * -1}px, ${mousePos.y * -1}px, 0)`,
          transition: 'transform 0.2s ease-out',
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '5%',
          right: '10%',
          width: '550px',
          height: '400px',
          background: 'radial-gradient(ellipse at center, rgba(245, 158, 11, 0.06) 0%, rgba(236, 72, 153, 0.03) 50%, transparent 80%)',
          filter: 'blur(70px)',
          pointerEvents: 'none',
          transform: `translate3d(${mousePos.x * 1.2}px, ${mousePos.y * 1.2}px, 0)`,
          transition: 'transform 0.2s ease-out',
          zIndex: 0,
        }}
      />

      <div className="container" style={{ position: 'relative', zIndex: 1, width: '100%' }}>
        {/* Top HUD Tag */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div
            className="metaverse-hud"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.65rem',
              padding: '0.45rem 1.2rem',
              borderRadius: 'var(--radius-full)',
              background: '#ffffff',
              border: '1px solid rgba(14, 165, 233, 0.35)',
              boxShadow: '0 4px 16px rgba(14, 165, 233, 0.12)',
            }}
          >
            <span className="radar-pulse" />
            <span
              style={{
                fontFamily: 'var(--font-metrics)',
                fontSize: '0.8rem',
                color: '#0284c7',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                fontWeight: 800,
              }}
            >
              SPATIAL RELOCATION PLATFORM • EXPLORE BEFORE YOU ARRIVE
            </span>
          </div>
        </div>

        {/* 2-Column Editorial Composition */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
            gap: 'clamp(1.5rem, 4vw, 3rem)',
            alignItems: 'center',
            marginBottom: 'clamp(1.5rem, 4vw, 3rem)',
          }}
        >
          {/* Left Column: Core Message & Glass Dual-Search Portal */}
          <div style={{ textAlign: 'left' }}>
            {/* Editorial lifestyle accent with Miss Fajardo's */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.65rem' }}>
              <span
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: '#64748b',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                Your next destination
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-fajardos)',
                  fontSize: '1.85rem',
                  color: '#0284c7',
                  transform: 'rotate(-2deg)',
                  display: 'inline-block',
                  lineHeight: 1,
                }}
              >
                Beautifully
              </span>
            </div>

            {/* Primary Headline in Oswald */}
            <h1
              style={{
                fontFamily: 'var(--font-headline)',
                fontSize: 'clamp(2.4rem, 4.5vw, 3.8rem)',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: '#0f172a',
                lineHeight: 1.12,
                margin: '0 0 1rem 0',
                textTransform: 'uppercase',
              }}
            >
              Find your stay <br />
              <span
                style={{
                  background: 'var(--grad-iridescent)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                before you arrive.
              </span>
            </h1>

            {/* Supporting Copy */}
            <p
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: 'clamp(1rem, 1.6vw, 1.15rem)',
                color: '#475569',
                maxWidth: '600px',
                margin: '0 0 2rem 0',
                lineHeight: 1.65,
              }}
            >
              Discover available rooms, explore properties remotely, and reserve your stay from wherever you are.
            </p>

            {/* Stanza-Inspired Large Light Glass Dual-Search Surface (Section 12) */}
            <div
              className="glass-panel"
              style={{
                padding: 'clamp(1.15rem, 3vw, 1.75rem)',
                borderRadius: 'var(--radius-xl)',
                background: 'rgba(255, 255, 255, 0.92)',
                border: '1.5px solid rgba(14, 165, 233, 0.35)',
                boxShadow: 'var(--shadow-glass-lg)',
                marginBottom: '1.5rem',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Subtle Spectral Glow Accent Line */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '3px',
                  background: 'var(--grad-iridescent)',
                }}
              />

              <form onSubmit={handleSearchSubmit}>
                {/* Field 1: WHERE ARE YOU MOVING? */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <label
                    style={{
                      display: 'block',
                      fontFamily: 'var(--font-metrics)',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      color: '#0284c7',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      marginBottom: '0.45rem',
                    }}
                  >
                    WHERE ARE YOU MOVING?
                  </label>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.65rem',
                      background: '#ffffff',
                      border: '1.5px solid #cbd5e1',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.7rem 1rem',
                      boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.03)',
                    }}
                  >
                    <MapPin size={18} color="#0284c7" style={{ flexShrink: 0 }} />
                    <input
                      type="text"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      placeholder="e.g. Panyam, Hyderabad, Bengaluru..."
                      aria-label="Destination City or Town"
                      style={{
                        flex: 1,
                        background: 'transparent',
                        border: 'none',
                        outline: 'none',
                        color: '#0f172a',
                        fontSize: '1rem',
                        fontWeight: 600,
                        fontFamily: 'var(--font-ui)',
                      }}
                    />
                  </div>

                  {/* Destination Shortcut Pills */}
                  <div
                    style={{
                      display: 'flex',
                      gap: '0.4rem',
                      flexWrap: 'wrap',
                      marginTop: '0.5rem',
                    }}
                  >
                    {DESTINATION_PILLS.map((city) => (
                      <button
                        key={city}
                        type="button"
                        onClick={() => setDestination(city)}
                        style={{
                          background: destination === city ? '#e0f2fe' : '#ffffff',
                          border: destination === city ? '1px solid #0284c7' : '1px solid #e2e8f0',
                          color: destination === city ? '#0369a1' : '#475569',
                          borderRadius: 'var(--radius-full)',
                          padding: '0.25rem 0.65rem',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
                        }}
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Field 2: WHAT DO YOU NEED? (AI Requirement Input) */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontFamily: 'var(--font-metrics)',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      color: '#b45309',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      marginBottom: '0.45rem',
                    }}
                  >
                    <span>WHAT DO YOU NEED? (INVENI AI)</span>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'none', fontWeight: 500 }}>
                      Natural Language Requirement
                    </span>
                  </label>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.65rem',
                      background: '#ffffff',
                      border: '1.5px solid #cbd5e1',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.7rem 1rem',
                      boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.03)',
                    }}
                  >
                    <Sparkles size={18} color="#d97706" style={{ flexShrink: 0 }} />
                    <input
                      type="text"
                      value={requirements}
                      onChange={(e) => setRequirements(e.target.value)}
                      placeholder="e.g. Single room under ₹6000 with food and Wi-Fi..."
                      aria-label="Room requirements and budget"
                      style={{
                        flex: 1,
                        background: 'transparent',
                        border: 'none',
                        outline: 'none',
                        color: '#0f172a',
                        fontSize: '0.96rem',
                        fontWeight: 500,
                        fontFamily: 'var(--font-ui)',
                      }}
                    />
                  </div>

                  {/* Requirement Shortcut Pills */}
                  <div
                    style={{
                      display: 'flex',
                      gap: '0.4rem',
                      flexWrap: 'wrap',
                      marginTop: '0.5rem',
                    }}
                  >
                    {REQUIREMENT_SHORTCUTS.map((sc) => (
                      <button
                        key={sc}
                        type="button"
                        onClick={() => setRequirements(sc)}
                        style={{
                          background: '#ffffff',
                          border: '1px solid #e2e8f0',
                          color: '#475569',
                          borderRadius: 'var(--radius-full)',
                          padding: '0.22rem 0.65rem',
                          fontSize: '0.72rem',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          transition: 'all 0.15s ease',
                          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
                        }}
                      >
                        {sc}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Primary Search CTA Button */}
                <button
                  type="submit"
                  className="btn-iridescent"
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.65rem',
                    padding: '0.95rem 1.5rem',
                    fontSize: '1.05rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    borderRadius: 'var(--radius-lg)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  <span>Find My Stay</span>
                  <ArrowRight size={18} />
                </button>
              </form>

              {/* Animated AI Requirement Extraction Visualization (Section 13 & 14) */}
              {isExtracted && (
                <div
                  style={{
                    marginTop: '1.25rem',
                    paddingTop: '1.25rem',
                    borderTop: '1px solid #e2e8f0',
                    animation: 'fadeIn 0.3s ease-out',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      marginBottom: '0.65rem',
                      fontSize: '0.75rem',
                      fontFamily: 'var(--font-metrics)',
                      color: '#16a34a',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                    }}
                  >
                    <CheckCircle2 size={14} color="#16a34a" />
                    <span>Live Requirement Extraction:</span>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
                      gap: '0.5rem',
                    }}
                  >
                    <div
                      style={{
                        background: '#f8fafc',
                        padding: '0.55rem 0.75rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      <div style={{ fontSize: '0.66rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                        DESTINATION
                      </div>
                      <div style={{ fontSize: '0.88rem', color: '#0f172a', fontWeight: 800 }}>
                        {extractedData.destination}
                      </div>
                    </div>

                    <div
                      style={{
                        background: '#f8fafc',
                        padding: '0.55rem 0.75rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      <div style={{ fontSize: '0.66rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                        ROOM
                      </div>
                      <div style={{ fontSize: '0.88rem', color: '#0284c7', fontWeight: 800 }}>
                        {extractedData.roomType}
                      </div>
                    </div>

                    <div
                      style={{
                        background: '#f8fafc',
                        padding: '0.55rem 0.75rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      <div style={{ fontSize: '0.66rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                        BUDGET
                      </div>
                      <div style={{ fontSize: '0.88rem', color: '#16a34a', fontWeight: 800 }}>
                        ≤ ₹{extractedData.budget}
                      </div>
                    </div>

                    <div
                      style={{
                        background: '#f8fafc',
                        padding: '0.55rem 0.75rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      <div style={{ fontSize: '0.66rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                        FOOD
                      </div>
                      <div style={{ fontSize: '0.88rem', color: '#0f172a', fontWeight: 800 }}>
                        {extractedData.food}
                      </div>
                    </div>

                    <div
                      style={{
                        background: '#f8fafc',
                        padding: '0.55rem 0.75rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      <div style={{ fontSize: '0.66rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                        WI-FI
                      </div>
                      <div style={{ fontSize: '0.88rem', color: '#0f172a', fontWeight: 800 }}>
                        {extractedData.wifi}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Link to AI Assistant Modal or Custom Building Creator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              {onOpenAssistant && (
                <button
                  type="button"
                  onClick={() => onOpenAssistant(requirements)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    background: 'none',
                    border: 'none',
                    color: '#0284c7',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    padding: 0,
                  }}
                >
                  <Sparkles size={14} /> Open Full AI Relocation Assistant Dialogue →
                </button>
              )}

              {onOpenCreateModal && (
                <button
                  type="button"
                  onClick={onOpenCreateModal}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    background: 'none',
                    border: 'none',
                    color: '#b45309',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    padding: 0,
                  }}
                >
                  <Plus size={14} /> List Any Building Worldwide →
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Spatial Preview Composition with Mouse Depth (Section 11) */}
          <div
            style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              transform: `translate3d(${mousePos.x * 0.8}px, ${mousePos.y * 0.8}px, 0)`,
              transition: 'transform 0.15s ease-out',
            }}
          >
            {/* Primary Centerpiece: 3D Interactive Media Showcase */}
            <div style={{ width: '100%', maxWidth: '480px', position: 'relative', zIndex: 2 }}>
              <InteractiveIntroHeroCard />
            </div>

            {/* Floating Property Preview Card 1 (Top Left Layer) */}
            <div
              className="glass-card-premium"
              style={{
                position: 'absolute',
                top: '-20px',
                left: '-30px',
                padding: '0.85rem 1.15rem',
                borderRadius: 'var(--radius-lg)',
                border: '1.5px solid rgba(14, 165, 233, 0.4)',
                background: '#ffffff',
                boxShadow: 'var(--shadow-glass-lg)',
                zIndex: 3,
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                maxWidth: '240px',
                transform: `translate3d(${mousePos.x * -1}px, ${mousePos.y * -1}px, 0)`,
                transition: 'transform 0.2s ease-out',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: 'var(--radius-sm)',
                  overflow: 'hidden',
                  flexShrink: 0,
                }}
              >
                <img
                  src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=200&q=80"
                  alt="Sri Sai PG thumbnail"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  Sri Sai Residency
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.15rem' }}>
                  <span className="radar-pulse" style={{ width: '6px', height: '6px' }} />
                  <span style={{ fontSize: '0.7rem', color: '#16a34a', fontWeight: 800 }}>
                    2 ROOMS VACANT
                  </span>
                </div>
                <div style={{ fontSize: '0.74rem', color: '#b45309', fontWeight: 800, marginTop: '0.1rem' }}>
                  From ₹5,500/mo
                </div>
              </div>
            </div>

            {/* Floating Property Preview Card 2 (Bottom Right Layer) */}
            <div
              className="glass-card-premium"
              style={{
                position: 'absolute',
                bottom: '-25px',
                right: '-20px',
                padding: '0.85rem 1.15rem',
                borderRadius: 'var(--radius-lg)',
                border: '1.5px solid rgba(245, 158, 11, 0.4)',
                background: '#ffffff',
                boxShadow: 'var(--shadow-glass-lg)',
                zIndex: 3,
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                maxWidth: '250px',
                transform: `translate3d(${mousePos.x * 1.2}px, ${mousePos.y * 1.2}px, 0)`,
                transition: 'transform 0.2s ease-out',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: 'var(--radius-sm)',
                  overflow: 'hidden',
                  flexShrink: 0,
                }}
              >
                <img
                  src="https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=200&q=80"
                  alt="Lakshmi Nilayam thumbnail"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  Lakshmi Women's PG
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.15rem' }}>
                  <span className="radar-pulse" style={{ width: '6px', height: '6px' }} />
                  <span style={{ fontSize: '0.7rem', color: '#16a34a', fontWeight: 800 }}>
                    4 ROOMS VACANT
                  </span>
                </div>
                <div style={{ fontSize: '0.74rem', color: '#0284c7', fontWeight: 800, marginTop: '0.1rem' }}>
                  From ₹5,200/mo
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Core Metric Highlights Bar */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.25rem',
            maxWidth: '1100px',
            margin: '0 auto',
          }}
        >
          <div
            className="glass-card-premium"
            style={{ padding: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.85rem', background: '#ffffff', border: '1px solid #e2e8f0' }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: 'var(--radius-md)',
                background: '#ecfdf5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#16a34a',
                flexShrink: 0,
              }}
            >
              <Building2 size={22} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontFamily: 'var(--font-metrics)', fontSize: '0.96rem', fontWeight: 800, color: '#0f172a' }}>
                Room-Level Status
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Exact vacant unit inspection
              </div>
            </div>
          </div>

          <div
            className="glass-card-premium"
            style={{ padding: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.85rem', background: '#ffffff', border: '1px solid #e2e8f0' }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: 'var(--radius-md)',
                background: '#f0f9ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0284c7',
                flexShrink: 0,
              }}
            >
              <Navigation size={22} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontFamily: 'var(--font-metrics)', fontSize: '0.96rem', fontWeight: 800, color: '#0f172a' }}>
                3D & Street View
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Satellite & room exploration
              </div>
            </div>
          </div>

          <div
            className="glass-card-premium"
            style={{ padding: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.85rem', background: '#ffffff', border: '1px solid #e2e8f0' }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: 'var(--radius-md)',
                background: '#fdf2f8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#db2777',
                flexShrink: 0,
              }}
            >
              <Compass size={22} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontFamily: 'var(--font-metrics)', fontSize: '0.96rem', fontWeight: 800, color: '#0f172a' }}>
                Every Global Place
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Search or create any building
              </div>
            </div>
          </div>

          <div
            className="glass-card-premium"
            style={{ padding: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.85rem', background: '#ffffff', border: '1px solid #e2e8f0' }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: 'var(--radius-md)',
                background: '#fffbeb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#d97706',
                flexShrink: 0,
              }}
            >
              <Sparkles size={22} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontFamily: 'var(--font-metrics)', fontSize: '0.96rem', fontWeight: 800, color: '#0f172a' }}>
                INVENI AI Matching
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Requirement-driven selection
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
