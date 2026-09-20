import React, { useState, useEffect } from 'react';
import { propertyService } from '../../services/propertyService';
import { reservationService } from '../../services/reservationService';
import { authService } from '../../services/authService';
import { PropertyListing, RoomUnit, FoodPlanOption, ReservationAddon, RenterProfile, Reservation } from '../../types';
import { Step1RoomSetup } from './Step1RoomSetup';
import { Step2RenterDetails } from './Step2RenterDetails';
import { Step3ReviewStay } from './Step3ReviewStay';
import { Step4Confirmed } from './Step4Confirmed';
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Building2,
  Calendar,
  Lock,
  Sparkles,
} from 'lucide-react';

interface ReservationFlowPageProps {
  propertyId: string;
  roomId: string;
  onBackToProperty: () => void;
  onNavigateToMyReservations: () => void;
  onNavigateToReservationDetail: (id: string) => void;
  onBackToExplore: () => void;
}

export const ReservationFlowPage: React.FC<ReservationFlowPageProps> = ({
  propertyId,
  roomId,
  onBackToProperty,
  onNavigateToMyReservations,
  onNavigateToReservationDetail,
  onBackToExplore,
}) => {
  const [property, setProperty] = useState<PropertyListing | null>(null);
  const [room, setRoom] = useState<RoomUnit | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Form states
  const [moveInDate, setMoveInDate] = useState<string>('2026-10-01');
  const [durationMonths, setDurationMonths] = useState<number>(3);
  const [durationLabel, setDurationLabel] = useState<string>('3 Months');
  const [foodPlan, setFoodPlan] = useState<FoodPlanOption>('included');
  const [foodPlanLabel, setFoodPlanLabel] = useState<string>('Andhra Homestyle Meals (Included in Rent)');
  const [selectedAddons, setSelectedAddons] = useState<ReservationAddon[]>([]);

  // Renter info
  const [renter, setRenter] = useState<RenterProfile>({
    fullName: 'Venkata Siva Kumar',
    phone: '9849012345',
    email: 'siva.relocating@gmail.com',
    currentLocation: 'Kadapa, Andhra Pradesh',
    occupation: 'Student at Govt. Polytechnic College, Panyam',
    emergencyContactName: 'R. K. Reddy (Father)',
    emergencyContactPhone: '9849098765',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [createdReservation, setCreatedReservation] = useState<Reservation | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const prop = propertyService.getPropertyById(propertyId);
    if (prop) {
      setProperty(prop);
      const targetRoom = prop.rooms.find((r: RoomUnit) => r.roomNo === roomId) || prop.rooms[0];
      setRoom(targetRoom);
    } else {
      setProperty(null);
      setRoom(null);
    }

    const user = authService.getCurrentUser();
    if (user) {
      setRenter((prev) => ({
        ...prev,
        fullName: user.fullName || prev.fullName,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
        currentLocation: user.currentLocation || prev.currentLocation,
        occupation: user.occupation || prev.occupation,
      }));
    }

    setLoading(false);
  }, [propertyId, roomId]);

  const handleToggleAddon = (addon: ReservationAddon) => {
    setSelectedAddons((prev) => {
      const exists = prev.some((a) => a.id === addon.id);
      if (exists) {
        return prev.filter((a) => a.id !== addon.id);
      } else {
        return [...prev, addon];
      }
    });
  };

  const handleRenterChange = (field: keyof RenterProfile, value: string) => {
    setRenter((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleContinueToRenter = () => {
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleContinueToReview = () => {
    const validationErrors = reservationService.validateRenter(renter);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmitReservation = () => {
    if (!property || !room) return;
    setIsSubmitting(true);
    setSubmissionError(null);

    setTimeout(async () => {
      const result = await reservationService.createReservation({
        propertyId: property.id,
        roomNo: room.roomNo,
        moveInDate,
        durationMonths,
        durationLabel,
        foodPlan,
        foodPlanLabel,
        selectedAddons,
        renter,
      });

      setIsSubmitting(false);

      if (result.success && result.reservation) {
        setCreatedReservation(result.reservation);
        setCurrentStep(4);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setSubmissionError(result.error || 'Failed to record reservation request.');
      }
    }, 600);
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '6rem 2rem', minHeight: '80vh' }}>
        <div style={{ height: '40px', width: '250px', background: 'rgba(255, 255, 255, 0.2)', borderRadius: '8px', marginBottom: '2rem' }} />
        <div style={{ height: '400px', width: '100%', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '16px' }} />
      </div>
    );
  }

  if (!property || !room) {
    return (
      <div className="container" style={{ padding: '6rem 2rem', minHeight: '75vh', textAlign: 'center' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto' }}>
          <AlertCircle size={48} color="var(--c-red)" style={{ margin: '0 auto 1.5rem auto' }} />
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem' }}>
            Room Selection Unavailable
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.75rem' }}>
            The requested property or room could not be resolved from our verified directory.
          </p>
          <button onClick={onBackToExplore} className="btn-iridescent" style={{ padding: '0.75rem 1.75rem' }}>
            Return to Available Stays
          </button>
        </div>
      </div>
    );
  }

  // Pre-submission availability guard
  if (currentStep < 4 && room.status !== 'AVAILABLE') {
    return (
      <div className="container" style={{ padding: '6rem 2rem', minHeight: '75vh', textAlign: 'center' }}>
        <div className="neomorph-card" style={{ maxWidth: '540px', margin: '0 auto', padding: '3rem 2rem' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.15)',
              color: 'var(--c-red)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem auto',
            }}
          >
            <Lock size={32} />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
            Room {room.roomNo} Is No Longer Available
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem' }}>
            This unit is currently flagged as <strong>{room.status}</strong> and cannot accept new reservation
            requests. Please choose another available room in {property.name}.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button onClick={onBackToProperty} className="btn-iridescent" style={{ padding: '0.8rem 1.75rem', fontWeight: 800 }}>
              View Other Rooms in {property.name}
            </button>
            <button onClick={onBackToExplore} className="neomorph-btn" style={{ padding: '0.8rem 1.5rem', fontWeight: 700 }}>
              Back to Stays
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate live prices
  const roomRent = room.rent;
  const foodCost = foodPlan === 'full-mess' ? 1500 : 0;
  const addonCost = selectedAddons.reduce((sum, a) => sum + a.monthlyPrice, 0);
  const deposit = room.deposit || property.securityDeposit || 2000;
  const monthlyTotal = roomRent + foodCost + addonCost;
  const initialTotal = monthlyTotal + deposit;

  const pricingSummary = {
    roomRent,
    foodCost,
    addonCost,
    deposit,
    monthlyTotal,
    initialTotal,
  };

  const steps = [
    { num: 1, label: '01 ROOM', title: 'Unit Setup' },
    { num: 2, label: '02 DETAILS', title: 'Renter Info' },
    { num: 3, label: '03 REVIEW', title: 'Verify & Total' },
    { num: 4, label: '04 CONFIRMED', title: 'Confirmation' },
  ];

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
        {/* Navigation Breadcrumb Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '1.5rem',
          }}
        >
          <button
            onClick={onBackToProperty}
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
            <span>Back to Property ({property.name})</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Inveni Stay</span>
            <span>/</span>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{property.town}</span>
            <span>/</span>
            <span style={{ color: '#0f172a', fontWeight: 800 }}>Reserve Room {room.roomNo}</span>
          </div>
        </div>

        {/* Clean Neomorphic Progress Stepper Indicator */}
        <div
          className="neomorph-inset"
          style={{
            padding: '1rem 1.5rem',
            borderRadius: 'var(--radius-lg)',
            marginBottom: '2.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          {steps.map((s, index) => {
            const isActive = currentStep === s.num;
            const isDone = currentStep > s.num;
            return (
              <React.Fragment key={s.num}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    opacity: isActive || isDone ? 1 : 0.5,
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: isDone
                        ? 'var(--c-green)'
                        : isActive
                        ? 'var(--c-sky-blue)'
                        : 'rgba(194, 202, 216, 0.8)',
                      color: isDone || isActive ? '#ffffff' : '#475569',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      boxShadow: isActive ? '0 0 12px rgba(14, 165, 233, 0.5)' : 'none',
                    }}
                  >
                    {isDone ? <CheckCircle2 size={18} /> : s.num}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: isActive ? 'var(--c-sky-blue)' : '#0f172a' }}>
                      {s.label}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                      {s.title}
                    </div>
                  </div>
                </div>

                {index < steps.length - 1 && (
                  <div
                    style={{
                      flex: 1,
                      height: '2px',
                      background: isDone ? 'var(--c-green)' : 'rgba(194, 202, 216, 0.8)',
                      minWidth: '20px',
                    }}
                    className="stepper-line"
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Error Notification with Stale Availability Remediation (Section 26 & 60) */}
        {submissionError && (
          <div
            style={{
              background: '#fef2f2',
              border: '1.5px solid #fecaca',
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              color: '#991b1b',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 700 }}>
              <AlertCircle size={22} style={{ flexShrink: 0 }} />
              <div>
                <div>{submissionError}</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 500, color: '#b91c1c', marginTop: '2px' }}>
                  Availability was refreshed from the authoritative database. Please select another vacant unit.
                </div>
              </div>
            </div>
            <button
              onClick={onBackToProperty}
              className="btn-iridescent"
              style={{
                padding: '0.5rem 1rem',
                fontSize: '0.82rem',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              View Available Rooms →
            </button>
          </div>
        )}

        {/* Main Content Layout: Two Columns on Desktop */}
        {currentStep === 4 && createdReservation ? (
          <Step4Confirmed
            reservation={createdReservation}
            onViewDetails={onNavigateToReservationDetail}
            onViewMyReservations={onNavigateToMyReservations}
            onBackToExplore={onBackToExplore}
          />
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: '2rem',
              alignItems: 'flex-start',
            }}
            className="reservation-grid"
          >
            {/* Left Column: Multi-Step Forms */}
            <div>
              {currentStep === 1 && (
                <Step1RoomSetup
                  property={property}
                  room={room}
                  moveInDate={moveInDate}
                  onMoveInDateChange={setMoveInDate}
                  durationMonths={durationMonths}
                  durationLabel={durationLabel}
                  onDurationChange={(m, l) => {
                    setDurationMonths(m);
                    setDurationLabel(l);
                  }}
                  foodPlan={foodPlan}
                  onFoodPlanChange={(p, l) => {
                    setFoodPlan(p);
                    setFoodPlanLabel(l);
                  }}
                  selectedAddons={selectedAddons}
                  onToggleAddon={handleToggleAddon}
                  onChangeRoom={onBackToProperty}
                  onContinue={handleContinueToRenter}
                />
              )}

              {currentStep === 2 && (
                <Step2RenterDetails
                  renter={renter}
                  onChange={handleRenterChange}
                  onBack={() => setCurrentStep(1)}
                  onContinue={handleContinueToReview}
                  errors={errors}
                />
              )}

              {currentStep === 3 && (
                <Step3ReviewStay
                  property={property}
                  room={room}
                  moveInDate={moveInDate}
                  durationLabel={durationLabel}
                  foodPlan={foodPlan}
                  foodPlanLabel={foodPlanLabel}
                  selectedAddons={selectedAddons}
                  renter={renter}
                  pricing={pricingSummary}
                  onBack={() => setCurrentStep(2)}
                  onSubmit={handleSubmitReservation}
                  isSubmitting={isSubmitting}
                />
              )}
            </div>

            {/* Right Column: Sticky Summary Ledger */}
            <aside
              className="neomorph-card sticky-sidebar"
              style={{
                padding: '1.75rem',
                position: 'sticky',
                top: '100px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Building2 size={18} color="var(--c-sky-blue)" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Reservation Summary
                </h3>
              </div>

              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>{property.name}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                {property.town}, Andhra Pradesh
              </div>

              <div className="neomorph-inset" style={{ padding: '0.85rem 1rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: '#64748b' }}>Unit:</span>
                  <span style={{ fontWeight: 800, color: '#0f172a' }}>Room {room.roomNo} ({room.type})</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginTop: '0.35rem' }}>
                  <span style={{ color: '#64748b' }}>Floor:</span>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>Floor {room.floor}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginTop: '0.35rem' }}>
                  <span style={{ color: '#64748b' }}>Arrival:</span>
                  <span style={{ fontWeight: 800, color: 'var(--c-sky-blue)' }}>{moveInDate}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginTop: '0.35rem' }}>
                  <span style={{ color: '#64748b' }}>Duration:</span>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>{durationLabel}</span>
                </div>
              </div>

              {/* Price Rows */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.88rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Room Rent:</span>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>₹{roomRent.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Food / Mess:</span>
                  <span style={{ fontWeight: 700, color: foodCost > 0 ? '#0f172a' : 'var(--c-green)' }}>
                    {foodCost > 0 ? `₹${foodCost.toLocaleString()}` : 'Included'}
                  </span>
                </div>
                {addonCost > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Add-ons ({selectedAddons.length}):</span>
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>+₹{addonCost.toLocaleString()}</span>
                  </div>
                )}

                <div style={{ height: '1px', background: 'rgba(194, 202, 216, 0.8)', margin: '0.35rem 0' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>Monthly Total:</span>
                  <span style={{ fontWeight: 800, color: 'var(--c-gold)', fontFamily: 'var(--font-metrics)', fontSize: '1.25rem' }}>
                    ₹{monthlyTotal.toLocaleString()}<span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>/mo</span>
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginTop: '0.2rem' }}>
                  <span style={{ color: '#64748b' }}>Refundable Deposit:</span>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>₹{deposit.toLocaleString()}</span>
                </div>

                <div
                  style={{
                    marginTop: '0.75rem',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(234, 179, 8, 0.12)',
                    border: '1px solid rgba(234, 179, 8, 0.3)',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#854d0e' }}>
                    ESTIMATED INITIAL MOVE-IN
                  </div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--c-gold)', fontFamily: 'var(--font-metrics)' }}>
                    ₹{initialTotal.toLocaleString()}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '1.25rem', fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <ShieldCheck size={16} color="var(--c-green)" />
                <span>Zero reservation fee during hackathon demo</span>
              </div>
            </aside>
          </div>
        )}
      </div>

      <style>{`
        @media (min-width: 992px) {
          .reservation-grid {
            grid-template-columns: 1fr 360px !important;
          }
        }
        @media (max-width: 640px) {
          .stepper-line {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};
