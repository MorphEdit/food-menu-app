import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/MenuItemForm.css';

function MenuItemForm() {
  const [item, setItem] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: null
  });
  const [imagePreview, setImagePreview] = useState('');
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, isAdmin, isStaff } = useAuth();
  const isEdit = !!id;
  
  // เมื่อโหลดหน้า ให้ดึงข้อมูลหมวดหมู่และข้อมูลเมนู (กรณีแก้ไข)
  useEffect(() => {
    // ดึงข้อมูลหมวดหมู่
    const menuItems = JSON.parse(localStorage.getItem('menuItems') || '[]');
    const uniqueCategories = [...new Set(menuItems.map(item => item.category))];
    setCategories(uniqueCategories);
    
    // กรณีแก้ไข ดึงข้อมูลเมนูที่ต้องการแก้ไข
    if (isEdit) {
      const foundItem = menuItems.find(item => item._id === parseInt(id));
      if (foundItem) {
        setItem(foundItem);
        if (foundItem.imageUrl) {
          setImagePreview(foundItem.imageUrl);
        }
      } else {
        setError('ไม่พบข้อมูลเมนูที่ต้องการแก้ไข');
      }
    }
  }, [id, isEdit]);
  
  // ตรวจสอบสิทธิ์การเข้าถึง
  if (!currentUser || (!isAdmin && !isStaff)) {
    return (
      <div className="menu-form-page">
        <div className="auth-required">
          <h2>ไม่มีสิทธิ์เข้าถึง</h2>
          <p>คุณจำเป็นต้องเข้าสู่ระบบด้วยบัญชีผู้ดูแลระบบหรือพนักงานเพื่อเข้าถึงหน้านี้</p>
          <Link to="/login" className="login-button">เข้าสู่ระบบ</Link>
        </div>
      </div>
    );
  }
  
  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    
    if (type === 'file') {
      const file = e.target.files[0];
      if (file) {
        setItem({ ...item, image: file });
        
        // สร้างตัวอย่างรูปภาพ
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
      }
    } else {
      setItem({ ...item, [name]: name === 'price' ? Number(value) : value });
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!item.name || !item.description || !item.price || !item.category) {
      setError('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }
    
    setLoading(true);
    
    try {
      // ดึงข้อมูลเมนูทั้งหมด
      const menuItems = JSON.parse(localStorage.getItem('menuItems') || '[]');
      
      // เก็บไฟล์รูปภาพเป็น data URL
      // หมายเหตุ: ในระบบจริงควรอัพโหลดไฟล์ไปยังเซิร์ฟเวอร์/คลาวด์สตอเรจ
      let imageUrl = item.imageUrl || null;
      
      if (item.image) {
        const reader = new FileReader();
        reader.readAsDataURL(item.image);
        
        reader.onloadend = () => {
          imageUrl = reader.result;
          saveItemWithImage(menuItems, imageUrl);
        };
      } else {
        saveItemWithImage(menuItems, imageUrl);
      }
    } catch (error) {
      setError('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      setLoading(false);
    }
  };
  
  const saveItemWithImage = (menuItems, imageUrl) => {
    // กรณีแก้ไข
    if (isEdit) {
      const updatedItems = menuItems.map(menuItem => {
        if (menuItem._id === parseInt(id)) {
          return {
            ...item,
            imageUrl,
            price: Number(item.price)
          };
        }
        return menuItem;
      });
      
      localStorage.setItem('menuItems', JSON.stringify(updatedItems));
    } 
    // กรณีเพิ่มใหม่
    else {
      const newId = menuItems.length > 0 ? Math.max(...menuItems.map(item => item._id)) + 1 : 1;
      const newItem = {
        ...item,
        _id: newId,
        imageUrl,
        price: Number(item.price)
      };
      
      const updatedItems = [...menuItems, newItem];
      localStorage.setItem('menuItems', JSON.stringify(updatedItems));
    }
    
    // กลับไปยังหน้าจัดการเมนู
    navigate('/admin');
  };
  
  return (
    <div className="menu-form-page">
      <h1>{isEdit ? 'แก้ไขเมนูอาหาร' : 'เพิ่มเมนูอาหารใหม่'}</h1>
      
      {error && <div className="form-error">{error}</div>}
      
      <div className="menu-form-container">
        <form onSubmit={handleSubmit} className="menu-form">
          <div className="form-group">
            <label htmlFor="name">ชื่อเมนู</label>
            <input
              id="name"
              type="text"
              name="name"
              value={item.name}
              onChange={handleInputChange}
              placeholder="กรอกชื่อเมนูอาหาร"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description">รายละเอียด</label>
            <textarea
              id="description"
              name="description"
              value={item.description}
              onChange={handleInputChange}
              placeholder="กรอกรายละเอียดของเมนูอาหาร"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="price">ราคา (บาท)</label>
            <input
              id="price"
              type="number"
              name="price"
              value={item.price}
              onChange={handleInputChange}
              placeholder="กรอกราคา"
              min="0"
              step="0.01"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="category">หมวดหมู่</label>
            <div className="category-input">
              <select
                id="category"
                name="category"
                value={item.category}
                onChange={handleInputChange}
                required
              >
                <option value="">เลือกหมวดหมู่</option>
                {categories.map((category, index) => (
                  <option key={index} value={category}>{category}</option>
                ))}
              </select>
              
              <input
                type="text"
                name="category"
                value={item.category}
                onChange={handleInputChange}
                placeholder="หรือพิมพ์หมวดหมู่ใหม่"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="image">รูปภาพเมนู</label>
            <input
              id="image"
              type="file"
              name="image"
              onChange={handleInputChange}
              accept="image/*"
            />
            <p className="form-help">แนะนำขนาดรูปภาพ 800x600 พิกเซล รูปแบบไฟล์ JPG, PNG (ไม่เกิน 2MB)</p>
          </div>
          
          {imagePreview && (
            <div className="image-preview">
              <h3>ตัวอย่างรูปภาพ</h3>
              <img src={imagePreview} alt="ตัวอย่างรูปภาพ" />
            </div>
          )}
          
          <div className="form-actions">
            <button
              type="submit"
              className="submit-button"
              disabled={loading}
            >
              {loading ? 'กำลังบันทึก...' : isEdit ? 'บันทึกการแก้ไข' : 'เพิ่มเมนู'}
            </button>
            
            <Link to="/admin" className="cancel-button">ยกเลิก</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MenuItemForm;