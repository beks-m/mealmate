export const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'] as const;

export const INGREDIENT_CATEGORIES = [
  'produce',
  'dairy',
  'meat',
  'seafood',
  'grains',
  'pantry',
  'frozen',
  'beverages',
  'other',
] as const;

export const DIETARY_GOALS = [
  'weight_loss',
  'maintenance',
  'muscle_gain',
  'custom',
] as const;

export const LOCALES = ['en', 'ru'] as const;

export const CATEGORY_LABELS = {
  produce: { en: 'Produce', ru: 'Овощи и фрукты' },
  dairy: { en: 'Dairy', ru: 'Молочные продукты' },
  meat: { en: 'Meat & Poultry', ru: 'Мясо и птица' },
  seafood: { en: 'Seafood', ru: 'Морепродукты' },
  grains: { en: 'Grains & Bread', ru: 'Крупы и хлеб' },
  pantry: { en: 'Pantry', ru: 'Бакалея' },
  frozen: { en: 'Frozen', ru: 'Заморозка' },
  beverages: { en: 'Beverages', ru: 'Напитки' },
  other: { en: 'Other', ru: 'Другое' },
} as const;

export const MEAL_TYPE_LABELS = {
  breakfast: { en: 'Breakfast', ru: 'Завтрак' },
  lunch: { en: 'Lunch', ru: 'Обед' },
  dinner: { en: 'Dinner', ru: 'Ужин' },
  snack: { en: 'Snack', ru: 'Перекус' },
} as const;

export const DIETARY_GOAL_LABELS = {
  weight_loss: { en: 'Weight Loss', ru: 'Похудение' },
  maintenance: { en: 'Maintenance', ru: 'Поддержание веса' },
  muscle_gain: { en: 'Muscle Gain', ru: 'Набор массы' },
  custom: { en: 'Custom Goals', ru: 'Свои цели' },
} as const;
