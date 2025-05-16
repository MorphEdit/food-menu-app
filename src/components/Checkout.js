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
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // สมมติว่ามีค่าส่ง
  const delivery = 40;
  
  // สมมติว่ามีส่วนลด
  const discount = cart.length >= 3 ? 30 : 0;
  
  // ยอดสุทธิ
  const total = subtotal + delivery - discount;
  
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
      subtotal,
      delivery,
      discount,
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
          
          <div className="checkout-items">
            {cart.map(item => (
              <div key={item._id} className="checkout-item">
                <div className="checkout-item-image">
                  <img src={item.imageUrl || "https://via.placeholder.com/60"} alt={item.name} />
                </div>
                <div className="checkout-item-details">
                  <h3>{item.name}</h3>
                  <div className="checkout-item-price">
                    <span>{item.price} บาท</span>
                    <span>×</span>
                    <span>{item.quantity}</span>
                  </div>
                </div>
                <div className="checkout-item-total">
                  {item.price * item.quantity} บาท
                </div>
              </div>
            ))}
          </div>
          
          <div className="checkout-totals">
            <div className="checkout-totals-row">
              <span>รวมค่าอาหาร</span>
              <span>{subtotal} บาท</span>
            </div>
            <div className="checkout-totals-row">
              <span>ค่าจัดส่ง</span>
              <span>{delivery} บาท</span>
            </div>
            {discount > 0 && (
              <div className="checkout-totals-row discount">
                <span>ส่วนลด</span>
                <span>- {discount} บาท</span>
              </div>
            )}
            <div className="checkout-totals-row total">
              <span>ยอดชำระทั้งสิ้น</span>
              <span>{total} บาท</span>
            </div>
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
            
            <div className="payment-options">
              <h3>วิธีการชำระเงิน</h3>
              <div className="payment-method">
                <input 
                  type="radio" 
                  id="cash" 
                  name="payment" 
                  value="cash" 
                  defaultChecked 
                />
                <label htmlFor="cash">
                  <span className="radio-icon"></span>
                  <span className="method-name">ชำระเงินปลายทาง</span>
                </label>
              </div>
              <div className="payment-method">
                <input 
                  type="radio" 
                  id="prompt-pay" 
                  name="payment" 
                  value="prompt-pay" 
                />
                <label htmlFor="prompt-pay">
                  <span className="radio-icon"></span>
                  <span className="method-name">พร้อมเพย์</span>
                </label>
              </div>
              <div className="payment-method">
                <input 
                  type="radio" 
                  id="credit-card" 
                  name="payment" 
                  value="credit-card" 
                />
                <label htmlFor="credit-card">
                  <span className="radio-icon"></span>
                  <span className="method-name">บัตรเครดิต/เดบิต</span>
                </label>
              </div>
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