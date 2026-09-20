import React from 'react';
import { XCircle, CheckCircle2, ArrowRight, AlertTriangle, Sparkles, MapPin, Bed, Key } from 'lucide-react';

export const ProblemStorySection: React.FC = () => {
  return (
    <section id="story" className="section-wrapper" style={{ background: 'var(--canvas-bg-alt)' }}>
      <div className="container">
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 4rem' }}>
          <div className="pill-badge pill-badge--aqua" style={{ marginBottom: '1rem' }}>
            <span>The Relocation Dilemma</span>
          </div>

          <h2
            style={{
              fontFamily: 'var(--font-editorial)',
              fontSize: 'clamp(2rem, 3.8vw, 3rem)',
              color: 'var(--text-primary)',
              marginBottom: '1rem',
              lineHeight: 1.2,
            }}
          >
            Searching Door-to-Door <br />
            <span style={{ color: 'var(--c-crimson)' }}>Should Belong to the Past.</span>
          </h2>

          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.6 }}>
            Every year, lakhs of students and professionals relocate from hometowns like Kadapa to unfamiliar educational and industrial hubs like Panyam. Here is how that journey looks today—and how Inveni Stay rewrites it.
          </p>
        </div>

        {/* Comparison Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
            gap: 'clamp(1.25rem, 3vw, 2rem)',
            alignItems: 'stretch',
          }}
        >
          {/* Traditional Way (Pain / Crimson Tension) */}
          <div
            className="iridescent-card"
            style={{
              padding: 'clamp(1.25rem, 3.5vw, 2.25rem)',
              background: '#fff5f5',
              border: '1.5px solid #fecaca',
              borderRadius: 'var(--radius-xl)',
              boxShadow: '0 4px 20px rgba(220, 38, 38, 0.06)',
              position: 'relative',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#dc2626',
                fontFamily: 'var(--font-metrics)',
                fontSize: '0.85rem',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: '1.25rem',
                fontWeight: 700,
              }}
            >
              <AlertTriangle size={18} />
              <span>The Traditional Nightmare</span>
            </div>

            <h3
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '1.4rem',
                color: 'var(--text-primary)',
                marginBottom: '1.5rem',
                fontWeight: 800,
              }}
            >
              Arrive Blind & Hunt in the Heat
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', gap: '0.85rem' }}>
                <XCircle size={20} color="#dc2626" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4 style={{ color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: 700 }}>Uncertain Vacancy</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    Travel 118 km with heavy luggage, only to find the "single room" you were promised over the phone is occupied.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.85rem' }}>
                <XCircle size={20} color="#dc2626" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4 style={{ color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: 700 }}>Unverified Facilities</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    Landlords claim 24/7 Wi-Fi and attached baths that turn out to be broken or shared among 12 people.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.85rem' }}>
                <XCircle size={20} color="#dc2626" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4 style={{ color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: 700 }}>Zero Room-Level Choice</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    You only get whatever leftover corner room the warden gives you on the spot because you have no other options.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.85rem' }}>
                <XCircle size={20} color="#dc2626" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4 style={{ color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: 700 }}>Haggling Under Pressure</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    Forced to pay arbitrary deposits because day is turning into night and your college orientation is the next morning.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Inveni Stay Way (Confidence / Lawn Green & Gold) */}
          <div
            className="iridescent-card"
            style={{
              padding: 'clamp(1.25rem, 3.5vw, 2.25rem)',
              background: '#ffffff',
              border: '1.5px solid #86efac',
              borderRadius: 'var(--radius-xl)',
              boxShadow: '0 10px 30px rgba(34, 197, 94, 0.08)',
              position: 'relative',
            }}
          >
            {/* Top Recommended Tag */}
            <div
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1.25rem',
                fontFamily: 'var(--font-metrics)',
                fontSize: '0.75rem',
                color: '#16a34a',
                background: 'rgba(34, 197, 94, 0.12)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                padding: '0.2rem 0.6rem',
                borderRadius: 'var(--radius-full)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontWeight: 700,
              }}
            >
              The Inveni Stay Way
            </div>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#16a34a',
                fontFamily: 'var(--font-metrics)',
                fontSize: '0.85rem',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: '1.25rem',
                fontWeight: 700,
              }}
            >
              <Sparkles size={18} />
              <span>Remote Precision</span>
            </div>

            <h3
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '1.4rem',
                color: 'var(--text-primary)',
                marginBottom: '1.5rem',
                fontWeight: 800,
              }}
            >
              Inspect, Select & Arrive Prepared
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', gap: '0.85rem' }}>
                <CheckCircle2 size={20} color="#16a34a" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4 style={{ color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: 700 }}>Live Room Availability</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    See exact status (Room 101: Available • Room 102: Occupied) updated directly by verified hosts.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.85rem' }}>
                <CheckCircle2 size={20} color="#16a34a" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4 style={{ color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: 700 }}>Spatial Corridor & Room Inspection</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    Inspect the entrance, the hallway, ventilation, wardrobe, and attached bathroom before deciding.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.85rem' }}>
                <CheckCircle2 size={20} color="#16a34a" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4 style={{ color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: 700 }}>Transparent Food & Wi-Fi Details</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    Full mess menu schedules and Wi-Fi speed certifications with inverter backup status visible upfront.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.85rem' }}>
                <CheckCircle2 size={20} color="#16a34a" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4 style={{ color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: 700 }}>Remote Token Reservation</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    Lock Room 101 with a small token deposit. Get an official arrival pass with direct landlord WhatsApp.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
