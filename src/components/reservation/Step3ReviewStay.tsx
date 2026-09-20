import React, { useState } from 'react';
import { PropertyListing, RoomUnit, RenterProfile, ReservationAddon, FoodPlanOption, ReservationPricing } from '../../types';
import {
  Building2,
  DoorOpen,
  Calendar,
  Clock,
  Utensils,
  PlusCircle,
  Receipt,
  User,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
  Send,
  Loader2,
  Info,
  Sparkles,
} from 'lucide-react';

interface Step3ReviewStayProps {
  property: PropertyListing;
  room: RoomUnit;
  moveInDate: string;
  durationLabel: string;
  foodPlan: FoodPlanOption;
  foodPlanLabel: string;
  selectedAddons: ReservationAddon[];
  renter: RenterProfile;
  pricing: ReservationPricing;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export const Step3ReviewStay: React.FC<Step3ReviewStayProps> = ({
  property,
  room,
  moveInDate,
  durationLabel,
  foodPlan,
  foodPlanLabel,
  selectedAddons,
  renter,
  pricing,
  onBack,
  onSubmit,
  isSubmitting,
}) => {
  const [agreementChecked, setAgreementChecked] = useState<boolean>(false);

  // Format move-in date nicely
  const formattedDate = new Date(moveInDate).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="neomorph-card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.5rem' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: 'rgba(234, 179, 8, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--c-gold)',
            }}
          >
            <Receipt size={20} />
          </div>
          <div>
            <div className="badge-metaverse" style={{ fontSize: '0.72rem', marginBottom: '0.2rem' }}>
              [STEP 03: PRE-RESERVATION REVIEW]
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Review Your Stay Request
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0.2rem 0 0 0' }}>
              Please verify your selected unit, move-in schedule, and itemized transparent pricing before sending.
            </p>
          </div>
        </div>

        {/* Structured Review Panels */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {/* Property & Room Section */}
          <div className="neomorph-inset" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--c-sky-blue)', fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              <Building2 size={16} />
              <span>Property & Space</span>
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>{property.name}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              {property.address}
            </div>

            <div style={{ marginTop: '0.85rem', paddingTop: '0.85rem', borderTop: '1px dashed rgba(194, 202, 216, 0.8)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Assigned Unit</span>
                <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                  Room {room.roomNo} ({room.type})
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.35rem' }}>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Floor & Bath</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                  Floor {room.floor} • {room.attachedBath ? 'Attached Bath' : 'Common'}
                </span>
              </div>
            </div>
          </div>

          {/* Schedule & Inclusions Section */}
          <div className="neomorph-inset" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--c-gold)', fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              <Calendar size={16} />
              <span>Move-In & Timeline</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Intended Arrival</span>
              <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--c-sky-blue)' }}>
                {formattedDate}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Stay Commitment</span>
              <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                {durationLabel}
              </span>
            </div>

            <div style={{ marginTop: '0.85rem', paddingTop: '0.85rem', borderTop: '1px dashed rgba(194, 202, 216, 0.8)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Food / Mess</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--c-green)' }}>
                  {foodPlan === 'included' ? 'Included (3 Meals)' : '+₹1,500 Feast Plan'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.35rem' }}>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Add-ons</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                  {selectedAddons.length > 0 ? `${selectedAddons.length} Selected (+₹${pricing.addonCost}/mo)` : 'None'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Renter Profile Summary */}
        <div className="neomorph-inset" style={{ padding: '1.25rem', marginTop: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--c-pink)', fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            <User size={16} />
            <span>Renter Details</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Renter Name</div>
              <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>{renter.fullName}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Contact Phone</div>
              <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>+91 {renter.phone}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Email</div>
              <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.88rem' }}>{renter.email}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Relocating From</div>
              <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.88rem' }}>{renter.currentLocation}</div>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Role / Institution</div>
              <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.88rem' }}>{renter.occupation}</div>
            </div>
          </div>
        </div>

        {/* Itemized Price Breakdown */}
        <div
          style={{
            marginTop: '1.5rem',
            background: '#ffffff',
            border: '1.5px solid rgba(14, 165, 233, 0.4)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-neomorph)',
          }}
        >
          <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>
            Itemized Pricing Ledger
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
              <span style={{ color: '#475569' }}>Room Monthly Rent ({room.type})</span>
              <span style={{ fontWeight: 700, color: '#0f172a' }}>₹{pricing.roomRent.toLocaleString()}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
              <span style={{ color: '#475569' }}>Food / Mess Service</span>
              <span style={{ fontWeight: 700, color: pricing.foodCost > 0 ? '#0f172a' : 'var(--c-green)' }}>
                {pricing.foodCost > 0 ? `₹${pricing.foodCost.toLocaleString()}` : 'Included'}
              </span>
            </div>

            {selectedAddons.map((addon) => (
              <div key={addon.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: '#64748b' }}>+ {addon.name}</span>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>₹{addon.monthlyPrice}</span>
              </div>
            ))}

            <div style={{ height: '1px', background: '#e2e8f0', margin: '0.5rem 0' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 800 }}>
              <span style={{ color: '#0f172a' }}>Total Monthly Rent</span>
              <span style={{ color: 'var(--c-gold)', fontFamily: 'var(--font-metrics)', fontSize: '1.25rem' }}>
                ₹{pricing.monthlyTotal.toLocaleString()} / month
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              <span style={{ color: '#475569' }}>Refundable Security Deposit (One-time)</span>
              <span style={{ fontWeight: 700, color: '#0f172a' }}>₹{pricing.deposit.toLocaleString()}</span>
            </div>

            <div
              style={{
                marginTop: '0.75rem',
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(234, 179, 8, 0.1)',
                border: '1px solid rgba(234, 179, 8, 0.3)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#854d0e' }}>
                  ESTIMATED INITIAL MOVE-IN AMOUNT
                </div>
                <div style={{ fontSize: '0.75rem', color: '#a16207' }}>
                  First Month Rent + Refundable Deposit
                </div>
              </div>
              <div
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  color: 'var(--c-gold)',
                  fontFamily: 'var(--font-metrics)',
                }}
              >
                ₹{pricing.initialTotal.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Demo Behavior Notice */}
        <div
          style={{
            marginTop: '1.5rem',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            fontSize: '0.85rem',
            color: '#1e293b',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
          }}
        >
          <Info size={20} color="var(--c-green)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong>Transparent Demo Reservation:</strong> Submitting this request records your room selection
            for this prototype demonstration. No payment is charged online, and no bank transfer occurs. Your booking
            will be created with status <strong>REQUESTED</strong> and assigned a tracking reference ID.
          </div>
        </div>

        {/* Confirmation Checkbox */}
        <div style={{ marginTop: '1.75rem' }}>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              cursor: 'pointer',
              userSelect: 'none',
              fontSize: '0.92rem',
              fontWeight: 700,
              color: '#0f172a',
            }}
          >
            <input
              type="checkbox"
              checked={agreementChecked}
              onChange={(e) => setAgreementChecked(e.target.checked)}
              style={{
                width: '18px',
                height: '18px',
                accentColor: 'var(--c-sky-blue)',
                cursor: 'pointer',
              }}
            />
            <span>I confirm that the reservation details shown above are correct.</span>
          </label>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          onClick={onBack}
          disabled={isSubmitting}
          className="neomorph-btn"
          style={{
            padding: '0.85rem 1.75rem',
            fontSize: '0.95rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#0f172a',
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Edit Details</span>
        </button>

        <button
          onClick={onSubmit}
          disabled={!agreementChecked || isSubmitting}
          className="btn-iridescent"
          style={{
            padding: '0.95rem 2.5rem',
            fontSize: '1.05rem',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            cursor: !agreementChecked || isSubmitting ? 'not-allowed' : 'pointer',
            opacity: !agreementChecked || isSubmitting ? 0.6 : 1,
          }}
        >
          {isSubmitting ? (
            <>
              <Loader2 size={20} className="spin-animation" />
              <span>Recording Demo Reservation...</span>
            </>
          ) : (
            <>
              <Send size={18} />
              <span>Submit Reservation Request</span>
            </>
          )}
        </button>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin-animation {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};
