import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './contexts/CartContext';
import Navbar from './components/Navbar';
import MenuPage from './components/MenuPage';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import OrderStatus from './components/OrderStatus';
import QRCodePage from './components/QRCodePage';
import AdminPage from './components/AdminPage';
import RestaurantDashboard from './components/RestaurantDashboard';
import './App.css';

function App() {
  return (
    <CartProvider>
      <Router>
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/" element={<MenuPage />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-status/:orderId" element={<OrderStatus />} />
            <Route path="/qrcode" element={<QRCodePage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/dashboard" element={<RestaurantDashboard />} />
          </Routes>
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;