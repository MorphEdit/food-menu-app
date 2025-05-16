import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import '../styles/OrderStatus.css';

function OrderStatus() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  
  useEffect(() => {
    // โหลดข้อมูลออเดอร์จาก localStorage
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const foundOrder = orders.find(order => order.id.toString() === orderId);
    
    if (foundOrder) {
      setOrder(foundOrder);
      
      // สถานะเริ่มต้นควรจะเป็น 'pending'
      // ตั้งเวลาจำลองสำหรับการเปลี่ยนสถานะอัตโนมัติ
      if (foundOrder.status === 'pending') {
        // ตั้งเวลานับถอยหลัง 2 นาที (120 วินาที)
        setCountdown(120);
      }
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
  
  // จำลองการนับถอยหลังและเปลี่ยนสถานะอัตโนมัติ
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else if (countdown === 0 && order && order.status === 'pending') {
      // เมื่อนับถอยหลังถึง 0 ให้เปลี่ยนสถานะเป็น 'accepted'
      const updatedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      const updatedOrdersList = updatedOrders.map(item => {
        if (item.id.toString() === orderId) {
          return { ...item, status: 'accepted' };
        }
        return item;
      });
      
      localStorage.setItem('orders', JSON.stringify(updatedOrdersList));
      setOrder(prev => ({ ...prev, status: 'accepted' }));
      
      // ตั้งเวลาต่อไปอีก 3 นาที (180 วินาที) เพื่อเปลี่ยนเป็น 'ready'
      setTimeout(() => {
        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
        const updatedOrders = orders.map(item => {
          if (item.id.toString() === orderId) {
            return { ...item, status: 'ready' };
          }
          return item;
        });
        
        localStorage.setItem('orders', JSON.stringify(updatedOrders));
        setOrder(prev => ({ ...prev, status: 'ready' }));
      }, 180000);
    }
  }, [countdown, order, orderId]);
  
  if (loading) {
    return (
      <div className="order-status-page">
        <div className="loading">
          <div className="loading-spinner"></div>
          <div>กำลังโหลดข้อมูล...</div>
        </div>
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
  
  // ประมาณเวลารอสำหรับแต่ละสถานะ
  const getEstimatedTime = (status) => {
    switch (status) {
      case 'pending':
        return countdown > 0 ? `ประมาณ ${Math.floor(countdown / 60)}:${(countdown % 60).toString().padStart(2, '0')} นาที` : 'กำลังดำเนินการ';
      case 'accepted':
        return 'ประมาณ 10-15 นาที';
      case 'ready':
        return 'พร้อมเสิร์ฟแล้ว';
      case 'completed':
        return '';
      case 'cancelled':
        return '';
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
      <div className="order-status-header">
        <h1>สถานะออเดอร์</h1>
        <div className="order-id">หมายเลขออเดอร์: {order.id}</div>
      </div>
      
      <div className="status-container">
        <div className="status-card">
          <div className="status-progress">
            <div className={`status-indicator ${order.status}`}>
              <div className="status-icon">
                {order.status === 'cancelled' ? (
                  <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                ) : order.status === 'completed' ? (
                  <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                ) : (
                  <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                )}
              </div>
              <div className="status-text">{getStatusText(order.status)}</div>
            </div>
          </div>
          
          <div className="status-progress-bar">
            <div className="progress-track">
              <div 
                className={`progress-fill ${order.status}`}
                style={{
                  width: 
                    order.status === 'pending' ? '25%' :
                    order.status === 'accepted' ? '50%' :
                    order.status === 'ready' ? '75%' :
                    order.status === 'completed' ? '100%' :
                    order.status === 'cancelled' ? '100%' : '0%'
                }}
              ></div>
            </div>
            
            <div className="progress-steps">
              <div className={`progress-step ${order.status !== 'cancelled' ? 'active' : ''}`}>
                <div className="step-number">1</div>
                <div className="step-label">รับออเดอร์</div>
              </div>
              <div className={`progress-step ${['accepted', 'ready', 'completed'].includes(order.status) ? 'active' : ''}`}>
                <div className="step-number">2</div>
                <div className="step-label">ปรุงอาหาร</div>
              </div>
              <div className={`progress-step ${['ready', 'completed'].includes(order.status) ? 'active' : ''}`}>
                <div className="step-number">3</div>
                <div className="step-label">พร้อมเสิร์ฟ</div>
              </div>
              <div className={`progress-step ${order.status === 'completed' ? 'active' : ''}`}>
                <div className="step-number">4</div>
                <div className="step-label">เสร็จสิ้น</div>
              </div>
            </div>
          </div>
          
          <div className="estimated-time">
            {getEstimatedTime(order.status)}
          </div>
        </div>
        
        <div className="order-details-card">
          <h2>รายละเอียดออเดอร์</h2>
          
          <div className="order-details-row">
            <div className="info-group">
              <div className="info-label">วันที่สั่ง</div>
              <div className="info-value">{formatDate(order.createdAt)}</div>
            </div>
            <div className="info-group">
              <div className="info-label">โต๊ะ</div>
              <div className="info-value">{order.tableNumber}</div>
            </div>
          </div>
          
          <div className="order-details-row">
            <div className="info-group">
              <div className="info-label">ชื่อผู้สั่ง</div>
              <div className="info-value">{order.customerName}</div>
            </div>
            {order.note && (
              <div className="info-group">
                <div className="info-label">หมายเหตุ</div>
                <div className="info-value note">{order.note}</div>
              </div>
            )}
          </div>
        </div>
        
        <div className="order-items-card">
          <h2>รายการอาหาร</h2>
          
          <div className="order-items-list">
            {order.items.map((item, index) => (
              <div key={index} className="order-item">
                <div className="order-item-quantity">{item.quantity} x</div>
                <div className="order-item-name">{item.name}</div>
                <div className="order-item-price">{item.price * item.quantity} บาท</div>
              </div>
            ))}
          </div>
          
          <div className="order-summary">
            <div className="summary-row subtotal">
              <span>รวมค่าอาหาร</span>
              <span>{order.subtotal || order.total} บาท</span>
            </div>
            {order.delivery && (
              <div className="summary-row">
                <span>ค่าจัดส่ง</span>
                <span>{order.delivery} บาท</span>
              </div>
            )}
            {order.discount && (
              <div className="summary-row discount">
                <span>ส่วนลด</span>
                <span>- {order.discount} บาท</span>
              </div>
            )}
            <div className="summary-row total">
              <span>รวมทั้งสิ้น</span>
              <span>{order.total} บาท</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="status-actions">
        <Link to="/" className="menu-link">กลับไปเมนูหลัก</Link>
        {order.status === 'pending' && (
          <button 
            onClick={() => {
              const updatedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
              const updatedOrdersList = updatedOrders.map(item => {
                if (item.id.toString() === orderId) {
                  return { ...item, status: 'cancelled' };
                }
                return item;
              });
              
              localStorage.setItem('orders', JSON.stringify(updatedOrdersList));
              setOrder(prev => ({ ...prev, status: 'cancelled' }));
            }}
            className="cancel-order-btn"
          >
            ยกเลิกออเดอร์
          </button>
        )}
      </div>
    </div>
  );
}

export default OrderStatus;