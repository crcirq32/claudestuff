// JobSource Theme Colors
// Lavender and Green color scheme

export const colors = {
  // Primary colors
  primary: {
    lavender: '#B57EDC',
    lavenderLight: '#D4A5E8',
    lavenderDark: '#8B5AA6',
    lavenderPale: '#E8D4F0',
  },

  // Secondary colors
  secondary: {
    green: '#4CAF50',
    greenLight: '#81C784',
    greenDark: '#2E7D32',
    greenPale: '#E8F5E9',
  },

  // Background colors
  background: {
    primary: '#FAF5FA',      // Very light lavender
    secondary: '#FFFFFF',
    tertiary: '#F0E6F5',    // Light lavender
    card: '#FFFFFF',
    elevated: '#FFFFFF',
  },

  // Text colors
  text: {
    primary: '#2D1F3A',       // Dark purple
    secondary: '#6B5B7A',     // Medium purple
    tertiary: '#9B8BA8',      // Light purple
    inverse: '#FFFFFF',
    green: '#2E7D32',
  },

  // Accent colors
  accent: {
    gold: '#FFD700',
    orange: '#FF8C00',
    red: '#E53935',
    blue: '#5C6BC0',
  },

  // Status colors
  status: {
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#E53935',
    info: '#2196F3',
    pending: '#FFC107',
  },

  // Service brand colors (for icons/badges)
  brands: {
    instacart: '#FF8200',
    doordash: '#FF3008',
    ubereats: '#06C167',
    rover: '#00B4D8',
    wyzant: '#6B46C1',
    taskrabbit: '#1A8CFF',
    handy: '#FF6B6B',
    thumbtack: '#009FD4',
  },

  // Gradients
  gradients: {
    primary: ['#B57EDC', '#8B5AA6'],
    secondary: ['#4CAF50', '#2E7D32'],
    card: ['#FFFFFF', '#FAF5FA'],
    header: ['#B57EDC', '#9B59B6'],
  },
};

export const shadows = {
  small: {
    shadowColor: '#8B5AA6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#8B5AA6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#8B5AA6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 9999,
};

export default colors;
