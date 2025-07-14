// UP Bank categories and system-wide constants
export const CATEGORIES = {
  // Good Life (Entertainment & Lifestyle)
  APPS_GAMES_SOFTWARE: { name: 'Apps, Games & Software', color: '#8b5cf6', icon: '🎮', types: ['expense'] },
  BOOZE: { name: 'Booze', color: '#f59e0b', icon: '🍷', types: ['expense'] },
  EVENTS_GIGS: { name: 'Events & Gigs', color: '#e11d48', icon: '🎵', types: ['expense'] },
  HOBBIES: { name: 'Hobbies', color: '#06b6d4', icon: '🎨', types: ['expense'] },
  HOLIDAYS_TRAVEL: { name: 'Holidays & Travel', color: '#10b981', icon: '✈️', types: ['expense'] },
  LOTTERY_GAMBLING: { name: 'Lottery & Gambling', color: '#ef4444', icon: '🎰', types: ['expense'] },
  PUBS_BARS: { name: 'Pubs & Bars', color: '#f97316', icon: '🍺', types: ['expense'] },
  RESTAURANTS_CAFES: { name: 'Restaurants & Cafes', color: '#22c55e', icon: '🍽️', types: ['expense'] },
  TAKEAWAY: { name: 'Takeaway', color: '#84cc16', icon: '🥡', types: ['expense'] },
  TOBACCO_VAPING: { name: 'Tobacco & Vaping', color: '#6b7280', icon: '🚬', types: ['expense'] },
  TV_MUSIC_STREAMING: { name: 'TV, Music & Streaming', color: '#3b82f6', icon: '📺', types: ['expense'] },
  ADULT: { name: 'Adult', color: '#ec4899', icon: '🔞', types: ['expense'] },

  // Home
  GROCERIES: { name: 'Groceries', color: '#22c55e', icon: '🛒', types: ['expense'] },
  HOMEWARE_APPLIANCES: { name: 'Homeware & Appliances', color: '#f97316', icon: '🏠', types: ['expense'] },
  INTERNET: { name: 'Internet', color: '#3b82f6', icon: '🌐', types: ['expense'] },
  MAINTENANCE_IMPROVEMENTS: { name: 'Maintenance & Improvements', color: '#84cc16', icon: '🔨', types: ['expense'] },
  PETS: { name: 'Pets', color: '#06b6d4', icon: '🐕', types: ['expense'] },
  RATES_INSURANCE: { name: 'Rates & Insurance', color: '#10b981', icon: '🏡', types: ['expense'] },
  RENT_MORTGAGE: { name: 'Rent & Mortgage', color: '#ef4444', icon: '🏘️', types: ['expense'] },
  UTILITIES: { name: 'Utilities', color: '#8b5cf6', icon: '💡', types: ['expense'] },

  // Personal
  CHILDREN_FAMILY: { name: 'Children & Family', color: '#ec4899', icon: '👪', types: ['expense'] },
  CLOTHING_ACCESSORIES: { name: 'Clothing & Accessories', color: '#f59e0b', icon: '👕', types: ['expense'] },
  EDUCATION_STUDENT_LOANS: { name: 'Education & Student Loans', color: '#6366f1', icon: '📚', types: ['expense'] },
  FITNESS_WELLBEING: { name: 'Fitness & Wellbeing', color: '#22c55e', icon: '💪', types: ['expense'] },
  GIFTS_CHARITY: { name: 'Gifts & Charity', color: '#e11d48', icon: '🎁', types: ['expense'] },
  HAIR_BEAUTY: { name: 'Hair & Beauty', color: '#ec4899', icon: '💄', types: ['expense'] },
  HEALTH_MEDICAL: { name: 'Health & Medical', color: '#ef4444', icon: '🏥', types: ['expense'] },
  INVESTMENTS: { name: 'Investments', color: '#10b981', icon: '📈', types: ['expense', 'investment'] },
  LIFE_ADMIN: { name: 'Life Admin', color: '#6b7280', icon: '📋', types: ['expense'] },
  MOBILE_PHONE: { name: 'Mobile Phone', color: '#3b82f6', icon: '📱', types: ['expense'] },
  NEWS_MAGAZINES_BOOKS: { name: 'News, Magazines & Books', color: '#8b5cf6', icon: '📰', types: ['expense'] },
  TECHNOLOGY: { name: 'Technology', color: '#06b6d4', icon: '💻', types: ['expense'] },

  // Transport
  CAR_INSURANCE_REGO_MAINTENANCE: { name: 'Car Insurance, Rego & Maintenance', color: '#ef4444', icon: '🚗', types: ['expense'] },
  CYCLING: { name: 'Cycling', color: '#22c55e', icon: '🚴', types: ['expense'] },
  FUEL: { name: 'Fuel', color: '#f97316', icon: '⛽', types: ['expense'] },
  PARKING: { name: 'Parking', color: '#6b7280', icon: '🅿️', types: ['expense'] },
  PUBLIC_TRANSPORT: { name: 'Public Transport', color: '#3b82f6', icon: '🚌', types: ['expense'] },
  REPAYMENTS: { name: 'Repayments', color: '#8b5cf6', icon: '🚙', types: ['expense', 'debt_payment'] },
  TAXIS_SHARE_CARS: { name: 'Taxis & Share Cars', color: '#f59e0b', icon: '🚕', types: ['expense'] },
  TOLLS: { name: 'Tolls', color: '#84cc16', icon: '🛣️', types: ['expense'] },

  // Income categories
  SALARY: { name: 'Salary', color: '#10B981', icon: '💰', types: ['income'] },
  FREELANCE: { name: 'Freelance', color: '#3B82F6', icon: '💼', types: ['income'] },
  INVESTMENT_RETURNS: { name: 'Investment Returns', color: '#8B5CF6', icon: '📈', types: ['income', 'investment'] },
  RENTAL_INCOME: { name: 'Rental Income', color: '#F59E0B', icon: '🏠', types: ['income'] },
  SIDE_HUSTLE: { name: 'Side Hustle', color: '#EF4444', icon: '🚀', types: ['income'] },
  GIFTS_RECEIVED: { name: 'Gifts Received', color: '#EC4899', icon: '🎁', types: ['income'] },
  TAX_REFUND: { name: 'Tax Refund', color: '#06B6D4', icon: '💸', types: ['income'] },
  OTHER_INCOME: { name: 'Other Income', color: '#6B7280', icon: '💵', types: ['income'] },

  // Debt payment categories
  CREDIT_CARD_PAYMENT: { name: 'Credit Card Payment', color: '#DC2626', icon: '💳', types: ['debt_payment'] },
  LOAN_PAYMENT: { name: 'Loan Payment', color: '#7C2D12', icon: '🏦', types: ['debt_payment'] },
  MORTGAGE_PAYMENT: { name: 'Mortgage Payment', color: '#059669', icon: '🏘️', types: ['debt_payment'] },

  // Transfer and other transaction types
  ACCOUNT_TRANSFER: { name: 'Account Transfer', color: '#6366F1', icon: '🔄', types: ['transfer'] },
  BANK_FEES: { name: 'Bank Fees', color: '#DC2626', icon: '🏦', types: ['fee'] },
  INTEREST_EARNED: { name: 'Interest Earned', color: '#10B981', icon: '💰', types: ['interest'] },
  INTEREST_PAID: { name: 'Interest Paid', color: '#EF4444', icon: '💸', types: ['interest'] },

  // Fallback category
  OTHER: { name: 'Other', color: '#6b7280', icon: '📄', types: ['expense', 'income', 'transfer', 'fee'] }
} as const;

export const TRANSACTION_TYPES = [
  'expense',
  'income',
  'transfer'
] as const;

export const ACCOUNT_TYPES = [
  'checking',
  'savings',
  'credit_card',
  'cash',
  'investment',
  'superannuation',
  'loan'
] as const;