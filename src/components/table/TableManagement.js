import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/TableManagement.css';

function TableManagement() {
  const [tables, setTables] = useState([]);
  const [newTable, setNewTable] = useState({ name: '', capacity: 2, status: 'available' });
  const [editingId, setEditingId] = useState(null);
  const [editTable, setEditTable] = useState({ name: '', capacity: 2, status: 'available' });
  const { currentUser } = useAuth();
  
  // โหลดข้อมูลโต๊ะจาก localStorage
  useEffect(() => {
    const savedTables = localStorage.getItem('restaurantTables');
    if (savedTables) {
      setTables(JSON.parse(savedTables));
    } else {
      // ข้อมูลโต๊ะตัวอย่าง
      const sampleTables = [
        { id: 1, name: 'โต๊ะ 1', capacity: 2, status: 'available', qrCode: generateQRCodeUrl(1) },
        { id: 2, name: 'โต๊ะ 2', capacity: 4, status: 'available', qrCode: generateQRCodeUrl(2) },
        { id: 3, name: 'โต๊ะ 3', capacity: 6, status: 'occupied', qrCode: generateQRCodeUrl(3) },
        { id: 4, name: 'โต๊ะ 4', capacity: 4, status: 'reserved', qrCode: generateQRCodeUrl(4) },
        { id: 5, name: 'โต๊ะ VIP', capacity: 8, status: 'available', qrCode: generateQRCodeUrl(5) },
      ];
      setTables(sampleTables);
      localStorage.setItem('restaurantTables', JSON.stringify(sampleTables));
    }
  }, []);
  
  // สร้าง URL สำหรับ QR Code
  function generateQRCodeUrl(tableId) {
    return `${window.location.origin}?table=${tableId}`;
  }
  
  // บันทึกข้อมูลโต๊ะลง localStorage
  const saveTables = (updatedTables) => {
    localStorage.setItem('restaurantTables', JSON.stringify(updatedTables));
    setTables(updatedTables);
  };
  
  // เพิ่มโต๊ะใหม่
  const handleAddTable = (e) => {
    e.preventDefault();
    
    const id = tables.length > 0 ? Math.max(...tables.map(table => table.id)) + 1 : 1;
    const tableWithQR = { 
      ...newTable, 
      id, 
      qrCode: generateQRCodeUrl(id) 
    };
    
    const updatedTables = [...tables, tableWithQR];
    saveTables(updatedTables);
    setNewTable({ name: '', capacity: 2, status: 'available' });
  };
  
  // เริ่มการแก้ไขโต๊ะ
  const handleStartEdit = (table) => {
    setEditingId(table.id);
    setEditTable({ ...table });
  };
  
  // ยกเลิกการแก้ไข
  const handleCancelEdit = () => {
    setEditingId(null);
  };
  
  // บันทึกการแก้ไข
  const handleSaveEdit = () => {
    const updatedTables = tables.map(table => 
      table.id === editingId ? 
        { ...editTable, qrCode: generateQRCodeUrl(editTable.id) } : 
        table
    );
    saveTables(updatedTables);
    setEditingId(null);
  };
  
  // ลบโต๊ะ
  const handleDeleteTable = (id) => {
    if (window.confirm('คุณแน่ใจหรือไม่ที่จะลบโต๊ะนี้?')) {
      const updatedTables = tables.filter(table => table.id !== id);
      saveTables(updatedTables);
    }
  };
  
  // อัพเดทข้อมูลการแก้ไข
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditTable({ ...editTable, [name]: name === 'capacity' ? Number(value) : value });
  };
  
  // อัพเดทข้อมูลโต๊ะใหม่
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTable({ ...newTable, [name]: name === 'capacity' ? Number(value) : value });
  };
  
  // แปลงสถานะเป็นภาษาไทย
  const getStatusText = (status) => {
    switch (status) {
      case 'available':
        return 'ว่าง';
      case 'occupied':
        return 'มีลูกค้า';
      case 'reserved':
        return 'จอง';
      case 'dirty':
        return 'รอทำความสะอาด';
      default:
        return status;
    }
  };
  
  // แปลงสถานะเป็นคลาส CSS
  const getStatusClass = (status) => {
    switch (status) {
      case 'available':
        return 'status-available';
      case 'occupied':
        return 'status-occupied';
      case 'reserved':
        return 'status-reserved';
      case 'dirty':
        return 'status-dirty';
      default:
        return '';
    }
  };
  
  // หากยังไม่ได้ล็อกอิน ให้แสดงข้อความให้ล็อกอินก่อน
  if (!currentUser) {
    return (
      <div className="table-management-page">
        <div className="auth-required">
          <h2>โปรดเข้าสู่ระบบก่อนใช้งาน</h2>
          <p>คุณจำเป็นต้องเข้าสู่ระบบเพื่อจัดการโต๊ะอาหาร</p>
          <Link to="/login" className="login-button">เข้าสู่ระบบ</Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="table-management-page">
      <h1>จัดการโต๊ะอาหาร</h1>
      
      <div className="tables-container">
        <div className="table-form-wrapper">
          <form onSubmit={handleAddTable} className="table-form">
            <h2>เพิ่มโต๊ะใหม่</h2>
            
            <div className="form-group">
              <label htmlFor="capacity">จำนวนที่นั่ง</label>
              <input
                id="capacity"
                type="number"
                name="capacity"
                min="1"
                max="20"
                value={newTable.capacity}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="status">สถานะ</label>
              <select
                id="status"
                name="status"
                value={newTable.status}
                onChange={handleInputChange}
              >
                <option value="available">ว่าง</option>
                <option value="occupied">มีลูกค้า</option>
                <option value="reserved">จอง</option>
                <option value="dirty">รอทำความสะอาด</option>
              </select>
            </div>
            
            <button type="submit" className="table-submit-btn">เพิ่มโต๊ะ</button>
          </form>
        </div>
        
        <div className="tables-grid">
          {tables.map(table => (
            <div key={table.id} className={`table-card ${getStatusClass(table.status)}`}>
              {editingId === table.id ? (
                // แสดงฟอร์มแก้ไข
                <div className="edit-table-form">
                  <div className="form-group">
                    <label htmlFor={`edit-name-${table.id}`}>ชื่อโต๊ะ</label>
                    <input
                      id={`edit-name-${table.id}`}
                      type="text"
                      name="name"
                      value={editTable.name}
                      onChange={handleEditInputChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor={`edit-capacity-${table.id}`}>จำนวนที่นั่ง</label>
                    <input
                      id={`edit-capacity-${table.id}`}
                      type="number"
                      name="capacity"
                      min="1"
                      max="20"
                      value={editTable.capacity}
                      onChange={handleEditInputChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor={`edit-status-${table.id}`}>สถานะ</label>
                    <select
                      id={`edit-status-${table.id}`}
                      name="status"
                      value={editTable.status}
                      onChange={handleEditInputChange}
                    >
                      <option value="available">ว่าง</option>
                      <option value="occupied">มีลูกค้า</option>
                      <option value="reserved">จอง</option>
                      <option value="dirty">รอทำความสะอาด</option>
                    </select>
                  </div>
                  
                  <div className="edit-actions">
                    <button onClick={handleSaveEdit} className="save-btn">บันทึก</button>
                    <button onClick={handleCancelEdit} className="cancel-btn">ยกเลิก</button>
                  </div>
                </div>
              ) : (
                // แสดงข้อมูลโต๊ะ
                <>
                  <h3 className="table-name">{table.name}</h3>
                  <div className="table-details">
                    <p><strong>จำนวนที่นั่ง:</strong> {table.capacity} ที่นั่ง</p>
                    <p><strong>สถานะ:</strong> <span className={`status-badge ${getStatusClass(table.status)}`}>{getStatusText(table.status)}</span></p>
                  </div>
                  
                  <div className="table-qr">
                    <p>สแกนเพื่อสั่งอาหาร</p>
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(table.qrCode)}`} 
                      alt={`QR Code สำหรับ ${table.name}`} 
                    />
                  </div>
                  
                  <div className="table-actions">
                    <button onClick={() => handleStartEdit(table)} className="edit-btn">แก้ไข</button>
                    <button onClick={() => handleDeleteTable(table.id)} className="delete-btn">ลบ</button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div className="table-management-footer">
        <Link to="/qrcode" className="qrcode-link">จัดการ QR Code</Link>
        <Link to="/" className="back-link">กลับไปหน้าหลัก</Link>
      </div>
    </div>
  );
}

export default TableManagement;