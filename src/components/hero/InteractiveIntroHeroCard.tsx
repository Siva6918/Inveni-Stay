import React, { useRef, useState } from 'react';
import { Compass, Volume2, VolumeX, Sparkles, RotateCcw } from 'lucide-react';

export const InteractiveIntroHeroCard: React.FC = () => {
  const cardRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [tilt, setTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [glare, setGlare] = useState<{ x: number; y: number; opacity: number }>({ x: 50, y: 50, opacity: 0 });
  const [isInteracted, setIsInteracted] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(true);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Calculate tilt angles (-10 to +10 deg)
    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;

    setTilt({ x: rotateX, y: rotateY });
    setGlare({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.2,
    });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setGlare((prev) => ({ ...prev, opacity: 0 }));
  };

  const handleClick = () => {
    setIsInteracted((prev) => !prev);
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
      }
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const resetRotation = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTilt({ x: 0, y: 0 });
    setIsInteracted(false);
  };

  return (
    <div
      style={{
        perspective: '1200px',
        width: '100%',
        maxWidth: '520px',
        margin: '0 auto',
      }}
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        style={{
          position: 'relative',
          borderRadius: '24px',
          background: '#ffffff',
          boxShadow: isInteracted
            ? '0 20px 48px rgba(15, 23, 42, 0.12), 0 0 0 2px rgba(14, 165, 233, 0.4)'
            : '0 12px 32px rgba(15, 23, 42, 0.08), 0 0 0 1px rgba(226, 232, 240, 0.9)',
          padding: '0.85rem',
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(${isInteracted ? '1.03, 1.03, 1.03' : '1, 1, 1'})`,
          transition: isInteracted
            ? 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.35s ease'
            : 'transform 0.15s ease-out, box-shadow 0.25s ease',
          transformStyle: 'preserve-3d',
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        {/* Iridescent Light Sheen Layer */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '22px',
            background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255, 255, 255, ${glare.opacity}) 0%, rgba(14, 165, 233, ${glare.opacity * 0.4}) 35%, transparent 70%)`,
            pointerEvents: 'none',
            zIndex: 10,
            mixBlendMode: 'overlay',
            transition: 'background 0.05s ease',
          }}
        />

        {/* Video Screen Well */}
        <div
          style={{
            position: 'relative',
            borderRadius: '18px',
            overflow: 'hidden',
            background: '#f1f5f9',
            border: '1px solid #e2e8f0',
            boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.05)',
            aspectRatio: '16/10',
          }}
        >
          {/* Continuous Looping Intro Video */}
          <video
            ref={videoRef}
            src="/Intro.mp4"
            autoPlay
            loop
            muted={isMuted}
            playsInline
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
              filter: 'contrast(1.02) saturate(1.05)',
            }}
          />

          {/* Top HUD Badges */}
          <div
            style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              right: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              zIndex: 5,
              pointerEvents: 'none',
            }}
          >
            <div
              style={{
                pointerEvents: 'auto',
                background: 'rgba(255, 255, 255, 0.94)',
                backdropFilter: 'blur(12px)',
                borderRadius: 'var(--radius-full)',
                padding: '0.35rem 0.85rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                border: '1px solid rgba(14, 165, 233, 0.4)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
              }}
            >
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#16a34a',
                  boxShadow: '0 0 6px #16a34a',
                  animation: 'pulse 1.6s infinite',
                }}
              />
              <span
                style={{
                  fontSize: '0.72rem',
                  fontFamily: 'var(--font-metrics)',
                  fontWeight: 800,
                  color: '#0f172a',
                  letterSpacing: '0.04em',
                }}
              >
                INVENI SPATIAL INTRO
              </span>
            </div>

            <div style={{ display: 'flex', gap: '0.4rem', pointerEvents: 'auto' }}>
              <button
                type="button"
                onClick={toggleMute}
                style={{
                  background: 'rgba(255, 255, 255, 0.94)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid #cbd5e1',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0f172a',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
                }}
                title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
              >
                {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
              </button>

              <button
                type="button"
                onClick={resetRotation}
                style={{
                  background: 'rgba(255, 255, 255, 0.94)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid #cbd5e1',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0f172a',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
                }}
                title="Reset 3D tilt"
              >
                <RotateCcw size={14} />
              </button>
            </div>
          </div>

          {/* Bottom Interactive HUD Overlay */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'linear-gradient(to top, rgba(15, 23, 42, 0.8) 0%, rgba(15, 23, 42, 0.25) 70%, transparent 100%)',
              padding: '1.25rem 1rem 0.85rem',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              zIndex: 5,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: '0.88rem',
                  fontWeight: 800,
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  textShadow: '0 1px 4px rgba(0,0,0,0.6)',
                }}
              >
                <Compass size={15} color="#38bdf8" />
                <span>Remote Relocation Engine</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>
                Continuous loop • Move cursor to tilt in 3D
              </div>
            </div>

            <div
              style={{
                background: 'rgba(255, 255, 255, 0.25)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                padding: '0.25rem 0.65rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.68rem',
                fontWeight: 800,
                color: '#ffffff',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              3D GYRO ACTIVE
            </div>
          </div>
        </div>

        {/* Card Sub-Bar (Clean Light Details) */}
        <div
          style={{
            marginTop: '0.75rem',
            padding: '0.35rem 0.5rem 0.15rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.78rem',
            color: '#64748b',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <Sparkles size={14} color="#d97706" />
            <span style={{ fontWeight: 700, color: '#0f172a' }}>
              Interactive Discovery Intro
            </span>
          </div>
          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
            Click card to {isInteracted ? 'recenter' : 'interact'}
          </span>
        </div>
      </div>
    </div>
  );
};
