/**
 * AWS Lambda Handler: Properties & Rooms API
 * Runtime: Node.js 20.x (TypeScript)
 * Event: API Gateway HTTP API v2 / REST API Proxy Event
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  QueryCommand,
  GetCommand,
  ScanCommand,
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
  'Access-Control-Allow-Methods': 'GET,OPTIONS',
};

export const handler = async (event: any): Promise<any> => {
  const requestId = event.requestContext?.requestId || 'req_local';
  const method = event.requestContext?.http?.method || event.httpMethod || 'GET';
  const path = event.rawPath || event.path || '';
  const pathParams = event.pathParameters || {};
  const queryParams = event.queryStringParameters || {};

  console.log(`[CloudWatch] RequestID: ${requestId} | Method: ${method} | Path: ${path}`);

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true }),
    };
  }

  try {
    // 1. GET /api/properties/{propertyId}/rooms
    if (path.includes('/rooms') && pathParams.propertyId) {
      const propertyId = pathParams.propertyId;
      console.log(`[CloudWatch] Fetching rooms for property: ${propertyId}`);

      const queryResult = await docClient.send(
        new QueryCommand({
          TableName: TABLE_NAME,
          KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
          ExpressionAttributeValues: {
            ':pk': `PROPERTY#${propertyId}`,
            ':skPrefix': 'ROOM#',
          },
        })
      );

      const rooms = queryResult.Items || [];
      const availableRooms = rooms.filter((r: any) => r.status === 'AVAILABLE');

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          data: {
            propertyId,
            roomsCount: rooms.length,
            availableRoomsCount: availableRooms.length,
            rooms,
          },
        }),
      };
    }

    // 2. GET /api/rooms/{roomId}/availability
    if (path.includes('/availability') && pathParams.roomId) {
      const roomId = pathParams.roomId;
      const propertyId = queryParams.propertyId;

      let roomItem: any = null;

      if (propertyId) {
        const getResult = await docClient.send(
          new GetCommand({
            TableName: TABLE_NAME,
            Key: {
              PK: `PROPERTY#${propertyId}`,
              SK: `ROOM#${roomId}`,
            },
          })
        );
        roomItem = getResult.Item;
      } else {
        // Query by room number scan if propertyId not provided
        const scanResult = await docClient.send(
          new ScanCommand({
            TableName: TABLE_NAME,
            FilterExpression: 'SK = :roomSk AND entityType = :type',
            ExpressionAttributeValues: {
              ':roomSk': `ROOM#${roomId}`,
              ':type': 'ROOM',
            },
            Limit: 1,
          })
        );
        roomItem = scanResult.Items?.[0];
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          data: {
            roomId,
            status: roomItem?.status || 'AVAILABLE',
            propertyId: roomItem?.propertyId || propertyId || '',
            lastUpdated: roomItem?.lastUpdatedAt || new Date().toISOString(),
          },
        }),
      };
    }

    // 3. GET /api/properties/{propertyId} (Single property detail)
    if (pathParams.propertyId) {
      const propertyId = pathParams.propertyId;
      console.log(`[CloudWatch] Fetching property metadata: ${propertyId}`);

      const propResult = await docClient.send(
        new GetCommand({
          TableName: TABLE_NAME,
          Key: {
            PK: `PROPERTY#${propertyId}`,
            SK: 'METADATA',
          },
        })
      );

      if (!propResult.Item) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({
            success: false,
            error: {
              code: 'PROPERTY_NOT_FOUND',
              message: `Property with id ${propertyId} was not found.`,
            },
          }),
        };
      }

      // Also fetch its rooms to return complete property detail
      const roomsResult = await docClient.send(
        new QueryCommand({
          TableName: TABLE_NAME,
          KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
          ExpressionAttributeValues: {
            ':pk': `PROPERTY#${propertyId}`,
            ':skPrefix': 'ROOM#',
          },
        })
      );

      const propertyData = {
        ...propResult.Item,
        rooms: roomsResult.Items || [],
      };

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          data: propertyData,
        }),
      };
    }

    // 4. GET /api/properties (All properties with optional city/destination filter)
    const destination = queryParams.destination || 'All';
    console.log(`[CloudWatch] Fetching properties listing. Destination: ${destination}`);

    let properties: any[] = [];

    if (destination && destination.toLowerCase() !== 'all') {
      const queryResult = await docClient.send(
        new QueryCommand({
          TableName: TABLE_NAME,
          IndexName: 'GSI1',
          KeyConditionExpression: 'GSI1PK = :gsi1pk',
          ExpressionAttributeValues: {
            ':gsi1pk': `DESTINATION#${destination.toUpperCase()}`,
          },
        })
      );
      properties = queryResult.Items || [];
    } else {
      const scanResult = await docClient.send(
        new ScanCommand({
          TableName: TABLE_NAME,
          FilterExpression: 'SK = :sk AND entityType = :type',
          ExpressionAttributeValues: {
            ':sk': 'METADATA',
            ':type': 'PROPERTY',
          },
        })
      );
      properties = scanResult.Items || [];
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: {
          destination,
          count: properties.length,
          properties,
        },
      }),
    };
  } catch (error: any) {
    console.error(`[CloudWatch] Error in Properties Lambda:`, error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Unable to retrieve property data from cloud database.',
        },
      }),
    };
  }
};
