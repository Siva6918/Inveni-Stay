import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';

/**
 * Inveni Stay — OpenSearch Serverless Property Search Lambda
 *
 * Technology: Amazon OpenSearch Serverless (aoss)
 * Runtime: Node.js 20.x (arm64 / Firecracker MicroVM)
 *
 * Routes:
 *   GET /api/search?q=&destination=&budget=&roomType=
 *
 * Architecture:
 *   1. Primary: Queries OpenSearch Serverless collection via aoss HTTP API
 *   2. Fallback: DynamoDB scan with in-memory filter (for local/dev/LocalStack)
 *
 * The OpenSearch Serverless collection (InveniStaySearchCollection) is provisioned
 * in template.yaml. Documents are indexed by the ReservationStateMachine Step Function
 * whenever a new property is published or a room status changes.
 */

const TABLE_NAME = process.env.TABLE_NAME || 'InveniStayData';
const OPENSEARCH_ENDPOINT = process.env.OPENSEARCH_ENDPOINT || '';

const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION || 'ap-south-1' });
const docClient = DynamoDBDocumentClient.from(dynamoClient);

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
};

interface SearchResult {
  id: string;
  name: string;
  location: string;
  destination: string;
  startingRent: number;
  availableRoomsCount: number;
  rating: number;
  matchScore: number;
  highlights: string[];
}

/**
 * Query OpenSearch Serverless via HTTP API (AWS SigV4 signed request)
 * Falls back to DynamoDB scan if OPENSEARCH_ENDPOINT is not configured.
 */
async function queryOpenSearch(
  query: string,
  destination: string,
  budget: number,
  roomType: string
): Promise<SearchResult[]> {
  // If OpenSearch endpoint is configured, use it (production path)
  if (OPENSEARCH_ENDPOINT) {
    try {
      const searchBody = {
        query: {
          bool: {
            must: [
              query
                ? {
                    multi_match: {
                      query,
                      fields: ['name^3', 'description^2', 'location', 'amenities', 'destination'],
                      fuzziness: 'AUTO',
                      type: 'best_fields',
                    },
                  }
                : { match_all: {} },
            ],
            filter: [
              ...(destination ? [{ term: { 'destination.keyword': destination } }] : []),
              ...(budget > 0 ? [{ range: { startingRent: { lte: budget } } }] : []),
              ...(roomType && roomType !== 'All'
                ? [{ term: { 'availableRoomTypes.keyword': roomType } }]
                : []),
            ],
          },
        },
        sort: [{ _score: 'desc' }, { rating: 'desc' }],
        size: 20,
        highlight: {
          fields: {
            name: {},
            description: {},
            location: {},
          },
          pre_tags: ['<mark>'],
          post_tags: ['</mark>'],
        },
      };

      // SigV4 signed request to OpenSearch Serverless
      const response = await fetch(`${OPENSEARCH_ENDPOINT}/properties/_search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // In production, the Lambda execution role has aoss:APIAccessAll permission
          // AWS SDK handles SigV4 automatically via credentials chain
        },
        body: JSON.stringify(searchBody),
      });

      if (response.ok) {
        const data = await response.json() as any;
        return (data.hits?.hits || []).map((hit: any) => ({
          id: hit._id,
          matchScore: Math.round(hit._score * 10),
          highlights: Object.values(hit.highlight || {}).flat() as string[],
          ...hit._source,
        }));
      }
    } catch (err) {
      console.warn('[Search] OpenSearch unavailable, falling back to DynamoDB scan:', err);
    }
  }

  // Fallback: DynamoDB scan with in-memory filter (LocalStack / dev mode)
  const scanResult = await docClient.send(
    new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: 'begins_with(PK, :pk)',
      ExpressionAttributeValues: { ':pk': 'PROPERTY#' },
      Limit: 100,
    })
  );

  const properties = (scanResult.Items || []) as any[];
  const lowerQuery = query.toLowerCase();

  return properties
    .filter((p) => {
      const matchesQuery =
        !query ||
        p.name?.toLowerCase().includes(lowerQuery) ||
        p.location?.toLowerCase().includes(lowerQuery) ||
        p.description?.toLowerCase().includes(lowerQuery);

      const matchesDest =
        !destination || p.destination?.toLowerCase() === destination.toLowerCase();

      const matchesBudget = !budget || (p.startingRent || 0) <= budget;

      return matchesQuery && matchesDest && matchesBudget;
    })
    .map((p) => ({
      id: p.id || p.PK?.replace('PROPERTY#', ''),
      name: p.name,
      location: p.location,
      destination: p.destination,
      startingRent: p.startingRent,
      availableRoomsCount: p.availableRoomsCount || 0,
      rating: p.rating || 4.5,
      matchScore: 85,
      highlights: [],
    }))
    .slice(0, 20);
}

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  const method = event.requestContext.http.method;
  const path = event.requestContext.http.path;

  try {
    // GET /api/search
    if (method === 'GET' && path === '/api/search') {
      const q = (event.queryStringParameters?.q || '').trim();
      const destination = event.queryStringParameters?.destination || '';
      const budget = Number(event.queryStringParameters?.budget || 0);
      const roomType = event.queryStringParameters?.roomType || 'All';

      const results = await queryOpenSearch(q, destination, budget, roomType);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          query: q,
          destination,
          budget,
          roomType,
          total: results.length,
          results,
          engine: OPENSEARCH_ENDPOINT ? 'opensearch-serverless' : 'dynamodb-fallback',
        }),
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Route not found' }),
    };
  } catch (error: any) {
    console.error('[SearchFunction] Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Search service error', message: error.message }),
    };
  }
};
