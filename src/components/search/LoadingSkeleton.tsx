import React from 'react';

export const LoadingSkeleton: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="iridescent-card"
          style={{
            padding: '1.75rem',
            border: '1px solid var(--border-subtle)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.75rem',
            }}
          >
            {/* Shimmer Image Box */}
            <div
              style={{
                borderRadius: 'var(--radius-md)',
                aspectRatio: '16 / 10',
                background: 'rgba(255, 255, 255, 0.05)',
                animation: 'skeleton-shimmer 1.5s infinite linear',
              }}
            />

            {/* Shimmer Text Lines */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div
                style={{
                  width: '35%',
                  height: '16px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: 'var(--radius-xs)',
                }}
              />
              <div
                style={{
                  width: '75%',
                  height: '24px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  borderRadius: 'var(--radius-xs)',
                }}
              />
              <div
                style={{
                  width: '50%',
                  height: '16px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: 'var(--radius-xs)',
                }}
              />
              <div
                style={{
                  marginTop: 'auto',
                  width: '100%',
                  height: '42px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  borderRadius: 'var(--radius-sm)',
                }}
              />
            </div>
          </div>
        </div>
      ))}

      <style>{`
        @keyframes skeleton-shimmer {
          0% { opacity: 0.4; }
          50% { opacity: 0.8; }
          100% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
};
