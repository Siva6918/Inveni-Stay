import { propertyService } from '../src/services/propertyService';
import { reservationService } from '../src/services/reservationService';
import { eventService } from '../src/services/eventService';
import { notificationService } from '../src/services/notificationService';
import { DomainEvent, ReservationEventPayload } from '../src/types';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    process.exit(1);
  }
}

async function runPhase8Tests() {
  console.log('=== RUNNING PHASE 8 EVENT-DRIVEN & NOTIFICATION TESTS ===\n');

  // Reset and clean test state
  eventService.clearHistory();
  notificationService.clear();

  const ownerId = 'owner_sri_sai_panyam';
  const renterId = 'usr_panyam_student_01';
  const propertyId = 'panyam_sri_sai_residency';
  const testRoomNo = '101';

  // Make sure room 101 starts as AVAILABLE
  propertyService.updateRoomStatus(propertyId, testRoomNo, 'AVAILABLE');

  // -------------------------------------------------------------
  // TEST 1: ReservationCreated -> Owner Notification
  // -------------------------------------------------------------
  console.log('TEST 1: ReservationCreated Event & Owner Notification Delivery');
  const resResult = await reservationService.createReservation({
    propertyId,
    roomNo: testRoomNo,
    moveInDate: '2026-10-01',
    durationMonths: 6,
    durationLabel: '6 Months',
    foodPlan: 'included',
    foodPlanLabel: 'Andhra Homestyle Meals',
    selectedAddons: [],
    renter: {
      fullName: 'Vikram Rao',
      email: renterId,
      phone: '9849112233',
      currentLocation: 'Hyderabad',
      occupation: 'Software Engineer',
    },
  });

  assert(resResult.success && !!resResult.reservation, 'Reservation creation must succeed.');
  const reservation = resResult.reservation!;

  // Verify owner received the notification
  const ownerNotifs = notificationService.getNotificationsForUser(ownerId);
  const createdNotif = ownerNotifs.find((n) => n.type === 'RESERVATION_CREATED');
  assert(!!createdNotif, 'Owner must receive a RESERVATION_CREATED notification.');
  assert(
    createdNotif!.message.includes('Vikram Rao') && createdNotif!.message.includes(testRoomNo),
    'Notification message must reference renter name and room number.'
  );
  console.log(`Owner received: "${createdNotif!.title}" - ${createdNotif!.message}`);
  console.log('-> PASS: ReservationCreated event successfully delivered to owner inbox.\n');

  // -------------------------------------------------------------
  // TEST 2: Owner Confirms -> Renter Notification
  // -------------------------------------------------------------
  console.log('TEST 2: Owner Confirms Reservation -> Renter Notification');
  const confirmResult = await reservationService.confirmReservation(ownerId, reservation.id);
  assert(confirmResult.success, 'Reservation confirmation must succeed.');

  const renterNotifs = notificationService.getNotificationsForUser(renterId);
  const confirmedNotif = renterNotifs.find((n) => n.type === 'RESERVATION_CONFIRMED');
  assert(!!confirmedNotif, 'Renter must receive a RESERVATION_CONFIRMED notification.');
  console.log(`Renter received: "${confirmedNotif!.title}" - ${confirmedNotif!.message}`);

  // Room state must remain RESERVED (Section 28)
  const roomStatus = propertyService.getRoomAvailability(propertyId, testRoomNo);
  assert(roomStatus === 'RESERVED', 'Room status must remain RESERVED after confirmation.');
  console.log('-> PASS: ReservationConfirmed event delivered and room state preserved as RESERVED.\n');

  // -------------------------------------------------------------
  // TEST 3: Stale Availability Race Condition Guard (Section 26 & 60)
  // -------------------------------------------------------------
  console.log('TEST 3: Stale Availability Race Condition Guard');
  // Attempting to reserve Room 101 while it is RESERVED
  const staleAttempt = await reservationService.createReservation({
    propertyId,
    roomNo: testRoomNo,
    moveInDate: '2026-10-05',
    durationMonths: 3,
    durationLabel: '3 Months',
    foodPlan: 'no-food',
    foodPlanLabel: 'Self-Managed Meals',
    selectedAddons: [],
    renter: {
      fullName: 'Rival Renter',
      email: 'rival.renter@gmail.com',
      phone: '9849223344',
      currentLocation: 'Bangalore',
      occupation: 'Student',
    },
  });

  assert(!staleAttempt.success, 'Stale reservation attempt must be rejected.');
  assert(
    staleAttempt.error?.includes('no longer available') || false,
    `Error message must state that the room is no longer available. Got: "${staleAttempt.error}"`
  );
  console.log(`Safely rejected concurrent checkout with: "${staleAttempt.error}"`);
  console.log('-> PASS: Stale availability race condition successfully protected.\n');

  // -------------------------------------------------------------
  // TEST 4: Owner Rejection & Immediate Availability Restoration (Section 9 & 27)
  // -------------------------------------------------------------
  console.log('TEST 4: Owner Rejection & Immediate Availability Restoration');
  // Create another reservation on room 102
  propertyService.updateRoomStatus(propertyId, '102', 'AVAILABLE');
  const res2 = await reservationService.createReservation({
    propertyId,
    roomNo: '102',
    moveInDate: '2026-10-10',
    durationMonths: 6,
    durationLabel: '6 Months',
    foodPlan: 'included',
    foodPlanLabel: 'Andhra Homestyle Meals',
    selectedAddons: [],
    renter: {
      fullName: 'Ananya Roy',
      email: renterId,
      phone: '9849334455',
      currentLocation: 'Pune',
      occupation: 'Consultant',
    },
  });

  assert(res2.success && !!res2.reservation, 'Second reservation created.');
  const rejectRes = await reservationService.rejectReservation(
    ownerId,
    res2.reservation!.id,
    'Room under urgent maintenance'
  );
  assert(rejectRes.success, 'Rejection must succeed.');

  // Verify Renter receives rejection notification with reason
  const renterUpdatedNotifs = notificationService.getNotificationsForUser(renterId);
  const rejectedNotif = renterUpdatedNotifs.find((n) => n.type === 'RESERVATION_REJECTED');
  assert(!!rejectedNotif, 'Renter must receive RESERVATION_REJECTED notification.');
  assert(
    rejectedNotif!.message.includes('Room under urgent maintenance'),
    'Rejection reason must be present in notification.'
  );

  // Verify room 102 availability is restored to AVAILABLE
  const room102Status = propertyService.getRoomAvailability(propertyId, '102');
  assert(room102Status === 'AVAILABLE', 'Room 102 must be restored to AVAILABLE.');
  console.log(`Room 102 status restored to: ${room102Status}`);
  console.log('-> PASS: Rejection notification emitted and room vacancy restored.\n');

  // -------------------------------------------------------------
  // TEST 5: Notification Security & Read State (Section 14 & 47)
  // -------------------------------------------------------------
  console.log('TEST 5: Notification Ownership & Mark Read');
  const ownerNotifId = createdNotif!.id;

  // Renter tries to mark owner notification as read -> must fail
  const unauthorizedMark = notificationService.markAsRead(ownerNotifId, renterId);
  assert(!unauthorizedMark, 'User cannot mark another user notification as read.');

  // Owner marks own notification as read -> succeeds
  const initialUnread = notificationService.getUnreadCount(ownerId);
  const authorizedMark = notificationService.markAsRead(ownerNotifId, ownerId);
  assert(authorizedMark, 'Owner must be able to mark their own notification as read.');
  const afterUnread = notificationService.getUnreadCount(ownerId);
  assert(afterUnread === initialUnread - 1, 'Unread count must decrement by 1.');
  console.log('-> PASS: Cross-tenant notification security strictly enforced.\n');

  // -------------------------------------------------------------
  // TEST 6: Event Idempotency & Duplicate Safety (Section 20, 21, 59)
  // -------------------------------------------------------------
  console.log('TEST 6: Event Idempotency & Duplicate Safety');
  const testEvent: DomainEvent<ReservationEventPayload> = {
    eventId: 'evt_idempotency_test_12345',
    eventType: 'ReservationConfirmed',
    eventVersion: '1',
    source: 'inveni.stay',
    timestamp: new Date().toISOString(),
    payload: {
      reservationId: 'INV-TEST-DUP',
      propertyId,
      propertyName: 'Sri Sai Luxury PG & Residency',
      roomId: '103',
      roomNo: '103',
      ownerId,
      renterId: 'user_dup_test@gmail.com',
      renterName: 'Idempotency Tester',
      moveInDate: '2026-11-01',
      status: 'CONFIRMED',
      timestamp: new Date().toISOString(),
    },
  };

  // First publication -> processed: true, duplicate: false
  const firstPub = await eventService.publish(testEvent);
  assert(firstPub.processed && !firstPub.duplicate, 'First event publication must be processed.');

  const notifsAfterFirst = notificationService.getNotificationsForUser('user_dup_test@gmail.com').length;
  assert(notifsAfterFirst === 1, 'Exactly one notification must be generated on first publication.');

  // Second publication (simulating network retry / duplicate delivery)
  const secondPub = await eventService.publish(testEvent);
  assert(!secondPub.processed && secondPub.duplicate, 'Duplicate event must be intercepted by idempotency guard.');

  const notifsAfterSecond = notificationService.getNotificationsForUser('user_dup_test@gmail.com').length;
  assert(notifsAfterSecond === 1, 'Duplicate event must NOT create a duplicate notification.');
  console.log('-> PASS: Event idempotency prevents duplicate notifications on retry.\n');

  // -------------------------------------------------------------
  // TEST 7: Notification Preferences (Section 40)
  // -------------------------------------------------------------
  console.log('TEST 7: User Notification Preferences Enforcement');
  const optOutUser = 'usr_opt_out@gmail.com';
  notificationService.updatePreferences(optOutUser, {
    reservationUpdates: false, // Turn off reservation alerts
  });

  await eventService.emitReservationConfirmed({
    reservationId: 'INV-OPT-OUT',
    propertyId,
    propertyName: 'Sri Sai Residency',
    roomId: '104',
    roomNo: '104',
    ownerId,
    renterId: optOutUser,
    renterName: 'Opt Out Tester',
    moveInDate: '2026-11-01',
    status: 'CONFIRMED',
    timestamp: new Date().toISOString(),
  });

  const optOutNotifs = notificationService.getNotificationsForUser(optOutUser);
  assert(optOutNotifs.length === 0, 'User with reservationUpdates disabled must not receive alerts.');
  console.log('-> PASS: Notification preferences correctly respected.\n');

  console.log('=== ALL PHASE 8 EVENT-DRIVEN & NOTIFICATION TESTS PASSED ===\n');
}

runPhase8Tests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
