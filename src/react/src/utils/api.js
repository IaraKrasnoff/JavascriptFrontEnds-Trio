// API Communication Module for React Orders Management
const API_BASE_URL = 'http://localhost:8000';

const apiCall = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ detail: response.statusText }));
      throw new Error(
        errorData.detail || `HTTP ${response.status}: ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Orders API functions
const getOrders = async () => {
  return await apiCall('/orders');
};

const getOrder = async (id) => {
  return await apiCall(`/orders/${id}`);
};

const createOrder = async (orderData) => {
  return await apiCall('/orders', {
    method: 'POST',
    body: JSON.stringify(orderData),
  });
};

const updateOrder = async (id, orderData) => {
  return await apiCall(`/orders/${id}`, {
    method: 'PUT',
    body: JSON.stringify(orderData),
  });
};

const deleteOrder = async (id) => {
  return await apiCall(`/orders/${id}`, {
    method: 'DELETE',
  });
};

// Order Items API functions
const getOrderItems = async () => {
  return await apiCall('/order-items');
};

const getOrderItemsByOrder = async (orderId) => {
  return await apiCall(`/orders/${orderId}/items`);
};

const createOrderItem = async (orderId, itemData) => {
  return await apiCall(`/orders/${orderId}/items`, {
    method: 'POST',
    body: JSON.stringify(itemData),
  });
};

const updateOrderItem = async (itemId, itemData) => {
  return await apiCall(`/order-items/${itemId}`, {
    method: 'PUT',
    body: JSON.stringify(itemData),
  });
};

const deleteOrderItem = async (itemId) => {
  return await apiCall(`/order-items/${itemId}`, {
    method: 'DELETE',
  });
};

// Advanced API functions
const createOrderWithItems = async (orderData, items) => {
  const orderWithItemsData = {
    customer_id: parseInt(orderData.customer_id),
    order_date: orderData.order_date,
    items: items.map((item) => ({
      product_id: parseInt(item.product_id),
      quantity: parseInt(item.quantity),
      unit_price: parseFloat(item.unit_price),
    })),
  };

  return await apiCall('/orders/with-items', {
    method: 'POST',
    body: JSON.stringify(orderWithItemsData),
  });
};

const updateOrderWithItems = async (orderId, orderData, items) => {
  const orderWithItemsData = {
    customer_id: parseInt(orderData.customer_id),
    order_date: orderData.order_date,
    items: items.map((item) => ({
      product_id: parseInt(item.product_id),
      quantity: parseInt(item.quantity),
      unit_price: parseFloat(item.unit_price),
    })),
  };

  return await apiCall(`/orders/${orderId}/with-items`, {
    method: 'PUT',
    body: JSON.stringify(orderWithItemsData),
  });
};

// Test API connection
const testConnection = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/`);
    return response.ok;
  } catch (error) {
    console.error('API connection failed:', error);
    return false;
  }
};

// Exported API object
export const api = {
  API_BASE_URL,
  getOrders,
  getOrder,
  createOrder,
  updateOrder,
  deleteOrder,
  getOrderItems,
  getOrderItemsByOrder,
  createOrderItem,
  updateOrderItem,
  deleteOrderItem,
  createOrderWithItems,
  updateOrderWithItems,
  testConnection,
};

// Default export for convenience
export default api;
