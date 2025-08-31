// Vue.js Utility Functions
console.log('Vue.js utils.js: script loaded and running');

// Global utility functions that can be used outside Vue components
window.VueUtils = {
  formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };
    return date.toLocaleDateString('en-US', options);
  },

  formatCurrency(amount) {
    if (amount === null || amount === undefined) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  },

  getTodayDate() {
    return new Date().toISOString().split('T')[0];
  },

  validateFormData(data, requiredFields) {
    const errors = [];

    for (const field of requiredFields) {
      if (!data[field] || data[field].toString().trim() === '') {
        errors.push(
          `${field.replace(/([A-Z])/g, ' $1').toLowerCase()} is required`
        );
      }
    }

    if (data.unitPrice !== undefined && data.unitPrice < 0) {
      errors.push('Unit price cannot be negative');
    }

    if (data.quantity !== undefined && data.quantity <= 0) {
      errors.push('Quantity must be greater than 0');
    }

    return {
      isValid: errors.length === 0,
      errors: errors,
    };
  },

  // Vue-specific utilities
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // API response helpers
  handleApiError(error, defaultMessage = 'An error occurred') {
    console.error('API Error:', error);
    return error.message || defaultMessage;
  },

  // Data transformation helpers
  transformOrderData(orderResponse) {
    return {
      id: orderResponse.id,
      customer_id: orderResponse.customer_id,
      order_date: orderResponse.order_date,
      total_amount: orderResponse.total_amount || 0,
    };
  },

  transformItemData(itemResponse) {
    return {
      id: itemResponse.id,
      order_id: itemResponse.order_id,
      product_id: itemResponse.product_id,
      quantity: itemResponse.quantity,
      unit_price: itemResponse.unit_price,
    };
  },

  // Local storage helpers (for potential future use)
  saveToStorage(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
      return false;
    }
  },

  loadFromStorage(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn('Failed to load from localStorage:', error);
      return defaultValue;
    }
  },

  // Vue reactive helpers
  deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  },

  isEmpty(value) {
    return (
      value === null ||
      value === undefined ||
      value === '' ||
      (Array.isArray(value) && value.length === 0) ||
      (typeof value === 'object' && Object.keys(value).length === 0)
    );
  },
};

// Export functions for use in Vue components
if (typeof window !== 'undefined') {
  window.formatDate = window.VueUtils.formatDate;
  window.formatCurrency = window.VueUtils.formatCurrency;
  window.getTodayDate = window.VueUtils.getTodayDate;
  window.validateFormData = window.VueUtils.validateFormData;
}

console.log('Vue.js Utils loaded - Helper functions ready!');
