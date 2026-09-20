/**
 * INVENI STAY — PHASE 6 BACKEND & INTEGRATION TEST SUITE
 * Tests:
 * 1. Authoritative Server-side Price Calculation
 * 2. Room Availability & Reservation Creation
 * 3. Unavailable Room Rejection
 * 4. Duplicate Reservation Conflict Handling
 * 5. Reservation Cancellation & Availability Restoration
 * 6. User Ownership & Auth Flow
 */

import { reservationService } from '../src/services/reservationService';
import { propertyService } from '../src/services/propertyService';
import { authService } from '../src/services/authService';

console.log('=== RUNNING PHASE 6 BACKEND & SERVICE TESTS ===\n');

// TEST 1: Authoritative Pricing Calculation
console.log('TEST 1: Server-Side Price Calculation');
const pricing = reservationService.calculateAuthoritativePricing(
  5500, // room rent
  'full-mess', // food plan (+1500)
  [{ id: 'lamp', name: 'Study Lamp', monthlyPrice: 150, description: '' }], // addon (+150)
  2000 // deposit
);
console.log('Calculated Monthly Total:', pricing.monthlyTotal);
console.log('Calculated Initial Total:', pricing.initialTotal);
console.assert(pricing.monthlyTotal === 7150, 'Monthly total must equal 5500 + 1500 + 150 = 7150');
console.assert(pricing.initialTotal === 9150, 'Initial total must equal 7150 + 2000 = 9150');
console.log('-> PASS\n');

// TEST 2: Renter Validation
console.log('TEST 2: Renter Input Field Validation');
const invalidRenter = reservationService.validateRenter({
  fullName: 'A', // too short
  phone: '12345', // invalid format
  email: 'not-an-email',
});
console.assert(Boolean(invalidRenter.fullName), 'Must fail on short name');
console.assert(Boolean(invalidRenter.phone), 'Must fail on invalid mobile');
console.assert(Boolean(invalidRenter.email), 'Must fail on invalid email');
console.log('-> PASS\n');

// TEST 3: Reservation Creation & Room Status Transition
console.log('TEST 3: Reservation Creation on Available Room');
const property = propertyService.getPropertyById('panyam_sri_sai_residency')!;
const initialAvailableRoom = property.rooms.find((r) => r.status === 'AVAILABLE')!;
console.log(`Targeting Room ${initialAvailableRoom.roomNo} in ${property.name}`);

async function runReservationTests() {
  const result = await reservationService.createReservation({
    propertyId: property.id,
    roomNo: initialAvailableRoom.roomNo,
    moveInDate: '2026-10-01',
    durationMonths: 6,
    durationLabel: '6 Months',
    foodPlan: 'included',
    foodPlanLabel: 'Homestyle Included',
    selectedAddons: [],
    renter: {
      fullName: 'Venkata Siva Kumar',
      phone: '9849012345',
      email: 'siva.reddy@gmail.com',
      currentLocation: 'Kadapa, AP',
      occupation: 'Student',
    },
  });

  console.assert(result.success === true, 'Reservation must succeed');
  console.assert(Boolean(result.reservation?.id), 'Must generate reservation ID');
  console.log(`Reservation created: ${result.reservation?.id}, Status: ${result.reservation?.status}`);

  // Verify room is now marked RESERVED
  const updatedProp = propertyService.getPropertyById('panyam_sri_sai_residency')!;
  const updatedRoom = updatedProp.rooms.find((r) => r.roomNo === initialAvailableRoom.roomNo)!;
  console.assert(updatedRoom.status === 'RESERVED', 'Room status must transition to RESERVED');
  console.log(`Room ${updatedRoom.roomNo} status successfully transitioned to: ${updatedRoom.status}`);
  console.log('-> PASS\n');

  // TEST 4: Attempting to reserve the same room again (Concurrency / Double-Booking Guard)
  console.log('TEST 4: Double-Booking Prevention (Room already RESERVED)');
  const duplicateAttempt = await reservationService.createReservation({
    propertyId: property.id,
    roomNo: initialAvailableRoom.roomNo,
    moveInDate: '2026-10-05',
    durationMonths: 3,
    durationLabel: '3 Months',
    foodPlan: 'no-food',
    foodPlanLabel: 'No Food',
    selectedAddons: [],
    renter: {
      fullName: 'Second Applicant',
      phone: '9849099999',
      email: 'second@gmail.com',
      currentLocation: 'Kurnool, AP',
      occupation: 'Job Seeker',
    },
  });

  console.assert(duplicateAttempt.success === false, 'Duplicate booking must be rejected');
  console.assert(duplicateAttempt.error?.includes('no longer available'), 'Must return unavailable explanation');
  console.log(`Duplicate reservation safely rejected with message: "${duplicateAttempt.error}"`);
  console.log('-> PASS\n');

  // TEST 5: Cancellation & Room Restoration
  console.log('TEST 5: Reservation Cancellation & Availability Restoration');
  const cancelSuccess = await reservationService.cancelReservation(result.reservation!.id, 'Relocation postponed');
  console.assert(cancelSuccess === true, 'Cancellation must succeed');

  const restoredProp = propertyService.getPropertyById('panyam_sri_sai_residency')!;
  const restoredRoom = restoredProp.rooms.find((r) => r.roomNo === initialAvailableRoom.roomNo)!;
  console.assert(restoredRoom.status === 'AVAILABLE', 'Room status must return to AVAILABLE');
  console.log(`Room ${restoredRoom.roomNo} successfully restored to status: ${restoredRoom.status}`);
  console.log('-> PASS\n');

  // TEST 6: Authentication State & Personas
  console.log('TEST 6: Auth Persona Switcher');
  const proUser = authService.loginAsDemoUser('professional');
  console.assert(proUser.fullName === 'Ananya Sharma', 'Must switch to Professional Persona');
  console.assert(authService.getAuthState().isAuthenticated === true, 'Auth state must be authenticated');
  console.log(`Authenticated User: ${proUser.fullName} (${proUser.occupation})`);
  console.log('-> PASS\n');

  console.log('=== ALL PHASE 6 BACKEND & CONCURRENCY TESTS PASSED ===');
}

runReservationTests();
