export const CATEGORIES = [
  { id: 'food', label: 'Food & Drink', icon: '🍽️' },
  { id: 'transport', label: 'Transport', icon: '🚗' },
  { id: 'accommodation', label: 'Accommodation', icon: '🏠' },
  { id: 'shopping', label: 'Shopping', icon: '🛍️' },
  { id: 'entertainment', label: 'Entertainment', icon: '🎭' },
  { id: 'health', label: 'Health', icon: '🏥' },
  { id: 'utilities', label: 'Utilities', icon: '💡' },
  { id: 'travel', label: 'Travel', icon: '✈️' },
  { id: 'other', label: 'Other', icon: '📦' },
] as const

export type CategoryId = typeof CATEGORIES[number]['id']
