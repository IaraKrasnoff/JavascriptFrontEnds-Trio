import React from 'react';
import OrderItem from './OrderItem';

const OrderList = ({
  orders,
  onEdit,
  onDelete,
  onCreateNew,
  formatDate,
  formatCurrency,
}) => {
  return (
    <div className='tab-content'>
      <div className='section-header'>
        <h2>
          <i className='fas fa-receipt'></i> Orders Management
        </h2>
        <div className='header-actions'>
          <button className='btn btn-success' onClick={onCreateNew}>
            <i className='fas fa-shopping-cart'></i> New Order
          </button>
        </div>
      </div>
      <div className='table-container'>
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer Name</th>
              <th>Order Date</th>
              <th>Total Amount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td
                  colSpan='5'
                  style={{
                    textAlign: 'center',
                    padding: '40px',
                    color: '#8b4a6b',
                    fontStyle: 'italic',
                  }}
                >
                  No orders found. Create your first order!
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <OrderItem
                  key={order.id}
                  order={order}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  formatDate={formatDate}
                  formatCurrency={formatCurrency}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderList;
