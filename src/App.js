import React from 'react';
import { CartProvider } from './contexts/CartContext';
import MenuPage from './components/MenuPage';
import './App.css';

function App() {
  return (
    <CartProvider>
      <div className="App">
        <MenuPage />
      </div>
    </CartProvider>
  );
}

export default App;