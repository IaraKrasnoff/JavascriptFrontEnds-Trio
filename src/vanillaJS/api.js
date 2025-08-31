// API Communication Module - Fixed for backend endpoints
const API_BASE_URL = 'http://localhost:8000';

async function apiCall(endpoint, options = {}) {
  showLoading(true);
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
    showToast(error.message, 'error');
    throw error;
  } finally {
    showLoading(false);
  }
}

// Orders API functions (using /orders endpoints)
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

// // Order Items API functions (using /order-items endpoints)
// async function getOrderItems() {
//   return await apiCall('/order-items');
// }

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

// Advanced API functions - use backend endpoint
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

// Stats calculation - done on frontend since backend doesn't provide this
async function getStats() {
  try {
    const orders = await getOrders();
    const items = await getOrderItems();

    // Calculate basic stats from available data
    const stats = {
      total_orders: orders.length,
      total_revenue: 0, // Can't calculate without proper item data
      unique_customers: orders.length, // Simplified
      product_stats: {},
      date_range: {
        earliest_order: null,
        latest_order: null,
      },
    };

    return stats;
  } catch (error) {
    console.error('Failed to calculate stats:', error);
    return {
      total_orders: 0,
      total_revenue: 0,
      unique_customers: 0,
      product_stats: {},
      date_range: { earliest_order: null, latest_order: null },
    };
  }
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

// Initialize connection test
testConnection().then((connected) => {
  if (connected) {
    console.log('API connection successful');
  } else {
    console.warn(
      'Cannot connect to API server. Make sure your FastAPI server is running on',
      API_BASE_URL
    );
    showToast(
      'Cannot connect to API server. Check if your backend is running.',
      'error'
    );
  }
});

console.log('API.js loaded - Backend communication ready!');
