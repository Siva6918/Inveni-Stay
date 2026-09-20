import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, RotateCcw, Maximize, Compass, Eye, CheckCircle2 } from 'lucide-react';

export const InteractiveVideoSection: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(10.01);
  const [activeMilestone, setActiveMilestone] = useState(0);

  const milestones = [
    {
      time: 0.0,
      label: 'Macro Satellite',
      badge: '01 • Overview',
      title: 'Satellite Survey: Kadapa-Panyam Corridor',
      desc: 'High-altitude geographic radar scan targeting the Panyam educational cluster and surrounding road networks.',
    },
    {
      time: 2.5,
      label: 'Drone Descent',
      badge: '02 • Neighborhood',
      title: 'Descent over Town & Access Roads',
      desc: 'Aerial approach through town streets and residential tree lines directly leading to the property entrance.',
    },
    {
      time: 4.8,
      label: 'Building Facade',
      badge: '03 • Exterior',
      title: 'Sri Sai PG 3-Floor Elevation',
      desc: 'Front elevation inspection showing room windows with live green status indicators for available units.',
    },
    {
      time: 6.5,
      label: 'Floor Corridor',
      badge: '04 • Interior',
      title: 'Ground-Floor Hallway Walkthrough',
      desc: 'Walking past individual room doors with hardware status indicator LEDs (Green = Ready for Move-In).',
    },
    {
      time: 8.2,
      label: 'Room 101 Deep-Dive',
      badge: '05 • Unit Level',
      title: 'Direct Walk-In to Room 101',
      desc: 'Interior inspection showing natural window lighting, study desk, wardrobe, clean single bed, and attached bathroom.',
    },
  ];

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleSeek = (time: number, index: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = time;
    setCurrentTime(time);
    setActiveMilestone(index);
    if (!isPlaying) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleReplay = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = 0;
    videoRef.current.play();
    setIsPlaying(true);
    setActiveMilestone(0);
  };

  const handleFullscreen = () => {
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    setCurrentTime(current);

    // Update active milestone based on time
    if (current >= 8.0) setActiveMilestone(4);
    else if (current >= 6.0) setActiveMilestone(3);
    else if (current >= 4.0) setActiveMilestone(2);
    else if (current >= 2.0) setActiveMilestone(1);
    else setActiveMilestone(0);
  };

  return (
    <section id="interactive-preview" className="section-wrapper" style={{ background: 'var(--canvas-bg)' }}>
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: '820px', margin: '0 auto 3.5rem' }}>
          <div className="pill-badge pill-badge--aqua" style={{ marginBottom: '1rem' }}>
            <Eye size={14} />
            <span>Interactive Spatial Inspection</span>
          </div>

          <h2
            style={{
              fontFamily: 'var(--font-editorial)',
              fontSize: 'clamp(2rem, 3.8vw, 3rem)',
              color: 'var(--text-primary)',
              marginBottom: '1rem',
              lineHeight: 1.2,
            }}
          >
            See It Before You Stay.
          </h2>

          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.6 }}>
            Distance shouldn't stop you from knowing exactly where you will live.
            Scrub through our real-world spatial flythrough from regional satellite view down into Room 101.
          </p>
        </div>

        {/* Interactive Video Container */}
        <div
          className="iridescent-card"
          style={{
            maxWidth: '1040px',
            margin: '0 auto',
            padding: '1.25rem',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.08)',
          }}
        >
          {/* Milestone Quick-Jump Navigation Tabs */}
          <div
            style={{
              display: 'flex',
              overflowX: 'auto',
              gap: '0.65rem',
              paddingBottom: '1rem',
              marginBottom: '1rem',
              borderBottom: '1px solid var(--border-subtle)',
            }}
          >
            {milestones.map((m, idx) => (
              <button
                key={m.label}
                type="button"
                onClick={() => handleSeek(m.time, idx)}
                style={{
                  flex: '0 0 auto',
                  padding: '0.5rem 0.95rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8rem',
                  fontFamily: 'var(--font-metrics)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  background: activeMilestone === idx ? '#e0f2fe' : 'var(--surface-1)',
                  color: activeMilestone === idx ? '#0284c7' : 'var(--text-secondary)',
                  border: activeMilestone === idx ? '1px solid #0284c7' : '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <span>{m.badge}</span>
                <span>•</span>
                <span>{m.label}</span>
              </button>
            ))}
          </div>

          {/* Main Video Viewport */}
          <div
            style={{
              position: 'relative',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              backgroundColor: '#f1f5f9',
              aspectRatio: '16 / 9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <video
              ref={videoRef}
              src="/Intro.mp4"
              playsInline
              muted={isMuted}
              onTimeUpdate={handleTimeUpdate}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onLoadedMetadata={() => {
                if (videoRef.current) setDuration(videoRef.current.duration);
              }}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />

            {/* In-Video Live Context Overlay (Bottom Left) */}
            <div
              style={{
                position: 'absolute',
                bottom: '4.5rem',
                left: '1.25rem',
                maxWidth: '480px',
                padding: '0.85rem 1.15rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(8, 12, 17, 0.9)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
                pointerEvents: 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <span className="radar-pulse" />
                <span
                  style={{
                    fontFamily: 'var(--font-metrics)',
                    fontSize: '0.75rem',
                    color: '#38bdf8',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  {milestones[activeMilestone].badge}
                </span>
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  color: '#ffffff',
                  marginBottom: '0.2rem',
                }}
              >
                {milestones[activeMilestone].title}
              </div>
              <p style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.4, margin: 0 }}>
                {milestones[activeMilestone].desc}
              </p>
            </div>

            {/* Play Overlay Button (when paused) */}
            {!isPlaying && (
              <button
                type="button"
                onClick={togglePlay}
                style={{
                  position: 'absolute',
                  width: '72px',
                  height: '72px',
                  borderRadius: '50%',
                  background: 'var(--grad-gold-bronze)',
                  border: '2px solid #ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#070a0e',
                  boxShadow: '0 8px 30px rgba(218, 165, 32, 0.6)',
                  cursor: 'pointer',
                  transition: 'transform var(--transition-fast)',
                }}
                aria-label="Play spatial walkthrough video"
              >
                <Play size={30} fill="#070a0e" style={{ marginLeft: '4px' }} />
              </button>
            )}

            {/* Bottom Floating Control Bar */}
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: '0.75rem 1.25rem',
                background: 'linear-gradient(180deg, transparent 0%, rgba(8, 12, 17, 0.95) 100%)',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
              }}
            >
              <button
                type="button"
                onClick={togglePlay}
                style={{ color: '#ffffff', display: 'flex', alignItems: 'center' }}
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
              </button>

              <button
                type="button"
                onClick={handleReplay}
                style={{ color: '#e2e8f0', display: 'flex', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer' }}
                aria-label="Replay video"
              >
                <RotateCcw size={18} />
              </button>

              {/* Progress Track */}
              <div
                style={{
                  flex: 1,
                  position: 'relative',
                  height: '6px',
                  background: 'rgba(255, 255, 255, 0.25)',
                  borderRadius: 'var(--radius-full)',
                  cursor: 'pointer',
                  overflow: 'hidden',
                }}
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const pos = (e.clientX - rect.left) / rect.width;
                  if (videoRef.current) {
                    videoRef.current.currentTime = pos * duration;
                  }
                }}
              >
                <div
                  style={{
                    width: `${(currentTime / duration) * 100}%`,
                    height: '100%',
                    background: '#38bdf8',
                    borderRadius: 'var(--radius-full)',
                  }}
                />
              </div>

              {/* Time Display */}
              <span style={{ fontFamily: 'var(--font-metrics)', fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 600 }}>
                {currentTime.toFixed(1)}s / {duration.toFixed(1)}s
              </span>

              {/* Mute Toggle */}
              <button
                type="button"
                onClick={toggleMute}
                style={{ color: '#e2e8f0', display: 'flex', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer' }}
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>

              {/* Fullscreen */}
              <button
                type="button"
                onClick={handleFullscreen}
                style={{ color: '#e2e8f0', display: 'flex', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer' }}
                aria-label="Fullscreen"
              >
                <Maximize size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
