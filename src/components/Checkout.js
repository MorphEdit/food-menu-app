import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import '../styles/Checkout.css';

function Checkout() {
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();
  const [tableNumber, setTableNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // ดึงหมายเลขโต๊ะจาก URL query parameter (ถ้ามี)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tableParam = params.get('table');
    if (tableParam) {
      setTableNumber(tableParam);
    }
  }, []);
  
  // คำนวณยอดรวม
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // ถ้าตะกร้าว่าง ให้กลับไปหน้าเมนู
  useEffect(() => {
    if (cart.length === 0) {
      navigate('/');
    }
  }, [cart, navigate]);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!tableNumber) {
      setError('กรุณาระบุหมายเลขโต๊ะ');
      return;
    }
    
    if (!customerName) {
      setError('กรุณาระบุชื่อ');
      return;
    }
    
    setIsSubmitting(true);
    
    // สร้างข้อมูลออเดอร์
    const order = {
      id: Date.now(),
      tableNumber,
      customerName,
      items: cart,
      total,
      note,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    // ดึงออเดอร์ทั้งหมดจาก localStorage
    const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    
    // เพิ่มออเดอร์ใหม่
    const updatedOrders = [order, ...existingOrders];
    
    // บันทึกลง localStorage
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
    
    // เคลียร์ตะกร้า
    clearCart();
    
    // ไปยังหน้าติดตามสถานะออเดอร์
    navigate(`/order-status/${order.id}`);
  };
  
  return (
    <div className="checkout-page">
      <h1>ยืนยันการสั่งอาหาร</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="checkout-container">
        <div className="order-summary">
          <h2>สรุปรายการอาหาร</h2>
          
          {cart.map(item => (
            <div key={item._id} className="checkout-item">
              <div className="item-info">
                <h3>{item.name}</h3>
                <p>{item.price} บาท x {item.quantity}</p>
              </div>
              <div className="item-total">
                {item.price * item.quantity} บาท
              </div>
            </div>
          ))}
          
          <div className="order-total">
            <span>รวมทั้งสิ้น</span>
            <span className="total-price">{total} บาท</span>
          </div>
        </div>
        
        <div className="customer-info">
          <h2>ข้อมูลการสั่งอาหาร</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="table-number">หมายเลขโต๊ะ</label>
              <input 
                id="table-number"
                type="number" 
                value={tableNumber} 
                onChange={(e) => setTableNumber(e.target.value)}
                placeholder="ระบุหมายเลขโต๊ะ"
                min="1"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="customer-name">ชื่อผู้สั่ง</label>
              <input 
                id="customer-name"
                type="text" 
                value={customerName} 
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="ระบุชื่อของคุณ"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="note">หมายเหตุ (ถ้ามี)</label>
              <textarea 
                id="note"
                value={note} 
                onChange={(e) => setNote(e.target.value)}
                placeholder="เช่น ไม่ใส่ผักชี, ไม่เผ็ด"
              />
            </div>
            
            <button 
              type="submit" 
              className="confirm-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'กำลังดำเนินการ...' : 'ยืนยันการสั่งอาหาร'}
            </button>
            
            <Link to="/cart" className="back-link">
              กลับไปแก้ไขตะกร้า
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Checkout;