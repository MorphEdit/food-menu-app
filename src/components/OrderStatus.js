import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import '../styles/OrderStatus.css';

function OrderStatus() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    // โหลดข้อมูลออเดอร์จาก localStorage
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const foundOrder = orders.find(order => order.id.toString() === orderId);
    
    if (foundOrder) {
      setOrder(foundOrder);
    } else {
      setError('ไม่พบข้อมูลออเดอร์');
    }
    
    setLoading(false);
    
    // ตั้ง polling เพื่ออัพเดทสถานะทุก 10 วินาที
    const intervalId = setInterval(() => {
      const updatedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      const updatedOrder = updatedOrders.find(order => order.id.toString() === orderId);
      
      if (updatedOrder) {
        setOrder(updatedOrder);
      }
    }, 10000);
    
    return () => clearInterval(intervalId);
  }, [orderId]);
  
  if (loading) {
    return (
      <div className="order-status-page">
        <div className="loading">กำลังโหลดข้อมูล...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="order-status-page">
        <div className="error-message">{error}</div>
        <Link to="/" className="back-to-menu">กลับไปหน้าเมนู</Link>
      </div>
    );
  }
  
  // แปลงสถานะเป็นภาษาไทย
  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'รอรับออเดอร์';
      case 'accepted':
        return 'กำลังปรุงอาหาร';
      case 'ready':
        return 'อาหารพร้อมเสิร์ฟ';
      case 'completed':
        return 'เสร็จสิ้น';
      case 'cancelled':
        return 'ยกเลิก';
      default:
        return status;
    }
  };
  
  // แปลงสถานะเป็น class name
  const getStatusClass = (status) => {
    switch (status) {
      case 'pending':
        return 'status-pending';
      case 'accepted':
        return 'status-accepted';
      case 'ready':
        return 'status-ready';
      case 'completed':
        return 'status-completed';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return '';
    }
  };
  
  // แปลงวันที่ให้อยู่ในรูปแบบที่อ่านง่าย
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <div className="order-status-page">
      <h1>สถานะออเดอร์</h1>
      
      <div className="order-status-container">
        <div className="order-info">
          <h2>ข้อมูลออเดอร์</h2>
          
          <div className="info-group">
            <span className="label">หมายเลขออเดอร์:</span>
            <span className="value">{order.id}</span>
          </div>
          
          <div className="info-group">
            <span className="label">วันที่สั่ง:</span>
            <span className="value">{formatDate(order.createdAt)}</span>
          </div>
          
          <div className="info-group">
            <span className="label">โต๊ะ:</span>
            <span className="value">{order.tableNumber}</span>
          </div>
          
          <div className="info-group">
            <span className="label">ชื่อผู้สั่ง:</span>
            <span className="value">{order.customerName}</span>
          </div>
          
          {order.note && (
            <div className="info-group">
              <span className="label">หมายเหตุ:</span>
              <span className="value">{order.note}</span>
            </div>
          )}
          
          <div className="info-group status-group">
            <span className="label">สถานะ:</span>
            <span className={`status-badge ${getStatusClass(order.status)}`}>
              {getStatusText(order.status)}
            </span>
          </div>
        </div>
        
        <div className="order-items">
          <h2>รายการอาหาร</h2>
          
          {order.items.map((item, index) => (
            <div key={index} className="status-item">
              <div className="item-info">
                <h3>{item.name}</h3>
                <p className="item-price">{item.price} บาท x {item.quantity}</p>
              </div>
              <div className="item-total">
                {item.price * item.quantity} บาท
              </div>
            </div>
          ))}
          
          <div className="status-total">
            <span>รวมทั้งสิ้น</span>
            <span className="total-price">{order.total} บาท</span>
          </div>
        </div>
      </div>
      
      <div className="status-tracker">
        <div className={`status-step ${order.status !== 'cancelled' ? 'active' : ''}`}>
          <div className="step-icon">1</div>
          <div className="step-label">รอรับออเดอร์</div>
        </div>
        
        <div className={`status-step ${['accepted', 'ready', 'completed'].includes(order.status) ? 'active' : ''}`}>
          <div className="step-icon">2</div>
          <div className="step-label">กำลังปรุงอาหาร</div>
        </div>
        
        <div className={`status-step ${['ready', 'completed'].includes(order.status) ? 'active' : ''}`}>
          <div className="step-icon">3</div>
          <div className="step-label">อาหารพร้อมเสิร์ฟ</div>
        </div>
        
        <div className={`status-step ${order.status === 'completed' ? 'active' : ''}`}>
          <div className="step-icon">4</div>
          <div className="step-label">เสร็จสิ้น</div>
        </div>
      </div>
      
      <div className="status-actions">
        <Link to="/" className="menu-link">กลับไปเมนูหลัก</Link>
        <Link to="/order-history" className="history-link">ดูประวัติการสั่งซื้อ</Link>
      </div>
    </div>
  );
}

export default OrderStatus;