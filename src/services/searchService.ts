import { SearchFilters, StayDuration, RoomTypePreference } from '../types';

export interface ParsedNLPResult {
  filters: SearchFilters;
  extractedTokens: {
    label: string;
    value: string;
    category: 'destination' | 'budget' | 'room' | 'amenity' | 'duration' | 'gender';
  }[];
  explanation: string;
}

export class SearchService {
  /**
   * Parse natural language relocation text deterministically for prototype
   */
  public parseNaturalLanguageQuery(query: string): ParsedNLPResult {
    const text = query.toLowerCase();
    const tokens: ParsedNLPResult['extractedTokens'] = [];

    // Default filters
    const filters: SearchFilters = {
      destination: 'Panyam',
      origin: 'Kadapa',
      propertyType: 'PG',
      roomType: 'All',
      minBudget: 0,
      maxBudget: 7000,
      amenities: [],
      duration: 'any',
      onlyAvailable: false,
      verifiedOnly: false,
      gender: 'All',
      naturalLanguageQuery: query,
    };

    // 1. Destination Extraction
    if (text.includes('panyam')) {
      filters.destination = 'Panyam';
      tokens.push({ label: 'Destination', value: 'Panyam, AP', category: 'destination' });
    } else if (text.includes('nandyal')) {
      filters.destination = 'Nandyal';
      tokens.push({ label: 'Destination', value: 'Nandyal, AP', category: 'destination' });
    } else if (text.includes('kadapa')) {
      filters.destination = 'Kadapa';
      tokens.push({ label: 'Destination', value: 'Kadapa, AP', category: 'destination' });
    } else if (text.includes('kurnool')) {
      filters.destination = 'Kurnool';
      tokens.push({ label: 'Destination', value: 'Kurnool, AP', category: 'destination' });
    }

    // 2. Budget Extraction (look for numbers like 6000, 5000, 4500, 6k, 5k)
    const budgetMatch = text.match(/(?:under|below|max|budget|within)?\s*(?:₹|rs\.?|inr)?\s*(\d{4,5}|\d+k)/i);
    if (budgetMatch) {
      let valStr = budgetMatch[1].toLowerCase();
      let val = 0;
      if (valStr.endsWith('k')) {
        val = parseInt(valStr.replace('k', ''), 10) * 1000;
      } else {
        val = parseInt(valStr, 10);
      }
      if (val >= 2000 && val <= 25000) {
        filters.maxBudget = val;
        tokens.push({ label: 'Max Budget', value: `₹${val.toLocaleString()} / mo`, category: 'budget' });
      }
    }

    // 3. Room Type Extraction
    if (text.includes('single')) {
      filters.roomType = 'Single';
      tokens.push({ label: 'Room Type', value: 'Single Room', category: 'room' });
    } else if (text.includes('double') || text.includes('2 sharing') || text.includes('two sharing')) {
      filters.roomType = 'Double';
      tokens.push({ label: 'Room Type', value: 'Double Sharing', category: 'room' });
    } else if (text.includes('triple') || text.includes('3 sharing')) {
      filters.roomType = 'Triple';
      tokens.push({ label: 'Room Type', value: 'Triple Sharing', category: 'room' });
    }

    // 4. Amenities Extraction
    if (text.includes('food') || text.includes('mess') || text.includes('meals')) {
      filters.amenities.push('food');
      tokens.push({ label: 'Amenity', value: 'Mess Food Included', category: 'amenity' });
    }

    if (text.includes('wifi') || text.includes('wi-fi') || text.includes('internet')) {
      filters.amenities.push('wifi');
      tokens.push({ label: 'Amenity', value: 'High-Speed Wi-Fi', category: 'amenity' });
    }

    if (text.includes('attached') || text.includes('geyser') || text.includes('bath')) {
      filters.amenities.push('attachedBath');
      tokens.push({ label: 'Amenity', value: 'Attached Bath & Geyser', category: 'amenity' });
    }

    if (text.includes('ac') || text.includes('air conditioning')) {
      filters.amenities.push('ac');
      tokens.push({ label: 'Amenity', value: 'Air Conditioning', category: 'amenity' });
    }

    // 5. Gender Extraction
    if (text.includes('girl') || text.includes('women') || text.includes('female') || text.includes('ladies')) {
      filters.gender = 'Girls';
      tokens.push({ label: 'Gender', value: 'Ladies / Women Only', category: 'gender' });
    } else if (text.includes('boy') || text.includes('men') || text.includes('male') || text.includes('gents')) {
      filters.gender = 'Boys';
      tokens.push({ label: 'Gender', value: 'Boys / Men Only', category: 'gender' });
    }

    // 6. Duration Extraction
    if (text.includes('6 month') || text.includes('semester')) {
      filters.duration = '6-months';
      tokens.push({ label: 'Duration', value: '6 Months (1 Semester)', category: 'duration' });
    } else if (text.includes('1 month') || text.includes('30 day')) {
      filters.duration = '1-month';
      tokens.push({ label: 'Duration', value: '1 Month (Short Stay)', category: 'duration' });
    } else if (text.includes('year') || text.includes('12 month')) {
      filters.duration = '1-year';
      tokens.push({ label: 'Duration', value: '1 Year (Academic Year)', category: 'duration' });
    }

    const explanation = `Extracted ${tokens.length} relocation criteria for ${filters.destination}: ${tokens.map((t) => t.value).join(' • ')}`;

    return {
      filters,
      extractedTokens: tokens,
      explanation,
    };
  }
}

export const searchService = new SearchService();
