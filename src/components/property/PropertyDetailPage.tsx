import React, { useState, useEffect } from 'react';
import { propertyService } from '../../services/propertyService';
import { PropertyListing, RoomUnit } from '../../types';
import { PropertyHero } from './PropertyHero';
import { PropertyGallery } from './PropertyGallery';
import { RemoteExplorationSection } from './RemoteExplorationSection';
import { InteractiveFloorPlan } from './InteractiveFloorPlan';
import { RoomDetailCard } from './RoomDetailCard';
import { RoomComparisonModal } from './RoomComparisonModal';
import { PropertyOverview } from './PropertyOverview';
import { MessMenuSection } from './MessMenuSection';
import { LocationNeighborhoodSection } from './LocationNeighborhoodSection';
import { OwnerTrustSection } from './OwnerTrustSection';
import { StickyReservationBar } from './StickyReservationBar';
import { ArrowLeft, CheckCircle2, AlertCircle, Home, Share2, Compass } from 'lucide-react';

interface PropertyDetailPageProps {
  propertyId: string;
  onBackToDiscovery: () => void;
  onBackToHome: () => void;
  onStartReservation?: (propertyId: string, roomNo: string) => void;
}

export const PropertyDetailPage: React.FC<PropertyDetailPageProps> = ({
  propertyId,
  onBackToDiscovery,
  onBackToHome,
  onStartReservation,
}) => {
  const [property, setProperty] = useState<PropertyListing | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedRoomNo, setSelectedRoomNo] = useState<string>('101');
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [showCompareModal, setShowCompareModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load property from repository
  useEffect(() => {
    setLoading(true);
    const found = propertyService.getPropertyById(propertyId);
    if (found) {
      setProperty(found);
      // default to first available room or first room
      const firstAvailable = found.rooms.find((r: RoomUnit) => r.status === 'AVAILABLE');
      if (firstAvailable) {
        setSelectedRoomNo(firstAvailable.roomNo);
      } else if (found.rooms.length > 0) {
        setSelectedRoomNo(found.rooms[0].roomNo);
      }
    } else {
      setProperty(null);
    }
    setLoading(false);

    // Check localStorage for saved status
    try {
      const savedList = JSON.parse(localStorage.getItem('inveni_saved_properties') || '[]');
      setIsSaved(savedList.includes(propertyId));
    } catch (e) {
      // ignore
    }
  }, [propertyId]);

  const toggleSave = () => {
    try {
      const savedList: string[] = JSON.parse(localStorage.getItem('inveni_saved_properties') || '[]');
      let updated: string[];
      if (savedList.includes(propertyId)) {
        updated = savedList.filter((id) => id !== propertyId);
        setIsSaved(false);
        showToast('Property removed from saved list');
      } else {
        updated = [...savedList, propertyId];
        setIsSaved(true);
        showToast('Property saved to favorites!');
      }
      localStorage.setItem('inveni_saved_properties', JSON.stringify(updated));
    } catch (e) {
      setIsSaved(!isSaved);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const scrollToSection = (sectionId: string) => {
    const elem = document.getElementById(sectionId);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="container" style={{ padding: '6rem 2rem', minHeight: '80vh' }}>
        <div style={{ height: '32px', width: '200px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '4px', marginBottom: '2rem' }} />
        <div style={{ height: '360px', width: '100%', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '16px', marginBottom: '2rem' }} />
        <div style={{ height: '200px', width: '100%', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '16px' }} />
      </div>
    );
  }

  // Not Found state
  if (!property) {
    return (
      <div
        className="container"
        style={{
          padding: '6rem 2rem',
          minHeight: '75vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(244, 63, 94, 0.15)',
            color: '#f43f5e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.5rem',
          }}
        >
          <AlertCircle size={32} />
        </div>
        <h2 style={{ color: 'var(--text-primary)', fontSize: '2rem', fontWeight: 800, marginBottom: '0.75rem' }}>
          Property Listing Not Found
        </h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '480px', marginBottom: '2rem', lineHeight: 1.6 }}>
          The property identifier "{propertyId}" could not be located in our demo registry. It may have been relocated
          or the link has expired.
        </p>
        <button
          onClick={onBackToDiscovery}
          style={{
            background: '#0284c7',
            color: '#ffffff',
            padding: '0.75rem 1.75rem',
            borderRadius: 'var(--radius-md)',
            fontWeight: 800,
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)',
          }}
        >
          ← Return to Available Stays
        </button>
      </div>
    );
  }

  const selectedRoomUnit =
    property.rooms.find((r) => r.roomNo === selectedRoomNo) || property.rooms[0];

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--canvas-bg)',
        paddingTop: '2rem',
        paddingBottom: '8rem', // space for sticky reservation bar
        width: '100%',
      }}
    >
      {/* Toast Alert */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '90px',
            right: '25px',
            zIndex: 4000,
            background: '#ffffff',
            color: '#0f172a',
            border: '1.5px solid #0284c7',
            padding: '0.85rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 12px 30px rgba(15, 23, 42, 0.12)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            fontWeight: 700,
            fontSize: '0.9rem',
          }}
        >
          <CheckCircle2 size={18} color="#10b981" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Full-Width Stretch Container */}
      <div className="container" style={{ width: '100%', maxWidth: '100%' }}>
        {/* Navigation Breadcrumbs & Back Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '1.5rem',
          }}
        >
          <button
            onClick={onBackToDiscovery}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#0f172a',
              fontSize: '0.88rem',
              fontWeight: 800,
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              padding: '0.55rem 1.15rem',
              borderRadius: 'var(--radius-md)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <ArrowLeft size={16} />
            <span>Back to Stays in {property.town}</span>
          </button>

          {/* Breadcrumbs */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.85rem',
              color: 'var(--text-muted)',
            }}
          >
            <span
              onClick={onBackToHome}
              style={{ cursor: 'pointer', color: 'var(--text-secondary)', fontWeight: 600 }}
            >
              Inveni Stay
            </span>
            <span>/</span>
            <span
              onClick={onBackToDiscovery}
              style={{ cursor: 'pointer', color: 'var(--text-secondary)', fontWeight: 600 }}
            >
              {property.town}
            </span>
            <span>/</span>
            <span style={{ color: '#0f172a', fontWeight: 800 }}>{property.name}</span>
          </div>
        </div>

        {/* 1. Property Hero */}
        <PropertyHero
          property={property}
          onExploreRemotely={() => scrollToSection('remote-exploration')}
          onViewRooms={() => scrollToSection('floor-plan-rooms')}
          isSaved={isSaved}
          onToggleSave={toggleSave}
        />

        {/* 2. Property Media Gallery (with Lightbox) */}
        <PropertyGallery
          media={property.media || []}
          propertyName={property.name}
        />

        {/* 3. Remote Exploration Section (Interactive intro.mp4 + Spatial Tabs) */}
        <RemoteExplorationSection
          property={property}
          onSelectRoomOnFloorPlan={(roomNo) => {
            setSelectedRoomNo(roomNo);
            scrollToSection('floor-plan-rooms');
          }}
        />

        {/* 4. Interactive Floor Plan */}
        <InteractiveFloorPlan
          property={property}
          selectedRoomNo={selectedRoomNo}
          onSelectRoom={(roomNo) => {
            setSelectedRoomNo(roomNo);
            scrollToSection('room-detail-inspection');
          }}
        />

        {/* 5. Selected Room Detail Card */}
        <div id="room-detail-inspection">
          <RoomDetailCard
            room={selectedRoomUnit}
            allRooms={property.rooms}
            media={property.media}
            onSelectForReservation={(room) => {
              setSelectedRoomNo(room.roomNo);
              if (onStartReservation && selectedRoomNo === room.roomNo) {
                onStartReservation(property.id, room.roomNo);
              } else {
                showToast(`Room ${room.roomNo} selected! Click 'Continue to Reserve' to proceed.`);
              }
            }}
            onOpenCompare={() => setShowCompareModal(true)}
            onOpenRoomMedia={(roomId) => {
              scrollToSection('remote-exploration');
            }}
            isSelectedForBooking={selectedRoomNo === selectedRoomUnit.roomNo}
          />
        </div>

        {/* 6. Property Overview & Amenities */}
        <PropertyOverview property={property} />

        {/* 7. Mess & Food Section */}
        <MessMenuSection
          property={property}
          onOpenMessPhoto={(title) => {
            showToast(`Viewing mess photo: ${title}`);
          }}
        />

        {/* 8. Location & Satellite Neighborhood Map */}
        <LocationNeighborhoodSection property={property} />

        {/* 9. Owner Trust & Direct Host Inquiry */}
        <OwnerTrustSection property={property} />
      </div>

      {/* Room Comparison Modal */}
      {showCompareModal && (
        <RoomComparisonModal
          rooms={property.rooms}
          activeRoomNo={selectedRoomNo}
          onSelectRoom={(room) => {
            setSelectedRoomNo(room.roomNo);
            showToast(`Selected Room ${room.roomNo}`);
          }}
          onClose={() => setShowCompareModal(false)}
        />
      )}

      {/* Sticky Bottom Reservation Action Bar */}
      <StickyReservationBar
        property={property}
        selectedRoom={selectedRoomUnit}
        onScrollToFloorPlan={() => scrollToSection('floor-plan-rooms')}
        onStartReservation={onStartReservation}
      />
    </div>
  );
};
