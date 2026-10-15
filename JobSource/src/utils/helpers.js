// Utility helper functions

/**
 * Format currency
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

/**
 * Format distance
 */
export const formatDistance = (miles) => {
  if (miles < 0.1) {
    return `${Math.round(miles * 5280)} ft`;
  }
  return `${miles.toFixed(1)} mi`;
};

/**
 * Format time ago
 */
export const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + ' years ago';

  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + ' months ago';

  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + ' days ago';

  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + ' hours ago';

  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + ' minutes ago';

  return Math.floor(seconds) + ' seconds ago';
};

/**
 * Calculate estimated earnings after expenses
 */
export const calculateNetEarnings = (grossEarnings, miles, mpg = 25, gasPrice = 3.50) => {
  const gasCost = (miles / mpg) * gasPrice;
  const estimatedTax = grossEarnings * 0.15; // 15% estimated tax
  return grossEarnings - gasCost - estimatedTax;
};

/**
 * Validate ZIP code
 */
export const isValidZipCode = (zipCode) => {
  return /^\d{5}(-\d{4})?$/.test(zipCode);
};

/**
 * Get service color
 */
export const getServiceColor = (serviceId) => {
  const colors = {
    instacart: '#FF8200',
    doordash: '#FF3008',
    ubereats: '#06C167',
    rover: '#00B4D8',
    wyzant: '#6B46C1',
    taskrabbit: '#1A8CFF',
    handy: '#FF6B6B',
    thumbtack: '#009FD4',
  };
  return colors[serviceId] || '#B57EDC';
};

/**
 * Get service icon
 */
export const getServiceIcon = (serviceId) => {
  const icons = {
    instacart: 'cart',
    doordash: 'fast-food',
    ubereats: 'bicycle',
    rover: 'paw',
    wyzant: 'school',
    taskrabbit: 'construct',
    handy: 'home',
    thumbtack: 'business',
  };
  return icons[serviceId] || 'briefcase';
};
