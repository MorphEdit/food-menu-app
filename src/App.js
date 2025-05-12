import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './contexts/CartContext';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import MenuPage from './components/MenuPage';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import OrderStatus from './components/OrderStatus';
import QRCodePage from './components/QRCodePage';
import AdminPage from './components/AdminPage';
import RestaurantDashboard from './components/RestaurantDashboard';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import MenuItemForm from './components/menu/MenuItemForm';
import TableManagement from './components/table/TableManagement';
import PromotionManagement from './components/promotions/PromotionManagement';
import ReviewSystem from './components/reviews/ReviewSystem';
import SalesReport from './components/reports/SalesReport';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router basename="/build">
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
              
              {/* เส้นทางใหม่ */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/menu/add" element={<MenuItemForm />} />
              <Route path="/menu/edit/:id" element={<MenuItemForm />} />
              <Route path="/tables" element={<TableManagement />} />
              <Route path="/promotions" element={<PromotionManagement />} />
              <Route path="/reviews" element={<ReviewSystem />} />
              <Route path="/reports/sales" element={<SalesReport />} />
            </Routes>
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;