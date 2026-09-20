/**
 * AWS Lambda Handler: Properties & Rooms API
 * Runtime: Node.js 20.x (TypeScript)
 * Event: API Gateway HTTP API / REST API Proxy Event
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

// DynamoDB DocumentClient would be initialized here when running in AWS:
// import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
// import { DynamoDBDocumentClient, QueryCommand, GetCommand } from '@aws-sdk/lib-dynamodb';

const TABLE_NAME = process.env.TABLE_NAME || 'InveniStayData';

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Amz-Date,X-Api-Key',
  'Access-Control-Allow-Methods': 'GET,OPTIONS',
};

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const requestId = event.requestContext?.requestId || 'req_local';
  const method = event.httpMethod;
  const path = event.path;
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
    // 1. GET /api/properties/:propertyId/rooms
    if (path.includes('/rooms') && pathParams.propertyId) {
      const propertyId = pathParams.propertyId;
      console.log(`[CloudWatch] Fetching rooms for property: ${propertyId}`);

      // Query DynamoDB: PK = PROPERTY#${propertyId}, SK begins_with ROOM#
      // In production:
      // const res = await docClient.send(new QueryCommand({
      //   TableName: TABLE_NAME,
      //   KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
      //   ExpressionAttributeValues: {
      //     ':pk': `PROPERTY#${propertyId}`,
      //     ':skPrefix': 'ROOM#',
      //   }
      // }));

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          data: {
            propertyId,
            roomsCount: 4,
            availableRoomsCount: 3,
          },
        }),
      };
    }

    // 2. GET /api/rooms/:roomId/availability
    if (path.includes('/availability') && pathParams.roomId) {
      const roomId = pathParams.roomId;
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          data: {
            roomId,
            status: 'AVAILABLE',
            lastUpdated: new Date().toISOString(),
          },
        }),
      };
    }

    // 3. GET /api/properties/:propertyId (Single property detail)
    if (pathParams.propertyId) {
      const propertyId = pathParams.propertyId;
      console.log(`[CloudWatch] Fetching property metadata: ${propertyId}`);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          data: {
            id: propertyId,
            name: 'Sri Sai Luxury PG & Residency',
            town: 'Panyam',
            district: 'Nandyal',
            state: 'Andhra Pradesh',
            propertyType: 'PG',
            startingRent: 4200,
          },
        }),
      };
    }

    // 4. GET /api/properties (All properties with optional city filter)
    const destination = queryParams.destination || 'All';
    console.log(`[CloudWatch] Fetching properties listing. Destination: ${destination}`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: {
          destination,
          count: 6,
          properties: [],
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
          message: 'Unable to retrieve property data from cloud database.',
        },
      }),
    };
  }
};
