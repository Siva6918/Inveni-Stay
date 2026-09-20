import React from 'react';
import { PropertyListing, Facility } from '../../types';
import {
  Building2,
  Utensils,
  Wifi,
  ShieldAlert,
  Zap,
  Clock,
  Shirt,
  Bike,
  Droplets,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';

interface PropertyOverviewProps {
  property: PropertyListing;
}

export const PropertyOverview: React.FC<PropertyOverviewProps> = ({ property }) => {
  const getFacilityIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('food') || lower.includes('meal') || lower.includes('mess')) return <Utensils size={18} />;
    if (lower.includes('wifi') || lower.includes('internet')) return <Wifi size={18} />;
    if (lower.includes('backup') || lower.includes('power')) return <Zap size={18} />;
    if (lower.includes('cctv') || lower.includes('security')) return <ShieldAlert size={18} />;
    if (lower.includes('laundry') || lower.includes('washing')) return <Shirt size={18} />;
    if (lower.includes('parking') || lower.includes('bike')) return <Bike size={18} />;
    if (lower.includes('water') || lower.includes('purifier')) return <Droplets size={18} />;
    if (lower.includes('study') || lower.includes('desk')) return <BookOpen size={18} />;
    return <CheckCircle2 size={18} />;
  };

  const keyFacts = [
    { label: 'Property Classification', value: `${property.propertyType} (${property.gender})` },
    { label: 'Total Capacity', value: `${property.totalRooms} Rooms across 2 Floors` },
    { label: 'Live Vacancy Status', value: `${property.availableRoomsCount} Rooms Ready For Move-in` },
    { label: 'Deposit Requirement', value: `₹${property.securityDeposit.toLocaleString()} (Refundable upon checkout)` },
    { label: 'Notice Period', value: '30 Days Advance Written Notice' },
    { label: 'Night Gate Curfew', value: property.curfewTime || '10:30 PM (Biometric entry)' },
    { label: 'Food Plan', value: property.foodSchedule || '3 Fresh Homestyle Andhra Meals/day included' },
    { label: 'Host Response Metric', value: property.ownerResponseTime || '< 15 mins average' },
  ];

  const defaultRules = property.rules || [
    'Strict quiet hours observed between 10:00 PM and 6:00 AM for student study focus',
    'Smoking, alcohol, and prohibited substances are strictly disallowed on premises',
    'Day visitors are permitted in ground floor lounge only with caretaker register entry',
    'Electricity sub-meter readings taken on 1st of every month for transparent billing',
  ];

  return (
    <section style={{ marginBottom: '3.5rem' }}>
      {/* 1. Property Quick Facts Grid */}
      <div style={{ marginBottom: '2.75rem' }}>
        <div className="metaverse-hud" style={{ marginBottom: '0.75rem' }}>
          <Building2 size={14} color="var(--c-sky-blue)" />
          <span>[FACILITY SPECS & LEASE TERMS]</span>
        </div>
        <h3
          style={{
            fontFamily: 'var(--font-headline)',
            fontSize: '1.65rem',
            fontWeight: 800,
            color: '#0f172a',
            textTransform: 'uppercase',
            letterSpacing: '0.02em',
            marginBottom: '1.25rem',
          }}
        >
          Property Architecture & Tenancy Terms
        </h3>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1rem',
          }}
        >
          {keyFacts.map((fact, idx) => (
            <div
              key={idx}
              style={{
                background: 'var(--surface-neomorph)',
                border: '1px solid rgba(255, 255, 255, 0.9)',
                borderRadius: 'var(--radius-md)',
                padding: '1.1rem 1.25rem',
                boxShadow: 'var(--shadow-neomorph-sm)',
              }}
            >
              <div
                style={{
                  fontSize: '0.74rem',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontWeight: 700,
                  marginBottom: '0.35rem',
                }}
              >
                {fact.label}
              </div>
              <div
                style={{
                  fontSize: '0.95rem',
                  color: '#0f172a',
                  fontWeight: 800,
                }}
              >
                {fact.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Verified Amenities Grid */}
      <div style={{ marginBottom: '2.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h3
            style={{
              fontFamily: 'var(--font-headline)',
              fontSize: '1.65rem',
              fontWeight: 800,
              color: '#0f172a',
              textTransform: 'uppercase',
              letterSpacing: '0.02em',
              margin: 0,
            }}
          >
            Verified On-Premise Amenities
          </h3>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'rgba(16, 185, 129, 0.12)',
              color: 'var(--c-green)',
              padding: '0.3rem 0.8rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.78rem',
              fontWeight: 800,
              border: '1px solid rgba(16, 185, 129, 0.35)',
            }}
          >
            ● All verified by physical inspection
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.1rem',
          }}
        >
          {property.facilities.map((fac) => (
            <div
              key={fac.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem',
                background: 'var(--surface-neomorph)',
                border: '1px solid rgba(255, 255, 255, 0.9)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                boxShadow: 'var(--shadow-neomorph-sm)',
                transition: 'all 0.2s ease',
              }}
            >
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.18) 0%, rgba(236, 72, 153, 0.18) 100%)',
                  color: 'var(--c-sky-blue)',
                  border: '1.5px solid rgba(14, 165, 233, 0.4)',
                  boxShadow: '0 0 10px rgba(14, 165, 233, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {getFacilityIcon(fac.name)}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span style={{ color: '#0f172a', fontWeight: 800, fontSize: '0.96rem' }}>
                    {fac.name}
                  </span>
                  {fac.highlight && (
                    <span
                      style={{
                        fontSize: '0.7rem',
                        background: 'rgba(132, 204, 22, 0.18)',
                        color: '#4d7c0f',
                        padding: '0.15rem 0.5rem',
                        borderRadius: 'var(--radius-full)',
                        fontWeight: 800,
                        border: '1px solid rgba(132, 204, 22, 0.35)',
                      }}
                    >
                      {fac.highlight}
                    </span>
                  )}
                </div>
                <p style={{ color: '#475569', fontSize: '0.84rem', margin: 0, lineHeight: 1.45 }}>
                  {fac.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Tenancy Guidelines & House Rules (Neomorphic Raised Housing) */}
      <div
        style={{
          background: 'var(--surface-neomorph)',
          border: '1.5px solid rgba(255, 255, 255, 0.9)',
          borderRadius: 'var(--radius-xl)',
          padding: '1.75rem',
          boxShadow: 'var(--shadow-neomorph)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <FileText size={20} color="var(--c-gold)" />
          <h4
            style={{
              color: '#0f172a',
              fontSize: '1.1rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              margin: 0,
            }}
          >
            Host Tenancy Guidelines & Rules
          </h4>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '0.9rem' }}>
          {defaultRules.map((rule, rIdx) => (
            <div
              key={rIdx}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.65rem',
                fontSize: '0.88rem',
                color: '#334155',
                lineHeight: 1.45,
                background: 'var(--surface-neomorph-inset)',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid rgba(194, 202, 216, 0.3)',
              }}
            >
              <CheckCircle2 size={16} color="var(--c-sky-blue)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>{rule}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
