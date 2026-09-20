export type RoomStatus = 'AVAILABLE' | 'AVAILABLE_SOON' | 'OCCUPIED' | 'RESERVED' | 'MAINTENANCE';
export type PropertyStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'ARCHIVED';

export type PropertyType = 'All' | 'PG' | 'Room' | 'Hostel';
export type RoomTypePreference = 'All' | 'Single' | 'Double' | 'Triple' | 'Shared';
export type StayDuration = 'any' | '1-month' | '3-months' | '6-months' | '1-year';
export type SortOption = 'recommended' | 'availability' | 'price-low' | 'price-high' | 'distance';

export interface RoomUnit {
  roomNo: string;
  floor: number;
  type: 'Single' | 'Double' | 'Triple' | 'Shared';
  rent: number;
  deposit: number;
  status: RoomStatus;
  attachedBath: boolean;
  hasBalcony?: boolean;
  dimensions?: string;
  lastUpdatedMinutesAgo: number;
  lastUpdatedAt?: string;
  furnishings?: string[];
  windowOrientation?: string;
  mediaIds?: string[];
}

export interface Facility {
  id: string;
  name: string;
  category: 'food' | 'connectivity' | 'utility' | 'security';
  description: string;
  included: boolean;
  highlight?: string;
}

export interface MatchReason {
  label: string;
  positive: boolean;
}

export interface MatchResult {
  score: number;
  reasons: string[];
  caveats?: string[];
}

export interface PropertyMedia {
  id: string;
  propertyId: string;
  roomId?: string;
  type: 'image' | 'video' | 'panorama' | 'floorplan';
  url: string;
  thumbnail?: string;
  title: string;
  description: string;
  tag: 'exterior' | 'corridor' | 'room' | 'mess' | 'bathroom' | 'study';
  order: number;
}

export interface FloorRoomPosition {
  roomNo: string;
  x: number; // percent from left (0-100)
  y: number; // percent from top (0-100)
  w: number; // width percent
  h: number; // height percent
  label: string;
}

export interface FloorCommonSpace {
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  type: 'mess' | 'stairs' | 'corridor' | 'washroom' | 'lounge' | 'balcony';
}

export interface FloorPlanData {
  floorNumber: number;
  floorName: string;
  totalRooms: number;
  vacantRooms: number;
  rooms: FloorRoomPosition[];
  commonSpaces: FloorCommonSpace[];
}

export interface DailyMealMenu {
  day: string;
  breakfast: string[];
  lunch: string[];
  dinner: string[];
  special?: string;
}

export interface NeighborhoodLandmark {
  name: string;
  category: 'college' | 'transit' | 'hospital' | 'market' | 'industry';
  distance: string;
  walkingMinutes: number;
}

export interface PropertyListing {
  id: string;
  name: string;
  propertyType: 'PG' | 'Room' | 'Hostel';
  gender: 'Boys' | 'Girls' | 'Co-ed';
  town: string;
  district: string;
  state: string;
  address: string;
  distanceToCollege: string;
  distanceMeters: number;
  startingRent: number;
  securityDeposit: number;
  verifiedStatus: boolean;
  verificationBadge: string;
  ownerName: string;
  ownerSinceYear: number;
  ownerContactMasked: string;
  ownerResponseTime: string;
  totalRooms: number;
  availableRoomsCount: number;
  facilities: Facility[];
  rooms: RoomUnit[];
  images: string[];
  heroImage: string;
  curfewTime?: string;
  foodSchedule?: string;
  rating: number;
  reviewsCount: number;
  featured?: boolean;
  coordinates: {
    lat: number;
    lng: number;
  };
  overview: string;
  streetViewUrl?: string;
  isCustomCreated?: boolean;
  ownerId?: string;
  status?: PropertyStatus;
  isPromoted?: boolean;
  listingCompletenessScore?: number;
  missingRequirements?: string[];
  matchResult?: MatchResult;
  media?: PropertyMedia[];
  floorPlans?: FloorPlanData[];
  messMenu?: DailyMealMenu[];
  neighborhoodLandmarks?: NeighborhoodLandmark[];
  rules?: string[];
}

export interface SearchFilters {
  destination: string;
  origin: string;
  propertyType: PropertyType;
  roomType: RoomTypePreference;
  minBudget: number;
  maxBudget: number;
  amenities: string[];
  duration: StayDuration;
  onlyAvailable: boolean;
  verifiedOnly: boolean;
  gender: 'All' | 'Boys' | 'Girls' | 'Co-ed';
  naturalLanguageQuery?: string;
}

export interface RelocationFilterState {
  destination: string;
  origin: string;
  arrivalDate: string;
  userType: 'Student' | 'Working Professional' | 'Job Seeker' | 'All';
  budgetMax: number;
  roomPreference: 'Any' | 'Single' | 'Double';
  foodRequired: boolean;
  wifiRequired: boolean;
}

// ==========================================
// PHASE 4: RESERVATION & MOVE-IN DATA MODELS
// ==========================================

export type ReservationStatus = 'REQUESTED' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

export type FoodPlanOption = 'included' | 'full-mess' | 'breakfast-dinner' | 'no-food';

export interface ReservationAddon {
  id: string;
  name: string;
  monthlyPrice: number;
  description: string;
  icon?: string;
}

export interface RenterProfile {
  fullName: string;
  phone: string;
  email: string;
  currentLocation: string;
  occupation: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

export interface ReservationPricing {
  roomRent: number;
  foodCost: number;
  addonCost: number;
  deposit: number;
  monthlyTotal: number;
  initialTotal: number;
}

export interface Reservation {
  id: string;
  propertyId: string;
  propertyName: string;
  propertyTown: string;
  propertyAddress: string;
  propertyHeroImage?: string;
  roomId: string;
  roomNo: string;
  roomType: string;
  roomFloor: number;
  moveInDate: string;
  durationMonths: number;
  durationLabel: string;
  foodPlan: FoodPlanOption;
  foodPlanLabel: string;
  selectedAddons: ReservationAddon[];
  renter: RenterProfile;
  pricing: ReservationPricing;
  status: ReservationStatus;
  createdAt: string;
  cancellationReason?: string;
}

// ==========================================
// PHASE 5: AI-POWERED RELOCATION ASSISTANT & MATCHING
// ==========================================

export interface UserRequirements {
  destination: string | null;
  propertyType: 'PG' | 'Room' | 'Hostel' | null;
  roomType: 'Single' | 'Double' | 'Triple' | null;
  occupancy?: number | null;
  maxBudget: number | null;
  minBudget: number | null;
  food: boolean | 'preferred' | null;
  wifi: boolean | 'preferred' | null;
  attachedBathroom: boolean | 'preferred' | null;
  ac: boolean | 'preferred' | null;
  parking: boolean | 'preferred' | null;
  moveInDate: string | null;
  duration: string | null;
  distancePreference: string | null;
  availability: 'AVAILABLE' | 'AVAILABLE_SOON' | 'ANY' | null;
  userType?: 'Student' | 'Working Professional' | null;
  rawQuery: string;
  hardPreferences: string[];
  softPreferences: string[];
}

export interface AIMatchFeature {
  label: string;
  satisfied: boolean;
  isHardRequirement: boolean;
  detail: string;
}

export interface AIRoomMatch {
  property: PropertyListing;
  room: RoomUnit;
  matchScore: number; // 0-100% Preference Match
  isExactMatch: boolean;
  matchedFeatures: AIMatchFeature[];
  unmatchedFeatures: AIMatchFeature[];
  explanationSummary: string;
  budgetDifference?: number;
  availabilityStatus: string;
}

export interface AIMatchingResponse {
  understoodRequirements: UserRequirements;
  exactMatches: AIRoomMatch[];
  closeMatches: AIRoomMatch[];
  totalMatches: number;
  missingHardRequirements?: string[];
  followUpQuestion?: {
    question: string;
    field: keyof UserRequirements;
    options: string[];
  };
  relaxationSuggestions?: {
    label: string;
    action: string;
    patch: Partial<UserRequirements>;
  }[];
  explanationMessage: string;
}

// ==========================================
// PHASE 6: AWS CLOUD BACKEND & COGNITO AUTHENTICATION
// ==========================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  currentLocation: string;
  occupation: string;
  isDemoUser: boolean;
  token?: string;
  role?: 'renter' | 'owner';
}

export interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  isLoading: boolean;
  isDemoMode: boolean;
}

export interface CreateReservationRequest {
  propertyId: string;
  roomId: string;
  moveInDate: string;
  durationMonths: number;
  durationLabel: string;
  foodPlan: FoodPlanOption;
  foodPlanLabel: string;
  selectedAddons: ReservationAddon[];
  renter: RenterProfile;
}

// ==========================================
// PHASE 7: OWNER PORTAL, PROPERTY & ROOM INVENTORY
// ==========================================

export interface OwnerProfile {
  ownerId: string;
  fullName: string;
  email: string;
  phone: string;
  accountStatus: 'ACTIVE' | 'PENDING_VERIFICATION' | 'RESTRICTED';
  verificationStatus: 'NOT_VERIFIED' | 'PENDING' | 'VERIFIED';
  propertiesCount: number;
  createdAt: string;
}

export interface OwnerDashboardMetrics {
  activeProperties: number;
  totalRooms: number;
  availableRooms: number;
  pendingReservations: number;
}

export interface CreatePropertyInput {
  name: string;
  propertyType: 'PG' | 'Room' | 'Hostel';
  gender: 'Boys' | 'Girls' | 'Co-ed';
  town: string;
  district: string;
  state?: string;
  address: string;
  overview: string;
  amenities: string[];
  hasFood: boolean;
  hasWifi: boolean;
  hasAc: boolean;
  hasParking: boolean;
  startingRent: number;
  securityDeposit: number;
  images?: string[];
  media?: PropertyMedia[];
}

export interface CreateRoomInput {
  roomNo: string;
  floor: number;
  type: 'Single' | 'Double' | 'Triple' | 'Shared';
  rent: number;
  deposit?: number;
  status: RoomStatus;
  attachedBath: boolean;
  hasBalcony?: boolean;
  furnishings?: string[];
  mediaIds?: string[];
  description?: string;
}

export interface OwnerPropertySummary {
  id: string;
  name: string;
  town: string;
  district: string;
  totalRooms: number;
  availableRooms: number;
  status: PropertyStatus;
  completenessScore: number;
  missingFields: string[];
  lastUpdatedAt: string;
  startingRent: number;
}

// ==========================================
// PHASE 8: EVENT ARCHITECTURE & NOTIFICATIONS
// ==========================================

export type DomainEventType =
  | 'PropertyPublished'
  | 'RoomAvailabilityChanged'
  | 'ReservationCreated'
  | 'ReservationConfirmed'
  | 'ReservationRejected'
  | 'ReservationCancelled'
  | 'ReservationCompleted';

export interface DomainEvent<T = any> {
  eventId: string;
  eventType: DomainEventType;
  eventVersion: string; // e.g. "1"
  timestamp: string;
  source: string; // "inveni.stay"
  payload: T;
}

export interface ReservationEventPayload {
  reservationId: string;
  propertyId: string;
  propertyName: string;
  roomId: string;
  roomNo: string;
  ownerId: string;
  renterId: string;
  renterName: string;
  moveInDate: string;
  status: ReservationStatus;
  reason?: string;
  timestamp: string;
}

export interface RoomAvailabilityEventPayload {
  propertyId: string;
  propertyName: string;
  roomNo: string;
  previousStatus: RoomStatus;
  newStatus: RoomStatus;
  ownerId?: string;
  timestamp: string;
}

export interface PropertyPublishedEventPayload {
  propertyId: string;
  propertyName: string;
  ownerId: string;
  town: string;
  roomCount: number;
  timestamp: string;
}

export type NotificationType =
  | 'RESERVATION_CREATED'
  | 'RESERVATION_CONFIRMED'
  | 'RESERVATION_REJECTED'
  | 'RESERVATION_CANCELLED'
  | 'ROOM_AVAILABILITY_CHANGED'
  | 'PROPERTY_PUBLISHED'
  | 'SYSTEM_ALERT';

export interface InAppNotification {
  id: string;
  userId: string; // Target recipient (renterId or ownerId)
  type: NotificationType;
  title: string;
  message: string;
  referenceId?: string; // reservationId or propertyId
  referenceType?: 'reservation' | 'property' | 'room';
  targetRoute?: string;
  read: boolean;
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface NotificationPreferences {
  reservationUpdates: boolean;
  propertyUpdates: boolean;
  promotionalNotifications: boolean;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title?: string;
  message: string;
  durationMs?: number;
}
