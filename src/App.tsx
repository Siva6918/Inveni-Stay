import React, { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { HeroSection } from './components/hero/HeroSection';
import { FeaturedDestinationsSection } from './components/discovery/FeaturedDestinationsSection';
import { CategoryExplorationSection } from './components/discovery/CategoryExplorationSection';
import { ThreeRoomViewer } from './components/room/ThreeRoomViewer';
import { ProblemStorySection } from './components/story/ProblemStorySection';
import { HowItWorksSection } from './components/story/HowItWorksSection';
import { InteractiveVideoSection } from './components/video/InteractiveVideoSection';
import { GlobalSatelliteStreetViewSection } from './components/video/GlobalSatelliteStreetViewSection';
import { PropertyPreviewSection } from './components/discovery/PropertyPreviewSection';
import { RoomAvailabilitySection } from './components/room/RoomAvailabilitySection';
import { AIConceptPreviewSection } from './components/ai/AIConceptPreviewSection';
import { TrustSafetySection } from './components/trust/TrustSafetySection';
import { CorridorMapVisual } from './components/discovery/CorridorMapVisual';
import { VisionExpansionSection } from './components/vision/VisionExpansionSection';
import { FinalCTASection } from './components/layout/FinalCTASection';
import { Footer } from './components/layout/Footer';
import { DiscoveryPage } from './components/search/DiscoveryPage';
import { PropertyDetailPage } from './components/property/PropertyDetailPage';
import { ReservationFlowPage } from './components/reservation/ReservationFlowPage';
import { ReservationDetailPage } from './components/reservation/ReservationDetailPage';
import { MyReservationsPage } from './components/reservation/MyReservationsPage';
import { OwnerDashboard } from './components/owner/OwnerDashboard';
import { NotificationCenter } from './components/notifications/NotificationCenter';
import { ToastProvider } from './context/ToastContext';
import { CreateBuildingModal } from './components/creator/CreateBuildingModal';
import { AIAssistantModal } from './components/ai/AIAssistantModal';
import { AIAssistantDock } from './components/ai/AIAssistantDock';
import { AuthModal } from './components/auth/AuthModal';
import { propertyService } from './services/propertyService';
import { authService } from './services/authService';
import { RelocationFilterState, PropertyListing, AuthUser } from './types';
import { CheckCircle2 } from 'lucide-react';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<
    'landing' | 'discovery' | 'property-detail' | 'reservation-flow' | 'reservation-detail' | 'my-reservations' | 'owner' | 'notifications'
  >('landing');
  const [ownerSubView, setOwnerSubView] = useState<'overview' | 'properties' | 'rooms' | 'reservations'>('overview');
  const [ownerPropertyId, setOwnerPropertyId] = useState<string>('panyam_sri_sai_residency');
  const [activeDestination, setActiveDestination] = useState<string>('Panyam');
  const [activeBudget, setActiveBudget] = useState<number>(6000);
  const [activeRoomType, setActiveRoomType] = useState<string>('Single');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('panyam_sri_sai_residency');
  const [selectedRoomId, setSelectedRoomId] = useState<string>('101');
  const [activeReservationId, setActiveReservationId] = useState<string>('INV-2026-00118');
  const [searchNotification, setSearchNotification] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState<boolean>(false);
  const [aiAssistantPrompt, setAIAssistantPrompt] = useState<string>('');
  const [authModalConfig, setAuthModalConfig] = useState<{
    isOpen: boolean;
    initialMode?: 'login' | 'signup';
    contextTitle?: string;
    contextSubtitle?: string;
    intendedRole?: 'renter' | 'owner';
  }>({ isOpen: false });

  // Initialize view from URL if present
  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname;
      const params = new URLSearchParams(window.location.search);
      const dest = params.get('destination') || 'Panyam';
      const budget = Number(params.get('budget')) || 6000;
      const room = params.get('room') || 'Single';

      // 1. Check for Owner Portal Route: /owner (Section 5)
      if (path.startsWith('/owner')) {
        setCurrentView('owner');
        if (path.includes('/rooms')) {
          setOwnerSubView('rooms');
          const match = path.match(/\/owner\/properties\/([^/?]+)\/rooms/);
          if (match) setOwnerPropertyId(decodeURIComponent(match[1]));
        } else if (path.includes('/reservations')) {
          setOwnerSubView('reservations');
          const match = path.match(/\/owner\/properties\/([^/?]+)\/reservations/);
          if (match) setOwnerPropertyId(decodeURIComponent(match[1]));
        } else if (path.includes('/properties')) {
          setOwnerSubView('properties');
        } else {
          setOwnerSubView('overview');
        }
        return;
      }

      // 2. Check for Reservation Flow Route: /reserve/:propertyId/:roomId
      const reserveMatch = path.match(/\/reserve\/([^/?]+)\/([^/?]+)/);
      if (reserveMatch) {
        setCurrentView('reservation-flow');
        setSelectedPropertyId(decodeURIComponent(reserveMatch[1]));
        setSelectedRoomId(decodeURIComponent(reserveMatch[2]));
        return;
      }

      // 3. Check for Reservation Detail Route: /reservation/:reservationId
      const resMatch = path.match(/\/reservation\/([^/?]+)/);
      if (resMatch) {
        setCurrentView('reservation-detail');
        setActiveReservationId(decodeURIComponent(resMatch[1]));
        return;
      }

      // 4. Check for My Reservations Route: /reservations
      if (path === '/reservations' || path.startsWith('/reservations/') || path === '/my-stays') {
        setCurrentView('my-reservations');
        return;
      }

      // Check for Notification Center: /notifications (Phase 8 Section 11, 40)
      if (path === '/notifications' || path === '/settings/notifications') {
        setCurrentView('notifications');
        return;
      }

      // 5. Check for Property Detail Route: /explore/property/:propertyId
      const propMatch = path.match(/\/explore\/property\/([^/?]+)/);
      if (propMatch) {
        setCurrentView('property-detail');
        setSelectedPropertyId(decodeURIComponent(propMatch[1]));
        return;
      }

      // 6. Check for AI Relocation Assistant Route: /assistant
      if (path === '/assistant' || path.startsWith('/assistant')) {
        setCurrentView('landing');
        setIsAIAssistantOpen(true);
        const queryPrompt = params.get('q') || '';
        if (queryPrompt) setAIAssistantPrompt(queryPrompt);
        return;
      }

      // 7. Check for Auth Modal Route: /login or /signup
      if (path === '/login' || path === '/signup') {
        setAuthModalConfig({
          isOpen: true,
          initialMode: path === '/signup' ? 'signup' : 'login',
          intendedRole: 'renter',
          contextTitle: 'Welcome to Inveni Stay',
          contextSubtitle: 'Sign in to manage your bookings and verified reservations.',
        });
      }

      // 8. Check for Discovery Search Route: /explore
      if (path.includes('/explore') || params.has('destination')) {
        setCurrentView('discovery');
        setActiveDestination(dest);
        setActiveBudget(budget);
        setActiveRoomType(room);
        return;
      }

      // 9. Fallback to Home Landing Page
      setCurrentView('landing');
    };

    handleLocationChange();
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const navigateToDiscovery = (destination: string, budget: number, roomType: string) => {
    setActiveDestination(destination);
    setActiveBudget(budget);
    setActiveRoomType(roomType);
    setCurrentView('discovery');
    window.history.pushState(
      null,
      '',
      `/explore?destination=${encodeURIComponent(destination)}&budget=${budget}&room=${roomType}`
    );
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToPropertyDetail = (propertyId: string) => {
    setSelectedPropertyId(propertyId);
    setCurrentView('property-detail');
    window.history.pushState(null, '', `/explore/property/${encodeURIComponent(propertyId)}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToReservation = (propertyId: string, roomId: string) => {
    const user = authService.getCurrentUser();
    if (!user) {
      const prop = propertyService.getPropertyById(propertyId);
      const propName = prop?.name || 'Selected Stay';
      authService.setPendingAction({ type: 'reserve', propertyId, roomId });
      setAuthModalConfig({
        isOpen: true,
        initialMode: 'login',
        contextTitle: `Continue to Reserve Room #${roomId}`,
        contextSubtitle: `Sign in or use a demo persona to secure Room #${roomId} at ${propName}. You will return directly to checkout.`,
        intendedRole: 'renter',
      });
      return;
    }

    setSelectedPropertyId(propertyId);
    setSelectedRoomId(roomId);
    setCurrentView('reservation-flow');
    window.history.pushState(
      null,
      '',
      `/reserve/${encodeURIComponent(propertyId)}/${encodeURIComponent(roomId)}`
    );
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAuthSuccess = (_user: AuthUser) => {
    setAuthModalConfig({ isOpen: false });
    const pending = authService.getPendingAction();
    if (pending) {
      authService.clearPendingAction();
      if (pending.type === 'reserve' && pending.propertyId && pending.roomId) {
        setSelectedPropertyId(pending.propertyId);
        setSelectedRoomId(pending.roomId);
        setCurrentView('reservation-flow');
        window.history.pushState(
          null,
          '',
          `/reserve/${encodeURIComponent(pending.propertyId)}/${encodeURIComponent(pending.roomId)}`
        );
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      if (pending.type === 'owner_dashboard' || pending.type === 'list_property') {
        navigateToOwnerPortal('overview');
        return;
      }
    }
  };

  const handleOwnerPortalClick = () => {
    const user = authService.getCurrentUser();
    if (!user || user.role !== 'owner') {
      authService.setPendingAction({ type: 'owner_dashboard' });
      setAuthModalConfig({
        isOpen: true,
        initialMode: 'login',
        contextTitle: 'Owner Management Portal',
        contextSubtitle: 'Sign in with an owner account or switch to Owner A / Owner B demo persona to manage your properties.',
        intendedRole: 'owner',
      });
      return;
    }
    navigateToOwnerPortal('overview');
  };

  const handleCategorySelect = (category: string) => {
    const roomPreference = category === 'PG' ? 'Single' : category;
    navigateToDiscovery(activeDestination, activeBudget, roomPreference);
  };

  const navigateToReservationDetail = (reservationId: string) => {
    setActiveReservationId(reservationId);
    setCurrentView('reservation-detail');
    window.history.pushState(null, '', `/reservation/${encodeURIComponent(reservationId)}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToMyReservations = () => {
    setCurrentView('my-reservations');
    window.history.pushState(null, '', '/reservations');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToOwnerPortal = (
    subView: 'overview' | 'properties' | 'rooms' | 'reservations' = 'overview',
    propId?: string
  ) => {
    setCurrentView('owner');
    setOwnerSubView(subView);
    if (propId) setOwnerPropertyId(propId);
    const path = subView === 'overview' ? '/owner' : `/owner/${subView}`;
    window.history.pushState(null, '', path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToHome = () => {
    setCurrentView('landing');
    window.history.pushState(null, '', '/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToNotifications = () => {
    setCurrentView('notifications');
    window.history.pushState(null, '', '/notifications');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAIAssistant = (prompt?: string) => {
    if (prompt) setAIAssistantPrompt(prompt);
    setIsAIAssistantOpen(true);
  };

  const handleHeroSearchSubmit = (criteria: RelocationFilterState) => {
    setSearchNotification(`Routing to live stays in ${criteria.destination}...`);
    setTimeout(() => {
      setSearchNotification(null);
      navigateToDiscovery(criteria.destination, criteria.budgetMax, criteria.roomPreference);
    }, 400);
  };

  const handleScrollToRoomMatrix = () => {
    setCurrentView('landing');
    setTimeout(() => {
      const elem = document.getElementById('room-availability');
      if (elem) elem.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <ToastProvider>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', width: '100%' }}>
        {/* Toast Notification when transitioning */}
        {searchNotification && (
          <div
            style={{
              position: 'fixed',
              top: '80px',
              right: '20px',
              zIndex: 3000,
              background: '#ffffff',
              color: '#070a0e',
              border: '2px solid #00f2fe',
              padding: '1rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              boxShadow: '0 12px 36px rgba(0, 0, 0, 0.6)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              animation: 'slideInRight 0.3s ease-out forwards',
            }}
          >
            <CheckCircle2 size={24} color="#00f2fe" />
            <div style={{ fontWeight: 800, fontSize: '0.92rem' }}>{searchNotification}</div>
          </div>
        )}

        {/* Global Navbar */}
        <Navbar
          onSearchClick={() => navigateToDiscovery(activeDestination, activeBudget, activeRoomType)}
          onNavigateToMyReservations={navigateToMyReservations}
          onNavigateToOwnerPortal={handleOwnerPortalClick}
          onNavigateToNotifications={navigateToNotifications}
          onOpenCreateModal={() => setIsCreateModalOpen(true)}
          onOpenAIAssistant={() => handleOpenAIAssistant()}
          onOpenAuthModal={(role) => {
            setAuthModalConfig({
              isOpen: true,
              initialMode: 'login',
              intendedRole: role || 'renter',
              contextTitle: role === 'owner' ? 'Owner Portal Access' : 'Sign In to Inveni Stay',
              contextSubtitle:
                role === 'owner'
                  ? 'Manage your listed properties and units across the corridor.'
                  : 'Access your active reservations and verified student stays.',
            });
          }}
          onNavigateHome={navigateToHome}
          onSelectCategory={handleCategorySelect}
        />

        {/* View Switcher: Landing vs. Discovery vs. Property Detail vs. Reservation Views vs. Owner Portal vs. Notifications */}
        {currentView === 'notifications' ? (
          <main style={{ paddingTop: '80px', width: '100%', minHeight: '80vh', background: 'var(--canvas-bg)' }}>
            <NotificationCenter
              onNavigate={(route) => {
                if (route === '/my-stays' || route.startsWith('/reservations')) {
                  navigateToMyReservations();
                } else if (route.startsWith('/owner')) {
                  navigateToOwnerPortal('overview');
                } else {
                  navigateToHome();
                }
              }}
            />
          </main>
        ) : currentView === 'owner' ? (
        <main style={{ paddingTop: '80px', width: '100%' }}>
          <OwnerDashboard
            onNavigateToRenterHome={navigateToHome}
            onExploreProperty={navigateToPropertyDetail}
            initialPropertyId={ownerPropertyId}
            initialSubView={ownerSubView}
          />
        </main>
      ) : currentView === 'reservation-flow' ? (
        <main style={{ paddingTop: '80px', width: '100%' }}>
          <ReservationFlowPage
            propertyId={selectedPropertyId}
            roomId={selectedRoomId}
            onBackToProperty={() => navigateToPropertyDetail(selectedPropertyId)}
            onNavigateToMyReservations={navigateToMyReservations}
            onNavigateToReservationDetail={navigateToReservationDetail}
            onBackToExplore={() => navigateToDiscovery(activeDestination, activeBudget, activeRoomType)}
          />
        </main>
      ) : currentView === 'reservation-detail' ? (
        <main style={{ paddingTop: '80px', width: '100%' }}>
          <ReservationDetailPage
            reservationId={activeReservationId}
            onBackToMyReservations={navigateToMyReservations}
            onBackToExplore={() => navigateToDiscovery(activeDestination, activeBudget, activeRoomType)}
          />
        </main>
      ) : currentView === 'my-reservations' ? (
        <main style={{ paddingTop: '80px', width: '100%' }}>
          <MyReservationsPage
            onSelectReservation={navigateToReservationDetail}
            onExploreProperty={navigateToPropertyDetail}
            onBackToExplore={() => navigateToDiscovery(activeDestination, activeBudget, activeRoomType)}
          />
        </main>
      ) : currentView === 'property-detail' ? (
        <main style={{ paddingTop: '80px', width: '100%' }}>
          <PropertyDetailPage
            propertyId={selectedPropertyId}
            onBackToDiscovery={() => navigateToDiscovery(activeDestination, activeBudget, activeRoomType)}
            onBackToHome={navigateToHome}
            onStartReservation={navigateToReservation}
          />
        </main>
      ) : currentView === 'discovery' ? (
        <main style={{ paddingTop: '80px', width: '100%' }}>
          <DiscoveryPage
            initialDestination={activeDestination}
            initialBudget={activeBudget}
            initialRoomType={activeRoomType}
            onBackToHome={navigateToHome}
            onNavigateToProperty={navigateToPropertyDetail}
            onSelectPropertyForRoomMatrix={(p) => {
              navigateToPropertyDetail(p.id);
            }}
          />
        </main>
      ) : (
        <main style={{ width: '100%' }}>
          {/* 1. Hero with Location-First Dual Search & 3D Interactive Spatial Intro */}
          <HeroSection
            onSearchSubmit={handleHeroSearchSubmit}
            onOpenCreateModal={() => setIsCreateModalOpen(true)}
            onOpenAssistant={handleOpenAIAssistant}
          />

          {/* 2. AI Search Requirement Experience */}
          <AIConceptPreviewSection
            onOpenAssistant={handleOpenAIAssistant}
            onSelectRoom={navigateToReservation}
            onExploreProperty={navigateToPropertyDetail}
          />

          {/* 3. Category Discovery (PGs, Rooms, Apartments, Commercial) */}
          <CategoryExplorationSection onSelectCategory={handleCategorySelect} />

          {/* 4. “How Inveni Stay Works” (4-Step Spatial Flow) */}
          <HowItWorksSection />

          {/* 5. Featured Destinations (Stanza-Inspired Hub Cards) */}
          <FeaturedDestinationsSection
            onSelectDestination={(dest) => navigateToDiscovery(dest, activeBudget, activeRoomType)}
          />

          {/* 6. Featured Stays (Premium Residence Cards) */}
          <PropertyPreviewSection
            onInspectRoomsClick={() => navigateToPropertyDetail('panyam_sri_sai_residency')}
          />

          {/* 7. Explore a Room (Interactive Three.js Spatial Viewer Showcase) */}
          <section className="section-wrapper" style={{ position: 'relative', background: '#ffffff' }}>
            <div className="container">
              <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 2.5rem' }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.85rem',
                    padding: '0.35rem 0.85rem',
                    borderRadius: '9999px',
                    background: '#e0f2fe',
                    color: '#0284c7',
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                  }}
                >
                  <span>Interactive 3D Room Exploration</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-jim-nightshade)',
                      fontSize: '1.5rem',
                      color: '#0284c7',
                      letterSpacing: '0.04em',
                    }}
                  >
                    Take a look inside...
                  </span>
                </div>
                <h2
                  style={{
                    fontFamily: 'var(--font-headline)',
                    fontSize: 'clamp(2rem, 3.8vw, 3rem)',
                    color: '#0f172a',
                    textTransform: 'uppercase',
                    marginBottom: '0.75rem',
                  }}
                >
                  Explore a Room Before You Arrive
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.02rem', lineHeight: 1.6 }}>
                  Directly inspect Room 101 at Sri Sai Residency. Drag or touch to orbit 360°, zoom in, and click hotspots to check the bed, study desk, wardrobe, private attached bath, and ventilation window.
                </p>
              </div>

              <ThreeRoomViewer
                roomNo="101"
                roomType="Single"
                monthlyRent={5500}
                onSwitchToFloorPlan={() => navigateToPropertyDetail('panyam_sri_sai_residency')}
                onSwitchToGallery={() => navigateToPropertyDetail('panyam_sri_sai_residency')}
              />
            </div>
          </section>

          {/* 8. Availability-First Section (Room Availability Matrix) */}
          <RoomAvailabilitySection
            onSelectRoomForReservation={navigateToReservation}
            onExploreProperty={navigateToPropertyDetail}
          />

          {/* 9. Interactive Spatial Video Inspection (Intro.mp4 Walkthrough) */}
          <InteractiveVideoSection />

          {/* 10. Remote Exploration Section (Global Satellite & Street View Reconnaissance) */}
          <GlobalSatelliteStreetViewSection />

          {/* 11. Owner Ecosystem & Verified Standard */}
          <TrustSafetySection />

          {/* 12. Spatial Corridor & Bharat Builds Expansion Roadmap */}
          <VisionExpansionSection />

          {/* 13. Final Action CTA */}
          <FinalCTASection onSearchClick={() => navigateToDiscovery('Panyam', 6000, 'Single')} />
        </main>
      )}

      {/* Global Footer */}
      <Footer />

      {/* AI Relocation Assistant Modal (Phase 5 Core Experience) */}
      <AIAssistantModal
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)}
        initialPrompt={aiAssistantPrompt}
        onSelectRoom={navigateToReservation}
        onExploreProperty={navigateToPropertyDetail}
        onFallbackToSearch={(dest) => {
          setIsAIAssistantOpen(false);
          navigateToDiscovery(dest || activeDestination, activeBudget, activeRoomType);
        }}
      />

      {/* Building & Room Creation Studio Modal */}
      <CreateBuildingModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onBuildingCreated={(newProperty) => {
          propertyService.addCustomProperty(newProperty);
          setSearchNotification(`"${newProperty.name}" with ${newProperty.rooms.length} custom rooms created! Routing to live property...`);
          setTimeout(() => {
            setSearchNotification(null);
            navigateToPropertyDetail(newProperty.id);
          }, 400);
        }}
      />

      {/* Persistent Context-Aware Floating AI Assistant Dock (Bottom-Left) */}
      <AIAssistantDock
        currentView={currentView}
        selectedPropertyId={selectedPropertyId}
        selectedRoomId={selectedRoomId}
        onNavigateToDiscovery={(dest, budget, room) => navigateToDiscovery(dest || activeDestination, budget || activeBudget, room || activeRoomType)}
        onNavigateToProperty={navigateToPropertyDetail}
        onNavigateToReservation={navigateToReservation}
        onNavigateToOwner={navigateToOwnerPortal}
        onNavigateToMyReservations={navigateToMyReservations}
        onOpenAddProperty={() => setIsCreateModalOpen(true)}
        onOpenAuthModal={(role) =>
          setAuthModalConfig({
            isOpen: true,
            initialMode: 'login',
            intendedRole: role || 'renter',
            contextTitle: role === 'owner' ? 'Owner Portal Login' : 'Sign in to Continue',
            contextSubtitle: 'Access verified reservations and personalized account features.',
          })
        }
      />

      {/* Amazon Cognito / Inveni Stay Account Authentication Modal */}
      <AuthModal
        isOpen={authModalConfig.isOpen}
        onClose={() => setAuthModalConfig({ isOpen: false })}
        contextTitle={authModalConfig.contextTitle}
        contextSubtitle={authModalConfig.contextSubtitle}
        intendedRole={authModalConfig.intendedRole}
        initialMode={authModalConfig.initialMode}
        onSuccess={handleAuthSuccess}
      />
      </div>
    </ToastProvider>
  );
};
