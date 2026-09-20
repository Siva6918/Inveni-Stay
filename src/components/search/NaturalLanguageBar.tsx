import React, { useState } from 'react';
import { Sparkles, MessageSquare, ArrowRight, Check, X } from 'lucide-react';
import { searchService, ParsedNLPResult } from '../../services/searchService';
import { SearchFilters } from '../../types';

interface NaturalLanguageBarProps {
  onApplyParsedFilters: (filters: SearchFilters) => void;
  onClose?: () => void;
}

export const NaturalLanguageBar: React.FC<NaturalLanguageBarProps> = ({
  onApplyParsedFilters,
  onClose,
}) => {
  const [inputText, setInputText] = useState(
    "I'm moving to Panyam for 6 months. I need a single room under ₹6,000 with food and Wi-Fi near my college."
  );
  const [parsedResult, setParsedResult] = useState<ParsedNLPResult | null>(null);

  const samplePrompts = [
    "I'm moving to Panyam for 6 months. I need a single room under ₹6,000 with food and Wi-Fi.",
    "Joining Panyam cement factory as trainee. Looking for double sharing under ₹5,000 with attached bath.",
    "Need a quiet single room for girls in Panyam under ₹6,500 with warden and food.",
  ];

  const handleParse = (queryText: string) => {
    setInputText(queryText);
    const res = searchService.parseNaturalLanguageQuery(queryText);
    setParsedResult(res);
  };

  const handleApply = () => {
    const res = parsedResult || searchService.parseNaturalLanguageQuery(inputText);
    onApplyParsedFilters(res.filters);
    if (onClose) onClose();
  };

  return (
    <div
      className="iridescent-card"
      style={{
        padding: '1.75rem',
        background: '#ffffff',
        border: '1.5px solid var(--c-aqua)',
        boxShadow: '0 8px 30px rgba(0, 180, 216, 0.1), 0 2px 8px rgba(15, 23, 42, 0.04)',
        borderRadius: 'var(--radius-xl)',
        marginBottom: '2rem',
        position: 'relative',
      }}
    >
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            color: 'var(--text-muted)',
            cursor: 'pointer',
          }}
          aria-label="Close NLP bar"
        >
          <X size={20} />
        </button>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <Sparkles size={18} color="var(--c-aqua)" />
        <span
          style={{
            fontFamily: 'var(--font-metrics)',
            fontSize: '0.82rem',
            textTransform: 'uppercase',
            color: '#0284c7',
            letterSpacing: '0.08em',
            fontWeight: 700,
          }}
        >
          Natural Language Relocation Matcher
        </span>
        <span
          style={{
            fontSize: '0.68rem',
            background: 'rgba(218, 165, 32, 0.15)',
            color: 'var(--c-goldenrod)',
            padding: '0.15rem 0.45rem',
            borderRadius: 'var(--radius-xs)',
            textTransform: 'uppercase',
            fontFamily: 'var(--font-metrics)',
            fontWeight: 700,
          }}
        >
          Demo Intent Parser
        </span>
      </div>

      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.5 }}>
        Describe your relocation in plain words. Our intent extractor maps your stay duration, budget cap, room configuration, and amenities directly into active search filters.
      </p>

      {/* Input Field & Submit */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        <div
          style={{
            flex: '1 1 320px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem 1rem',
          }}
        >
          <MessageSquare size={18} color="var(--c-goldenrod)" style={{ flexShrink: 0 }} />
          <input
            type="text"
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              setParsedResult(null);
            }}
            placeholder="e.g. Student moving to Panyam, need single room with food under ₹6,000"
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-ui)',
              fontSize: '0.92rem',
            }}
          />
        </div>

        <button
          type="button"
          onClick={() => handleParse(inputText)}
          className="btn-secondary"
          style={{ padding: '0.75rem 1.25rem', fontSize: '0.88rem' }}
        >
          <span>Extract Criteria</span>
        </button>

        <button
          type="button"
          onClick={handleApply}
          className="btn-primary"
          style={{ padding: '0.75rem 1.5rem', fontSize: '0.88rem' }}
        >
          <span>Apply to Stays</span>
          <ArrowRight size={16} />
        </button>
      </div>

      {/* Extracted Tokens Breakdown */}
      {parsedResult && (
        <div
          style={{
            padding: '1rem',
            background: '#f0fdf4',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid #86efac',
            marginTop: '1rem',
          }}
        >
          <div
            style={{
              fontSize: '0.75rem',
              color: '#16a34a',
              fontFamily: 'var(--font-metrics)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              fontWeight: 700,
              marginBottom: '0.5rem',
            }}
          >
            ✓ Extracted Criteria:
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {parsedResult.extractedTokens.map((token, i) => (
              <span
                key={i}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.25rem 0.65rem',
                  borderRadius: 'var(--radius-full)',
                  background: '#ffffff',
                  border: '1px solid #bbf7d0',
                  fontSize: '0.78rem',
                  color: 'var(--text-primary)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                }}
              >
                <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>{token.label}:</span>
                <strong style={{ color: '#0284c7' }}>{token.value}</strong>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Sample Quick Prompts */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center', marginTop: '0.75rem' }}>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-metrics)' }}>
          Sample Prompts:
        </span>
        {samplePrompts.map((p, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleParse(p)}
            style={{
              fontSize: '0.75rem',
              padding: '0.2rem 0.6rem',
              borderRadius: 'var(--radius-full)',
              background: 'var(--surface-1)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              textAlign: 'left',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
          >
            "{p.slice(0, 48)}..."
          </button>
        ))}
      </div>
    </div>
  );
};
