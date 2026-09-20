import React, { useState } from 'react';
import {
  PropertyListing,
  RoomUnit,
  RoomStatus,
  CreateRoomInput,
} from '../../types';
import { propertyService } from '../../services/propertyService';
import { authService } from '../../services/authService';
import {
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  Shield,
  Layers,
  Sparkles,
  X,
  IndianRupee,
} from 'lucide-react';

interface OwnerRoomManagerProps {
  property: PropertyListing;
  onRoomUpdated: () => void;
  onBack: () => void;
}

export const OwnerRoomManager: React.FC<OwnerRoomManagerProps> = ({
  property,
  onRoomUpdated,
  onBack,
}) => {
  const [editingRoom, setEditingRoom] = useState<RoomUnit | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isQuickPriceOpen, setIsQuickPriceOpen] = useState<{ roomNo: string; rent: number } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // New room form state
  const [formData, setFormData] = useState<CreateRoomInput>({
    roomNo: '',
    floor: 1,
    type: 'Single',
    rent: property.startingRent || 5500,
    deposit: property.securityDeposit || 2000,
    status: 'AVAILABLE',
    attachedBath: true,
    hasBalcony: false,
    furnishings: ['Bed Frame & Mattress', 'Study Desk', 'Wardrobe'],
  });

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleStatusChange = (roomNo: string, newStatus: RoomStatus) => {
    const ownerId = authService.getCurrentOwnerId();
    const result = propertyService.updateRoom(ownerId, property.id, roomNo, { status: newStatus });
    if (result.success) {
      showToast(`Room ${roomNo} status updated to ${newStatus}`);
      onRoomUpdated();
    } else {
      setErrorMessage(result.error || 'Failed to update status');
    }
  };

  const handleQuickPriceSave = (roomNo: string, newRent: number) => {
    if (newRent <= 0) {
      setErrorMessage('Price must be greater than zero');
      return;
    }
    const ownerId = authService.getCurrentOwnerId();
    const result = propertyService.updateRoom(ownerId, property.id, roomNo, { rent: newRent });
    if (result.success) {
      showToast(`Room ${roomNo} rent updated to ₹${newRent.toLocaleString('en-IN')}`);
      setIsQuickPriceOpen(null);
      onRoomUpdated();
    } else {
      setErrorMessage(result.error || 'Failed to update price');
    }
  };

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.roomNo.trim()) {
      setErrorMessage('Room number is required (e.g. 101, 204)');
      return;
    }
    if (formData.rent <= 0) {
      setErrorMessage('Monthly rent must be a positive number');
      return;
    }

    const ownerId = authService.getCurrentOwnerId();
    const result = propertyService.addRoom(ownerId, property.id, formData);
    if (result.success) {
      showToast(`Room ${formData.roomNo} successfully added to inventory!`);
      setIsAddModalOpen(false);
      setFormData({
        roomNo: '',
        floor: 1,
        type: 'Single',
        rent: property.startingRent || 5500,
        deposit: property.securityDeposit || 2000,
        status: 'AVAILABLE',
        attachedBath: true,
        hasBalcony: false,
        furnishings: ['Bed Frame & Mattress', 'Study Desk', 'Wardrobe'],
      });
      onRoomUpdated();
    } else {
      setErrorMessage(result.error || 'Failed to create room');
    }
  };

  const handleEditRoomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoom) return;

    if (editingRoom.rent <= 0) {
      setErrorMessage('Rent must be a positive number');
      return;
    }

    const ownerId = authService.getCurrentOwnerId();
    const result = propertyService.updateRoom(ownerId, property.id, editingRoom.roomNo, editingRoom);
    if (result.success) {
      showToast(`Room ${editingRoom.roomNo} updated!`);
      setEditingRoom(null);
      onRoomUpdated();
    } else {
      setErrorMessage(result.error || 'Failed to update room');
    }
  };

  const handleDeleteRoom = (roomNo: string) => {
    if (!confirm(`Are you sure you want to remove Room ${roomNo} from inventory?`)) return;
    const ownerId = authService.getCurrentOwnerId();
    const result = propertyService.deleteRoom(ownerId, property.id, roomNo);
    if (result.success) {
      showToast(`Room ${roomNo} removed from property`);
      onRoomUpdated();
    } else {
      setErrorMessage(result.error || 'Failed to delete room');
    }
  };

  const getStatusBadge = (status: RoomStatus) => {
    switch (status) {
      case 'AVAILABLE':
        return {
          bg: '#ecfdf5',
          border: '#a7f3d0',
          text: '#065f46',
          label: 'AVAILABLE',
          icon: <CheckCircle2 size={13} color="#059669" />,
        };
      case 'AVAILABLE_SOON':
        return {
          bg: '#eff6ff',
          border: '#bfdbfe',
          text: '#1e40af',
          label: 'AVAILABLE SOON',
          icon: <Clock size={13} color="#2563eb" />,
        };
      case 'OCCUPIED':
        return {
          bg: '#f8fafc',
          border: '#e2e8f0',
          text: '#475569',
          label: 'OCCUPIED',
          icon: <Shield size={13} color="#64748b" />,
        };
      case 'RESERVED':
        return {
          bg: '#fffbeb',
          border: '#fde68a',
          text: '#92400e',
          label: 'RESERVED',
          icon: <Clock size={13} color="#d97706" />,
        };
      case 'MAINTENANCE':
        return {
          bg: '#fef2f2',
          border: '#fecaca',
          text: '#991b1b',
          label: 'MAINTENANCE',
          icon: <Wrench size={13} color="#dc2626" />,
        };
    }
  };

  const formatLastUpdated = (lastUpdated?: string, minutesAgo?: number) => {
    if (lastUpdated) {
      const diffMs = Date.now() - new Date(lastUpdated).getTime();
      const mins = Math.floor(diffMs / 60000);
      if (mins < 5) return 'Just now';
      if (mins < 60) return `${mins}m ago`;
      const hrs = Math.floor(mins / 60);
      if (hrs < 24) return `${hrs}h ago`;
      const days = Math.floor(hrs / 24);
      return `${days}d ago`;
    }
    if (minutesAgo !== undefined) {
      if (minutesAgo < 5) return 'Just now';
      if (minutesAgo < 60) return `${minutesAgo}m ago`;
      return `${Math.floor(minutesAgo / 60)}h ago`;
    }
    return 'Recently';
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      {/* Toast */}
      {successToast && (
        <div
          style={{
            position: 'fixed',
            top: '80px',
            right: '20px',
            zIndex: 4000,
            background: '#ffffff',
            border: '2px solid #10b981',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem 1.25rem',
            boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            color: '#065f46',
            fontWeight: 700,
          }}
        >
          <CheckCircle2 size={18} color="#10b981" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header navigation */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={onBack}
            className="neomorph-btn"
            style={{
              padding: '0.5rem 0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontWeight: 700,
              fontSize: '0.85rem',
              color: '#0f172a',
            }}
          >
            <ArrowLeft size={16} />
            <span>Back to Dashboard</span>
          </button>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {property.name}
              </h1>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '0.15rem 0.5rem',
                  borderRadius: 'var(--radius-full)',
                  background: property.status === 'ACTIVE' ? '#ecfdf5' : '#fffbeb',
                  color: property.status === 'ACTIVE' ? '#065f46' : '#92400e',
                  border: `1px solid ${property.status === 'ACTIVE' ? '#a7f3d0' : '#fde68a'}`,
                }}
              >
                {property.status || 'ACTIVE'}
              </span>
            </div>
            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Room Inventory Matrix • {property.town}, {property.district}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="btn-primary"
          style={{
            padding: '0.65rem 1.25rem',
            fontSize: '0.88rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Plus size={16} />
          <span>Add Room</span>
        </button>
      </div>

      {/* Availability Reminder Banner (Section 23) */}
      <div
        style={{
          background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfeff 100%)',
          border: '1px solid #a7f3d0',
          borderRadius: 'var(--radius-md)',
          padding: '1rem 1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
            }}
          >
            <Sparkles size={18} color="#059669" />
          </div>
          <div>
            <div style={{ fontWeight: 800, color: '#065f46', fontSize: '0.92rem' }}>
              Keep your availability updated
            </div>
            <div style={{ fontSize: '0.8rem', color: '#047857' }}>
              Accurate room vacancy records ensure Inveni AI matching and student search discover your stay immediately.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.82rem', fontWeight: 700 }}>
          <span style={{ color: '#0f172a' }}>Total: {property.rooms.length}</span>
          <span style={{ color: '#059669' }}>
            Available: {property.rooms.filter((r) => r.status === 'AVAILABLE').length}
          </span>
          <span style={{ color: '#d97706' }}>
            Reserved: {property.rooms.filter((r) => r.status === 'RESERVED').length}
          </span>
          <span style={{ color: '#64748b' }}>
            Occupied: {property.rooms.filter((r) => r.status === 'OCCUPIED').length}
          </span>
          <span style={{ color: '#dc2626' }}>
            Maintenance: {property.rooms.filter((r) => r.status === 'MAINTENANCE').length}
          </span>
        </div>
      </div>

      {/* Error alert */}
      {errorMessage && (
        <div
          style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            borderRadius: 'var(--radius-sm)',
            padding: '0.75rem 1rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.85rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={16} />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#991b1b' }}
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* Rooms Table (Desktop) / Cards (Mobile) */}
      {property.rooms.length === 0 ? (
        <div
          style={{
            background: 'var(--surface-1)',
            border: '2px dashed var(--border-medium)',
            borderRadius: 'var(--radius-lg)',
            padding: '3rem 1.5rem',
            textAlign: 'center',
          }}
        >
          <Layers size={40} color="var(--c-sky-blue)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
            No rooms added yet
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '450px', margin: '0 auto 1.5rem' }}>
            Add rooms to make your property discoverable. Configure single, double, or triple rooms with rent and availability.
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn-primary"
            style={{ padding: '0.65rem 1.5rem', fontSize: '0.9rem' }}
          >
            <Plus size={16} style={{ marginRight: '0.4rem' }} />
            Add First Room
          </button>
        </div>
      ) : (
        <div style={{ background: '#ffffff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-medium)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
          {/* Desktop Table */}
          <div className="table-responsive" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-medium)', color: '#475569', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '0.85rem 1.25rem' }}>ROOM</th>
                  <th style={{ padding: '0.85rem 1rem' }}>TYPE</th>
                  <th style={{ padding: '0.85rem 1rem' }}>FLOOR</th>
                  <th style={{ padding: '0.85rem 1rem' }}>MONTHLY PRICE</th>
                  <th style={{ padding: '0.85rem 1rem' }}>AVAILABILITY STATUS</th>
                  <th style={{ padding: '0.85rem 1rem' }}>LAST UPDATED</th>
                  <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {property.rooms.map((room) => {
                  const badge = getStatusBadge(room.status);
                  return (
                    <tr
                      key={room.roomNo}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = '#ffffff')}
                    >
                      {/* Room number */}
                      <td style={{ padding: '1rem 1.25rem', fontWeight: 800, color: '#0f172a' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span style={{ fontSize: '1rem' }}>{room.roomNo}</span>
                          {room.attachedBath && (
                            <span
                              style={{
                                fontSize: '0.65rem',
                                padding: '0.1rem 0.35rem',
                                background: '#f0fdf4',
                                color: '#166534',
                                borderRadius: '4px',
                                border: '1px solid #bbf7d0',
                              }}
                              title="Attached Western Bathroom"
                            >
                              Bath
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Room Type */}
                      <td style={{ padding: '1rem 1rem', color: '#334155' }}>
                        <span style={{ fontWeight: 600 }}>{room.type}</span>
                      </td>

                      {/* Floor */}
                      <td style={{ padding: '1rem 1rem', color: '#64748b' }}>
                        Floor {room.floor}
                      </td>

                      {/* Monthly Price (with quick edit) */}
                      <td style={{ padding: '1rem 1rem' }}>
                        {isQuickPriceOpen?.roomNo === room.roomNo ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <input
                              type="number"
                              defaultValue={room.rent}
                              id={`quick_price_${room.roomNo}`}
                              style={{
                                width: '90px',
                                padding: '0.3rem 0.5rem',
                                border: '1.5px solid var(--c-sky-blue)',
                                borderRadius: '4px',
                                fontSize: '0.85rem',
                                fontWeight: 700,
                              }}
                              autoFocus
                            />
                            <button
                              onClick={() => {
                                const input = document.getElementById(
                                  `quick_price_${room.roomNo}`
                                ) as HTMLInputElement;
                                if (input) handleQuickPriceSave(room.roomNo, Number(input.value));
                              }}
                              className="btn-primary"
                              style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setIsQuickPriceOpen(null)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <div
                            onClick={() => setIsQuickPriceOpen({ roomNo: room.roomNo, rent: room.rent })}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              fontWeight: 800,
                              color: '#0f172a',
                              cursor: 'pointer',
                              padding: '0.2rem 0.4rem',
                              borderRadius: '4px',
                              border: '1px dashed transparent',
                            }}
                            title="Click to quickly edit price"
                            onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--c-sky-blue)')}
                            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'transparent')}
                          >
                            <span>₹{room.rent.toLocaleString('en-IN')}</span>
                            <Edit2 size={12} color="#64748b" />
                          </div>
                        )}
                      </td>

                      {/* Availability status with quick dropdown (Section 21) */}
                      <td style={{ padding: '1rem 1rem' }}>
                        <select
                          value={room.status}
                          onChange={(e) => handleStatusChange(room.roomNo, e.target.value as RoomStatus)}
                          style={{
                            padding: '0.35rem 0.65rem',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            background: badge.bg,
                            color: badge.text,
                            border: `1px solid ${badge.border}`,
                            cursor: 'pointer',
                            outline: 'none',
                          }}
                          aria-label={`Change status for room ${room.roomNo}`}
                        >
                          <option value="AVAILABLE">AVAILABLE</option>
                          <option value="AVAILABLE_SOON">AVAILABLE SOON</option>
                          <option value="OCCUPIED">OCCUPIED</option>
                          <option value="RESERVED">RESERVED</option>
                          <option value="MAINTENANCE">MAINTENANCE</option>
                        </select>
                      </td>

                      {/* Last Updated (Freshness Timestamp - Section 22) */}
                      <td style={{ padding: '1rem 1rem', color: '#64748b', fontSize: '0.8rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Clock size={12} color="#94a3b8" />
                          <span>{formatLastUpdated(room.lastUpdatedAt, room.lastUpdatedMinutesAgo)}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                          <button
                            onClick={() => setEditingRoom({ ...room })}
                            style={{
                              background: '#f8fafc',
                              border: '1px solid #e2e8f0',
                              borderRadius: '4px',
                              padding: '0.35rem 0.6rem',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              color: '#0f172a',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                            }}
                          >
                            <Edit2 size={13} />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteRoom(room.roomNo)}
                            style={{
                              background: '#fff',
                              border: '1px solid #fecaca',
                              borderRadius: '4px',
                              padding: '0.35rem 0.5rem',
                              color: '#dc2626',
                              cursor: 'pointer',
                            }}
                            title={`Remove Room ${room.roomNo}`}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Room Modal (Section 19) */}
      {isAddModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
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
              borderRadius: 'var(--radius-lg)',
              maxWidth: '520px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              border: '1px solid var(--border-medium)',
              padding: '1.75rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Plus size={20} color="var(--c-sky-blue)" />
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Add Room to {property.name}
                </h2>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateRoom} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.3rem' }}>
                    ROOM NUMBER *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 101, 204, G-01"
                    value={formData.roomNo}
                    onChange={(e) => setFormData({ ...formData, roomNo: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.3rem' }}>
                    FLOOR LEVEL
                  </label>
                  <select
                    value={formData.floor}
                    onChange={(e) => setFormData({ ...formData, floor: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem' }}
                  >
                    <option value={0}>Ground Floor (Floor 0)</option>
                    <option value={1}>1st Floor</option>
                    <option value={2}>2nd Floor</option>
                    <option value={3}>3rd Floor</option>
                    <option value={4}>4th Floor</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.3rem' }}>
                    ROOM TYPE
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem' }}
                  >
                    <option value="Single">Single (Private Room)</option>
                    <option value="Double">Double Sharing</option>
                    <option value="Triple">Triple Sharing</option>
                    <option value="Shared">Multi-Share Dorm</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.3rem' }}>
                    MONTHLY RENT (₹) *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <IndianRupee size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                    <input
                      type="number"
                      required
                      min={1000}
                      step={100}
                      value={formData.rent}
                      onChange={(e) => setFormData({ ...formData, rent: Number(e.target.value) })}
                      style={{ width: '100%', padding: '0.6rem 0.75rem 0.6rem 2rem', border: '1px solid #cbd5e1', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem' }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.3rem' }}>
                    SECURITY DEPOSIT (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={100}
                    value={formData.deposit}
                    onChange={(e) => setFormData({ ...formData, deposit: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.3rem' }}>
                    INITIAL AVAILABILITY STATUS
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as RoomStatus })}
                    style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem' }}
                  >
                    <option value="AVAILABLE">AVAILABLE (Vacant)</option>
                    <option value="AVAILABLE_SOON">AVAILABLE SOON</option>
                    <option value="OCCUPIED">OCCUPIED</option>
                    <option value="MAINTENANCE">MAINTENANCE</option>
                  </select>
                </div>
              </div>

              {/* Checkboxes */}
              <div style={{ display: 'flex', gap: '1.5rem', padding: '0.5rem 0' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#0f172a', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.attachedBath}
                    onChange={(e) => setFormData({ ...formData, attachedBath: e.target.checked })}
                  />
                  <span>Attached Western Bathroom</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#0f172a', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.hasBalcony}
                    onChange={(e) => setFormData({ ...formData, hasBalcony: e.target.checked })}
                  />
                  <span>Private Balcony</span>
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  style={{
                    padding: '0.6rem 1.2rem',
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: 700,
                    color: '#475569',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ padding: '0.6rem 1.5rem', fontSize: '0.88rem' }}
                >
                  Save Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Room Modal */}
      {editingRoom && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
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
              borderRadius: 'var(--radius-lg)',
              maxWidth: '520px',
              width: '100%',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              border: '1px solid var(--border-medium)',
              padding: '1.75rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Edit2 size={18} color="var(--c-sky-blue)" />
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Edit Room {editingRoom.roomNo}
                </h2>
              </div>
              <button
                onClick={() => setEditingRoom(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditRoomSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.3rem' }}>
                    ROOM TYPE
                  </label>
                  <select
                    value={editingRoom.type}
                    onChange={(e) => setEditingRoom({ ...editingRoom, type: e.target.value as any })}
                    style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem' }}
                  >
                    <option value="Single">Single</option>
                    <option value="Double">Double</option>
                    <option value="Triple">Triple</option>
                    <option value="Shared">Shared</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.3rem' }}>
                    MONTHLY RENT (₹)
                  </label>
                  <input
                    type="number"
                    min={1000}
                    step={100}
                    value={editingRoom.rent}
                    onChange={(e) => setEditingRoom({ ...editingRoom, rent: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.3rem' }}>
                    FLOOR
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={10}
                    value={editingRoom.floor}
                    onChange={(e) => setEditingRoom({ ...editingRoom, floor: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.3rem' }}>
                    STATUS
                  </label>
                  <select
                    value={editingRoom.status}
                    onChange={(e) => setEditingRoom({ ...editingRoom, status: e.target.value as RoomStatus })}
                    style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem' }}
                  >
                    <option value="AVAILABLE">AVAILABLE</option>
                    <option value="AVAILABLE_SOON">AVAILABLE SOON</option>
                    <option value="OCCUPIED">OCCUPIED</option>
                    <option value="RESERVED">RESERVED</option>
                    <option value="MAINTENANCE">MAINTENANCE</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1.5rem', padding: '0.5rem 0' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#0f172a', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={editingRoom.attachedBath}
                    onChange={(e) => setEditingRoom({ ...editingRoom, attachedBath: e.target.checked })}
                  />
                  <span>Attached Bathroom</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#0f172a', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={editingRoom.hasBalcony}
                    onChange={(e) => setEditingRoom({ ...editingRoom, hasBalcony: e.target.checked })}
                  />
                  <span>Private Balcony</span>
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setEditingRoom(null)}
                  style={{
                    padding: '0.6rem 1.2rem',
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: 700,
                    color: '#475569',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ padding: '0.6rem 1.5rem', fontSize: '0.88rem' }}
                >
                  Update Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
