import React, { useState } from 'react';
import { Reservation, ReservationStatus } from '../../types';
import { reservationService } from '../../services/reservationService';
import { authService } from '../../services/authService';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Calendar,
  IndianRupee,
  Phone,
  Mail,
  MapPin,
  Utensils,
  Receipt,
  AlertTriangle,
  X,
  FileText,
} from 'lucide-react';

interface OwnerReservationManagerProps {
  propertyId?: string;
  propertyName?: string;
  onReservationUpdated: () => void;
  onBack: () => void;
}

export const OwnerReservationManager: React.FC<OwnerReservationManagerProps> = ({
  propertyId,
  propertyName,
  onReservationUpdated,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<'ALL' | 'REQUESTED' | 'CONFIRMED' | 'CANCELLED'>('ALL');
  const [rejectingReservation, setRejectingReservation] = useState<Reservation | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('Room unavailable');
  const [customRejectReason, setCustomRejectReason] = useState<string>('');
  const [selectedDetailReservation, setSelectedDetailReservation] = useState<Reservation | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const ownerId = authService.getCurrentOwnerId();

  // Load reservations for specific property or all owner properties
  const allOwnerReservations = propertyId
    ? reservationService.getReservationsByProperty(propertyId, ownerId)
    : reservationService.getReservationsByOwner(ownerId);

  const filteredReservations = allOwnerReservations.filter((r) => {
    if (activeTab === 'ALL') return true;
    return r.status === activeTab;
  });

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleConfirm = async (res: Reservation) => {
    setErrorMessage(null);
    const result = await reservationService.confirmReservation(ownerId, res.id);
    if (result.success) {
      showToast(`Reservation ${res.id} for Room ${res.roomNo} confirmed!`);
      onReservationUpdated();
    } else {
      setErrorMessage(result.error || 'Failed to confirm reservation.');
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingReservation) return;

    const finalReason = rejectReason === 'Other' ? customRejectReason.trim() || 'Other' : rejectReason;
    const result = await reservationService.rejectReservation(ownerId, rejectingReservation.id, finalReason);
    if (result.success) {
      showToast(`Reservation request ${rejectingReservation.id} rejected. Room ${rejectingReservation.roomNo} is now vacant & available.`);
      setRejectingReservation(null);
      setCustomRejectReason('');
      onReservationUpdated();
    } else {
      setErrorMessage(result.error || 'Failed to reject reservation.');
    }
  };

  const getStatusBadge = (status: ReservationStatus) => {
    switch (status) {
      case 'REQUESTED':
        return {
          bg: '#fffbeb',
          border: '#fde68a',
          text: '#92400e',
          label: 'PENDING APPROVAL',
          icon: <Clock size={13} color="#d97706" />,
        };
      case 'CONFIRMED':
        return {
          bg: '#ecfdf5',
          border: '#a7f3d0',
          text: '#065f46',
          label: 'CONFIRMED',
          icon: <CheckCircle2 size={13} color="#059669" />,
        };
      case 'CANCELLED':
        return {
          bg: '#fef2f2',
          border: '#fecaca',
          text: '#991b1b',
          label: 'CANCELLED / REJECTED',
          icon: <XCircle size={13} color="#dc2626" />,
        };
      case 'COMPLETED':
        return {
          bg: '#f8fafc',
          border: '#e2e8f0',
          text: '#475569',
          label: 'COMPLETED',
          icon: <CheckCircle2 size={13} color="#64748b" />,
        };
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      {/* Toast Notification */}
      {successToast && (
        <div
          style={{
            position: 'fixed',
            top: '80px',
            right: '20px',
            zIndex: 4000,
            background: '#ffffff',
            border: '2px solid #10b981',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem 1.25rem',
            boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            color: '#065f46',
            fontWeight: 700,
          }}
        >
          <CheckCircle2 size={18} color="#10b981" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Top Bar Navigation */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={onBack}
            className="neomorph-btn"
            style={{
              padding: '0.5rem 0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontWeight: 700,
              fontSize: '0.85rem',
              color: '#0f172a',
            }}
          >
            <ArrowLeft size={16} />
            <span>Back to Dashboard</span>
          </button>

          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Reservation Requests
            </h1>
            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {propertyName ? `Managing requests for ${propertyName}` : 'All incoming stay inquiries across your properties'}
            </p>
          </div>
        </div>
      </div>

      {/* Error alert */}
      {errorMessage && (
        <div
          style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            borderRadius: 'var(--radius-sm)',
            padding: '0.75rem 1rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.85rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={16} />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#991b1b' }}
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '1px solid var(--border-medium)',
          paddingBottom: '0.5rem',
          marginBottom: '1.5rem',
          overflowX: 'auto',
        }}
      >
        {(['ALL', 'REQUESTED', 'CONFIRMED', 'CANCELLED'] as const).map((tab) => {
          const count = allOwnerReservations.filter((r) => tab === 'ALL' || r.status === tab).length;
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '0.5rem 1rem',
                border: 'none',
                background: isActive ? 'var(--surface-2)' : 'transparent',
                borderRadius: 'var(--radius-sm)',
                fontWeight: isActive ? 800 : 600,
                color: isActive ? '#0284c7' : '#64748b',
                cursor: 'pointer',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <span>
                {tab === 'ALL'
                  ? 'All Requests'
                  : tab === 'REQUESTED'
                  ? 'Pending'
                  : tab === 'CONFIRMED'
                  ? 'Confirmed'
                  : 'Cancelled'}
              </span>
              <span
                style={{
                  fontSize: '0.72rem',
                  padding: '0.1rem 0.4rem',
                  borderRadius: 'var(--radius-full)',
                  background: isActive ? '#e0f2fe' : '#f1f5f9',
                  color: isActive ? '#0369a1' : '#64748b',
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Reservations List */}
      {filteredReservations.length === 0 ? (
        <div
          style={{
            background: 'var(--surface-1)',
            border: '2px dashed var(--border-medium)',
            borderRadius: 'var(--radius-lg)',
            padding: '3rem 1.5rem',
            textAlign: 'center',
          }}
        >
          <Receipt size={40} color="var(--c-gold)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
            No reservation requests found
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto' }}>
            {activeTab === 'ALL'
              ? 'When students and relocators reserve rooms in your property, their requests will appear here for your review.'
              : `There are currently no reservations marked as ${activeTab.toLowerCase()}.`}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredReservations.map((res) => {
            const badge = getStatusBadge(res.status);
            return (
              <div
                key={res.id}
                style={{
                  background: '#ffffff',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  transition: 'box-shadow 0.2s ease',
                }}
              >
                {/* Header Row: ID, Property, Status */}
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '0.75rem',
                    borderBottom: '1px solid #f1f5f9',
                    paddingBottom: '0.75rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ fontFamily: 'var(--font-metrics)', fontWeight: 800, color: '#0f172a' }}>
                      {res.id}
                    </span>
                    <span style={{ color: '#cbd5e1' }}>•</span>
                    <span style={{ fontWeight: 700, color: '#0369a1' }}>
                      Room {res.roomNo} ({res.roomType})
                    </span>
                    <span style={{ color: '#cbd5e1' }}>•</span>
                    <span style={{ color: '#64748b', fontSize: '0.85rem' }}>{res.propertyName}</span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.25rem 0.65rem',
                      borderRadius: 'var(--radius-full)',
                      background: badge.bg,
                      color: badge.text,
                      border: `1px solid ${badge.border}`,
                      fontSize: '0.75rem',
                      fontWeight: 800,
                    }}
                  >
                    {badge.icon}
                    <span>{badge.label}</span>
                  </div>
                </div>

                {/* Details Grid */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '1rem',
                    fontSize: '0.85rem',
                  }}
                >
                  {/* Renter column */}
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                      RENTER DETAILS
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, color: '#0f172a' }}>
                      <User size={14} color="#0284c7" />
                      <span>{res.renter.fullName}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#475569', marginTop: '0.2rem' }}>
                      <Phone size={13} color="#94a3b8" />
                      <span>{res.renter.phone}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#475569', marginTop: '0.2rem' }}>
                      <MapPin size={13} color="#94a3b8" />
                      <span>From: {res.renter.currentLocation}</span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.2rem' }}>
                      Role: {res.renter.occupation}
                    </div>
                  </div>

                  {/* Move-in & Stay terms */}
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                      STAY TIMELINE
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#0f172a', fontWeight: 700 }}>
                      <Calendar size={14} color="#059669" />
                      <span>Move-in: {res.moveInDate}</span>
                    </div>
                    <div style={{ color: '#475569', marginTop: '0.2rem' }}>
                      Duration: {res.durationLabel || `${res.durationMonths} Months`}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#475569', marginTop: '0.2rem' }}>
                      <Utensils size={13} color="#d97706" />
                      <span>{res.foodPlanLabel || res.foodPlan}</span>
                    </div>
                  </div>

                  {/* Pricing Breakdown (Authoritative) */}
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                      MONTHLY & DEPOSIT
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                      <span>₹{res.pricing.monthlyTotal.toLocaleString('en-IN')}</span>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>/ month</span>
                    </div>
                    <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.2rem' }}>
                      Security Deposit: ₹{res.pricing.deposit.toLocaleString('en-IN')}
                    </div>
                    <div style={{ color: '#059669', fontSize: '0.8rem', fontWeight: 700, marginTop: '0.2rem' }}>
                      Initial Due: ₹{res.pricing.initialTotal.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                {/* Rejection reason if cancelled */}
                {res.status === 'CANCELLED' && res.cancellationReason && (
                  <div
                    style={{
                      background: '#fef2f2',
                      border: '1px solid #fecaca',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.5rem 0.75rem',
                      fontSize: '0.8rem',
                      color: '#991b1b',
                    }}
                  >
                    <strong>Cancellation Note:</strong> {res.cancellationReason}
                  </div>
                )}

                {/* Actions Footer */}
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTop: '1px solid #f1f5f9',
                    paddingTop: '0.75rem',
                    gap: '0.75rem',
                  }}
                >
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                    Created on {new Date(res.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                      onClick={() => setSelectedDetailReservation(res)}
                      style={{
                        padding: '0.4rem 0.85rem',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        color: '#475569',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                      }}
                    >
                      <FileText size={13} />
                      <span>Full Invoice & Details</span>
                    </button>

                    {res.status === 'REQUESTED' && (
                      <>
                        <button
                          onClick={() => setRejectingReservation(res)}
                          style={{
                            padding: '0.45rem 0.95rem',
                            background: '#ffffff',
                            border: '1.5px solid #f87171',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            color: '#dc2626',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                          }}
                        >
                          <XCircle size={14} />
                          <span>Reject Request</span>
                        </button>

                        <button
                          onClick={() => handleConfirm(res)}
                          className="btn-primary"
                          style={{
                            padding: '0.45rem 1.1rem',
                            fontSize: '0.82rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                          }}
                        >
                          <CheckCircle2 size={14} />
                          <span>Confirm Reservation</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reject Reason Dialog (Section 27) */}
      {rejectingReservation && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 3500,
            padding: '1rem',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: 'var(--radius-lg)',
              maxWidth: '460px',
              width: '100%',
              padding: '1.5rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              border: '1px solid var(--border-medium)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#dc2626' }}>
                <AlertTriangle size={20} />
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                  Reject Reservation Request
                </h2>
              </div>
              <button
                onClick={() => setRejectingReservation(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '1rem', lineHeight: 1.5 }}>
              Rejecting will notify renter <strong>{rejectingReservation.renter.fullName}</strong> and automatically restore <strong>Room {rejectingReservation.roomNo}</strong> back to <span style={{ color: '#059669', fontWeight: 700 }}>AVAILABLE</span> status for other students.
            </p>

            <form onSubmit={handleRejectSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
                  REASON FOR REJECTION *
                </label>
                <select
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                  }}
                >
                  <option value="Room unavailable">Room unavailable</option>
                  <option value="Dates unavailable">Requested move-in dates unavailable</option>
                  <option value="Occupancy limits reached">Occupancy limits reached</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {rejectReason === 'Other' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
                    SPECIFY REASON
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter reason..."
                    value={customRejectReason}
                    onChange={(e) => setCustomRejectReason(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.9rem',
                    }}
                  />
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setRejectingReservation(null)}
                  style={{
                    padding: '0.55rem 1.1rem',
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: 700,
                    color: '#475569',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '0.55rem 1.25rem',
                    background: '#dc2626',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    color: '#ffffff',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inspect Full Reservation Modal (Section 25) */}
      {selectedDetailReservation && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 3500,
            padding: '1rem',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: 'var(--radius-lg)',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '1.75rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              border: '1px solid var(--border-medium)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>RESERVATION RECORD</div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  {selectedDetailReservation.id}
                </h2>
              </div>
              <button
                onClick={() => setSelectedDetailReservation(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.88rem' }}>
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem' }}>
                  {selectedDetailReservation.propertyName}
                </div>
                <div style={{ color: '#475569' }}>
                  Room {selectedDetailReservation.roomNo} • {selectedDetailReservation.roomType} (Floor {selectedDetailReservation.roomFloor})
                </div>
                <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.2rem' }}>
                  {selectedDetailReservation.propertyAddress}
                </div>
              </div>

              <div style={{ border: '1px solid #e2e8f0', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
                  Renter Information
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <div>Name: <strong>{selectedDetailReservation.renter.fullName}</strong></div>
                  <div>Phone: <strong>{selectedDetailReservation.renter.phone}</strong></div>
                  <div>Email: <strong>{selectedDetailReservation.renter.email}</strong></div>
                  <div>Origin: <strong>{selectedDetailReservation.renter.currentLocation}</strong></div>
                  <div>Role: <strong>{selectedDetailReservation.renter.occupation}</strong></div>
                  {selectedDetailReservation.renter.emergencyContactName && (
                    <div>Emergency: {selectedDetailReservation.renter.emergencyContactName} ({selectedDetailReservation.renter.emergencyContactPhone})</div>
                  )}
                </div>
              </div>

              <div style={{ border: '1px solid #e2e8f0', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
                  Authoritative Pricing Ledger
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0' }}>
                  <span>Monthly Room Rent:</span>
                  <strong>₹{selectedDetailReservation.pricing.roomRent.toLocaleString('en-IN')}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0' }}>
                  <span>Food/Mess Plan ({selectedDetailReservation.foodPlanLabel}):</span>
                  <strong>₹{selectedDetailReservation.pricing.foodCost.toLocaleString('en-IN')}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0' }}>
                  <span>Selected Addons:</span>
                  <strong>₹{selectedDetailReservation.pricing.addonCost.toLocaleString('en-IN')}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0' }}>
                  <span>Security Deposit (Refundable):</span>
                  <strong>₹{selectedDetailReservation.pricing.deposit.toLocaleString('en-IN')}</strong>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '0.5rem 0 0',
                    borderTop: '1px dashed #cbd5e1',
                    marginTop: '0.5rem',
                    fontWeight: 800,
                    color: '#0f172a',
                    fontSize: '1rem',
                  }}
                >
                  <span>Monthly Total:</span>
                  <span>₹{selectedDetailReservation.pricing.monthlyTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button
                  onClick={() => setSelectedDetailReservation(null)}
                  className="btn-primary"
                  style={{ padding: '0.6rem 1.5rem', fontSize: '0.88rem' }}
                >
                  Close Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
