import './app.css';
import React, { useState } from 'react';
import OrderList from './components/OrderList';
import AddOrderForm from './components/AddOrderForm';

const sampleOrders = [];

export default function App() {
  const [orders, setOrders] = useState(sampleOrders);
  const [showForm, setShowForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);

  const formatDate = (d) => (d ? new Date(d).toLocaleDateString() : '-');
  const formatCurrency = (v) =>
    typeof v === 'number'
      ? `$${v.toFixed(2)}`
      : `$${parseFloat(v || 0).toFixed(2)}`;

  const handleCreateNew = () => {
    setEditingOrder(null);
    setShowForm(true);
  };

  const handleSave = (orderData, items = [], editingId) => {
    if (editingId) {
      setOrders((prev) =>
        prev.map((o) => (o.id === editingId ? { ...o, ...orderData } : o))
      );
    } else {
      const id = orders.length ? Math.max(...orders.map((o) => o.id)) + 1 : 1;
      const total_amount = items.reduce(
        (s, it) => s + it.quantity * it.unit_price,
        0
      );
      setOrders((prev) => [
        ...prev,
        {
          id,
          customer_id: orderData.customer_id || 1,
          order_date: orderData.order_date,
          total_amount,
        },
      ]);
    }
    setShowForm(false);
  };

  const handleEdit = (id) => {
    setEditingOrder(id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm(`Delete order #${id}?`))
      setOrders((prev) => prev.filter((o) => o.id !== id));
  };

  return (
    <div className='app-root'>
      <header className='app-header'>
        <h1>
          <i className='fas fa-shopping-cart'></i> React Orders Management
          System
        </h1>
      </header>
      <OrderList
        orders={orders}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCreateNew={handleCreateNew}
        formatDate={formatDate}
        formatCurrency={formatCurrency}
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
