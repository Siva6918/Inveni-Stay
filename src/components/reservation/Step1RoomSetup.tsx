import React from 'react';
import { PropertyListing, RoomUnit, FoodPlanOption, ReservationAddon } from '../../types';
import {
  Calendar,
  Clock,
  Utensils,
  PlusCircle,
  Check,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface Step1RoomSetupProps {
  property: PropertyListing;
  room: RoomUnit;
  moveInDate: string;
  onMoveInDateChange: (date: string) => void;
  durationMonths: number;
  durationLabel: string;
  onDurationChange: (months: number, label: string) => void;
  foodPlan: FoodPlanOption;
  onFoodPlanChange: (plan: FoodPlanOption, label: string) => void;
  selectedAddons: ReservationAddon[];
  onToggleAddon: (addon: ReservationAddon) => void;
  onChangeRoom: () => void;
  onContinue: () => void;
}

const AVAILABLE_ADDONS: ReservationAddon[] = [
  {
    id: 'addon_parking',
    name: 'Covered Two-Wheeler Parking Bay',
    monthlyPrice: 300,
    description: 'Dedicated CCTV-monitored ground parking space with security lock ring',
  },
  {
    id: 'addon_study_lamp',
    name: 'Study Lamp & 4-Socket Surge Dock',
    monthlyPrice: 150,
    description: 'Warm LED adjustable study lamp plus multi-pin surge power strip for laptop',
  },
  {
    id: 'addon_ethernet',
    name: 'Direct High-Speed LAN Port Cable',
    monthlyPrice: 200,
    description: 'Low-latency Cat6 direct ethernet cable connection to room desk',
  },
];

const DURATION_OPTIONS = [
  { months: 1, label: '1 Month', note: 'Trial / Temporary' },
  { months: 3, label: '3 Months', note: 'Quarterly Term' },
  { months: 6, label: '6 Months', note: 'College Semester' },
  { months: 11, label: '11 Months', note: 'Academic Year' },
  { months: 0, label: 'Flexible', note: 'Month-to-Month' },
];

export const Step1RoomSetup: React.FC<Step1RoomSetupProps> = ({
  property,
  room,
  moveInDate,
  onMoveInDateChange,
  durationMonths,
  onDurationChange,
  foodPlan,
  onFoodPlanChange,
  selectedAddons,
  onToggleAddon,
  onChangeRoom,
  onContinue,
}) => {
  const isAvailable = room.status === 'AVAILABLE';

  // Format today's date for date picker min
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* 1. Selected Room Confirmation Card */}
      <div
        className="neomorph-card"
        style={{
          padding: '1.75rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
              <span className="badge-metaverse" style={{ fontSize: '0.72rem' }}>
                [STEP 01: UNIT & MOVE-IN SETUP]
              </span>
              <span
                style={{
                  background: isAvailable ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  color: isAvailable ? 'var(--c-green)' : 'var(--c-red)',
                  border: isAvailable ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                  padding: '0.15rem 0.65rem',
                  borderRadius: 'var(--radius-pill)',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                }}
              >
                ● {room.status}
              </span>
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Room {room.roomNo} • {room.type} Occupancy
            </h2>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              Floor {room.floor} • {property.name}, {property.town}
            </div>
          </div>

          <button
            onClick={onChangeRoom}
            className="neomorph-btn"
            style={{
              padding: '0.55rem 1.15rem',
              fontSize: '0.85rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: '#0f172a',
            }}
          >
            <RotateCcw size={15} />
            <span>Change Room</span>
          </button>
        </div>

        {/* Room Spec Badges */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginTop: '1.25rem' }}>
          <div className="neomorph-inset" style={{ padding: '0.85rem 1.1rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>MONTHLY RENT</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--c-gold)', fontFamily: 'var(--font-metrics)' }}>
              ₹{room.rent.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--c-green)', fontWeight: 700 }}>Meals & Wi-Fi Included</div>
          </div>

          <div className="neomorph-inset" style={{ padding: '0.85rem 1.1rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>SECURITY DEPOSIT</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-metrics)' }}>
              ₹{room.deposit.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>100% Refundable at Move-out</div>
          </div>

          <div className="neomorph-inset" style={{ padding: '0.85rem 1.1rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>VENTILATION & BATH</div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginTop: '0.2rem' }}>
              {room.attachedBath ? 'Attached Bath' : 'Common Bath'}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{room.dimensions || '12 x 10 ft'}</div>
          </div>
        </div>
      </div>

      {/* 2. Preferred Move-In Date Selection */}
      <div className="neomorph-card" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'rgba(14, 165, 233, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--c-sky-blue)',
            }}
          >
            <Calendar size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Preferred Move-In Date
            </h3>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
              Select the intended day you will arrive at the property
            </div>
          </div>
        </div>

        <div style={{ maxWidth: '360px', marginTop: '1rem' }}>
          <label
            htmlFor="moveInDateInput"
            style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.4rem' }}
          >
            Arrival Date (Future Dates Only)
          </label>
          <input
            id="moveInDateInput"
            type="date"
            min={todayStr}
            value={moveInDate}
            onChange={(e) => onMoveInDateChange(e.target.value)}
            className="neomorph-inset"
            style={{
              width: '100%',
              padding: '0.85rem 1.1rem',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid rgba(14, 165, 233, 0.4)',
              fontSize: '1rem',
              fontWeight: 700,
              color: '#0f172a',
              background: 'var(--surface-neomorph)',
              outline: 'none',
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.5rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            <Sparkles size={14} color="var(--c-gold)" />
            <span>Ready for move-in from <strong>01 October 2026</strong> or earlier upon request.</span>
          </div>
        </div>
      </div>

      {/* 3. Stay Duration Selection */}
      <div className="neomorph-card" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'rgba(234, 179, 8, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--c-gold)',
            }}
          >
            <Clock size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Expected Stay Duration
            </h3>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
              Choose your expected rental commitment (flexible agreements supported)
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', marginTop: '1rem' }}>
          {DURATION_OPTIONS.map((opt) => {
            const isSelected = durationMonths === opt.months;
            return (
              <button
                key={opt.label}
                type="button"
                onClick={() => onDurationChange(opt.months, opt.label)}
                style={{
                  padding: '1rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  background: isSelected ? '#ffffff' : 'var(--surface-neomorph)',
                  border: isSelected ? '2px solid var(--c-sky-blue)' : '1px solid rgba(194, 202, 216, 0.8)',
                  boxShadow: isSelected
                    ? '0 0 16px rgba(14, 165, 233, 0.35), var(--shadow-neomorph)'
                    : 'var(--shadow-neomorph)',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ fontSize: '1rem', fontWeight: 800, color: isSelected ? 'var(--c-sky-blue)' : '#0f172a' }}>
                  {opt.label}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  {opt.note}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Food / Mess Option */}
      <div className="neomorph-card" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--c-green)',
            }}
          >
            <Utensils size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Food & Dining Plan
            </h3>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
              Authentic Rayalaseema homestyle meals prepared daily
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '1rem' }}>
          <div
            onClick={() => onFoodPlanChange('included', 'Andhra Homestyle Meals (Included in Rent)')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1.1rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              background: foodPlan === 'included' ? '#ffffff' : 'var(--surface-neomorph)',
              border: foodPlan === 'included' ? '2px solid var(--c-green)' : '1px solid rgba(194, 202, 216, 0.8)',
              boxShadow: foodPlan === 'included' ? '0 0 16px rgba(16, 185, 129, 0.25), var(--shadow-neomorph)' : 'var(--shadow-neomorph)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div
                style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  border: foodPlan === 'included' ? '6px solid var(--c-green)' : '2px solid #94a3b8',
                  background: '#ffffff',
                }}
              />
              <div>
                <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>
                  Standard Andhra Homestyle Meals (3 Times Daily)
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                  Breakfast, Lunch with packed tiffin carrier, and Dinner with Sona Masoori rice & Curd
                </div>
              </div>
            </div>
            <span style={{ fontWeight: 800, color: 'var(--c-green)', fontSize: '0.88rem' }}>
              Included in Rent
            </span>
          </div>

          <div
            onClick={() => onFoodPlanChange('full-mess', 'Premium Special Meal Plan (+₹1,500/month)')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1.1rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              background: foodPlan === 'full-mess' ? '#ffffff' : 'var(--surface-neomorph)',
              border: foodPlan === 'full-mess' ? '2px solid var(--c-sky-blue)' : '1px solid rgba(194, 202, 216, 0.8)',
              boxShadow: foodPlan === 'full-mess' ? '0 0 16px rgba(14, 165, 233, 0.25), var(--shadow-neomorph)' : 'var(--shadow-neomorph)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div
                style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  border: foodPlan === 'full-mess' ? '6px solid var(--c-sky-blue)' : '2px solid #94a3b8',
                  background: '#ffffff',
                }}
              />
              <div>
                <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>
                  Premium Weekend Feast & Evening Snacks Pack
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                  Includes extra evening chai/snacks and non-veg / paneer feast twice weekly
                </div>
              </div>
            </div>
            <span style={{ fontWeight: 800, color: 'var(--c-gold)', fontSize: '0.88rem' }}>
              +₹1,500 / month
            </span>
          </div>
        </div>
      </div>

      {/* 5. Optional Add-ons */}
      <div className="neomorph-card" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'rgba(236, 72, 153, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--c-pink)',
            }}
          >
            <PlusCircle size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Optional Convenience Add-ons
            </h3>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
              Enhance your stay setup before physical arrival
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
          {AVAILABLE_ADDONS.map((addon) => {
            const isChecked = selectedAddons.some((a) => a.id === addon.id);
            return (
              <div
                key={addon.id}
                onClick={() => onToggleAddon(addon)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem 1.25rem',
                  borderRadius: 'var(--radius-md)',
                  background: isChecked ? '#ffffff' : 'var(--surface-neomorph)',
                  border: isChecked ? '2px solid var(--c-pink)' : '1px solid rgba(194, 202, 216, 0.8)',
                  boxShadow: isChecked ? '0 0 16px rgba(236, 72, 153, 0.25), var(--shadow-neomorph)' : 'var(--shadow-neomorph)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div
                    style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: 'var(--radius-xs)',
                      background: isChecked ? 'var(--c-pink)' : '#ffffff',
                      border: isChecked ? 'none' : '2px solid #94a3b8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                    }}
                  >
                    {isChecked && <Check size={16} strokeWidth={3} />}
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.92rem' }}>{addon.name}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>{addon.description}</div>
                  </div>
                </div>
                <div style={{ fontWeight: 800, color: 'var(--c-gold)', fontSize: '0.9rem' }}>
                  +₹{addon.monthlyPrice} / mo
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Continue Action */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={onContinue}
          className="btn-iridescent"
          style={{
            padding: '0.85rem 2.25rem',
            fontSize: '1rem',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            cursor: 'pointer',
          }}
        >
          <span>Continue to Renter Details</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};
