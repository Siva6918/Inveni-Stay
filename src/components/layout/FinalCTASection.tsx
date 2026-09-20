import React from 'react';
import { Compass, Key, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

interface FinalCTASectionProps {
  onSearchClick: () => void;
}

export const FinalCTASection: React.FC<FinalCTASectionProps> = ({ onSearchClick }) => {
  return (
    <section className="section-wrapper" style={{ background: 'var(--canvas-bg-alt)', position: 'relative' }}>
      <div className="container">
        <div
          className="iridescent-card"
          style={{
            maxWidth: '1000px',
            margin: '0 auto',
            padding: 'clamp(2rem, 5vw, 4rem) clamp(1rem, 3vw, 2rem)',
            textAlign: 'center',
            position: 'relative',
            border: '1px solid #cbd5e1',
            background: '#ffffff',
            boxShadow: '0 12px 36px rgba(15, 23, 42, 0.08), 0 0 40px rgba(218, 165, 32, 0.08)',
          }}
        >
          {/* Subtle Glow */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '450px',
              height: '250px',
              background: 'radial-gradient(ellipse at center, rgba(218, 165, 32, 0.1), transparent 70%)',
              filter: 'blur(50px)',
              pointerEvents: 'none',
            }}
          />

          <div
            className="pill-badge pill-badge--verified"
            style={{ marginBottom: '1.25rem', position: 'relative', zIndex: 1 }}
          >
            <Sparkles size={14} />
            <span>Ready for Departure?</span>
          </div>

          <h2
            style={{
              fontFamily: 'var(--font-editorial)',
              fontSize: 'clamp(2.2rem, 4.5vw, 3.6rem)',
              color: 'var(--text-primary)',
              marginBottom: '1rem',
              lineHeight: 1.15,
              position: 'relative',
              zIndex: 1,
            }}
          >
            Where Are You Going Next?
          </h2>

          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: 'clamp(1rem, 1.8vw, 1.15rem)',
              maxWidth: '640px',
              margin: '0 auto 2.5rem',
              lineHeight: 1.6,
              position: 'relative',
              zIndex: 1,
            }}
          >
            Don't leave your accommodation to chance. Join thousands of students and professionals who discover, inspect, and lock their stay before booking their bus tickets.
          </p>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '1rem',
              position: 'relative',
              zIndex: 1,
            }}
          >
            <button
              type="button"
              onClick={onSearchClick}
              className="btn-primary"
              style={{ padding: '0.95rem 2.25rem', fontSize: '1rem' }}
            >
              <Compass size={18} />
              <span>Explore Panyam Stays Now</span>
            </button>

            <a
              href="#room-availability"
              className="btn-secondary"
              style={{ padding: '0.95rem 2rem', fontSize: '0.95rem' }}
            >
              <Key size={18} />
              <span>Inspect Live Room Vacancies</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
