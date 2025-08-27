// test-api.js
import { getAllOrders, createOrder } from './api.js';

(async () => {
  try {
    const orders = await getAllOrders();
    console.log("Orders:", orders);

    const newOrder = await createOrder({customer_name: "Test", order_date: "2025-08-27"});
    console.log("Created:", newOrder);
  } catch (e) {
    console.error(e);
  }
})();