import React, { useState } from 'react';
import { MapPin, Navigation, Calendar, Users, IndianRupee, Search, Sparkles, Check } from 'lucide-react';
import { RelocationFilterState } from '../../types';

interface RelocationSearchInputProps {
  onSearchSubmit: (criteria: RelocationFilterState) => void;
}

export const RelocationSearchInput: React.FC<RelocationSearchInputProps> = ({ onSearchSubmit }) => {
  const [destination, setDestination] = useState('Panyam, Andhra Pradesh');
  const [origin, setOrigin] = useState('Kadapa, Andhra Pradesh');
  const [arrivalDate, setArrivalDate] = useState('2026-09-28');
  const [userType, setUserType] = useState<'Student' | 'Working Professional' | 'Job Seeker' | 'All'>('Student');
  const [budgetMax, setBudgetMax] = useState<number>(6000);
  const [roomPreference, setRoomPreference] = useState<'Any' | 'Single' | 'Double'>('Single');
  const [foodRequired, setFoodRequired] = useState(true);
  const [wifiRequired, setWifiRequired] = useState(true);
  const [isFocused, setIsFocused] = useState(false);

  const handleApplyPreset = (preset: 'student' | 'trainee' | 'flexible') => {
    if (preset === 'student') {
      setDestination('Panyam, Andhra Pradesh');
      setOrigin('Kadapa, Andhra Pradesh');
      setUserType('Student');
      setBudgetMax(6000);
      setRoomPreference('Single');
      setFoodRequired(true);
      setWifiRequired(true);
    } else if (preset === 'trainee') {
      setDestination('Panyam Industrial Zone, AP');
      setOrigin('Kurnool, Andhra Pradesh');
      setUserType('Working Professional');
      setBudgetMax(5000);
      setRoomPreference('Double');
      setFoodRequired(true);
      setWifiRequired(true);
    } else {
      setDestination('Panyam Town Center');
      setOrigin('Tirupati, AP');
      setUserType('All');
      setBudgetMax(7000);
      setRoomPreference('Any');
      setFoodRequired(false);
      setWifiRequired(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchSubmit({
      destination,
      origin,
      arrivalDate,
      userType,
      budgetMax,
      roomPreference,
      foodRequired,
      wifiRequired,
    });
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '920px',
        margin: '0 auto',
      }}
    >
      {/* Floating Coordinates & Regional Hub Pill */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0.75rem',
          padding: '0 0.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="radar-pulse" />
          <span
            style={{
              fontFamily: 'var(--font-metrics)',
              fontSize: '0.8rem',
              color: '#0284c7',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            Corridor Live: 15.518° N, 78.349° E (Panyam Hub)
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span
            style={{
              fontFamily: 'var(--font-handwritten)',
              fontSize: '1rem',
              color: 'var(--c-goldenrod)',
            }}
          >
            Direct Highway Access
          </span>
        </div>
      </div>

      {/* Main Glass Search Container */}
      <form
        onSubmit={handleSubmit}
        className="iridescent-card"
        style={{
          padding: '1.75rem',
          border: isFocused ? '1px solid #0284c7' : '1px solid var(--border-medium)',
          boxShadow: isFocused ? '0 12px 40px rgba(2, 132, 199, 0.15)' : 'var(--shadow-lg)',
          transition: 'all var(--transition-normal)',
        }}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      >
        {/* Top Grid: Location Inputs */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
            gap: '1.25rem',
            marginBottom: '1.5rem',
          }}
        >
          {/* Destination */}
          <div style={{ position: 'relative' }}>
            <label
              style={{
                display: 'block',
                fontFamily: 'var(--font-metrics)',
                fontSize: '0.75rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--c-goldenrod)',
                marginBottom: '0.4rem',
                fontWeight: 600,
              }}
            >
              1. Where are you moving? (Destination)
            </label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                background: 'var(--surface-1)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem 1rem',
              }}
            >
              <MapPin size={18} color="var(--c-lawn-green)" />
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Enter destination town or college"
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-ui)',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                }}
                required
              />
            </div>
          </div>

          {/* Current Location (Origin) */}
          <div style={{ position: 'relative' }}>
            <label
              style={{
                display: 'block',
                fontFamily: 'var(--font-metrics)',
                fontSize: '0.75rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--text-secondary)',
                marginBottom: '0.4rem',
                fontWeight: 600,
              }}
            >
              2. Where are you now? (Origin)
            </label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                background: 'var(--surface-1)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem 1rem',
              }}
            >
              <Navigation size={18} color="#0284c7" />
              <input
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder="Current city or hometown"
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-ui)',
                  fontSize: '0.95rem',
                  fontWeight: 500,
                }}
              />
            </div>
          </div>
        </div>

        {/* Secondary Grid: Date, Profile, Budget, Room Type */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))',
            gap: '1rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--border-subtle)',
            marginBottom: '1.5rem',
          }}
        >
          {/* Arrival Date */}
          <div>
            <label
              style={{
                display: 'block',
                fontFamily: 'var(--font-metrics)',
                fontSize: '0.7rem',
                color: 'var(--text-muted)',
                marginBottom: '0.35rem',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              Expected Arrival
            </label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'var(--surface-1)',
                padding: '0.55rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <Calendar size={15} color="var(--c-goldenrod)" />
              <input
                type="date"
                value={arrivalDate}
                onChange={(e) => setArrivalDate(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-ui)',
                  fontSize: '0.85rem',
                  width: '100%',
                }}
              />
            </div>
          </div>

          {/* User Type */}
          <div>
            <label
              style={{
                display: 'block',
                fontFamily: 'var(--font-metrics)',
                fontSize: '0.7rem',
                color: 'var(--text-muted)',
                marginBottom: '0.35rem',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              Relocating As
            </label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'var(--surface-1)',
                padding: '0.55rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <Users size={15} color="#0284c7" />
              <select
                value={userType}
                onChange={(e) => setUserType(e.target.value as any)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-ui)',
                  fontSize: '0.85rem',
                  width: '100%',
                  cursor: 'pointer',
                }}
              >
                <option value="Student" style={{ background: '#ffffff', color: '#0f172a' }}>Student</option>
                <option value="Working Professional" style={{ background: '#ffffff', color: '#0f172a' }}>Working Professional</option>
                <option value="Job Seeker" style={{ background: '#ffffff', color: '#0f172a' }}>Exam / Trainee</option>
                <option value="All" style={{ background: '#ffffff', color: '#0f172a' }}>Any Category</option>
              </select>
            </div>
          </div>

          {/* Room Type */}
          <div>
            <label
              style={{
                display: 'block',
                fontFamily: 'var(--font-metrics)',
                fontSize: '0.7rem',
                color: 'var(--text-muted)',
                marginBottom: '0.35rem',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              Room Type
            </label>
            <div style={{ display: 'flex', gap: '0.35rem' }}>
              {(['Single', 'Double', 'Any'] as const).map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setRoomPreference(r)}
                  style={{
                    flex: 1,
                    padding: '0.55rem 0.4rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8rem',
                    fontFamily: 'var(--font-ui)',
                    fontWeight: roomPreference === r ? 700 : 500,
                    background: roomPreference === r ? 'rgba(218, 165, 32, 0.2)' : 'var(--surface-1)',
                    color: roomPreference === r ? 'var(--c-yellow)' : 'var(--text-secondary)',
                    border: roomPreference === r ? '1px solid var(--c-goldenrod)' : '1px solid var(--border-subtle)',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Budget Cap */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label
                style={{
                  fontFamily: 'var(--font-metrics)',
                  fontSize: '0.7rem',
                  color: 'var(--text-muted)',
                  marginBottom: '0.35rem',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}
              >
                Max Rent / Month
              </label>
              <span
                style={{
                  fontFamily: 'var(--font-metrics)',
                  fontSize: '0.85rem',
                  color: 'var(--c-lawn-green)',
                  fontWeight: 600,
                }}
              >
                ₹{budgetMax.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min={3000}
              max={12000}
              step={500}
              value={budgetMax}
              onChange={(e) => setBudgetMax(Number(e.target.value))}
              style={{
                width: '100%',
                accentColor: 'var(--c-goldenrod)',
                cursor: 'pointer',
                marginTop: '0.4rem',
              }}
            />
          </div>
        </div>

        {/* Checkbox Toggles & CTA Bar */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            paddingTop: '1rem',
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                cursor: 'pointer',
                fontSize: '0.85rem',
                color: foodRequired ? 'var(--text-primary)' : 'var(--text-muted)',
              }}
            >
              <input
                type="checkbox"
                checked={foodRequired}
                onChange={(e) => setFoodRequired(e.target.checked)}
                style={{ accentColor: 'var(--c-lawn-green)' }}
              />
              <span>Mess Food Included</span>
            </label>

            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                cursor: 'pointer',
                fontSize: '0.85rem',
                color: wifiRequired ? 'var(--text-primary)' : 'var(--text-muted)',
              }}
            >
              <input
                type="checkbox"
                checked={wifiRequired}
                onChange={(e) => setWifiRequired(e.target.checked)}
                style={{ accentColor: '#0284c7' }}
              />
              <span>High-Speed Wi-Fi</span>
            </label>
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{
              padding: '0.85rem 2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              fontWeight: 800,
              fontSize: '0.92rem',
              cursor: 'pointer',
              border: 'none',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <Search size={18} />
            <span>Discover Verified Rooms</span>
          </button>
        </div>
      </form>

      {/* Preset Personas (Section 2.4 - Instant Context Switch) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          flexWrap: 'wrap',
          marginTop: '0.85rem',
          padding: '0 0.5rem',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-metrics)',
            fontSize: '0.72rem',
            color: 'var(--text-muted)',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}
        >
          Quick Relocation Preset:
        </span>

        <button
          type="button"
          onClick={() => handleApplyPreset('student')}
          style={{
            fontSize: '0.78rem',
            fontFamily: 'var(--font-ui)',
            background: 'var(--surface-1)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-secondary)',
            padding: '0.3rem 0.75rem',
            borderRadius: 'var(--radius-full)',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--c-goldenrod)')}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
        >
          🎓 Polytechnic Student (Single / Attached, &lt; ₹4,500)
        </button>

        <button
          type="button"
          onClick={() => handleApplyPreset('trainee')}
          style={{
            fontSize: '0.78rem',
            fontFamily: 'var(--font-ui)',
            background: '#e0f2fe',
            border: '1px solid #bae6fd',
            color: '#0284c7',
            padding: '0.3rem 0.75rem',
            borderRadius: 'var(--radius-full)',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#bae6fd')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#e0f2fe')}
        >
          💼 Industrial Trainee (Double Sharing, Budget &lt; ₹5,000)
        </button>
      </div>

      {/* Global Destinations Quick Access */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.45rem',
          flexWrap: 'wrap',
          marginTop: '0.65rem',
          padding: '0 0.5rem',
        }}
      >
        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--c-sky-blue)' }}>
          🌍 Worldwide Stays:
        </span>
        {['Panyam', 'Hyderabad', 'Bengaluru', 'London', 'Tokyo', 'New York', 'Dubai', 'Mumbai'].map((city) => (
          <button
            key={city}
            type="button"
            onClick={() => {
              setDestination(city);
              onSearchSubmit({
                destination: city,
                origin,
                arrivalDate,
                userType,
                budgetMax,
                roomPreference,
                foodRequired,
                wifiRequired,
              });
            }}
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              background: destination === city ? 'var(--c-sky-blue)' : '#ffffff',
              color: destination === city ? '#ffffff' : '#334155',
              border: '1px solid #cbd5e1',
              borderRadius: 'var(--radius-full)',
              padding: '0.25rem 0.65rem',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              transition: 'all 0.15s ease',
            }}
          >
            {city}
          </button>
        ))}
      </div>
    </div>
  );
};
