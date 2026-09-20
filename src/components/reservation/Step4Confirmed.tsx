import React, { useState } from 'react';
import { Reservation } from '../../types';
import {
  CheckCircle2,
  Calendar,
  Building2,
  DoorOpen,
  Share2,
  ExternalLink,
  Compass,
  Copy,
  Check,
  ShieldCheck,
  Receipt,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface Step4ConfirmedProps {
  reservation: Reservation;
  onViewDetails: (reservationId: string) => void;
  onViewMyReservations: () => void;
  onBackToExplore: () => void;
}

export const Step4Confirmed: React.FC<Step4ConfirmedProps> = ({
  reservation,
  onViewDetails,
  onViewMyReservations,
  onBackToExplore,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  const formattedDate = new Date(reservation.moveInDate).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const handleShare = async () => {
    const shareData = {
      title: `Inveni Stay Reservation — ${reservation.id}`,
      text: `I have reserved Room ${reservation.roomNo} at ${reservation.propertyName} in ${reservation.propertyTown} starting ${formattedDate}!`,
      url: window.location.origin + `/reservation/${reservation.id}`,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (e) {
        // user cancelled or share failed
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(
          `${shareData.text} Check details: ${shareData.url}`
        );
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      } catch (e) {
        // ignore
      }
    }
  };

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Metaverse Holographic Celebration Card */}
      <div
        className="neomorph-card"
        style={{
          padding: '3rem 2rem',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          border: '2px solid rgba(16, 185, 129, 0.45)',
          boxShadow: '0 0 30px rgba(16, 185, 129, 0.2), var(--shadow-neomorph)',
        }}
      >
        {/* Glowing Success Ring */}
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '2.5px solid var(--c-green)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--c-green)',
            margin: '0 auto 1.5rem auto',
            boxShadow: '0 0 25px rgba(16, 185, 129, 0.4)',
          }}
        >
          <CheckCircle2 size={44} />
        </div>

        <div className="badge-metaverse" style={{ fontSize: '0.78rem', marginBottom: '0.5rem', display: 'inline-block' }}>
          [DEMO RESERVATION CONFIRMATION RECORDED]
        </div>

        <h1
          style={{
            fontSize: '2.2rem',
            fontWeight: 800,
            color: '#0f172a',
            margin: '0 0 0.5rem 0',
            letterSpacing: '-0.02em',
          }}
        >
          Reservation Request Created
        </h1>

        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '540px', margin: '0 auto 2rem auto', lineHeight: 1.6 }}>
          Your stay request at <strong>{reservation.propertyName}</strong> has been logged in our demo repository.
          Unit <strong>Room {reservation.roomNo}</strong> is now locked for your intended move-in.
        </p>

        {/* Highlighted Reference ID Pill */}
        <div
          className="neomorph-inset"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '0.85rem 1.5rem',
            borderRadius: 'var(--radius-pill)',
            border: '1.5px solid rgba(14, 165, 233, 0.4)',
            marginBottom: '2rem',
          }}
        >
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
              DEMO RESERVATION REFERENCE ID
            </div>
            <div
              style={{
                fontSize: '1.4rem',
                fontWeight: 800,
                color: 'var(--c-sky-blue)',
                fontFamily: 'var(--font-metrics)',
                letterSpacing: '0.05em',
              }}
            >
              {reservation.id}
            </div>
          </div>

          <div
            style={{
              background: 'rgba(234, 179, 8, 0.15)',
              color: 'var(--c-gold)',
              border: '1px solid rgba(234, 179, 8, 0.4)',
              padding: '0.35rem 0.85rem',
              borderRadius: 'var(--radius-pill)',
              fontSize: '0.82rem',
              fontWeight: 800,
            }}
          >
            ● {reservation.status}
          </div>
        </div>

        {/* Key Summary Matrix */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            textAlign: 'left',
            marginBottom: '2rem',
          }}
        >
          <div className="neomorph-inset" style={{ padding: '1rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>PROPERTY & LOCATION</div>
            <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem', marginTop: '0.2rem' }}>
              {reservation.propertyName}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{reservation.propertyTown}</div>
          </div>

          <div className="neomorph-inset" style={{ padding: '1rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>RESERVED UNIT</div>
            <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem', marginTop: '0.2rem' }}>
              Room {reservation.roomNo} ({reservation.roomType})
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Floor {reservation.roomFloor}</div>
          </div>

          <div className="neomorph-inset" style={{ padding: '1rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>MOVE-IN DATE</div>
            <div style={{ fontWeight: 800, color: 'var(--c-sky-blue)', fontSize: '0.95rem', marginTop: '0.2rem' }}>
              {formattedDate}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{reservation.durationLabel}</div>
          </div>

          <div className="neomorph-inset" style={{ padding: '1rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>MONTHLY TOTAL</div>
            <div style={{ fontWeight: 800, color: 'var(--c-gold)', fontSize: '1.2rem', fontFamily: 'var(--font-metrics)', marginTop: '0.1rem' }}>
              ₹{reservation.pricing.monthlyTotal.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--c-green)' }}>Meals & Wi-Fi included</div>
          </div>
        </div>

        {/* Demo Honesty Disclaimer */}
        <div
          style={{
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(234, 179, 8, 0.08)',
            border: '1px solid rgba(234, 179, 8, 0.25)',
            fontSize: '0.82rem',
            color: '#475569',
            lineHeight: 1.5,
            marginBottom: '2.5rem',
            textAlign: 'left',
          }}
        >
          <strong>Hackathon Demonstration Notice:</strong> This is an architectural prototype of Inveni Stay.
          Your reservation request has been saved to your local browser storage and linked to the property.
          The automated lease contract and landlord direct check-in payment gateway will be introduced in future cloud phases.
        </div>

        {/* Action Button Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => onViewDetails(reservation.id)}
              className="btn-iridescent"
              style={{
                padding: '0.9rem 2rem',
                fontSize: '1rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
              }}
            >
              <span>View Reservation Details</span>
              <ArrowRight size={18} />
            </button>

            <button
              onClick={handleShare}
              className="neomorph-btn"
              style={{
                padding: '0.9rem 1.75rem',
                fontSize: '0.95rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#0f172a',
                cursor: 'pointer',
              }}
            >
              {copied ? <Check size={18} color="var(--c-green)" /> : <Share2 size={18} />}
              <span>{copied ? 'Link Copied to Clipboard!' : 'Share Reservation'}</span>
            </button>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '0.5rem' }}>
            <button
              onClick={onViewMyReservations}
              className="neomorph-btn"
              style={{
                padding: '0.75rem 1.5rem',
                fontSize: '0.88rem',
                fontWeight: 700,
                color: '#0f172a',
                cursor: 'pointer',
              }}
            >
              Go to My Reservations
            </button>

            <button
              onClick={onBackToExplore}
              className="neomorph-btn"
              style={{
                padding: '0.75rem 1.5rem',
                fontSize: '0.88rem',
                fontWeight: 700,
                color: '#0f172a',
                cursor: 'pointer',
              }}
            >
              Back to Stays in {reservation.propertyTown}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
