/**
 * UP Bank Category Mapping
 * Maps UP Bank categories to our internal category system
 */

export interface UpBankCategoryMapping {
  [key: string]: string;
}

/**
 * Map UP Bank category to internal category constant name
 * @param upBankCategory - UP Bank category identifier
 * @returns Mapped category constant name or 'OTHER' as fallback
 */
export function mapUpBankCategory(upBankCategory?: string): string {
  if (!upBankCategory) return 'OTHER';
  
  const mapping: UpBankCategoryMapping = {
    // Good Life categories
    'good-life-takeaway': 'TAKEAWAY',
    'good-life-restaurants-bars-and-cafes': 'RESTAURANTS_CAFES',
    'good-life-groceries': 'GROCERIES',
    'good-life-alcohol-and-tobacco': 'BOOZE',
    'good-life-entertainment': 'EVENTS_GIGS',
    'good-life-lifestyle-and-clothing': 'CLOTHING_ACCESSORIES',
    'good-life-hobbies': 'HOBBIES',
    'good-life-services-and-software': 'APPS_GAMES_SOFTWARE',
    
    // Home categories
    'home-maintenance-and-improvements': 'MAINTENANCE_IMPROVEMENTS',
    'home-rent-and-mortgage': 'RENT_MORTGAGE',
    'home-utilities': 'UTILITIES',
    'home-internet': 'INTERNET',
    'home-phone': 'MOBILE_PHONE',
    'home-insurance': 'RATES_INSURANCE',
    'home-rates': 'RATES_INSURANCE',
    
    // Personal categories
    'personal-health-and-medical': 'HEALTH_MEDICAL',
    'personal-education-and-student-loans': 'EDUCATION_STUDENT_LOANS',
    'personal-charitable-donations': 'GIFTS_CHARITY',
    'personal-life-admin': 'LIFE_ADMIN',
    'personal-family': 'CHILDREN_FAMILY',
    'personal-investments': 'INVESTMENTS',
    'personal-technology': 'TECHNOLOGY',
    
    // Transport categories
    'transport-petrol-and-automotive': 'FUEL',
    'transport-taxi-and-ride-share-services': 'TAXIS_SHARE_CARS',
    'transport-tolls': 'TOLLS',
    'transport-parking': 'PARKING',
    'transport-public-transport': 'PUBLIC_TRANSPORT',
    'transport-cycling': 'CYCLING',
    'transport-automotive-insurance': 'CAR_INSURANCE_REGO_MAINTENANCE',
    'transport-automotive-services': 'CAR_INSURANCE_REGO_MAINTENANCE',
  };
  
  return mapping[upBankCategory] || 'OTHER';
}