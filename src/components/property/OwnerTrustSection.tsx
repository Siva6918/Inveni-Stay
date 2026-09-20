import React, { useState } from 'react';
import { PropertyListing } from '../../types';
import { ShieldCheck, UserCheck, Clock, FileCheck, PhoneCall, CheckCircle2, Info, Send } from 'lucide-react';

interface OwnerTrustSectionProps {
  property: PropertyListing;
}

export const OwnerTrustSection: React.FC<OwnerTrustSectionProps> = ({ property }) => {
  const [inquirySent, setInquirySent] = useState(false);
  const [inquiryNote, setInquiryNote] = useState('');

  const handleSendInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    setInquirySent(true);
    setTimeout(() => {
      setInquirySent(false);
      setInquiryNote('');
    }, 4000);
  };

  return (
    <section
      style={{
        marginBottom: '3.5rem',
        padding: '2.5rem',
        background: 'var(--surface-neomorph)',
        color: '#0f172a',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-neomorph-lg)',
        border: '1.5px solid rgba(255, 255, 255, 0.85)',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div className="metaverse-hud" style={{ marginBottom: '0.75rem' }}>
          <ShieldCheck size={15} color="var(--c-sky-blue)" />
          <span>[HOST IDENTITY & ONBOARDING PROOF]</span>
        </div>

        <h2
          style={{
            fontFamily: 'var(--font-headline)',
            fontSize: 'clamp(1.75rem, 3vw, 2.35rem)',
            fontWeight: 800,
            color: '#0f172a',
            textTransform: 'uppercase',
            letterSpacing: '0.02em',
            margin: '0 0 0.5rem 0',
          }}
        >
          Host Accountability & Onboarding Proof
        </h2>

        <p
          style={{
            color: 'var(--text-secondary)',
            fontSize: '0.95rem',
            maxWidth: '750px',
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          When relocating before arrival, knowing who manages the property is essential. Inveni Stay hosts undergo
          identity and premises verification to prevent phantom listings.
        </p>
      </div>

      {/* 2-Column Host Card & Inquiry Box */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 1fr',
          gap: '2rem',
        }}
        className="owner-section-grid"
      >
        {/* Left: Host Credentials */}
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1.25rem',
              marginBottom: '1.5rem',
            }}
          >
            <div
              style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--c-sky-blue) 0%, var(--c-pink) 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.6rem',
                boxShadow: '0 0 20px rgba(14, 165, 233, 0.45)',
                border: '3px solid #ffffff',
                flexShrink: 0,
              }}
            >
              {property.ownerName.charAt(0)}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  {property.ownerName}
                </h3>
                <span
                  style={{
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: 'var(--c-green)',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    padding: '0.2rem 0.6rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                  }}
                >
                  <UserCheck size={13} /> KYC Verified
                </span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.2rem 0 0', fontWeight: 600 }}>
                Property Manager & Host since {property.ownerSinceYear || 2022} • Panyam Resident
              </p>
            </div>
          </div>

          {/* Verification Badges Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.85rem',
              marginBottom: '1.5rem',
            }}
          >
            <div
              style={{
                background: 'var(--surface-neomorph-inset)',
                border: '1px solid rgba(194, 202, 216, 0.35)',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--c-green)', fontWeight: 800, fontSize: '0.88rem' }}>
                <FileCheck size={16} /> Physical Inspection
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.76rem', marginTop: '0.25rem', lineHeight: 1.4 }}>
                Property verified on-site by Inveni regional team (Demo)
              </div>
            </div>

            <div
              style={{
                background: 'var(--surface-neomorph-inset)',
                border: '1px solid rgba(194, 202, 216, 0.35)',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--c-sky-blue)', fontWeight: 800, fontSize: '0.88rem' }}>
                <Clock size={16} /> Response Time
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.76rem', marginTop: '0.25rem', lineHeight: 1.4 }}>
                {property.ownerResponseTime || '< 15 mins average response'}
              </div>
            </div>
          </div>

          {/* Masked Contact Info */}
          <div
            style={{
              background: 'var(--surface-neomorph-inset)',
              padding: '0.9rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              border: '1px solid rgba(194, 202, 216, 0.4)',
            }}
          >
            <span style={{ fontSize: '0.85rem', color: '#334155', fontWeight: 600 }}>
              Host Contact Number: <strong style={{ color: '#0f172a' }}>{property.ownerContactMasked || '+91 98480 •••••'}</strong>
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--c-sky-blue)', fontWeight: 800 }}>
              (Protected Relay)
            </span>
          </div>
        </div>

        {/* Right: Direct Host Inquiry Form (Neomorphic Card) */}
        <div
          style={{
            background: 'var(--surface-neomorph)',
            border: '1px solid rgba(255, 255, 255, 0.9)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.6rem',
            boxShadow: 'var(--shadow-neomorph-sm)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h4
              style={{
                color: '#0f172a',
                fontSize: '1.05rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                marginBottom: '0.5rem',
              }}
            >
              Ask Host a Direct Question
            </h4>
            <p style={{ color: '#475569', fontSize: '0.84rem', lineHeight: 1.5, marginBottom: '1rem' }}>
              Need to check late check-in, bike parking spot, or special meal requirements? Send an authenticated note
              directly to {property.ownerName}.
            </p>

            {inquirySent ? (
              <div
                style={{
                  background: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid #10b981',
                  color: '#065f46',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <CheckCircle2 size={18} color="#10b981" />
                <span>Inquiry dispatched to {property.ownerName}! Host typically responds within 15 mins.</span>
              </div>
            ) : (
              <form onSubmit={handleSendInquiry}>
                <textarea
                  value={inquiryNote}
                  onChange={(e) => setInquiryNote(e.target.value)}
                  placeholder="e.g. I am moving from Kadapa on 25th for college. Is Room 101 available for 6 months?"
                  required
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid rgba(194, 202, 216, 0.5)',
                    fontSize: '0.85rem',
                    fontFamily: 'inherit',
                    marginBottom: '0.85rem',
                    resize: 'none',
                    background: 'var(--surface-neomorph-inset)',
                    boxShadow: 'var(--shadow-neomorph-inset-sm)',
                    color: '#0f172a',
                  }}
                />
                <button
                  type="submit"
                  className="btn-iridescent"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: 800,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                  }}
                >
                  <Send size={16} /> Send Question to Host
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Honest Disclaimer */}
      <div
        style={{
          marginTop: '1.75rem',
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius-md)',
          background: '#f1f5f9',
          border: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          color: '#64748b',
          fontSize: '0.78rem',
        }}
      >
        <Info size={16} color="#00838f" style={{ flexShrink: 0 }} />
        <span>
          <strong>Transparency Notice:</strong> Demonstration host profile for Sri Sai Residency. KYC verification marks
          reflect submitted electricity bill and property tax documentation during platform onboarding.
        </span>
      </div>

      <style>{`
        @media (max-width: 850px) {
          .owner-section-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
};
