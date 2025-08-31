import React from 'react';
import './App.css';
import Test from './test.js';

function App() {
  return (
    <div
      style={{
        padding: '20px',
        textAlign: 'center',
        background: 'linear-gradient(135deg, #ffb3d9 0%, #ff7b42 100%)',
        minHeight: '100vh',
        color: 'white',
      }}
    >
      <Test />
      <h1>UPDATED 999 - React Orders Management System</h1>
      <h2>React is Working!</h2>
      <p>If you see this message, React is running correctly.</p>
      <button
        style={{
          padding: '10px 20px',
          background: 'white',
          color: '#ff7b42',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '16px',
          marginTop: '20px',
        }}
        onClick={() => alert('Button clicked! React is interactive.')}
      >
        Test Button
      </button>
    </div>
  );
}

export default App;
