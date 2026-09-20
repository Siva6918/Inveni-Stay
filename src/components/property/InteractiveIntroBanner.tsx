import React, { useState, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Sparkles, Compass, Eye, Maximize2, Minimize2, Radio, Activity } from 'lucide-react';

interface InteractiveIntroBannerProps {
  propertyName: string;
}

export const InteractiveIntroBanner: React.FC<InteractiveIntroBannerProps> = ({ propertyName }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [tilt, setTilt] = useState<{ x: number; y: number; glareX: number; glareY: number }>({
    x: 0,
    y: 0,
    glareX: 50,
    glareY: 50,
  });
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [clickPulse, setClickPulse] = useState<boolean>(false);

  // Mouse move 3D perspective calculation with separate parallax depth
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Smooth responsive tilt
    const rotateY = ((x - centerX) / centerX) * 12;
    const rotateX = -((y - centerY) / centerY) * 12;

    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;

    setTilt({ x: rotateX, y: rotateY, glareX, glareY });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0, glareX: 50, glareY: 50 });
  };

  // Click interaction: animate, toggle expanded cinematic mode and sound
  const handleClick = () => {
    setClickPulse(true);
    setTimeout(() => setClickPulse(false), 450);

    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      }
      // Toggle sound
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }

    setIsExpanded(!isExpanded);
  };

  const togglePlayState = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  return (
    <div
      style={{
        marginBottom: '2.75rem',
        width: '100%',
        perspective: '1200px',
      }}
    >
      {/* Neomorphic Outer Housing Frame */}
      <div
        style={{
          background: 'var(--surface-neomorph)',
          borderRadius: 'var(--radius-xl)',
          padding: '0.85rem',
          boxShadow: 'var(--shadow-neomorph-lg)',
          border: '1.5px solid rgba(255, 255, 255, 0.9)',
          position: 'relative',
        }}
      >
        {/* Top Metaverse Telemetry Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.4rem 0.85rem 0.75rem 0.85rem',
            fontSize: '0.78rem',
            color: 'var(--text-secondary)',
            fontWeight: 700,
            letterSpacing: '0.05em',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                color: 'var(--c-sky-blue)',
                fontWeight: 800,
              }}
            >
              <Radio size={14} className="radar-pulse" />
              [METAVERSE SPATIAL PORTAL]
            </span>
            <span style={{ color: 'var(--text-muted)' }}>•</span>
            <span>CAM_01: SPATIAL DEMO WALKTHROUGH</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                color: 'var(--c-lime)',
                fontWeight: 800,
              }}
            >
              <Activity size={13} /> 60 FPS SYNC
            </span>
            <span
              style={{
                background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.15) 0%, rgba(236, 72, 153, 0.15) 100%)',
                color: 'var(--c-sky-blue)',
                padding: '0.2rem 0.6rem',
                borderRadius: 'var(--radius-full)',
                border: '1px solid rgba(14, 165, 233, 0.3)',
                fontSize: '0.72rem',
              }}
            >
              3D PERSPECTIVE ACTIVE
            </span>
          </div>
        </div>

        {/* Interactive 3D Video Viewport */}
        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
          style={{
            position: 'relative',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            cursor: 'pointer',
            background: '#f1f5f9',
            border: isHovered
              ? '2px solid var(--c-sky-blue)'
              : '1.5px solid rgba(14, 165, 233, 0.35)',
            boxShadow: isHovered
              ? '0 0 30px rgba(14, 165, 233, 0.4), 0 20px 40px rgba(0, 0, 0, 0.18)'
              : 'inset 2px 2px 6px rgba(0, 0, 0, 0.25)',
            transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(${
              clickPulse ? 1.04 : isHovered ? 1.015 : 1
            }, ${clickPulse ? 1.04 : isHovered ? 1.015 : 1}, 1)`,
            transition: isHovered
              ? 'transform 0.08s ease-out, border-color 0.2s ease, box-shadow 0.2s ease'
              : 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s ease, box-shadow 0.3s ease',
            height: isExpanded ? '540px' : '390px',
            maxHeight: '620px',
          }}
        >
          {/* Continuous Looping Intro Video */}
          <video
            ref={videoRef}
            src="/intro.mp4"
            autoPlay
            loop
            muted={isMuted}
            playsInline
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
              filter: 'contrast(1.08) saturate(1.2)',
            }}
          />

          {/* Metaverse Holographic Cyber Grid Overlay */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage:
                'linear-gradient(rgba(14, 165, 233, 0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(14, 165, 233, 0.06) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
              pointerEvents: 'none',
              opacity: isHovered ? 0.85 : 0.4,
              transition: 'opacity 0.3s ease',
            }}
          />

          {/* Holographic Specular Glare following Mouse Movement */}
          {isHovered && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: `radial-gradient(circle at ${tilt.glareX}% ${tilt.glareY}%, rgba(255, 255, 255, 0.5) 0%, rgba(14, 165, 233, 0.2) 35%, transparent 65%)`,
                pointerEvents: 'none',
                mixBlendMode: 'overlay',
              }}
            />
          )}

          {/* Metaverse Cyber Corner Reticles */}
          <div
            style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              width: '24px',
              height: '24px',
              borderTop: '2.5px solid var(--c-sky-blue)',
              borderLeft: '2.5px solid var(--c-sky-blue)',
              pointerEvents: 'none',
              zIndex: 5,
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              width: '24px',
              height: '24px',
              borderTop: '2.5px solid var(--c-pink)',
              borderRight: '2.5px solid var(--c-pink)',
              pointerEvents: 'none',
              zIndex: 5,
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '12px',
              left: '12px',
              width: '24px',
              height: '24px',
              borderBottom: '2.5px solid var(--c-lime)',
              borderLeft: '2.5px solid var(--c-lime)',
              pointerEvents: 'none',
              zIndex: 5,
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '12px',
              right: '12px',
              width: '24px',
              height: '24px',
              borderBottom: '2.5px solid var(--c-gold)',
              borderRight: '2.5px solid var(--c-gold)',
              pointerEvents: 'none',
              zIndex: 5,
            }}
          />

          {/* Top Floating Badges (Metaverse HUD) with Separate Parallax Offset */}
          <div
            style={{
              position: 'absolute',
              top: '1.25rem',
              left: '1.25rem',
              right: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              zIndex: 10,
              transform: `translateX(${-tilt.y * 0.8}px) translateY(${-tilt.x * 0.8}px)`,
              transition: 'transform 0.1s ease-out',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                background: 'rgba(232, 238, 247, 0.92)',
                backdropFilter: 'blur(12px)',
                color: '#0f172a',
                padding: '0.45rem 1rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.8rem',
                fontWeight: 800,
                boxShadow: '0 0 15px rgba(14, 165, 233, 0.3), 4px 4px 10px rgba(0, 0, 0, 0.15)',
                border: '1.5px solid rgba(14, 165, 233, 0.45)',
              }}
            >
              <Sparkles size={16} color="var(--c-sky-blue)" />
              <span>Continuous Interactive Loop • Move Mouse to Tilt</span>
            </div>

            {/* Tactile Neomorphic Sound & Playback Controls */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={toggleSound}
                title={isMuted ? 'Click to unmute sound' : 'Click to mute'}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  background: isMuted ? 'rgba(232, 238, 247, 0.92)' : 'rgba(16, 185, 129, 0.2)',
                  color: isMuted ? 'var(--c-orange)' : 'var(--c-green)',
                  backdropFilter: 'blur(12px)',
                  padding: '0.4rem 0.85rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  boxShadow: '4px 4px 10px rgba(0, 0, 0, 0.12), -2px -2px 6px rgba(255, 255, 255, 0.8)',
                  border: isMuted ? '1.5px solid rgba(249, 115, 22, 0.4)' : '1.5px solid rgba(16, 185, 129, 0.5)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
                <span>{isMuted ? 'Muted (Click to Hear)' : 'Audio Active'}</span>
              </button>

              <button
                onClick={togglePlayState}
                title={isPlaying ? 'Pause video' : 'Play video'}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'rgba(232, 238, 247, 0.92)',
                  color: '#0f172a',
                  border: '1.5px solid rgba(14, 165, 233, 0.45)',
                  boxShadow: '4px 4px 8px rgba(0, 0, 0, 0.15)',
                  cursor: 'pointer',
                }}
              >
                {isPlaying ? <Pause size={14} /> : <Play size={14} />}
              </button>
            </div>
          </div>

          {/* Bottom Interactive HUD Overlay Bar */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background:
                'linear-gradient(to top, rgba(15, 23, 42, 0.92) 0%, rgba(15, 23, 42, 0.6) 60%, transparent 100%)',
              padding: '1.5rem',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              zIndex: 10,
              transform: `translateX(${tilt.y * 0.5}px) translateY(${tilt.x * 0.5}px)`,
              transition: 'transform 0.1s ease-out',
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-headline)',
                  fontSize: '1.35rem',
                  fontWeight: 800,
                  color: '#ffffff',
                  margin: '0 0 0.25rem 0',
                  textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <span>{propertyName}</span>
                <span
                  style={{
                    background: 'var(--grad-metaverse)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontSize: '0.85rem',
                    fontWeight: 800,
                  }}
                >
                  — SPATIAL TWIN
                </span>
              </div>
              <p
                style={{
                  color: '#cbd5e1',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  margin: 0,
                  textShadow: '0 1px 4px rgba(0, 0, 0, 0.6)',
                }}
              >
                Move mouse across frame to pivot 3D holographic camera angle • Click video to{' '}
                {isExpanded ? 'shrink' : 'expand'} & toggle sound
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <span
                style={{
                  background: 'linear-gradient(135deg, var(--c-sky-blue) 0%, var(--c-pink) 100%)',
                  color: '#ffffff',
                  padding: '0.45rem 1.1rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  boxShadow: '0 0 16px rgba(14, 165, 233, 0.5)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                }}
              >
                {isExpanded ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
                {isExpanded ? 'Normal View' : 'Cinematic Expand'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

