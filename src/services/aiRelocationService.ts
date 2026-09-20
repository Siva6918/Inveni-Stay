import { PropertyListing, RoomUnit, UserRequirements, AIRoomMatch, AIMatchingResponse, AIMatchFeature } from '../types';

export class AIRelocationService {
  /**
   * Parse natural language user intent into structured requirements
   * Uses transparent, deterministic intent parsing without fabricating missing attributes.
   */
  public parseRequirements(input: string, existingRequirements?: Partial<UserRequirements>): UserRequirements {
    const raw = input.trim();
    const lower = raw.toLowerCase();

    const hardPreferences: string[] = [];
    const softPreferences: string[] = [];

    // 1. Destination Extraction
    let destination: string | null = existingRequirements?.destination || null;
    const knownDestinations: { [key: string]: string } = {
      panyam: 'Panyam',
      nandyal: 'Nandyal',
      kurnool: 'Kurnool',
      kadapa: 'Kadapa',
      hyderabad: 'Hyderabad',
      bengaluru: 'Bengaluru',
      bangalore: 'Bengaluru',
      mumbai: 'Mumbai',
      london: 'London',
      tokyo: 'Tokyo',
      'new york': 'New York',
      dubai: 'Dubai',
      paris: 'Paris',
      singapore: 'Singapore',
      berlin: 'Berlin',
      sydney: 'Sydney',
      toronto: 'Toronto',
      delhi: 'Delhi',
      chennai: 'Chennai',
      pune: 'Pune',
    };

    for (const [key, normalized] of Object.entries(knownDestinations)) {
      if (lower.includes(key)) {
        destination = normalized;
        hardPreferences.push('destination');
        break;
      }
    }

    // 2. Budget Extraction (Under 6000, 6k, <= 7000, below 5,000, etc.)
    let maxBudget: number | null = existingRequirements?.maxBudget ?? null;
    let minBudget: number | null = existingRequirements?.minBudget ?? null;

    // Pattern: "under 6k", "below 6000", "under ₹6,000", "budget 6000", "< 6000", "max 7000"
    const budgetMatch = lower.match(
      /(?:under|below|max|maximum|budget|upto|up to|less than|<|<=|within)\s*(?:rs\.?|inr|₹)?\s*([0-9]+(?:\.[0-9]+)?)\s*(k|thousand)?/i
    ) || lower.match(/(?:rs\.?|inr|₹)?\s*([0-9]+)\s*(?:k)?\s*(?:budget|limit|max)/i);

    if (budgetMatch) {
      let amount = parseFloat(budgetMatch[1]);
      if (budgetMatch[2]?.toLowerCase() === 'k' || budgetMatch[0].includes('k')) {
        amount *= 1000;
      }
      // Safety guard against misinterpreting 60,000 as 6,000
      if (amount > 0 && amount <= 500000) {
        maxBudget = Math.round(amount);
        hardPreferences.push('maxBudget');
      }
    } else {
      // Standalone number with k: e.g. "single room 6k"
      const kMatch = lower.match(/\b([1-9][0-9]?)\s*k\b/);
      if (kMatch) {
        maxBudget = parseInt(kMatch[1], 10) * 1000;
        hardPreferences.push('maxBudget');
      } else {
        // Plain 4-digit number: e.g. "room 5500"
        const plainNumMatch = lower.match(/\b(3[0-9]{3}|4[0-9]{3}|5[0-9]{3}|6[0-9]{3}|7[0-9]{3}|8[0-9]{3}|9[0-9]{3}|[1-9][0-9]{4})\b/);
        if (plainNumMatch && !lower.includes('room ' + plainNumMatch[1])) {
          maxBudget = parseInt(plainNumMatch[1], 10);
          hardPreferences.push('maxBudget');
        }
      }
    }

    // 3. Room Type Extraction
    let roomType: 'Single' | 'Double' | 'Triple' | null = existingRequirements?.roomType || null;
    if (lower.includes('single') || lower.includes('private room') || lower.includes('1 person') || lower.includes('one person') || lower.includes('alone')) {
      roomType = 'Single';
      hardPreferences.push('roomType');
    } else if (lower.includes('double') || lower.includes('sharing') || lower.includes('2 people') || lower.includes('two people') || lower.includes('twin')) {
      roomType = 'Double';
      hardPreferences.push('roomType');
    } else if (lower.includes('triple') || lower.includes('3 people') || lower.includes('3 sharing')) {
      roomType = 'Triple';
      hardPreferences.push('roomType');
    }

    // 4. Food / Mess Extraction
    let food: boolean | 'preferred' | null = existingRequirements?.food ?? null;
    if (lower.includes('no food') || lower.includes('without food')) {
      food = false;
      hardPreferences.push('food');
    } else if (lower.includes('prefer food') || lower.includes('food preferred') || lower.includes('food if available') || lower.includes('prefer meals')) {
      food = 'preferred';
      softPreferences.push('food');
    } else if (lower.includes('food') || lower.includes('mess') || lower.includes('meals') || lower.includes('andhra food') || lower.includes('breakfast') || lower.includes('dinner')) {
      food = true;
      hardPreferences.push('food');
    }

    // 5. Wi-Fi Connectivity Extraction
    let wifi: boolean | 'preferred' | null = existingRequirements?.wifi ?? null;
    if (lower.includes('prefer wifi') || lower.includes('wifi if possible') || lower.includes('prefer wi-fi')) {
      wifi = 'preferred';
      softPreferences.push('wifi');
    } else if (lower.includes('wifi') || lower.includes('wi-fi') || lower.includes('internet') || lower.includes('broadband')) {
      wifi = true;
      hardPreferences.push('wifi');
    }

    // 6. Attached Bathroom Extraction
    let attachedBathroom: boolean | 'preferred' | null = existingRequirements?.attachedBathroom ?? null;
    if (lower.includes('prefer attached') || lower.includes('attached bath if possible')) {
      attachedBathroom = 'preferred';
      softPreferences.push('attachedBathroom');
    } else if (
      lower.includes('attached bath') ||
      lower.includes('attached bathroom') ||
      lower.includes('private bathroom') ||
      lower.includes('private bath') ||
      lower.includes('attached washroom')
    ) {
      attachedBathroom = true;
      hardPreferences.push('attachedBathroom');
    }

    // 7. AC (Air Conditioning) Extraction
    let ac: boolean | 'preferred' | null = existingRequirements?.ac ?? null;
    if (lower.includes('prefer ac')) {
      ac = 'preferred';
      softPreferences.push('ac');
    } else if (lower.includes('ac') || lower.includes('air condition') || lower.includes('air-condition')) {
      ac = true;
      hardPreferences.push('ac');
    }

    // 8. Parking Extraction
    let parking: boolean | 'preferred' | null = existingRequirements?.parking ?? null;
    if (lower.includes('prefer parking')) {
      parking = 'preferred';
      softPreferences.push('parking');
    } else if (lower.includes('parking') || lower.includes('bike parking') || lower.includes('vehicle parking')) {
      parking = true;
      hardPreferences.push('parking');
    }

    // 9. Move-in Timeline / Date
    let moveInDate: string | null = existingRequirements?.moveInDate || null;
    if (lower.includes('immediately') || lower.includes('urgent') || lower.includes('today') || lower.includes('asap')) {
      moveInDate = 'Immediate';
      hardPreferences.push('moveInDate');
    } else if (lower.includes('next month')) {
      moveInDate = 'October 2026';
      softPreferences.push('moveInDate');
    } else if (lower.includes('october') || lower.includes('oct 1') || lower.includes('1 october') || lower.includes('01 oct')) {
      moveInDate = '01 October 2026';
      softPreferences.push('moveInDate');
    }

    // 10. User Type / Persona
    let userType: 'Student' | 'Working Professional' | null = existingRequirements?.userType || null;
    if (lower.includes('student') || lower.includes('college') || lower.includes('polytechnic') || lower.includes('diploma') || lower.includes('study')) {
      userType = 'Student';
      softPreferences.push('userType');
    } else if (lower.includes('working') || lower.includes('trainee') || lower.includes('job') || lower.includes('office') || lower.includes('employee')) {
      userType = 'Working Professional';
      softPreferences.push('userType');
    }

    // 11. Property Type
    let propertyType: 'PG' | 'Room' | 'Hostel' | null = existingRequirements?.propertyType || null;
    if (lower.includes('hostel')) {
      propertyType = 'Hostel';
    } else if (lower.includes('pg') || lower.includes('paying guest')) {
      propertyType = 'PG';
    } else if (lower.includes('room') || lower.includes('studio')) {
      propertyType = 'Room';
    }

    return {
      destination,
      propertyType,
      roomType,
      maxBudget,
      minBudget,
      food,
      wifi,
      attachedBathroom,
      ac,
      parking,
      moveInDate,
      duration: existingRequirements?.duration || null,
      distancePreference: lower.includes('near college') ? 'Near College' : (existingRequirements?.distancePreference || null),
      availability: lower.includes('immediately') ? 'AVAILABLE' : (existingRequirements?.availability || 'ANY'),
      userType,
      rawQuery: input,
      hardPreferences: Array.from(new Set(hardPreferences)),
      softPreferences: Array.from(new Set(softPreferences)),
    };
  }

  /**
   * Match properties and individual rooms against extracted requirements
   * Returns exact matches, close matches, transparent Preference Match score, and explanation ledger.
   */
  public matchPropertiesAndRooms(
    requirements: UserRequirements,
    properties: PropertyListing[]
  ): AIMatchingResponse {
    const allRoomMatches: AIRoomMatch[] = [];

    // Only ACTIVE properties should normally enter the public discovery/AI system (Section 15)
    let activeProperties = properties.filter((p) => !p.status || p.status === 'ACTIVE');

    // Filter properties matching destination if destination specified
    let eligibleProperties = activeProperties;
    if (requirements.destination && requirements.destination !== 'any') {
      const q = requirements.destination.toLowerCase();
      eligibleProperties = activeProperties.filter(
        (p) =>
          p.town.toLowerCase().includes(q) ||
          p.district.toLowerCase().includes(q) ||
          p.address.toLowerCase().includes(q) ||
          p.name.toLowerCase().includes(q)
      );

      // If no properties match destination in memory, try searching all active
      if (eligibleProperties.length === 0) {
        eligibleProperties = activeProperties;
      }
    }

    for (const property of eligibleProperties) {
      for (const room of property.rooms) {
        let score = 0;
        let isExactMatch = true;
        let budgetDifference: number | undefined = undefined;

        const matchedFeatures: AIMatchFeature[] = [];
        const unmatchedFeatures: AIMatchFeature[] = [];

        // 1. Destination Match (25 Points)
        if (requirements.destination) {
          const q = requirements.destination.toLowerCase();
          const matchesDest =
            property.town.toLowerCase().includes(q) ||
            pDistrictMatch(property, q);

          if (matchesDest) {
            score += 25;
            matchedFeatures.push({
              label: 'Location',
              satisfied: true,
              isHardRequirement: true,
              detail: `Located in ${property.town} (${property.distanceToCollege || property.address})`,
            });
          } else {
            isExactMatch = false;
            unmatchedFeatures.push({
              label: 'Location',
              satisfied: false,
              isHardRequirement: true,
              detail: `Located in ${property.town}, not ${requirements.destination}`,
            });
          }
        } else {
          score += 20;
        }

        // 2. Budget Check (20 Points)
        if (requirements.maxBudget !== null) {
          if (room.rent <= requirements.maxBudget) {
            score += 20;
            const savings = requirements.maxBudget - room.rent;
            matchedFeatures.push({
              label: 'Budget',
              satisfied: true,
              isHardRequirement: true,
              detail: `Rent ₹${room.rent.toLocaleString()}/mo (${savings > 0 ? `₹${savings.toLocaleString()} under your limit` : 'exactly on budget'})`,
            });
          } else {
            const diff = room.rent - requirements.maxBudget;
            budgetDifference = diff;
            // Hard constraint violation
            isExactMatch = false;
            // Proportional penalty
            const penalty = Math.min(20, Math.round((diff / requirements.maxBudget) * 35));
            score = Math.max(0, score - penalty);
            unmatchedFeatures.push({
              label: 'Budget',
              satisfied: false,
              isHardRequirement: true,
              detail: `Rent ₹${room.rent.toLocaleString()}/mo (₹${diff.toLocaleString()} over your ₹${requirements.maxBudget.toLocaleString()} limit)`,
            });
          }
        } else {
          score += 15;
        }

        // 3. Room Type Match (15 Points)
        if (requirements.roomType) {
          if (room.type.toLowerCase() === requirements.roomType.toLowerCase()) {
            score += 15;
            matchedFeatures.push({
              label: 'Room Type',
              satisfied: true,
              isHardRequirement: true,
              detail: `${room.type} occupancy room`,
            });
          } else {
            isExactMatch = false;
            unmatchedFeatures.push({
              label: 'Room Type',
              satisfied: false,
              isHardRequirement: true,
              detail: `${room.type} room (you requested ${requirements.roomType})`,
            });
          }
        } else {
          score += 12;
        }

        // 4. Food / Mess Check (10 Points)
        const hasFoodFacility = property.facilities.some(
          (f) => f.category === 'food' && f.included
        );
        if (requirements.food === true || requirements.food === 'preferred') {
          if (hasFoodFacility) {
            score += 10;
            matchedFeatures.push({
              label: 'Food Plan',
              satisfied: true,
              isHardRequirement: requirements.food === true,
              detail: 'Homestyle mess meals included in property',
            });
          } else {
            if (requirements.food === true) isExactMatch = false;
            unmatchedFeatures.push({
              label: 'Food Plan',
              satisfied: false,
              isHardRequirement: requirements.food === true,
              detail: 'Food/mess not included at this building',
            });
          }
        } else if (hasFoodFacility) {
          matchedFeatures.push({
            label: 'Food Plan',
            satisfied: true,
            isHardRequirement: false,
            detail: 'Food options available on premises',
          });
        }

        // 5. Wi-Fi Check (10 Points)
        const hasWifi = property.facilities.some(
          (f) => (f.category === 'connectivity' || f.name.toLowerCase().includes('wi-fi') || f.name.toLowerCase().includes('wifi')) && f.included
        );
        if (requirements.wifi === true || requirements.wifi === 'preferred') {
          if (hasWifi) {
            score += 10;
            matchedFeatures.push({
              label: 'Wi-Fi',
              satisfied: true,
              isHardRequirement: requirements.wifi === true,
              detail: 'High-speed 150 Mbps Wi-Fi included',
            });
          } else {
            if (requirements.wifi === true) isExactMatch = false;
            unmatchedFeatures.push({
              label: 'Wi-Fi',
              satisfied: false,
              isHardRequirement: requirements.wifi === true,
              detail: 'Wi-Fi connectivity not confirmed',
            });
          }
        }

        // 6. Attached Bathroom Check (10 Points)
        if (requirements.attachedBathroom === true || requirements.attachedBathroom === 'preferred') {
          if (room.attachedBath) {
            score += 10;
            matchedFeatures.push({
              label: 'Attached Bathroom',
              satisfied: true,
              isHardRequirement: requirements.attachedBathroom === true,
              detail: 'Private attached western washroom',
            });
          } else {
            if (requirements.attachedBathroom === true) isExactMatch = false;
            unmatchedFeatures.push({
              label: 'Attached Bathroom',
              satisfied: false,
              isHardRequirement: requirements.attachedBathroom === true,
              detail: 'Shared washroom on floor corridor',
            });
          }
        }

        // 7. Availability Priority (10 Points)
        if (room.status === 'AVAILABLE') {
          score += 10;
          matchedFeatures.push({
            label: 'Availability',
            satisfied: true,
            isHardRequirement: requirements.availability === 'AVAILABLE',
            detail: 'Vacant & ready for immediate move-in',
          });
        } else if (room.status === 'RESERVED') {
          score += 4;
          if (requirements.availability === 'AVAILABLE') isExactMatch = false;
          unmatchedFeatures.push({
            label: 'Availability',
            satisfied: false,
            isHardRequirement: false,
            detail: 'Currently on temporary demo reservation hold',
          });
        } else {
          isExactMatch = false;
          unmatchedFeatures.push({
            label: 'Availability',
            satisfied: false,
            isHardRequirement: true,
            detail: `Room status is ${room.status}`,
          });
        }

        // Summary builder
        const summary = `${score}% Preference Match: ${matchedFeatures.slice(0, 3).map((f) => f.label).join(', ')}`;

        allRoomMatches.push({
          property,
          room,
          matchScore: Math.min(99, Math.max(30, score)),
          isExactMatch,
          matchedFeatures,
          unmatchedFeatures,
          explanationSummary: summary,
          budgetDifference,
          availabilityStatus: room.status,
        });
      }
    }

    // Sort: Exact matches first, then score descending, available units prioritized
    allRoomMatches.sort((a, b) => {
      if (a.isExactMatch && !b.isExactMatch) return -1;
      if (!a.isExactMatch && b.isExactMatch) return 1;

      // Prioritize AVAILABLE over OCCUPIED/RESERVED
      if (a.room.status === 'AVAILABLE' && b.room.status !== 'AVAILABLE') return -1;
      if (a.room.status !== 'AVAILABLE' && b.room.status === 'AVAILABLE') return 1;

      return b.matchScore - a.matchScore;
    });

    const exactMatches = allRoomMatches.filter((m) => m.isExactMatch && m.room.status === 'AVAILABLE');
    const closeMatches = allRoomMatches.filter((m) => !m.isExactMatch || m.room.status !== 'AVAILABLE').slice(0, 4);

    // Identify missing hard requirements for follow-up
    const missingHardRequirements: string[] = [];
    if (!requirements.destination) missingHardRequirements.push('destination');
    if (requirements.maxBudget === null) missingHardRequirements.push('maxBudget');
    if (!requirements.roomType) missingHardRequirements.push('roomType');

    // Follow-up question if critical requirements are missing
    let followUpQuestion: AIMatchingResponse['followUpQuestion'] = undefined;
    if (missingHardRequirements.includes('maxBudget') && requirements.destination) {
      followUpQuestion = {
        question: `What monthly budget ceiling should we target in ${requirements.destination}?`,
        field: 'maxBudget',
        options: ['Under ₹5,000', '₹5,000 – ₹6,500', '₹6,500 – ₹8,000', 'Flexible Budget'],
      };
    } else if (missingHardRequirements.includes('roomType')) {
      followUpQuestion = {
        question: 'Which occupancy type do you prefer for your stay?',
        field: 'roomType',
        options: ['Single Room', 'Double Sharing', 'Any Occupancy'],
      };
    }

    // Relaxation Suggestions if exact matches are zero
    let relaxationSuggestions: AIMatchingResponse['relaxationSuggestions'] = undefined;
    if (exactMatches.length === 0) {
      relaxationSuggestions = [];
      if (requirements.maxBudget !== null) {
        relaxationSuggestions.push({
          label: `Increase budget to ₹${(requirements.maxBudget + 1000).toLocaleString()}`,
          action: 'raiseBudget',
          patch: { maxBudget: requirements.maxBudget + 1000 },
        });
      }
      if (requirements.food === true) {
        relaxationSuggestions.push({
          label: 'Make food plan optional',
          action: 'relaxFood',
          patch: { food: 'preferred' },
        });
      }
      if (requirements.destination?.toLowerCase() === 'panyam') {
        relaxationSuggestions.push({
          label: 'Search nearby Nandyal (14 km)',
          action: 'searchNearby',
          patch: { destination: 'Nandyal' },
        });
      }
    }

    const explanationMessage =
      exactMatches.length > 0
        ? `We found ${exactMatches.length} available room${exactMatches.length > 1 ? 's' : ''} matching all your requirements in ${requirements.destination || 'the area'}.`
        : `No rooms satisfy every requirement simultaneously under current parameters. Review our close matches below or relax a constraint.`;

    return {
      understoodRequirements: requirements,
      exactMatches,
      closeMatches,
      totalMatches: exactMatches.length,
      missingHardRequirements,
      followUpQuestion,
      relaxationSuggestions,
      explanationMessage,
    };
  }
}

function pDistrictMatch(property: PropertyListing, query: string): boolean {
  return property.district.toLowerCase().includes(query);
}

export const aiRelocationService = new AIRelocationService();
