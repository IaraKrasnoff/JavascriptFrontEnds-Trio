import { getAllOrders, createOrder, deleteOrder } from './api.js';

const ordersList = document.getElementById('orders-list');
const orderForm = document.getElementById('order-form');
const messageDiv = document.getElementById('message');

async function loadOrders() {
  ordersList.innerHTML = '';
  try {
    const orders = await getAllOrders();
    orders.forEach(order => {
      const li = document.createElement('li');
      li.textContent = `${order.customer_name} (${order.order_date})`;
      const delBtn = document.createElement('button');
      delBtn.textContent = 'Delete';
      delBtn.onclick = async () => {
        await deleteOrder(order.id);
        loadOrders();
      };
      li.appendChild(delBtn);
      ordersList.appendChild(li);
    });
  } catch (e) {
    showMessage('Failed to load orders', true);
  }
}

orderForm.onsubmit = async (e) => {
  e.preventDefault();
  const customer_name = document.getElementById('customer_name').value;
  const order_date = document.getElementById('order_date').value;
  try {
    await createOrder({ customer_name, order_date });
    showMessage('Order created!');
    orderForm.reset();
    loadOrders();
  } catch (e) {
    showMessage('Failed to create order', true);
  }
};

function showMessage(msg, isError = false) {
  messageDiv.textContent = msg;
  messageDiv.style.color = isError ? 'red' : 'green';
  setTimeout(() => messageDiv.textContent = '', 2000);
}

loadOrders();