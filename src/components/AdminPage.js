import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/AdminPage.css';

function AdminPage() {
  const [menuItems, setMenuItems] = useState([]);
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    price: '',
    category: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [editItem, setEditItem] = useState({
    name: '',
    description: '',
    price: '',
    category: ''
  });
  
  useEffect(() => {
    // โหลดข้อมูลจาก localStorage
    const savedItems = localStorage.getItem('menuItems');
    if (savedItems) {
      setMenuItems(JSON.parse(savedItems));
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
      localStorage.setItem('menuItems', JSON.stringify(sampleItems));
    }
  }, []);
  
  const saveMenuItems = (items) => {
    localStorage.setItem('menuItems', JSON.stringify(items));
    setMenuItems(items);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewItem({ ...newItem, [name]: value });
  };
  
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditItem({ ...editItem, [name]: value });
  };
  
  const handleAddItem = (e) => {
    e.preventDefault();
    const _id = menuItems.length > 0 ? Math.max(...menuItems.map(item => item._id)) + 1 : 1;
    const updatedItems = [...menuItems, { _id, ...newItem, price: Number(newItem.price) }];
    saveMenuItems(updatedItems);
    setNewItem({ name: '', description: '', price: '', category: '' });
  };
  
  const handleStartEdit = (item) => {
    setEditingId(item._id);
    setEditItem({ ...item });
  };
  
  const handleCancelEdit = () => {
    setEditingId(null);
  };
  
  const handleSaveEdit = () => {
    const updatedItems = menuItems.map(item => 
      item._id === editingId ? { ...editItem, price: Number(editItem.price) } : item
    );
    saveMenuItems(updatedItems);
    setEditingId(null);
  };
  
  const handleDeleteItem = (id) => {
    if (window.confirm('คุณแน่ใจหรือไม่ที่จะลบรายการนี้?')) {
      const updatedItems = menuItems.filter(item => item._id !== id);
      saveMenuItems(updatedItems);
    }
  };
  
  return (
    <div className="admin-page">
      <h1>จัดการเมนูอาหาร</h1>
      
      <form onSubmit={handleAddItem} className="menu-form">
        <h2>เพิ่มเมนูใหม่</h2>
        <div className="form-group">
          <label htmlFor="name">ชื่อเมนู</label>
          <input 
            id="name"
            type="text" 
            name="name" 
            value={newItem.name} 
            onChange={handleInputChange} 
            required 
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">รายละเอียด</label>
          <textarea 
            id="description"
            name="description" 
            value={newItem.description} 
            onChange={handleInputChange} 
            required 
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="price">ราคา (บาท)</label>
          <input 
            id="price"
            type="number" 
            name="price" 
            value={newItem.price} 
            onChange={handleInputChange} 
            required 
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="category">หมวดหมู่</label>
          <input 
            id="category"
            type="text" 
            name="category" 
            value={newItem.category} 
            onChange={handleInputChange} 
            required 
          />
        </div>
        
        <button type="submit" className="submit-btn">เพิ่มเมนู</button>
      </form>
      
      <div className="menu-list">
        <h2>รายการเมนูทั้งหมด</h2>
        <table>
          <thead>
            <tr>
              <th>ชื่อ</th>
              <th>รายละเอียด</th>
              <th>ราคา</th>
              <th>หมวดหมู่</th>
              <th>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {menuItems.map(item => (
              <tr key={item._id}>
                {editingId === item._id ? (
                  // แสดงฟอร์มแก้ไข
                  <>
                    <td>
                      <input 
                        type="text" 
                        name="name" 
                        value={editItem.name} 
                        onChange={handleEditInputChange} 
                        required 
                      />
                    </td>
                    <td>
                      <textarea 
                        name="description" 
                        value={editItem.description} 
                        onChange={handleEditInputChange} 
                        required 
                      />
                    </td>
                    <td>
                      <input 
                        type="number" 
                        name="price" 
                        value={editItem.price} 
                        onChange={handleEditInputChange} 
                        required 
                      />
                    </td>
                    <td>
                      <input 
                        type="text" 
                        name="category" 
                        value={editItem.category} 
                        onChange={handleEditInputChange} 
                        required 
                      />
                    </td>
                    <td className="action-buttons">
                      <button onClick={handleSaveEdit} className="save-btn">บันทึก</button>
                      <button onClick={handleCancelEdit} className="cancel-btn">ยกเลิก</button>
                    </td>
                  </>
                ) : (
                  // แสดงข้อมูลปกติ
                  <>
                    <td>{item.name}</td>
                    <td>{item.description}</td>
                    <td>{item.price} บาท</td>
                    <td>{item.category}</td>
                    <td className="action-buttons">
                      <button 
                        onClick={() => handleStartEdit(item)} 
                        className="edit-btn"
                      >
                        แก้ไข
                      </button>
                      <button 
                        onClick={() => handleDeleteItem(item._id)} 
                        className="delete-btn"
                      >
                        ลบ
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <Link to="/" className="back-link">กลับไปหน้าหลัก</Link>
    </div>
  );
}

export default AdminPage;