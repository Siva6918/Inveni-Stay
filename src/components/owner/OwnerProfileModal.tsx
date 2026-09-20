import React from 'react';
import { AuthUser } from '../../types';
import { authService } from '../../services/authService';
import { propertyService } from '../../services/propertyService';
import {
  X,
  User,
  Shield,
  Building,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react';

interface OwnerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AuthUser | null;
}

export const OwnerProfileModal: React.FC<OwnerProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
}) => {
  if (!isOpen || !currentUser) return null;

  const ownerProps = propertyService.getPropertiesByOwner(currentUser.id);

  return (
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
          borderRadius: 'var(--radius-xl)',
          maxWidth: '480px',
          width: '100%',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
          border: '1px solid var(--border-medium)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-medium)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--surface-1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <User size={20} color="var(--c-sky-blue)" />
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Owner Profile
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Identity Card */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
            }}
          >
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #0284c7, #0ea5e9)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.25rem',
              }}
            >
              {currentUser.fullName.charAt(0)}
            </div>

            <div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0f172a' }}>
                {currentUser.fullName}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {currentUser.occupation || 'Property Host & Owner'}
              </div>
              <div
                style={{
                  fontSize: '0.72rem',
                  fontFamily: 'var(--font-metrics)',
                  color: '#64748b',
                  marginTop: '0.2rem',
                }}
              >
                Owner ID: {currentUser.id}
              </div>
            </div>
          </div>

          {/* Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.88rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#334155' }}>
              <Mail size={16} color="#64748b" />
              <span>{currentUser.email}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#334155' }}>
              <Phone size={16} color="#64748b" />
              <span>{currentUser.phone || '+91 98480 12345'}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#334155' }}>
              <MapPin size={16} color="#64748b" />
              <span>{currentUser.currentLocation || 'Panyam, Andhra Pradesh'}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#334155' }}>
              <Building size={16} color="#64748b" />
              <span>Properties Owned: <strong>{ownerProps.length}</strong></span>
            </div>
          </div>

          {/* Verification Status (Section 40: Transparent, no fake claims) */}
          <div
            style={{
              background: '#fffbeb',
              border: '1px solid #fde68a',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem 1rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.6rem',
            }}
          >
            <Clock size={16} color="#d97706" style={{ marginTop: '2px', flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 800, color: '#92400e', fontSize: '0.82rem' }}>
                Verification Status: PENDING COORDINATOR AUDIT
              </div>
              <div style={{ fontSize: '0.76rem', color: '#b45309', marginTop: '0.15rem' }}>
                On-site verification occurs after property listing review. No unverified trust claims are published.
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid var(--border-medium)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'var(--surface-1)',
          }}
        >
          <button
            onClick={() => {
              authService.logout();
              onClose();
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#dc2626',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            Sign Out
          </button>

          <button
            onClick={onClose}
            className="btn-primary"
            style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
