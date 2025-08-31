// Orders Management Application - Complete updated version
let currentOrders = [];
let currentOrderItems = [];
let currentEditingOrder = null;
let currentEditingOrderItem = null;
let itemRowCounter = 0;

// Customer and Product Data
const customers = {
  1: 'Alice Johnson',
  2: 'Bob Smith',
  3: 'Carol Davis',
};

const products = {
  1: { name: 'Laptop Computer', price: 899.99 },
  2: { name: 'Wireless Mouse', price: 29.99 },
  3: { name: 'USB Keyboard', price: 49.99 },
};

// Helper function to parse order name back to customer info
function parseOrderName(name) {
  // Extract customer ID and date from name like "Customer 1 - 2023-12-01"
  const match = name.match(/Customer (\d+) - (\d{4}-\d{2}-\d{2})/);
  if (match) {
    return {
      customer_id: parseInt(match[1]),
      order_date: match[2],
    };
  }
  return {
    customer_id: 1,
    order_date: getTodayDate(),
  };
}

// Helper function to parse item description back to product info
function parseItemDescription(description) {
  // Extract product info from description like "Product 1: 5 x $10.99"
  const match = description.match(/Product (\d+): (\d+) x \$(\d+\.?\d*)/);
  if (match) {
    return {
      product_id: parseInt(match[1]),
      quantity: parseInt(match[2]),
      unit_price: parseFloat(match[3]),
    };
  }
  return {
    product_id: 1,
    quantity: 1,
    unit_price: 0,
  };
}

// Initialize Application
document.addEventListener('DOMContentLoaded', async function () {
  await loadAllData();
  setupEventListeners();
  console.log('Orders Management Application initialized');
});

async function loadAllData() {
  await Promise.all([loadOrders(), loadOrderItems(), loadStats()]);
}

// Orders Management
async function loadOrders() {
  try {
    const orders = await getOrders();
    currentOrders = orders.map((order) => ({
      order_id: order.id,
      customer_id: order.customer_id,
      order_date: order.order_date,
      total_amount: order.total_amount || 0,
    }));
    displayOrders(currentOrders);
  } catch (error) {
    console.error('Failed to load orders:', error);
  }
}

function displayOrders(orders) {
  const tbody = document.getElementById('ordersTableBody');
  if (!tbody) return;

  if (orders.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="5" style="text-align: center; padding: 40px;">No orders found. Click "New Order" to create your first order.</td></tr>';
    return;
  }

  tbody.innerHTML = orders
    .map(
      (order) => `
        <tr>
            <td>#${order.order_id}</td>
            <td>${
              customers[order.customer_id] || `Customer ${order.customer_id}`
            }</td>
            <td>${formatDate(order.order_date)}</td>
            <td>${formatCurrency(order.total_amount)}</td>
            <td>${generateActionButtons(order.order_id, 'order')}</td>
        </tr>
    `
    )
    .join('');
}

// Order Items Management
async function loadOrderItems() {
  try {
    const items = await getOrderItems();
    currentOrderItems = items.map((item) => ({
      order_item_id: item.id,
      order_id: item.order_id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      line_total: item.quantity * item.unit_price,
    }));
    displayOrderItems(currentOrderItems);
  } catch (error) {
    console.error('Failed to load order items:', error);
  }
}

function displayOrderItems(items) {
  const tbody = document.getElementById('itemsTableBody');
  if (!tbody) return;

  if (items.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="7" style="text-align: center; padding: 40px;">No order items found</td></tr>';
    return;
  }

  tbody.innerHTML = items
    .map(
      (item) => `
        <tr>
            <td>#${item.order_item_id}</td>
            <td>#${item.order_id}</td>
            <td>${
              products[item.product_id]?.name || `Product ${item.product_id}`
            }</td>
            <td>${item.quantity}</td>
            <td>${formatCurrency(item.unit_price)}</td>
            <td>${formatCurrency(item.line_total)}</td>
            <td>${generateActionButtons(item.order_item_id, 'item')}</td>
        </tr>
    `
    )
    .join('');
}

// Modal Management - Updated to use single comprehensive modal
function showCreateOrderModal() {
  currentEditingOrder = null;
  document.getElementById('orderModalTitle').textContent = 'Create New Order';

  // Reset form
  document.getElementById('customerId').value = '';
  document.getElementById('orderDate').value = getTodayDate();
  document.getElementById('itemsContainer').innerHTML = '';
  document.getElementById('orderTotal').textContent = '0.00';

  // Add initial item row
  addItemRow();

  document.getElementById('orderModal').style.display = 'block';
}

function closeOrderModal() {
  document.getElementById('orderModal').style.display = 'none';
  currentEditingOrder = null;
}

function showCreateItemModal() {
  currentEditingOrderItem = null;
  document.getElementById('itemModalTitle').textContent =
    'Create New Order Item';
  clearForm('itemForm');

  // Set default price when product is selected
  document.getElementById('productId').addEventListener('change', function () {
    const productId = parseInt(this.value);
    const product = products[productId];
    if (product) {
      document.getElementById('unitPrice').value = product.price;
    }
  });

  document.getElementById('itemModal').style.display = 'block';
}

function closeItemModal() {
  document.getElementById('itemModal').style.display = 'none';
  currentEditingOrderItem = null;
  clearForm('itemForm');
}

// Form Handlers - Updated for new structure
async function handleOrderItemFormSubmit(event) {
  event.preventDefault();

  const itemData = {
    product_id: parseInt(document.getElementById('productId').value),
    quantity: parseInt(document.getElementById('quantity').value),
    unit_price: parseFloat(document.getElementById('unitPrice').value),
  };

  const orderId = parseInt(document.getElementById('itemOrderId').value);

  const validation = validateFormData({ ...itemData, orderId }, [
    'product_id',
    'quantity',
    'unit_price',
    'orderId',
  ]);
  if (!validation.isValid) {
    showToast(validation.errors.join(', '), 'error');
    return;
  }

  try {
    if (currentEditingOrderItem) {
      await updateOrderItem(currentEditingOrderItem.order_item_id, {
        ...itemData,
        master_id: orderId,
      });
      showToast('Order item updated successfully!');
    } else {
      await createOrderItem(orderId, itemData);
      showToast('Order item created successfully!');
    }

    closeItemModal();
    await loadAllData();
  } catch (error) {
    console.error('Failed to save order item:', error);
  }
}

// CRUD Operations
async function editOrder(orderId) {
  try {
    const order = currentOrders.find((o) => o.order_id === orderId);
    if (!order) {
      showToast('Order not found', 'error');
      return;
    }

    currentEditingOrder = order;
    document.getElementById('orderModalTitle').textContent = 'Edit Order';
    document.getElementById('customerId').value = order.customer_id;
    document.getElementById('orderDate').value = order.order_date;

    // Load existing items for this order
    const orderItems = currentOrderItems.filter(
      (item) => item.order_id === orderId
    );
    document.getElementById('itemsContainer').innerHTML = '';

    if (orderItems.length > 0) {
      orderItems.forEach((item) => {
        addItemRowWithData(item);
      });
    } else {
      addItemRow();
    }

    calculateOrderTotal();
    document.getElementById('orderModal').style.display = 'block';
  } catch (error) {
    console.error('Failed to load order for editing:', error);
    showToast('Failed to load order', 'error');
  }
}

async function deleteOrder(orderId) {
  if (!confirm(`Are you sure you want to delete Order #${orderId}?`)) {
    return;
  }

  try {
    await deleteOrderById(orderId);
    showToast('Order deleted successfully!');
    await loadAllData();
  } catch (error) {
    console.error('Failed to delete order:', error);
  }
}

async function viewOrder(orderId) {
  await editOrder(orderId);
}

async function editOrderItem(itemId) {
  try {
    const item = currentOrderItems.find((i) => i.order_item_id === itemId);
    if (!item) {
      showToast('Order item not found', 'error');
      return;
    }

    currentEditingOrderItem = item;
    document.getElementById('itemModalTitle').textContent = 'Edit Order Item';
    document.getElementById('itemOrderId').value = item.order_id;
    document.getElementById('productId').value = item.product_id;
    document.getElementById('quantity').value = item.quantity;
    document.getElementById('unitPrice').value = item.unit_price;
    document.getElementById('itemModal').style.display = 'block';
  } catch (error) {
    console.error('Failed to load order item for editing:', error);
    showToast('Failed to load order item', 'error');
  }
}

async function deleteOrderItem(itemId) {
  if (!confirm(`Are you sure you want to delete Item #${itemId}?`)) {
    return;
  }

  try {
    await deleteOrderItemById(itemId);
    showToast('Order item deleted successfully!');
    await loadAllData();
  } catch (error) {
    console.error('Failed to delete order item:', error);
  }
}

// Analytics - Updated
async function loadStats() {
  try {
    const stats = await getStats();
    updateStatsDisplay(stats);
    displayAnalytics(stats);
  } catch (error) {
    console.error('Failed to load stats:', error);
    updateStatsDisplay({
      total_orders: currentOrders.length,
      total_revenue: 0,
      unique_customers: currentOrders.length,
    });
  }
}

function updateStatsDisplay(stats) {
  document.getElementById('totalOrders').textContent = stats.total_orders || 0;
  document.getElementById('totalRevenue').textContent = formatCurrency(
    stats.total_revenue || 0
  );
  document.getElementById('totalCustomers').textContent =
    stats.unique_customers || 0;
}

function displayAnalytics(stats) {
  const productStatsEl = document.getElementById('productStats');
  if (productStatsEl) {
    if (stats.product_stats && Object.keys(stats.product_stats).length > 0) {
      const statsHtml = Object.entries(stats.product_stats)
        .sort(([, a], [, b]) => b.revenue - a.revenue)
        .slice(0, 10)
        .map(
          ([productId, data]) => `
                    <div class="stat-row">
                        <span>${
                          products[productId]?.name || `Product #${productId}`
                        }: ${data.quantity} units</span>
                        <span>${formatCurrency(data.revenue)}</span>
                    </div>
                `
        )
        .join('');
      productStatsEl.innerHTML = statsHtml;
    } else {
      productStatsEl.innerHTML = '<p>No product statistics available</p>';
    }
  }

  const dateRangeEl = document.getElementById('dateRange');
  if (dateRangeEl) {
    if (
      stats.date_range &&
      (stats.date_range.earliest_order || stats.date_range.latest_order)
    ) {
      dateRangeEl.innerHTML = `
                <p><strong>First Order:</strong> ${
                  formatDate(stats.date_range.earliest_order) || 'N/A'
                }</p>
                <p><strong>Latest Order:</strong> ${
                  formatDate(stats.date_range.latest_order) || 'N/A'
                }</p>
            `;
    } else {
      dateRangeEl.innerHTML = '<p>No date range data available</p>';
    }
  }
}

async function refreshAnalytics() {
  await loadStats();
  showToast('Analytics refreshed');
}

// Item Row Management - Updated with product dropdowns
function addItemRow() {
  itemRowCounter++;
  const container = document.getElementById('itemsContainer');

  const itemRow = document.createElement('div');
  itemRow.className = 'item-row';
  itemRow.id = `itemRow${itemRowCounter}`;

  itemRow.innerHTML = `
        <div class="form-group">
            <label>Product:</label>
            <select class="item-product-id" required onchange="updateItemPrice(this); calculateOrderTotal()">
                <option value="">Select Product</option>
                <option value="1">Laptop Computer - $899.99</option>
                <option value="2">Wireless Mouse - $29.99</option>
                <option value="3">USB Keyboard - $49.99</option>
            </select>
        </div>
        <div class="form-group">
            <label>Quantity:</label>
            <input type="number" class="item-quantity" min="1" value="1" required onchange="calculateOrderTotal()">
        </div>
        <div class="form-group">
            <label>Unit Price:</label>
            <input type="number" class="item-price" step="0.01" min="0" required onchange="calculateOrderTotal()">
        </div>
        <div class="form-group">
            <label>Total:</label>
            <span class="line-total">$0.00</span>
        </div>
        <button type="button" class="remove-item-btn" onclick="removeItemRow(${itemRowCounter})" title="Remove Item">
            <i class="fas fa-times"></i>
        </button>
    `;

  container.appendChild(itemRow);
  calculateOrderTotal();
}

function addItemRowWithData(item) {
  itemRowCounter++;
  const container = document.getElementById('itemsContainer');

  const itemRow = document.createElement('div');
  itemRow.className = 'item-row';
  itemRow.id = `itemRow${itemRowCounter}`;

  itemRow.innerHTML = `
        <div class="form-group">
            <label>Product:</label>
            <select class="item-product-id" required onchange="updateItemPrice(this); calculateOrderTotal()">
                <option value="">Select Product</option>
                <option value="1" ${
                  item.product_id === 1 ? 'selected' : ''
                }>Laptop Computer - $899.99</option>
                <option value="2" ${
                  item.product_id === 2 ? 'selected' : ''
                }>Wireless Mouse - $29.99</option>
                <option value="3" ${
                  item.product_id === 3 ? 'selected' : ''
                }>USB Keyboard - $49.99</option>
            </select>
        </div>
        <div class="form-group">
            <label>Quantity:</label>
            <input type="number" class="item-quantity" min="1" value="${
              item.quantity
            }" required onchange="calculateOrderTotal()">
        </div>
        <div class="form-group">
            <label>Unit Price:</label>
            <input type="number" class="item-price" step="0.01" min="0" value="${
              item.unit_price
            }" required onchange="calculateOrderTotal()">
        </div>
        <div class="form-group">
            <label>Total:</label>
            <span class="line-total">$0.00</span>
        </div>
        <button type="button" class="remove-item-btn" onclick="removeItemRow(${itemRowCounter})" title="Remove Item">
            <i class="fas fa-times"></i>
        </button>
    `;

  container.appendChild(itemRow);
}

function updateItemPrice(selectElement) {
  const productId = parseInt(selectElement.value);
  const product = products[productId];
  if (product) {
    const priceInput = selectElement
      .closest('.item-row')
      .querySelector('.item-price');
    priceInput.value = product.price;
  }
}

function removeItemRow(rowId) {
  const row = document.getElementById(`itemRow${rowId}`);
  if (row) {
    row.remove();
    calculateOrderTotal();
  }
}

function calculateOrderTotal() {
  let total = 0;
  const itemRows = document.querySelectorAll('.item-row');

  itemRows.forEach((row) => {
    const quantity = parseFloat(row.querySelector('.item-quantity').value) || 0;
    const price = parseFloat(row.querySelector('.item-price').value) || 0;
    const lineTotal = quantity * price;

    row.querySelector('.line-total').textContent = formatCurrency(lineTotal);
    total += lineTotal;
  });

  document.getElementById('orderTotal').textContent = total.toFixed(2);
}

async function createOrderWithItems() {
  try {
    const customerId = parseInt(document.getElementById('customerId').value);
    const orderDate = document.getElementById('orderDate').value;

    if (!customerId || !orderDate) {
      showToast('Please fill in all order details', 'error');
      return;
    }

    const items = [];
    const itemRows = document.querySelectorAll('.item-row');

    for (let row of itemRows) {
      const productSelect = row.querySelector('.item-product-id');
      const productId = parseInt(productSelect.value);
      const quantity = parseInt(row.querySelector('.item-quantity').value);
      const unitPrice = parseFloat(row.querySelector('.item-price').value);

      if (!productId || !quantity || !unitPrice) {
        showToast('Please fill in all item details', 'error');
        return;
      }

      if (quantity <= 0 || unitPrice <= 0) {
        showToast('Quantity and price must be positive numbers', 'error');
        return;
      }

      items.push({
        product_id: productId,
        quantity: quantity,
        unit_price: unitPrice,
      });
    }

    if (items.length === 0) {
      showToast('Please add at least one item to the order', 'error');
      return;
    }

    const orderData = {
      customer_id: customerId,
      order_date: orderDate,
    };

    const result = await createOrderWithItemsAPI(orderData, items);

    closeOrderModal();
    showToast(
      `Order #${result.order_id} created successfully with ${
        items.length
      } items! Total: ${formatCurrency(result.total_amount)}`
    );
    await loadAllData();
  } catch (error) {
    console.error('Failed to create order with items:', error);
    showToast('Failed to create order with items. Please try again.', 'error');
  }
}

// Event Listeners Setup
function setupEventListeners() {
  // Form submissions
  document
    .getElementById('itemForm')
    .addEventListener('submit', handleOrderItemFormSubmit);

  // Close modals when clicking outside
  window.addEventListener('click', function (event) {
    const modals = ['orderModal', 'itemModal'];
    modals.forEach((modalId) => {
      const modal = document.getElementById(modalId);
      if (event.target === modal) {
        modal.style.display = 'none';
      }
    });
  });
}

// Make functions globally available
window.showTab = showTab;
window.showCreateOrderModal = showCreateOrderModal;
window.closeOrderModal = closeOrderModal;
window.showCreateItemModal = showCreateItemModal;
window.closeItemModal = closeItemModal;
window.editOrder = editOrder;
window.deleteOrder = deleteOrder;
window.viewOrder = viewOrder;
window.editOrderItem = editOrderItem;
window.deleteOrderItem = deleteOrderItem;
window.refreshAnalytics = refreshAnalytics;
window.addItemRow = addItemRow;
window.removeItemRow = removeItemRow;
window.calculateOrderTotal = calculateOrderTotal;
window.createOrderWithItems = createOrderWithItems;
window.loadOrders = loadOrders;
window.loadOrderItems = loadOrderItems;
window.updateItemPrice = updateItemPrice;

console.log('Orders Management app.js loaded - Application ready!');
