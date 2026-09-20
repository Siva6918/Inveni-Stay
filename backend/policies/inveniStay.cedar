// ==============================================================================
// INVENI STAY — ZERO TRUST AUTHORIZATION POLICIES (AWS CEDAR)
// Amazon Verified Permissions / Cedar Language Specification
// ==============================================================================

// 1. PUBLIC EXPLORATION POLICIES
// Anyone (unauthenticated or authenticated) can view published properties, rooms, and vacancies
permit (
    principal,
    action in [
        InveniStay::Action::"GetProperties",
        InveniStay::Action::"GetPropertyDetail",
        InveniStay::Action::"GetPropertyRooms",
        InveniStay::Action::"GetRoomAvailability"
    ],
    resource is InveniStay::Property
)
when {
    resource.status == "PUBLISHED"
};

// 2. RENTER RESERVATION POLICIES
// Authenticated renters can create reservations for available rooms
permit (
    principal in InveniStay::Role::"Renter",
    action == InveniStay::Action::"CreateReservation",
    resource is InveniStay::Room
)
when {
    resource.status == "AVAILABLE"
};

// Renters can only read, modify, or cancel their OWN reservations (User Data Isolation)
permit (
    principal in InveniStay::Role::"Renter",
    action in [
        InveniStay::Action::"GetReservationDetail",
        InveniStay::Action::"CancelReservation",
        InveniStay::Action::"ListReservations"
    ],
    resource is InveniStay::Reservation
)
when {
    resource.userId == principal.id
};

// Renters can only view and acknowledge their own notifications
permit (
    principal in InveniStay::Role::"Renter",
    action in [
        InveniStay::Action::"ListNotifications",
        InveniStay::Action::"MarkNotificationRead"
    ],
    resource is InveniStay::Notification
)
when {
    resource.recipientId == principal.id
};

// 3. PROPERTY OWNER POLICIES
// Property owners can only edit, publish, or add rooms to properties THEY OWN (Owner Isolation)
permit (
    principal in InveniStay::Role::"Owner",
    action in [
        InveniStay::Action::"UpdateProperty",
        InveniStay::Action::"PublishProperty",
        InveniStay::Action::"AddRoom",
        InveniStay::Action::"UpdateRoomAvailability",
        InveniStay::Action::"UploadMedia"
    ],
    resource is InveniStay::Property
)
when {
    resource.ownerId == principal.id
};

// Owners can accept or decline reservations made ONLY for their owned properties
permit (
    principal in InveniStay::Role::"Owner",
    action in [
        InveniStay::Action::"AcceptReservation",
        InveniStay::Action::"DeclineReservation",
        InveniStay::Action::"ListOwnerReservations"
    ],
    resource is InveniStay::Reservation
)
when {
    resource.propertyOwnerId == principal.id
};

// 4. PLATFORM AUDIT & SYSTEM ADMIN OVERRIDE
permit (
    principal in InveniStay::Role::"PlatformAdmin",
    action,
    resource
);

// 5. EXPLICIT FORBIDDEN OVERRIDES
// Forbid any action on properties flagged as SUSPENDED or FRAUDULENT
forbid (
    principal,
    action,
    resource is InveniStay::Property
)
when {
    resource.verifiedStatus == "REJECTED" || resource.isSuspended == true
};
