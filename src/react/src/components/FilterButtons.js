import React from 'react';

const FilterButtons = ({ activeFilter, onFilterChange }) => {
  const filters = [
    {
      key: 'all',
      label: 'All Orders',
      icon: 'fas fa-list',
    },
    {
      key: 'recent',
      label: 'Recent Orders',
      icon: 'fas fa-clock',
    },
    {
      key: 'high-value',
      label: 'High Value ($500+)',
      icon: 'fas fa-star',
    },
  ];

  return (
    <div className='filter-buttons'>
      {filters.map((filter) => (
        <button
          key={filter.key}
          className={`btn btn-sm ${
            activeFilter === filter.key ? 'btn-primary' : 'btn-secondary'
          }`}
          onClick={() => onFilterChange(filter.key)}
        >
          <i className={filter.icon}></i>
          {filter.label}
        </button>
      ))}
    </div>
  );
};

export default FilterButtons;
