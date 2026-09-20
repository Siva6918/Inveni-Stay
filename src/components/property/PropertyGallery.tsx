import React, { useState, useEffect, useCallback } from 'react';
import { PropertyMedia } from '../../types';
import { Maximize2, X, ChevronLeft, ChevronRight, Play, Image as ImageIcon } from 'lucide-react';

interface PropertyGalleryProps {
  media: PropertyMedia[];
  propertyName: string;
}

export const PropertyGallery: React.FC<PropertyGalleryProps> = ({ media, propertyName }) => {
  const [activeLightboxIndex, setActiveLightboxIndex] = useState<number | null>(null);

  // Filter or sort media
  const sortedMedia = [...media].sort((a, b) => a.order - b.order);
  const displayItems = sortedMedia.slice(0, 5);
  const remainingCount = Math.max(0, sortedMedia.length - 5);

  const openLightbox = (index: number) => {
    setActiveLightboxIndex(index);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = useCallback(() => {
    setActiveLightboxIndex(null);
    document.body.style.overflow = 'auto';
  }, []);

  const handlePrev = useCallback(() => {
    if (activeLightboxIndex === null) return;
    setActiveLightboxIndex((prev) => (prev! > 0 ? prev! - 1 : sortedMedia.length - 1));
  }, [activeLightboxIndex, sortedMedia.length]);

  const handleNext = useCallback(() => {
    if (activeLightboxIndex === null) return;
    setActiveLightboxIndex((prev) => (prev! < sortedMedia.length - 1 ? prev! + 1 : 0));
  }, [activeLightboxIndex, sortedMedia.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeLightboxIndex === null) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeLightboxIndex, closeLightbox, handlePrev, handleNext]);

  return (
    <section style={{ marginBottom: '2.5rem' }}>
      {/* 5-Photo Grid Display */}
      <div className="gallery-grid">
        {/* Main hero photo (Left side, takes 2 rows on desktop) */}
        {displayItems.length > 0 && (
          <div
            className="gallery-item-large"
            onClick={() => openLightbox(0)}
            style={{
              position: 'relative',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              cursor: 'pointer',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              background: 'var(--surface-bg)',
            }}
          >
            <img
              src={displayItems[0].url}
              alt={displayItems[0].title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'transform 0.4s ease',
              }}
              className="zoom-hover"
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(15, 23, 42, 0.55) 0%, transparent 50%)',
                display: 'flex',
                alignItems: 'flex-end',
                padding: '1.25rem',
              }}
            >
              <div>
                <span
                  style={{
                    background: 'rgba(50, 205, 50, 0.2)',
                    color: 'var(--c-lawn-green)',
                    border: '1px solid rgba(50, 205, 50, 0.4)',
                    padding: '0.2rem 0.6rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Featured Space
                </span>
                <h4 style={{ color: '#fff', margin: '0.35rem 0 0.15rem', fontSize: '1.1rem' }}>
                  {displayItems[0].title}
                </h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0 }}>
                  {displayItems[0].description}
                </p>
              </div>
            </div>
            <button
              aria-label="Expand image"
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'rgba(255, 255, 255, 0.92)',
                backdropFilter: 'blur(8px)',
                border: '1px solid #cbd5e1',
                color: '#0f172a',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(15, 23, 42, 0.12)',
              }}
            >
              <Maximize2 size={16} />
            </button>
          </div>
        )}

        {/* 4 Supporting Media Cards (2x2 grid on right) */}
        <div className="gallery-subgrid">
          {displayItems.slice(1, 5).map((item, idx) => {
            const actualIndex = idx + 1;
            const isLast = idx === 3 && remainingCount > 0;

            return (
              <div
                key={item.id}
                onClick={() => openLightbox(actualIndex)}
                style={{
                  position: 'relative',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  background: 'var(--surface-bg)',
                  aspectRatio: '16/10',
                }}
              >
                <img
                  src={item.url}
                  alt={item.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.4s ease',
                  }}
                  className="zoom-hover"
                />

                {item.type === 'video' && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '0.5rem',
                      left: '0.5rem',
                      background: 'rgba(238, 130, 238, 0.3)',
                      color: 'var(--c-violet-glow)',
                      border: '1px solid rgba(238, 130, 238, 0.6)',
                      padding: '0.2rem 0.5rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                    }}
                  >
                    <Play size={10} fill="currentColor" /> VIDEO
                  </div>
                )}

                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(15, 23, 42, 0.5) 0%, transparent 60%)',
                    display: 'flex',
                    alignItems: 'flex-end',
                    padding: '0.65rem 0.85rem',
                  }}
                >
                  <span style={{ color: '#fff', fontSize: '0.8rem', fontWeight: 600 }}>
                    {item.title}
                  </span>
                </div>

                {isLast && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'rgba(255, 255, 255, 0.92)',
                      backdropFilter: 'blur(6px)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#0f172a',
                      gap: '0.35rem',
                    }}
                  >
                    <ImageIcon size={22} color="var(--c-goldenrod)" />
                    <span style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>+{remainingCount} more</span>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>View all photos</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Lightbox Modal */}
      {activeLightboxIndex !== null && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 4000,
            background: 'rgba(255, 255, 255, 0.97)',
            backdropFilter: 'blur(16px)',
            display: 'flex',
            flexDirection: 'column',
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Property Media Lightbox"
        >
          {/* Lightbox Header */}
          <div
            style={{
              padding: '1rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid #e2e8f0',
              background: '#ffffff',
            }}
          >
            <div>
              <span style={{ color: '#0284c7', fontSize: '0.8rem', fontWeight: 700 }}>
                {propertyName}
              </span>
              <h3 style={{ color: '#0f172a', margin: '0.1rem 0 0', fontSize: '1.05rem', fontWeight: 800 }}>
                {sortedMedia[activeLightboxIndex].title} ({activeLightboxIndex + 1} of {sortedMedia.length})
              </h3>
            </div>
            <button
              onClick={closeLightbox}
              style={{
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                color: '#0f172a',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              title="Close (Esc)"
              aria-label="Close Lightbox"
            >
              <X size={20} />
            </button>
          </div>

          {/* Lightbox Stage */}
          <div
            style={{
              flex: 1,
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
              overflow: 'hidden',
            }}
          >
            {/* Prev Button */}
            <button
              onClick={handlePrev}
              style={{
                position: 'absolute',
                left: '1.5rem',
                zIndex: 10,
                background: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #cbd5e1',
                color: '#0f172a',
                borderRadius: '50%',
                width: '48px',
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(15, 23, 42, 0.12)',
                transition: 'all 0.2s ease',
              }}
              title="Previous (Left Arrow)"
              aria-label="Previous Media"
            >
              <ChevronLeft size={24} />
            </button>

            {/* Media Item */}
            <div
              style={{
                maxWidth: '90vw',
                maxHeight: '75vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              {sortedMedia[activeLightboxIndex].type === 'video' ? (
                <video
                  src={sortedMedia[activeLightboxIndex].url}
                  controls
                  autoPlay
                  style={{
                    maxWidth: '100%',
                    maxHeight: '70vh',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: '0 20px 40px rgba(15, 23, 42, 0.15)',
                  }}
                />
              ) : (
                <img
                  src={sortedMedia[activeLightboxIndex].url}
                  alt={sortedMedia[activeLightboxIndex].title}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '70vh',
                    objectFit: 'contain',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: '0 20px 40px rgba(15, 23, 42, 0.15)',
                  }}
                />
              )}
              <div
                style={{
                  marginTop: '0.75rem',
                  textAlign: 'center',
                  background: 'rgba(255, 255, 255, 0.95)',
                  padding: '0.4rem 1.25rem',
                  borderRadius: 'var(--radius-pill)',
                  border: '1px solid #cbd5e1',
                  color: '#475569',
                  fontSize: '0.85rem',
                  boxShadow: '0 2px 8px rgba(15, 23, 42, 0.08)',
                }}
              >
                {sortedMedia[activeLightboxIndex].description}
              </div>
            </div>

            {/* Next Button */}
            <button
              onClick={handleNext}
              style={{
                position: 'absolute',
                right: '1.5rem',
                zIndex: 10,
                background: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #cbd5e1',
                color: '#0f172a',
                borderRadius: '50%',
                width: '48px',
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(15, 23, 42, 0.12)',
                transition: 'all 0.2s ease',
              }}
              title="Next (Right Arrow)"
              aria-label="Next Media"
            >
              <ChevronRight size={24} />
            </button>
          </div>

          {/* Thumbnail Strip */}
          <div
            style={{
              padding: '0.75rem 1.5rem',
              background: '#f8fafc',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              gap: '0.5rem',
              overflowX: 'auto',
              justifyContent: 'center',
            }}
          >
            {sortedMedia.map((thumb, tIdx) => (
              <button
                key={thumb.id}
                onClick={() => setActiveLightboxIndex(tIdx)}
                style={{
                  width: '60px',
                  height: '42px',
                  borderRadius: 'var(--radius-sm)',
                  overflow: 'hidden',
                  border:
                    tIdx === activeLightboxIndex
                      ? '2px solid var(--c-lawn-green)'
                      : '1px solid rgba(255, 255, 255, 0.15)',
                  opacity: tIdx === activeLightboxIndex ? 1 : 0.6,
                  cursor: 'pointer',
                  padding: 0,
                  background: 'none',
                  flexShrink: 0,
                }}
              >
                <img
                  src={thumb.thumbnail || thumb.url}
                  alt={thumb.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </button>
            ))}
          </div>
        </div>
      )}

      <style>{`
        .gallery-grid {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 1rem;
          height: 440px;
        }
        .gallery-subgrid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
          height: 100%;
        }
        .zoom-hover:hover {
          transform: scale(1.03);
        }
        @media (max-width: 991px) {
          .gallery-grid {
            grid-template-columns: 1fr;
            height: auto;
          }
          .gallery-item-large {
            height: 280px;
          }
          .gallery-subgrid {
            height: auto;
          }
        }
      `}</style>
    </section>
  );
};
