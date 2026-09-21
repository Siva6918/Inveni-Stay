/**
 * DynamoDB Database Seeder
 * Converts and formats rich Inveni Stay property and room inventories
 * for Amazon DynamoDB Single-Table Design.
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, BatchWriteCommand } from '@aws-sdk/lib-dynamodb';
import { MOCK_PROPERTIES } from '../../src/data/mockProperties';

export interface DynamoDBItem {
  PK: string;
  SK: string;
  GSI1PK?: string;
  GSI1SK?: string;
  GSI2PK?: string;
  GSI2SK?: string;
  entityType: 'PROPERTY' | 'ROOM' | 'RESERVATION' | 'USER';
  [key: string]: any;
}

export function generateDynamoDBSeedItems(): DynamoDBItem[] {
  const items: DynamoDBItem[] = [];

  for (const property of MOCK_PROPERTIES) {
    // 1. Property Item
    items.push({
      PK: `PROPERTY#${property.id}`,
      SK: 'METADATA',
      GSI1PK: `DESTINATION#${property.town.toUpperCase()}`,
      GSI1SK: `RENT#${property.startingRent.toString().padStart(6, '0')}`,
      GSI2PK: `TYPE#${property.propertyType}`,
      GSI2SK: property.name,
      entityType: 'PROPERTY',
      id: property.id,
      name: property.name,
      propertyType: property.propertyType,
      town: property.town,
      district: property.district,
      state: property.state,
      address: property.address,
      startingRent: property.startingRent,
      securityDeposit: property.securityDeposit,
      verifiedStatus: property.verifiedStatus,
      totalRooms: property.totalRooms,
      availableRoomsCount: property.availableRoomsCount,
      facilities: property.facilities,
      coordinates: property.coordinates,
      heroImage: property.heroImage,
    });

    // 2. Room Items under this Property
    for (const room of property.rooms) {
      items.push({
        PK: `PROPERTY#${property.id}`,
        SK: `ROOM#${room.roomNo}`,
        GSI1PK: `STATUS#${room.status}`,
        GSI1SK: `RENT#${room.rent.toString().padStart(6, '0')}`,
        entityType: 'ROOM',
        propertyId: property.id,
        roomNo: room.roomNo,
        type: room.type,
        rent: room.rent,
        deposit: room.deposit,
        floor: room.floor,
        status: room.status,
        attachedBath: room.attachedBath,
        hasBalcony: room.hasBalcony,
        dimensions: room.dimensions,
        furnishings: room.furnishings,
      });
    }
  }

  // 3. Initial Past Demo Reservation Item
  items.push({
    PK: 'RESERVATION#INV-2026-00118',
    SK: 'METADATA',
    GSI1PK: 'USER#usr_panyam_student_01',
    GSI1SK: '2026-09-15T00:00:00.000Z',
    entityType: 'RESERVATION',
    id: 'INV-2026-00118',
    propertyId: 'panyam_sri_sai_residency',
    propertyName: 'Sri Sai Luxury PG & Residency',
    propertyTown: 'Panyam',
    roomNo: '104',
    roomType: 'Double',
    status: 'REQUESTED',
    userId: 'usr_panyam_student_01',
    pricing: {
      roomRent: 4200,
      foodCost: 0,
      addonCost: 150,
      deposit: 2000,
      monthlyTotal: 4350,
      initialTotal: 6350,
    },
  });

  return items;
}

export async function seedDynamoDBTable(tableName = process.env.TABLE_NAME || 'InveniStayData', region = process.env.AWS_REGION || 'ap-south-1') {
  const items = generateDynamoDBSeedItems();
  console.log(`[Seed Generator] Preparing to seed ${items.length} items into table "${tableName}" (${region})...`);

  const client = new DynamoDBClient({ region });
  const docClient = DynamoDBDocumentClient.from(client, {
    marshallOptions: { removeUndefinedValues: true },
  });

  // DynamoDB BatchWriteItem accepts at most 25 items per batch
  const batchSize = 25;
  for (let i = 0; i < items.length; i += batchSize) {
    const chunk = items.slice(i, i + batchSize);
    const putRequests = chunk.map((item) => ({
      PutRequest: {
        Item: item,
      },
    }));

    await docClient.send(
      new BatchWriteCommand({
        RequestItems: {
          [tableName]: putRequests,
        },
      })
    );
    console.log(`[Seed Generator] Wrote batch ${Math.floor(i / batchSize) + 1} (${chunk.length} items)...`);
  }

  console.log(`[Seed Generator] Successfully seeded all ${items.length} items into "${tableName}"!`);
}

// Auto-run if executed directly
if (process.argv[1]?.includes('seedDynamoDB')) {
  seedDynamoDBTable().catch((err) => {
    console.error('[Seed Generator] Error seeding DynamoDB:', err);
    process.exit(1);
  });
}
