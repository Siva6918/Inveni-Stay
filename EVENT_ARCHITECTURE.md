# INVENI STAY — EVENT-DRIVEN NOTIFICATION & SYNCHRONIZATION ARCHITECTURE
**Phase 8 • Bharat Builds Tour 2026 • WeMakeDevs × AWS**

---

## 1. Overview & Core Product Loop

Inveni Stay connects Renters and Property Owners across remote relocation discovery through a reliable event-driven loop. Every critical domain state transition produces an immutable, typed domain event that propagates into in-app notification centers and cross-portal synchronizers without requiring unneeded WebSockets or aggressive client polling.

```
                    ACTION (e.g., Reservation Requested)
                                     │
                                     ▼
                   API Gateway / Lambda Business Logic
                                     │
                                     ▼
              DynamoDB Single-Table Atomic Write & Status
                                     │
                                     ▼
                         Domain Event Emitted
                        (Source: inveni.stay)
                                     │
                    ┌────────────────┴────────────────┐
                    ▼                                 ▼
             Amazon EventBridge                  Local EventBus
          (Enterprise Cloud Bus)             (Controlled Demo Bus)
                    │                                 │
                    ▼                                 ▼
           Notifications Lambda              notificationService
          (Idempotency Verified)            (Idempotency Verified)
                    │                                 │
         ┌──────────┴──────────┐                      │
         ▼                     ▼                      ▼
  DynamoDB In-App        Amazon SNS Topic     In-App Notifications
  Notification Store    (External Channel)      & Toast Alerts
```

---

## 2. Event Types & Payloads

All events are strictly typed and versioned (`eventVersion: "1"`) under the trusted domain namespace `inveni.stay`.

### 1. `ReservationCreated`
Triggered when a renter submits a reservation request for an available room unit.
```json
{
  "eventId": "evt_res_created_INV-2026-48295_1726815000",
  "eventType": "ReservationCreated",
  "eventVersion": "1",
  "source": "inveni.stay",
  "timestamp": "2026-09-20T06:00:00.000Z",
  "payload": {
    "reservationId": "INV-2026-48295",
    "propertyId": "panyam_sri_sai_residency",
    "propertyName": "Sri Sai Luxury PG & Residency",
    "roomId": "101",
    "roomNo": "101",
    "ownerId": "owner_sri_sai_panyam",
    "renterId": "usr_panyam_student_01",
    "renterName": "Rahul Sharma",
    "moveInDate": "2026-10-01",
    "status": "REQUESTED",
    "timestamp": "2026-09-20T06:00:00.000Z"
  }
}
```
**Consumers**:
- **Owner Notification Worker**: Inserts a `RESERVATION_CREATED` alert into the owner's notification inbox: *"Rahul Sharma requested Room 101 at Sri Sai Luxury PG & Residency"*.
- **Renter UI State**: Updates timeline to `REQUEST CREATED ✓` and sets `OWNER REVIEW ● (In Review)`.

---

### 2. `ReservationConfirmed`
Triggered when the verified property owner approves the guest reservation request.
```json
{
  "eventId": "evt_res_conf_INV-2026-48295_1726815200",
  "eventType": "ReservationConfirmed",
  "eventVersion": "1",
  "source": "inveni.stay",
  "timestamp": "2026-09-20T06:03:20.000Z",
  "payload": {
    "reservationId": "INV-2026-48295",
    "propertyId": "panyam_sri_sai_residency",
    "propertyName": "Sri Sai Luxury PG & Residency",
    "roomId": "101",
    "roomNo": "101",
    "ownerId": "owner_sri_sai_panyam",
    "renterId": "usr_panyam_student_01",
    "renterName": "Rahul Sharma",
    "moveInDate": "2026-10-01",
    "status": "CONFIRMED",
    "timestamp": "2026-09-20T06:03:20.000Z"
  }
}
```
**Consumers**:
- **Renter Notification Worker**: Dispatches a `RESERVATION_CONFIRMED` notification to the renter: *"Your reservation for Room 101 at Sri Sai Luxury PG & Residency has been confirmed!"*.
- **Renter Timeline**: Advances timeline status to `CONFIRMED ✓` with scheduled move-in countdown.
- **Room State**: Room remains in `RESERVED` status.

---

### 3. `ReservationRejected`
Triggered when the property owner rejects a booking request with a documented reason.
```json
{
  "eventId": "evt_res_rej_INV-2026-48295_1726815400",
  "eventType": "ReservationRejected",
  "eventVersion": "1",
  "source": "inveni.stay",
  "timestamp": "2026-09-20T06:06:40.000Z",
  "payload": {
    "reservationId": "INV-2026-48295",
    "propertyId": "panyam_sri_sai_residency",
    "propertyName": "Sri Sai Luxury PG & Residency",
    "roomId": "101",
    "roomNo": "101",
    "ownerId": "owner_sri_sai_panyam",
    "renterId": "usr_panyam_student_01",
    "renterName": "Rahul Sharma",
    "moveInDate": "2026-10-01",
    "status": "CANCELLED",
    "reason": "Room unavailable due to maintenance",
    "timestamp": "2026-09-20T06:06:40.000Z"
  }
}
```
**Consumers**:
- **Renter Notification Worker**: Dispatches `RESERVATION_REJECTED` alert with reason and a direct *"Find another stay"* discovery link.
- **Availability Synchronizer**: Restores Room 101 from `RESERVED` back to `AVAILABLE` so it immediately re-enters public vacancy matrices.

---

### 4. `ReservationCancelled`
Triggered when a renter cancels an existing reservation.
```json
{
  "eventId": "evt_res_canc_INV-2026-48295_1726815600",
  "eventType": "ReservationCancelled",
  "eventVersion": "1",
  "source": "inveni.stay",
  "timestamp": "2026-09-20T06:10:00.000Z",
  "payload": {
    "reservationId": "INV-2026-48295",
    "propertyId": "panyam_sri_sai_residency",
    "propertyName": "Sri Sai Luxury PG & Residency",
    "roomId": "101",
    "roomNo": "101",
    "ownerId": "owner_sri_sai_panyam",
    "renterId": "usr_panyam_student_01",
    "renterName": "Rahul Sharma",
    "moveInDate": "2026-10-01",
    "status": "CANCELLED",
    "reason": "Schedule change",
    "timestamp": "2026-09-20T06:10:00.000Z"
  }
}
```
**Consumers**:
- **Owner Notification Worker**: Alerts owner that Room 101 was released.
- **Availability Synchronizer**: Restores Room 101 to `AVAILABLE`.

---

### 5. `RoomAvailabilityChanged`
Triggered whenever room status transitions (`AVAILABLE` $\leftrightarrow$ `MAINTENANCE` $\leftrightarrow$ `OCCUPIED`).
```json
{
  "eventId": "evt_room_avail_panyam_sri_sai_residency_101_1726815800",
  "eventType": "RoomAvailabilityChanged",
  "eventVersion": "1",
  "source": "inveni.stay",
  "timestamp": "2026-09-20T06:13:20.000Z",
  "payload": {
    "propertyId": "panyam_sri_sai_residency",
    "propertyName": "Sri Sai Luxury PG & Residency",
    "roomNo": "101",
    "previousStatus": "AVAILABLE",
    "newStatus": "MAINTENANCE",
    "ownerId": "owner_sri_sai_panyam",
    "timestamp": "2026-09-20T06:13:20.000Z"
  }
}
```

---

### 6. `PropertyPublished`
Triggered when an owner reviews and transitions a property listing from `DRAFT` to `ACTIVE`.
```json
{
  "eventId": "evt_prop_pub_panyam_sri_sai_residency_1726816000",
  "eventType": "PropertyPublished",
  "eventVersion": "1",
  "source": "inveni.stay",
  "timestamp": "2026-09-20T06:16:40.000Z",
  "payload": {
    "propertyId": "panyam_sri_sai_residency",
    "propertyName": "Sri Sai Luxury PG & Residency",
    "ownerId": "owner_sri_sai_panyam",
    "town": "Panyam",
    "roomCount": 12,
    "timestamp": "2026-09-20T06:16:40.000Z"
  }
}
```

---

## 3. Idempotency & Retry Safety (Sections 20, 21, 59)

In distributed serverless architectures, event retries and network retries can cause duplicate executions. Inveni Stay employs a strict two-tier idempotency guard:

1. **DynamoDB Conditional Put Guard (Cloud Backend)**:
   ```typescript
   await ddb.send(new PutCommand({
     TableName: TABLE_NAME,
     Item: {
       PK: `EVENT#${eventId}`,
       SK: 'METADATA',
       eventType,
       processedAt: new Date().toISOString()
     },
     ConditionExpression: 'attribute_not_exists(PK)'
   }));
   ```
   If an event with the same `eventId` is delivered a second time, DynamoDB raises `ConditionalCheckFailedException`. The Lambda intercepts this and returns `{ success: true, duplicate: true }` without executing side effects or creating duplicate notifications.

2. **Client-Side Event Deduplication (Demo & Offline Mode)**:
   `EventService` maintains a bounded set of `processedEventIds`. Any duplicate `publish()` invocation is intercepted before dispatching to handlers.

---

## 4. Stale Data Protection (Sections 26 & 60)

When a renter configures move-in details for Room 101, availability can change in the background:
1. Renter A opens checkout for Room 101 at 10:00.
2. Owner or Renter B reserves Room 101 at 10:02.
3. Renter A clicks **Confirm Reservation** at 10:05.
4. Backend/Service immediately performs an authoritative availability check:
   ```typescript
   if (room.status !== 'AVAILABLE') {
     return {
       success: false,
       error: `Room ${room.roomNo} is no longer available (Current status: ${room.status}).`
     };
   }
   ```
5. Frontend intercepts the failure, displays an accessible error banner, and provides a direct `[View Available Rooms →]` button that redirects back to the vacant room selector without clearing the user's session.

---

## 5. DynamoDB Access Patterns for Notifications

| Entity | PK | SK | Attributes | Access Pattern |
|---|---|---|---|---|
| **Event Record** | `EVENT#<eventId>` | `METADATA` | `eventType`, `processedAt` | Idempotency verification via conditional write |
| **Notification** | `USER#<userId>` | `NOTIFICATION#<timestamp>#<id>` | `title`, `message`, `read`, `targetRoute` | Query all notifications for user ordered by time ($O(1)$) |
| **Preferences** | `USER#<userId>` | `PREFERENCES` | `reservationUpdates`, `propertyUpdates` | Get & update user notification settings |

---

## 6. AWS Services Used

1. **Amazon API Gateway (HTTP API)**: Managed REST endpoints with Cognito JWT authorizer context.
2. **AWS Lambda (`NotificationsFunction`)**: Event ingestion, idempotency enforcement, and notification persistence.
3. **Amazon DynamoDB (`InveniStayData`)**: Single-table persistence for events, notifications, and user preferences.
4. **Amazon SNS (`InveniStayNotificationTopic`)**: Topic for domain alerts (decoupled from frontend presentation).
5. **Amazon CloudWatch**: Structured logging of event executions with sanitized sensitive data.
