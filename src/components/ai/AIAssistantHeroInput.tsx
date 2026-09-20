import React, { useState } from 'react';
import { Sparkles, ArrowRight, MapPin, Send, Compass } from 'lucide-react';

interface AIAssistantHeroInputProps {
  onOpenAssistant: (prompt?: string) => void;
  onSwitchToCatalogSearch?: () => void;
}

const QUICK_SUGGESTIONS = [
  'Single room under ₹6K',
  'PG with food in Panyam',
  'Room with Wi-Fi & attached bath',
  'Available immediately',
];

export const AIAssistantHeroInput: React.FC<AIAssistantHeroInputProps> = ({
  onOpenAssistant,
  onSwitchToCatalogSearch,
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onOpenAssistant(inputValue.trim());
    } else {
      onOpenAssistant();
    }
  };

  const handleChipClick = (prompt: string) => {
    onOpenAssistant(prompt);
  };

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '640px',
        margin: '0 0 1.25rem 0',
      }}
    >
      {/* Eyebrow Label */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Sparkles size={15} color="var(--c-sky-blue)" />
          <span
            style={{
              fontFamily: 'var(--font-metrics)',
              fontSize: '0.78rem',
              fontWeight: 800,
              letterSpacing: '0.08em',
              color: '#0284c7',
              textTransform: 'uppercase',
            }}
          >
            Where Are You Going Next?
          </span>
        </div>

        {onSwitchToCatalogSearch && (
          <button
            type="button"
            onClick={onSwitchToCatalogSearch}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              fontSize: '0.75rem',
              color: '#64748b',
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            Or use filter criteria
          </button>
        )}
      </div>

      {/* Main Glowing Natural Language Input */}
      <form onSubmit={handleSubmit}>
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            background: '#ffffff',
            border: '2px solid rgba(14, 165, 233, 0.4)',
            borderRadius: 'var(--radius-xl)',
            padding: '0.45rem 0.55rem 0.45rem 1.15rem',
            boxShadow: '0 8px 24px -4px rgba(14, 165, 233, 0.15), var(--shadow-neomorph-sm)',
            transition: 'all 0.25s ease',
            gap: '0.65rem',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--c-sky-blue)';
            e.currentTarget.style.boxShadow = '0 10px 30px -4px rgba(14, 165, 233, 0.25)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'rgba(14, 165, 233, 0.4)';
            e.currentTarget.style.boxShadow = '0 8px 24px -4px rgba(14, 165, 233, 0.15), var(--shadow-neomorph-sm)';
          }}
        >
          <Sparkles size={20} color="var(--c-sky-blue)" style={{ flexShrink: 0 }} />

          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="e.g. Moving to Panyam next month. Single room under ₹6000 with food & Wi-Fi..."
            aria-label="Describe your relocation needs in plain English"
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontFamily: 'var(--font-ui)',
              fontSize: '0.94rem',
              color: '#0f172a',
            }}
          />

          <button
            type="submit"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.7rem 1.4rem',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: 'var(--radius-lg)',
              fontFamily: 'var(--font-metrics)',
              fontWeight: 800,
              fontSize: '0.84rem',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35)',
              transition: 'all 0.2s ease',
              flexShrink: 0,
            }}
          >
            <span>Find My Stay</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </form>

      {/* Suggested Shortcut Chips (Section 7) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.45rem',
          flexWrap: 'wrap',
          marginTop: '0.75rem',
        }}
      >
        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
          Popular:
        </span>
        {QUICK_SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => handleChipClick(suggestion)}
            style={{
              background: 'rgba(255, 255, 255, 0.85)',
              border: '1px solid rgba(203, 213, 225, 0.8)',
              borderRadius: 'var(--radius-full)',
              padding: '0.25rem 0.65rem',
              fontSize: '0.75rem',
              color: '#334155',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              fontWeight: 600,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--c-sky-blue)';
              e.currentTarget.style.color = '#0284c7';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(203, 213, 225, 0.8)';
              e.currentTarget.style.color = '#334155';
            }}
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
};
