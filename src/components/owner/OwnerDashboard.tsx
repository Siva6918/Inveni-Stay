import React, { useState, useEffect } from 'react';
import {
  PropertyListing,
  AuthUser,
  OwnerDashboardMetrics,
} from '../../types';
import { propertyService } from '../../services/propertyService';
import { reservationService } from '../../services/reservationService';
import { authService } from '../../services/authService';
import { OwnerRoomManager } from './OwnerRoomManager';
import { OwnerReservationManager } from './OwnerReservationManager';
import { OwnerPropertyModal } from './OwnerPropertyModal';
import { OwnerProfileModal } from './OwnerProfileModal';
import {
  Building,
  Layers,
  CheckCircle2,
  Receipt,
  Plus,
  Edit2,
  Clock,
  Sparkles,
  User,
  LogOut,
  MapPin,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Eye,
  Archive,
} from 'lucide-react';

interface OwnerDashboardProps {
  onNavigateToRenterHome: () => void;
  onExploreProperty: (propertyId: string) => void;
  initialPropertyId?: string;
  initialSubView?: 'overview' | 'properties' | 'rooms' | 'reservations';
}

export const OwnerDashboard: React.FC<OwnerDashboardProps> = ({
  onNavigateToRenterHome,
  onExploreProperty,
  initialPropertyId,
  initialSubView = 'overview',
}) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(authService.getCurrentUser());
  const [activeTab, setActiveTab] = useState<'overview' | 'properties' | 'rooms' | 'reservations'>(initialSubView);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(
    initialPropertyId || 'panyam_sri_sai_residency'
  );

  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<PropertyListing | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Subscribe to auth state
  useEffect(() => {
    const unsub = authService.subscribe((state) => {
      setCurrentUser(state.user);
    });
    return () => unsub();
  }, []);

  const currentOwnerId = currentUser?.id || 'owner_sri_sai_panyam';

  // Load properties owned by current user
  const ownerProperties = propertyService.getPropertiesByOwner(currentOwnerId);
  const selectedProperty = ownerProperties.find((p) => p.id === selectedPropertyId) || ownerProperties[0];

  // Load reservations count
  const allOwnerReservations = reservationService.getReservationsByOwner(currentOwnerId);
  const pendingReservationsCount = allOwnerReservations.filter((r) => r.status === 'REQUESTED').length;

  // Real backend metrics (Section 6)
  const metrics: OwnerDashboardMetrics = propertyService.getOwnerDashboardMetrics(
    currentOwnerId,
    pendingReservationsCount
  );

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleSwitchPersona = (persona: 'owner' | 'owner_b' | 'student') => {
    if (persona === 'owner') {
      authService.loginAsDemoUser('owner');
      setSelectedPropertyId('panyam_sri_sai_residency');
      handleRefresh();
    } else if (persona === 'owner_b') {
      authService.loginAsDemoUser('owner_b');
      setSelectedPropertyId('nandyal_lakshmi_residency');
      handleRefresh();
    } else {
      authService.loginAsDemoUser('student');
      onNavigateToRenterHome();
    }
  };

  const handlePublishProperty = (propertyId: string) => {
    const res = propertyService.publishProperty(currentOwnerId, propertyId);
    if (res.success) {
      handleRefresh();
    } else {
      alert(res.error || 'Failed to publish property');
    }
  };

  const handleArchiveProperty = (propertyId: string, propertyName: string) => {
    if (!confirm(`Archive "${propertyName}"? It will no longer appear in renter search.`)) return;
    const res = propertyService.archiveProperty(currentOwnerId, propertyId);
    if (res.success) {
      handleRefresh();
    } else {
      alert(res.error || 'Failed to archive property');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', paddingBottom: '4rem' }}>
      {/* Top Banner / Owner Context Bar */}
      <div
        style={{
          background: '#ffffff',
          color: 'var(--text-primary)',
          padding: '1.25rem 0',
          borderBottom: '1px solid #e2e8f0',
          boxShadow: '0 2px 4px rgba(15, 23, 42, 0.03)',
        }}
      >
        <div
          className="container"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(2, 132, 199, 0.1)',
                border: '1px solid rgba(14, 165, 233, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Building size={22} color="var(--c-sky-blue)" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-xs)', background: 'rgba(14, 165, 233, 0.12)', color: '#0284c7', letterSpacing: '0.05em' }}>
                  OWNER PORTAL
                </span>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  Authenticated: <strong style={{ color: '#0f172a' }}>{currentUser?.fullName || 'Rameshwar Reddy'}</strong>
                </span>
              </div>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0.15rem 0 0 0', letterSpacing: '0.02em', color: '#0f172a' }}>
                OWNER DASHBOARD
              </h1>
            </div>
          </div>

          {/* Persona Switcher & Back to Renter Link */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', background: '#f1f5f9', padding: '3px', borderRadius: 'var(--radius-sm)' }}>
              <button
                onClick={() => handleSwitchPersona('owner')}
                style={{
                  background: currentOwnerId === 'owner_sri_sai_panyam' ? '#ffffff' : 'transparent',
                  border: currentOwnerId === 'owner_sri_sai_panyam' ? '1px solid #cbd5e1' : 'none',
                  borderRadius: 'var(--radius-xs)',
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.78rem',
                  color: currentOwnerId === 'owner_sri_sai_panyam' ? '#0f172a' : '#64748b',
                  cursor: 'pointer',
                  fontWeight: currentOwnerId === 'owner_sri_sai_panyam' ? 700 : 500,
                  boxShadow: currentOwnerId === 'owner_sri_sai_panyam' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                }}
                title="Switch to Rameshwar Reddy (Owner A - Sri Sai Residency)"
              >
                Sri Sai (Owner A)
              </button>
              <button
                onClick={() => handleSwitchPersona('owner_b')}
                style={{
                  background: currentOwnerId === 'owner_lakshmi_nandyal' ? '#ffffff' : 'transparent',
                  border: currentOwnerId === 'owner_lakshmi_nandyal' ? '1px solid #cbd5e1' : 'none',
                  borderRadius: 'var(--radius-xs)',
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.78rem',
                  color: currentOwnerId === 'owner_lakshmi_nandyal' ? '#0f172a' : '#64748b',
                  cursor: 'pointer',
                  fontWeight: currentOwnerId === 'owner_lakshmi_nandyal' ? 700 : 500,
                  boxShadow: currentOwnerId === 'owner_lakshmi_nandyal' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                }}
                title="Switch to Venkat Lakshmi (Owner B - Lakshmi Residency)"
              >
                Lakshmi Res (Owner B)
              </button>
            </div>

            <button
              onClick={onNavigateToRenterHome}
              style={{
                background: 'rgba(14, 165, 233, 0.15)',
                border: '1px solid rgba(14, 165, 233, 0.4)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.4rem 0.85rem',
                fontSize: '0.8rem',
                color: 'var(--c-sky-blue)',
                cursor: 'pointer',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <span>Back to Renter Discovery</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>

      <div className="container" style={{ marginTop: '2rem' }}>
        {/* Navigation Tabs (Section 7) */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            borderBottom: '2px solid var(--border-medium)',
            paddingBottom: '0.75rem',
            marginBottom: '2rem',
          }}
        >
          <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto' }}>
            {[
              { id: 'overview', label: 'Dashboard', icon: <TrendingUp size={16} /> },
              { id: 'properties', label: 'My Properties', icon: <Building size={16} />, badge: ownerProperties.length },
              { id: 'rooms', label: 'Room Inventory', icon: <Layers size={16} />, badge: metrics.totalRooms },
              { id: 'reservations', label: 'Reservations', icon: <Receipt size={16} />, badge: pendingReservationsCount, badgeColor: '#d97706' },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  style={{
                    padding: '0.65rem 1.15rem',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    background: isActive ? 'var(--surface-2)' : 'transparent',
                    color: isActive ? '#0284c7' : '#64748b',
                    fontWeight: isActive ? 800 : 600,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && (
                    <span
                      style={{
                        fontSize: '0.72rem',
                        padding: '0.1rem 0.45rem',
                        borderRadius: 'var(--radius-full)',
                        background: tab.badgeColor ? 'rgba(217, 119, 6, 0.15)' : isActive ? '#e0f2fe' : '#f1f5f9',
                        color: tab.badgeColor || (isActive ? '#0369a1' : '#64748b'),
                        fontWeight: 800,
                      }}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="neomorph-btn"
              style={{
                padding: '0.55rem 0.95rem',
                fontSize: '0.82rem',
                fontWeight: 700,
                color: '#0f172a',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <User size={15} color="var(--c-sky-blue)" />
              <span>Owner Profile</span>
            </button>

            <button
              onClick={() => {
                setEditingProperty(null);
                setIsPropertyModalOpen(true);
              }}
              className="btn-primary"
              style={{
                padding: '0.55rem 1.25rem',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <Plus size={16} />
              <span>Add Property</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SUBVIEW: ROOM INVENTORY MANAGER */}
        {/* ========================================================================= */}
        {activeTab === 'rooms' ? (
          selectedProperty ? (
            <OwnerRoomManager
              property={selectedProperty}
              onRoomUpdated={handleRefresh}
              onBack={() => setActiveTab('overview')}
            />
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <p>No property selected. Create a property first.</p>
            </div>
          )
        ) : activeTab === 'reservations' ? (
          /* ========================================================================= */
          /* SUBVIEW: RESERVATION REQUESTS MANAGER */
          /* ========================================================================= */
          <OwnerReservationManager
            propertyId={ownerProperties.length === 1 ? ownerProperties[0].id : undefined}
            propertyName={ownerProperties.length === 1 ? ownerProperties[0].name : undefined}
            onReservationUpdated={handleRefresh}
            onBack={() => setActiveTab('overview')}
          />
        ) : (
          /* ========================================================================= */
          /* SUBVIEW: DASHBOARD OVERVIEW & PROPERTIES LIST */
          /* ========================================================================= */
          <div>
            {/* 4 Summary Cards (Section 6) */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '1.25rem',
                marginBottom: '2.5rem',
              }}
            >
              {/* Card 1: ACTIVE PROPERTIES */}
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.5rem',
                  boxShadow: 'var(--shadow-sm)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  ACTIVE PROPERTIES
                </div>
                <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0f172a', margin: '0.4rem 0 0.2rem' }}>
                  {metrics.activeProperties}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#059669', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600 }}>
                  <CheckCircle2 size={14} />
                  <span>Public in discovery catalog</span>
                </div>
              </div>

              {/* Card 2: TOTAL ROOMS */}
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.5rem',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  TOTAL ROOMS
                </div>
                <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0f172a', margin: '0.4rem 0 0.2rem' }}>
                  {metrics.totalRooms}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Across all managed floors
                </div>
              </div>

              {/* Card 3: AVAILABLE ROOMS */}
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.5rem',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  AVAILABLE ROOMS
                </div>
                <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#059669', margin: '0.4rem 0 0.2rem' }}>
                  {metrics.availableRooms}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#059669', fontWeight: 600 }}>
                  Instant move-in ready
                </div>
              </div>

              {/* Card 4: RESERVATION REQUESTS */}
              <div
                onClick={() => setActiveTab('reservations')}
                style={{
                  background: '#ffffff',
                  border: '1.5px solid #fde68a',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.5rem',
                  boxShadow: 'var(--shadow-sm)',
                  cursor: 'pointer',
                  transition: 'transform 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
              >
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  RESERVATION REQUESTS
                </div>
                <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#d97706', margin: '0.4rem 0 0.2rem' }}>
                  {metrics.pendingReservations}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#b45309', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <span>Review pending requests</span>
                  <ChevronRight size={14} />
                </div>
              </div>
            </div>

            {/* Main Content Grid: Property Inventory + Listing Quality */}
            <div style={{ display: 'grid', gridTemplateColumns: '2.2fr 1fr', gap: '2rem' }} className="owner-main-grid">
              {/* Left Column: Properties List (Section 8) */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    MY PROPERTIES
                  </h2>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    Only properties you own are shown
                  </span>
                </div>

                {ownerProperties.length === 0 ? (
                  /* Section 57: Empty State */
                  <div
                    style={{
                      background: '#ffffff',
                      border: '2px dashed var(--border-medium)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '3.5rem 2rem',
                      textAlign: 'center',
                    }}
                  >
                    <Building size={48} color="var(--c-sky-blue)" style={{ margin: '0 auto 1.25rem' }} />
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
                      Your property journey starts here.
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
                      List your PG, room, or hostel to start receiving reservation inquiries from students and relocation professionals.
                    </p>
                    <button
                      onClick={() => setIsPropertyModalOpen(true)}
                      className="btn-primary"
                      style={{ padding: '0.75rem 1.75rem', fontSize: '0.95rem' }}
                    >
                      <Plus size={16} style={{ marginRight: '0.4rem' }} />
                      Add Property
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {ownerProperties.map((prop) => {
                      const availableCount = prop.rooms.filter((r) => r.status === 'AVAILABLE').length;
                      const completeness = prop.listingCompletenessScore || 80;

                      return (
                        <div
                          key={prop.id}
                          style={{
                            background: '#ffffff',
                            border: '1px solid var(--border-medium)',
                            borderRadius: 'var(--radius-lg)',
                            padding: '1.5rem',
                            boxShadow: 'var(--shadow-sm)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1.25rem',
                            transition: 'border-color 0.2s ease',
                          }}
                        >
                          {/* Property Header */}
                          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                                  {prop.name}
                                </h3>
                                <span
                                  style={{
                                    fontSize: '0.7rem',
                                    fontWeight: 800,
                                    padding: '0.15rem 0.5rem',
                                    borderRadius: 'var(--radius-full)',
                                    background: prop.status === 'ACTIVE' ? '#ecfdf5' : '#fffbeb',
                                    color: prop.status === 'ACTIVE' ? '#065f46' : '#92400e',
                                    border: `1px solid ${prop.status === 'ACTIVE' ? '#a7f3d0' : '#fde68a'}`,
                                  }}
                                >
                                  {prop.status || 'ACTIVE'}
                                </span>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#64748b', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                                <MapPin size={13} />
                                <span>{prop.town}, {prop.district}</span>
                                <span>•</span>
                                <span>Starting ₹{prop.startingRent.toLocaleString('en-IN')}/mo</span>
                              </div>
                            </div>

                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                                {prop.rooms.length} rooms
                              </div>
                              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: availableCount > 0 ? '#059669' : '#dc2626' }}>
                                {availableCount} available
                              </div>
                            </div>
                          </div>

                          {/* Completeness Bar */}
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#64748b', marginBottom: '0.3rem' }}>
                              <span>Listing Completeness</span>
                              <strong style={{ color: completeness >= 70 ? '#059669' : '#d97706' }}>
                                {completeness}% complete
                              </strong>
                            </div>
                            <div style={{ width: '100%', height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                              <div
                                style={{
                                  width: `${completeness}%`,
                                  height: '100%',
                                  background: completeness >= 70 ? '#10b981' : '#f59e0b',
                                }}
                              />
                            </div>
                          </div>

                          {/* Actions Row (Section 8 & 42) */}
                          <div
                            style={{
                              display: 'flex',
                              flexWrap: 'wrap',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              borderTop: '1px solid #f1f5f9',
                              paddingTop: '1rem',
                              gap: '0.75rem',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <button
                                onClick={() => {
                                  setSelectedPropertyId(prop.id);
                                  setActiveTab('rooms');
                                }}
                                className="btn-primary"
                                style={{ padding: '0.45rem 1rem', fontSize: '0.82rem' }}
                              >
                                Manage Rooms ({prop.rooms.length})
                              </button>

                              <button
                                onClick={() => {
                                  setSelectedPropertyId(prop.id);
                                  setActiveTab('reservations');
                                }}
                                className="neomorph-btn"
                                style={{
                                  padding: '0.45rem 0.95rem',
                                  fontSize: '0.82rem',
                                  fontWeight: 700,
                                  color: '#0f172a',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.35rem',
                                }}
                              >
                                <Receipt size={14} color="#d97706" />
                                <span>Reservations</span>
                              </button>

                              <button
                                onClick={() => onExploreProperty(prop.id)}
                                className="neomorph-btn"
                                style={{
                                  padding: '0.45rem 0.85rem',
                                  fontSize: '0.82rem',
                                  fontWeight: 700,
                                  color: '#0284c7',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.35rem',
                                }}
                                title="View public listing as seen by renters"
                              >
                                <Eye size={14} />
                                <span>Preview</span>
                              </button>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              {prop.status === 'DRAFT' && (
                                <button
                                  onClick={() => handlePublishProperty(prop.id)}
                                  style={{
                                    padding: '0.45rem 0.85rem',
                                    background: '#ecfdf5',
                                    border: '1px solid #a7f3d0',
                                    borderRadius: 'var(--radius-sm)',
                                    color: '#065f46',
                                    fontWeight: 700,
                                    fontSize: '0.82rem',
                                    cursor: 'pointer',
                                  }}
                                >
                                  Publish Now
                                </button>
                              )}

                              <button
                                onClick={() => {
                                  setEditingProperty(prop);
                                  setIsPropertyModalOpen(true);
                                }}
                                style={{
                                  padding: '0.45rem 0.75rem',
                                  background: '#f8fafc',
                                  border: '1px solid #e2e8f0',
                                  borderRadius: 'var(--radius-sm)',
                                  color: '#475569',
                                  fontWeight: 700,
                                  fontSize: '0.82rem',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.25rem',
                                }}
                              >
                                <Edit2 size={13} />
                                <span>Edit</span>
                              </button>

                              <button
                                onClick={() => handleArchiveProperty(prop.id, prop.name)}
                                style={{
                                  padding: '0.45rem 0.65rem',
                                  background: '#ffffff',
                                  border: '1px solid #fecaca',
                                  borderRadius: 'var(--radius-sm)',
                                  color: '#dc2626',
                                  cursor: 'pointer',
                                }}
                                title="Archive Property"
                              >
                                <Archive size={13} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Right Column: Listing Quality & Tips (Section 39) */}
              <div>
                <div
                  style={{
                    background: '#ffffff',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '1.5rem',
                    boxShadow: 'var(--shadow-sm)',
                    position: 'sticky',
                    top: '100px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <Sparkles size={18} color="var(--c-sky-blue)" />
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      LISTING QUALITY CHECKLIST
                    </h3>
                  </div>

                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                    High completeness listings rank accurately in the Inveni AI matching engine and receive 3x more reservation requests.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#059669' }}>
                      <CheckCircle2 size={16} />
                      <span style={{ fontWeight: 600 }}>Property name & type</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#059669' }}>
                      <CheckCircle2 size={16} />
                      <span style={{ fontWeight: 600 }}>Location & address</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#059669' }}>
                      <CheckCircle2 size={16} />
                      <span style={{ fontWeight: 600 }}>Room inventory & pricing</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#059669' }}>
                      <CheckCircle2 size={16} />
                      <span style={{ fontWeight: 600 }}>Availability freshness status</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#d97706' }}>
                      <AlertTriangle size={16} />
                      <span style={{ fontWeight: 600 }}>Upload more room category photos</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#d97706' }}>
                      <AlertTriangle size={16} />
                      <span style={{ fontWeight: 600 }}>Update daily mess menu</span>
                    </div>
                  </div>

                  <div
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.85rem',
                      marginTop: '1.5rem',
                      fontSize: '0.78rem',
                      color: '#475569',
                      lineHeight: 1.5,
                    }}
                  >
                    <strong>Note:</strong> Verification status is governed by our physical on-site audit team. No unverified trust claims are published.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Property Creation / Edit Modal */}
      <OwnerPropertyModal
        isOpen={isPropertyModalOpen}
        onClose={() => {
          setIsPropertyModalOpen(false);
          setEditingProperty(null);
        }}
        onPropertySaved={() => {
          handleRefresh();
        }}
        initialProperty={editingProperty}
      />

      {/* Owner Profile Modal */}
      <OwnerProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentUser={currentUser}
      />

      <style>{`
        @media (max-width: 900px) {
          .owner-main-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};
