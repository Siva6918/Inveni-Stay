import React, { useState } from 'react';
import { RenterProfile } from '../../types';
import { User, Phone, Mail, MapPin, Briefcase, HeartHandshake, ArrowRight, ArrowLeft, ShieldCheck, AlertCircle } from 'lucide-react';

interface Step2RenterDetailsProps {
  renter: RenterProfile;
  onChange: (field: keyof RenterProfile, value: string) => void;
  onBack: () => void;
  onContinue: () => void;
  errors: Record<string, string>;
}

export const Step2RenterDetails: React.FC<Step2RenterDetailsProps> = ({
  renter,
  onChange,
  onBack,
  onContinue,
  errors,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="neomorph-card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.5rem' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: 'rgba(14, 165, 233, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--c-sky-blue)',
            }}
          >
            <User size={20} />
          </div>
          <div>
            <div className="badge-metaverse" style={{ fontSize: '0.72rem', marginBottom: '0.2rem' }}>
              [STEP 02: RENTER PROFILE]
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Primary Renter Information
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0.2rem 0 0 0' }}>
              This information is shared only with the verified property coordinator for demo accommodation record.
            </p>
          </div>
        </div>

        {/* Form Inputs Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {/* Full Name */}
          <div>
            <label
              htmlFor="fullNameInput"
              style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.45rem' }}
            >
              Full Legal Name <span style={{ color: 'var(--c-red)' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="fullNameInput"
                type="text"
                value={renter.fullName}
                onChange={(e) => onChange('fullName', e.target.value)}
                placeholder="e.g. Venkata Siva Kumar"
                className="neomorph-inset"
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem 0.85rem 2.6rem',
                  borderRadius: 'var(--radius-md)',
                  border: errors.fullName ? '1.5px solid var(--c-red)' : '1px solid rgba(194, 202, 216, 0.8)',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  color: '#0f172a',
                  background: 'var(--surface-neomorph)',
                  outline: 'none',
                }}
              />
              <User
                size={18}
                color="#64748b"
                style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>
            {errors.fullName && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--c-red)', fontSize: '0.8rem', marginTop: '0.35rem' }}>
                <AlertCircle size={14} />
                <span>{errors.fullName}</span>
              </div>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label
              htmlFor="phoneInput"
              style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.45rem' }}
            >
              Mobile Number (WhatsApp) <span style={{ color: 'var(--c-red)' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="phoneInput"
                type="tel"
                value={renter.phone}
                onChange={(e) => onChange('phone', e.target.value)}
                placeholder="10-digit mobile (e.g. 9849012345)"
                maxLength={10}
                className="neomorph-inset"
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem 0.85rem 2.6rem',
                  borderRadius: 'var(--radius-md)',
                  border: errors.phone ? '1.5px solid var(--c-red)' : '1px solid rgba(194, 202, 216, 0.8)',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  color: '#0f172a',
                  background: 'var(--surface-neomorph)',
                  outline: 'none',
                }}
              />
              <Phone
                size={18}
                color="#64748b"
                style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>
            {errors.phone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--c-red)', fontSize: '0.8rem', marginTop: '0.35rem' }}>
                <AlertCircle size={14} />
                <span>{errors.phone}</span>
              </div>
            )}
          </div>

          {/* Email Address */}
          <div>
            <label
              htmlFor="emailInput"
              style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.45rem' }}
            >
              Email Address <span style={{ color: 'var(--c-red)' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="emailInput"
                type="email"
                value={renter.email}
                onChange={(e) => onChange('email', e.target.value)}
                placeholder="e.g. siva.student@gmail.com"
                className="neomorph-inset"
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem 0.85rem 2.6rem',
                  borderRadius: 'var(--radius-md)',
                  border: errors.email ? '1.5px solid var(--c-red)' : '1px solid rgba(194, 202, 216, 0.8)',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  color: '#0f172a',
                  background: 'var(--surface-neomorph)',
                  outline: 'none',
                }}
              />
              <Mail
                size={18}
                color="#64748b"
                style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>
            {errors.email && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--c-red)', fontSize: '0.8rem', marginTop: '0.35rem' }}>
                <AlertCircle size={14} />
                <span>{errors.email}</span>
              </div>
            )}
          </div>

          {/* Current Location */}
          <div>
            <label
              htmlFor="locationInput"
              style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.45rem' }}
            >
              Current Departure City / Origin <span style={{ color: 'var(--c-red)' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="locationInput"
                type="text"
                value={renter.currentLocation}
                onChange={(e) => onChange('currentLocation', e.target.value)}
                placeholder="e.g. Kadapa, Andhra Pradesh"
                className="neomorph-inset"
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem 0.85rem 2.6rem',
                  borderRadius: 'var(--radius-md)',
                  border: errors.currentLocation ? '1.5px solid var(--c-red)' : '1px solid rgba(194, 202, 216, 0.8)',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  color: '#0f172a',
                  background: 'var(--surface-neomorph)',
                  outline: 'none',
                }}
              />
              <MapPin
                size={18}
                color="#64748b"
                style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>
            {errors.currentLocation && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--c-red)', fontSize: '0.8rem', marginTop: '0.35rem' }}>
                <AlertCircle size={14} />
                <span>{errors.currentLocation}</span>
              </div>
            )}
          </div>

          {/* Occupation / Student Status */}
          <div style={{ gridColumn: '1 / -1' }}>
            <label
              htmlFor="occupationInput"
              style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.45rem' }}
            >
              Student / Professional Role <span style={{ color: 'var(--c-red)' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="occupationInput"
                type="text"
                value={renter.occupation}
                onChange={(e) => onChange('occupation', e.target.value)}
                placeholder="e.g. 1st Year Diploma Student at Govt. Polytechnic College, Panyam"
                className="neomorph-inset"
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem 0.85rem 2.6rem',
                  borderRadius: 'var(--radius-md)',
                  border: errors.occupation ? '1.5px solid var(--c-red)' : '1px solid rgba(194, 202, 216, 0.8)',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  color: '#0f172a',
                  background: 'var(--surface-neomorph)',
                  outline: 'none',
                }}
              />
              <Briefcase
                size={18}
                color="#64748b"
                style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>
            {errors.occupation && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--c-red)', fontSize: '0.8rem', marginTop: '0.35rem' }}>
                <AlertCircle size={14} />
                <span>{errors.occupation}</span>
              </div>
            )}
          </div>

          {/* Optional Emergency Contact */}
          <div>
            <label
              htmlFor="emergencyNameInput"
              style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.45rem' }}
            >
              Parent / Guardian Name (Optional)
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="emergencyNameInput"
                type="text"
                value={renter.emergencyContactName || ''}
                onChange={(e) => onChange('emergencyContactName', e.target.value)}
                placeholder="e.g. R. K. Reddy (Parent)"
                className="neomorph-inset"
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem 0.85rem 2.6rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(194, 202, 216, 0.8)',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  color: '#0f172a',
                  background: 'var(--surface-neomorph)',
                  outline: 'none',
                }}
              />
              <HeartHandshake
                size={18}
                color="#64748b"
                style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="emergencyPhoneInput"
              style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.45rem' }}
            >
              Guardian Phone Number (Optional)
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="emergencyPhoneInput"
                type="tel"
                value={renter.emergencyContactPhone || ''}
                onChange={(e) => onChange('emergencyContactPhone', e.target.value)}
                placeholder="10-digit contact"
                maxLength={10}
                className="neomorph-inset"
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem 0.85rem 2.6rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(194, 202, 216, 0.8)',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  color: '#0f172a',
                  background: 'var(--surface-neomorph)',
                  outline: 'none',
                }}
              />
              <Phone
                size={18}
                color="#64748b"
                style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>
          </div>
        </div>

        {/* Trust disclosure */}
        <div
          style={{
            marginTop: '1.75rem',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(14, 165, 233, 0.08)',
            border: '1px solid rgba(14, 165, 233, 0.25)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
            fontSize: '0.82rem',
            color: '#475569',
          }}
        >
          <ShieldCheck size={18} color="var(--c-sky-blue)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong>Inveni Verified Privacy:</strong> No sensitive identity documents or Aadhaar numbers are requested online
            in Phase 4. Physical ID verification is inspected on-site by the host upon check-in.
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          onClick={onBack}
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
          <span>Back to Room Setup</span>
        </button>

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
          <span>Continue to Review Stay</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};
