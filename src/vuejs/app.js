// Vue.js Orders Management Application - Complete Implementation
console.log('Vue.js app.js loading...');

// API Configuration
const API_BASE_URL = 'http://localhost:8000';

// API Communication Functions
async function apiCall(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.detail || `HTTP ${response.status}: ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Orders API functions
async function getOrders() {
  return await apiCall('/orders');
}

async function createOrder(orderData) {
  return await apiCall('/orders', {
    method: 'POST',
    body: JSON.stringify(orderData),
  });
}

async function updateOrder(id, orderData) {
  return await apiCall(`/orders/${id}`, {
    method: 'PUT',
    body: JSON.stringify(orderData),
  });
}

async function deleteOrderById(id) {
  return await apiCall(`/orders/${id}`, {
    method: 'DELETE',
  });
}

async function getOrder(id) {
  return await apiCall(`/orders/${id}`);
}

// Order Items API functions
async function getOrderItems() {
  return await apiCall('/order-items');
}

async function getOrderItemsByOrder(orderId) {
  return await apiCall(`/orders/${orderId}/items`);
}

async function createOrderItem(orderId, itemData) {
  return await apiCall(`/orders/${orderId}/items`, {
    method: 'POST',
    body: JSON.stringify(itemData),
  });
}

async function updateOrderItem(itemId, itemData) {
  return await apiCall(`/order-items/${itemId}`, {
    method: 'PUT',
    body: JSON.stringify(itemData),
  });
}

async function deleteOrderItemById(itemId) {
  return await apiCall(`/order-items/${itemId}`, {
    method: 'DELETE',
  });
}

// Advanced API functions
async function createOrderWithItemsAPI(orderData, items) {
  const orderWithItemsData = {
    customer_id: orderData.customer_id,
    order_date: orderData.order_date,
    items: items,
  };

  return await apiCall('/orders/with-items', {
    method: 'POST',
    body: JSON.stringify(orderWithItemsData),
  });
}

async function getStats() {
  return await apiCall('/stats');
}

// Test API connection
async function testConnection() {
  try {
    const response = await fetch(`${API_BASE_URL}/`);
    return response.ok;
  } catch (error) {
    console.error('API connection failed:', error);
    return false;
  }
}

// Vue.js Application
const { createApp } = Vue;

const app = createApp({
  data() {
    return {
      // UI State
      activeTab: 'orders',
      showOrderModal: false,
      showItemModal: false,
      loading: false,

      // Toast notification
      toast: {
        show: false,
        message: '',
        type: 'success',
      },

      // Data arrays
      orders: [],
      orderItems: [],

      // Form data
      orderForm: {
        customer_id: '',
        order_date: new Date().toISOString().split('T')[0],
        items: [],
      },

      itemForm: {
        order_id: '',
        product_id: '',
        quantity: 1,
        unit_price: 0,
      },

      // Edit states
      editingOrder: null,
      editingOrderItem: null,

      // Statistics
      stats: {
        total_orders: 0,
        total_revenue: 0,
        unique_customers: 0,
        product_stats: {},
        date_range: {},
      },

      // Reference data
      customers: {
        1: 'Alice Johnson',
        2: 'Bob Smith',
        3: 'Carol Davis',
      },

      products: {
        1: { name: 'Laptop Computer', price: 899.99 },
        2: { name: 'Wireless Mouse', price: 29.99 },
        3: { name: 'USB Keyboard', price: 49.99 },
      },
    };
  },

  computed: {
    orderTotal() {
      return this.orderForm.items.reduce((sum, item) => {
        return sum + (item.quantity * item.unit_price || 0);
      }, 0);
    },

    sortedProductStats() {
      if (!this.stats.product_stats) return [];
      return Object.entries(this.stats.product_stats)
        .sort(([, a], [, b]) => b.revenue - a.revenue)
        .slice(0, 10);
    },
  },

  methods: {
    // Utility methods
    formatDate(dateString) {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
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

    getCustomerName(customerId) {
      return this.customers[customerId] || `Customer ${customerId}`;
    },

    getProductName(productId) {
      return this.products[productId]?.name || `Product ${productId}`;
    },

    // Toast notifications
    showToast(message, type = 'success') {
      this.toast.message = message;
      this.toast.type = type;
      this.toast.show = true;

      setTimeout(() => {
        this.toast.show = false;
      }, 3000);
    },

    setLoading(state) {
      this.loading = state;
    },

    // Form validation
    validateFormData(data, requiredFields) {
      const errors = [];

      for (const field of requiredFields) {
        if (!data[field] || data[field].toString().trim() === '') {
          errors.push(
            `${field.replace(/([A-Z])/g, ' $1').toLowerCase()} is required`
          );
        }
      }

      if (data.unit_price !== undefined && data.unit_price < 0) {
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

    // Tab management
    setActiveTab(tabName) {
      this.activeTab = tabName;

      // Load data for specific tabs
      switch (tabName) {
        case 'orders':
          this.loadOrders();
          break;
        case 'items':
          this.loadOrderItems();
          break;
        case 'analytics':
          this.refreshAnalytics();
          break;
      }
    },

    // Data loading
    async loadAllData() {
      try {
        await Promise.all([
          this.loadOrders(),
          this.loadOrderItems(),
          this.loadStats(),
        ]);
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    },

    async loadOrders() {
      try {
        this.setLoading(true);
        const orders = await getOrders();
        this.orders = orders.map((order) => ({
          id: order.id,
          customer_id: order.customer_id,
          order_date: order.order_date,
          total_amount: order.total_amount || 0,
        }));
      } catch (error) {
        console.error('Failed to load orders:', error);
        this.showToast('Failed to load orders', 'error');
      } finally {
        this.setLoading(false);
      }
    },

    async loadOrderItems() {
      try {
        this.setLoading(true);
        const items = await getOrderItems();
        this.orderItems = items.map((item) => ({
          id: item.id,
          order_id: item.order_id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
        }));
      } catch (error) {
        console.error('Failed to load order items:', error);
        this.showToast('Failed to load order items', 'error');
      } finally {
        this.setLoading(false);
      }
    },

    async loadStats() {
      try {
        this.setLoading(true);
        this.stats = await getStats();
      } catch (error) {
        console.error('Failed to load stats:', error);
        this.stats = {
          total_orders: this.orders.length,
          total_revenue: 0,
          unique_customers: this.orders.length,
          product_stats: {},
          date_range: {},
        };
      } finally {
        this.setLoading(false);
      }
    },

    async refreshAnalytics() {
      await this.loadStats();
      this.showToast('Analytics refreshed');
    },

    // Modal management
    showCreateOrderModal() {
      this.editingOrder = null;
      this.orderForm = {
        customer_id: '',
        order_date: this.getTodayDate(),
        items: [],
      };
      this.addItemRow();
      this.showOrderModal = true;
    },

    closeOrderModal() {
      this.showOrderModal = false;
      this.editingOrder = null;
    },

    showCreateItemModal() {
      this.editingOrderItem = null;
      this.itemForm = {
        order_id: '',
        product_id: '',
        quantity: 1,
        unit_price: 0,
      };
      this.showItemModal = true;
    },

    closeItemModal() {
      this.showItemModal = false;
      this.editingOrderItem = null;
    },

    // Order operations
    async editOrder(order) {
      try {
        this.editingOrder = order;
        this.orderForm = {
          customer_id: order.customer_id,
          order_date: order.order_date,
          items: [],
        };

        // Load existing items for this order
        const orderItems = this.orderItems.filter(
          (item) => item.order_id === order.id
        );
        if (orderItems.length > 0) {
          this.orderForm.items = orderItems.map((item) => ({
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: item.unit_price,
          }));
        } else {
          this.addItemRow();
        }

        this.showOrderModal = true;
      } catch (error) {
        console.error('Failed to load order for editing:', error);
        this.showToast('Failed to load order', 'error');
      }
    },

    async deleteOrder(orderId) {
      if (!confirm(`Are you sure you want to delete Order #${orderId}?`)) {
        return;
      }

      try {
        this.setLoading(true);
        await deleteOrderById(orderId);
        this.showToast('Order deleted successfully!');
        await this.loadAllData();
      } catch (error) {
        console.error('Failed to delete order:', error);
        this.showToast('Failed to delete order', 'error');
      } finally {
        this.setLoading(false);
      }
    },

    // Order item operations
    async editOrderItem(item) {
      try {
        this.editingOrderItem = item;
        this.itemForm = {
          order_id: item.order_id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
        };
        this.showItemModal = true;
      } catch (error) {
        console.error('Failed to load order item for editing:', error);
        this.showToast('Failed to load order item', 'error');
      }
    },

    async deleteOrderItem(itemId) {
      if (!confirm(`Are you sure you want to delete Item #${itemId}?`)) {
        return;
      }

      try {
        this.setLoading(true);
        await deleteOrderItemById(itemId);
        this.showToast('Order item deleted successfully!');
        await this.loadAllData();
      } catch (error) {
        console.error('Failed to delete order item:', error);
        this.showToast('Failed to delete order item', 'error');
      } finally {
        this.setLoading(false);
      }
    },

    async saveOrderItem() {
      try {
        const validation = this.validateFormData(this.itemForm, [
          'order_id',
          'product_id',
          'quantity',
          'unit_price',
        ]);
        if (!validation.isValid) {
          this.showToast(validation.errors.join(', '), 'error');
          return;
        }

        this.setLoading(true);

        if (this.editingOrderItem) {
          await updateOrderItem(this.editingOrderItem.id, this.itemForm);
          this.showToast('Order item updated successfully!');
        } else {
          await createOrderItem(this.itemForm.order_id, this.itemForm);
          this.showToast('Order item created successfully!');
        }

        this.closeItemModal();
        await this.loadAllData();
      } catch (error) {
        console.error('Failed to save order item:', error);
        this.showToast('Failed to save order item', 'error');
      } finally {
        this.setLoading(false);
      }
    },

    // Item row management
    addItemRow() {
      this.orderForm.items.push({
        product_id: '',
        quantity: 1,
        unit_price: 0,
      });
    },

    removeItemRow(index) {
      this.orderForm.items.splice(index, 1);
    },

    updateItemPrice(item) {
      const product = this.products[item.product_id];
      if (product) {
        item.unit_price = product.price;
      }
    },

    updateSingleItemPrice() {
      const product = this.products[this.itemForm.product_id];
      if (product) {
        this.itemForm.unit_price = product.price;
      }
    },

    // Order creation
    async createOrderWithItems() {
      try {
        if (!this.orderForm.customer_id || !this.orderForm.order_date) {
          this.showToast('Please fill in all order details', 'error');
          return;
        }

        if (this.orderForm.items.length === 0) {
          this.showToast('Please add at least one item to the order', 'error');
          return;
        }

        // Validate all items
        for (const item of this.orderForm.items) {
          if (!item.product_id || !item.quantity || !item.unit_price) {
            this.showToast('Please fill in all item details', 'error');
            return;
          }

          if (item.quantity <= 0 || item.unit_price <= 0) {
            this.showToast(
              'Quantity and price must be positive numbers',
              'error'
            );
            return;
          }
        }

        this.setLoading(true);

        const orderData = {
          customer_id: this.orderForm.customer_id,
          order_date: this.orderForm.order_date,
        };

        const result = await createOrderWithItemsAPI(
          orderData,
          this.orderForm.items
        );

        this.closeOrderModal();
        this.showToast(
          `Order #${result.order_id} created successfully with ${
            this.orderForm.items.length
          } items! Total: ${this.formatCurrency(result.total_amount)}`
        );
        await this.loadAllData();
      } catch (error) {
        console.error('Failed to create order with items:', error);
        this.showToast(
          'Failed to create order with items. Please try again.',
          'error'
        );
      } finally {
        this.setLoading(false);
      }
    },
  },

  async mounted() {
    console.log('Vue.js Orders Management Application initialized');

    // Test API connection
    try {
      const connected = await testConnection();
      if (connected) {
        console.log('Vue.js API connection successful');
        this.showToast('Connected to backend successfully');
      } else {
        console.warn(
          'Cannot connect to API server. Make sure your FastAPI server is running on',
          API_BASE_URL
        );
        this.showToast(
          'Cannot connect to API server. Check if your backend is running.',
          'error'
        );
      }
    } catch (error) {
      console.error('Connection test failed:', error);
    }

    // Load initial data
    await this.loadAllData();
  },
});

// Mount the Vue application
try {
  app.mount('#app');
  console.log('Vue.js app.js loaded - Application ready!');
} catch (error) {
  console.error('Failed to mount Vue app:', error);
  document.getElementById('app').innerHTML =
    '<h1>Error: Failed to load Vue application</h1><p>Check console for details</p>';
}
