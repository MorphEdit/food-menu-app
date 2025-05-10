import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/RestaurantDashboard.css';

function RestaurantDashboard() {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');
  
  useEffect(() => {
    // โหลดข้อมูลออเดอร์จาก localStorage
    const savedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    setOrders(savedOrders);
    
    // ดึงข้อมูลเป็นประจำทุก 10 วินาที
    const intervalId = setInterval(() => {
      const refreshedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      setOrders(refreshedOrders);
    }, 10000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // กรองออเดอร์ตามสถานะ
  const filteredOrders = orders.filter(order => {
    if (activeTab === 'pending') return order.status === 'pending';
    if (activeTab === 'accepted') return order.status === 'accepted';
    if (activeTab === 'ready') return order.status === 'ready';
    if (activeTab === 'completed') return order.status === 'completed';
    if (activeTab === 'cancelled') return order.status === 'cancelled';
    return true;
  });
  
  // อัพเดทสถานะออเดอร์
  const updateOrderStatus = (orderId, newStatus) => {
    const updatedOrders = orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    );
    
    setOrders(updatedOrders);
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
  };
  
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
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // สร้างปุ่มการดำเนินการตามสถานะ
  const renderActionButtons = (order) => {
    switch (order.status) {
      case 'pending':
        return (
          <>
            <button 
              className="action-btn accept-btn"
              onClick={() => updateOrderStatus(order.id, 'accepted')}
            >
              รับออเดอร์
            </button>
            <button 
              className="action-btn cancel-btn"
              onClick={() => updateOrderStatus(order.id, 'cancelled')}
            >
              ปฏิเสธ
            </button>
          </>
        );
      case 'accepted':
        return (
          <button 
            className="action-btn ready-btn"
            onClick={() => updateOrderStatus(order.id, 'ready')}
          >
            อาหารพร้อมเสิร์ฟ
          </button>
        );
      case 'ready':
        return (
          <button 
            className="action-btn complete-btn"
            onClick={() => updateOrderStatus(order.id, 'completed')}
          >
            เสร็จสิ้น
          </button>
        );
      default:
        return null;
    }
  };
  
  // นับจำนวนออเดอร์ตามสถานะ
  const countOrdersByStatus = (status) => {
    return orders.filter(order => order.status === status).length;
  };
  
  return (
    <div className="dashboard-page">
      <h1>แดชบอร์ดร้านอาหาร</h1>
      
      <div className="dashboard-summary">
        <div className="summary-card">
          <div className="summary-value">{countOrdersByStatus('pending')}</div>
          <div className="summary-label">รอรับออเดอร์</div>
        </div>
        
        <div className="summary-card">
          <div className="summary-value">{countOrdersByStatus('accepted')}</div>
          <div className="summary-label">กำลังปรุงอาหาร</div>
        </div>
        
        <div className="summary-card">
          <div className="summary-value">{countOrdersByStatus('ready')}</div>
          <div className="summary-label">รอเสิร์ฟ</div>
        </div>
        
        <div className="summary-card">
          <div className="summary-value">{countOrdersByStatus('completed')}</div>
          <div className="summary-label">เสร็จสิ้นวันนี้</div>
        </div>
      </div>
      
      <div className="dashboard-tabs">
        <button 
          className={activeTab === 'pending' ? 'active' : ''}
          onClick={() => setActiveTab('pending')}
        >
          รอรับออเดอร์ ({countOrdersByStatus('pending')})
        </button>
        
        <button 
          className={activeTab === 'accepted' ? 'active' : ''}
          onClick={() => setActiveTab('accepted')}
        >
          กำลังปรุงอาหาร ({countOrdersByStatus('accepted')})
        </button>
        
        <button 
          className={activeTab === 'ready' ? 'active' : ''}
          onClick={() => setActiveTab('ready')}
        >
          รอเสิร์ฟ ({countOrdersByStatus('ready')})
        </button>
        
        <button 
          className={activeTab === 'completed' ? 'active' : ''}
          onClick={() => setActiveTab('completed')}
        >
          เสร็จสิ้น ({countOrdersByStatus('completed')})
        </button>
        
        <button 
          className={activeTab === 'cancelled' ? 'active' : ''}
          onClick={() => setActiveTab('cancelled')}
        >
          ยกเลิก ({countOrdersByStatus('cancelled')})
        </button>
      </div>
      
      <div className="orders-container">
        {filteredOrders.length === 0 ? (
          <div className="no-orders">ไม่มีออเดอร์ในสถานะนี้</div>
        ) : (
          filteredOrders.map(order => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <div className="order-id">ออเดอร์ #{order.id}</div>
                <div className="order-time">เวลา: {formatTime(order.createdAt)}</div>
                <div className={`order-status ${getStatusClass(order.status)}`}>
                  {getStatusText(order.status)}
                </div>
              </div>
              
              <div className="order-details">
                <div className="customer-details">
                  <div><strong>โต๊ะ:</strong> {order.tableNumber}</div>
                  <div><strong>ชื่อ:</strong> {order.customerName}</div>
                  {order.note && <div><strong>หมายเหตุ:</strong> {order.note}</div>}
                </div>
                
                <div className="order-items-list">
                  <h3>รายการอาหาร</h3>
                  <ul>
                    {order.items.map((item, index) => (
                      <li key={index}>
                        <span className="item-name">{item.name}</span>
                        <span className="item-quantity">x{item.quantity}</span>
                        <span className="item-price">{item.price * item.quantity} บาท</span>
                      </li>
                    ))}
                  </ul>
                  <div className="order-total">
                    <strong>รวม:</strong> {order.total} บาท
                  </div>
                </div>
              </div>
              
              <div className="order-actions">
                {renderActionButtons(order)}
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="dashboard-footer">
        <Link to="/admin" className="manage-menu-link">จัดการเมนูอาหาร</Link>
        <Link to="/" className="back-link">กลับไปหน้าหลัก</Link>
      </div>
    </div>
  );
}

export default RestaurantDashboard;