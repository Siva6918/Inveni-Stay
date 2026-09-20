import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, CheckCircle2, MessageSquare, Cpu, ShieldCheck, Check, HelpCircle, MapPin, Building2 } from 'lucide-react';
import { aiRelocationService } from '../../services/aiRelocationService';
import { propertyService } from '../../services/propertyService';
import { AIMatchingResponse } from '../../types';

interface AIConceptPreviewSectionProps {
  onOpenAssistant?: (prompt?: string) => void;
  onSelectRoom?: (propertyId: string, roomNo: string) => void;
  onExploreProperty?: (propertyId: string) => void;
}

export const AIConceptPreviewSection: React.FC<AIConceptPreviewSectionProps> = ({
  onOpenAssistant,
  onSelectRoom,
  onExploreProperty,
}) => {
  const [activePrompt, setActivePrompt] = useState(
    "I'm moving to Panyam next month. I need a single room under ₹6,000 with food and Wi-Fi."
  );
  const [matchResult, setMatchResult] = useState<AIMatchingResponse | null>(null);

  const samplePrompts = [
    {
      label: 'Student Relocation (Single + Food)',
      text: "I'm moving to Panyam next month. I need a single room under ₹6,000 with food and Wi-Fi.",
    },
    {
      label: 'Double Sharing + Parking',
      text: 'Need a double sharing room in Panyam under ₹5,000 with food, power backup and parking.',
    },
    {
      label: 'Immediate Available PG',
      text: 'I need a room immediately in Panyam with attached bathroom.',
    },
  ];

  // Re-run matching when active prompt changes
  useEffect(() => {
    const props = propertyService.getAllProperties();
    const reqs = aiRelocationService.parseRequirements(activePrompt);
    const result = aiRelocationService.matchPropertiesAndRooms(reqs, props);
    setMatchResult(result);
  }, [activePrompt]);

  const topMatch = matchResult?.exactMatches[0] || matchResult?.closeMatches[0];

  return (
    <section
      id="ai-assistant"
      className="section-wrapper"
      style={{
        background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 3rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.4rem 1rem',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(14, 165, 233, 0.12)',
              border: '1px solid rgba(14, 165, 233, 0.3)',
              color: 'var(--c-sky-blue)',
              fontSize: '0.8rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: '1rem',
            }}
          >
            <Sparkles size={14} />
            <span>Phase 5 • AI-Powered Relocation Assistant</span>
          </div>

          <h2
            style={{
              fontFamily: 'var(--font-editorial)',
              fontSize: 'clamp(2rem, 3.8vw, 3rem)',
              color: '#0f172a',
              marginBottom: '1rem',
              lineHeight: 1.2,
            }}
          >
            Describe What You Need in Plain English.
          </h2>

          <p style={{ color: '#64748b', fontSize: '1.05rem', lineHeight: 1.6 }}>
            No complicated 20-field filter forms. Tell Inveni Stay your budget, destination, and lifestyle requirements — our explainable engine extracts preferences, matches inventory, and proves why rooms match.
          </p>
        </div>

        {/* Visual Interactive Transformation Experience */}
        <div
          className="neomorph-card"
          style={{
            maxWidth: '1040px',
            margin: '0 auto',
            padding: '2.25rem',
            background: '#ffffff',
            borderRadius: 'var(--radius-xl)',
            border: '1.5px solid rgba(14, 165, 233, 0.3)',
            boxShadow: '0 20px 50px -10px rgba(14, 165, 233, 0.12), var(--shadow-neomorph)',
          }}
        >
          {/* Preset Prompts Buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem', marginBottom: '1.5rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-metrics)', textTransform: 'uppercase', color: '#64748b', fontWeight: 800 }}>
              Try Example Query:
            </span>
            {samplePrompts.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => setActivePrompt(p.text)}
                style={{
                  padding: '0.4rem 0.85rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.78rem',
                  fontFamily: 'var(--font-ui)',
                  fontWeight: 600,
                  background: activePrompt === p.text ? 'rgba(14, 165, 233, 0.15)' : '#f1f5f9',
                  color: activePrompt === p.text ? '#0284c7' : '#334155',
                  border: activePrompt === p.text ? '1.5px solid var(--c-sky-blue)' : '1px solid #cbd5e1',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                }}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '2rem',
              alignItems: 'stretch',
            }}
          >
            {/* Left: Natural Language Input Box */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem' }}>
                  <MessageSquare size={16} color="var(--c-goldenrod)" />
                  <span
                    style={{
                      fontFamily: 'var(--font-metrics)',
                      fontSize: '0.8rem',
                      textTransform: 'uppercase',
                      color: 'var(--c-goldenrod)',
                      letterSpacing: '0.06em',
                      fontWeight: 800,
                    }}
                  >
                    Step 1: Unstructured Renter Request
                  </span>
                </div>

                <div
                  style={{
                    padding: '1.25rem',
                    background: '#f8fafc',
                    borderRadius: 'var(--radius-md)',
                    border: '1.5px solid rgba(14, 165, 233, 0.25)',
                    color: '#0f172a',
                    fontFamily: 'var(--font-ui)',
                    fontSize: '0.98rem',
                    lineHeight: 1.6,
                    minHeight: '110px',
                    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.02)',
                  }}
                >
                  "{activePrompt}"
                </div>

                <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: '#64748b' }}>
                  Deterministic parser extracts strict bounds without guessing or fabricating missing facts.
                </div>
              </div>

              {onOpenAssistant && (
                <button
                  type="button"
                  onClick={() => onOpenAssistant(activePrompt)}
                  style={{
                    marginTop: '1.5rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1.25rem',
                    background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: 800,
                    fontSize: '0.86rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(2, 132, 199, 0.3)',
                  }}
                >
                  <Sparkles size={16} />
                  <span>Launch Interactive Assistant</span>
                  <ArrowRight size={15} />
                </button>
              )}
            </div>

            {/* Right: Extracted Structured State & Ranked Match */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem' }}>
                <CheckCircle2 size={16} color="var(--c-green)" />
                <span
                  style={{
                    fontFamily: 'var(--font-metrics)',
                    fontSize: '0.8rem',
                    textTransform: 'uppercase',
                    color: 'var(--c-green)',
                    letterSpacing: '0.06em',
                    fontWeight: 800,
                  }}
                >
                  Step 2: Extracted Structured Ledger
                </span>
              </div>

              {/* Parsed Attributes Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '0.65rem',
                  marginBottom: '1rem',
                }}
              >
                <div style={{ padding: '0.65rem 0.85rem', background: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.68rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Destination</div>
                  <div style={{ fontSize: '0.88rem', color: 'var(--c-sky-blue)', fontWeight: 800 }}>
                    {matchResult?.understoodRequirements.destination || 'Unspecified'}
                  </div>
                </div>

                <div style={{ padding: '0.65rem 0.85rem', background: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.68rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Max Budget</div>
                  <div style={{ fontSize: '0.88rem', color: 'var(--c-green)', fontWeight: 800 }}>
                    {matchResult?.understoodRequirements.maxBudget
                      ? `≤ ₹${matchResult.understoodRequirements.maxBudget.toLocaleString('en-IN')}`
                      : 'Flexible'}
                  </div>
                </div>

                <div style={{ padding: '0.65rem 0.85rem', background: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.68rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Room Type</div>
                  <div style={{ fontSize: '0.88rem', color: '#0f172a', fontWeight: 800 }}>
                    {matchResult?.understoodRequirements.roomType || 'Any Occupancy'}
                  </div>
                </div>

                <div style={{ padding: '0.65rem 0.85rem', background: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.68rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Food & Wi-Fi</div>
                  <div style={{ fontSize: '0.88rem', color: 'var(--c-goldenrod)', fontWeight: 800 }}>
                    {matchResult?.understoodRequirements.food ? 'Food Req.' : 'No Food'}{' '}
                    {matchResult?.understoodRequirements.wifi ? '+ Wi-Fi' : ''}
                  </div>
                </div>
              </div>

              {/* Ranked Top Match Card */}
              {topMatch && (
                <div
                  style={{
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(34, 197, 94, 0.06)',
                    border: '1.5px solid rgba(34, 197, 94, 0.4)',
                    fontSize: '0.82rem',
                    color: '#0f172a',
                    lineHeight: 1.4,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <div style={{ color: 'var(--c-green)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Check size={16} />
                      <span>{topMatch.matchScore}% Preference Match: {topMatch.property.name}</span>
                    </div>
                    <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.92rem' }}>
                      ₹{topMatch.room.rent.toLocaleString('en-IN')}/mo
                    </span>
                  </div>

                  <p style={{ margin: '0 0 0.65rem 0', color: '#334155' }}>
                    {topMatch.explanationSummary}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {onSelectRoom && (
                      <button
                        type="button"
                        onClick={() => onSelectRoom(topMatch.property.id, topMatch.room.roomNo)}
                        style={{
                          padding: '0.4rem 0.85rem',
                          background: 'var(--c-green)',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.78rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                        }}
                      >
                        Reserve Room {topMatch.room.roomNo} →
                      </button>
                    )}
                    {onExploreProperty && (
                      <button
                        type="button"
                        onClick={() => onExploreProperty(topMatch.property.id)}
                        style={{
                          padding: '0.4rem 0.75rem',
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          color: '#334155',
                          cursor: 'pointer',
                        }}
                      >
                        View Property
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
