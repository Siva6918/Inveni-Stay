import React from 'react';
import { Sparkles, Compass, Layers, CheckCircle2, ArrowRight } from 'lucide-react';

export const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'TELL US',
      tagline: 'Your Needs & Timeline',
      desc: 'State your destination city, budget, food preference, and move-in date via natural language AI or structured filters.',
      icon: <Sparkles size={24} color="var(--c-goldenrod)" />,
      badgeColor: 'var(--c-goldenrod)',
    },
    {
      num: '02',
      title: 'DISCOVER',
      tagline: 'Intelligent Matching',
      desc: 'Inveni AI filters verified residences with live vacant room counts, pricing transparency, and zero hidden brokerage.',
      icon: <Compass size={24} color="var(--c-aqua)" />,
      badgeColor: 'var(--c-aqua)',
    },
    {
      num: '03',
      title: 'EXPLORE',
      tagline: 'Spatial 3D & Street View',
      desc: 'Inspect your exact room in 3D, walk the corridor, review natural lighting, and verify neighborhood street elevation.',
      icon: <Layers size={24} color="var(--c-lawn-green)" />,
      badgeColor: 'var(--c-lawn-green)',
    },
    {
      num: '04',
      title: 'RESERVE',
      tagline: 'Direct Host Confirmation',
      desc: 'Lock your specific vacant room before traveling. Host reviews and confirms your stay with a digital timeline.',
      icon: <CheckCircle2 size={24} color="var(--c-yellow)" />,
      badgeColor: 'var(--c-yellow)',
    },
  ];

  return (
    <section id="how-it-works" className="section-wrapper" style={{ position: 'relative', overflow: 'hidden' }}>
      <div className="container">
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 4rem' }}>
          <div
            className="metaverse-hud"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1rem',
            }}
          >
            <Compass size={15} color="var(--c-aqua)" />
            <span>[SPATIAL RELOCATION SEQUENCE]</span>
          </div>

          <h2
            style={{
              fontFamily: 'var(--font-headline)',
              fontSize: 'clamp(2.2rem, 4vw, 3.2rem)',
              color: 'var(--text-primary)',
              marginBottom: '1rem',
              lineHeight: 1.15,
              textTransform: 'uppercase',
              letterSpacing: '0.02em',
            }}
          >
            How Inveni Stay Works
          </h2>

          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.6 }}>
            A four-step digital journey designed to explore your stay before you ever set foot in the city.
          </p>
        </div>

        {/* Steps Grid with Connected Visual Progression Line */}
        <div style={{ position: 'relative' }}>
          {/* Connected Iridescent Visual Line (Desktop) */}
          <div
            className="hidden-mobile"
            style={{
              position: 'absolute',
              top: '48px',
              left: '8%',
              right: '8%',
              height: '3px',
              background: 'linear-gradient(90deg, var(--c-goldenrod) 0%, var(--c-aqua) 33%, var(--c-lawn-green) 66%, var(--c-yellow) 100%)',
              zIndex: 0,
              opacity: 0.65,
              filter: 'drop-shadow(0 0 8px rgba(0, 242, 254, 0.4))',
            }}
          />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1.75rem',
              position: 'relative',
              zIndex: 1,
            }}
          >
            {steps.map((step, idx) => (
              <div
                key={step.num}
                className="glass-card-premium"
                style={{
                  padding: '2.25rem 1.65rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative',
                  background: '#ffffff',
                  borderRadius: 'var(--radius-xl)',
                  border: '1.5px solid #e2e8f0',
                  boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.05)',
                  transition: 'transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease',
                  cursor: 'default',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-6px)';
                  e.currentTarget.style.borderColor = step.badgeColor;
                  e.currentTarget.style.boxShadow = `0 16px 36px rgba(15, 23, 42, 0.1), 0 0 24px ${step.badgeColor}22`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.boxShadow = '0 4px 20px -2px rgba(15, 23, 42, 0.05)';
                }}
              >
                {/* Step Number + Icon Badge */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1.5rem',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-headline)',
                      fontSize: '2.4rem',
                      fontWeight: 900,
                      color: step.badgeColor,
                      lineHeight: 1,
                      letterSpacing: '0.04em',
                    }}
                  >
                    {step.num}
                  </span>

                  <div
                    style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: 'var(--radius-lg)',
                      background: '#f8fafc',
                      border: `1.5px solid ${step.badgeColor}44`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: `0 4px 14px ${step.badgeColor}18`,
                    }}
                  >
                    {step.icon}
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      fontFamily: 'var(--font-metrics)',
                      fontSize: '0.78rem',
                      color: step.badgeColor,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      fontWeight: 800,
                      marginBottom: '0.4rem',
                    }}
                  >
                    {step.tagline}
                  </div>

                  <h3
                    style={{
                      fontFamily: 'var(--font-headline)',
                      fontSize: '1.45rem',
                      fontWeight: 800,
                      color: 'var(--text-primary)',
                      marginBottom: '0.75rem',
                      letterSpacing: '0.02em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {step.title}
                  </h3>

                  <p
                    style={{
                      fontFamily: 'var(--font-ui)',
                      fontSize: '0.9rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.6,
                      margin: 0,
                    }}
                  >
                    {step.desc}
                  </p>
                </div>

                {/* Progress Arrow indicator */}
                {idx < steps.length - 1 && (
                  <div
                    style={{
                      marginTop: '1.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      color: 'var(--text-muted)',
                      fontSize: '0.75rem',
                      fontFamily: 'var(--font-metrics)',
                      textTransform: 'uppercase',
                      fontWeight: 700,
                    }}
                  >
                    <span>Proceed to 0{idx + 2}</span>
                    <ArrowRight size={14} color={step.badgeColor} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
