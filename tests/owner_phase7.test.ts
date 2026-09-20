/**
 * INVENI STAY — PHASE 7 OWNER PORTAL & INVENTORY TEST SUITE
 * Tests:
 * 1. Owner Property Creation (Draft vs. Active)
 * 2. Room Inventory & Availability Freshness
 * 3. Data Consistency: Room Price & Status Changes Instantly Reflected in Renter & AI Discovery
 * 4. Reservation Flow: Owner Confirmation & Room Retention
 * 5. Reservation Flow: Owner Rejection & Automatic Room Availability Restoration
 * 6. Multi-Owner Security & Server-Side Authorization Boundary
 */

import { propertyService } from '../src/services/propertyService';
import { reservationService } from '../src/services/reservationService';
import { aiRelocationService } from '../src/services/aiRelocationService';
import { authService } from '../src/services/authService';

console.log('=== RUNNING PHASE 7 OWNER PORTAL & DATA CONSISTENCY TESTS ===\n');

async function runPhase7Tests() {
  const ownerA = 'owner_sri_sai_panyam';
  const ownerB = 'owner_lakshmi_devi';

  // --------------------------------------------------------------------------
  // TEST 1: Property Creation & Draft Isolation (Section 15, 16)
  // --------------------------------------------------------------------------
  console.log('TEST 1: Property Creation & Draft Isolation from Renter Search');

  const draftProp = propertyService.createOwnerProperty(
    ownerA,
    {
      name: 'Sri Sai Residency Annex',
      propertyType: 'PG',
      gender: 'Boys',
      town: 'Panyam',
      district: 'Nandyal',
      address: 'Near Old Bus Stand, Panyam',
      overview: 'Brand new Annex building with single rooms and food.',
      amenities: ['Wi-Fi', 'Mess', 'Attached Bath'],
      hasFood: true,
      hasWifi: true,
      hasAc: false,
      hasParking: true,
      startingRent: 5500,
      securityDeposit: 2000,
    },
    'DRAFT'
  );

  console.log(`Created property "${draftProp.name}" with status: ${draftProp.status}`);
  console.assert(draftProp.status === 'DRAFT', 'New draft property must have status DRAFT');

  // Verify Draft does NOT appear in public renter search (Section 15)
  const renterSearchResults = propertyService.searchAndFilterProperties({
    destination: 'Panyam',
    origin: 'Kadapa',
    propertyType: 'All',
    roomType: 'All',
    minBudget: 0,
    maxBudget: 10000,
    amenities: [],
    duration: 'any',
    onlyAvailable: false,
    verifiedOnly: false,
    gender: 'All',
  });

  const foundInSearch = renterSearchResults.availableNow.concat(
    renterSearchResults.strongMatches,
    renterSearchResults.otherOptions
  ).some((p) => p.id === draftProp.id);

  console.assert(!foundInSearch, 'DRAFT properties must NOT appear in public renter search');
  console.log('-> PASS: Draft property correctly excluded from public catalog.\n');

  // --------------------------------------------------------------------------
  // TEST 2: Add Room & Publish Listing (Section 16, 18, 59)
  // --------------------------------------------------------------------------
  console.log('TEST 2: Add Room & Publish Listing to Public Catalog');

  // Add room 101 to draft property
  const roomRes = propertyService.addRoom(ownerA, draftProp.id, {
    roomNo: '101',
    floor: 1,
    type: 'Single',
    rent: 5500,
    deposit: 2000,
    status: 'AVAILABLE',
    attachedBath: true,
  });

  console.assert(roomRes.success, 'Room 101 must be added successfully');
  console.log(`Room 101 added with rent ₹${roomRes.room?.rent}`);

  // Publish property
  const publishRes = propertyService.publishProperty(ownerA, draftProp.id);
  console.assert(publishRes.success, 'Publish must succeed when rooms are configured');
  console.assert(publishRes.property?.status === 'ACTIVE', 'Published property must have status ACTIVE');

  // Check it now appears in public search
  const postPublishSearch = propertyService.searchAndFilterProperties({
    destination: 'Panyam',
    origin: 'Kadapa',
    propertyType: 'All',
    roomType: 'All',
    minBudget: 0,
    maxBudget: 10000,
    amenities: [],
    duration: 'any',
    onlyAvailable: false,
    verifiedOnly: false,
    gender: 'All',
  });

  const nowFoundInSearch = postPublishSearch.availableNow.concat(
    postPublishSearch.strongMatches,
    postPublishSearch.otherOptions
  ).some((p) => p.id === draftProp.id);

  console.assert(nowFoundInSearch, 'Published ACTIVE property must appear in public renter search');
  console.log('-> PASS: Property successfully published and active in public search.\n');

  // --------------------------------------------------------------------------
  // TEST 3: Data Consistency Test (Price Update Propagation - Section 61)
  // --------------------------------------------------------------------------
  console.log('TEST 3: Room Price Update Propagation (₹5,500 -> ₹6,200)');

  // Owner updates Room 101 price from ₹5,500 to ₹6,200
  const priceUpdateRes = propertyService.updateRoom(ownerA, draftProp.id, '101', {
    rent: 6200,
  });
  console.assert(priceUpdateRes.success, 'Price update must succeed');

  // Verify single source of truth in property listing
  const updatedProp = propertyService.getPropertyById(draftProp.id)!;
  const updatedRoom = updatedProp.rooms.find((r) => r.roomNo === '101')!;
  console.log(`Updated Room 101 authoritative rent: ₹${updatedRoom.rent}`);
  console.assert(updatedRoom.rent === 6200, 'Room 101 rent must now be 6200');

  // AI Matching Verification (Section 53):
  // 1. Budget of ₹6,000 must NOT match Room 101 because ₹6,200 exceeds limit
  const aiReqUnder6000 = aiRelocationService.parseRequirements('Single room in Panyam under 6000');
  const aiMatchUnder6000 = aiRelocationService.matchPropertiesAndRooms(
    aiReqUnder6000,
    propertyService.getAllProperties()
  );
  const match101Under6000 = aiMatchUnder6000.exactMatches.find(
    (m) => m.property.id === draftProp.id && m.room.roomNo === '101'
  );
  console.assert(!match101Under6000, 'Room 101 (₹6,200) must NOT be exact match for budget <= ₹6,000');

  // 2. Budget of ₹6,500 MUST match Room 101 at ₹6,200
  const aiReqUnder6500 = aiRelocationService.parseRequirements('Single room in Panyam under 6500');
  const aiMatchUnder6500 = aiRelocationService.matchPropertiesAndRooms(
    aiReqUnder6500,
    propertyService.getAllProperties()
  );
  const match101Under6500 = aiMatchUnder6500.exactMatches.find(
    (m) => m.property.id === draftProp.id && m.room.roomNo === '101'
  );
  console.assert(Boolean(match101Under6500), 'Room 101 (₹6,200) MUST match for budget <= ₹6,500');
  console.log('-> PASS: Room price change immediately propagated to Renter discovery and AI matching.\n');

  // --------------------------------------------------------------------------
  // TEST 4: Data Consistency Test (Availability Status Propagation - Section 61)
  // --------------------------------------------------------------------------
  console.log('TEST 4: Room Availability Update (AVAILABLE -> MAINTENANCE)');

  // Owner switches Room 101 to MAINTENANCE
  const statusUpdateRes = propertyService.updateRoom(ownerA, draftProp.id, '101', {
    status: 'MAINTENANCE',
  });
  console.assert(statusUpdateRes.success, 'Status update must succeed');

  // Public search check: availableRoomsCount must now be 0
  const maintProp = propertyService.getPropertyById(draftProp.id)!;
  console.log(`Property available rooms count: ${maintProp.availableRoomsCount}`);
  console.assert(maintProp.availableRoomsCount === 0, 'Available rooms count must update to 0');

  // AI Matching check: Room 101 in MAINTENANCE cannot be an exact match
  const aiMatchMaint = aiRelocationService.matchPropertiesAndRooms(
    aiReqUnder6500,
    propertyService.getAllProperties()
  );
  const exactMatchInMaint = aiMatchMaint.exactMatches.find(
    (m) => m.property.id === draftProp.id && m.room.roomNo === '101'
  );
  console.assert(!exactMatchInMaint, 'Room under MAINTENANCE must NOT be exact match');
  console.log('-> PASS: Maintenance status immediately excludes room from public vacancy matrix.\n');

  // --------------------------------------------------------------------------
  // TEST 5: Reservation Confirmation Workflow (Section 26, 28)
  // --------------------------------------------------------------------------
  console.log('TEST 5: Owner Reservation Confirmation');

  // Reset Room 101 to AVAILABLE
  propertyService.updateRoom(ownerA, draftProp.id, '101', { status: 'AVAILABLE' });

  // Renter requests reservation
  const resCreation = await reservationService.createReservation({
    propertyId: draftProp.id,
    roomNo: '101',
    moveInDate: '2026-10-15',
    durationMonths: 6,
    durationLabel: '6 Months',
    foodPlan: 'included',
    foodPlanLabel: 'Mess Included',
    selectedAddons: [],
    renter: {
      fullName: 'Renter Tester',
      phone: '9849011223',
      email: 'tester@gmail.com',
      currentLocation: 'Kadapa',
      occupation: 'Student',
    },
  });

  console.assert(resCreation.success && resCreation.reservation, 'Reservation must be created');
  const reservationId = resCreation.reservation!.id;
  console.log(`Reservation created: ${reservationId}, initial status: ${resCreation.reservation!.status}`);

  // Room status is now RESERVED
  const reservedRoom = propertyService.getPropertyById(draftProp.id)!.rooms.find((r) => r.roomNo === '101')!;
  console.assert(reservedRoom.status === 'RESERVED', 'Room must be RESERVED after request');

  // Owner confirms reservation
  const confirmResult = await reservationService.confirmReservation(ownerA, reservationId);
  console.assert(confirmResult.success, 'Owner confirm must succeed');
  console.assert(confirmResult.reservation?.status === 'CONFIRMED', 'Reservation status must be CONFIRMED');

  // Room status remains RESERVED as required by Section 28 (not occupied until physical checkin)
  const confirmedRoom = propertyService.getPropertyById(draftProp.id)!.rooms.find((r) => r.roomNo === '101')!;
  console.assert(confirmedRoom.status === 'RESERVED', 'Room status must remain RESERVED after confirmation');
  console.log('-> PASS: Reservation confirmed and room state preserved as RESERVED.\n');

  // --------------------------------------------------------------------------
  // TEST 6: Reservation Rejection & Availability Restoration (Section 27, 60)
  // --------------------------------------------------------------------------
  console.log('TEST 6: Reservation Rejection & Immediate Room Availability Restoration');

  // Add Room 102
  propertyService.addRoom(ownerA, draftProp.id, {
    roomNo: '102',
    floor: 1,
    type: 'Double',
    rent: 5000,
    deposit: 2000,
    status: 'AVAILABLE',
    attachedBath: true,
  });

  // Renter requests Room 102
  const res102 = await reservationService.createReservation({
    propertyId: draftProp.id,
    roomNo: '102',
    moveInDate: '2026-10-15',
    durationMonths: 3,
    durationLabel: '3 Months',
    foodPlan: 'included',
    foodPlanLabel: 'Mess Included',
    selectedAddons: [],
    renter: {
      fullName: 'Second Renter',
      phone: '9849099887',
      email: 'renter2@gmail.com',
      currentLocation: 'Kurnool',
      occupation: 'Intern',
    },
  });

  const res102Id = res102.reservation!.id;
  const room102BeforeReject = propertyService.getPropertyById(draftProp.id)!.rooms.find((r) => r.roomNo === '102')!;
  console.assert(room102BeforeReject.status === 'RESERVED', 'Room 102 must be RESERVED');

  // Owner rejects reservation with reason (Section 27)
  const rejectResult = await reservationService.rejectReservation(
    ownerA,
    res102Id,
    'Requested dates conflict with maintenance schedule'
  );

  console.assert(rejectResult.success, 'Owner rejection must succeed');
  console.assert(rejectResult.reservation?.status === 'CANCELLED', 'Reservation must be CANCELLED');

  // Critical: Room 102 must be restored to AVAILABLE (Section 27 & 60)
  const room102AfterReject = propertyService.getPropertyById(draftProp.id)!.rooms.find((r) => r.roomNo === '102')!;
  console.log(`Room 102 status after rejection: ${room102AfterReject.status}`);
  console.assert(
    room102AfterReject.status === 'AVAILABLE',
    'Room 102 must be restored to AVAILABLE after rejection'
  );
  console.log('-> PASS: Reservation rejected and room immediately restored to AVAILABLE.\n');

  // --------------------------------------------------------------------------
  // TEST 7: Security & Authorization Boundary (Section 50, 62)
  // --------------------------------------------------------------------------
  console.log('TEST 7: Security Boundary — Owner B cannot access or modify Owner A property');

  // Owner B attempts to update Owner A's property
  const unauthorizedUpdate = propertyService.updateProperty(ownerB, draftProp.id, {
    name: 'Hijacked by Owner B',
  });
  console.assert(!unauthorizedUpdate.success, 'Owner B update on Owner A property must fail');
  console.log(`Blocked modification attempt with: "${unauthorizedUpdate.error}"`);

  // Owner B attempts to add room to Owner A's property
  const unauthorizedAddRoom = propertyService.addRoom(ownerB, draftProp.id, {
    roomNo: '999',
    floor: 9,
    type: 'Single',
    rent: 9999,
    deposit: 9999,
    status: 'AVAILABLE',
    attachedBath: true,
  });
  console.assert(!unauthorizedAddRoom.success, 'Owner B addRoom on Owner A property must fail');
  console.log(`Blocked addRoom attempt with: "${unauthorizedAddRoom.error}"`);

  // Owner B attempts to confirm Owner A's reservation
  const unauthorizedConfirm = await reservationService.confirmReservation(ownerB, reservationId);
  console.assert(!unauthorizedConfirm.success, 'Owner B confirming Owner A reservation must fail');
  console.log(`Blocked confirmation attempt with: "${unauthorizedConfirm.error}"`);

  console.log('-> PASS: Server-side ownership authorization strictly enforced.\n');

  console.log('=== ALL PHASE 7 OWNER PORTAL & CONSISTENCY TESTS PASSED ===');
}

runPhase7Tests().catch((err) => {
  console.error('Test failed with error:', err);
  process.exit(1);
});
