import React, { useState, useEffect } from 'react';
import { InAppNotification, NotificationPreferences } from '../../types';
import { notificationService } from '../../services/notificationService';
import { authService } from '../../services/authService';
import {
  Bell,
  CheckCheck,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Building,
  DoorOpen,
  Settings,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

interface NotificationCenterProps {
  onNavigate: (route: string) => void;
  onClose?: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ onNavigate, onClose }) => {
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [activeTab, setActiveTab] = useState<'ALL' | 'UNREAD' | 'PREFERENCES'>('ALL');
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    reservationUpdates: true,
    propertyUpdates: true,
    promotionalNotifications: false,
  });

  const currentUser = authService.getCurrentUser();
  const userId = currentUser?.id || 'usr_panyam_student_01';

  const refresh = () => {
    const list = notificationService.getNotificationsForUser(userId);
    setNotifications(list);
    setPreferences(notificationService.getPreferences(userId));
  };

  useEffect(() => {
    refresh();
    const unsub = notificationService.subscribeToChanges(refresh);
    return () => unsub();
  }, [userId]);

  const handleMarkAsRead = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    notificationService.markAsRead(id, userId);
  };

  const handleMarkAllAsRead = () => {
    notificationService.markAllAsRead(userId);
  };

  const handleNotificationClick = (notif: InAppNotification) => {
    notificationService.markAsRead(notif.id, userId);
    if (notif.targetRoute) {
      if (onClose) onClose();
      onNavigate(notif.targetRoute);
    }
  };

  const handleTogglePref = (key: keyof NotificationPreferences) => {
    const updated = notificationService.updatePreferences(userId, {
      [key]: !preferences[key],
    });
    setPreferences(updated);
  };

  // Group notifications by Today, Yesterday, Earlier (Section 35)
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterdayStart = todayStart - 86400000;

  const filteredNotifs = notifications.filter((n) => {
    if (activeTab === 'UNREAD') return !n.read;
    return true;
  });

  const todayGroup: InAppNotification[] = [];
  const yesterdayGroup: InAppNotification[] = [];
  const earlierGroup: InAppNotification[] = [];

  filteredNotifs.forEach((n) => {
    const time = new Date(n.createdAt).getTime();
    if (time >= todayStart) {
      todayGroup.push(n);
    } else if (time >= yesterdayStart) {
      yesterdayGroup.push(n);
    } else {
      earlierGroup.push(n);
    }
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const renderNotificationItem = (n: InAppNotification) => {
    let icon = <Bell size={18} color="var(--c-sky-blue)" />;
    let iconBg = 'rgba(14, 165, 233, 0.12)';

    if (n.type === 'RESERVATION_CONFIRMED') {
      icon = <CheckCircle2 size={18} color="#10b981" />;
      iconBg = '#ecfdf5';
    } else if (n.type === 'RESERVATION_REJECTED' || n.type === 'RESERVATION_CANCELLED') {
      icon = <XCircle size={18} color="#ef4444" />;
      iconBg = '#fef2f2';
    } else if (n.type === 'RESERVATION_CREATED') {
      icon = <Calendar size={18} color="#f59e0b" />;
      iconBg = '#fffbeb';
    } else if (n.type === 'PROPERTY_PUBLISHED') {
      icon = <Building size={18} color="#6366f1" />;
      iconBg = '#eef2ff';
    }

    const relativeTime = new Date(n.createdAt).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <div
        key={n.id}
        onClick={() => handleNotificationClick(n)}
        style={{
          display: 'flex',
          gap: '14px',
          padding: '16px',
          borderRadius: '12px',
          background: n.read ? '#ffffff' : 'rgba(240, 249, 255, 0.75)',
          border: n.read ? '1px solid #e2e8f0' : '1px solid rgba(14, 165, 233, 0.35)',
          boxShadow: n.read ? 'none' : '0 2px 8px rgba(14, 165, 233, 0.08)',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          marginBottom: '10px',
        }}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: iconBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            marginTop: '2px',
          }}
        >
          {icon}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <span
              style={{
                fontSize: '13px',
                fontWeight: 800,
                color: '#0f172a',
                letterSpacing: '0.02em',
              }}
            >
              {n.title}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>{relativeTime}</span>
              {!n.read && (
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#0ea5e9',
                  }}
                  title="Unread"
                />
              )}
            </div>
          </div>

          <p
            style={{
              fontSize: '13px',
              color: '#475569',
              lineHeight: '1.4',
              margin: '0 0 6px 0',
            }}
          >
            {n.message}
          </p>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {n.targetRoute && (
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'var(--c-sky-blue, #0ea5e9)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                View details <ArrowRight size={12} />
              </span>
            )}
            {!n.read && (
              <button
                type="button"
                onClick={(e) => handleMarkAsRead(n.id, e)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '11px',
                  color: '#64748b',
                  cursor: 'pointer',
                  padding: '2px 6px',
                  marginLeft: 'auto',
                }}
              >
                Mark as read
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      style={{
        maxWidth: '720px',
        margin: '0 auto',
        padding: '24px 16px 64px 16px',
        width: '100%',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '20px',
          paddingBottom: '16px',
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        <div>
          <h2
            style={{
              fontSize: '24px',
              fontWeight: 800,
              color: '#0f172a',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <Bell size={24} color="#0ea5e9" />
            <span>Notification Center</span>
            {unreadCount > 0 && (
              <span
                style={{
                  fontSize: '12px',
                  background: '#0ea5e9',
                  color: '#ffffff',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontWeight: 700,
                }}
              >
                {unreadCount} new
              </span>
            )}
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
            Event-driven updates for room reservations, availability, and property operations.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="neomorph-btn"
              style={{
                fontSize: '12px',
                fontWeight: 700,
                padding: '6px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: '#0f172a',
              }}
            >
              <CheckCheck size={14} color="#059669" />
              <span>Mark all read</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '20px',
          background: 'var(--surface-neomorph, #f1f5f9)',
          padding: '4px',
          borderRadius: '10px',
          width: 'fit-content',
        }}
      >
        <button
          onClick={() => setActiveTab('ALL')}
          style={{
            background: activeTab === 'ALL' ? '#ffffff' : 'transparent',
            border: 'none',
            padding: '6px 14px',
            borderRadius: '8px',
            fontWeight: 700,
            fontSize: '13px',
            color: activeTab === 'ALL' ? '#0ea5e9' : '#64748b',
            boxShadow: activeTab === 'ALL' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            cursor: 'pointer',
          }}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setActiveTab('UNREAD')}
          style={{
            background: activeTab === 'UNREAD' ? '#ffffff' : 'transparent',
            border: 'none',
            padding: '6px 14px',
            borderRadius: '8px',
            fontWeight: 700,
            fontSize: '13px',
            color: activeTab === 'UNREAD' ? '#0ea5e9' : '#64748b',
            boxShadow: activeTab === 'UNREAD' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            cursor: 'pointer',
          }}
        >
          Unread ({unreadCount})
        </button>
        <button
          onClick={() => setActiveTab('PREFERENCES')}
          style={{
            background: activeTab === 'PREFERENCES' ? '#ffffff' : 'transparent',
            border: 'none',
            padding: '6px 14px',
            borderRadius: '8px',
            fontWeight: 700,
            fontSize: '13px',
            color: activeTab === 'PREFERENCES' ? '#0ea5e9' : '#64748b',
            boxShadow: activeTab === 'PREFERENCES' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Settings size={14} />
          <span>Preferences</span>
        </button>
      </div>

      {/* Content Area */}
      {activeTab === 'PREFERENCES' ? (
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '24px',
          }}
        >
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
            Notification Preferences
          </h3>
          <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>
            Customize your notification triggers. Essential reservation updates are always prioritized.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <label
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                borderRadius: '10px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                cursor: 'pointer',
              }}
            >
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                  Reservation & Booking Updates
                </div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  Critical requests, owner confirmations, and move-in timeline alerts.
                </div>
              </div>
              <input
                type="checkbox"
                checked={preferences.reservationUpdates}
                onChange={() => handleTogglePref('reservationUpdates')}
                style={{ width: '18px', height: '18px', accentColor: '#0ea5e9' }}
              />
            </label>

            <label
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                borderRadius: '10px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                cursor: 'pointer',
              }}
            >
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                  Property & Room Status Changes
                </div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  Availability switches (maintenance/vacant) and publishing notices.
                </div>
              </div>
              <input
                type="checkbox"
                checked={preferences.propertyUpdates}
                onChange={() => handleTogglePref('propertyUpdates')}
                style={{ width: '18px', height: '18px', accentColor: '#0ea5e9' }}
              />
            </label>

            <label
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                borderRadius: '10px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                cursor: 'pointer',
              }}
            >
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                  Promotional & Discovery Notifications
                </div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  Subtle discovery spotlights (Strictly segregated from critical reservation alerts).
                </div>
              </div>
              <input
                type="checkbox"
                checked={preferences.promotionalNotifications}
                onChange={() => handleTogglePref('promotionalNotifications')}
                style={{ width: '18px', height: '18px', accentColor: '#0ea5e9' }}
              />
            </label>
          </div>
        </div>
      ) : filteredNotifs.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '48px 20px',
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: '#f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
            }}
          >
            <Bell size={28} color="#94a3b8" />
          </div>
          <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
            No Notifications
          </h4>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
            {activeTab === 'UNREAD'
              ? 'You have caught up with all your unread messages.'
              : 'No activity recorded yet.'}
          </p>
        </div>
      ) : (
        <div>
          {/* Today Group */}
          {todayGroup.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  color: '#64748b',
                  letterSpacing: '0.06em',
                  marginBottom: '10px',
                }}
              >
                Today
              </div>
              {todayGroup.map(renderNotificationItem)}
            </div>
          )}

          {/* Yesterday Group */}
          {yesterdayGroup.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  color: '#64748b',
                  letterSpacing: '0.06em',
                  marginBottom: '10px',
                }}
              >
                Yesterday
              </div>
              {yesterdayGroup.map(renderNotificationItem)}
            </div>
          )}

          {/* Earlier Group */}
          {earlierGroup.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  color: '#64748b',
                  letterSpacing: '0.06em',
                  marginBottom: '10px',
                }}
              >
                Earlier
              </div>
              {earlierGroup.map(renderNotificationItem)}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
