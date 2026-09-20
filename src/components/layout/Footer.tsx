import React from 'react';
import { ShieldCheck, Heart, ArrowUpRight } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer
      style={{
        background: '#ffffff',
        borderTop: '1px solid #e2e8f0',
        padding: '4.5rem 0 2.5rem',
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '2.5rem',
            marginBottom: '3.5rem',
          }}
        >
          {/* Col 1: Brand & Tagline */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <img
                src="/Logo.png"
                alt="Inveni Stay Logo"
                style={{ width: '36px', height: '36px', objectFit: 'contain' }}
              />
              <span
                style={{
                  fontFamily: 'var(--font-fascinate)',
                  fontSize: '1.5rem',
                  fontWeight: 400,
                  color: '#0f172a',
                  letterSpacing: '0.06em',
                }}
              >
                Inveni <span style={{ color: '#0284c7' }}>Stay</span>
              </span>
            </div>

            <p
              style={{
                fontFamily: 'var(--font-niconne)',
                fontSize: '1.35rem',
                color: '#0284c7',
                marginBottom: '0.75rem',
                lineHeight: 1.2,
              }}
            >
              "Find your place before you arrive."
            </p>

            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              The location-first remote discovery and room-level reservation platform for students and relocating professionals across Bharat.
            </p>
          </div>

          {/* Col 2: Navigation Links */}
          <div>
            <div
              style={{
                fontFamily: 'var(--font-metrics)',
                fontSize: '0.85rem',
                textTransform: 'uppercase',
                color: '#0f172a',
                letterSpacing: '0.08em',
                marginBottom: '1.25rem',
                fontWeight: 800,
              }}
            >
              Product Navigation
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.88rem' }}>
              <a href="#" style={{ color: 'var(--text-secondary)', transition: 'color var(--transition-fast)' }} onMouseEnter={(e) => (e.currentTarget.style.color = '#0284c7')} onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}>
                Home & Relocation Search
              </a>
              <a href="#how-it-works" style={{ color: 'var(--text-secondary)', transition: 'color var(--transition-fast)' }} onMouseEnter={(e) => (e.currentTarget.style.color = '#0284c7')} onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}>
                How Inveni Stay Works
              </a>
              <a href="#remote-exploration" style={{ color: 'var(--text-secondary)', transition: 'color var(--transition-fast)' }} onMouseEnter={(e) => (e.currentTarget.style.color = '#0284c7')} onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}>
                3D Room & Street View
              </a>
              <a href="#room-availability" style={{ color: 'var(--text-secondary)', transition: 'color var(--transition-fast)' }} onMouseEnter={(e) => (e.currentTarget.style.color = '#0284c7')} onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}>
                Live Room Availability Matrix
              </a>
              <a href="#trust" style={{ color: 'var(--text-secondary)', transition: 'color var(--transition-fast)' }} onMouseEnter={(e) => (e.currentTarget.style.color = '#0284c7')} onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}>
                Trust & Verified Standard
              </a>
            </div>
          </div>

          {/* Col 3: Cloud & Platform Provenance */}
          <div>
            <div
              style={{
                fontFamily: 'var(--font-metrics)',
                fontSize: '0.85rem',
                textTransform: 'uppercase',
                color: '#0f172a',
                letterSpacing: '0.08em',
                marginBottom: '1.25rem',
                fontWeight: 800,
              }}
            >
              Cloud & AI Platform
            </div>

            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1rem' }}>
              Engineered with serverless AWS Cloud architecture: API Gateway, AWS Lambda, Amazon DynamoDB Single-Table, and Amazon Cognito.
            </p>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.35rem 0.75rem',
                background: '#fffbeb',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.78rem',
                color: '#b45309',
                fontFamily: 'var(--font-metrics)',
                textTransform: 'uppercase',
                fontWeight: 700,
              }}
            >
              <ShieldCheck size={14} />
              <span>Verified Stays Platform</span>
            </div>
          </div>
        </div>

        {/* Bottom Disclaimer & Copyright */}
        <div
          style={{
            borderTop: '1px solid #e2e8f0',
            paddingTop: '1.5rem',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            fontSize: '0.82rem',
            color: 'var(--text-muted)',
          }}
        >
          <div>
            © 2026 Inveni Stay. Bright light-first property platform. All prototype listings shown with verified demo data for the Kadapa → Panyam corridor.
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span>Engineered with passion for Bharat Builds 2026</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
