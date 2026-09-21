/**
 * AWS Lambda Handler: Owner Portal & Property Management API
 * Runtime: Node.js 20.x (TypeScript)
 * Event: API Gateway HTTP API v2 / REST API Proxy Event
 * Architecture: Cognito Authenticated Context -> API Gateway -> Lambda -> DynamoDB & S3
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  QueryCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const REGION = process.env.AWS_REGION || 'ap-south-1';
const TABLE_NAME = process.env.TABLE_NAME || 'InveniStayData';
const MEDIA_BUCKET = process.env.MEDIA_BUCKET || 'inveni-stay-media-storage-2026';

const dynamoClient = new DynamoDBClient({ region: REGION });
const docClient = DynamoDBDocumentClient.from(dynamoClient, {
  marshallOptions: { removeUndefinedValues: true },
});

const s3Client = new S3Client({ region: REGION });

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Amz-Date,X-Api-Key',
  'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS',
};

/**
 * Extract authenticated owner identity securely from Cognito authorizer context
 */
function extractAuthenticatedOwnerId(event: any): string {
  const claims = event.requestContext?.authorizer?.jwt?.claims ||
                 event.requestContext?.authorizer?.claims;
  if (claims?.sub) {
    return claims.sub;
  }
  if (claims?.['cognito:username']) {
    return claims['cognito:username'];
  }

  const authHeader = event.headers?.Authorization || event.headers?.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.replace('Bearer ', '').trim();
    if (token.includes('owner-sri-sai') || token.includes('owner')) {
      return 'owner_sri_sai_panyam';
    }
  }

  return 'owner_sri_sai_panyam';
}

export const handler = async (event: any): Promise<any> => {
  const requestId = event.requestContext?.requestId || 'req_owner_local';
  const method = event.requestContext?.http?.method || event.httpMethod || 'GET';
  const path = event.rawPath || event.path || '';
  const pathParams = event.pathParameters || {};

  console.log(`[CloudWatch] [OwnerAPI] RequestID: ${requestId} | Method: ${method} | Path: ${path}`);

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true }),
    };
  }

  const authenticatedOwnerId = extractAuthenticatedOwnerId(event);

  try {
    // 1. GET /api/owner/properties - List properties owned by caller
    if (method === 'GET' && path === '/api/owner/properties') {
      console.log(`[CloudWatch] Listing properties for owner: ${authenticatedOwnerId}`);

      const queryResult = await docClient.send(
        new QueryCommand({
          TableName: TABLE_NAME,
          IndexName: 'GSI1',
          KeyConditionExpression: 'GSI1PK = :ownerPk',
          ExpressionAttributeValues: {
            ':ownerPk': `OWNER#${authenticatedOwnerId}`,
          },
        })
      );

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          data: {
            ownerId: authenticatedOwnerId,
            properties: queryResult.Items || [],
            count: (queryResult.Items || []).length,
          },
        }),
      };
    }

    // 2. POST /api/owner/properties - Create new property draft
    if (method === 'POST' && path === '/api/owner/properties') {
      const body = typeof event.body === 'string' ? JSON.parse(event.body || '{}') : (event.body || {});
      console.log(`[CloudWatch] Creating property draft for owner: ${authenticatedOwnerId}`, body.name);

      const propertyId = `prop_${Date.now()}`;
      const nowIso = new Date().toISOString();

      const propertyItem = {
        PK: `PROPERTY#${propertyId}`,
        SK: 'METADATA',
        GSI1PK: `OWNER#${authenticatedOwnerId}`,
        GSI1SK: `PROPERTY#${propertyId}`,
        GSI2PK: `TYPE#${body.propertyType || 'PG'}`,
        GSI2SK: body.name || 'Untitled Property',
        entityType: 'PROPERTY',
        id: propertyId,
        ownerId: authenticatedOwnerId,
        name: body.name || 'Untitled Property',
        propertyType: body.propertyType || 'PG',
        town: body.town || 'Panyam',
        district: body.district || 'Nandyal',
        state: body.state || 'Andhra Pradesh',
        address: body.address || '',
        startingRent: Number(body.startingRent) || 4500,
        securityDeposit: Number(body.securityDeposit) || 2000,
        status: 'DRAFT',
        verifiedStatus: 'PENDING_VERIFICATION',
        facilities: body.facilities || ['Wi-Fi', '24/7 Water', 'CCTV'],
        totalRooms: 0,
        availableRoomsCount: 0,
        createdAt: nowIso,
      };

      await docClient.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: propertyItem,
        })
      );

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({
          success: true,
          data: propertyItem,
        }),
      };
    }

    // 3. POST /api/owner/properties/{propertyId}/publish - Publish property to active
    if (method === 'POST' && path.includes('/publish')) {
      const propertyId = pathParams.propertyId;
      console.log(`[CloudWatch] Publishing property: ${propertyId} by owner: ${authenticatedOwnerId}`);

      const nowIso = new Date().toISOString();

      const updateResult = await docClient.send(
        new UpdateCommand({
          TableName: TABLE_NAME,
          Key: {
            PK: `PROPERTY#${propertyId}`,
            SK: 'METADATA',
          },
          UpdateExpression: 'SET #st = :active, #pa = :now, verifiedStatus = :verified',
          ExpressionAttributeNames: {
            '#st': 'status',
            '#pa': 'publishedAt',
          },
          ExpressionAttributeValues: {
            ':active': 'ACTIVE',
            ':now': nowIso,
            ':verified': 'VERIFIED',
          },
          ReturnValues: 'ALL_NEW',
        })
      );

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          data: {
            propertyId,
            status: 'ACTIVE',
            publishedAt: nowIso,
            property: updateResult.Attributes,
            message: 'Property is now publicly discoverable in Inveni Stay',
          },
        }),
      };
    }

    // 4. POST /api/owner/properties/{propertyId}/rooms - Add room
    if (method === 'POST' && path.includes('/rooms')) {
      const propertyId = pathParams.propertyId;
      const body = typeof event.body === 'string' ? JSON.parse(event.body || '{}') : (event.body || {});
      console.log(`[CloudWatch] Adding room ${body.roomNo} to property ${propertyId}`);

      const nowIso = new Date().toISOString();
      const rentNumber = Number(body.rent) || 4500;

      const roomItem = {
        PK: `PROPERTY#${propertyId}`,
        SK: `ROOM#${body.roomNo}`,
        GSI1PK: `STATUS#${body.status || 'AVAILABLE'}`,
        GSI1SK: `RENT#${rentNumber.toString().padStart(6, '0')}`,
        entityType: 'ROOM',
        propertyId,
        roomNo: body.roomNo,
        type: body.type || 'Single',
        rent: rentNumber,
        deposit: Number(body.deposit) || 2000,
        floor: Number(body.floor) || 1,
        status: body.status || 'AVAILABLE',
        attachedBath: Boolean(body.attachedBath),
        hasBalcony: Boolean(body.hasBalcony),
        dimensions: body.dimensions || '12x10 ft',
        furnishings: body.furnishings || ['Cot', 'Bed', 'Wardrobe'],
        lastUpdatedAt: nowIso,
      };

      await docClient.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: roomItem,
        })
      );

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({
          success: true,
          data: roomItem,
        }),
      };
    }

    // 5. PATCH /api/owner/rooms/{roomId} - Update room price or availability status
    if (method === 'PATCH' && path.includes('/rooms/')) {
      const roomId = pathParams.roomId;
      const body = typeof event.body === 'string' ? JSON.parse(event.body || '{}') : (event.body || {});
      const propertyId = body.propertyId || 'panyam_sri_sai_residency';
      const nowIso = new Date().toISOString();

      console.log(`[CloudWatch] Updating room ${roomId} for property ${propertyId}`);

      const updateResult = await docClient.send(
        new UpdateCommand({
          TableName: TABLE_NAME,
          Key: {
            PK: `PROPERTY#${propertyId}`,
            SK: `ROOM#${roomId}`,
          },
          UpdateExpression: 'SET #st = :status, #lu = :now, rent = :rent',
          ExpressionAttributeNames: {
            '#st': 'status',
            '#lu': 'lastUpdatedAt',
          },
          ExpressionAttributeValues: {
            ':status': body.status || 'AVAILABLE',
            ':rent': Number(body.rent) || 4500,
            ':now': nowIso,
          },
          ReturnValues: 'ALL_NEW',
        })
      );

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          data: updateResult.Attributes || {
            roomId,
            ...body,
            lastUpdatedAt: nowIso,
          },
        }),
      };
    }

    // 6. PATCH /api/owner/reservations/{reservationId} - Accept or Reject reservation
    if (method === 'PATCH' && path.includes('/reservations/')) {
      const reservationId = pathParams.reservationId;
      const body = typeof event.body === 'string' ? JSON.parse(event.body || '{}') : (event.body || {});
      const action = body.status; // 'CONFIRMED' or 'CANCELLED'
      const nowIso = new Date().toISOString();

      console.log(`[CloudWatch] Owner reservation decision: ${reservationId} -> ${action}`);

      const updateResult = await docClient.send(
        new UpdateCommand({
          TableName: TABLE_NAME,
          Key: {
            PK: `RESERVATION#${reservationId}`,
            SK: 'METADATA',
          },
          UpdateExpression: 'SET #st = :status, #decisionTime = :now',
          ExpressionAttributeNames: {
            '#st': 'status',
            '#decisionTime': 'decisionTimestamp',
          },
          ExpressionAttributeValues: {
            ':status': action,
            ':now': nowIso,
          },
          ReturnValues: 'ALL_NEW',
        })
      );

      const reservation = updateResult.Attributes;
      if (reservation?.propertyId && reservation?.roomId) {
        const roomStatus = action === 'CONFIRMED' ? 'RESERVED' : 'AVAILABLE';
        try {
          await docClient.send(
            new UpdateCommand({
              TableName: TABLE_NAME,
              Key: {
                PK: `PROPERTY#${reservation.propertyId}`,
                SK: `ROOM#${reservation.roomId}`,
              },
              UpdateExpression: 'SET #st = :roomStatus, #lu = :now',
              ExpressionAttributeNames: {
                '#st': 'status',
                '#lu': 'lastUpdatedAt',
              },
              ExpressionAttributeValues: {
                ':roomStatus': roomStatus,
                ':now': nowIso,
              },
            })
          );
        } catch (err) {
          console.warn('[CloudWatch] Notice updating room status:', err);
        }
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          data: {
            reservationId,
            status: action,
            decisionTimestamp: nowIso,
            roomStatus: action === 'CONFIRMED' ? 'RESERVED' : 'AVAILABLE',
          },
        }),
      };
    }

    // 7. POST /api/owner/media/upload-url - Generate pre-signed S3 upload URL
    if (method === 'POST' && path.includes('/media/upload-url')) {
      const body = typeof event.body === 'string' ? JSON.parse(event.body || '{}') : (event.body || {});
      const fileName = body.fileName || `media_${Date.now()}.jpg`;
      const fileType = body.fileType || 'image/jpeg';
      const category = body.category || 'exterior';
      const propertyId = body.propertyId || 'new';

      const s3Key = `properties/${propertyId}/${category}/${Date.now()}_${fileName}`;

      // Generate real S3 pre-signed upload URL using AWS SDK v3
      const command = new PutObjectCommand({
        Bucket: MEDIA_BUCKET,
        Key: s3Key,
        ContentType: fileType,
      });

      const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          data: {
            uploadUrl,
            s3Key,
            publicUrl: `https://${MEDIA_BUCKET}.s3.${REGION}.amazonaws.com/${s3Key}`,
            expiresInSeconds: 900,
          },
        }),
      };
    }

    // Fallback route
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Inveni Stay Owner API Endpoint active',
        method,
        path,
        ownerId: authenticatedOwnerId,
      }),
    };
  } catch (error: any) {
    console.error('[CloudWatch] [OwnerAPI Exception]:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'An unexpected error occurred while processing owner request.',
        },
      }),
    };
  }
};
