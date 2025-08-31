import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';

// Reference Data
const CUSTOMERS = {
  1: 'Alice Johnson',
  2: 'Bob Smith',
  3: 'Carol Davis',
};

const PRODUCTS = {
  1: { name: 'Laptop Computer', price: 899.99 },
  2: { name: 'Wireless Mouse', price: 29.99 },
  3: { name: 'USB Keyboard', price: 49.99 },
};

const getTodayDate = () => {
  return new Date().toISOString().split('T')[0];
};

const AddOrderForm = ({
  show,
  editingOrder,
  onClose,
  onSave,
  showToast,
  formatCurrency,
}) => {
  const [orderForm, setOrderForm] = useState({
    customer_id: '',
    order_date: getTodayDate(),
    items: [{ product_id: '', quantity: 1, unit_price: 0 }],
  });

  useEffect(() => {
    if (show && !editingOrder) {
      // Reset form for new order
      setOrderForm({
        customer_id: '',
        order_date: getTodayDate(),
        items: [{ product_id: '', quantity: 1, unit_price: 0 }],
      });
    }
  }, [show, editingOrder]);

  useEffect(() => {
    if (editingOrder) {
      // Load existing order data
      loadOrderForEdit(editingOrder);
    }
  }, [editingOrder]);

  const loadOrderForEdit = async (orderId) => {
    try {
      const [order, orderItems] = await Promise.all([
        api.getOrder(orderId),
        api.getOrderItemsByOrder(orderId),
      ]);

      setOrderForm({
        customer_id: order.customer_id.toString(),
        order_date: order.order_date,
        items:
          orderItems.length > 0
            ? orderItems.map((item) => ({
                product_id: item.product_id.toString(),
                quantity: item.quantity,
                unit_price: item.unit_price,
              }))
            : [{ product_id: '', quantity: 1, unit_price: 0 }],
      });
    } catch (error) {
      console.error('Failed to load order for editing:', error);
      showToast('Failed to load order details', 'error');
    }
  };

  const addItemRow = () => {
    setOrderForm((prev) => ({
      ...prev,
      items: [...prev.items, { product_id: '', quantity: 1, unit_price: 0 }],
    }));
  };

  const removeItemRow = (index) => {
    if (orderForm.items.length > 1) {
      setOrderForm((prev) => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index),
      }));
    }
  };

  const updateItem = (index, field, value) => {
    setOrderForm((prev) => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [field]: value };

      // Auto-update price when product is selected
      if (field === 'product_id' && value) {
        const product = PRODUCTS[value];
        if (product) {
          newItems[index].unit_price = product.price;
        }
      }

      return { ...prev, items: newItems };
    });
  };

  const updateOrderField = (field, value) => {
    setOrderForm((prev) => ({ ...prev, [field]: value }));
  };

  const calculateTotal = () => {
    return orderForm.items.reduce((sum, item) => {
      return (
        sum + parseFloat(item.quantity || 0) * parseFloat(item.unit_price || 0)
      );
    }, 0);
  };

  const handleSave = async () => {
    // Validation
    if (!orderForm.customer_id || !orderForm.order_date) {
      showToast('Please fill in all order details', 'error');
      return;
    }

    for (const item of orderForm.items) {
      if (!item.product_id || !item.quantity || !item.unit_price) {
        showToast('Please fill in all item details', 'error');
        return;
      }

      if (item.quantity <= 0 || item.unit_price <= 0) {
        showToast('Quantity and price must be positive numbers', 'error');
        return;
      }
    }

    const orderData = {
      customer_id: orderForm.customer_id,
      order_date: orderForm.order_date,
    };

    await onSave(orderData, orderForm.items, editingOrder);
  };

  if (!show) return null;

  return (
    <div
      className='modal'
      onClick={(e) => e.target.className === 'modal' && onClose()}
    >
      <div className='modal-content'>
        <div className='modal-header'>
          <h3>
            {editingOrder ? `Edit Order #${editingOrder}` : 'Create New Order'}
          </h3>
          <span className='close' onClick={onClose}>
            &times;
          </span>
        </div>
        <div className='modal-body'>
          <div className='order-details-section'>
            <h4>Order Details</h4>
            <div className='form-row'>
              <div className='form-group'>
                <label>Customer:</label>
                <select
                  value={orderForm.customer_id}
                  onChange={(e) =>
                    updateOrderField('customer_id', e.target.value)
                  }
                  required
                >
                  <option value=''>Select Customer</option>
                  {Object.entries(CUSTOMERS).map(([id, name]) => (
                    <option key={id} value={id}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
              <div className='form-group'>
                <label>Order Date:</label>
                <input
                  type='date'
                  value={orderForm.order_date}
                  onChange={(e) =>
                    updateOrderField('order_date', e.target.value)
                  }
                  required
                />
              </div>
            </div>
          </div>

          <div className='items-section'>
            <div className='section-header'>
              <h4>Order Items</h4>
              <button
                type='button'
                className='btn btn-sm btn-primary'
                onClick={addItemRow}
              >
                <i className='fas fa-plus'></i> Add Item
              </button>
            </div>

            {orderForm.items.map((item, index) => (
              <div key={index} className='item-row'>
                <div className='form-group'>
                  <label>Product:</label>
                  <select
                    value={item.product_id}
                    onChange={(e) =>
                      updateItem(index, 'product_id', e.target.value)
                    }
                    required
                  >
                    <option value=''>Select Product</option>
                    {Object.entries(PRODUCTS).map(([id, product]) => (
                      <option key={id} value={id}>
                        {product.name} - {formatCurrency(product.price)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className='form-group'>
                  <label>Quantity:</label>
                  <input
                    type='number'
                    min='1'
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(index, 'quantity', e.target.value)
                    }
                    required
                  />
                </div>
                <div className='form-group'>
                  <label>Unit Price:</label>
                  <input
                    type='number'
                    step='0.01'
                    min='0'
                    value={item.unit_price}
                    onChange={(e) =>
                      updateItem(index, 'unit_price', e.target.value)
                    }
                    required
                  />
                </div>
                <div className='form-group'>
                  <label>Total:</label>
                  <div className='item-total'>
                    {formatCurrency(
                      (item.quantity || 0) * (item.unit_price || 0)
                    )}
                  </div>
                </div>
                <button
                  type='button'
                  className='remove-item-btn'
                  onClick={() => removeItemRow(index)}
                  style={{
                    visibility:
                      orderForm.items.length === 1 ? 'hidden' : 'visible',
                  }}
                >
                  <i className='fas fa-times'></i>
                </button>
              </div>
            ))}

            <div className='order-summary'>
              <strong>Total: {formatCurrency(calculateTotal())}</strong>
            </div>
          </div>

          <div className='form-buttons'>
            <button
              type='button'
              className='btn btn-secondary'
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type='button'
              className='btn btn-success'
              onClick={handleSave}
            >
              <i className='fas fa-shopping-cart'></i>{' '}
              {editingOrder ? 'Update' : 'Create'} Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddOrderForm;
