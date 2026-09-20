import React, { useState, useEffect } from 'react';
import { reservationService } from '../../services/reservationService';
import { Reservation } from '../../types';
import {
  ArrowLeft,
  Building2,
  Calendar,
  Clock,
  DoorOpen,
  MapPin,
  Receipt,
  ShieldCheck,
  User,
  AlertCircle,
  CheckCircle2,
  X,
  Share2,
  Check,
  Compass,
  Sparkles,
} from 'lucide-react';
import { ReservationTimeline } from './ReservationTimeline';

interface ReservationDetailPageProps {
  reservationId: string;
  onBackToMyReservations: () => void;
  onBackToExplore: () => void;
}

export const ReservationDetailPage: React.FC<ReservationDetailPageProps> = ({
  reservationId,
  onBackToMyReservations,
  onBackToExplore,
}) => {
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showCancelModal, setShowCancelModal] = useState<boolean>(false);
  const [cancelReason, setCancelReason] = useState<string>('Plans changed / college schedule delayed');
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    setLoading(true);
    const found = reservationService.getReservationById(reservationId);
    setReservation(found || null);
    setLoading(false);
  }, [reservationId]);

  const handleConfirmCancel = async () => {
    if (!reservation) return;
    const success = await reservationService.cancelReservation(reservation.id, cancelReason);
    if (success) {
      const updated = reservationService.getReservationById(reservation.id);
      setReservation(updated || null);
      setShowCancelModal(false);
    }
  };

  const handleShare = async () => {
    if (!reservation) return;
    const shareText = `Inveni Stay Reservation ${reservation.id} for Room ${reservation.roomNo} at ${reservation.propertyName}.`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Reservation ${reservation.id}`,
          text: shareText,
          url: window.location.href,
        });
      } catch (e) {
        // cancelled
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${shareText} View: ${window.location.href}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      } catch (e) {
        // ignore
      }
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '6rem 2rem', minHeight: '80vh' }}>
        <div style={{ height: '32px', width: '200px', background: 'rgba(255, 255, 255, 0.2)', borderRadius: '4px', marginBottom: '2rem' }} />
        <div style={{ height: '400px', width: '100%', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '16px' }} />
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="container" style={{ padding: '6rem 2rem', minHeight: '75vh', textAlign: 'center' }}>
        <div className="neomorph-card" style={{ maxWidth: '500px', margin: '0 auto', padding: '3rem 2rem' }}>
          <AlertCircle size={48} color="var(--c-red)" style={{ margin: '0 auto 1.5rem auto' }} />
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem' }}>
            Reservation Not Found
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            No reservation matching ID "{reservationId}" could be located in your local session records.
          </p>
          <button onClick={onBackToMyReservations} className="btn-iridescent" style={{ padding: '0.8rem 1.75rem' }}>
            View My Active Reservations
          </button>
        </div>
      </div>
    );
  }

  const isCancelled = reservation.status === 'CANCELLED';
  const isRequested = reservation.status === 'REQUESTED';
  const formattedMoveIn = new Date(reservation.moveInDate).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const createdDateStr = new Date(reservation.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--canvas-bg)',
        paddingTop: '2rem',
        paddingBottom: '6rem',
        width: '100%',
      }}
    >
      <div className="container" style={{ width: '100%', maxWidth: '100%' }}>
        {/* Navigation Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '1.75rem',
          }}
        >
          <button
            onClick={onBackToMyReservations}
            className="neomorph-btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#0f172a',
              fontSize: '0.88rem',
              fontWeight: 800,
              padding: '0.55rem 1.15rem',
            }}
          >
            <ArrowLeft size={16} />
            <span>Back to My Reservations</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={handleShare}
              className="neomorph-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                padding: '0.5rem 1rem',
                color: '#0f172a',
              }}
            >
              {copied ? <Check size={16} color="var(--c-green)" /> : <Share2 size={16} />}
              <span>{copied ? 'Copied' : 'Share'}</span>
            </button>

            <button
              onClick={onBackToExplore}
              className="neomorph-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                padding: '0.5rem 1rem',
                color: '#0f172a',
              }}
            >
              <Compass size={16} />
              <span>Explore More Stays</span>
            </button>
          </div>
        </div>

        {/* Master Reservation Passport Card */}
        <div
          className="neomorph-card"
          style={{
            padding: '2.5rem',
            position: 'relative',
            border: isCancelled
              ? '2px solid rgba(239, 68, 68, 0.4)'
              : '2px solid rgba(14, 165, 233, 0.45)',
          }}
        >
          {/* Header Row: Title & Status */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: '1rem',
              marginBottom: '2rem',
              paddingBottom: '1.5rem',
              borderBottom: '1px solid rgba(194, 202, 216, 0.8)',
            }}
          >
            <div>
              <div className="badge-metaverse" style={{ fontSize: '0.72rem', marginBottom: '0.35rem' }}>
                [RESERVATION PASSPORT]
              </div>
              <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.35rem 0' }}>
                {reservation.propertyName}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                <MapPin size={16} color="var(--c-sky-blue)" />
                <span>{reservation.propertyAddress}</span>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                REFERENCE ID
              </div>
              <div
                style={{
                  fontSize: '1.45rem',
                  fontWeight: 800,
                  color: 'var(--c-sky-blue)',
                  fontFamily: 'var(--font-metrics)',
                  letterSpacing: '0.04em',
                }}
              >
                {reservation.id}
              </div>
              <div style={{ marginTop: '0.35rem' }}>
                <span
                  style={{
                    background: isCancelled
                      ? 'rgba(239, 68, 68, 0.15)'
                      : 'rgba(234, 179, 8, 0.15)',
                    color: isCancelled ? 'var(--c-red)' : 'var(--c-gold)',
                    border: isCancelled
                      ? '1px solid rgba(239, 68, 68, 0.35)'
                      : '1px solid rgba(234, 179, 8, 0.35)',
                    padding: '0.2rem 0.75rem',
                    borderRadius: 'var(--radius-pill)',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                  }}
                >
                  ● {reservation.status}
                </span>
              </div>
            </div>
          </div>

          {/* Reservation Timeline (Phase 8 Section 33) */}
          <ReservationTimeline
            status={reservation.status}
            createdAt={reservation.createdAt}
            moveInDate={reservation.moveInDate}
            cancellationReason={reservation.cancellationReason}
          />

          {/* Cancellation Alert Banner if cancelled */}
          {isCancelled && (
            <div
              style={{
                background: '#fef2f2',
                border: '1.5px solid #fecaca',
                padding: '1rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                color: '#991b1b',
                marginBottom: '2rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                fontSize: '0.9rem',
              }}
            >
              <AlertCircle size={20} style={{ flexShrink: 0 }} />
              <div>
                <strong>Reservation Request Cancelled:</strong> {reservation.cancellationReason}.
                Room {reservation.roomNo} has been returned to available inventory in our demo directory.
              </div>
            </div>
          )}

          {/* Grid Layout: Details */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {/* Unit & Inclusions */}
            <div className="neomorph-inset" style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                ALLOCATED UNIT & SPECIFICATIONS
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                Room {reservation.roomNo} ({reservation.roomType} Occupancy)
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                Floor {reservation.roomFloor} • Single Bed with Mattress & Solid Wood Study Desk
              </div>

              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px dashed rgba(194, 202, 216, 0.8)' }}>
                <div style={{ fontSize: '0.85rem', color: '#475569' }}>
                  <strong>Food Plan:</strong> {reservation.foodPlanLabel}
                </div>
                {reservation.selectedAddons.length > 0 && (
                  <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '0.35rem' }}>
                    <strong>Add-ons:</strong> {reservation.selectedAddons.map((a) => a.name).join(', ')}
                  </div>
                )}
              </div>
            </div>

            {/* Move-in Timeline */}
            <div className="neomorph-inset" style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                SCHEDULE & DURATION
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--c-sky-blue)', fontWeight: 800, fontSize: '1.15rem' }}>
                <Calendar size={20} />
                <span>Arrival: {formattedMoveIn}</span>
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.3rem' }}>
                Committed Duration: <strong>{reservation.durationLabel}</strong>
              </div>

              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px dashed rgba(194, 202, 216, 0.8)', fontSize: '0.82rem', color: '#64748b' }}>
                <div>Request Recorded: {createdDateStr}</div>
                <div>Coordination Contact: Host responds within 15 mins</div>
              </div>
            </div>

            {/* Renter Details */}
            <div className="neomorph-inset" style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                RENTER IDENTITY
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                {reservation.renter.fullName}
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                +91 {reservation.renter.phone} • {reservation.renter.email}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '0.35rem' }}>
                From: {reservation.renter.currentLocation}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                Role: {reservation.renter.occupation}
              </div>
            </div>

            {/* Price Ledger */}
            <div className="neomorph-inset" style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                FINANCIAL LEDGER
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.3rem' }}>
                <span style={{ color: '#64748b' }}>Monthly Rent:</span>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>₹{reservation.pricing.roomRent.toLocaleString()}</span>
              </div>
              {reservation.pricing.foodCost > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.3rem' }}>
                  <span style={{ color: '#64748b' }}>Special Meals:</span>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>₹{reservation.pricing.foodCost.toLocaleString()}</span>
                </div>
              )}
              {reservation.pricing.addonCost > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.3rem' }}>
                  <span style={{ color: '#64748b' }}>Add-ons:</span>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>₹{reservation.pricing.addonCost.toLocaleString()}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.3rem' }}>
                <span style={{ color: '#64748b' }}>Refundable Deposit:</span>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>₹{reservation.pricing.deposit.toLocaleString()}</span>
              </div>
              <div style={{ borderTop: '1px solid rgba(194, 202, 216, 0.8)', marginTop: '0.5rem', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 800, color: '#0f172a' }}>Total Monthly:</span>
                <span style={{ fontWeight: 800, color: 'var(--c-gold)', fontFamily: 'var(--font-metrics)', fontSize: '1.2rem' }}>
                  ₹{reservation.pricing.monthlyTotal.toLocaleString()}/mo
                </span>
              </div>
            </div>
          </div>

          {/* Demo Disclaimer Box */}
          <div
            style={{
              marginTop: '2rem',
              padding: '1rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(14, 165, 233, 0.08)',
              border: '1px solid rgba(14, 165, 233, 0.25)',
              fontSize: '0.82rem',
              color: '#334155',
              lineHeight: 1.5,
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
            }}
          >
            <ShieldCheck size={20} color="var(--c-sky-blue)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>Demonstration Reservation Notice:</strong> This is a demonstration reservation.
              Availability and confirmation are managed in local application state and are not connected to a live
              commercial property-management or banking system.
            </div>
          </div>

          {/* Cancellation Trigger */}
          {isRequested && (
            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowCancelModal(true)}
                style={{
                  background: 'none',
                  border: '1px solid var(--c-red)',
                  color: 'var(--c-red)',
                  padding: '0.65rem 1.25rem',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                Cancel Reservation Request
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Cancellation Confirmation Modal */}
      {showCancelModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 6000,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="neomorph-card"
            style={{
              maxWidth: '480px',
              width: '100%',
              padding: '2rem',
              border: '2px solid var(--c-red)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'rgba(239, 68, 68, 0.15)',
                  color: 'var(--c-red)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AlertCircle size={22} />
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Cancel Reservation Request?
              </h3>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              Are you sure you want to cancel your reservation for <strong>Room {reservation.roomNo}</strong> at{' '}
              <strong>{reservation.propertyName}</strong>? This will release the room lock and restore availability in
              the demo directory.
            </p>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.35rem' }}>
                Reason for Cancellation
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="neomorph-inset"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(194, 202, 216, 0.8)',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: '#0f172a',
                  background: 'var(--surface-neomorph)',
                  outline: 'none',
                }}
              >
                <option value="Plans changed / college schedule delayed">Plans changed / college schedule delayed</option>
                <option value="Found alternative stay closer to campus">Found alternative stay closer to campus</option>
                <option value="Personal / family relocation postponement">Personal / family relocation postponement</option>
                <option value="Testing demo flow">Testing demo flow</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowCancelModal(false)}
                className="neomorph-btn"
                style={{
                  padding: '0.75rem 1.25rem',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  color: '#0f172a',
                }}
              >
                Keep Reservation
              </button>

              <button
                onClick={handleConfirmCancel}
                style={{
                  background: 'var(--c-red)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.75rem 1.5rem',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                }}
              >
                Yes, Cancel Reservation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
