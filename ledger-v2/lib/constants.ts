import { Category } from './types';

export const INCOME_CATEGORIES = [
  { value: 'salary' as Category, label: 'Salary', icon: '💼' },
  { value: 'freelance' as Category, label: 'Freelance', icon: '🖥️' },
  { value: 'investment' as Category, label: 'Investment', icon: '📈' },
  { value: 'gift' as Category, label: 'Gift', icon: '🎁' },
  { value: 'other_income' as Category, label: 'Other', icon: '💰' },
];

export const EXPENSE_CATEGORIES = [
  { value: 'food' as Category, label: 'Food & Dining', icon: '🍔' },
  { value: 'transport' as Category, label: 'Transport', icon: '🚗' },
  { value: 'housing' as Category, label: 'Housing', icon: '🏠' },
  { value: 'utilities' as Category, label: 'Utilities', icon: '💡' },
  { value: 'healthcare' as Category, label: 'Healthcare', icon: '🏥' },
  { value: 'entertainment' as Category, label: 'Entertainment', icon: '🎬' },
  { value: 'shopping' as Category, label: 'Shopping', icon: '🛍️' },
  { value: 'education' as Category, label: 'Education', icon: '📚' },
  { value: 'travel' as Category, label: 'Travel', icon: '✈️' },
  { value: 'other_expense' as Category, label: 'Other', icon: '📦' },
];

export const ALL_CATEGORIES = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];

export function getCategoryMeta(value: Category) {
  return ALL_CATEGORIES.find(c => c.value === value) ?? { value, label: value, icon: '💸' };
}

export const CATEGORY_COLORS: Record<Category, string> = {
  salary: '#427d35', freelance: '#5a9e46', investment: '#2d6e1f', gift: '#8ec07c', other_income: '#b8d4a8',
  food: '#d93b1f', transport: '#e85d2f', housing: '#c03010', utilities: '#f57040',
  healthcare: '#d94f6e', entertainment: '#a03060', shopping: '#c05080', education: '#8040a0',
  travel: '#5060d0', other_expense: '#8090c0',
};
