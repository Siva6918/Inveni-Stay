import { MOCK_PROPERTIES } from '../data/mockProperties';
import {
  PropertyListing,
  SearchFilters,
  SortOption,
  MatchResult,
  RoomStatus,
  RoomUnit,
  Facility,
  PropertyStatus,
  CreatePropertyInput,
  CreateRoomInput,
  OwnerDashboardMetrics,
} from '../types';
import { eventService } from './eventService';

const GLOBAL_CITY_COORDINATES: Record<string, { lat: number; lng: number; country: string }> = {
  panyam: { lat: 15.5185, lng: 78.3492, country: 'Andhra Pradesh, India' },
  nandyal: { lat: 15.4859, lng: 78.4847, country: 'Andhra Pradesh, India' },
  kurnool: { lat: 15.8281, lng: 78.0373, country: 'Andhra Pradesh, India' },
  kadapa: { lat: 14.4673, lng: 78.8242, country: 'Andhra Pradesh, India' },
  hyderabad: { lat: 17.385, lng: 78.4867, country: 'Telangana, India' },
  bengaluru: { lat: 12.9716, lng: 77.5946, country: 'Karnataka, India' },
  bangalore: { lat: 12.9716, lng: 77.5946, country: 'Karnataka, India' },
  mumbai: { lat: 19.076, lng: 72.8777, country: 'Maharashtra, India' },
  delhi: { lat: 28.6139, lng: 77.209, country: 'Delhi NCR, India' },
  chennai: { lat: 13.0827, lng: 80.2707, country: 'Tamil Nadu, India' },
  pune: { lat: 18.5204, lng: 73.8567, country: 'Maharashtra, India' },
  london: { lat: 51.5074, lng: -0.1278, country: 'United Kingdom' },
  'new york': { lat: 40.7128, lng: -74.006, country: 'United States' },
  tokyo: { lat: 35.6762, lng: 139.6503, country: 'Japan' },
  dubai: { lat: 25.2048, lng: 55.2708, country: 'United Arab Emirates' },
  paris: { lat: 48.8566, lng: 2.3522, country: 'France' },
  singapore: { lat: 1.3521, lng: 103.8198, country: 'Singapore' },
  berlin: { lat: 52.52, lng: 13.405, country: 'Germany' },
  sydney: { lat: -33.8688, lng: 151.2093, country: 'Australia' },
  toronto: { lat: 43.6532, lng: -79.3832, country: 'Canada' },
};

export class PropertyService {
  private properties: PropertyListing[] = JSON.parse(JSON.stringify(MOCK_PROPERTIES));

  constructor() {
    this.normalizeOwnerProperties();
    this.loadCustomProperties();
    this.applyLocalOverrides();
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

  private normalizeOwnerProperties(): void {
    this.properties.forEach((p) => {
      if (!p.status) p.status = 'ACTIVE';
      if (!p.ownerId) {
        if (p.id === 'panyam_sri_sai_residency') {
          p.ownerId = 'owner_sri_sai_panyam';
        } else {
          p.ownerId = `owner_${p.id}`;
        }
      }
      p.rooms.forEach((r) => {
        if (!r.lastUpdatedAt) {
          const minutesAgo = r.lastUpdatedMinutesAgo || 45;
          r.lastUpdatedAt = new Date(Date.now() - minutesAgo * 60000).toISOString();
        }
      });
    });
  }

  private loadCustomProperties(): void {
    try {
      const stored = this.getStorage('inveni_custom_properties');
      if (stored) {
        const customProps: PropertyListing[] = JSON.parse(stored);
        for (const cp of customProps) {
          const existingIdx = this.properties.findIndex((p) => p.id === cp.id);
          if (existingIdx >= 0) {
            this.properties[existingIdx] = cp;
          } else {
            this.properties.unshift(cp);
          }
        }
      }
    } catch (e) {
      // ignore
    }
  }

  private saveCustomProperties(): void {
    try {
      // Save all custom or owner-modified properties
      this.setStorage('inveni_custom_properties', JSON.stringify(this.properties));
    } catch (e) {
      // ignore
    }
  }

  /**
   * Add a custom created building and rooms, persisting locally
   */
  public addCustomProperty(property: PropertyListing): PropertyListing {
    if (!property.status) property.status = 'ACTIVE';
    this.properties.unshift(property);
    this.saveCustomProperties();
    return property;
  }

  private applyLocalOverrides(): void {
    try {
      const stored = this.getStorage('inveni_room_overrides');
      if (stored) {
        const overrides: Record<string, Record<string, RoomStatus>> = JSON.parse(stored);
        for (const [propId, rooms] of Object.entries(overrides)) {
          const prop = this.properties.find((p) => p.id === propId);
          if (prop) {
            for (const [roomNo, status] of Object.entries(rooms)) {
              const r = prop.rooms.find((rm) => rm.roomNo === roomNo);
              if (r) {
                r.status = status;
              }
            }
            prop.availableRoomsCount = prop.rooms.filter((r) => r.status === 'AVAILABLE').length;
          }
        }
      }
    } catch (e) {
      // ignore
    }
  }

  /**
   * Update room status in memory and persist locally (Single source of truth)
   */
  public updateRoomStatus(propertyId: string, roomNo: string, status: RoomStatus): boolean {
    const prop = this.properties.find((p) => p.id === propertyId);
    if (!prop) return false;
    const room = prop.rooms.find((r) => r.roomNo === roomNo);
    if (!room) return false;

    const prevStatus = room.status;
    room.status = status;
    room.lastUpdatedAt = new Date().toISOString();
    room.lastUpdatedMinutesAgo = 0;
    prop.availableRoomsCount = prop.rooms.filter((r) => r.status === 'AVAILABLE').length;

    if (prevStatus !== status) {
      eventService.emitRoomAvailabilityChanged({
        propertyId,
        propertyName: prop.name,
        roomNo,
        previousStatus: prevStatus,
        newStatus: status,
        ownerId: prop.ownerId,
        timestamp: new Date().toISOString(),
      });
    }

    try {
      const stored = this.getStorage('inveni_room_overrides');
      const overrides: Record<string, Record<string, RoomStatus>> = stored ? JSON.parse(stored) : {};
      if (!overrides[propertyId]) overrides[propertyId] = {};
      overrides[propertyId][roomNo] = status;
      this.setStorage('inveni_room_overrides', JSON.stringify(overrides));
      this.saveCustomProperties();
    } catch (e) {
      // ignore
    }
    return true;
  }

  /**
   * Get real-time status of a specific room unit
   */
  public getRoomAvailability(propertyId: string, roomNo: string): RoomStatus | null {
    const prop = this.properties.find((p) => p.id === propertyId);
    if (!prop) return null;
    const room = prop.rooms.find((r) => r.roomNo === roomNo);
    return room ? room.status : null;
  }

  /**
   * Get all properties
   */
  public getAllProperties(): PropertyListing[] {
    return this.properties;
  }

  /**
   * Get single property by ID
   */
  public getPropertyById(id: string): PropertyListing | undefined {
    return this.properties.find((p) => p.id === id);
  }

  /**
   * Calculate deterministic match score for prototype
   */
  public calculateMatchScore(property: PropertyListing, filters: SearchFilters): MatchResult {
    let score = 100;
    const reasons: string[] = [];
    const caveats: string[] = [];

    // 1. Budget check
    if (filters.maxBudget > 0) {
      if (property.startingRent <= filters.maxBudget) {
        reasons.push(`Rent ₹${property.startingRent.toLocaleString()} is within your ₹${filters.maxBudget.toLocaleString()} limit`);
      } else {
        const diff = property.startingRent - filters.maxBudget;
        score -= Math.min(25, Math.round((diff / filters.maxBudget) * 50));
        caveats.push(`₹${diff} above target budget cap`);
      }
    }

    // 2. Room Type check
    if (filters.roomType !== 'All') {
      const hasType = property.rooms.some(
        (r) => r.type.toLowerCase() === filters.roomType.toLowerCase() && r.status === 'AVAILABLE'
      );
      if (hasType) {
        reasons.push(`${filters.roomType} room vacant and ready for immediate move-in`);
      } else {
        score -= 20;
        caveats.push(`Preferred ${filters.roomType} room not currently vacant`);
      }
    }

    // 3. Amenities checks
    if (filters.amenities.includes('food')) {
      const hasFood = property.facilities.some((f) => f.category === 'food' && f.included);
      if (hasFood) {
        reasons.push('Homestyle Andhra meals included in rent');
      } else {
        score -= 15;
        caveats.push('Mess meals not included in base rent');
      }
    }

    if (filters.amenities.includes('wifi')) {
      const hasWifi = property.facilities.some((f) => f.category === 'connectivity' && f.included);
      if (hasWifi) {
        reasons.push('High-speed Wi-Fi broadband with backup power');
      } else {
        score -= 10;
        caveats.push('Wi-Fi not included');
      }
    }

    if (filters.amenities.includes('attachedBath')) {
      const hasBath = property.rooms.some((r) => r.attachedBath && r.status === 'AVAILABLE');
      if (hasBath) {
        reasons.push('Private attached western toilet available');
      } else {
        score -= 10;
      }
    }

    // 4. Proximity / Location
    if (property.distanceMeters <= 1000) {
      reasons.push(`Very close to campus: ${property.distanceToCollege}`);
    } else if (property.distanceMeters > 3000) {
      score -= 10;
      caveats.push(`${property.distanceToCollege}`);
    }

    // 5. Availability bonus/penalty
    if (property.availableRoomsCount === 0) {
      score -= 25;
      caveats.push('Currently fully occupied (Waitlist only)');
    } else {
      reasons.push(`${property.availableRoomsCount} units available right now`);
    }

    const finalScore = Math.max(35, Math.min(99, score));
    return {
      score: finalScore,
      reasons,
      caveats: caveats.length > 0 ? caveats : undefined,
    };
  }

  /**
   * Ensure properties exist for any searched global destination or city
   */
  public ensurePropertiesForDestination(dest: string): void {
    const query = dest.trim().toLowerCase();
    if (!query || query === 'all') return;

    const exists = this.properties.some(
      (p) =>
        p.town.toLowerCase().includes(query) ||
        p.district.toLowerCase().includes(query) ||
        p.name.toLowerCase().includes(query)
    );

    if (exists) return;

    const formattedCity = query
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    const geo = GLOBAL_CITY_COORDINATES[query] || {
      lat: 15.5 + (query.length % 7) * 2.5,
      lng: 78.3 + (query.length % 9) * 3.1,
      country: 'Global Destination',
    };

    const newProps: PropertyListing[] = [
      {
        id: `global_${query.replace(/[^a-z0-9]+/g, '_')}_residency`,
        name: `${formattedCity} Premier Student & Executive PG`,
        propertyType: 'PG',
        gender: 'Co-ed',
        town: formattedCity,
        district: formattedCity,
        state: geo.country,
        address: `Central City Corridor, Downtown ${formattedCity}`,
        distanceToCollege: '450m (5 min walk)',
        distanceMeters: 450,
        startingRent: 5800,
        securityDeposit: 2500,
        verifiedStatus: true,
        verificationBadge: `Verified Global Partner • ${formattedCity} Central`,
        ownerName: `${formattedCity} Stay Management`,
        ownerSinceYear: 2024,
        ownerContactMasked: '+91 98480 •••••',
        ownerResponseTime: 'Typically responds within 8 minutes',
        totalRooms: 8,
        availableRoomsCount: 3,
        coordinates: { lat: geo.lat, lng: geo.lng },
        streetViewUrl: `https://maps.google.com/maps?q=${geo.lat},${geo.lng}&t=k&z=19&output=embed`,
        overview: `Modern relocation-ready residence in ${formattedCity}. Features remote room inspection, 150 Mbps Wi-Fi, optional homestyle food plans, and live Google Maps Street View reconnaissance.`,
        heroImage: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80',
        images: [
          'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80',
        ],
        facilities: [
          {
            id: 'f_wifi',
            name: '150 Mbps Fiber Wi-Fi',
            category: 'connectivity',
            description: 'Dedicated high-speed connectivity throughout the premises.',
            included: true,
            highlight: '150 Mbps Fast SLA',
          },
          {
            id: 'f_food',
            name: 'Homestyle Mess Meals',
            category: 'food',
            description: 'Breakfast, lunch, and dinner plans available.',
            included: true,
            highlight: 'Daily Fresh Meals',
          },
          {
            id: 'f_power',
            name: '24x7 Power Backup',
            category: 'utility',
            description: 'Inverter power for uninterrupted lighting and Wi-Fi.',
            included: true,
          },
        ],
        rooms: [
          {
            roomNo: '101',
            floor: 1,
            type: 'Single',
            rent: 5800,
            deposit: 2500,
            status: 'AVAILABLE',
            attachedBath: true,
            hasBalcony: true,
            dimensions: '14ft x 11ft',
            lastUpdatedMinutesAgo: 3,
            furnishings: ['Study Desk', 'Ergonomic Chair', 'Mattress & Bed', 'Wardrobe'],
            windowOrientation: 'South-facing natural light',
          },
          {
            roomNo: '102',
            floor: 1,
            type: 'Double',
            rent: 4500,
            deposit: 2000,
            status: 'AVAILABLE',
            attachedBath: true,
            hasBalcony: false,
            dimensions: '16ft x 12ft',
            lastUpdatedMinutesAgo: 6,
            furnishings: ['2 Twin Beds', '2 Desks', 'Spacious Wardrobe'],
            windowOrientation: 'East-facing',
          },
          {
            roomNo: '201',
            floor: 2,
            type: 'Single',
            rent: 6200,
            deposit: 2500,
            status: 'AVAILABLE',
            attachedBath: true,
            hasBalcony: true,
            dimensions: '15ft x 12ft',
            lastUpdatedMinutesAgo: 1,
            furnishings: ['Executive Desk', 'Air Conditioning', 'King Single Bed'],
            windowOrientation: 'Panoramic view',
          },
        ],
        rating: 4.8,
        reviewsCount: 16,
        featured: true,
      },
      {
        id: `global_${query.replace(/[^a-z0-9]+/g, '_')}_hostel_2`,
        name: `${formattedCity} Central Co-Living & Hostels`,
        propertyType: 'Hostel',
        gender: 'Co-ed',
        town: formattedCity,
        district: formattedCity,
        state: geo.country,
        address: `Transit Square, West End, ${formattedCity}`,
        distanceToCollege: '800m (10 min walk)',
        distanceMeters: 800,
        startingRent: 4200,
        securityDeposit: 1500,
        verifiedStatus: true,
        verificationBadge: `Verified Host • ${formattedCity} Transit Hub`,
        ownerName: 'Apex Living Ltd',
        ownerSinceYear: 2023,
        ownerContactMasked: '+91 98480 •••••',
        ownerResponseTime: 'Typically responds within 15 minutes',
        totalRooms: 10,
        availableRoomsCount: 4,
        coordinates: { lat: geo.lat + 0.005, lng: geo.lng + 0.005 },
        streetViewUrl: `https://maps.google.com/maps?q=${geo.lat + 0.005},${geo.lng + 0.005}&t=k&z=19&output=embed`,
        overview: `Budget-friendly and high-comfort living space in ${formattedCity}. Ideal for relocating students and young professionals.`,
        heroImage: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
        images: [
          'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80',
        ],
        facilities: [
          {
            id: 'f_wifi',
            name: '100 Mbps Wi-Fi',
            category: 'connectivity',
            description: 'Fiber internet connection.',
            included: true,
          },
          {
            id: 'f_security',
            name: 'CCTV & Biometric Access',
            category: 'security',
            description: '24/7 security surveillance.',
            included: true,
          },
        ],
        rooms: [
          {
            roomNo: 'A1',
            floor: 1,
            type: 'Single',
            rent: 4800,
            deposit: 1500,
            status: 'AVAILABLE',
            attachedBath: true,
            dimensions: '12ft x 10ft',
            lastUpdatedMinutesAgo: 8,
          },
          {
            roomNo: 'A2',
            floor: 1,
            type: 'Double',
            rent: 4200,
            deposit: 1500,
            status: 'AVAILABLE',
            attachedBath: false,
            dimensions: '15ft x 11ft',
            lastUpdatedMinutesAgo: 12,
          },
        ],
        rating: 4.6,
        reviewsCount: 9,
      },
    ];

    this.properties.push(...newProps);
  }

  /**
   * Search and filter properties deterministically
   */
  public searchAndFilterProperties(
    filters: SearchFilters,
    sort: SortOption = 'recommended'
  ): {
    availableNow: PropertyListing[];
    strongMatches: PropertyListing[];
    otherOptions: PropertyListing[];
    totalMatchingCount: number;
    totalAvailableRooms: number;
  } {
    const destQuery = filters.destination.trim().toLowerCase();

    // Dynamically guarantee properties for any destination worldwide
    if (destQuery && destQuery !== 'all') {
      this.ensurePropertiesForDestination(destQuery);
    }

    // Filter properties
    let results = this.properties.filter((p) => {
      // Section 15: Only ACTIVE properties enter public discovery system
      if (p.status && p.status !== 'ACTIVE') {
        return false;
      }

      // Destination filter (match town, address, or state)
      if (destQuery && destQuery !== 'all') {
        const matchesTown =
          p.town.toLowerCase().includes(destQuery) ||
          p.district.toLowerCase().includes(destQuery) ||
          p.address.toLowerCase().includes(destQuery) ||
          p.name.toLowerCase().includes(destQuery);
        if (!matchesTown) return false;
      }

      // Property Type filter
      if (filters.propertyType !== 'All' && p.propertyType !== filters.propertyType) {
        return false;
      }

      // Gender filter
      if (filters.gender !== 'All' && p.gender !== filters.gender && p.gender !== 'Co-ed') {
        return false;
      }

      // Budget filter (starting rent must be <= maxBudget if specified)
      if (filters.maxBudget > 0 && p.startingRent > filters.maxBudget + 1000) {
        return false; // allow slight tolerance for "strong match" display
      }

      if (filters.minBudget > 0 && p.startingRent < filters.minBudget) {
        return false;
      }

      // Room Type filter
      if (filters.roomType !== 'All') {
        const hasRoomType = p.rooms.some((r) => r.type === filters.roomType);
        if (!hasRoomType) return false;
      }

      // Only Available filter
      if (filters.onlyAvailable && p.availableRoomsCount === 0) {
        return false;
      }

      // Verified only
      if (filters.verifiedOnly && !p.verifiedStatus) {
        return false;
      }

      // Amenities filter
      for (const amenity of filters.amenities) {
        if (amenity === 'food') {
          const hasFood = p.facilities.some((f) => f.category === 'food' && f.included);
          if (!hasFood) return false;
        }
        if (amenity === 'wifi') {
          const hasWifi = p.facilities.some((f) => f.category === 'connectivity' && f.included);
          if (!hasWifi) return false;
        }
        if (amenity === 'attachedBath') {
          const hasBath = p.rooms.some((r) => r.attachedBath);
          if (!hasBath) return false;
        }
        if (amenity === 'ac') {
          const hasAC = p.facilities.some((f) => f.name.toLowerCase().includes('air conditioning') || f.name.includes('AC'));
          if (!hasAC) return false;
        }
      }

      return true;
    });

    // Attach match score to every result
    results = results.map((p) => ({
      ...p,
      matchResult: this.calculateMatchScore(p, filters),
    }));

    // Sort results
    results.sort((a, b) => {
      switch (sort) {
        case 'recommended':
          return (b.matchResult?.score || 0) - (a.matchResult?.score || 0);
        case 'availability':
          return b.availableRoomsCount - a.availableRoomsCount;
        case 'price-low':
          return a.startingRent - b.startingRent;
        case 'price-high':
          return b.startingRent - a.startingRent;
        case 'distance':
          return a.distanceMeters - b.distanceMeters;
        default:
          return (b.matchResult?.score || 0) - (a.matchResult?.score || 0);
      }
    });

    // Partition into categories for progressive disclosure:
    // 1. Available Now: availableRoomsCount > 0 && within budget
    // 2. Strong Matches: high match score (>= 75) but maybe 0 or 1 room left
    // 3. Other Options: the rest
    const availableNow = results.filter(
      (p) => p.availableRoomsCount > 0 && (!filters.maxBudget || p.startingRent <= filters.maxBudget)
    );

    const availableIds = new Set(availableNow.map((p) => p.id));

    const strongMatches = results.filter(
      (p) => !availableIds.has(p.id) && (p.matchResult?.score || 0) >= 70
    );

    const strongIds = new Set(strongMatches.map((p) => p.id));

    const otherOptions = results.filter(
      (p) => !availableIds.has(p.id) && !strongIds.has(p.id)
    );

    const totalAvailableRooms = results.reduce((sum, p) => sum + p.availableRoomsCount, 0);

    return {
      availableNow,
      strongMatches,
      otherOptions,
      totalMatchingCount: results.length,
      totalAvailableRooms,
    };
  }

  // ============================================================================
  // PHASE 7: OWNER MANAGEMENT, INVENTORY & AVAILABILITY METHODS
  // ============================================================================

  /**
   * Calculate listing completeness percentage and identify missing elements (Section 17 & 39)
   */
  public calculateListingCompleteness(property: PropertyListing): { score: number; missing: string[] } {
    let score = 0;
    const missing: string[] = [];

    // 1. Property Name & Basic Type (15%)
    if (property.name && property.name.trim().length >= 3) {
      score += 15;
    } else {
      missing.push('Property name (at least 3 characters)');
    }

    // 2. Location & Address (20%)
    if (property.town && property.address && property.address.trim().length >= 10) {
      score += 20;
    } else {
      missing.push('Complete street address & locality details');
    }

    // 3. Property Description/Overview (10%)
    if (property.overview && property.overview.trim().length >= 25) {
      score += 10;
    } else {
      missing.push('Property overview & house rules');
    }

    // 4. Amenities & Facilities (15%)
    if (property.facilities && property.facilities.length >= 3) {
      score += 15;
    } else {
      missing.push('At least 3 property amenities (Wi-Fi, Water, Security)');
    }

    // 5. Room Inventory (20%)
    if (property.rooms && property.rooms.length > 0) {
      score += 20;
    } else {
      missing.push('Room inventory (add at least 1 room)');
    }

    // 6. Media / Photos (20%)
    if (property.images && property.images.length >= 1 && (property.media?.length || 0) >= 1) {
      score += 20;
    } else if (property.images && property.images.length >= 1) {
      score += 10;
      missing.push('Room & bathroom category photos');
    } else {
      missing.push('Property exterior & room photographs');
    }

    return { score: Math.min(100, score), missing };
  }

  /**
   * Get all properties owned by an authenticated owner (Section 8 & 30)
   */
  public getPropertiesByOwner(ownerId: string): PropertyListing[] {
    const ownerProps = this.properties.filter((p) => p.ownerId === ownerId);

    // Compute completeness score for each
    return ownerProps.map((p) => {
      const completeness = this.calculateListingCompleteness(p);
      return {
        ...p,
        listingCompletenessScore: completeness.score,
        missingRequirements: completeness.missing,
      };
    });
  }

  /**
   * Summary card metrics for Owner Dashboard (Section 6)
   */
  public getOwnerDashboardMetrics(ownerId: string, pendingReservationsCount = 0): OwnerDashboardMetrics {
    const ownerProps = this.properties.filter((p) => p.ownerId === ownerId);
    const activeProperties = ownerProps.filter((p) => p.status === 'ACTIVE').length;
    const totalRooms = ownerProps.reduce((sum, p) => sum + p.rooms.length, 0);
    const availableRooms = ownerProps.reduce(
      (sum, p) => sum + p.rooms.filter((r) => r.status === 'AVAILABLE').length,
      0
    );

    return {
      activeProperties,
      totalRooms,
      availableRooms,
      pendingReservations: pendingReservationsCount,
    };
  }

  /**
   * Create a new property listing as Draft (Section 9, 15, 16)
   */
  public createOwnerProperty(
    ownerId: string,
    input: CreatePropertyInput,
    initialStatus: PropertyStatus = 'DRAFT'
  ): PropertyListing {
    const propertyId = `prop_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const facilities: Facility[] = [];
    if (input.hasWifi) {
      facilities.push({
        id: `fac_wifi_${Date.now()}`,
        name: 'High-Speed Wi-Fi Broadband',
        category: 'connectivity',
        description: 'Commercial broadband connection with inverter backup',
        included: true,
        highlight: 'Wi-Fi Included',
      });
    }
    if (input.hasFood) {
      facilities.push({
        id: `fac_food_${Date.now()}`,
        name: 'Daily Homestyle Mess Meals',
        category: 'food',
        description: 'Fresh Andhra breakfast, lunch, and dinner prepared on-site',
        included: true,
        highlight: 'Meals Included',
      });
    }
    if (input.hasParking) {
      facilities.push({
        id: `fac_park_${Date.now()}`,
        name: 'Secure Two-Wheeler Parking',
        category: 'utility',
        description: 'Gated covered parking with nighttime lighting',
        included: true,
      });
    }
    if (input.hasAc) {
      facilities.push({
        id: `fac_ac_${Date.now()}`,
        name: 'Air Conditioning (Split AC)',
        category: 'utility',
        description: 'Efficient split AC units installed in specified rooms',
        included: true,
      });
    }

    // Default facilities from amenities tags
    input.amenities.forEach((amenity, idx) => {
      if (!facilities.some((f) => f.name.toLowerCase().includes(amenity.toLowerCase()))) {
        facilities.push({
          id: `fac_custom_${idx}_${Date.now()}`,
          name: amenity,
          category: 'utility',
          description: `${amenity} provided for residents`,
          included: true,
        });
      }
    });

    const newProperty: PropertyListing = {
      id: propertyId,
      name: input.name,
      propertyType: input.propertyType,
      gender: input.gender,
      town: input.town,
      district: input.district,
      state: input.state || 'Andhra Pradesh',
      address: input.address,
      distanceToCollege: '750m (~9 min walk)',
      distanceMeters: 750,
      startingRent: input.startingRent || 5000,
      securityDeposit: input.securityDeposit || 2000,
      verifiedStatus: false,
      verificationBadge: 'Pending On-Site Verification',
      ownerName: 'Owner Account',
      ownerSinceYear: new Date().getFullYear(),
      ownerContactMasked: '+91 ••••• •••••',
      ownerResponseTime: 'Typically responds within 1 hour',
      totalRooms: 0,
      availableRoomsCount: 0,
      facilities,
      rooms: [],
      images: input.images && input.images.length > 0 ? input.images : ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80'],
      heroImage: input.images && input.images.length > 0 ? input.images[0] : 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80',
      media: input.media || [],
      rating: 4.8,
      reviewsCount: 1,
      overview: input.overview || `Convenient and secure ${input.propertyType} stay in ${input.town}.`,
      coordinates: GLOBAL_CITY_COORDINATES[input.town.toLowerCase()] || { lat: 15.5185, lng: 78.3492, country: 'India' },
      streetViewUrl: `https://maps.google.com/maps?q=${GLOBAL_CITY_COORDINATES[input.town.toLowerCase()]?.lat || 15.5185},${GLOBAL_CITY_COORDINATES[input.town.toLowerCase()]?.lng || 78.3492}&t=k&z=19&output=embed`,
      ownerId,
      status: initialStatus,
      isCustomCreated: true,
      rules: [
        'Gate closes at 10:30 PM; prior intimation required for exam study.',
        'Smoking and prohibited substances strictly forbidden.',
        'Maintain clean room environment and switch off utilities when away.',
      ],
    };

    const completeness = this.calculateListingCompleteness(newProperty);
    newProperty.listingCompletenessScore = completeness.score;
    newProperty.missingRequirements = completeness.missing;

    this.properties.unshift(newProperty);
    this.saveCustomProperties();
    return newProperty;
  }

  /**
   * Update property information with server-side authorization check (Section 13, 30, 50)
   */
  public updateProperty(
    ownerId: string,
    propertyId: string,
    updates: Partial<PropertyListing>
  ): { success: boolean; property?: PropertyListing; error?: string } {
    const prop = this.properties.find((p) => p.id === propertyId);
    if (!prop) {
      return { success: false, error: 'Property not found.' };
    }

    // Server-Side Authorization Check (Section 30, 50): Owner A cannot modify Owner B's property
    if (prop.ownerId && prop.ownerId !== ownerId) {
      return { success: false, error: 'Authorization denied: You do not have ownership of this property.' };
    }

    // Apply allowed updates
    if (updates.name) prop.name = updates.name;
    if (updates.propertyType) prop.propertyType = updates.propertyType;
    if (updates.gender) prop.gender = updates.gender;
    if (updates.town) prop.town = updates.town;
    if (updates.district) prop.district = updates.district;
    if (updates.address) prop.address = updates.address;
    if (updates.overview) prop.overview = updates.overview;
    if (updates.facilities) prop.facilities = updates.facilities;
    if (updates.images) {
      prop.images = updates.images;
      if (updates.images.length > 0) prop.heroImage = updates.images[0];
    }
    if (updates.media) prop.media = updates.media;
    if (updates.curfewTime) prop.curfewTime = updates.curfewTime;
    if (updates.foodSchedule) prop.foodSchedule = updates.foodSchedule;
    if (updates.isPromoted !== undefined) prop.isPromoted = updates.isPromoted;

    const completeness = this.calculateListingCompleteness(prop);
    prop.listingCompletenessScore = completeness.score;
    prop.missingRequirements = completeness.missing;

    this.saveCustomProperties();
    return { success: true, property: prop };
  }

  /**
   * Publish property: checks publish readiness checklist (Section 16, 59)
   */
  public publishProperty(
    ownerId: string,
    propertyId: string
  ): { success: boolean; property?: PropertyListing; error?: string } {
    const prop = this.properties.find((p) => p.id === propertyId);
    if (!prop) return { success: false, error: 'Property not found.' };

    if (prop.ownerId && prop.ownerId !== ownerId) {
      return { success: false, error: 'Authorization denied: You do not have ownership of this property.' };
    }

    // Publish Checklist validation
    if (!prop.name || prop.name.trim().length < 3) {
      return { success: false, error: 'Property name is required before publishing.' };
    }
    if (!prop.town || !prop.address) {
      return { success: false, error: 'Complete location and address are required before publishing.' };
    }
    if (!prop.rooms || prop.rooms.length === 0) {
      return { success: false, error: 'At least one room must be configured before publishing.' };
    }

    prop.status = 'ACTIVE';
    this.saveCustomProperties();
    eventService.emitPropertyPublished({
      propertyId: prop.id,
      propertyName: prop.name,
      ownerId: prop.ownerId || ownerId,
      town: prop.town,
      roomCount: prop.rooms.length,
      timestamp: new Date().toISOString(),
    });
    return { success: true, property: prop };
  }

  /**
   * Archive property (Section 15, 58)
   */
  public archiveProperty(ownerId: string, propertyId: string): { success: boolean; error?: string } {
    const prop = this.properties.find((p) => p.id === propertyId);
    if (!prop) return { success: false, error: 'Property not found.' };

    if (prop.ownerId && prop.ownerId !== ownerId) {
      return { success: false, error: 'Authorization denied: You do not have ownership of this property.' };
    }

    prop.status = 'ARCHIVED';
    this.saveCustomProperties();
    return { success: true };
  }

  /**
   * Add a room to property inventory (Section 18, 19, 20)
   */
  public addRoom(
    ownerId: string,
    propertyId: string,
    roomInput: CreateRoomInput
  ): { success: boolean; room?: RoomUnit; error?: string } {
    const prop = this.properties.find((p) => p.id === propertyId);
    if (!prop) return { success: false, error: 'Property not found.' };

    if (prop.ownerId && prop.ownerId !== ownerId) {
      return { success: false, error: 'Authorization denied: You do not have ownership of this property.' };
    }

    // Validate roomNo uniqueness
    const exists = prop.rooms.some((r) => r.roomNo.toLowerCase() === roomInput.roomNo.trim().toLowerCase());
    if (exists) {
      return { success: false, error: `Room number ${roomInput.roomNo} already exists in this property.` };
    }

    if (roomInput.rent <= 0) {
      return { success: false, error: 'Monthly rent must be a positive number.' };
    }

    const newRoom: RoomUnit = {
      roomNo: roomInput.roomNo.trim(),
      floor: roomInput.floor,
      type: roomInput.type,
      rent: Number(roomInput.rent),
      deposit: Number(roomInput.deposit || prop.securityDeposit || 2000),
      status: roomInput.status,
      attachedBath: roomInput.attachedBath,
      hasBalcony: roomInput.hasBalcony || false,
      dimensions: '14ft x 11ft',
      lastUpdatedMinutesAgo: 0,
      lastUpdatedAt: new Date().toISOString(),
      furnishings: roomInput.furnishings || ['Bed Frame & Mattress', 'Study Desk & Chair', 'Wardrobe'],
      mediaIds: roomInput.mediaIds || [],
    };

    prop.rooms.push(newRoom);
    prop.totalRooms = prop.rooms.length;
    prop.availableRoomsCount = prop.rooms.filter((r) => r.status === 'AVAILABLE').length;
    prop.startingRent = Math.min(...prop.rooms.map((r) => r.rent));

    const completeness = this.calculateListingCompleteness(prop);
    prop.listingCompletenessScore = completeness.score;
    prop.missingRequirements = completeness.missing;

    this.saveCustomProperties();
    return { success: true, room: newRoom };
  }

  /**
   * Update room details and price (Section 18, 21, 22)
   * Availability and price changes immediately reflect in Renter and AI search (Single Source of Truth)
   */
  public updateRoom(
    ownerId: string,
    propertyId: string,
    roomNo: string,
    updates: Partial<RoomUnit>
  ): { success: boolean; room?: RoomUnit; error?: string } {
    const prop = this.properties.find((p) => p.id === propertyId);
    if (!prop) return { success: false, error: 'Property not found.' };

    if (prop.ownerId && prop.ownerId !== ownerId) {
      return { success: false, error: 'Authorization denied: You do not have ownership of this property.' };
    }

    const room = prop.rooms.find((r) => r.roomNo === roomNo);
    if (!room) return { success: false, error: `Room ${roomNo} not found.` };

    if (updates.rent !== undefined) {
      if (updates.rent <= 0) return { success: false, error: 'Monthly rent must be positive.' };
      room.rent = Number(updates.rent);
    }
    if (updates.deposit !== undefined) room.deposit = Number(updates.deposit);
    if (updates.status !== undefined) room.status = updates.status;
    if (updates.type !== undefined) room.type = updates.type;
    if (updates.floor !== undefined) room.floor = updates.floor;
    if (updates.attachedBath !== undefined) room.attachedBath = updates.attachedBath;
    if (updates.hasBalcony !== undefined) room.hasBalcony = updates.hasBalcony;
    if (updates.furnishings !== undefined) room.furnishings = updates.furnishings;

    room.lastUpdatedAt = new Date().toISOString();
    room.lastUpdatedMinutesAgo = 0;

    // Recalculate property-level availability and starting rent
    prop.availableRoomsCount = prop.rooms.filter((r) => r.status === 'AVAILABLE').length;
    if (prop.rooms.length > 0) {
      prop.startingRent = Math.min(...prop.rooms.map((r) => r.rent));
    }

    this.saveCustomProperties();
    return { success: true, room };
  }

  /**
   * Delete room from property inventory (Section 18)
   */
  public deleteRoom(
    ownerId: string,
    propertyId: string,
    roomNo: string
  ): { success: boolean; error?: string } {
    const prop = this.properties.find((p) => p.id === propertyId);
    if (!prop) return { success: false, error: 'Property not found.' };

    if (prop.ownerId && prop.ownerId !== ownerId) {
      return { success: false, error: 'Authorization denied: You do not have ownership of this property.' };
    }

    const initialCount = prop.rooms.length;
    prop.rooms = prop.rooms.filter((r) => r.roomNo !== roomNo);
    if (prop.rooms.length === initialCount) {
      return { success: false, error: `Room ${roomNo} not found.` };
    }

    prop.totalRooms = prop.rooms.length;
    prop.availableRoomsCount = prop.rooms.filter((r) => r.status === 'AVAILABLE').length;
    if (prop.rooms.length > 0) {
      prop.startingRent = Math.min(...prop.rooms.map((r) => r.rent));
    }

    this.saveCustomProperties();
    return { success: true };
  }
}

export const propertyService = new PropertyService();
