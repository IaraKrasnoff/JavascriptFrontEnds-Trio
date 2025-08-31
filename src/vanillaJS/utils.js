// Utility Functions for Orders Management
console.log('utils.js: script loaded and running');

function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };
  return date.toLocaleDateString('en-US', options);
}

function formatCurrency(amount) {
  if (amount === null || amount === undefined) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toastMessage');

  toast.className = 'toast';
  if (type !== 'success') {
    toast.classList.add(type);
  }

  toastMessage.textContent = message;
  toast.style.display = 'block';

  setTimeout(() => {
    toast.style.display = 'none';
  }, 3000);
}

function showLoading(show = true) {
  const spinner = document.getElementById('loadingSpinner');
  spinner.style.display = show ? 'flex' : 'none';
}

function validateFormData(data, requiredFields) {
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
}

function getTodayDate() {
  return new Date().toISOString().split('T')[0];
}

function clearForm(formId) {
  const form = document.getElementById(formId);
  if (form) {
    form.reset();
    const dateInputs = form.querySelectorAll('input[type="date"]');
    const today = getTodayDate();
    dateInputs.forEach((input) => (input.value = today));
  }
}

function generateActionButtons(id, type) {
  const editFunction =
    type === 'order' ? `editOrder(${id})` : `editOrderItem(${id})`;
  const deleteFunction =
    type === 'order' ? `deleteOrder(${id})` : `deleteOrderItem(${id})`;

  return `
        <div class="action-buttons">
            <button class="btn btn-sm btn-primary" onclick="${editFunction}" title="Edit">
                <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-danger" onclick="${deleteFunction}" title="Delete">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
}

function showTab(tabName, event) {
  const tabContents = document.querySelectorAll('.tab-content');
  tabContents.forEach((tab) => tab.classList.remove('active'));

  const tabButtons = document.querySelectorAll('.tab-button');
  tabButtons.forEach((button) => button.classList.remove('active'));

  const selectedTab = document.getElementById(tabName);
  if (selectedTab) {
    selectedTab.classList.add('active');
  }

  if (event && event.target) {
    event.target.classList.add('active');
  }

  // Load data for specific tabs
  switch (tabName) {
    case 'orders':
      if (window.loadOrders) window.loadOrders();
      break;
    case 'items':
      if (window.loadOrderItems) window.loadOrderItems();
      break;
    case 'analytics':
      if (window.refreshAnalytics) window.refreshAnalytics();
      break;
    case 'reference':
      if (window.loadReferenceData) window.loadReferenceData();
      break;
  }
}

// Initialize default dates when DOM loads
document.addEventListener('DOMContentLoaded', function () {
  const dateInputs = document.querySelectorAll('input[type="date"]');
  const today = getTodayDate();
  dateInputs.forEach((input) => {
    if (!input.value) {
      input.value = today;
    }
  });
});

// Make functions globally available
window.formatDate = formatDate;
window.formatCurrency = formatCurrency;
window.showToast = showToast;
window.showLoading = showLoading;
window.validateFormData = validateFormData;
window.getTodayDate = getTodayDate;
window.clearForm = clearForm;
window.generateActionButtons = generateActionButtons;
window.showTab = showTab;

console.log('Utils.js loaded - Helper functions ready!');
