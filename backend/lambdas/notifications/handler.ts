import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
  UpdateCommand,
  GetCommand,
} from '@aws-sdk/lib-dynamodb';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const sns = new SNSClient({});
const TABLE_NAME = process.env.TABLE_NAME || 'InveniStayData';
const SNS_TOPIC_ARN = process.env.NOTIFICATION_TOPIC_ARN || '';

const corsHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const sendResponse = (statusCode: number, body: any): APIGatewayProxyResultV2 => ({
  statusCode,
  headers: corsHeaders,
  body: JSON.stringify(body),
});

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  const method = event.requestContext.http.method;
  const path = event.rawPath;

  if (method === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders };
  }

  // Derive authenticated identity from Cognito Authorizer or fallback
  const claims = (event.requestContext as any).authorizer?.jwt?.claims;
  const authUserId = claims?.sub || claims?.username || (event.queryStringParameters?.userId) || 'usr_panyam_student_01';

  try {
    // 1. POST /api/events (Event Ingestion with Idempotency - Phase 8 Section 20, 21)
    if (method === 'POST' && path === '/api/events') {
      const payload = event.body ? JSON.parse(event.body) : {};
      const { eventId, eventType, timestamp, payload: eventData } = payload;

      if (!eventId || !eventType) {
        return sendResponse(400, { success: false, error: 'eventId and eventType required' });
      }

      // Idempotency conditional write: reject duplicate event execution
      try {
        await ddb.send(
          new PutCommand({
            TableName: TABLE_NAME,
            Item: {
              PK: `EVENT#${eventId}`,
              SK: 'METADATA',
              eventType,
              timestamp: timestamp || new Date().toISOString(),
              processedAt: new Date().toISOString(),
            },
            ConditionExpression: 'attribute_not_exists(PK)',
          })
        );
      } catch (err: any) {
        if (err.name === 'ConditionalCheckFailedException') {
          console.warn(`[Idempotency] Event ${eventId} already processed.`);
          return sendResponse(200, { success: true, duplicate: true, message: 'Event already processed' });
        }
        throw err;
      }

      // Map domain event to recipient notifications
      let targetUserId = '';
      let title = '';
      let message = '';
      let targetRoute = '';

      if (eventType === 'ReservationCreated') {
        targetUserId = eventData.ownerId;
        title = 'NEW RESERVATION REQUEST';
        message = `${eventData.renterName} requested Room ${eventData.roomNo} at ${eventData.propertyName}.`;
        targetRoute = `/owner/properties/${eventData.propertyId}/reservations`;
      } else if (eventType === 'ReservationConfirmed') {
        targetUserId = eventData.renterId;
        title = 'RESERVATION CONFIRMED';
        message = `Your reservation for Room ${eventData.roomNo} at ${eventData.propertyName} has been confirmed!`;
        targetRoute = '/my-stays';
      } else if (eventType === 'ReservationRejected') {
        targetUserId = eventData.renterId;
        title = 'RESERVATION REQUEST NOT ACCEPTED';
        message = `The owner could not accept your request for Room ${eventData.roomNo}. Reason: ${eventData.reason || 'Room unavailable'}.`;
        targetRoute = '/my-stays';
      } else if (eventType === 'ReservationCancelled') {
        targetUserId = eventData.ownerId;
        title = 'RESERVATION CANCELLED';
        message = `Reservation for Room ${eventData.roomNo} was cancelled.`;
        targetRoute = `/owner/properties/${eventData.propertyId}/reservations`;
      }

      if (targetUserId) {
        const notifId = `notif_${eventId}`;
        const createdAt = timestamp || new Date().toISOString();

        await ddb.send(
          new PutCommand({
            TableName: TABLE_NAME,
            Item: {
              PK: `USER#${targetUserId}`,
              SK: `NOTIFICATION#${createdAt}#${notifId}`,
              id: notifId,
              userId: targetUserId,
              type: eventType.toUpperCase(),
              title,
              message,
              targetRoute,
              read: false,
              createdAt,
              metadata: eventData,
            },
          })
        );

        // Optional Amazon SNS notification dispatch (Phase 8 Section 16, 17)
        if (SNS_TOPIC_ARN) {
          try {
            await sns.send(
              new PublishCommand({
                TopicArn: SNS_TOPIC_ARN,
                Subject: title,
                Message: JSON.stringify({ title, message, targetRoute, timestamp: createdAt }),
              })
            );
          } catch (snsErr) {
            console.error('[SNS] Publish error:', snsErr);
          }
        }
      }

      return sendResponse(200, { success: true, processed: true });
    }

    // 2. GET /api/notifications (Fetch User Notifications - Scoped to auth identity)
    if (method === 'GET' && path === '/api/notifications') {
      const result = await ddb.send(
        new QueryCommand({
          TableName: TABLE_NAME,
          KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
          ExpressionAttributeValues: {
            ':pk': `USER#${authUserId}`,
            ':skPrefix': 'NOTIFICATION#',
          },
          ScanIndexForward: false, // newest first
          Limit: 50,
        })
      );

      const items = (result.Items || []).map((item: Record<string, any>) => ({
        id: item.id,
        userId: item.userId,
        type: item.type,
        title: item.title,
        message: item.message,
        targetRoute: item.targetRoute,
        read: !!item.read,
        createdAt: item.createdAt,
        metadata: item.metadata,
      }));

      return sendResponse(200, { success: true, data: items });
    }

    // 3. PATCH /api/notifications/{id}/read (Mark Notification as Read)
    const readMatch = path.match(/\/api\/notifications\/([^/?]+)\/read$/);
    if (method === 'PATCH' && readMatch) {
      const notifId = decodeURIComponent(readMatch[1]);

      // Query to find notification SK
      const queryResult = await ddb.send(
        new QueryCommand({
          TableName: TABLE_NAME,
          KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
          ExpressionAttributeValues: {
            ':pk': `USER#${authUserId}`,
            ':skPrefix': 'NOTIFICATION#',
          },
        })
      );

      const match = (queryResult.Items || []).find((item: Record<string, any>) => item.id === notifId);
      if (!match) {
        return sendResponse(404, { success: false, error: 'Notification not found or unauthorized' });
      }

      await ddb.send(
        new UpdateCommand({
          TableName: TABLE_NAME,
          Key: {
            PK: `USER#${authUserId}`,
            SK: match.SK,
          },
          UpdateExpression: 'SET #r = :true',
          ExpressionAttributeNames: { '#r': 'read' },
          ExpressionAttributeValues: { ':true': true },
        })
      );

      return sendResponse(200, { success: true, message: 'Notification marked as read' });
    }

    // 4. POST /api/notifications/mark-all-read
    if (method === 'POST' && path === '/api/notifications/mark-all-read') {
      const queryResult = await ddb.send(
        new QueryCommand({
          TableName: TABLE_NAME,
          KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
          ExpressionAttributeValues: {
            ':pk': `USER#${authUserId}`,
            ':skPrefix': 'NOTIFICATION#',
          },
        })
      );

      for (const item of queryResult.Items || []) {
        if (!item.read) {
          await ddb.send(
            new UpdateCommand({
              TableName: TABLE_NAME,
              Key: { PK: `USER#${authUserId}`, SK: item.SK },
              UpdateExpression: 'SET #r = :true',
              ExpressionAttributeNames: { '#r': 'read' },
              ExpressionAttributeValues: { ':true': true },
            })
          );
        }
      }

      return sendResponse(200, { success: true, message: 'All notifications marked as read' });
    }

    // 5. GET /api/notifications/preferences
    if (method === 'GET' && path === '/api/notifications/preferences') {
      const prefResult = await ddb.send(
        new GetCommand({
          TableName: TABLE_NAME,
          Key: {
            PK: `USER#${authUserId}`,
            SK: 'PREFERENCES',
          },
        })
      );

      const defaultPrefs = {
        reservationUpdates: true,
        propertyUpdates: true,
        promotionalNotifications: false,
      };

      return sendResponse(200, { success: true, data: prefResult.Item?.preferences || defaultPrefs });
    }

    // 6. PUT /api/notifications/preferences
    if (method === 'PUT' && path === '/api/notifications/preferences') {
      const body = event.body ? JSON.parse(event.body) : {};
      await ddb.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: {
            PK: `USER#${authUserId}`,
            SK: 'PREFERENCES',
            preferences: body,
            updatedAt: new Date().toISOString(),
          },
        })
      );

      return sendResponse(200, { success: true, data: body });
    }

    return sendResponse(404, { success: false, error: `Route ${method} ${path} not found` });
  } catch (error: any) {
    console.error(`[NotificationsLambda] Error handling ${method} ${path}:`, error);
    return sendResponse(500, {
      success: false,
      error: 'An internal server error occurred while processing notification.',
    });
  }
};
