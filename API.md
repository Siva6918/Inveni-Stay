# INVENI STAY — API SPECIFICATION (v1)
**Bharat Builds Tour 2026 • WeMakeDevs × AWS**

Base URL: `https://<api-id>.execute-api.ap-south-1.amazonaws.com/api` (or local fallback)

---

## Response Format Standard

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ROOM_ALREADY_RESERVED",
    "message": "This room was just reserved by another user. Please choose another room."
  }
}
```

---

## Endpoints

### 1. GET `/api/properties`
List all verified properties with filtering capabilities.
- **Query Parameters**:
  - `destination` (optional): Filter by city or town (e.g., `Panyam`, `Nandyal`, `Kadapa`)
  - `budgetMax` (optional): Filter by maximum monthly rent
  - `roomType` (optional): `Single` | `Double` | `Triple`
- **Response**:
```json
{
  "success": true,
  "data": {
    "count": 6,
    "properties": [
      {
        "id": "panyam_sri_sai_residency",
        "name": "Sri Sai Luxury PG & Residency",
        "town": "Panyam",
        "district": "Nandyal",
        "state": "Andhra Pradesh",
        "startingRent": 4200,
        "availableRoomsCount": 3,
        "totalRooms": 4,
        "verifiedStatus": true
      }
    ]
  }
}
```

---

### 2. GET `/api/properties/:propertyId`
Retrieve comprehensive metadata for a specific property including amenities, mess schedules, rules, and coordinates.
- **Parameters**: `propertyId` (string, required)
- **Response**:
```json
{
  "success": true,
  "data": {
    "id": "panyam_sri_sai_residency",
    "name": "Sri Sai Luxury PG & Residency",
    "address": "Opp. Old Bus Stand Road, Near Govt. Polytechnic, Panyam",
    "facilities": [
      { "name": "Homestyle Food Mess", "included": true },
      { "name": "150 Mbps Wi-Fi", "included": true }
    ],
    "coordinates": { "lat": 15.5185, "lng": 78.3492 }
  }
}
```

---

### 3. GET `/api/properties/:propertyId/rooms`
Retrieve all inventory units associated with a property.
- **Parameters**: `propertyId` (string, required)
- **Response**:
```json
{
  "success": true,
  "data": [
    {
      "roomNo": "101",
      "floor": 1,
      "type": "Single",
      "rent": 5500,
      "deposit": 2000,
      "status": "AVAILABLE",
      "attachedBath": true
    },
    {
      "roomNo": "102",
      "floor": 1,
      "type": "Single",
      "rent": 5500,
      "deposit": 2000,
      "status": "OCCUPIED",
      "attachedBath": true
    }
  ]
}
```

---

### 4. GET `/api/rooms/:roomId/availability`
Query real-time availability status for a specific unit.
- **Parameters**: `roomId` (string, required)
- **Response**:
```json
{
  "success": true,
  "data": {
    "roomId": "101",
    "status": "AVAILABLE",
    "lastUpdated": "2026-09-20T08:00:00.000Z"
  }
}
```

---

### 5. POST `/api/reservations`
Initiate a new reservation request.  
**Security**: Backend calculates authoritative pricing server-side and checks room availability atomically via DynamoDB condition expressions.
- **Headers**: `Authorization: Bearer <cognito-id-token>`
- **Request Body**:
```json
{
  "propertyId": "panyam_sri_sai_residency",
  "roomId": "101",
  "moveInDate": "2026-10-01",
  "durationMonths": 6,
  "durationLabel": "6 Months (Semester)",
  "foodPlan": "included",
  "selectedAddons": [
    { "id": "lamp_01", "name": "Study Lamp", "monthlyPrice": 150 }
  ],
  "renter": {
    "fullName": "Venkata Siva Kumar",
    "phone": "9849012345",
    "email": "siva.reddy@gmail.com",
    "currentLocation": "Kadapa, Andhra Pradesh",
    "occupation": "Student"
  }
}
```
- **Response (201 Created)**:
```json
{
  "success": true,
  "data": {
    "id": "INV-2026-48291",
    "status": "REQUESTED",
    "pricing": {
      "roomRent": 5500,
      "foodCost": 0,
      "addonCost": 150,
      "deposit": 2000,
      "monthlyTotal": 5650,
      "initialTotal": 7650
    },
    "createdAt": "2026-09-20T08:25:00.000Z"
  }
}
```
- **Error Responses**:
  - `409 Conflict`: `ROOM_UNAVAILABLE` or `ROOM_ALREADY_RESERVED`
  - `400 Bad Request`: `INVALID_PHONE`, `INVALID_RENTER_NAME`, `INVALID_DATE`

---

### 6. GET `/api/reservations`
List all active and past reservations belonging to the authenticated Cognito user.
- **Headers**: `Authorization: Bearer <cognito-id-token>`
- **Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "INV-2026-00118",
      "propertyName": "Sri Sai Luxury PG & Residency",
      "roomNo": "104",
      "status": "REQUESTED",
      "pricing": { "monthlyTotal": 4350 }
    }
  ]
}
```

---

### 7. GET `/api/reservations/:reservationId`
Retrieve full reservation ledger and receipt.
- **Headers**: `Authorization: Bearer <cognito-id-token>`
- **Parameters**: `reservationId` (string, required)
- **Response**: Detailed reservation entity with renter profile and breakdown.

---

### 8. PATCH `/api/reservations/:reservationId`
Cancel an existing reservation request. Restores unit to `AVAILABLE` status.
- **Headers**: `Authorization: Bearer <cognito-id-token>`
- **Request Body**:
```json
{
  "status": "CANCELLED",
  "reason": "Change of relocation timeline"
}
```
- **Response**:
```json
{
  "success": true,
  "data": {
    "id": "INV-2026-48291",
    "status": "CANCELLED",
    "cancelledAt": "2026-09-20T08:30:00.000Z"
  }
}
```

---

## Phase 7: Owner Portal & Management APIs

### 9. GET `/api/owner/properties`
List all properties owned by the authenticated Cognito identity.
- **Headers**: `Authorization: Bearer <cognito-id-token>`
- **Response**:
```json
{
  "success": true,
  "data": {
    "ownerId": "owner_sri_sai_panyam",
    "properties": [
      {
        "id": "panyam_sri_sai_residency",
        "name": "Sri Sai Luxury PG & Residency",
        "town": "Panyam",
        "status": "ACTIVE",
        "totalRooms": 12,
        "availableRoomsCount": 3,
        "listingCompletenessScore": 85
      }
    ]
  }
}
```

---

### 10. POST `/api/owner/properties`
Create a new property listing draft.
- **Headers**: `Authorization: Bearer <cognito-id-token>`
- **Request Body**:
```json
{
  "name": "Sri Sai Residency Annex",
  "propertyType": "PG",
  "gender": "Boys",
  "town": "Panyam",
  "district": "Nandyal",
  "address": "Opp. Old Bus Stand, Panyam",
  "startingRent": 5500,
  "securityDeposit": 2000,
  "amenities": ["Wi-Fi", "Mess", "Attached Bath"]
}
```
- **Response**: Created `DRAFT` property entity.

---

### 11. POST `/api/owner/properties/:propertyId/publish`
Publish a draft property to the live discovery catalog after verifying publish readiness checklist.
- **Headers**: `Authorization: Bearer <cognito-id-token>`
- **Response**:
```json
{
  "success": true,
  "data": {
    "propertyId": "panyam_sri_sai_residency",
    "status": "ACTIVE",
    "publishedAt": "2026-09-20T10:00:00.000Z"
  }
}
```

---

### 12. POST `/api/owner/properties/:propertyId/rooms`
Add a new room to property inventory.
- **Headers**: `Authorization: Bearer <cognito-id-token>`
- **Request Body**:
```json
{
  "roomNo": "101",
  "floor": 1,
  "type": "Single",
  "rent": 5500,
  "deposit": 2000,
  "status": "AVAILABLE",
  "attachedBath": true
}
```

---

### 13. PATCH `/api/owner/rooms/:roomId`
Update room price or availability status atomically (Single Source of Truth).
- **Headers**: `Authorization: Bearer <cognito-id-token>`
- **Request Body**:
```json
{
  "rent": 6200,
  "status": "MAINTENANCE"
}
```

---

### 14. GET `/api/owner/properties/:propertyId/reservations`
List all reservation requests for a property owned by the caller.
- **Headers**: `Authorization: Bearer <cognito-id-token>`

---

### 15. PATCH `/api/owner/reservations/:reservationId`
Accept (confirm) or reject an incoming reservation request.
- **Headers**: `Authorization: Bearer <cognito-id-token>`
- **Request Body (Confirm)**:
```json
{
  "status": "CONFIRMED"
}
```
- **Request Body (Reject & Restore Availability)**:
```json
{
  "status": "CANCELLED",
  "reason": "Requested move-in dates unavailable"
}
```

---

### 16. POST `/api/owner/media/upload-url`
Generate an Amazon S3 pre-signed upload URL for direct browser-to-S3 media upload.
- **Headers**: `Authorization: Bearer <cognito-id-token>`
- **Request Body**:
```json
{
  "propertyId": "panyam_sri_sai_residency",
  "category": "room",
  "fileName": "room_101_wide.jpg",
  "fileType": "image/jpeg"
}
```
- **Response**:
```json
{
  "success": true,
  "data": {
    "uploadUrl": "https://inveni-stay-media-storage-2026.s3.amazonaws.com/properties/panyam_sri_sai_residency/room/...",
    "publicUrl": "https://inveni-stay-media-storage-2026.s3.amazonaws.com/...",
    "expiresInSeconds": 900
  }
}
```

