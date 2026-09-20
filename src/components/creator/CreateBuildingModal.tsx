import React, { useState } from 'react';
import { PropertyListing, RoomUnit, Facility, RoomStatus } from '../../types';
import {
  X,
  Building2,
  MapPin,
  Plus,
  Trash2,
  CheckCircle2,
  Compass,
  Layers,
  Sparkles,
  ShieldCheck,
  Bed,
  DollarSign,
  Utensils,
  Wifi,
  Navigation,
} from 'lucide-react';

interface CreateBuildingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBuildingCreated: (property: PropertyListing) => void;
}

export const CreateBuildingModal: React.FC<CreateBuildingModalProps> = ({
  isOpen,
  onClose,
  onBuildingCreated,
}) => {
  if (!isOpen) return null;

  const [step, setStep] = useState<1 | 2>(1);

  // Building State
  const [name, setName] = useState('');
  const [propertyType, setPropertyType] = useState<'PG' | 'Room' | 'Hostel'>('PG');
  const [gender, setGender] = useState<'Co-ed' | 'Boys' | 'Girls'>('Co-ed');
  const [town, setTown] = useState('');
  const [countryOrState, setCountryOrState] = useState('India');
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState<number>(15.5185);
  const [lng, setLng] = useState<number>(78.3492);
  const [overview, setOverview] = useState('');
  const [hasWifi, setHasWifi] = useState(true);
  const [hasFood, setHasFood] = useState(true);
  const [hasAC, setHasAC] = useState(false);
  const [hasPowerBackup, setHasPowerBackup] = useState(true);

  // Custom Rooms State
  const [rooms, setRooms] = useState<RoomUnit[]>([
    {
      roomNo: '101',
      floor: 1,
      type: 'Single',
      rent: 5500,
      deposit: 2000,
      status: 'AVAILABLE',
      attachedBath: true,
      hasBalcony: false,
      dimensions: '12ft x 10ft',
      lastUpdatedMinutesAgo: 2,
      furnishings: ['Bed & Mattress', 'Study Desk', 'Ergonomic Chair', 'Steel Wardrobe'],
      windowOrientation: 'North-facing (Morning sunlight)',
    },
    {
      roomNo: '102',
      floor: 1,
      type: 'Double',
      rent: 4200,
      deposit: 1500,
      status: 'AVAILABLE',
      attachedBath: true,
      hasBalcony: true,
      dimensions: '16ft x 12ft',
      lastUpdatedMinutesAgo: 5,
      furnishings: ['2 Twin Beds', '2 Study Desks', 'Dual Wardrobe'],
      windowOrientation: 'East-facing',
    },
  ]);

  // Form Validation State
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateStep1 = () => {
    const errs: { [key: string]: string } = {};
    if (!name.trim()) errs.name = 'Building or property name is required';
    if (!town.trim()) errs.town = 'City, town, or global destination is required';
    if (!address.trim()) errs.address = 'Street address or location is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAddRoom = () => {
    const nextRoomNo = (100 + rooms.length + 1).toString();
    const newRoom: RoomUnit = {
      roomNo: nextRoomNo,
      floor: 1,
      type: 'Single',
      rent: 5000,
      deposit: 2000,
      status: 'AVAILABLE',
      attachedBath: true,
      hasBalcony: false,
      dimensions: '12ft x 10ft',
      lastUpdatedMinutesAgo: 1,
      furnishings: ['Bed & Mattress', 'Study Table', 'Wardrobe'],
      windowOrientation: 'Cross-ventilated',
    };
    setRooms([...rooms, newRoom]);
  };

  const handleRemoveRoom = (index: number) => {
    if (rooms.length <= 1) return;
    setRooms(rooms.filter((_, i) => i !== index));
  };

  const handleUpdateRoom = (index: number, field: keyof RoomUnit, value: any) => {
    const updated = [...rooms];
    updated[index] = { ...updated[index], [field]: value };
    setRooms(updated);
  };

  const handleAutoGeocode = () => {
    // Generate approximate mock coordinates based on town query if not provided
    const query = town.toLowerCase();
    if (query.includes('panyam')) {
      setLat(15.5185);
      setLng(78.3492);
    } else if (query.includes('hyderabad')) {
      setLat(17.385);
      setLng(78.4867);
    } else if (query.includes('bengaluru') || query.includes('bangalore')) {
      setLat(12.9716);
      setLng(77.5946);
    } else if (query.includes('london')) {
      setLat(51.5074);
      setLng(-0.1278);
    } else if (query.includes('new york')) {
      setLat(40.7128);
      setLng(-74.006);
    } else if (query.includes('tokyo')) {
      setLat(35.6762);
      setLng(139.6503);
    } else {
      setLat(15.5 + Math.random() * 2);
      setLng(78.3 + Math.random() * 2);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep1()) {
      setStep(1);
      return;
    }

    const minRent = rooms.reduce((min, r) => Math.min(min, r.rent), rooms[0]?.rent || 5000);
    const availableCount = rooms.filter((r) => r.status === 'AVAILABLE').length;

    const facilities: Facility[] = [
      {
        id: 'f_wifi',
        name: '150 Mbps High-Speed Wi-Fi',
        category: 'connectivity',
        description: 'Multi-band Wi-Fi routers on each floor with 99.9% uptime SLA.',
        included: hasWifi,
        highlight: '150 Mbps Fiber',
      },
      {
        id: 'f_food',
        name: '3-Time Nutritious Mess Meals',
        category: 'food',
        description: 'Clean dining hall serving breakfast, lunch, and dinner.',
        included: hasFood,
        highlight: 'Homestyle Meals',
      },
      {
        id: 'f_power',
        name: '24x7 Power Backup (Inverter/DG)',
        category: 'utility',
        description: 'Uninterrupted power support for fans, study lamps, Wi-Fi, and laptops.',
        included: hasPowerBackup,
      },
      {
        id: 'f_ac',
        name: 'Air Conditioning Units',
        category: 'utility',
        description: 'Split inverter AC cooling.',
        included: hasAC,
      },
    ];

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '_') + '_' + Date.now().toString().slice(-4);

    const newBuilding: PropertyListing = {
      id: slug,
      name: name.trim(),
      propertyType,
      gender,
      town: town.trim(),
      district: town.trim(),
      state: countryOrState.trim(),
      address: address.trim(),
      distanceToCollege: '500m (6 min walk)',
      distanceMeters: 500,
      startingRent: minRent,
      securityDeposit: rooms[0]?.deposit || 2000,
      verifiedStatus: true,
      verificationBadge: 'Verified Custom Creation • ID #' + slug.toUpperCase().slice(0, 10),
      ownerName: 'Independent Property Host',
      ownerSinceYear: 2026,
      ownerContactMasked: '+91 98480 •••••',
      ownerResponseTime: 'Typically responds within 10 minutes',
      totalRooms: rooms.length,
      availableRoomsCount: availableCount,
      facilities,
      rooms,
      heroImage: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80',
      images: [
        'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80',
      ],
      coordinates: { lat, lng },
      streetViewUrl: `https://maps.google.com/maps?q=${lat},${lng}&t=k&z=19&output=embed`,
      overview:
        overview.trim() ||
        `${name} offers premium student and professional living in ${town}. Features remote-inspected rooms, modern amenities, and live street-level map access.`,
      rating: 4.9,
      reviewsCount: 1,
      featured: true,
      isCustomCreated: true,
    };

    onBuildingCreated(newBuilding);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 5000,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
      }}
    >
      <div
        className="neomorph-card"
        style={{
          width: '100%',
          maxWidth: '780px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          background: '#ffffff',
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.25)',
          border: '1px solid rgba(14, 165, 233, 0.3)',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '1.25rem 1.75rem',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, #f8fafc 0%, #edf2f7 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-sm)',
                background: 'linear-gradient(135deg, var(--c-sky-blue) 0%, var(--c-pink) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
              }}
            >
              <Building2 size={20} />
            </div>
            <div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                Add Any Building & Create Rooms
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Make any location in the world discoverable with live Street View and room inventory
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#475569',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Stepper Tabs */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid #e2e8f0',
            background: '#ffffff',
          }}
        >
          <button
            type="button"
            onClick={() => setStep(1)}
            style={{
              flex: 1,
              padding: '0.85rem 1rem',
              border: 'none',
              borderBottom: step === 1 ? '2px solid var(--c-sky-blue)' : '2px solid transparent',
              background: 'transparent',
              fontWeight: step === 1 ? 800 : 600,
              color: step === 1 ? 'var(--c-sky-blue)' : '#64748b',
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
            }}
          >
            <span>01</span>
            <span>Building & Global Map Location</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (validateStep1()) setStep(2);
            }}
            style={{
              flex: 1,
              padding: '0.85rem 1rem',
              border: 'none',
              borderBottom: step === 2 ? '2px solid var(--c-sky-blue)' : '2px solid transparent',
              background: 'transparent',
              fontWeight: step === 2 ? 800 : 600,
              color: step === 2 ? 'var(--c-sky-blue)' : '#64748b',
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
            }}
          >
            <span>02</span>
            <span>Create Rooms ({rooms.length})</span>
          </button>
        </div>

        {/* Modal Body Scroll Area */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.75rem' }}>
            {step === 1 ? (
              /* STEP 1: Building Details */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: '#334155', marginBottom: '0.35rem' }}>
                    Building Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Sri Sai Residency, Kensington Heights, Shibuya Living Pods..."
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      border: errors.name ? '1.5px solid #ef4444' : '1px solid #cbd5e1',
                      fontSize: '0.9rem',
                      outline: 'none',
                    }}
                  />
                  {errors.name && <div style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem' }}>{errors.name}</div>}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: '#334155', marginBottom: '0.35rem' }}>
                      City / Global Destination *
                    </label>
                    <input
                      type="text"
                      value={town}
                      onChange={(e) => setTown(e.target.value)}
                      onBlur={handleAutoGeocode}
                      placeholder="e.g. Panyam, Hyderabad, London, Tokyo..."
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        border: errors.town ? '1.5px solid #ef4444' : '1px solid #cbd5e1',
                        fontSize: '0.9rem',
                        outline: 'none',
                      }}
                    />
                    {errors.town && <div style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem' }}>{errors.town}</div>}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: '#334155', marginBottom: '0.35rem' }}>
                      State / Country
                    </label>
                    <input
                      type="text"
                      value={countryOrState}
                      onChange={(e) => setCountryOrState(e.target.value)}
                      placeholder="e.g. Andhra Pradesh, UK, Japan..."
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.9rem',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: '#334155', marginBottom: '0.35rem' }}>
                    Detailed Address / Landmarks *
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Opp. Bus Stand Road, Near Metro Station..."
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      border: errors.address ? '1.5px solid #ef4444' : '1px solid #cbd5e1',
                      fontSize: '0.9rem',
                      outline: 'none',
                    }}
                  />
                  {errors.address && <div style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem' }}>{errors.address}</div>}
                </div>

                {/* Property Type & Gender */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: '#334155', marginBottom: '0.35rem' }}>
                      Property Category
                    </label>
                    <select
                      value={propertyType}
                      onChange={(e: any) => setPropertyType(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.9rem',
                        background: '#ffffff',
                      }}
                    >
                      <option value="PG">PG / Student Hostel</option>
                      <option value="Room">Private Room / Studio</option>
                      <option value="Hostel">Coliving Space / Hostel</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: '#334155', marginBottom: '0.35rem' }}>
                      Gender Accommodation
                    </label>
                    <select
                      value={gender}
                      onChange={(e: any) => setGender(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.9rem',
                        background: '#ffffff',
                      }}
                    >
                      <option value="Co-ed">Co-ed (All Welcome)</option>
                      <option value="Boys">Boys Only</option>
                      <option value="Girls">Girls Only</option>
                    </select>
                  </div>
                </div>

                {/* Map Coordinates for Live Street View */}
                <div
                  style={{
                    background: '#f8fafc',
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Navigation size={16} color="var(--c-sky-blue)" />
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>
                        Google Maps Street View Coordinates
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleAutoGeocode}
                      style={{
                        background: 'transparent',
                        border: '1px solid #cbd5e1',
                        padding: '0.25rem 0.65rem',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        color: 'var(--c-sky-blue)',
                      }}
                    >
                      Auto-Locate {town || 'City'}
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Latitude (°N)</span>
                      <input
                        type="number"
                        step="0.0001"
                        value={lat}
                        onChange={(e) => setLat(parseFloat(e.target.value) || 0)}
                        style={{
                          width: '100%',
                          padding: '0.5rem 0.75rem',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.85rem',
                        }}
                      />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Longitude (°E)</span>
                      <input
                        type="number"
                        step="0.0001"
                        value={lng}
                        onChange={(e) => setLng(parseFloat(e.target.value) || 0)}
                        style={{
                          width: '100%',
                          padding: '0.5rem 0.75rem',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.85rem',
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Amenities Toggles */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: '#334155', marginBottom: '0.5rem' }}>
                    Included Facilities
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.65rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                      <input type="checkbox" checked={hasWifi} onChange={(e) => setHasWifi(e.target.checked)} />
                      <span>150 Mbps Wi-Fi</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                      <input type="checkbox" checked={hasFood} onChange={(e) => setHasFood(e.target.checked)} />
                      <span>Mess Meals</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                      <input type="checkbox" checked={hasPowerBackup} onChange={(e) => setHasPowerBackup(e.target.checked)} />
                      <span>Power Backup</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                      <input type="checkbox" checked={hasAC} onChange={(e) => setHasAC(e.target.checked)} />
                      <span>Air Conditioning</span>
                    </label>
                  </div>
                </div>
              </div>
            ) : (
              /* STEP 2: Custom Room Creator */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                      Define Room Units & Pricing
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      Configure individual units with rent, occupancy, and initial availability
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddRoom}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      background: 'var(--c-lawn-green)',
                      color: '#070a12',
                      padding: '0.5rem 1rem',
                      borderRadius: 'var(--radius-full)',
                      border: 'none',
                      fontWeight: 800,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                    }}
                  >
                    <Plus size={15} />
                    <span>Add Another Room</span>
                  </button>
                </div>

                {/* Rooms Card List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {rooms.map((room, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: 'var(--radius-md)',
                        padding: '1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Bed size={16} color="var(--c-sky-blue)" />
                          <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>
                            Room #{room.roomNo}
                          </span>
                        </div>
                        {rooms.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveRoom(idx)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#ef4444',
                              cursor: 'pointer',
                              padding: '0.2rem',
                            }}
                            title="Delete Room"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.65rem' }}>
                        <div>
                          <label style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Room No</label>
                          <input
                            type="text"
                            value={room.roomNo}
                            onChange={(e) => handleUpdateRoom(idx, 'roomNo', e.target.value)}
                            style={{ width: '100%', padding: '0.4rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.82rem' }}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Type</label>
                          <select
                            value={room.type}
                            onChange={(e: any) => handleUpdateRoom(idx, 'type', e.target.value)}
                            style={{ width: '100%', padding: '0.4rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.82rem', background: '#fff' }}
                          >
                            <option value="Single">Single</option>
                            <option value="Double">Double</option>
                            <option value="Triple">Triple</option>
                          </select>
                        </div>

                        <div>
                          <label style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Rent (₹/mo)</label>
                          <input
                            type="number"
                            value={room.rent}
                            onChange={(e) => handleUpdateRoom(idx, 'rent', Number(e.target.value) || 0)}
                            style={{ width: '100%', padding: '0.4rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.82rem' }}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Status</label>
                          <select
                            value={room.status}
                            onChange={(e: any) => handleUpdateRoom(idx, 'status', e.target.value as RoomStatus)}
                            style={{ width: '100%', padding: '0.4rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.82rem', background: '#fff' }}
                          >
                            <option value="AVAILABLE">AVAILABLE</option>
                            <option value="RESERVED">RESERVED</option>
                            <option value="OCCUPIED">OCCUPIED</option>
                          </select>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '1rem', fontSize: '0.78rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={room.attachedBath}
                            onChange={(e) => handleUpdateRoom(idx, 'attachedBath', e.target.checked)}
                          />
                          <span>Attached Washroom</span>
                        </label>

                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={room.hasBalcony}
                            onChange={(e) => handleUpdateRoom(idx, 'hasBalcony', e.target.checked)}
                          />
                          <span>Private Balcony</span>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div
            style={{
              padding: '1.25rem 1.75rem',
              borderTop: '1px solid #e2e8f0',
              background: '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            {step === 1 ? (
              <button
                type="button"
                onClick={onClose}
                style={{
                  background: 'transparent',
                  border: '1px solid #cbd5e1',
                  padding: '0.65rem 1.25rem',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  color: '#64748b',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{
                  background: 'transparent',
                  border: '1px solid #cbd5e1',
                  padding: '0.65rem 1.25rem',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  color: '#64748b',
                  cursor: 'pointer',
                }}
              >
                ← Back to Building Info
              </button>
            )}

            {step === 1 ? (
              <button
                type="button"
                onClick={() => {
                  if (validateStep1()) setStep(2);
                }}
                style={{
                  background: 'var(--c-sky-blue)',
                  color: '#ffffff',
                  padding: '0.65rem 1.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                }}
              >
                Continue to Room Setup ({rooms.length}) →
              </button>
            ) : (
              <button
                type="submit"
                style={{
                  background: 'linear-gradient(135deg, var(--c-lawn-green) 0%, #16a34a 100%)',
                  color: '#070a12',
                  padding: '0.65rem 2rem',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(34, 197, 94, 0.4)',
                }}
              >
                ✓ Launch Building & Rooms
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
