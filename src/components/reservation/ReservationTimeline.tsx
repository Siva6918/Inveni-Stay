import React from 'react';
import { ReservationStatus } from '../../types';

interface ReservationTimelineProps {
  status: ReservationStatus;
  createdAt: string;
  moveInDate: string;
  cancellationReason?: string;
}

export const ReservationTimeline: React.FC<ReservationTimelineProps> = ({
  status,
  createdAt,
  moveInDate,
  cancellationReason,
}) => {
  // Format timestamps nicely
  const createdDateStr = new Date(createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
  });

  const targetMoveInStr = new Date(moveInDate).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  // Stages:
  // 1: Request Submitted (always done)
  // 2: Owner Review (done if CONFIRMED, CANCELLED, or COMPLETED; in-progress if REQUESTED)
  // 3: Decision:
  //    - CONFIRMED: Done
  //    - CANCELLED: Rejection / Cancellation
  //    - REQUESTED: Pending
  // 4: Move-In:
  //    - CONFIRMED: Ready on moveInDate
  //    - CANCELLED: Voided

  const isOwnerReviewDone = status !== 'REQUESTED';
  const isOwnerReviewPending = status === 'REQUESTED';

  const isConfirmed = status === 'CONFIRMED' || status === 'COMPLETED';
  const isCancelled = status === 'CANCELLED';

  return (
    <div
      style={{
        background: 'var(--bg-app, #f8fafc)',
        border: '1px solid var(--border-subtle, #e2e8f0)',
        borderRadius: '16px',
        padding: '20px',
        marginTop: '16px',
        marginBottom: '16px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
        }}
      >
        <div
          style={{
            fontSize: '11px',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--text-tertiary, #64748b)',
          }}
        >
          Reservation Progress & Timeline
        </div>
        <div
          style={{
            fontSize: '11px',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: '12px',
            background:
              status === 'CONFIRMED'
                ? '#ecfdf5'
                : status === 'REQUESTED'
                ? '#eff6ff'
                : '#fef2f2',
            color:
              status === 'CONFIRMED'
                ? '#059669'
                : status === 'REQUESTED'
                ? '#2563eb'
                : '#dc2626',
          }}
        >
          {status === 'CONFIRMED'
            ? '✓ Confirmed by Owner'
            : status === 'REQUESTED'
            ? '● Awaiting Owner Review'
            : '✕ Cancelled / Rejected'}
        </div>
      </div>

      {/* Progress Track */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '8px',
          position: 'relative',
        }}
      >
        {/* Step 1: Request Created */}
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: '#10b981',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '13px',
              fontWeight: 800,
              margin: '0 auto 8px',
            }}
          >
            ✓
          </div>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--text-primary, #0f172a)',
            }}
          >
            REQUEST CREATED
          </div>
          <div
            style={{
              fontSize: '10px',
              color: 'var(--text-tertiary, #64748b)',
              marginTop: '2px',
            }}
          >
            {createdDateStr}
          </div>
        </div>

        {/* Step 2: Owner Review */}
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: isOwnerReviewDone
                ? '#10b981'
                : isOwnerReviewPending
                ? '#3b82f6'
                : '#cbd5e1',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '13px',
              fontWeight: 800,
              margin: '0 auto 8px',
              boxShadow: isOwnerReviewPending ? '0 0 0 4px rgba(59, 130, 246, 0.2)' : 'none',
            }}
          >
            {isOwnerReviewDone ? '✓' : '●'}
          </div>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--text-primary, #0f172a)',
            }}
          >
            OWNER REVIEW
          </div>
          <div
            style={{
              fontSize: '10px',
              color: isOwnerReviewPending ? '#2563eb' : 'var(--text-tertiary, #64748b)',
              fontWeight: isOwnerReviewPending ? 700 : 500,
              marginTop: '2px',
            }}
          >
            {isOwnerReviewPending ? 'In Review' : 'Verified'}
          </div>
        </div>

        {/* Step 3: Decision */}
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: isConfirmed
                ? '#10b981'
                : isCancelled
                ? '#ef4444'
                : '#e2e8f0',
              color: isConfirmed || isCancelled ? '#ffffff' : '#94a3b8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '13px',
              fontWeight: 800,
              margin: '0 auto 8px',
            }}
          >
            {isConfirmed ? '✓' : isCancelled ? '✕' : '3'}
          </div>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: isCancelled ? '#ef4444' : 'var(--text-primary, #0f172a)',
            }}
          >
            {isCancelled ? 'CANCELLED' : 'CONFIRMED'}
          </div>
          <div
            style={{
              fontSize: '10px',
              color: 'var(--text-tertiary, #64748b)',
              marginTop: '2px',
            }}
          >
            {isConfirmed ? 'Accepted' : isCancelled ? 'Declined' : 'Pending'}
          </div>
        </div>

        {/* Step 4: Move-In */}
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: isConfirmed ? '#6366f1' : '#e2e8f0',
              color: isConfirmed ? '#ffffff' : '#94a3b8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '13px',
              fontWeight: 800,
              margin: '0 auto 8px',
            }}
          >
            📍
          </div>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--text-primary, #0f172a)',
            }}
          >
            MOVE-IN
          </div>
          <div
            style={{
              fontSize: '10px',
              color: isConfirmed ? '#4f46e5' : 'var(--text-tertiary, #64748b)',
              fontWeight: isConfirmed ? 700 : 500,
              marginTop: '2px',
            }}
          >
            {isCancelled ? 'Void' : targetMoveInStr}
          </div>
        </div>
      </div>

      {cancellationReason && (
        <div
          style={{
            marginTop: '14px',
            padding: '8px 12px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            fontSize: '12px',
            color: '#991b1b',
          }}
        >
          <strong>Reason:</strong> {cancellationReason}
        </div>
      )}
    </div>
  );
};
