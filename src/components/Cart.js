import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import '../styles/Cart.css';

function Cart() {
  const { cart, removeFromCart, updateQuantity } = useCart();
  
  // คำนวณราคารวม
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  if (cart.length === 0) {
    return (
      <div className="cart-page empty-cart">
        <h1>ตะกร้าสินค้า</h1>
        <div className="empty-cart-message">
          <svg className="empty-cart-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
          </svg>
          <p>ไม่มีรายการอาหารในตะกร้า</p>
          <Link to="/" className="continue-shopping">
            กลับไปเลือกเมนูอาหาร
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="cart-page">
      <h1>ตะกร้าสินค้า</h1>
      
      <div className="cart-items">
        {cart.map(item => (
          <div key={item._id} className="cart-item">
            <div className="cart-item-image">
              <img src={item.imageUrl || "https://via.placeholder.com/100"} alt={item.name} />
            </div>
            
            <div className="item-info">
              <h3>{item.name}</h3>
              <p className="item-description">{item.description}</p>
              <p className="item-price">{item.price} บาท</p>
            </div>
            
            <div className="item-quantity">
              <button 
                className="quantity-btn"
                onClick={() => updateQuantity(item._id, item.quantity - 1)}
              >
                -
              </button>
              <span className="quantity-value">{item.quantity}</span>
              <button 
                className="quantity-btn"
                onClick={() => updateQuantity(item._id, item.quantity + 1)}
              >
                +
              </button>
            </div>
            
            <div className="item-total">
              <span className="total-label">รวม:</span>
              <span className="total-value">{item.price * item.quantity} บาท</span>
              <button 
                className="remove-btn"
                onClick={() => removeFromCart(item._id)}
              >
                ลบ
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="cart-summary">
        <div className="summary-row">
          <span>จำนวนรายการ:</span>
          <span className="summary-value">{cart.length} รายการ</span>
        </div>
        <div className="summary-row">
          <span>ราคารวม:</span>
          <span className="summary-value">{total} บาท</span>
        </div>
        
        <Link to="/checkout" className="checkout-button">ดำเนินการสั่งซื้อ</Link>
        
        <Link to="/" className="continue-shopping">
          เลือกเมนูเพิ่มเติม
        </Link>
      </div>
    </div>
  );
}

export default Cart;