import React from 'react';

// Reference Data
const CUSTOMERS = {
  1: 'Alice Johnson',
  2: 'Bob Smith',
  3: 'Carol Davis',
};

const OrderItem = ({ order, onEdit, onDelete, formatDate, formatCurrency }) => {
  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete Order #${order.id}?`)) {
      onDelete(order.id);
    }
  };

  const getCustomerName = (customerId) => {
    return CUSTOMERS[customerId] || `Customer ${customerId}`;
  };

  return (
    <tr>
      <td>#{order.id}</td>
      <td>{getCustomerName(order.customer_id)}</td>
      <td>{formatDate(order.order_date)}</td>
      <td>{formatCurrency(order.total_amount)}</td>
      <td>
        <div className='action-buttons'>
          <button
            className='btn btn-sm btn-primary'
            onClick={() => onEdit(order.id)}
            title='Edit'
          >
            <i className='fas fa-edit'></i>
          </button>
          <button
            className='btn btn-sm btn-danger'
            onClick={handleDelete}
            title='Delete'
          >
            <i className='fas fa-trash'></i>
          </button>
        </div>
      </td>
    </tr>
  );
};

export default OrderItem;
