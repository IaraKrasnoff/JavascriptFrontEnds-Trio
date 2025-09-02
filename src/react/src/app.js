import './app.css';
import React, { useState, useEffect } from 'react';
import OrderList from './components/OrderList';
import AddOrderForm from './components/AddOrderForm';
import { api } from './utils/api';

export default function App() {
  const [orders, setOrders] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load orders from API on component mount
  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const ordersData = await api.getOrders();
      setOrders(ordersData);
    } catch (error) {
      console.error('Failed to load orders:', error);
      alert('Failed to load orders from the server');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d) => (d ? new Date(d).toLocaleDateString() : '-');
  const formatCurrency = (v) =>
    typeof v === 'number'
      ? `$${v.toFixed(2)}`
      : `$${parseFloat(v || 0).toFixed(2)}`;

  const handleCreateNew = () => {
    setEditingOrder(null);
    setShowForm(true);
  };

  const handleSave = async (orderData, items = [], editingId) => {
    try {
      setLoading(true);
      
      if (editingId) {
        // Update existing order
        await api.updateOrder(editingId, orderData);
      } else {
        // Create new order with items
        const orderWithItemsData = {
          customer_id: parseInt(orderData.customer_id),
          order_date: orderData.order_date,
          items: items.map(item => ({
            product_id: parseInt(item.product_id),
            quantity: parseInt(item.quantity),
            unit_price: parseFloat(item.unit_price),
          })),
        };
        await api.createOrderWithItems(orderWithItemsData);
      }
      
      // Reload orders to get latest data
      await loadOrders();
      setShowForm(false);
      alert('Order saved successfully!');
    } catch (error) {
      console.error('Failed to save order:', error);
      alert('Failed to save order');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id) => {
    setEditingOrder(id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm(`Delete order #${id}?`)) {
      try {
        setLoading(true);
        await api.deleteOrder(id);
        await loadOrders();
        alert('Order deleted successfully!');
      } catch (error) {
        console.error('Failed to delete order:', error);
        alert('Failed to delete order');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className='app-root'>
      <header className='app-header'>
        <h1>
          <i className='fas fa-shopping-cart'></i> React Orders Management
          System
        </h1>
      </header>
      
      {loading && <div className="loading">Loading...</div>}
      
      <OrderList
        orders={orders}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCreateNew={handleCreateNew}
        formatDate={formatDate}
        formatCurrency={formatCurrency}
        loading={loading}
      />

      <AddOrderForm
        show={showForm}
        editingOrder={editingOrder}
        onClose={() => setShowForm(false)}
        onSave={handleSave}
        showToast={(msg) => alert(msg)}
        formatCurrency={formatCurrency}
      />
    </div>
  );
}
