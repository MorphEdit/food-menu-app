import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './contexts/CartContext';
import Navbar from './components/Navbar';
import MenuPage from './components/MenuPage';
import Cart from './components/Cart';
import QRCodePage from './components/QRCodePage';
import AdminPage from './components/AdminPage';
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
            <Route path="/qrcode" element={<QRCodePage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;