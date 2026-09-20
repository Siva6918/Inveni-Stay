import React, { useState } from 'react';
import { PropertyListing, CreatePropertyInput, PropertyMedia } from '../../types';
import { propertyService } from '../../services/propertyService';
import { authService } from '../../services/authService';
import {
  X,
  Building,
  MapPin,
  Sparkles,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  IndianRupee,
  Shield,
  HelpCircle,
} from 'lucide-react';

interface OwnerPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPropertySaved: (property: PropertyListing) => void;
  initialProperty?: PropertyListing | null;
}

export const OwnerPropertyModal: React.FC<OwnerPropertyModalProps> = ({
  isOpen,
  onClose,
  onPropertySaved,
  initialProperty,
}) => {
  const isEditing = Boolean(initialProperty);

  const [formData, setFormData] = useState<CreatePropertyInput>({
    name: initialProperty?.name || '',
    propertyType: initialProperty?.propertyType || 'PG',
    gender: initialProperty?.gender || 'Boys',
    town: initialProperty?.town || 'Panyam',
    district: initialProperty?.district || 'Nandyal',
    state: initialProperty?.state || 'Andhra Pradesh',
    address: initialProperty?.address || '',
    overview: initialProperty?.overview || '',
    amenities: initialProperty?.facilities.map((f) => f.name) || ['150 Mbps Wi-Fi', 'Homestyle Mess', 'Attached Bath'],
    hasFood: initialProperty?.facilities.some((f) => f.category === 'food') ?? true,
    hasWifi: initialProperty?.facilities.some((f) => f.category === 'connectivity') ?? true,
    hasAc: initialProperty?.facilities.some((f) => f.name.toLowerCase().includes('ac')) ?? false,
    hasParking: initialProperty?.facilities.some((f) => f.name.toLowerCase().includes('parking')) ?? true,
    startingRent: initialProperty?.startingRent || 5500,
    securityDeposit: initialProperty?.securityDeposit || 2000,
    images: initialProperty?.images || ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80'],
    media: initialProperty?.media || [],
  });

  const [mediaTag, setMediaTag] = useState<'exterior' | 'room' | 'bathroom' | 'mess' | 'corridor' | 'study'>('exterior');
  const [mediaUrlInput, setMediaUrlInput] = useState<string>('');
  const [mediaCaptionInput, setMediaCaptionInput] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Calculate completeness live
  const previewListing: PropertyListing = {
    id: initialProperty?.id || 'preview_id',
    name: formData.name,
    propertyType: formData.propertyType,
    gender: formData.gender,
    town: formData.town,
    district: formData.district,
    state: formData.state || 'Andhra Pradesh',
    address: formData.address,
    distanceToCollege: '750m (9 min walk)',
    distanceMeters: 750,
    startingRent: formData.startingRent,
    securityDeposit: formData.securityDeposit,
    verifiedStatus: false,
    verificationBadge: 'Pending Verification',
    ownerName: 'Authenticated Owner',
    ownerSinceYear: 2026,
    ownerContactMasked: '+91 ••••• •••••',
    ownerResponseTime: 'Typically responds within 1 hour',
    totalRooms: initialProperty?.rooms.length || 0,
    availableRoomsCount: initialProperty?.availableRoomsCount || 0,
    facilities: [],
    rooms: initialProperty?.rooms || [],
    images: formData.images && formData.images.length > 0 ? formData.images : ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80'],
    heroImage: formData.images?.[0] || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80',
    overview: formData.overview,
    coordinates: { lat: 15.5185, lng: 78.3492 },
    rating: 4.8,
    reviewsCount: 1,
  };

  const completeness = propertyService.calculateListingCompleteness(previewListing);

  const handleAddMedia = () => {
    if (!mediaUrlInput.trim()) return;
    const newMedia: PropertyMedia = {
      id: `media_${Date.now()}`,
      propertyId: initialProperty?.id || 'temp',
      type: 'image',
      url: mediaUrlInput.trim(),
      title: mediaCaptionInput.trim() || `${mediaTag.toUpperCase()} view`,
      description: `${mediaTag} space for residents`,
      tag: mediaTag,
      order: (formData.media?.length || 0) + 1,
    };

    setFormData({
      ...formData,
      media: [...(formData.media || []), newMedia],
      images: Array.from(new Set([...(formData.images || []), mediaUrlInput.trim()])),
    });
    setMediaUrlInput('');
    setMediaCaptionInput('');
  };

  const handleRemoveMedia = (mediaId: string) => {
    setFormData({
      ...formData,
      media: (formData.media || []).filter((m) => m.id !== mediaId),
    });
  };

  const handleSubmit = (action: 'DRAFT' | 'ACTIVE') => {
    setValidationError(null);

    if (!formData.name.trim() || formData.name.trim().length < 3) {
      setValidationError('Please provide a property name (at least 3 characters).');
      return;
    }
    if (!formData.address.trim() || formData.address.trim().length < 6) {
      setValidationError('Please provide a specific street address and locality.');
      return;
    }
    if (formData.startingRent <= 0) {
      setValidationError('Monthly rent must be positive.');
      return;
    }

    const ownerId = authService.getCurrentOwnerId();

    if (isEditing && initialProperty) {
      const res = propertyService.updateProperty(ownerId, initialProperty.id, {
        ...formData,
        status: action,
      });
      if (res.success && res.property) {
        onPropertySaved(res.property);
        onClose();
      } else {
        setValidationError(res.error || 'Failed to update property.');
      }
    } else {
      const newProp = propertyService.createOwnerProperty(ownerId, formData, action);
      onPropertySaved(newProp);
      onClose();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 3500,
        padding: '1rem',
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: 'var(--radius-xl)',
          maxWidth: '780px',
          width: '100%',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.25)',
          border: '1px solid var(--border-medium)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.75rem',
            borderBottom: '1px solid var(--border-medium)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--surface-1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(14, 165, 233, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Building size={20} color="var(--c-sky-blue)" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {isEditing ? `Edit ${initialProperty?.name}` : 'List New Property'}
              </h2>
              <p style={{ margin: '0.15rem 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Directly synchronized with the Inveni Stay relocation engine
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748b',
              cursor: 'pointer',
              padding: '0.25rem',
            }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Completeness Bar (Section 17 & 39) */}
        <div style={{ padding: '0.85rem 1.75rem', background: '#f8fafc', borderBottom: '1px solid var(--border-medium)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Listing Completeness
            </span>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: completeness.score >= 70 ? '#059669' : '#d97706' }}>
              {completeness.score}% complete
            </span>
          </div>
          <div style={{ width: '100%', height: '7px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${completeness.score}%`,
                height: '100%',
                background: completeness.score >= 70 ? 'linear-gradient(90deg, #10b981, #059669)' : 'linear-gradient(90deg, #f59e0b, #d97706)',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
          {completeness.missing.length > 0 && (
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.35rem' }}>
              Missing: {completeness.missing.slice(0, 2).join(' • ')}
            </div>
          )}
        </div>

        {/* Scrollable Form Body */}
        <div style={{ padding: '1.5rem 1.75rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Validation alert */}
          {validationError && (
            <div
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#991b1b',
                borderRadius: 'var(--radius-sm)',
                padding: '0.75rem 1rem',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <AlertCircle size={16} />
              <span>{validationError}</span>
            </div>
          )}

          {/* Section 1: Property Basics */}
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.4rem' }}>
              1. PROPERTY BASICS
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.3rem' }}>
                  PROPERTY NAME *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sri Sai Luxury PG & Residency"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.3rem' }}>
                  PROPERTY TYPE
                </label>
                <select
                  value={formData.propertyType}
                  onChange={(e) => setFormData({ ...formData, propertyType: e.target.value as any })}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem' }}
                >
                  <option value="PG">PG (Paying Guest)</option>
                  <option value="Room">Private Room / Stay</option>
                  <option value="Hostel">Hostel</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.3rem' }}>
                  RESIDENT GENDER
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem' }}
                >
                  <option value="Boys">Boys Only</option>
                  <option value="Girls">Girls Only</option>
                  <option value="Co-ed">Co-ed (All)</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.3rem' }}>
                OVERVIEW & HOUSE RULES
              </label>
              <textarea
                rows={3}
                placeholder="Describe your property, distance to nearby colleges/hubs, gate timing rules, and key amenities..."
                value={formData.overview}
                onChange={(e) => setFormData({ ...formData, overview: e.target.value })}
                style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem' }}
              />
            </div>
          </div>

          {/* Section 2: Location */}
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.4rem' }}>
              2. LOCATION & ADDRESS
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.3rem' }}>
                  CITY / TOWN *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Panyam, Nandyal, Kurnool"
                  value={formData.town}
                  onChange={(e) => setFormData({ ...formData, town: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.3rem' }}>
                  DISTRICT / REGION
                </label>
                <input
                  type="text"
                  placeholder="e.g. Nandyal, Kurnool"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.3rem' }}>
                STREET ADDRESS & LANDMARK *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Opp. Old Bus Stand Road, Near Govt. Polytechnic College, Panyam"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem' }}
              />
            </div>
          </div>

          {/* Section 3: Features & Amenities */}
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.4rem' }}>
              3. PROPERTY FEATURES & MESS
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem', background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#0f172a', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.hasWifi}
                  onChange={(e) => setFormData({ ...formData, hasWifi: e.target.checked })}
                />
                <span>High-Speed Wi-Fi</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#0f172a', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.hasFood}
                  onChange={(e) => setFormData({ ...formData, hasFood: e.target.checked })}
                />
                <span>Homestyle Mess Food</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#0f172a', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.hasParking}
                  onChange={(e) => setFormData({ ...formData, hasParking: e.target.checked })}
                />
                <span>Two-Wheeler Parking</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#0f172a', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.hasAc}
                  onChange={(e) => setFormData({ ...formData, hasAc: e.target.checked })}
                />
                <span>Air Conditioning (AC)</span>
              </label>
            </div>
          </div>

          {/* Section 4: Pricing */}
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.4rem' }}>
              4. PRICING GUIDELINE
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.3rem' }}>
                  STARTING MONTHLY RENT (₹) *
                </label>
                <input
                  type="number"
                  min={1000}
                  step={100}
                  value={formData.startingRent}
                  onChange={(e) => setFormData({ ...formData, startingRent: Number(e.target.value) })}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.3rem' }}>
                  SECURITY DEPOSIT (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  step={100}
                  value={formData.securityDeposit}
                  onChange={(e) => setFormData({ ...formData, securityDeposit: Number(e.target.value) })}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem' }}
                />
              </div>
            </div>
          </div>

          {/* Section 5: Structured Media (Section 12 & 13) */}
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.4rem' }}>
              5. PROPERTY MEDIA & CATEGORIES
            </div>

            {/* Media input row */}
            <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr 1fr auto', gap: '0.6rem', alignItems: 'end', marginBottom: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '0.2rem' }}>
                  CATEGORY
                </label>
                <select
                  value={mediaTag}
                  onChange={(e) => setMediaTag(e.target.value as any)}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                >
                  <option value="exterior">Exterior</option>
                  <option value="room">Room</option>
                  <option value="bathroom">Bathroom</option>
                  <option value="mess">Mess/Dining</option>
                  <option value="corridor">Corridor</option>
                  <option value="study">Study Area</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '0.2rem' }}>
                  IMAGE URL OR PATH
                </label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/... or image URL"
                  value={mediaUrlInput}
                  onChange={(e) => setMediaUrlInput(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '0.2rem' }}>
                  CAPTION / TITLE
                </label>
                <input
                  type="text"
                  placeholder="e.g. Front Entrance"
                  value={mediaCaptionInput}
                  onChange={(e) => setMediaCaptionInput(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                />
              </div>

              <button
                type="button"
                onClick={handleAddMedia}
                style={{
                  padding: '0.55rem 1rem',
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  color: '#0284c7',
                  cursor: 'pointer',
                }}
              >
                Add Media
              </button>
            </div>

            {/* Media list */}
            {formData.media && formData.media.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {formData.media.map((m) => (
                  <div
                    key={m.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      background: '#f1f5f9',
                      padding: '0.3rem 0.6rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.78rem',
                    }}
                  >
                    <span style={{ fontWeight: 700, color: '#0369a1', textTransform: 'uppercase' }}>[{m.tag}]</span>
                    <span>{m.title}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveMedia(m.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: '1.25rem 1.75rem',
            borderTop: '1px solid var(--border-medium)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'var(--surface-1)',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '0.65rem 1.25rem',
              background: '#f1f5f9',
              border: '1px solid #cbd5e1',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 700,
              fontSize: '0.85rem',
              color: '#475569',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={() => handleSubmit('DRAFT')}
              style={{
                padding: '0.65rem 1.25rem',
                background: '#ffffff',
                border: '1.5px solid var(--border-medium)',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 700,
                fontSize: '0.85rem',
                color: '#0f172a',
                cursor: 'pointer',
              }}
            >
              Save Draft
            </button>

            <button
              type="button"
              onClick={() => handleSubmit('ACTIVE')}
              className="btn-primary"
              style={{
                padding: '0.65rem 1.5rem',
                fontSize: '0.88rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <CheckCircle2 size={16} />
              <span>{isEditing ? 'Save & Update' : 'Publish Property'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
