import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/AdminPage.css';

function AdminPage() {
  const [menuItems, setMenuItems] = useState([]);
  const [filter, setFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categories, setCategories] = useState([]);
  const { currentUser, isAdmin, isStaff } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // โหลดข้อมูลจาก localStorage
    const savedItems = localStorage.getItem('menuItems');
    if (savedItems) {
      const parsedItems = JSON.parse(savedItems);
      setMenuItems(parsedItems);
      
      // ดึงค่าหมวดหมู่ที่ไม่ซ้ำกัน
      const uniqueCategories = [...new Set(parsedItems.map(item => item.category))];
      setCategories(uniqueCategories);
    } else {
      // ข้อมูลตัวอย่าง
      const sampleItems = [
        { _id: 1, name: 'ข้าวผัดกระเพรา', description: 'ข้าวผัดกระเพราหมูสับ ไข่ดาว', price: 60, category: 'อาหารจานเดียว' },
        { _id: 2, name: 'ผัดไทย', description: 'ผัดไทยกุ้งสด ใส่ไข่', price: 80, category: 'อาหารจานเดียว' },
        { _id: 3, name: 'ต้มยำกุ้ง', description: 'ต้มยำกุ้งน้ำข้น', price: 120, category: 'อาหารทานเล่น' },
        { _id: 4, name: 'ส้มตำไทย', description: 'ส้มตำไทยรสจัด', price: 60, category: 'อาหารทานเล่น' },
        { _id: 5, name: 'แกงเขียวหวาน', description: 'แกงเขียวหวานไก่', price: 80, category: 'แกงและซุป' },
        { _id: 6, name: 'ข้าวมันไก่', description: 'ข้าวมันไก่ต้ม พร้อมน้ำจิ้ม', price: 70, category: 'อาหารจานเดียว' },
      ];
      setMenuItems(sampleItems);
      
      // ดึงค่าหมวดหมู่ที่ไม่ซ้ำกัน
      const uniqueCategories = [...new Set(sampleItems.map(item => item.category))];
      setCategories(uniqueCategories);
      
      localStorage.setItem('menuItems', JSON.stringify(sampleItems));
    }
  }, []);
  
  // ตรวจสอบสิทธิ์การเข้าถึง
  if (!currentUser || (!isAdmin && !isStaff)) {
    return (
      <div className="admin-page">
        <div className="auth-required">
          <h2>ไม่มีสิทธิ์เข้าถึง</h2>
          <p>คุณจำเป็นต้องเข้าสู่ระบบด้วยบัญชีผู้ดูแลระบบหรือพนักงานเพื่อเข้าถึงหน้านี้</p>
          <Link to="/login" className="login-button">เข้าสู่ระบบ</Link>
        </div>
      </div>
    );
  }
  
  const handleDeleteItem = (id) => {
    if (window.confirm('คุณแน่ใจหรือไม่ที่จะลบรายการนี้?')) {
      const updatedItems = menuItems.filter(item => item._id !== id);
      localStorage.setItem('menuItems', JSON.stringify(updatedItems));
      setMenuItems(updatedItems);
    }
  };
  
  // กรองรายการเมนูตามการค้นหาและหมวดหมู่
  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(filter.toLowerCase()) ||
                        item.description.toLowerCase().includes(filter.toLowerCase());
    const matchesCategory = categoryFilter === '' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });
  
  return (
    <div className="admin-page">
      <h1>จัดการเมนูอาหาร</h1>
      
      <div className="admin-actions">
        <Link to="/menu/add" className="add-menu-btn">เพิ่มเมนูใหม่</Link>
        <Link to="/tables" className="manage-tables-btn">จัดการโต๊ะอาหาร</Link>
        <Link to="/promotions" className="manage-promo-btn">จัดการโปรโมชัน</Link>
      </div>
      
      <div className="admin-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="ค้นหาเมนูอาหาร..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
        
        <div className="category-filter">
          <select 
            value={categoryFilter} 
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">ทุกหมวดหมู่</option>
            {categories.map((category, index) => (
              <option key={index} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="menu-grid">
        {filteredItems.map(item => (
          <div key={item._id} className="admin-menu-item">
            <div className="menu-item-image">
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.name} />
              ) : (
                <div className="no-image">ไม่มีรูปภาพ</div>
              )}
            </div>
            
            <div className="menu-item-content">
              <h3>{item.name}</h3>
              <p className="item-description">{item.description}</p>
              <p className="item-price">{item.price} บาท</p>
              <p className="item-category">หมวดหมู่: {item.category}</p>
              
              <div className="item-actions">
                <Link to={`/menu/edit/${item._id}`} className="edit-btn">แก้ไข</Link>
                <button 
                  onClick={() => handleDeleteItem(item._id)} 
                  className="delete-btn"
                >
                  ลบ
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {filteredItems.length === 0 && (
        <div className="no-items">
          <p>ไม่พบรายการเมนูที่ตรงกับการค้นหา</p>
        </div>
      )}
      
      <div className="admin-footer">
        <Link to="/" className="back-link">กลับไปหน้าหลัก</Link>
      </div>
    </div>
  );
}

export default AdminPage;