/**
 * Franchise locations data
 * ─────────────────────────
 * To add a new branch: append an object to the FRANCHISE_LOCATIONS array.
 * The FranchiseSection component reads this array dynamically — no other
 * file needs to change.
 *
 * mapsQuery  — passed to Google Maps search (address or place name)
 * mapsUrl    — optional direct Place URL; falls back to search query
 */

export interface FranchiseLocation {
  id: string;
  name: string;
  city: string;
  address: string;
  hours: {
    weekdays: string;   // e.g. "8:00 AM – 10:00 PM"
    weekends: string;
  };
  phone: string;
  email: string;
  mapsQuery: string;    // used in google.com/maps/search/?q=...
}

export const FRANCHISE_LOCATIONS: FranchiseLocation[] = [
  {
    id: 'nyc-midtown',
    name: 'BunBite Midtown',
    city: 'New York, NY',
    address: '123 Burger Lane, Midtown Manhattan, NY 10036',
    hours: { weekdays: '8:00 AM – 10:00 PM', weekends: '9:00 AM – 12:00 AM' },
    phone: '+1 (212) 555-0101',
    email: 'midtown@bunbite.com',
    mapsQuery: '123 Burger Lane Midtown Manhattan NY 10036',
  },
  {
    id: 'la-downtown',
    name: 'BunBite Downtown LA',
    city: 'Los Angeles, CA',
    address: '456 Flavor Ave, Downtown Los Angeles, CA 90012',
    hours: { weekdays: '9:00 AM – 11:00 PM', weekends: '9:00 AM – 12:00 AM' },
    phone: '+1 (310) 555-0202',
    email: 'la@bunbite.com',
    mapsQuery: '456 Flavor Ave Downtown Los Angeles CA 90012',
  },
  {
    id: 'chicago-loop',
    name: 'BunBite The Loop',
    city: 'Chicago, IL',
    address: '789 Taste Street, The Loop, Chicago, IL 60601',
    hours: { weekdays: '8:00 AM – 10:00 PM', weekends: '9:00 AM – 11:00 PM' },
    phone: '+1 (312) 555-0303',
    email: 'chicago@bunbite.com',
    mapsQuery: '789 Taste Street The Loop Chicago IL 60601',
  },
  {
    id: 'miami-beach',
    name: 'BunBite Miami Beach',
    city: 'Miami, FL',
    address: '321 Ocean Drive, Miami Beach, FL 33139',
    hours: { weekdays: '10:00 AM – 11:00 PM', weekends: '10:00 AM – 1:00 AM' },
    phone: '+1 (305) 555-0404',
    email: 'miami@bunbite.com',
    mapsQuery: '321 Ocean Drive Miami Beach FL 33139',
  },
  {
    id: 'london-soho',
    name: 'BunBite Soho',
    city: 'London, UK',
    address: '18 Carnaby Street, Soho, London W1F 9PW',
    hours: { weekdays: '11:00 AM – 10:00 PM', weekends: '11:00 AM – 11:00 PM' },
    phone: '+44 20 7946 0505',
    email: 'london@bunbite.com',
    mapsQuery: '18 Carnaby Street Soho London W1F 9PW',
  },
  {
    id: 'dubai-jbr',
    name: 'BunBite JBR',
    city: 'Dubai, UAE',
    address: 'The Walk, Jumeirah Beach Residence, Dubai',
    hours: { weekdays: '12:00 PM – 12:00 AM', weekends: '12:00 PM – 2:00 AM' },
    phone: '+971 4 555 0606',
    email: 'dubai@bunbite.com',
    mapsQuery: 'The Walk Jumeirah Beach Residence Dubai UAE',
  },
];
