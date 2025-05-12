import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Navbar.css';

function Navbar() {
  const { cart } = useCart();
  const { currentUser, logout, isAdmin, isStaff } = useAuth();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  // คำนวณจำนวนรายการทั้งหมดในตะกร้า
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  
  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };
  
  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };
  
  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };
  
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          อร่อยดี
        </Link>
        
        <div className="menu-icon" onClick={toggleMobileMenu}>
          <i className={showMobileMenu ? 'fas fa-times' : 'fas fa-bars'}></i>
          <span className="menu-icon-text">{showMobileMenu ? 'ปิด' : 'เมนู'}</span>
        </div>
        
        <ul className={showMobileMenu ? 'nav-menu active' : 'nav-menu'}>
          <li className="nav-item">
            <Link to="/" className="nav-link" onClick={() => setShowMobileMenu(false)}>
              เมนูอาหาร
            </Link>
          </li>
          
          <li className="nav-item">
            <Link to="/cart" className="nav-link" onClick={() => setShowMobileMenu(false)}>
              ตะกร้า
              {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
            </Link>
          </li>
          
          <li className="nav-item">
            <Link to="/reviews" className="nav-link" onClick={() => setShowMobileMenu(false)}>
              รีวิว
            </Link>
          </li>
          
          {currentUser && (isAdmin || isStaff) && (
            <>
              <li className="nav-item">
                <Link to="/admin" className="nav-link admin-link" onClick={() => setShowMobileMenu(false)}>
                  จัดการเมนู
                </Link>
              </li>
              
              <li className="nav-item">
                <Link to="/tables" className="nav-link" onClick={() => setShowMobileMenu(false)}>
                  จัดการโต๊ะ
                </Link>
              </li>
              
              <li className="nav-item">
                <Link to="/dashboard" className="nav-link dashboard-link" onClick={() => setShowMobileMenu(false)}>
                  แดชบอร์ด
                </Link>
              </li>
            </>
          )}
          
          {currentUser && isAdmin && (
            <>
              <li className="nav-item">
                <Link to="/promotions" className="nav-link" onClick={() => setShowMobileMenu(false)}>
                  โปรโมชัน
                </Link>
              </li>
              
              <li className="nav-item">
                <Link to="/reports/sales" className="nav-link" onClick={() => setShowMobileMenu(false)}>
                  รายงาน
                </Link>
              </li>
            </>
          )}
        </ul>
        
        <div className="user-section">
          {currentUser ? (
            <div className="user-menu-container">
              <div className="user-profile" onClick={toggleUserMenu}>
                <div className="user-avatar">{currentUser.name.charAt(0)}</div>
                <span className="user-name">{currentUser.name}</span>
              </div>
              
              {showUserMenu && (
                <div className="user-dropdown">
                  <div className="user-info">
                    <p className="user-full-name">{currentUser.name}</p>
                    <p className="user-role">{
                      currentUser.role === 'admin' ? 'ผู้ดูแลระบบ' : 
                      currentUser.role === 'staff' ? 'พนักงาน' : 'ลูกค้า'
                    }</p>
                  </div>
                  
                  <ul className="user-menu-items">
                    <li>
                      <button onClick={handleLogout} className="logout-button">
                        ออกจากระบบ
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="login-button">เข้าสู่ระบบ</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;