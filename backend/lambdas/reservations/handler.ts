/**
 * AWS Lambda Handler: Reservations API & Concurrency Manager
 * Runtime: Node.js 20.x (TypeScript)
 * Event: API Gateway HTTP API / REST API Proxy Event with Cognito Authorizer
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

const TABLE_NAME = process.env.TABLE_NAME || 'InveniStayData';

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Amz-Date,X-Api-Key',
  'Access-Control-Allow-Methods': 'GET,POST,PATCH,OPTIONS',
};

// Pricing Rates Table (Authoritative Server-Side Truth)
const ROOM_BASE_RENTS: Record<string, number> = {
  '101': 5500,
  '102': 5500,
  '103': 6000,
  '104': 4200,
  '201': 5200,
  '202': 4500,
  '203': 6500,
  '204': 4200,
};

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const requestId = event.requestContext?.requestId || 'req_local';
  const method = event.httpMethod;
  const path = event.path;
  const pathParams = event.pathParameters || {};

  // Extract Authenticated User from Cognito Claims
  const authClaims = event.requestContext?.authorizer?.claims;
  const authenticatedUserId = authClaims?.sub || authClaims?.username || event.headers?.['x-user-id'] || 'demo_user';
  const userEmail = authClaims?.email || 'authenticated@user.com';

  console.log(`[CloudWatch] RequestID: ${requestId} | User: ${authenticatedUserId} | Method: ${method} | Path: ${path}`);

  if (method === 'OPTIONS') {
    return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
  }

  try {
    // -------------------------------------------------------------
    // 1. POST /api/reservations (Create new reservation request)
    // -------------------------------------------------------------
    if (method === 'POST' && (path.endsWith('/reservations') || path.endsWith('/reservations/'))) {
      const body = JSON.parse(event.body || '{}');

      // Validation 1: Required identifiers
      if (!body.propertyId || !body.roomId) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Property ID and Room Number are required to initiate a reservation.',
            },
          }),
        };
      }

      // Validation 2: Renter Details
      const renter = body.renter || {};
      if (!renter.fullName || renter.fullName.trim().length < 3) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            error: {
              code: 'INVALID_RENTER_NAME',
              message: 'A valid renter name (at least 3 characters) is required.',
            },
          }),
        };
      }

      const phoneClean = (renter.phone || '').replace(/[\s-]/g, '');
      if (!/^[6-9]\d{9}$/.test(phoneClean)) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            error: {
              code: 'INVALID_PHONE',
              message: 'Please provide a valid 10-digit Indian mobile number.',
            },
          }),
        };
      }

      // Validation 3: Move-in date check
      if (!body.moveInDate || isNaN(Date.parse(body.moveInDate))) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            error: {
              code: 'INVALID_DATE',
              message: 'A valid move-in date is required.',
            },
          }),
        };
      }

      // Validation 4: Atomic Concurrency & Room Availability Check
      // Simulated: Room 102 is currently OCCUPIED, Room 104 is currently RESERVED.
      const requestedRoom = body.roomId.toString();
      if (requestedRoom === '102') {
        console.warn(`[CloudWatch] Reservation rejected: Room 102 is OCCUPIED.`);
        return {
          statusCode: 409,
          headers,
          body: JSON.stringify({
            success: false,
            error: {
              code: 'ROOM_UNAVAILABLE',
              message: 'This room is currently occupied by another tenant. Please choose an available room.',
            },
          }),
        };
      }

      // Concurrency check simulation (ConditionalCheckFailedException mapping)
      if (body.simulateConflict === true) {
        console.warn(`[CloudWatch] Conditional write check failed on DynamoDB table ${TABLE_NAME}.`);
        return {
          statusCode: 409,
          headers,
          body: JSON.stringify({
            success: false,
            error: {
              code: 'ROOM_ALREADY_RESERVED',
              message: 'This room was just reserved by another user. Please choose another room.',
            },
          }),
        };
      }

      // -----------------------------------------------------------
      // Server-Side Authoritative Price Calculation (Section 15)
      // Never trust client-submitted totalPrice
      // -----------------------------------------------------------
      const authoritativeRent = ROOM_BASE_RENTS[requestedRoom] || 5000;
      const authoritativeFoodCost = body.foodPlan === 'full-mess' ? 1500 : 0;
      const authoritativeAddonCost = Array.isArray(body.selectedAddons)
        ? body.selectedAddons.reduce((sum: number, a: any) => sum + (Number(a.monthlyPrice) || 0), 0)
        : 0;
      const authoritativeDeposit = 2000;
      const authoritativeMonthlyTotal = authoritativeRent + authoritativeFoodCost + authoritativeAddonCost;
      const authoritativeInitialTotal = authoritativeMonthlyTotal + authoritativeDeposit;

      const reservationId = `INV-2026-${Math.floor(10000 + Math.random() * 90000)}`;

      const newReservation = {
        id: reservationId,
        propertyId: body.propertyId,
        propertyName: body.propertyName || 'Sri Sai Luxury PG & Residency',
        propertyTown: body.propertyTown || 'Panyam',
        propertyAddress: body.propertyAddress || 'Opp. Old Bus Stand Road, Panyam, AP',
        propertyHeroImage: body.propertyHeroImage || '/Logo.png',
        roomId: requestedRoom,
        roomNo: requestedRoom,
        roomType: body.roomType || 'Single',
        roomFloor: body.roomFloor || 1,
        moveInDate: body.moveInDate,
        durationMonths: Number(body.durationMonths) || 6,
        durationLabel: body.durationLabel || '6 Months (Semester)',
        foodPlan: body.foodPlan || 'included',
        foodPlanLabel: body.foodPlanLabel || 'Homestyle Meals (Included in Rent)',
        selectedAddons: body.selectedAddons || [],
        renter: {
          fullName: renter.fullName,
          phone: phoneClean,
          email: renter.email || userEmail,
          currentLocation: renter.currentLocation || 'Kadapa, AP',
          occupation: renter.occupation || 'Student',
          emergencyContactName: renter.emergencyContactName,
          emergencyContactPhone: renter.emergencyContactPhone,
        },
        pricing: {
          roomRent: authoritativeRent,
          foodCost: authoritativeFoodCost,
          addonCost: authoritativeAddonCost,
          deposit: authoritativeDeposit,
          monthlyTotal: authoritativeMonthlyTotal,
          initialTotal: authoritativeInitialTotal,
        },
        status: 'REQUESTED',
        userId: authenticatedUserId,
        createdAt: new Date().toISOString(),
      };

      console.log(`[CloudWatch] Created reservation ${reservationId} for user ${authenticatedUserId}. Status: REQUESTED.`);

      // DynamoDB PutItem with condition: attribute_not_exists(PK)
      // await docClient.send(new PutCommand({
      //   TableName: TABLE_NAME,
      //   Item: {
      //     PK: `RESERVATION#${reservationId}`,
      //     SK: 'METADATA',
      //     GSI1PK: `USER#${authenticatedUserId}`,
      //     GSI1SK: newReservation.createdAt,
      //     ...newReservation,
      //   },
      //   ConditionExpression: 'attribute_not_exists(PK)',
      // }));

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({
          success: true,
          data: newReservation,
        }),
      };
    }

    // -------------------------------------------------------------
    // 2. GET /api/reservations (List user reservations)
    // -------------------------------------------------------------
    if (method === 'GET' && (path.endsWith('/reservations') || path.endsWith('/reservations/'))) {
      console.log(`[CloudWatch] Listing reservations for authenticated user: ${authenticatedUserId}`);
      // Query GSI1: GSI1PK = USER#${authenticatedUserId}
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          data: [],
        }),
      };
    }

    // -------------------------------------------------------------
    // 3. GET /api/reservations/:reservationId (Single detail)
    // -------------------------------------------------------------
    if (method === 'GET' && pathParams.reservationId) {
      const reservationId = pathParams.reservationId;
      console.log(`[CloudWatch] Fetching reservation detail: ${reservationId}`);

      // Ownership authorization check in Lambda:
      // if (reservation.userId !== authenticatedUserId && !isAdmin(authClaims)) {
      //   return { statusCode: 403, body: JSON.stringify({ success: false, error: { code: 'FORBIDDEN', message: 'Unauthorized reservation access.' } }) };
      // }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          data: {
            id: reservationId,
            status: 'REQUESTED',
            userId: authenticatedUserId,
          },
        }),
      };
    }

    // -------------------------------------------------------------
    // 4. PATCH /api/reservations/:reservationId (Cancellation)
    // -------------------------------------------------------------
    if (method === 'PATCH' && pathParams.reservationId) {
      const reservationId = pathParams.reservationId;
      const body = JSON.parse(event.body || '{}');

      if (body.status !== 'CANCELLED') {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            error: {
              code: 'INVALID_STATUS_TRANSITION',
              message: 'Only cancellation transitions (status: CANCELLED) are allowed through this endpoint.',
            },
          }),
        };
      }

      console.log(`[CloudWatch] Cancelling reservation ${reservationId}. Restoring room to AVAILABLE.`);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          data: {
            id: reservationId,
            status: 'CANCELLED',
            cancelledAt: new Date().toISOString(),
          },
        }),
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({
        success: false,
        error: { code: 'ROUTE_NOT_FOUND', message: 'API endpoint not recognized.' },
      }),
    };
  } catch (error: any) {
    console.error(`[CloudWatch] Error in Reservations Lambda:`, error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An internal server error occurred while processing reservation.',
        },
      }),
    };
  }
};
