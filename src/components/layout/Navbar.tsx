import React, { useState, useEffect, useRef } from 'react';
import {
  Compass,
  Menu,
  X,
  User,
  Building,
  Bell,
  LogOut,
  ChevronDown,
  Layers,
  MapPin,
  Sparkles,
  Receipt,
  HelpCircle,
} from 'lucide-react';
import { authService } from '../../services/authService';
import { notificationService } from '../../services/notificationService';
import { AuthUser, InAppNotification } from '../../types';

interface NavbarProps {
  onSearchClick: () => void;
  onNavigateToMyReservations?: () => void;
  onNavigateToOwnerPortal?: () => void;
  onNavigateToNotifications?: () => void;
  onOpenCreateModal?: () => void;
  onOpenAIAssistant?: () => void;
  onOpenAuthModal?: (intendedRole?: 'renter' | 'owner') => void;
  onNavigateHome?: () => void;
  onSelectCategory?: (cat: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onSearchClick,
  onNavigateToMyReservations,
  onNavigateToOwnerPortal,
  onNavigateToNotifications,
  onOpenCreateModal,
  onOpenAIAssistant,
  onOpenAuthModal,
  onNavigateHome,
  onSelectCategory,
}) => {
  const [scrolled, setScrolled] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(authService.getCurrentUser());
  const [userDropdownOpen, setUserDropdownOpen] = useState<boolean>(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState<boolean>(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const userDropdownRef = useRef<HTMLDivElement>(null);
  const moreDropdownRef = useRef<HTMLDivElement>(null);

  // Subscribe to auth state
  useEffect(() => {
    const unsub = authService.subscribe((state) => {
      setCurrentUser(state.user);
    });
    return () => unsub();
  }, []);

  // Update notifications
  const updateNotifs = () => {
    const uid = currentUser?.id || 'usr_guest';
    setUnreadCount(notificationService.getUnreadCount(uid));
  };

  useEffect(() => {
    updateNotifs();
    const unsub = notificationService.subscribeToChanges(updateNotifs);
    return () => unsub();
  }, [currentUser]);

  // Scroll listener
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Click outside to dismiss dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (userDropdownRef.current && !userDropdownRef.current.contains(target)) {
        setUserDropdownOpen(false);
      }
      if (moreDropdownRef.current && !moreDropdownRef.current.contains(target)) {
        setMoreDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isOwnerUser = currentUser?.role === 'owner' || (currentUser?.id?.startsWith('owner_') ?? false);

  const handleLogout = () => {
    authService.logout();
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    if (onNavigateHome) onNavigateHome();
  };

  const handleOwnerClick = () => {
    if (isOwnerUser) {
      if (onNavigateToOwnerPortal) onNavigateToOwnerPortal();
    } else {
      if (onOpenAuthModal) onOpenAuthModal('owner');
    }
  };

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        backgroundColor: scrolled ? 'rgba(255, 255, 255, 0.96)' : 'rgba(255, 255, 255, 0.88)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(226, 232, 240, 0.9)',
        boxShadow: scrolled ? '0 4px 20px rgba(15, 23, 42, 0.06)' : 'none',
        height: '72px',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem',
          width: '100%',
        }}
      >
        {/* ===================================================================
            LEFT: BRAND LOCKUP WITH CRISP LOGO
            =================================================================== */}
        <div
          onClick={() => {
            if (onNavigateHome) onNavigateHome();
            else window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            cursor: 'pointer',
            flexShrink: 0,
            textDecoration: 'none',
          }}
          role="button"
          tabIndex={0}
          aria-label="Inveni Stay Home"
        >
          <div
            style={{
              width: '38px',
              height: '42px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <img
              src="/logo.png"
              alt="Inveni Stay Logo"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                filter: 'drop-shadow(0 2px 6px rgba(2, 132, 199, 0.25))',
              }}
              onError={(e) => {
                // Fallback to capital filename if needed
                (e.currentTarget as HTMLImageElement).src = '/Logo.png';
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span
                style={{
                  fontFamily: 'var(--font-fascinate)',
                  fontSize: '1.45rem',
                  fontWeight: 400,
                  letterSpacing: '0.06em',
                  color: '#0f172a',
                  lineHeight: 1.1,
                }}
              >
                Inveni <span style={{ color: '#0284c7' }}>Stay</span>
              </span>
            </div>
            <span
              style={{
                fontFamily: 'var(--font-niconne)',
                fontSize: '0.92rem',
                fontWeight: 500,
                color: '#0284c7',
                letterSpacing: '0.02em',
                lineHeight: 1,
                marginTop: '1px',
              }}
            >
              Find your stay before you arrive
            </span>
          </div>
        </div>

        {/* ===================================================================
            CENTER: STREAMLINED EXPLORATION LINKS (Desktop: >= 1024px)
            =================================================================== */}
        <nav
          style={{
            display: 'none',
            alignItems: 'center',
            gap: '1.75rem',
          }}
          className="navbar-center-links"
        >
          <button
            type="button"
            onClick={onSearchClick}
            style={navLinkStyle}
          >
            <Compass size={15} color="#0284c7" />
            <span>Explore Stays</span>
          </button>

          <a
            href="#categories"
            onClick={(e) => {
              if (window.location.pathname !== '/') {
                e.preventDefault();
                if (onNavigateHome) {
                  onNavigateHome();
                  setTimeout(() => {
                    document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' });
                  }, 150);
                }
              }
            }}
            style={navLinkStyle}
          >
            <span>Categories</span>
          </a>

          <a
            href="#destinations"
            onClick={(e) => {
              if (window.location.pathname !== '/') {
                e.preventDefault();
                if (onNavigateHome) {
                  onNavigateHome();
                  setTimeout(() => {
                    document.getElementById('destinations')?.scrollIntoView({ behavior: 'smooth' });
                  }, 150);
                }
              }
            }}
            style={navLinkStyle}
          >
            <MapPin size={14} color="#64748b" />
            <span>Locations</span>
          </a>

          <a
            href="#how-it-works"
            onClick={(e) => {
              if (window.location.pathname !== '/') {
                e.preventDefault();
                if (onNavigateHome) {
                  onNavigateHome();
                  setTimeout(() => {
                    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                  }, 150);
                }
              }
            }}
            style={navLinkStyle}
          >
            <span>How it Works</span>
          </a>

          {/* More + Dropdown */}
          <div style={{ position: 'relative' }} ref={moreDropdownRef}>
            <button
              type="button"
              onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
              style={{
                ...navLinkStyle,
                color: moreDropdownOpen ? '#0284c7' : '#475569',
              }}
            >
              <span>More</span>
              <ChevronDown size={14} style={{ transform: moreDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>

            {moreDropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '36px',
                  left: '-20px',
                  width: '230px',
                  background: '#ffffff',
                  borderRadius: '14px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 16px 36px rgba(15, 23, 42, 0.12)',
                  padding: '0.5rem',
                  zIndex: 1100,
                  animation: 'fadeInDown 0.18s ease-out',
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setMoreDropdownOpen(false);
                    if (onOpenAIAssistant) onOpenAIAssistant();
                  }}
                  style={dropdownItemStyle}
                >
                  <Sparkles size={16} color="#d97706" />
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.84rem' }}>AI Relocation Guide</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Natural language stay matching</div>
                  </div>
                </button>

                <a
                  href="#remote-preview"
                  onClick={() => setMoreDropdownOpen(false)}
                  style={dropdownItemStyle}
                >
                  <Layers size={16} color="#0284c7" />
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.84rem' }}>Remote Living Preview</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>360° video & 3D room tour</div>
                  </div>
                </a>

                <a
                  href="#trust"
                  onClick={() => setMoreDropdownOpen(false)}
                  style={dropdownItemStyle}
                >
                  <HelpCircle size={16} color="#16a34a" />
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.84rem' }}>Trust & Safety Standard</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>100% verified coordinator audits</div>
                  </div>
                </a>
              </div>
            )}
          </div>
        </nav>

        {/* ===================================================================
            RIGHT: AUTHENTICATION & ACTION BUTTONS
            =================================================================== */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Owner CTA ("List Property" / "Owner Portal") */}
          <button
            type="button"
            onClick={handleOwnerClick}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.48rem 0.95rem',
              borderRadius: 'var(--radius-md)',
              border: isOwnerUser ? '1px solid #bae6fd' : '1px solid #e2e8f0',
              background: isOwnerUser ? '#f0f9ff' : '#ffffff',
              color: isOwnerUser ? '#0284c7' : '#334155',
              fontSize: '0.84rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            title="Property Owner Management Portal"
          >
            <Building size={15} color="#0284c7" />
            <span className="navbar-owner-text">
              {isOwnerUser ? 'Owner Dashboard' : 'List Property'}
            </span>
          </button>

          {/* Renter Bookings Link if Authenticated Renter */}
          {currentUser && !isOwnerUser && onNavigateToMyReservations && (
            <button
              type="button"
              onClick={onNavigateToMyReservations}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.48rem 0.9rem',
                borderRadius: 'var(--radius-md)',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                color: '#0f172a',
                fontSize: '0.84rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <Receipt size={15} color="#d97706" />
              <span className="navbar-my-stays-text">My Stays</span>
            </button>
          )}

          {/* Notifications Bell */}
          {currentUser && onNavigateToNotifications && (
            <button
              type="button"
              onClick={onNavigateToNotifications}
              style={{
                position: 'relative',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-md)',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                color: unreadCount > 0 ? '#0284c7' : '#64748b',
                cursor: 'pointer',
              }}
              aria-label="Notifications"
              title="Notifications"
            >
              <Bell size={17} />
              {unreadCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-3px',
                    right: '-3px',
                    background: '#0284c7',
                    color: '#ffffff',
                    fontSize: '10px',
                    fontWeight: 800,
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid #ffffff',
                  }}
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          )}

          {/* Authentication State Button / User Dropdown */}
          {currentUser ? (
            <div style={{ position: 'relative' }} ref={userDropdownRef}>
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.42rem 0.85rem',
                  borderRadius: 'var(--radius-full)',
                  background: '#f8fafc',
                  border: '1.5px solid #cbd5e1',
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: isOwnerUser ? '#0284c7' : '#10b981',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                  }}
                >
                  {currentUser.fullName ? currentUser.fullName.charAt(0).toUpperCase() : 'U'}
                </div>
                <span
                  style={{
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    color: '#0f172a',
                    maxWidth: '110px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {currentUser.fullName ? currentUser.fullName.split(' ')[0] : 'Account'}
                </span>
                <ChevronDown size={14} color="#64748b" />
              </button>

              {userDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '42px',
                    right: 0,
                    width: '250px',
                    background: '#ffffff',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 16px 40px rgba(15, 23, 42, 0.12)',
                    padding: '0.75rem',
                    zIndex: 1100,
                    animation: 'fadeInDown 0.18s ease-out',
                  }}
                >
                  <div
                    style={{
                      padding: '0.65rem 0.75rem',
                      borderBottom: '1px solid #f1f5f9',
                      marginBottom: '0.4rem',
                    }}
                  >
                    <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>
                      {currentUser.fullName}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '1px' }}>
                      {currentUser.email}
                    </div>
                    <div
                      style={{
                        display: 'inline-block',
                        marginTop: '6px',
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: '10px',
                        background: isOwnerUser ? '#e0f2fe' : '#ecfdf5',
                        color: isOwnerUser ? '#0369a1' : '#047857',
                        textTransform: 'uppercase',
                      }}
                    >
                      {isOwnerUser ? 'Property Host & Owner' : 'Verified Renter'}
                    </div>
                  </div>

                  {isOwnerUser && onNavigateToOwnerPortal && (
                    <button
                      type="button"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onNavigateToOwnerPortal();
                      }}
                      style={dropdownItemStyle}
                    >
                      <Building size={16} color="#0284c7" />
                      <span>Owner Dashboard</span>
                    </button>
                  )}

                  {!isOwnerUser && onNavigateToMyReservations && (
                    <button
                      type="button"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onNavigateToMyReservations();
                      }}
                      style={dropdownItemStyle}
                    >
                      <Receipt size={16} color="#d97706" />
                      <span>My Bookings & Stays</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleLogout}
                    style={{
                      ...dropdownItemStyle,
                      color: '#dc2626',
                      marginTop: '0.3rem',
                      borderTop: '1px solid #f1f5f9',
                    }}
                  >
                    <LogOut size={16} color="#dc2626" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                if (onOpenAuthModal) onOpenAuthModal('renter');
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.52rem 1.1rem',
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                color: '#ffffff',
                fontSize: '0.86rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(2, 132, 199, 0.28)',
                border: 'none',
              }}
            >
              <User size={15} />
              <span>Sign In</span>
            </button>
          )}

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="navbar-mobile-toggle"
            aria-label="Toggle navigation menu"
            style={{
              display: 'none',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-md)',
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              color: '#0f172a',
              cursor: 'pointer',
            }}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* ===================================================================
          MOBILE SLIDE-OVER DRAWER (< 1024px)
          =================================================================== */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            top: '72px',
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(241, 245, 249, 0.78)',
            backdropFilter: 'blur(10px)',
            zIndex: 999,
          }}
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            style={{
              background: '#ffffff',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              maxHeight: 'calc(100vh - 72px)',
              overflowY: 'auto',
              borderBottom: '1px solid #e2e8f0',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.12)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Auth Banner */}
            {currentUser ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.85rem 1rem',
                  background: '#f8fafc',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                }}
              >
                <div>
                  <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.92rem' }}>
                    {currentUser.fullName}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    {currentUser.role === 'owner' ? 'Property Host & Owner' : 'Verified Renter'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  style={{
                    padding: '0.4rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #fecaca',
                    background: '#fef2f2',
                    color: '#dc2626',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onOpenAuthModal) onOpenAuthModal('renter');
                }}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.92rem',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Sign In / Create Account
              </button>
            )}

            {/* Mobile Nav Links */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onSearchClick();
                }}
                style={mobileLinkStyle}
              >
                <Compass size={18} color="#0284c7" />
                <span>Explore Stays Catalog</span>
              </button>

              <a
                href="#categories"
                onClick={() => setMobileMenuOpen(false)}
                style={mobileLinkStyle}
              >
                <Layers size={18} color="#64748b" />
                <span>Browse Categories</span>
              </a>

              <a
                href="#destinations"
                onClick={() => setMobileMenuOpen(false)}
                style={mobileLinkStyle}
              >
                <MapPin size={18} color="#64748b" />
                <span>Popular Destinations</span>
              </a>

              <a
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                style={mobileLinkStyle}
              >
                <HelpCircle size={18} color="#64748b" />
                <span>How Inveni Stay Works</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onOpenAIAssistant) onOpenAIAssistant();
                }}
                style={mobileLinkStyle}
              >
                <Sparkles size={18} color="#d97706" />
                <span>AI Relocation Assistant</span>
              </button>

              {onNavigateToMyReservations && (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigateToMyReservations();
                  }}
                  style={mobileLinkStyle}
                >
                  <Receipt size={18} color="#d97706" />
                  <span>My Reservations & Stays</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleOwnerClick();
                }}
                style={{
                  ...mobileLinkStyle,
                  background: '#f0f9ff',
                  border: '1px solid #bae6fd',
                  color: '#0369a1',
                }}
              >
                <Building size={18} color="#0284c7" />
                <span>{isOwnerUser ? 'Owner Dashboard' : 'List Your Property (Host Portal)'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Embedded CSS for responsive breakpoint handling */}
      <style>{`
        @media (min-width: 1024px) {
          .navbar-center-links {
            display: flex !important;
          }
        }
        @media (max-width: 1023px) {
          .navbar-mobile-toggle {
            display: flex !important;
          }
          .navbar-owner-text, .navbar-my-stays-text {
            display: none !important;
          }
        }
        @media (min-width: 640px) {
          .navbar-owner-text, .navbar-my-stays-text {
            display: inline !important;
          }
        }
      `}</style>
    </header>
  );
};

const navLinkStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.4rem',
  background: 'none',
  border: 'none',
  color: '#334155',
  fontFamily: 'var(--font-ui)',
  fontSize: '0.88rem',
  fontWeight: 600,
  cursor: 'pointer',
  padding: '0.35rem 0.2rem',
  transition: 'color 0.15s ease',
  textDecoration: 'none',
};

const dropdownItemStyle: React.CSSProperties = {
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  gap: '0.65rem',
  padding: '0.65rem 0.75rem',
  borderRadius: '8px',
  background: 'none',
  border: 'none',
  color: '#334155',
  fontSize: '0.84rem',
  fontWeight: 600,
  cursor: 'pointer',
  textAlign: 'left',
  textDecoration: 'none',
  transition: 'background 0.15s ease',
};

const mobileLinkStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  padding: '0.75rem 1rem',
  borderRadius: '10px',
  background: '#ffffff',
  border: '1px solid #f1f5f9',
  color: '#0f172a',
  fontSize: '0.9rem',
  fontWeight: 700,
  cursor: 'pointer',
  textDecoration: 'none',
  textAlign: 'left',
  width: '100%',
};
