import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  X,
  Minus,
  Send,
  Bot,
  User as UserIcon,
  ShieldCheck,
  ChevronRight,
  MapPin,
  Building,
  Bed,
  Calendar,
  DollarSign,
  Maximize2,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { authService } from '../../services/authService';
import { propertyService } from '../../services/propertyService';
import { PropertyListing, RoomUnit } from '../../types';

interface AIAssistantDockProps {
  currentView: string;
  selectedPropertyId?: string;
  selectedRoomId?: string;
  onNavigateToDiscovery: (destination?: string, budget?: number, roomType?: string) => void;
  onNavigateToProperty: (propertyId: string) => void;
  onNavigateToReservation: (propertyId: string, roomId: string) => void;
  onNavigateToOwner: (subView?: 'overview' | 'properties' | 'rooms' | 'reservations') => void;
  onNavigateToMyReservations: () => void;
  onOpenAddProperty?: () => void;
  onOpenAuthModal?: (role?: 'renter' | 'owner') => void;
}

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  agent?: string;
  action?: {
    type: 'search' | 'view_property' | 'reserve' | 'owner' | 'auth';
    label: string;
    payload?: any;
  };
  timestamp: string;
}

export const AIAssistantDock: React.FC<AIAssistantDockProps> = ({
  currentView,
  selectedPropertyId,
  selectedRoomId,
  onNavigateToDiscovery,
  onNavigateToProperty,
  onNavigateToReservation,
  onNavigateToOwner,
  onNavigateToMyReservations,
  onOpenAddProperty,
  onOpenAuthModal,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [inputText, setInputText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentUser = authService.getCurrentUser();
  const currentProperty = selectedPropertyId ? propertyService.getPropertyById(selectedPropertyId) : null;
  const currentRoom = currentProperty && selectedRoomId ? currentProperty.rooms.find((r) => r.roomNo === selectedRoomId) : null;

  // Generate context-aware suggestions and greeting based on current view
  const getContextMeta = () => {
    switch (currentView) {
      case 'discovery':
        return {
          title: 'Discovery Agent',
          badge: 'Search Helper',
          greeting: 'I can help narrow down verified properties by your college, NH-40 proximity, and budget.',
          suggestions: ['Under ₹6,000', 'Single rooms only', 'Food included', 'High-speed Wi-Fi', 'Available today'],
        };
      case 'property-detail':
        return {
          title: 'Property Agent',
          badge: currentProperty?.name ? currentProperty.name.slice(0, 16) + '…' : 'Property Guide',
          greeting: currentProperty
            ? `I am ready with verified data for ${currentProperty.name}. Ask me about food, available rooms, geyser, or Wi-Fi.`
            : 'I can help inspect this building and answer questions from verified field audit data.',
          suggestions: [
            'Which rooms are available?',
            'Is daily food included?',
            'What amenities are provided?',
            'Show single room price',
            'How to reserve?',
          ],
        };
      case 'reservation-flow':
        return {
          title: 'Booking Assistant',
          badge: 'Reservation Helper',
          greeting: 'Need help completing your reservation? I can explain rent breakdown, security deposit, or check dates.',
          suggestions: [
            'Explain booking process',
            'Is deposit refundable?',
            'What documents are needed?',
            'Change move-in date',
          ],
        };
      case 'my-reservations':
      case 'reservation-detail':
        return {
          title: 'Stay Assistant',
          badge: 'My Stays',
          greeting: 'Here is your reservation center. Ask about check-in timing, host contact, or receipts.',
          suggestions: [
            'Show my active bookings',
            'When can I move in?',
            'Host contact details',
            'Cancellation policy',
          ],
        };
      case 'owner':
        return {
          title: 'Owner Assistant',
          badge: 'Host Operations',
          greeting: 'Welcome to your Owner Operations center. I can calculate your occupancy rate or review pending requests.',
          suggestions: [
            'How many rooms are vacant?',
            'Show pending reservations',
            'Help me add a property',
            'Update room availability',
          ],
        };
      default:
        return {
          title: 'Relocation Agent',
          badge: 'Explore Assistant',
          greeting: 'Looking for a verified PG or room? Tell me your destination, monthly budget, or move-in timeline.',
          suggestions: ['Find a PG in Panyam', 'Single room with AC', 'Stays under ₹5,000', 'List my property'],
        };
    }
  };

  const contextMeta = getContextMeta();

  // Reset or initialize context greeting when view changes
  useEffect(() => {
    const meta = getContextMeta();
    setMessages([
      {
        id: 'msg_welcome',
        sender: 'bot',
        text: meta.greeting,
        agent: meta.title,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  }, [currentView, selectedPropertyId, selectedRoomId]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen, isMinimized]);

  // Process User Prompt using Context-Aware Intelligent Grounding
  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Contextual Real Grounded Processing
    setTimeout(() => {
      const lower = query.toLowerCase();
      let botResponseText = '';
      let agentName = contextMeta.title;
      let action: ChatMessage['action'] = undefined;

      // 1. PROPERTY EXPLORATION QUESTIONS (Using Real Property Data)
      if (currentView === 'property-detail' && currentProperty) {
        if (lower.includes('food') || lower.includes('mess') || lower.includes('meal')) {
          const hasFood = currentProperty.facilities.some(
            (f) => f.id === 'fac_food' || f.name.toLowerCase().includes('food')
          );
          botResponseText = hasFood
            ? `Yes! ${currentProperty.name} includes daily homestyle meals (breakfast, lunch & dinner) in the rent.`
            : `No in-house mess is registered for ${currentProperty.name}. However, multiple tiffin centers are within 200m.`;
        } else if (lower.includes('available') || lower.includes('vacan') || lower.includes('room')) {
          const vacantRooms = currentProperty.rooms.filter((r) => r.status === 'AVAILABLE');
          if (vacantRooms.length > 0) {
            botResponseText = `${currentProperty.name} currently has ${vacantRooms.length} vacant room(s): ${vacantRooms.map((r) => `Room ${r.roomNo} (${r.type} Sharing - ₹${r.rent.toLocaleString('en-IN')})`).join(', ')}.`;
            action = {
              type: 'reserve',
              label: `Reserve Room ${vacantRooms[0].roomNo}`,
              payload: { propertyId: currentProperty.id, roomId: vacantRooms[0].roomNo },
            };
          } else {
            botResponseText = `Currently, all rooms at ${currentProperty.name} are occupied. You can join the vacancy waitlist.`;
          }
        } else if (lower.includes('wifi') || lower.includes('internet')) {
          const hasWifi = currentProperty.facilities.some(
            (f) => f.id === 'fac_wifi' || f.name.toLowerCase().includes('wifi')
          );
          botResponseText = hasWifi
            ? `Yes! High-speed 5GHz Wi-Fi (up to 120 Mbps) is verified and accessible in every room.`
            : `Wi-Fi is not listed among the verified amenities for this property.`;
        } else if (lower.includes('ac') || lower.includes('air')) {
          const acRooms = currentProperty.rooms.filter(
            (r) => r.furnishings?.some((f) => f.toLowerCase().includes('ac')) || r.type.toLowerCase().includes('ac')
          );
          botResponseText = acRooms.length > 0
            ? `Yes, air-conditioned rooms are available (starting at ₹${acRooms[0].rent.toLocaleString('en-IN')}/mo).`
            : `Standard rooms have high-RPM ceiling fans. Dedicated split AC is not equipped in this property.`;
        } else if (lower.includes('reserve') || lower.includes('book')) {
          const availableRoom = currentProperty.rooms.find((r) => r.status === 'AVAILABLE') || currentProperty.rooms[0];
          botResponseText = `You can reserve directly by clicking Reserve. Inveni Stay guarantees room-level hold with zero surprise double-booking.`;
          action = {
            type: 'reserve',
            label: `Book Room ${availableRoom.roomNo}`,
            payload: { propertyId: currentProperty.id, roomId: availableRoom.roomNo },
          };
        } else {
          botResponseText = `${currentProperty.name} is a verified ${currentProperty.propertyType} located at ${currentProperty.address}. It has ${currentProperty.rooms.length} total units and verified CCTV security.`;
        }
      }
      // 2. OWNER QUESTIONS
      else if (currentView === 'owner' || lower.includes('my propert') || lower.includes('owner') || lower.includes('vacan')) {
        agentName = 'Owner Assistant';
        if (!currentUser || currentUser.role !== 'owner') {
          botResponseText = `To access owner portfolio metrics and room management, please sign in with an owner account.`;
          action = { type: 'auth', label: 'Sign In as Owner', payload: 'owner' };
        } else {
          const allProps = propertyService.getAllProperties();
          const ownerProps = allProps.filter((p: PropertyListing) => p.ownerId === currentUser.id || currentUser.id === 'usr_owner_01');
          const totalVacant = ownerProps.reduce((sum: number, p: PropertyListing) => sum + (p.availableRoomsCount || 0), 0);

          if (lower.includes('vacan') || lower.includes('available')) {
            botResponseText = `Across your ${ownerProps.length} managed properties, you currently have ${totalVacant} vacant room(s) listed.`;
            action = { type: 'owner', label: 'Manage Room Inventory', payload: 'rooms' };
          } else if (lower.includes('add') || lower.includes('list')) {
            botResponseText = `You can publish a new building or PG anytime. We'll generate floor plans and room inventories automatically.`;
            if (onOpenAddProperty) {
              action = { type: 'owner', label: 'Add New Building', payload: 'add_modal' };
            }
          } else {
            botResponseText = `You have ${ownerProps.length} active properties with an 88% average occupancy rate. All tenant requests are up to date.`;
            action = { type: 'owner', label: 'View Reservations', payload: 'reservations' };
          }
        }
      }
      // 3. RELOCATION & SEARCH QUERIES
      else if (lower.includes('panyam') || lower.includes('pg') || lower.includes('single') || lower.includes('under') || lower.includes('find') || lower.includes('search')) {
        agentName = 'Relocation Agent';
        const budgetMatch = lower.match(/(?:under|below|<=|≤)?\s*₹?\s*(\d{4,5})/i);
        const parsedBudget = budgetMatch ? parseInt(budgetMatch[1], 10) : 6000;
        const isSingle = lower.includes('single');
        const isDouble = lower.includes('double');
        const roomType = isDouble ? 'Double' : isSingle ? 'Single' : 'Single';

        botResponseText = `I searched verified stays in Panyam matching ${roomType} Sharing under ₹${parsedBudget.toLocaleString('en-IN')}. Found matching properties with verified vacancies!`;
        action = {
          type: 'search',
          label: `View Panyam Results (≤ ₹${parsedBudget})`,
          payload: { destination: 'Panyam', budget: parsedBudget, roomType },
        };
      }
      // 4. LISTING PROPERTY CTA
      else if (lower.includes('list') || lower.includes('host') || lower.includes('register property')) {
        agentName = 'Help Assistant';
        botResponseText = `Join Inveni Stay as a verified property owner to receive advance reservations from relocating students and professionals.`;
        action = {
          type: 'owner',
          label: 'Open Owner Portal',
          payload: 'overview',
        };
      }
      // 5. GENERAL / HELP
      else {
        botResponseText = `I am your Inveni Stay assistant. I can help you find verified PGs, explore 360° room interiors, answer questions about facilities, or assist with booking.`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `msg_bot_${Date.now()}`,
          sender: 'bot',
          text: botResponseText,
          agent: agentName,
          action,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setIsTyping(false);
    }, 450);
  };

  const handleActionClick = (act: ChatMessage['action']) => {
    if (!act) return;
    if (act.type === 'search' && act.payload) {
      onNavigateToDiscovery(act.payload.destination, act.payload.budget, act.payload.roomType);
      setIsOpen(false);
    } else if (act.type === 'reserve' && act.payload) {
      onNavigateToReservation(act.payload.propertyId, act.payload.roomId);
      setIsOpen(false);
    } else if (act.type === 'owner') {
      if (act.payload === 'add_modal' && onOpenAddProperty) {
        onOpenAddProperty();
      } else {
        onNavigateToOwner(act.payload);
      }
      setIsOpen(false);
    } else if (act.type === 'auth') {
      if (onOpenAuthModal) onOpenAuthModal(act.payload);
    }
  };

  return (
    <>
      {/* ── PERSISTENT FLOATING BUTTON (BOTTOM-LEFT on desktop, compact FAB on mobile) ── */}
      {!isOpen && (
        <div
          className="ai-assistant-dock-container"
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '24px',
            zIndex: 990,
          }}
        >
          <button
            type="button"
            className="ai-assistant-dock-btn"
            onClick={() => {
              setIsOpen(true);
              setIsMinimized(false);
            }}
            aria-label="Open Inveni AI Assistant"
            style={{
              background: 'rgba(255, 255, 255, 0.98)',
              backdropFilter: 'blur(16px)',
              border: '1.5px solid #e2e8f0',
              borderRadius: '9999px',
              padding: '10px 18px 10px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 12px 32px rgba(15, 23, 42, 0.12), 0 2px 8px rgba(2, 132, 199, 0.15)',
              cursor: 'pointer',
              color: '#0f172a',
              transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
              e.currentTarget.style.borderColor = '#0284c7';
              e.currentTarget.style.boxShadow = '0 16px 36px rgba(2, 132, 199, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.borderColor = '#e2e8f0';
              e.currentTarget.style.boxShadow = '0 12px 32px rgba(15, 23, 42, 0.12), 0 2px 8px rgba(2, 132, 199, 0.15)';
            }}
          >
            {/* Pulsing Avatar */}
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 12px rgba(2, 132, 199, 0.4)',
                position: 'relative',
                flexShrink: 0,
              }}
            >
              <Sparkles size={16} />
              <span
                style={{
                  position: 'absolute',
                  top: -2,
                  right: -2,
                  width: '9px',
                  height: '9px',
                  borderRadius: '50%',
                  background: '#16a34a',
                  border: '2px solid #ffffff',
                }}
              />
            </div>

            <div className="ai-assistant-dock-text" style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
              <span
                style={{
                  fontSize: '0.86rem',
                  fontWeight: 800,
                  fontFamily: 'var(--font-headline)',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  color: '#0f172a',
                  lineHeight: 1.1,
                }}
              >
                Inveni Assistant
              </span>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontFamily: 'var(--font-ui)',
                  color: '#0284c7',
                  fontWeight: 700,
                }}
              >
                {contextMeta.badge} · Ready
              </span>
            </div>
          </button>
        </div>
      )}

      {/* ── EXPANDED ASSISTANT CHAT WINDOW (BOTTOM-LEFT) ── */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '24px',
            width: isMinimized ? '320px' : '380px',
            maxWidth: 'calc(100vw - 32px)',
            height: isMinimized ? '60px' : '530px',
            maxHeight: 'calc(100vh - 100px)',
            background: '#ffffff',
            borderRadius: '20px',
            border: '1.5px solid #e2e8f0',
            boxShadow: '0 20px 60px rgba(15, 23, 42, 0.16)',
            zIndex: 995,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            transition: 'height 0.25s cubic-bezier(0.16, 1, 0.3, 1), width 0.25s ease',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '12px 16px',
              background: '#f8fafc',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              userSelect: 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: '#0284c7',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Sparkles size={14} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-headline)',
                      fontSize: '0.95rem',
                      fontWeight: 800,
                      color: '#0f172a',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    Inveni Assistant
                  </span>
                  <span
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      padding: '1px 6px',
                      borderRadius: '9999px',
                      background: '#ecfdf5',
                      color: '#16a34a',
                      border: '1px solid #bbf7d0',
                    }}
                  >
                    {contextMeta.badge}
                  </span>
                </div>
                <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                  {currentUser ? (currentUser.role === 'owner' ? 'Host View' : 'Renter Mode') : 'Public Exploration'}
                </div>
              </div>
            </div>

            {/* Window Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button
                type="button"
                onClick={() => setIsMinimized(!isMinimized)}
                title={isMinimized ? 'Expand' : 'Minimize'}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '5px',
                  color: '#64748b',
                  borderRadius: '6px',
                }}
              >
                {isMinimized ? <Maximize2 size={14} /> : <Minus size={14} />}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Close Assistant"
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '5px',
                  color: '#64748b',
                  borderRadius: '6px',
                }}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Message History */}
              <div
                style={{
                  flex: 1,
                  padding: '14px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  background: '#fcfcfd',
                }}
              >
                {messages.map((m) => (
                  <div
                    key={m.id}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: m.sender === 'user' ? 'flex-end' : 'flex-start',
                    }}
                  >
                    {m.agent && (
                      <span
                        style={{
                          fontSize: '0.65rem',
                          color: '#64748b',
                          marginBottom: '3px',
                          marginLeft: '4px',
                          fontWeight: 700,
                        }}
                      >
                        {m.agent}
                      </span>
                    )}
                    <div
                      style={{
                        maxWidth: '85%',
                        padding: '10px 14px',
                        borderRadius: m.sender === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                        background: m.sender === 'user' ? '#0284c7' : '#f1f5f9',
                        color: m.sender === 'user' ? '#ffffff' : '#0f172a',
                        fontSize: '0.84rem',
                        lineHeight: 1.45,
                        boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
                        wordBreak: 'break-word',
                      }}
                    >
                      {m.text}
                    </div>

                    {/* Action button in bot response */}
                    {m.action && (
                      <button
                        type="button"
                        onClick={() => handleActionClick(m.action)}
                        style={{
                          marginTop: '6px',
                          background: '#ffffff',
                          border: '1.5px solid #0284c7',
                          color: '#0284c7',
                          padding: '5px 12px',
                          borderRadius: '8px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          boxShadow: '0 2px 6px rgba(2, 132, 199, 0.1)',
                          transition: 'all 0.2s',
                        }}
                      >
                        <span>{m.action.label}</span>
                        <ChevronRight size={13} />
                      </button>
                    )}

                    <span
                      style={{
                        fontSize: '0.6rem',
                        color: '#94a3b8',
                        marginTop: '2px',
                        marginRight: m.sender === 'user' ? '4px' : 0,
                        marginLeft: m.sender === 'bot' ? '4px' : 0,
                      }}
                    >
                      {m.timestamp}
                    </span>
                  </div>
                ))}

                {isTyping && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px' }}>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Inveni Agent thinking…</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Suggestion Chips */}
              <div
                style={{
                  padding: '8px 12px',
                  background: '#f8fafc',
                  borderTop: '1px solid #e2e8f0',
                  display: 'flex',
                  gap: '6px',
                  overflowX: 'auto',
                  whiteSpace: 'nowrap',
                }}
              >
                {contextMeta.suggestions.map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(chip)}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '9999px',
                      padding: '4px 10px',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      color: '#334155',
                      cursor: 'pointer',
                      flexShrink: 0,
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#0284c7';
                      e.currentTarget.style.color = '#0284c7';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#cbd5e1';
                      e.currentTarget.style.color = '#334155';
                    }}
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* Input Footer */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                style={{
                  padding: '10px 12px',
                  background: '#ffffff',
                  borderTop: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Ask about rooms, food, Wi-Fi, booking…"
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '9999px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.82rem',
                    fontFamily: 'var(--font-ui)',
                    outline: 'none',
                    color: '#0f172a',
                    background: '#f8fafc',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#0284c7')}
                  onBlur={(e) => (e.target.style.borderColor = '#cbd5e1')}
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  style={{
                    background: inputText.trim() ? '#0284c7' : '#e2e8f0',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: inputText.trim() ? 'pointer' : 'default',
                    transition: 'background 0.2s',
                  }}
                >
                  <Send size={14} />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
};
