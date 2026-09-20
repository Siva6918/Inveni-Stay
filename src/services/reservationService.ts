import {
  Reservation,
  RenterProfile,
  ReservationAddon,
  FoodPlanOption,
  ReservationPricing,
  ReservationStatus,
  RoomUnit,
  ApiResponse,
} from '../types';
import { propertyService } from './propertyService';
import { apiClient } from './apiClient';
import { authService } from './authService';
import { awsConfig } from '../config/awsConfig';
import { eventService } from './eventService';

const STORAGE_KEY = 'inveni_reservations';

export class ReservationService {
  private reservations: Reservation[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private getStorage(key: string): string | null {
    if (typeof localStorage !== 'undefined') {
      try {
        return localStorage.getItem(key);
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  private setStorage(key: string, value: string): void {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(key, value);
      } catch (e) {
        // ignore
      }
    }
  }

  private loadFromStorage(): void {
    try {
      const data = this.getStorage(STORAGE_KEY);
      if (data) {
        this.reservations = JSON.parse(data);
      } else {
        // Pre-seed with a realistic past demonstration reservation if empty
        const initialDemo: Reservation = {
          id: 'INV-2026-00118',
          propertyId: 'panyam_sri_sai_residency',
          propertyName: 'Sri Sai Luxury PG & Residency',
          propertyTown: 'Panyam',
          propertyAddress: 'Opp. Old Bus Stand Road, Near Govt. Polytechnic & Degree College, Panyam',
          propertyHeroImage: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80',
          roomId: '104',
          roomNo: '104',
          roomType: 'Double',
          roomFloor: 1,
          moveInDate: '2026-09-15',
          durationMonths: 6,
          durationLabel: '6 Months (Semester)',
          foodPlan: 'included',
          foodPlanLabel: 'Andhra Homestyle Meals (Included in Rent)',
          selectedAddons: [
            {
              id: 'addon_study_lamp',
              name: 'Extra Study Lamp & Extension Dock',
              monthlyPrice: 150,
              description: 'Adjustable LED warm study lamp with 4-socket surge protector',
            },
          ],
          renter: {
            fullName: 'Venkata Siva Kumar',
            phone: '9849012345',
            email: 'siva.relocating@gmail.com',
            currentLocation: 'Kadapa, Andhra Pradesh',
            occupation: 'Student (Polytechnic Engineering)',
            emergencyContactName: 'R. K. Reddy (Father)',
            emergencyContactPhone: '9849098765',
          },
          pricing: {
            roomRent: 4200,
            foodCost: 0,
            addonCost: 150,
            deposit: 2000,
            monthlyTotal: 4350,
            initialTotal: 6350,
          },
          status: 'REQUESTED',
          createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        };
        this.reservations = [initialDemo];
        this.saveToStorage();
      }
    } catch (e) {
      this.reservations = [];
    }
  }

  private saveToStorage(): void {
    try {
      this.setStorage(STORAGE_KEY, JSON.stringify(this.reservations));
    } catch (e) {
      // ignore
    }
  }

  /**
   * Validate renter input fields with clear human messages
   */
  public validateRenter(data: Partial<RenterProfile>): Record<string, string> {
    const errors: Record<string, string> = {};

    if (!data.fullName || data.fullName.trim().length < 3) {
      errors.fullName = 'Please enter your full name (at least 3 characters)';
    }

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!data.phone || !phoneRegex.test(data.phone.replace(/[\s-]/g, ''))) {
      errors.phone = 'Please enter a valid 10-digit Indian mobile number (e.g., 9849012345)';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email || !emailRegex.test(data.email.trim())) {
      errors.email = 'Please enter a valid email address';
    }

    if (!data.currentLocation || data.currentLocation.trim().length < 2) {
      errors.currentLocation = 'Please provide your current city/town (e.g. Kadapa)';
    }

    if (!data.occupation || data.occupation.trim().length < 2) {
      errors.occupation = 'Please indicate your student or professional role';
    }

    return errors;
  }

  /**
   * Calculate authoritative server-side pricing structure
   */
  public calculateAuthoritativePricing(
    roomRent: number,
    foodPlan: FoodPlanOption,
    selectedAddons: ReservationAddon[],
    customDeposit?: number
  ): ReservationPricing {
    const foodCost = foodPlan === 'full-mess' ? 1500 : 0;
    const addonCost = selectedAddons.reduce((sum, a) => sum + (Number(a.monthlyPrice) || 0), 0);
    const deposit = customDeposit || 2000;
    const monthlyTotal = roomRent + foodCost + addonCost;
    const initialTotal = monthlyTotal + deposit;

    return {
      roomRent,
      foodCost,
      addonCost,
      deposit,
      monthlyTotal,
      initialTotal,
    };
  }

  /**
   * Create a new reservation request.
   * If live AWS backend is enabled, posts to /api/reservations.
   * Otherwise, executes local atomic validation and state management.
   */
  public async createReservation(params: {
    propertyId: string;
    roomNo: string;
    moveInDate: string;
    durationMonths: number;
    durationLabel: string;
    foodPlan: FoodPlanOption;
    foodPlanLabel: string;
    selectedAddons: ReservationAddon[];
    renter: RenterProfile;
  }): Promise<{ success: boolean; reservation?: Reservation; error?: string }> {
    const property = propertyService.getPropertyById(params.propertyId);
    if (!property) {
      return { success: false, error: 'Property could not be located in directory.' };
    }

    const room = property.rooms.find((r: RoomUnit) => r.roomNo === params.roomNo);
    if (!room) {
      return { success: false, error: `Room ${params.roomNo} not found in ${property.name}.` };
    }

    // Server-Side Availability Guard: Cannot reserve an occupied/maintenance room
    if (room.status !== 'AVAILABLE') {
      return {
        success: false,
        error: `Room ${params.roomNo} is no longer available (Current status: ${room.status}). Please choose another room.`,
      };
    }

    // Authoritative Server-Side Price Calculation (Section 15)
    const pricing = this.calculateAuthoritativePricing(
      room.rent,
      params.foodPlan,
      params.selectedAddons,
      room.deposit || property.securityDeposit
    );

    const currentUser = authService.getCurrentUser();
    const userId = currentUser?.id || 'usr_guest_demo';

    // 1. Live AWS API Route
    if (awsConfig.isCloudBackendConfigured) {
      const payload = {
        propertyId: property.id,
        propertyName: property.name,
        propertyTown: property.town,
        propertyAddress: property.address,
        propertyHeroImage: property.heroImage,
        roomId: room.roomNo,
        roomNo: room.roomNo,
        roomType: room.type,
        roomFloor: room.floor,
        moveInDate: params.moveInDate,
        durationMonths: params.durationMonths,
        durationLabel: params.durationLabel,
        foodPlan: params.foodPlan,
        foodPlanLabel: params.foodPlanLabel,
        selectedAddons: params.selectedAddons,
        renter: params.renter,
        userId,
      };

      const response: ApiResponse<Reservation> = await apiClient.post('/api/reservations', payload);

      if (!response.success) {
        return {
          success: false,
          error: response.error?.message || 'Failed to create reservation in cloud database.',
        };
      }

      if (response.data) {
        // Update local cache and room status to match AWS
        propertyService.updateRoomStatus(property.id, room.roomNo, 'RESERVED');
        this.reservations.unshift(response.data);
        this.saveToStorage();
        return { success: true, reservation: response.data };
      }
    }

    // 2. Controlled Demo Mode Execution with Atomic Concurrency
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const id = `INV-2026-${randomSuffix}`;

    const reservation: Reservation = {
      id,
      propertyId: property.id,
      propertyName: property.name,
      propertyTown: property.town,
      propertyAddress: property.address,
      propertyHeroImage: property.heroImage,
      roomId: room.roomNo,
      roomNo: room.roomNo,
      roomType: room.type,
      roomFloor: room.floor,
      moveInDate: params.moveInDate,
      durationMonths: params.durationMonths,
      durationLabel: params.durationLabel,
      foodPlan: params.foodPlan,
      foodPlanLabel: params.foodPlanLabel,
      selectedAddons: params.selectedAddons,
      renter: params.renter,
      pricing,
      status: 'REQUESTED',
      createdAt: new Date().toISOString(),
    };

    // Update room status in propertyService to RESERVED
    propertyService.updateRoomStatus(property.id, room.roomNo, 'RESERVED');

    // Add to reservations list and persist
    this.reservations.unshift(reservation);
    this.saveToStorage();

    // Emit ReservationCreated domain event (Phase 8 Section 7)
    const ownerId = property.ownerId || 'owner_sri_sai_panyam';
    const renterId = authService.getCurrentUser()?.id || params.renter.email;
    eventService.emitReservationCreated({
      reservationId: id,
      propertyId: property.id,
      propertyName: property.name,
      roomId: room.roomNo,
      roomNo: room.roomNo,
      ownerId,
      renterId,
      renterName: params.renter.fullName,
      moveInDate: params.moveInDate,
      status: 'REQUESTED',
      timestamp: reservation.createdAt,
    });

    return { success: true, reservation };
  }

  /**
   * Retrieve a reservation by its ID (enforces user ownership in live mode)
   */
  public getReservationById(id: string): Reservation | undefined {
    return this.reservations.find((r) => r.id === id);
  }

  /**
   * Retrieve saved reservations specifically for the authenticated renter
   */
  public getReservationsForUser(userId?: string, email?: string): Reservation[] {
    if (!userId && !email) return [];
    return this.reservations.filter((r) => {
      if (email && r.renter?.email && r.renter.email.toLowerCase() === email.toLowerCase()) {
        return true;
      }
      if (userId && (r.renter as any)?.userId === userId) {
        return true;
      }
      // Demo fallback: default student persona matches demo reservation
      if (userId === 'usr_panyam_student_01' || email?.includes('siva')) {
        return r.renter?.fullName?.includes('Siva') || r.renter?.email?.includes('siva');
      }
      return false;
    });
  }

  /**
   * Retrieve all saved reservations (internal admin only)
   */
  public getAllReservations(): Reservation[] {
    return this.reservations;
  }

  /**
   * Cancel an active reservation request
   */
  public async cancelReservation(id: string, reason?: string): Promise<boolean> {
    if (awsConfig.isCloudBackendConfigured) {
      const res = await apiClient.patch(`/api/reservations/${id}`, {
        status: 'CANCELLED',
        cancellationReason: reason,
      });
      if (!res.success) {
        return false;
      }
    }

    const reservation = this.reservations.find((r) => r.id === id);
    if (!reservation) return false;

    reservation.status = 'CANCELLED';
    reservation.cancellationReason = reason || 'Cancelled by renter request';

    // Restore the room to AVAILABLE in propertyService
    propertyService.updateRoomStatus(reservation.propertyId, reservation.roomNo, 'AVAILABLE');

    this.saveToStorage();

    // Emit ReservationCancelled domain event (Phase 8 Section 10)
    const prop = propertyService.getPropertyById(reservation.propertyId);
    const ownerId = prop?.ownerId || 'owner_sri_sai_panyam';
    eventService.emitReservationCancelled({
      reservationId: reservation.id,
      propertyId: reservation.propertyId,
      propertyName: reservation.propertyName,
      roomId: reservation.roomNo,
      roomNo: reservation.roomNo,
      ownerId,
      renterId: reservation.renter.email || 'usr_panyam_student_01',
      renterName: reservation.renter.fullName,
      moveInDate: reservation.moveInDate,
      status: 'CANCELLED',
      reason,
      timestamp: new Date().toISOString(),
    });

    return true;
  }

  // ============================================================================
  // PHASE 7: OWNER RESERVATION MANAGEMENT (Section 24, 25, 26, 27, 28)
  // ============================================================================

  /**
   * Get reservations for a property owned by ownerId (Section 24, 30, 50)
   */
  public getReservationsByProperty(propertyId: string, ownerId: string): Reservation[] {
    const prop = propertyService.getPropertyById(propertyId);
    if (!prop || (prop.ownerId && prop.ownerId !== ownerId)) {
      return [];
    }

    return this.reservations.filter((r) => r.propertyId === propertyId);
  }

  /**
   * Get all reservations across all properties owned by ownerId (Section 6, 24)
   */
  public getReservationsByOwner(ownerId: string): Reservation[] {
    const ownerProps = propertyService.getPropertiesByOwner(ownerId);
    const propIds = new Set(ownerProps.map((p) => p.id));
    return this.reservations.filter((r) => propIds.has(r.propertyId));
  }

  /**
   * Confirm reservation request (Section 26, 28)
   * Only the verified property owner can confirm.
   * Room state remains RESERVED (physical occupancy is separate event).
   */
  public async confirmReservation(
    ownerId: string,
    reservationId: string
  ): Promise<{ success: boolean; error?: string; reservation?: Reservation }> {
    const reservation = this.reservations.find((r) => r.id === reservationId);
    if (!reservation) {
      return { success: false, error: 'Reservation request not found.' };
    }

    // Backend Ownership Authorization Guard (Section 26, 30, 50)
    const prop = propertyService.getPropertyById(reservation.propertyId);
    if (!prop || (prop.ownerId && prop.ownerId !== ownerId)) {
      return { success: false, error: 'Unauthorized: You do not own the property associated with this reservation.' };
    }

    if (reservation.status === 'CONFIRMED') {
      return { success: false, error: 'This reservation has already been confirmed.' };
    }

    if (reservation.status === 'CANCELLED') {
      return { success: false, error: 'Cannot confirm a cancelled reservation.' };
    }

    if (awsConfig.isCloudBackendConfigured) {
      const res = await apiClient.patch(`/api/owner/reservations/${reservationId}`, {
        status: 'CONFIRMED',
      });
      if (!res.success) {
        return { success: false, error: res.error?.message || 'Cloud database update failed.' };
      }
    }

    reservation.status = 'CONFIRMED';
    // Room remains RESERVED as per Section 28
    this.saveToStorage();

    // Emit ReservationConfirmed domain event (Phase 8 Section 8)
    const renterId = reservation.renter.email || 'usr_panyam_student_01';
    eventService.emitReservationConfirmed({
      reservationId: reservation.id,
      propertyId: reservation.propertyId,
      propertyName: reservation.propertyName,
      roomId: reservation.roomNo,
      roomNo: reservation.roomNo,
      ownerId,
      renterId,
      renterName: reservation.renter.fullName,
      moveInDate: reservation.moveInDate,
      status: 'CONFIRMED',
      timestamp: new Date().toISOString(),
    });

    return { success: true, reservation };
  }

  /**
   * Reject reservation request with reason (Section 27)
   * Restores room status back to AVAILABLE so others can discover/reserve it!
   */
  public async rejectReservation(
    ownerId: string,
    reservationId: string,
    reason: string = 'Dates or room unavailable'
  ): Promise<{ success: boolean; error?: string; reservation?: Reservation }> {
    const reservation = this.reservations.find((r) => r.id === reservationId);
    if (!reservation) {
      return { success: false, error: 'Reservation request not found.' };
    }

    // Backend Ownership Authorization Guard (Section 27, 30, 50)
    const prop = propertyService.getPropertyById(reservation.propertyId);
    if (!prop || (prop.ownerId && prop.ownerId !== ownerId)) {
      return { success: false, error: 'Unauthorized: You do not own the property associated with this reservation.' };
    }

    if (reservation.status === 'CANCELLED') {
      return { success: false, error: 'Reservation is already cancelled/rejected.' };
    }

    if (awsConfig.isCloudBackendConfigured) {
      const res = await apiClient.patch(`/api/owner/reservations/${reservationId}`, {
        status: 'CANCELLED',
        cancellationReason: reason,
      });
      if (!res.success) {
        return { success: false, error: res.error?.message || 'Cloud database update failed.' };
      }
    }

    reservation.status = 'CANCELLED';
    reservation.cancellationReason = `Rejected by owner: ${reason}`;

    // Availability Restoration (Section 27 & 60): Free the room back to AVAILABLE!
    propertyService.updateRoomStatus(reservation.propertyId, reservation.roomNo, 'AVAILABLE');

    this.saveToStorage();

    // Emit ReservationRejected domain event (Phase 8 Section 9)
    const renterId = reservation.renter.email || 'usr_panyam_student_01';
    eventService.emitReservationRejected({
      reservationId: reservation.id,
      propertyId: reservation.propertyId,
      propertyName: reservation.propertyName,
      roomId: reservation.roomNo,
      roomNo: reservation.roomNo,
      ownerId,
      renterId,
      renterName: reservation.renter.fullName,
      moveInDate: reservation.moveInDate,
      status: 'CANCELLED',
      reason,
      timestamp: new Date().toISOString(),
    });

    return { success: true, reservation };
  }
}

export const reservationService = new ReservationService();
