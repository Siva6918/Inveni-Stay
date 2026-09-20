import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  X,
  Plus,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Compass,
  Building2,
  MapPin,
  Wifi,
  Utensils,
  Bath,
  Wind,
  Car,
  Calendar,
  Info,
  RefreshCw,
  ChevronRight,
  HelpCircle,
  Clock,
  ShieldCheck,
  Check,
} from 'lucide-react';
import {
  UserRequirements,
  AIRoomMatch,
  AIMatchingResponse,
  PropertyListing,
  RoomUnit,
} from '../../types';
import { aiRelocationService } from '../../services/aiRelocationService';
import { propertyService } from '../../services/propertyService';
import { MatchExplanationModal } from './MatchExplanationModal';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string;
  onSelectRoom: (propertyId: string, roomNo: string) => void;
  onExploreProperty: (propertyId: string) => void;
  onFallbackToSearch: (destination?: string) => void;
}

const STARTER_PROMPTS = [
  'I need a single room in Panyam under ₹6000.',
  'PG with food and Wi-Fi in Panyam.',
  'Find me a room under ₹7,000 with Wi-Fi and attached bathroom.',
  'I am a student and need a quiet single room with food.',
  'I need a room immediately in Panyam.',
  'Double sharing room with food and bike parking under ₹5,000.',
];

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  isOpen,
  onClose,
  initialPrompt = '',
  onSelectRoom,
  onExploreProperty,
  onFallbackToSearch,
}) => {
  const [inputText, setInputText] = useState(initialPrompt);
  const [loadingPhase, setLoadingPhase] = useState<string | null>(null);
  const [allProperties, setAllProperties] = useState<PropertyListing[]>([]);
  const [matchResponse, setMatchResponse] = useState<AIMatchingResponse | null>(null);
  const [activeExplanationMatch, setActiveExplanationMatch] = useState<AIRoomMatch | null>(null);
  const [isExplanationOpen, setIsExplanationOpen] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [isAddReqOpen, setIsAddReqOpen] = useState(false);
  const [liveAnnouncement, setLiveAnnouncement] = useState<string>('');

  const inputRef = useRef<HTMLInputElement>(null);

  // Load properties on mount
  useEffect(() => {
    setAllProperties(propertyService.getAllProperties());
  }, []);

  // When modal opens or initialPrompt changes
  useEffect(() => {
    if (isOpen) {
      if (initialPrompt && initialPrompt.trim().length > 0) {
        setInputText(initialPrompt);
        handleExecuteSearch(initialPrompt);
      } else if (!matchResponse) {
        // Run default helpful starting search
        const defaultPrompt = 'I need a single room in Panyam under ₹6000 with food and Wi-Fi';
        setInputText(defaultPrompt);
        handleExecuteSearch(defaultPrompt);
      }
      setTimeout(() => {
        inputRef.current?.focus();
      }, 200);
    }
  }, [isOpen, initialPrompt]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (isExplanationOpen) {
          setIsExplanationOpen(false);
        } else if (showHowItWorks) {
          setShowHowItWorks(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isExplanationOpen, showHowItWorks, onClose]);

  // Core execution flow: User Prompt -> Parser -> Matcher -> Explanations
  const handleExecuteSearch = (textToParse: string, existingReqs?: Partial<UserRequirements>) => {
    const query = textToParse.trim();
    if (!query) return;

    // Fast 3-phase loading animation (kept short ~450ms total per Section 37)
    setLoadingPhase('UNDERSTANDING YOUR REQUIREMENTS');

    setTimeout(() => {
      setLoadingPhase('FINDING MATCHES');

      setTimeout(() => {
        setLoadingPhase('BUILDING YOUR SHORTLIST');

        setTimeout(() => {
          const parsedReqs = aiRelocationService.parseRequirements(query, existingReqs);
          const currentProps = allProperties.length > 0 ? allProperties : propertyService.getAllProperties();
          const response = aiRelocationService.matchPropertiesAndRooms(parsedReqs, currentProps);

          setMatchResponse(response);
          setLoadingPhase(null);

          const count = response.exactMatches.length;
          const announcement =
            count > 0
              ? `Found ${count} matching room${count > 1 ? 's' : ''} for your preferences.`
              : `No exact matches. Found ${response.closeMatches.length} close matches.`;
          setLiveAnnouncement(announcement);
        }, 120);
      }, 150);
    }, 150);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      handleExecuteSearch(inputText);
    }
  };

  const handlePromptChipClick = (prompt: string) => {
    setInputText(prompt);
    handleExecuteSearch(prompt);
  };

  // Requirement chip modification (removal)
  const handleRemoveRequirement = (key: keyof UserRequirements) => {
    if (!matchResponse) return;
    const updatedReqs: UserRequirements = {
      ...matchResponse.understoodRequirements,
      [key]: null,
    };
    // Also remove from hard/soft lists
    updatedReqs.hardPreferences = updatedReqs.hardPreferences.filter((p) => p !== key);
    updatedReqs.softPreferences = updatedReqs.softPreferences.filter((p) => p !== key);

    const currentProps = allProperties.length > 0 ? allProperties : propertyService.getAllProperties();
    const response = aiRelocationService.matchPropertiesAndRooms(updatedReqs, currentProps);
    setMatchResponse(response);
    setLiveAnnouncement(`Updated requirements. ${response.exactMatches.length} matches found.`);
  };

  // Requirement addition/patching
  const handleApplyReqPatch = (patch: Partial<UserRequirements>) => {
    if (!matchResponse) return;
    const updatedReqs: UserRequirements = {
      ...matchResponse.understoodRequirements,
      ...patch,
    };
    Object.keys(patch).forEach((k) => {
      const field = k as keyof UserRequirements;
      if (!updatedReqs.hardPreferences.includes(field) && !updatedReqs.softPreferences.includes(field)) {
        updatedReqs.hardPreferences.push(field);
      }
    });

    const currentProps = allProperties.length > 0 ? allProperties : propertyService.getAllProperties();
    const response = aiRelocationService.matchPropertiesAndRooms(updatedReqs, currentProps);
    setMatchResponse(response);
    setIsAddReqOpen(false);
    setLiveAnnouncement(`Added preference. ${response.exactMatches.length} matching rooms.`);
  };

  const handleOpenExplanation = (match: AIRoomMatch) => {
    setActiveExplanationMatch(match);
    setIsExplanationOpen(true);
  };

  if (!isOpen) return null;

  const reqs = matchResponse?.understoodRequirements;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-assistant-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        overflowY: 'auto',
      }}
    >
      {/* Screen Reader Live Announcement Region */}
      <div className="sr-only" role="status" aria-live="polite">
        {liveAnnouncement}
      </div>

      <div
        className="neomorph-card"
        style={{
          width: '100%',
          maxWidth: '1040px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-xl)',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(14, 165, 233, 0.25)',
          overflow: 'hidden',
          animation: 'fadeIn 0.25s ease-out',
        }}
      >
        {/* Header Bar */}
        <div
          style={{
            padding: '1.25rem 1.75rem',
            borderBottom: '1px solid rgba(0, 0, 0, 0.07)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(to right, #ffffff, #f8fafc)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.15) 0%, rgba(217, 119, 6, 0.15) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1.5px solid rgba(14, 165, 233, 0.3)',
                boxShadow: '0 4px 12px rgba(14, 165, 233, 0.15)',
              }}
            >
              <Sparkles size={22} color="var(--c-sky-blue)" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h2
                  id="ai-assistant-title"
                  style={{
                    fontFamily: 'var(--font-metrics)',
                    fontSize: '1.2rem',
                    fontWeight: 800,
                    color: '#0f172a',
                    letterSpacing: '0.02em',
                    textTransform: 'uppercase',
                    margin: 0,
                  }}
                >
                  Inveni Stay Relocation Assistant
                </h2>
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    padding: '0.15rem 0.5rem',
                    borderRadius: 'var(--radius-full)',
                    background: 'rgba(16, 185, 129, 0.12)',
                    color: 'var(--c-green)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                  }}
                >
                  EXPLAINABLE ENGINE
                </span>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '2px 0 0 0' }}>
                Natural-language discovery with transparent requirement matching • No hallucinated facts
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => setShowHowItWorks(!showHowItWorks)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                background: 'rgba(241, 245, 249, 0.8)',
                border: '1px solid rgba(203, 213, 225, 0.8)',
                padding: '0.45rem 0.85rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: '#334155',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              title="Learn how deterministic preference matching works"
            >
              <HelpCircle size={14} color="var(--c-sky-blue)" />
              <span>How Matching Works</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close Assistant"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(241, 245, 249, 0.8)',
                border: '1px solid rgba(203, 213, 225, 0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748b',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Optional Transparency "How Matching Works" Explainer Drawer */}
        {showHowItWorks && (
          <div
            style={{
              padding: '1rem 1.75rem',
              background: '#f8fafc',
              borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
              fontSize: '0.82rem',
              color: '#334155',
              lineHeight: 1.6,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <Info size={18} color="var(--c-sky-blue)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Deterministic, Honest AI Matching:</strong> We convert your sentences into a structured preference ledger (Destination, Budget, Room Type, Amenities). Then we match against verified property inventory and rank by hard requirement satisfaction and availability. Scores are strictly <strong>Preference Matches</strong> based on active data — no fabricated amenities, no fake scientific claims.
              </div>
            </div>
          </div>
        )}

        {/* Main Scrollable Content */}
        <div style={{ padding: '1.5rem 1.75rem', overflowY: 'auto', flex: 1 }}>
          {/* Natural Language Search Input Bar */}
          <form onSubmit={handleFormSubmit} style={{ marginBottom: '1.25rem' }}>
            <label
              htmlFor="ai-stay-input"
              style={{
                display: 'block',
                fontFamily: 'var(--font-metrics)',
                fontSize: '0.8rem',
                fontWeight: 800,
                color: '#0f172a',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                marginBottom: '0.5rem',
              }}
            >
              Tell Inveni Stay What You Need
            </label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: '#ffffff',
                border: '2px solid rgba(14, 165, 233, 0.45)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: '0 4px 16px rgba(14, 165, 233, 0.1)',
                padding: '0.4rem 0.6rem 0.4rem 1rem',
                gap: '0.75rem',
              }}
            >
              <Sparkles size={20} color="var(--c-sky-blue)" style={{ flexShrink: 0 }} />
              <input
                id="ai-stay-input"
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="e.g. I’m moving to Panyam next month. I need a single room under ₹6000 with food and Wi-Fi."
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  fontSize: '0.96rem',
                  fontFamily: 'var(--font-ui)',
                  color: '#0f172a',
                  background: 'transparent',
                }}
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.65rem 1.35rem',
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  cursor: inputText.trim() ? 'pointer' : 'not-allowed',
                  opacity: inputText.trim() ? 1 : 0.6,
                  boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)',
                  transition: 'all 0.2s ease',
                  flexShrink: 0,
                }}
              >
                <span>Find My Stay</span>
                <Send size={15} />
              </button>
            </div>
          </form>

          {/* Starter Suggestion Chips (Section 7) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.75rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Quick Prompts:
            </span>
            {STARTER_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => handlePromptChipClick(prompt)}
                style={{
                  background: 'rgba(241, 245, 249, 0.9)',
                  border: '1px solid rgba(203, 213, 225, 0.7)',
                  borderRadius: 'var(--radius-full)',
                  padding: '0.3rem 0.75rem',
                  fontSize: '0.78rem',
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
                  e.currentTarget.style.borderColor = 'rgba(203, 213, 225, 0.7)';
                  e.currentTarget.style.color = '#334155';
                }}
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Fast Animated Loading State (Section 37) */}
          {loadingPhase && (
            <div
              style={{
                padding: '2.5rem 1.5rem',
                textAlign: 'center',
                background: '#f8fafc',
                borderRadius: 'var(--radius-lg)',
                border: '1.5px dashed rgba(14, 165, 233, 0.4)',
                marginBottom: '1.5rem',
              }}
            >
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--radius-full)',
                  background: 'rgba(14, 165, 233, 0.12)',
                  color: 'var(--c-sky-blue)',
                  marginBottom: '1rem',
                  animation: 'spin 1.2s linear infinite',
                }}
              >
                <RefreshCw size={24} />
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-metrics)',
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  color: '#0284c7',
                  textTransform: 'uppercase',
                }}
              >
                {loadingPhase}
              </div>
              <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>
                Analyzing real properties & room inventories in Andhra Pradesh...
              </p>
            </div>
          )}

          {/* Structured Understood Requirements Section (Section 9 & 21) */}
          {matchResponse && !loadingPhase && (
            <div
              style={{
                background: 'linear-gradient(135deg, #f0f9ff 0%, #fdf4ff 100%)',
                border: '1.5px solid rgba(14, 165, 233, 0.25)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem 1.5rem',
                marginBottom: '1.75rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '0.85rem',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={18} color="var(--c-sky-blue)" />
                  <span
                    style={{
                      fontFamily: 'var(--font-metrics)',
                      fontSize: '0.85rem',
                      fontWeight: 800,
                      color: '#0f172a',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    Here's What We Understood
                  </span>
                </div>
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  Click <strong style={{ color: '#ef4444' }}>×</strong> to remove a constraint or add one below
                </span>
              </div>

              {/* Requirement Chips (Section 21) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                {reqs?.destination && (
                  <span className="ai-req-chip" style={reqChipStyle}>
                    <MapPin size={13} color="var(--c-sky-blue)" />
                    <span>Destination: <strong>{reqs.destination}</strong></span>
                    <button
                      type="button"
                      onClick={() => handleRemoveRequirement('destination')}
                      style={reqCloseBtnStyle}
                      aria-label="Remove destination"
                    >
                      <X size={13} />
                    </button>
                  </span>
                )}

                {reqs?.roomType && (
                  <span className="ai-req-chip" style={reqChipStyle}>
                    <Building2 size={13} color="var(--c-sky-blue)" />
                    <span>Room: <strong>{reqs.roomType}</strong></span>
                    <button
                      type="button"
                      onClick={() => handleRemoveRequirement('roomType')}
                      style={reqCloseBtnStyle}
                      aria-label="Remove room type"
                    >
                      <X size={13} />
                    </button>
                  </span>
                )}

                {reqs?.maxBudget && (
                  <span className="ai-req-chip" style={reqChipStyle}>
                    <span>Budget: <strong>≤ ₹{reqs.maxBudget.toLocaleString('en-IN')}</strong></span>
                    <button
                      type="button"
                      onClick={() => handleRemoveRequirement('maxBudget')}
                      style={reqCloseBtnStyle}
                      aria-label="Remove max budget"
                    >
                      <X size={13} />
                    </button>
                  </span>
                )}

                {reqs?.food !== null && reqs?.food !== undefined && (
                  <span className="ai-req-chip" style={reqChipStyle}>
                    <Utensils size={13} color="var(--c-goldenrod)" />
                    <span>Food: <strong>{reqs.food === 'preferred' ? 'Preferred' : reqs.food ? 'Required' : 'No Food'}</strong></span>
                    <button
                      type="button"
                      onClick={() => handleRemoveRequirement('food')}
                      style={reqCloseBtnStyle}
                      aria-label="Remove food requirement"
                    >
                      <X size={13} />
                    </button>
                  </span>
                )}

                {reqs?.wifi !== null && reqs?.wifi !== undefined && (
                  <span className="ai-req-chip" style={reqChipStyle}>
                    <Wifi size={13} color="var(--c-sky-blue)" />
                    <span>Wi-Fi: <strong>{reqs.wifi === 'preferred' ? 'Preferred' : reqs.wifi ? 'Required' : 'No Wi-Fi'}</strong></span>
                    <button
                      type="button"
                      onClick={() => handleRemoveRequirement('wifi')}
                      style={reqCloseBtnStyle}
                      aria-label="Remove Wi-Fi requirement"
                    >
                      <X size={13} />
                    </button>
                  </span>
                )}

                {reqs?.attachedBathroom && (
                  <span className="ai-req-chip" style={reqChipStyle}>
                    <Bath size={13} color="var(--c-sky-blue)" />
                    <span>Attached Bath: <strong>Required</strong></span>
                    <button
                      type="button"
                      onClick={() => handleRemoveRequirement('attachedBathroom')}
                      style={reqCloseBtnStyle}
                      aria-label="Remove attached bathroom"
                    >
                      <X size={13} />
                    </button>
                  </span>
                )}

                {reqs?.ac && (
                  <span className="ai-req-chip" style={reqChipStyle}>
                    <Wind size={13} color="var(--c-sky-blue)" />
                    <span>AC: <strong>Required</strong></span>
                    <button
                      type="button"
                      onClick={() => handleRemoveRequirement('ac')}
                      style={reqCloseBtnStyle}
                      aria-label="Remove AC"
                    >
                      <X size={13} />
                    </button>
                  </span>
                )}

                {reqs?.parking && (
                  <span className="ai-req-chip" style={reqChipStyle}>
                    <Car size={13} color="var(--c-goldenrod)" />
                    <span>Parking: <strong>Required</strong></span>
                    <button
                      type="button"
                      onClick={() => handleRemoveRequirement('parking')}
                      style={reqCloseBtnStyle}
                      aria-label="Remove parking"
                    >
                      <X size={13} />
                    </button>
                  </span>
                )}

                {reqs?.moveInDate && (
                  <span className="ai-req-chip" style={reqChipStyle}>
                    <Calendar size={13} color="var(--c-sky-blue)" />
                    <span>Move-in: <strong>{reqs.moveInDate}</strong></span>
                    <button
                      type="button"
                      onClick={() => handleRemoveRequirement('moveInDate')}
                      style={reqCloseBtnStyle}
                      aria-label="Remove move-in date"
                    >
                      <X size={13} />
                    </button>
                  </span>
                )}

                {reqs?.availability && (
                  <span className="ai-req-chip" style={reqChipStyle}>
                    <Clock size={13} color="var(--c-green)" />
                    <span>Availability: <strong>{reqs.availability}</strong></span>
                    <button
                      type="button"
                      onClick={() => handleRemoveRequirement('availability')}
                      style={reqCloseBtnStyle}
                      aria-label="Remove availability"
                    >
                      <X size={13} />
                    </button>
                  </span>
                )}

                {/* + Add Requirement Trigger */}
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <button
                    type="button"
                    onClick={() => setIsAddReqOpen(!isAddReqOpen)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.4rem 0.85rem',
                      background: '#ffffff',
                      border: '1.5px dashed rgba(14, 165, 233, 0.6)',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      color: '#0284c7',
                      cursor: 'pointer',
                    }}
                  >
                    <Plus size={13} />
                    <span>+ Add Requirement</span>
                  </button>

                  {/* Add Requirement Dropdown Popover */}
                  {isAddReqOpen && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '110%',
                        left: 0,
                        zIndex: 100,
                        background: '#ffffff',
                        border: '1px solid rgba(226, 232, 240, 1)',
                        boxShadow: '0 12px 24px rgba(0, 0, 0, 0.15)',
                        borderRadius: 'var(--radius-md)',
                        padding: '0.75rem',
                        width: '240px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.4rem',
                      }}
                    >
                      <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                        Quick Attach Constraint
                      </div>
                      {!reqs?.food && (
                        <button
                          type="button"
                          onClick={() => handleApplyReqPatch({ food: true })}
                          style={dropdownItemStyle}
                        >
                          <Utensils size={14} color="var(--c-goldenrod)" />
                          <span>Require Food / Mess</span>
                        </button>
                      )}
                      {!reqs?.wifi && (
                        <button
                          type="button"
                          onClick={() => handleApplyReqPatch({ wifi: true })}
                          style={dropdownItemStyle}
                        >
                          <Wifi size={14} color="var(--c-sky-blue)" />
                          <span>Require Wi-Fi</span>
                        </button>
                      )}
                      {!reqs?.attachedBathroom && (
                        <button
                          type="button"
                          onClick={() => handleApplyReqPatch({ attachedBathroom: true })}
                          style={dropdownItemStyle}
                        >
                          <Bath size={14} color="var(--c-sky-blue)" />
                          <span>Require Attached Bath</span>
                        </button>
                      )}
                      {!reqs?.parking && (
                        <button
                          type="button"
                          onClick={() => handleApplyReqPatch({ parking: true })}
                          style={dropdownItemStyle}
                        >
                          <Car size={14} color="var(--c-goldenrod)" />
                          <span>Require Parking</span>
                        </button>
                      )}
                      {!reqs?.ac && (
                        <button
                          type="button"
                          onClick={() => handleApplyReqPatch({ ac: true })}
                          style={dropdownItemStyle}
                        >
                          <Wind size={14} color="var(--c-sky-blue)" />
                          <span>Require AC</span>
                        </button>
                      )}
                      {!reqs?.destination && (
                        <button
                          type="button"
                          onClick={() => handleApplyReqPatch({ destination: 'Panyam' })}
                          style={dropdownItemStyle}
                        >
                          <MapPin size={14} color="var(--c-sky-blue)" />
                          <span>Set Panyam</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Follow-up question if missing important constraint (Section 18 & 19) */}
              {matchResponse.followUpQuestion && (
                <div
                  style={{
                    marginTop: '1rem',
                    padding: '0.75rem 1rem',
                    background: '#ffffff',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid rgba(245, 158, 11, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <HelpCircle size={16} color="var(--c-goldenrod)" />
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                      {matchResponse.followUpQuestion.question}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    {matchResponse.followUpQuestion.options.map((optionText) => (
                      <button
                        key={optionText}
                        type="button"
                        onClick={() => {
                          if (matchResponse.followUpQuestion?.field === 'maxBudget') {
                            if (optionText.includes('5,000')) handleApplyReqPatch({ maxBudget: 5000 });
                            else if (optionText.includes('6,500')) handleApplyReqPatch({ maxBudget: 6500 });
                            else if (optionText.includes('8,000')) handleApplyReqPatch({ maxBudget: 8000 });
                            else handleApplyReqPatch({ maxBudget: null });
                          } else if (matchResponse.followUpQuestion?.field === 'roomType') {
                            if (optionText.includes('Single')) handleApplyReqPatch({ roomType: 'Single' });
                            else if (optionText.includes('Double')) handleApplyReqPatch({ roomType: 'Double' });
                            else handleApplyReqPatch({ roomType: null });
                          }
                        }}
                        style={{
                          padding: '0.35rem 0.75rem',
                          background: 'rgba(245, 158, 11, 0.1)',
                          border: '1px solid rgba(245, 158, 11, 0.4)',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          color: '#b45309',
                          cursor: 'pointer',
                        }}
                      >
                        {optionText}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Results Summary Header */}
          {matchResponse && !loadingPhase && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1rem',
                flexWrap: 'wrap',
                gap: '0.5rem',
              }}
            >
              <div>
                <h3
                  style={{
                    fontFamily: 'var(--font-metrics)',
                    fontSize: '1.05rem',
                    fontWeight: 800,
                    color: '#0f172a',
                    margin: 0,
                  }}
                >
                  {matchResponse.exactMatches.length > 0
                    ? `Matching Stays (${matchResponse.exactMatches.length})`
                    : `No Exact Matches Found`}
                </h3>
                <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '2px 0 0 0' }}>
                  {matchResponse.explanationMessage}
                </p>
              </div>

              {/* Relaxation Suggestion Chips (Section 24) */}
              {matchResponse.relaxationSuggestions && matchResponse.relaxationSuggestions.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0284c7' }}>Try:</span>
                  {matchResponse.relaxationSuggestions.map((sug) => (
                    <button
                      key={sug.label}
                      type="button"
                      onClick={() => handleApplyReqPatch(sug.patch)}
                      style={{
                        padding: '0.3rem 0.7rem',
                        borderRadius: 'var(--radius-full)',
                        background: 'rgba(2, 132, 199, 0.08)',
                        border: '1px solid rgba(2, 132, 199, 0.3)',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        color: '#0284c7',
                        cursor: 'pointer',
                      }}
                    >
                      {sug.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* EXACT MATCHES CARDS LIST (Section 22) */}
          {matchResponse && !loadingPhase && matchResponse.exactMatches.length > 0 && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '1.25rem',
                marginBottom: '2rem',
              }}
            >
              {matchResponse.exactMatches.map((match, idx) => (
                <div
                  key={`${match.property.id}-${match.room.roomNo}`}
                  className="neomorph-card"
                  style={{
                    padding: '1.25rem',
                    borderRadius: 'var(--radius-lg)',
                    border: idx === 0 ? '2px solid rgba(16, 185, 129, 0.5)' : '1px solid rgba(0, 0, 0, 0.08)',
                    boxShadow: idx === 0 ? '0 8px 24px rgba(16, 185, 129, 0.12)' : 'var(--shadow-neomorph-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  {/* Top Badge & Score */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          padding: '0.2rem 0.55rem',
                          borderRadius: 'var(--radius-full)',
                          background: idx === 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(14, 165, 233, 0.12)',
                          color: idx === 0 ? 'var(--c-green)' : 'var(--c-sky-blue)',
                          border: `1px solid ${idx === 0 ? 'rgba(16, 185, 129, 0.4)' : 'rgba(14, 165, 233, 0.3)'}`,
                          textTransform: 'uppercase',
                        }}
                      >
                        {idx === 0 ? '★ Highest Preference Match' : 'Matching Stay'}
                      </span>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span
                          style={{
                            fontFamily: 'var(--font-metrics)',
                            fontSize: '0.92rem',
                            fontWeight: 800,
                            color: match.matchScore >= 85 ? 'var(--c-green)' : 'var(--c-sky-blue)',
                          }}
                        >
                          {match.matchScore}% Preference Match
                        </span>
                      </div>
                    </div>

                    {/* Property & Room Identifiers */}
                    <div style={{ marginBottom: '0.65rem' }}>
                      <h4
                        style={{
                          fontFamily: 'var(--font-metrics)',
                          fontSize: '1.05rem',
                          fontWeight: 800,
                          color: '#0f172a',
                          margin: '0 0 0.15rem 0',
                        }}
                      >
                        {match.property.name}
                      </h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem', color: '#64748b' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <MapPin size={13} color="var(--c-sky-blue)" />
                          {match.property.district}, {match.property.state}
                        </span>
                        <span>•</span>
                        <span style={{ fontWeight: 700, color: '#334155' }}>
                          Room {match.room.roomNo} ({match.room.type})
                        </span>
                      </div>
                    </div>

                    {/* Price & Availability Pill */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.55rem 0.85rem',
                        background: '#f8fafc',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: '0.85rem',
                      }}
                    >
                      <div>
                        <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                          ₹{match.room.rent.toLocaleString('en-IN')}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}> /month</span>
                      </div>

                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          padding: '0.2rem 0.55rem',
                          borderRadius: 'var(--radius-full)',
                          background: match.room.status === 'AVAILABLE' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                          color: match.room.status === 'AVAILABLE' ? '#15803d' : '#b45309',
                        }}
                      >
                        ● {match.room.status}
                      </span>
                    </div>

                    {/* Checkmarked Matching Features (Section 22) */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1rem' }}>
                      {match.matchedFeatures.slice(0, 4).map((f) => (
                        <div
                          key={f.label}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            fontSize: '0.8rem',
                            color: '#334155',
                          }}
                        >
                          <Check size={14} color="var(--c-green)" style={{ flexShrink: 0 }} />
                          <span>{f.label}: <strong>{f.detail}</strong></span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions: "Why this match?" + "Explore Room" + "Reserve Room" */}
                  <div style={{ paddingTop: '0.75rem', borderTop: '1px solid rgba(0, 0, 0, 0.06)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                      <button
                        type="button"
                        onClick={() => handleOpenExplanation(match)}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          color: 'var(--c-sky-blue)',
                          cursor: 'pointer',
                          textDecoration: 'underline',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                        }}
                      >
                        <HelpCircle size={13} />
                        <span>Why this match?</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onExploreProperty(match.property.id);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          color: '#64748b',
                          cursor: 'pointer',
                        }}
                      >
                        View Property →
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onSelectRoom(match.property.id, match.room.roomNo);
                      }}
                      style={{
                        width: '100%',
                        padding: '0.65rem',
                        background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.86rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.45rem',
                        boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)',
                      }}
                    >
                      <span>Reserve Room {match.room.roomNo}</span>
                      <ArrowRight size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* CLOSE / NEAR MATCHES SECTION (Section 25) */}
          {matchResponse && !loadingPhase && matchResponse.closeMatches.length > 0 && (
            <div style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.6rem 1rem',
                  background: 'rgba(245, 158, 11, 0.08)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1rem',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                }}
              >
                <AlertTriangle size={17} color="var(--c-goldenrod)" />
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#b45309' }}>
                  Close Matches (Clear Deviations Noted — No Hidden Violations):
                </span>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))',
                  gap: '1rem',
                }}
              >
                {matchResponse.closeMatches.slice(0, 3).map((match) => (
                  <div
                    key={`close-${match.property.id}-${match.room.roomNo}`}
                    style={{
                      padding: '1.1rem',
                      background: '#ffffff',
                      borderRadius: 'var(--radius-md)',
                      border: '1.5px solid rgba(245, 158, 11, 0.35)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#b45309', textTransform: 'uppercase' }}>
                          Near Match ({match.matchScore}% fit)
                        </span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>
                          ₹{match.room.rent.toLocaleString('en-IN')}/mo
                        </span>
                      </div>

                      <h4 style={{ margin: '0 0 0.2rem 0', fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                        {match.property.name} • Room {match.room.roomNo} ({match.room.type})
                      </h4>

                      {/* Deviations Highlight */}
                      <div
                        style={{
                          margin: '0.5rem 0',
                          padding: '0.45rem 0.65rem',
                          background: 'rgba(239, 68, 68, 0.06)',
                          borderRadius: 'var(--radius-sm)',
                          borderLeft: '3px solid #ef4444',
                        }}
                      >
                        <span style={{ fontSize: '0.74rem', color: '#b91c1c', fontWeight: 700, display: 'block' }}>
                          Deviation from strict requirements:
                        </span>
                        <div style={{ fontSize: '0.76rem', color: '#7f1d1d', marginTop: '2px' }}>
                          {match.unmatchedFeatures.map((u) => `• ${u.label}: ${u.detail}`).join(' ')}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem' }}>
                      <button
                        type="button"
                        onClick={() => handleOpenExplanation(match)}
                        style={{
                          flex: 1,
                          padding: '0.45rem',
                          background: '#f1f5f9',
                          border: '1px solid #cbd5e1',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          color: '#334155',
                          cursor: 'pointer',
                        }}
                      >
                        Inspect Ledger
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onSelectRoom(match.property.id, match.room.roomNo);
                        }}
                        style={{
                          flex: 1,
                          padding: '0.45rem',
                          background: 'var(--surface-neomorph)',
                          border: '1.5px solid var(--c-sky-blue)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.78rem',
                          fontWeight: 800,
                          color: '#0284c7',
                          cursor: 'pointer',
                        }}
                      >
                        Explore Room →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fallback to Standard Multi-Filter Search (Section 47 & 48) */}
          <div
            style={{
              padding: '1rem',
              background: '#f8fafc',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(226, 232, 240, 1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Compass size={18} color="#64748b" />
              <span style={{ fontSize: '0.82rem', color: '#475569' }}>
                Prefer standard catalog filtering? Switch back anytime.
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                onFallbackToSearch(reqs?.destination || 'Panyam');
              }}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                fontSize: '0.82rem',
                fontWeight: 800,
                color: 'var(--c-sky-blue)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              <span>Use standard search filters</span>
              <ChevronRight size={15} />
            </button>
          </div>
        </div>

        {/* Footer Guarantee Bar */}
        <div
          style={{
            padding: '0.75rem 1.75rem',
            background: '#ffffff',
            borderTop: '1px solid rgba(0, 0, 0, 0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.75rem',
            color: '#64748b',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <ShieldCheck size={14} color="var(--c-green)" />
            <span>Zero Hallucination Guarantee: Matches are derived strictly from active property records.</span>
          </div>

          <div>
            <span>AWS Bharat Builds 2026 Compatible Architecture</span>
          </div>
        </div>
      </div>

      {/* Deep Match Explanation Modal (Section 13 & 23) */}
      {isExplanationOpen && activeExplanationMatch && matchResponse && (
        <MatchExplanationModal
          match={activeExplanationMatch}
          requirements={matchResponse.understoodRequirements}
          onClose={() => setIsExplanationOpen(false)}
          onSelectForBooking={(propId, roomNo) => {
            setIsExplanationOpen(false);
            onClose();
            onSelectRoom(propId, roomNo);
          }}
        />
      )}
    </div>
  );
};

const reqChipStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.35rem',
  padding: '0.35rem 0.65rem 0.35rem 0.75rem',
  background: '#ffffff',
  borderRadius: 'var(--radius-full)',
  border: '1px solid rgba(14, 165, 233, 0.35)',
  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
  fontSize: '0.78rem',
  color: '#0f172a',
};

const reqCloseBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  padding: '0 0 0 0.25rem',
  cursor: 'pointer',
  color: '#94a3b8',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const dropdownItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '0.45rem 0.6rem',
  background: 'none',
  border: 'none',
  borderRadius: 'var(--radius-sm)',
  fontSize: '0.78rem',
  fontWeight: 600,
  color: '#334155',
  cursor: 'pointer',
  textAlign: 'left',
};
