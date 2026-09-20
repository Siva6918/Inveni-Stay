import {
  InAppNotification,
  NotificationPreferences,
  DomainEvent,
  ReservationEventPayload,
  PropertyPublishedEventPayload,
  RoomAvailabilityEventPayload,
} from '../types';
import { eventService } from './eventService';
import { awsConfig } from '../config/awsConfig';
import { apiClient } from './apiClient';

const STORAGE_KEY = 'inveni_notifications';
const PREFS_STORAGE_KEY = 'inveni_notification_prefs';

export class NotificationService {
  private notifications: InAppNotification[] = [];
  private preferencesMap: Map<string, NotificationPreferences> = new Map();
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.loadFromStorage();
    this.setupEventSubscriptions();
  }

  private loadFromStorage(): void {
    if (typeof localStorage !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          this.notifications = JSON.parse(stored);
        } else {
          // Pre-seed with realistic notifications for demo
          const now = Date.now();
          this.notifications = [
            {
              id: 'notif_welcome_renter',
              userId: 'usr_panyam_student_01',
              type: 'SYSTEM_ALERT',
              title: 'Welcome to Inveni Stay',
              message: 'Your relocation assistant is active. Verified rooms in Panyam and Nandyal are available.',
              read: true,
              createdAt: new Date(now - 86400000 * 2).toISOString(),
              targetRoute: '/',
            },
            {
              id: 'notif_welcome_owner',
              userId: 'owner_sri_sai_panyam',
              type: 'PROPERTY_PUBLISHED',
              title: 'Sri Sai Residency Live',
              message: 'Your property is active with 12 configured rooms in Panyam.',
              read: false,
              createdAt: new Date(now - 3600000 * 4).toISOString(),
              targetRoute: '/owner',
            },
          ];
          this.saveToStorage();
        }

        const storedPrefs = localStorage.getItem(PREFS_STORAGE_KEY);
        if (storedPrefs) {
          const parsed = JSON.parse(storedPrefs);
          this.preferencesMap = new Map(Object.entries(parsed));
        }
      } catch (e) {
        // ignore
      }
    }
  }

  private saveToStorage(): void {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.notifications));
        const prefsObj: Record<string, NotificationPreferences> = {};
        this.preferencesMap.forEach((v, k) => {
          prefsObj[k] = v;
        });
        localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(prefsObj));
      } catch (e) {
        // ignore
      }
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (e) {
        // ignore
      }
    });
  }

  public subscribeToChanges(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Automatically register domain event listeners from eventService
   */
  private setupEventSubscriptions(): void {
    // 1. Renter creates reservation -> Notify Owner
    eventService.subscribe<ReservationEventPayload>('ReservationCreated', async (event) => {
      const { ownerId, propertyName, roomNo, moveInDate, reservationId, propertyId, renterName } = event.payload;
      if (!ownerId) return;

      const prefs = this.getPreferences(ownerId);
      if (!prefs.reservationUpdates) return;

      this.addNotification({
        id: `notif_${event.eventId}`,
        userId: ownerId,
        type: 'RESERVATION_CREATED',
        title: 'NEW RESERVATION REQUEST',
        message: `${renterName} requested Room ${roomNo} at ${propertyName}. Move-in: ${moveInDate}`,
        referenceId: reservationId,
        referenceType: 'reservation',
        targetRoute: `/owner/properties/${propertyId}/reservations`,
        read: false,
        createdAt: event.timestamp,
        metadata: { reservationId, propertyId, roomNo },
      });
    });

    // 2. Owner confirms reservation -> Notify Renter
    eventService.subscribe<ReservationEventPayload>('ReservationConfirmed', async (event) => {
      const { renterId, propertyName, roomNo, reservationId, moveInDate } = event.payload;
      if (!renterId) return;

      const prefs = this.getPreferences(renterId);
      if (!prefs.reservationUpdates) return;

      this.addNotification({
        id: `notif_${event.eventId}`,
        userId: renterId,
        type: 'RESERVATION_CONFIRMED',
        title: 'RESERVATION CONFIRMED',
        message: `Your reservation for Room ${roomNo} at ${propertyName} (Move-in: ${moveInDate}) has been confirmed!`,
        referenceId: reservationId,
        referenceType: 'reservation',
        targetRoute: '/my-stays',
        read: false,
        createdAt: event.timestamp,
        metadata: { reservationId, roomNo },
      });
    });

    // 3. Owner rejects reservation -> Notify Renter with reason
    eventService.subscribe<ReservationEventPayload>('ReservationRejected', async (event) => {
      const { renterId, propertyName, roomNo, reservationId, reason } = event.payload;
      if (!renterId) return;

      const prefs = this.getPreferences(renterId);
      if (!prefs.reservationUpdates) return;

      this.addNotification({
        id: `notif_${event.eventId}`,
        userId: renterId,
        type: 'RESERVATION_REJECTED',
        title: 'RESERVATION REQUEST NOT ACCEPTED',
        message: `The owner could not accept your request for Room ${roomNo} at ${propertyName}. Reason: ${reason || 'Room unavailable'}.`,
        referenceId: reservationId,
        referenceType: 'reservation',
        targetRoute: '/my-stays',
        read: false,
        createdAt: event.timestamp,
        metadata: { reservationId, roomNo, reason },
      });
    });

    // 4. Renter cancels reservation -> Notify Owner
    eventService.subscribe<ReservationEventPayload>('ReservationCancelled', async (event) => {
      const { ownerId, propertyName, roomNo, reservationId, propertyId } = event.payload;
      if (!ownerId) return;

      const prefs = this.getPreferences(ownerId);
      if (!prefs.reservationUpdates) return;

      this.addNotification({
        id: `notif_${event.eventId}`,
        userId: ownerId,
        type: 'RESERVATION_CANCELLED',
        title: 'RESERVATION CANCELLED',
        message: `Reservation for Room ${roomNo} at ${propertyName} was cancelled. Room status restored.`,
        referenceId: reservationId,
        referenceType: 'reservation',
        targetRoute: `/owner/properties/${propertyId}/reservations`,
        read: false,
        createdAt: event.timestamp,
        metadata: { reservationId, propertyId, roomNo },
      });
    });

    // 5. Property Published -> Notify Owner
    eventService.subscribe<PropertyPublishedEventPayload>('PropertyPublished', async (event) => {
      const { ownerId, propertyName, propertyId, roomCount } = event.payload;
      if (!ownerId) return;

      this.addNotification({
        id: `notif_${event.eventId}`,
        userId: ownerId,
        type: 'PROPERTY_PUBLISHED',
        title: 'PROPERTY PUBLISHED',
        message: `${propertyName} is now published and active with ${roomCount} rooms.`,
        referenceId: propertyId,
        referenceType: 'property',
        targetRoute: '/owner',
        read: false,
        createdAt: event.timestamp,
      });
    });
  }

  /**
   * Internal helper to record notification with deduplication
   */
  public addNotification(notification: InAppNotification): void {
    // Avoid duplicate IDs
    if (this.notifications.some((n) => n.id === notification.id)) {
      return;
    }
    this.notifications.unshift(notification);
    this.saveToStorage();
    this.notifyListeners();
  }

  /**
   * Get notifications scoped to a user (Authorization & Privacy Guard, Section 14, 47)
   */
  public getNotificationsForUser(userId: string): InAppNotification[] {
    if (!userId) return [];
    return this.notifications.filter((n) => n.userId === userId);
  }

  /**
   * Get unread notification count for a user
   */
  public getUnreadCount(userId: string): number {
    if (!userId) return 0;
    return this.notifications.filter((n) => n.userId === userId && !n.read).length;
  }

  /**
   * Mark a single notification as read (with ownership verification)
   */
  public markAsRead(notificationId: string, userId: string): boolean {
    const notif = this.notifications.find((n) => n.id === notificationId);
    if (!notif) return false;

    // Security check: User can only mark their own notifications (Section 14, 47)
    if (notif.userId !== userId) {
      console.warn(`[Security] Unauthorized markAsRead attempt: User ${userId} tried to mark notification for ${notif.userId}`);
      return false;
    }

    notif.read = true;
    this.saveToStorage();
    this.notifyListeners();
    return true;
  }

  /**
   * Mark all notifications as read for a user
   */
  public markAllAsRead(userId: string): void {
    if (!userId) return;
    let changed = false;
    this.notifications.forEach((n) => {
      if (n.userId === userId && !n.read) {
        n.read = true;
        changed = true;
      }
    });

    if (changed) {
      this.saveToStorage();
      this.notifyListeners();
    }
  }

  /**
   * Get notification preferences for a user
   */
  public getPreferences(userId: string): NotificationPreferences {
    const existing = this.preferencesMap.get(userId);
    if (existing) return existing;

    const defaultPrefs: NotificationPreferences = {
      reservationUpdates: true,
      propertyUpdates: true,
      promotionalNotifications: false, // Default false to prevent ad clutter (Section 41)
    };
    return defaultPrefs;
  }

  /**
   * Update notification preferences for a user
   */
  public updatePreferences(userId: string, prefs: Partial<NotificationPreferences>): NotificationPreferences {
    const current = this.getPreferences(userId);
    const updated: NotificationPreferences = {
      ...current,
      ...prefs,
    };
    this.preferencesMap.set(userId, updated);
    this.saveToStorage();
    return updated;
  }

  /**
   * Reset or clear notifications (useful in test suites)
   */
  public clear(): void {
    this.notifications = [];
    this.preferencesMap.clear();
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(PREFS_STORAGE_KEY);
      } catch (e) {
        // ignore
      }
    }
    this.notifyListeners();
  }
}

export const notificationService = new NotificationService();
