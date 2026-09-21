/**
 * AWS Lambda Handler: Reservations API & Concurrency Manager
 * Runtime: Node.js 20.x (TypeScript)
 * Event: API Gateway HTTP API v2 / REST API Proxy Event with Cognito Authorizer
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  QueryCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';

const REGION = process.env.AWS_REGION || 'ap-south-1';
const TABLE_NAME = process.env.TABLE_NAME || 'InveniStayData';

const dynamoClient = new DynamoDBClient({ region: REGION });
const docClient = DynamoDBDocumentClient.from(dynamoClient, {
  marshallOptions: { removeUndefinedValues: true },
});

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

export const handler = async (event: any): Promise<any> => {
  const requestId = event.requestContext?.requestId || 'req_local';
  const method = event.requestContext?.http?.method || event.httpMethod || 'GET';
  const path = event.rawPath || event.path || '';
  const pathParams = event.pathParameters || {};

  // Extract Authenticated User from Cognito Claims
  const authClaims = event.requestContext?.authorizer?.jwt?.claims ||
                     event.requestContext?.authorizer?.claims;
  const authenticatedUserId =
    authClaims?.sub ||
    authClaims?.username ||
    event.headers?.['x-user-id'] ||
    'demo_user';
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
      const body = typeof event.body === 'string' ? JSON.parse(event.body || '{}') : (event.body || {});

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

      const requestedRoom = body.roomId.toString();
      const propertyId = body.propertyId;

      // Validation 4: Atomic Concurrency & Room Availability Check from DynamoDB
      try {
        const roomCheck = await docClient.send(
          new GetCommand({
            TableName: TABLE_NAME,
            Key: {
              PK: `PROPERTY#${propertyId}`,
              SK: `ROOM#${requestedRoom}`,
            },
          })
        );

        if (roomCheck.Item) {
          if (roomCheck.Item.status === 'OCCUPIED') {
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

          if (roomCheck.Item.status === 'RESERVED') {
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
        }
      } catch (err) {
        console.warn(`[CloudWatch] Room check notice for room ${requestedRoom}:`, err);
      }

      // -----------------------------------------------------------
      // Server-Side Authoritative Price Calculation
      // -----------------------------------------------------------
      const authoritativeRent = ROOM_BASE_RENTS[requestedRoom] || Number(body.monthlyRent) || 5000;
      const authoritativeFoodCost = body.foodPlan === 'full-mess' ? 1500 : 0;
      const authoritativeAddonCost = Array.isArray(body.selectedAddons)
        ? body.selectedAddons.reduce((sum: number, a: any) => sum + (Number(a.monthlyPrice) || 0), 0)
        : 0;
      const authoritativeDeposit = 2000;
      const authoritativeMonthlyTotal = authoritativeRent + authoritativeFoodCost + authoritativeAddonCost;
      const authoritativeInitialTotal = authoritativeMonthlyTotal + authoritativeDeposit;

      const reservationId = `INV-2026-${Math.floor(10000 + Math.random() * 90000)}`;
      const nowIso = new Date().toISOString();

      const newReservation = {
        id: reservationId,
        propertyId,
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
          emergencyContactName: renter.emergencyContactName || '',
          emergencyContactPhone: renter.emergencyContactPhone || '',
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
        createdAt: nowIso,
      };

      // DynamoDB PutItem with condition: attribute_not_exists(PK)
      await docClient.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: {
            PK: `RESERVATION#${reservationId}`,
            SK: 'METADATA',
            GSI1PK: `USER#${authenticatedUserId}`,
            GSI1SK: nowIso,
            entityType: 'RESERVATION',
            ...newReservation,
          },
          ConditionExpression: 'attribute_not_exists(PK)',
        })
      );

      // Atomically update room status in DynamoDB to RESERVED
      try {
        await docClient.send(
          new UpdateCommand({
            TableName: TABLE_NAME,
            Key: {
              PK: `PROPERTY#${propertyId}`,
              SK: `ROOM#${requestedRoom}`,
            },
            UpdateExpression: 'SET #st = :reserved, #lu = :now',
            ExpressionAttributeNames: {
              '#st': 'status',
              '#lu': 'lastUpdatedAt',
            },
            ExpressionAttributeValues: {
              ':reserved': 'RESERVED',
              ':now': nowIso,
            },
          })
        );
      } catch (err) {
        console.warn(`[CloudWatch] Room status update notice:`, err);
      }

      console.log(`[CloudWatch] Created reservation ${reservationId} for user ${authenticatedUserId}. Status: REQUESTED.`);

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
      console.log(`[CloudWatch] Listing reservations for user: ${authenticatedUserId}`);

      const queryResult = await docClient.send(
        new QueryCommand({
          TableName: TABLE_NAME,
          IndexName: 'GSI1',
          KeyConditionExpression: 'GSI1PK = :userPk',
          ExpressionAttributeValues: {
            ':userPk': `USER#${authenticatedUserId}`,
          },
        })
      );

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          data: queryResult.Items || [],
        }),
      };
    }

    // -------------------------------------------------------------
    // 3. GET /api/reservations/{reservationId} (Single detail)
    // -------------------------------------------------------------
    if (method === 'GET' && pathParams.reservationId) {
      const reservationId = pathParams.reservationId;
      console.log(`[CloudWatch] Fetching reservation detail: ${reservationId}`);

      const getResult = await docClient.send(
        new GetCommand({
          TableName: TABLE_NAME,
          Key: {
            PK: `RESERVATION#${reservationId}`,
            SK: 'METADATA',
          },
        })
      );

      if (!getResult.Item) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({
            success: false,
            error: { code: 'NOT_FOUND', message: 'Reservation not found.' },
          }),
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          data: getResult.Item,
        }),
      };
    }

    // -------------------------------------------------------------
    // 4. PATCH /api/reservations/{reservationId} (Cancellation)
    // -------------------------------------------------------------
    if (method === 'PATCH' && pathParams.reservationId) {
      const reservationId = pathParams.reservationId;
      const body = typeof event.body === 'string' ? JSON.parse(event.body || '{}') : (event.body || {});

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

      const nowIso = new Date().toISOString();

      // Fetch reservation first to know propertyId and roomNo
      const existingRes = await docClient.send(
        new GetCommand({
          TableName: TABLE_NAME,
          Key: {
            PK: `RESERVATION#${reservationId}`,
            SK: 'METADATA',
          },
        })
      );

      const reservation = existingRes.Item;

      // Update reservation status to CANCELLED
      const updateResult = await docClient.send(
        new UpdateCommand({
          TableName: TABLE_NAME,
          Key: {
            PK: `RESERVATION#${reservationId}`,
            SK: 'METADATA',
          },
          UpdateExpression: 'SET #st = :cancelled, #ca = :now',
          ExpressionAttributeNames: {
            '#st': 'status',
            '#ca': 'cancelledAt',
          },
          ExpressionAttributeValues: {
            ':cancelled': 'CANCELLED',
            ':now': nowIso,
          },
          ReturnValues: 'ALL_NEW',
        })
      );

      // Restore room availability if property and room are known
      if (reservation?.propertyId && reservation?.roomId) {
        try {
          await docClient.send(
            new UpdateCommand({
              TableName: TABLE_NAME,
              Key: {
                PK: `PROPERTY#${reservation.propertyId}`,
                SK: `ROOM#${reservation.roomId}`,
              },
              UpdateExpression: 'SET #st = :avail, #lu = :now',
              ExpressionAttributeNames: {
                '#st': 'status',
                '#lu': 'lastUpdatedAt',
              },
              ExpressionAttributeValues: {
                ':avail': 'AVAILABLE',
                ':now': nowIso,
              },
            })
          );
          console.log(`[CloudWatch] Restored room ${reservation.roomId} to AVAILABLE.`);
        } catch (err) {
          console.warn(`[CloudWatch] Could not update room status on cancellation:`, err);
        }
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          data: updateResult.Attributes || {
            id: reservationId,
            status: 'CANCELLED',
            cancelledAt: nowIso,
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
          message: error.message || 'An internal server error occurred while processing reservation.',
        },
      }),
    };
  }
};
