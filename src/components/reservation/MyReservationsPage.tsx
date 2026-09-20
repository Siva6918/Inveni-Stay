import React, { useState, useEffect } from 'react';
import { reservationService } from '../../services/reservationService';
import { authService } from '../../services/authService';
import { Reservation, ReservationStatus } from '../../types';
import { ReservationTimeline } from './ReservationTimeline';
import { eventService } from '../../services/eventService';
import {
  Calendar,
  Building2,
  DoorOpen,
  ArrowRight,
  ShieldCheck,
  Compass,
  AlertCircle,
  Clock,
  ExternalLink,
  Receipt,
  Sparkles,
} from 'lucide-react';

interface MyReservationsPageProps {
  onSelectReservation: (id: string) => void;
  onExploreProperty: (propertyId: string) => void;
  onBackToExplore: () => void;
}

export const MyReservationsPage: React.FC<MyReservationsPageProps> = ({
  onSelectReservation,
  onExploreProperty,
  onBackToExplore,
}) => {
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'REQUESTED' | 'CONFIRMED' | 'CANCELLED'>('ALL');

  const refresh = () => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
    if (user) {
      setReservations([...reservationService.getReservationsForUser(user.id, user.email)]);
    } else {
      setReservations([]);
    }
  };

  useEffect(() => {
    refresh();

    const unsubAuth = authService.subscribe(() => {
      refresh();
    });

    // Subscribe to real-time reservation domain events (Phase 8 Section 2, 7, 8, 9, 10)
    const unsub1 = eventService.subscribe('ReservationCreated', refresh);
    const unsub2 = eventService.subscribe('ReservationConfirmed', refresh);
    const unsub3 = eventService.subscribe('ReservationRejected', refresh);
    const unsub4 = eventService.subscribe('ReservationCancelled', refresh);

    return () => {
      unsubAuth();
      unsub1();
      unsub2();
      unsub3();
      unsub4();
    };
  }, []);

  const filtered = reservations.filter((r) => {
    if (filter === 'ALL') return true;
    return r.status === filter;
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
        {/* Header Title */}
        <div style={{ marginBottom: '2rem' }}>
          <div className="badge-metaverse" style={{ fontSize: '0.72rem', marginBottom: '0.4rem', display: 'inline-block' }}>
            [RENTER HUB • DEMO SESSIONS]
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem 0' }}>
                My Stays & Reservations
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: 0 }}>
                Manage your remote room reservations, move-in schedules, and room inspection records.
              </p>
            </div>

            <button
              onClick={onBackToExplore}
              className="btn-iridescent"
              style={{
                padding: '0.75rem 1.5rem',
                fontSize: '0.9rem',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
              }}
            >
              <Compass size={16} />
              <span>Explore More Stays</span>
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          {(['ALL', 'REQUESTED', 'CONFIRMED', 'CANCELLED'] as const).map((tab) => {
            const count = tab === 'ALL' ? reservations.length : reservations.filter((r) => r.status === tab).length;
            const isSelected = filter === tab;
            return (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                style={{
                  padding: '0.6rem 1.25rem',
                  borderRadius: 'var(--radius-pill)',
                  background: isSelected ? '#ffffff' : 'var(--surface-neomorph)',
                  border: isSelected ? '2px solid var(--c-sky-blue)' : '1px solid rgba(194, 202, 216, 0.8)',
                  boxShadow: isSelected
                    ? '0 0 12px rgba(14, 165, 233, 0.35), var(--shadow-neomorph)'
                    : 'var(--shadow-neomorph)',
                  color: isSelected ? 'var(--c-sky-blue)' : '#0f172a',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                }}
              >
                <span>{tab === 'ALL' ? 'All Stays' : tab === 'REQUESTED' ? 'Active Requests' : 'Cancelled'}</span>
                <span
                  style={{
                    background: isSelected ? 'rgba(14, 165, 233, 0.15)' : 'rgba(194, 202, 216, 0.5)',
                    padding: '0.1rem 0.45rem',
                    borderRadius: 'var(--radius-pill)',
                    fontSize: '0.75rem',
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Reservation Cards List */}
        {filtered.length === 0 ? (
          <div
            className="neomorph-card"
            style={{
              padding: '4rem 2rem',
              textAlign: 'center',
              maxWidth: '540px',
              margin: '0 auto',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(14, 165, 233, 0.15)',
                color: 'var(--c-sky-blue)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem auto',
              }}
            >
              <Building2 size={32} />
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
              No Active Reservations
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.75rem' }}>
              Your next verified stay could start here. Explore available rooms in Panyam and lock in your unit before
              arriving.
            </p>
            <button
              onClick={onBackToExplore}
              className="btn-iridescent"
              style={{ padding: '0.85rem 2rem', fontWeight: 800 }}
            >
              Explore Stays in Panyam
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem' }}>
            {filtered.map((res) => {
              const isCancelled = res.status === 'CANCELLED';
              const formattedDate = new Date(res.moveInDate).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              });
              return (
                <div
                  key={res.id}
                  className="neomorph-card"
                  style={{
                    padding: '1.75rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    border: isCancelled
                      ? '1.5px solid rgba(239, 68, 68, 0.4)'
                      : '1.5px solid rgba(14, 165, 233, 0.35)',
                  }}
                >
                  <div>
                    {/* Top Row: Ref ID + Status */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <span
                        style={{
                          fontFamily: 'var(--font-metrics)',
                          fontWeight: 800,
                          fontSize: '1rem',
                          color: 'var(--c-sky-blue)',
                          letterSpacing: '0.04em',
                        }}
                      >
                        {res.id}
                      </span>
                      <span
                        style={{
                          background: isCancelled ? 'rgba(239, 68, 68, 0.15)' : 'rgba(234, 179, 8, 0.15)',
                          color: isCancelled ? 'var(--c-red)' : 'var(--c-gold)',
                          border: isCancelled ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(234, 179, 8, 0.3)',
                          padding: '0.15rem 0.65rem',
                          borderRadius: 'var(--radius-pill)',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                        }}
                      >
                        ● {res.status}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.35rem 0' }}>
                      {res.propertyName}
                    </h3>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                      {res.propertyTown}, Andhra Pradesh
                    </div>

                    {/* Room & Schedule Box */}
                    <div className="neomorph-inset" style={{ padding: '1rem', marginBottom: '1.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                        <span style={{ color: '#64748b' }}>Reserved Unit:</span>
                        <span style={{ fontWeight: 800, color: '#0f172a' }}>
                          Room {res.roomNo} ({res.roomType})
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginTop: '0.35rem' }}>
                        <span style={{ color: '#64748b' }}>Move-in Date:</span>
                        <span style={{ fontWeight: 800, color: 'var(--c-sky-blue)' }}>{formattedDate}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginTop: '0.35rem' }}>
                        <span style={{ color: '#64748b' }}>Duration:</span>
                        <span style={{ fontWeight: 700, color: '#0f172a' }}>{res.durationLabel}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginTop: '0.35rem' }}>
                        <span style={{ color: '#64748b' }}>Monthly Total:</span>
                        <span style={{ fontWeight: 800, color: 'var(--c-gold)', fontFamily: 'var(--font-metrics)' }}>
                          ₹{res.pricing.monthlyTotal.toLocaleString()}/mo
                        </span>
                      </div>
                    </div>

                    {/* Timeline Tracker */}
                    <ReservationTimeline
                      status={res.status}
                      createdAt={res.createdAt}
                      moveInDate={res.moveInDate}
                      cancellationReason={res.cancellationReason}
                    />
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                      onClick={() => onSelectReservation(res.id)}
                      className="btn-iridescent"
                      style={{
                        flex: 1,
                        padding: '0.65rem 1rem',
                        fontSize: '0.85rem',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.4rem',
                        cursor: 'pointer',
                      }}
                    >
                      <span>View Details</span>
                      <ArrowRight size={14} />
                    </button>

                    <button
                      onClick={() => onExploreProperty(res.propertyId)}
                      className="neomorph-btn"
                      style={{
                        padding: '0.65rem 1rem',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        color: '#0f172a',
                        cursor: 'pointer',
                      }}
                      title="Inspect Property"
                    >
                      <ExternalLink size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
