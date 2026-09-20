import {
  DomainEvent,
  DomainEventType,
  ReservationEventPayload,
  RoomAvailabilityEventPayload,
  PropertyPublishedEventPayload,
} from '../types';
import { awsConfig } from '../config/awsConfig';
import { apiClient } from './apiClient';

const PROCESSED_EVENTS_KEY = 'inveni_processed_events';

export type EventHandler<T = any> = (event: DomainEvent<T>) => Promise<void> | void;

export class EventService {
  private handlers: Map<DomainEventType, Set<EventHandler>> = new Map();
  private processedEventIds: Set<string> = new Set();

  constructor() {
    this.loadProcessedEvents();
  }

  private loadProcessedEvents(): void {
    if (typeof localStorage !== 'undefined') {
      try {
        const stored = localStorage.getItem(PROCESSED_EVENTS_KEY);
        if (stored) {
          const list = JSON.parse(stored);
          if (Array.isArray(list)) {
            this.processedEventIds = new Set(list);
          }
        }
      } catch (e) {
        // ignore
      }
    }
  }

  private persistProcessedEvents(): void {
    if (typeof localStorage !== 'undefined') {
      try {
        // Keep last 200 events to prevent memory bloat
        const list = Array.from(this.processedEventIds).slice(-200);
        localStorage.setItem(PROCESSED_EVENTS_KEY, JSON.stringify(list));
      } catch (e) {
        // ignore
      }
    }
  }

  /**
   * Register a subscriber for a domain event
   */
  public subscribe<T = any>(eventType: DomainEventType, handler: EventHandler<T>): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    const set = this.handlers.get(eventType)!;
    set.add(handler as EventHandler);

    return () => {
      set.delete(handler as EventHandler);
    };
  }

  /**
   * Publish an event into the system with IDEMPOTENCY check
   */
  public async publish<T = any>(event: DomainEvent<T>): Promise<{ processed: boolean; duplicate: boolean }> {
    // 1. Idempotency Check (Section 20, 21, 59)
    if (this.processedEventIds.has(event.eventId)) {
      console.warn(`[EventBus] Idempotency Hit: Event ${event.eventId} (${event.eventType}) already processed. Skipping duplicate execution.`);
      return { processed: false, duplicate: true };
    }

    // Mark as processed
    this.processedEventIds.add(event.eventId);
    this.persistProcessedEvents();

    // 2. Cloud Forwarding (if live AWS EventBridge backend configured)
    if (awsConfig.isCloudBackendConfigured) {
      try {
        await apiClient.post('/api/events', event);
      } catch (err) {
        console.error('[EventBus] Cloud event dispatch error:', err);
      }
    }

    // 3. Dispatch to local registered subscribers
    const subscribers = this.handlers.get(event.eventType);
    if (subscribers && subscribers.size > 0) {
      for (const handler of Array.from(subscribers)) {
        try {
          await handler(event);
        } catch (err) {
          console.error(`[EventBus] Error executing subscriber for ${event.eventType}:`, err);
        }
      }
    }

    return { processed: true, duplicate: false };
  }

  /**
   * Helper: Emit ReservationCreated
   */
  public async emitReservationCreated(payload: ReservationEventPayload, customEventId?: string): Promise<string> {
    const eventId = customEventId || `evt_res_created_${payload.reservationId}_${Date.now()}`;
    const event: DomainEvent<ReservationEventPayload> = {
      eventId,
      eventType: 'ReservationCreated',
      eventVersion: '1',
      source: 'inveni.stay',
      timestamp: new Date().toISOString(),
      payload,
    };
    await this.publish(event);
    return eventId;
  }

  /**
   * Helper: Emit ReservationConfirmed
   */
  public async emitReservationConfirmed(payload: ReservationEventPayload, customEventId?: string): Promise<string> {
    const eventId = customEventId || `evt_res_conf_${payload.reservationId}_${Date.now()}`;
    const event: DomainEvent<ReservationEventPayload> = {
      eventId,
      eventType: 'ReservationConfirmed',
      eventVersion: '1',
      source: 'inveni.stay',
      timestamp: new Date().toISOString(),
      payload,
    };
    await this.publish(event);
    return eventId;
  }

  /**
   * Helper: Emit ReservationRejected
   */
  public async emitReservationRejected(payload: ReservationEventPayload, customEventId?: string): Promise<string> {
    const eventId = customEventId || `evt_res_rej_${payload.reservationId}_${Date.now()}`;
    const event: DomainEvent<ReservationEventPayload> = {
      eventId,
      eventType: 'ReservationRejected',
      eventVersion: '1',
      source: 'inveni.stay',
      timestamp: new Date().toISOString(),
      payload,
    };
    await this.publish(event);
    return eventId;
  }

  /**
   * Helper: Emit ReservationCancelled
   */
  public async emitReservationCancelled(payload: ReservationEventPayload, customEventId?: string): Promise<string> {
    const eventId = customEventId || `evt_res_canc_${payload.reservationId}_${Date.now()}`;
    const event: DomainEvent<ReservationEventPayload> = {
      eventId,
      eventType: 'ReservationCancelled',
      eventVersion: '1',
      source: 'inveni.stay',
      timestamp: new Date().toISOString(),
      payload,
    };
    await this.publish(event);
    return eventId;
  }

  /**
   * Helper: Emit RoomAvailabilityChanged
   */
  public async emitRoomAvailabilityChanged(payload: RoomAvailabilityEventPayload, customEventId?: string): Promise<string> {
    const eventId = customEventId || `evt_room_avail_${payload.propertyId}_${payload.roomNo}_${Date.now()}`;
    const event: DomainEvent<RoomAvailabilityEventPayload> = {
      eventId,
      eventType: 'RoomAvailabilityChanged',
      eventVersion: '1',
      source: 'inveni.stay',
      timestamp: new Date().toISOString(),
      payload,
    };
    await this.publish(event);
    return eventId;
  }

  /**
   * Helper: Emit PropertyPublished
   */
  public async emitPropertyPublished(payload: PropertyPublishedEventPayload, customEventId?: string): Promise<string> {
    const eventId = customEventId || `evt_prop_pub_${payload.propertyId}_${Date.now()}`;
    const event: DomainEvent<PropertyPublishedEventPayload> = {
      eventId,
      eventType: 'PropertyPublished',
      eventVersion: '1',
      source: 'inveni.stay',
      timestamp: new Date().toISOString(),
      payload,
    };
    await this.publish(event);
    return eventId;
  }

  /**
   * Clear processed event history (useful in test suites)
   */
  public clearHistory(): void {
    this.processedEventIds.clear();
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.removeItem(PROCESSED_EVENTS_KEY);
      } catch (e) {
        // ignore
      }
    }
  }
}

export const eventService = new EventService();
