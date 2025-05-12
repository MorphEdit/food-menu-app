import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/PromotionManagement.css';

function PromotionManagement() {
  const [promotions, setPromotions] = useState([]);
  const [newPromotion, setNewPromotion] = useState({
    name: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    startDate: '',
    endDate: '',
    minOrderValue: '',
    isActive: true,
    code: '',
    limitUsage: false,
    maxUsage: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [editPromotion, setEditPromotion] = useState({});
  const { currentUser, isAdmin } = useAuth();
  
  useEffect(() => {
    // โหลดข้อมูลโปรโมชันจาก localStorage
    const savedPromotions = localStorage.getItem('promotions');
    if (savedPromotions) {
      setPromotions(JSON.parse(savedPromotions));
    } else {
      // ข้อมูลโปรโมชันตัวอย่าง
      const samplePromotions = [
        {
          id: 1,
          name: 'ส่วนลด 10%',
          description: 'ส่วนลด 10% สำหรับการสั่งซื้อขั้นต่ำ 300 บาท',
          discountType: 'percentage',
          discountValue: 10,
          startDate: '2023-05-01',
          endDate: '2023-12-31',
          minOrderValue: 300,
          isActive: true,
          code: 'SAVE10',
          limitUsage: true,
          maxUsage: 100,
          usageCount: 0
        },
        {
          id: 2,
          name: 'ลด 50 บาท',
          description: 'ลด 50 บาท สำหรับการสั่งซื้อขั้นต่ำ 500 บาท',
          discountType: 'fixed',
          discountValue: 50,
          startDate: '2023-05-01',
          endDate: '2023-12-31',
          minOrderValue: 500,
          isActive: true,
          code: 'FLAT50',
          limitUsage: false,
          maxUsage: null,
          usageCount: 0
        }
      ];
      setPromotions(samplePromotions);
      localStorage.setItem('promotions', JSON.stringify(samplePromotions));
    }
  }, []);
  
  // ตรวจสอบสิทธิ์การเข้าถึง - เฉพาะ admin เท่านั้น
  if (!currentUser || !isAdmin) {
    return (
      <div className="promotion-management-page">
        <div className="auth-required">
          <h2>ไม่มีสิทธิ์เข้าถึง</h2>
          <p>คุณจำเป็นต้องเข้าสู่ระบบด้วยบัญชีผู้ดูแลระบบเพื่อเข้าถึงหน้านี้</p>
          <Link to="/login" className="login-button">เข้าสู่ระบบ</Link>
        </div>
      </div>
    );
  }
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setNewPromotion({ ...newPromotion, [name]: checked });
    } else if (name === 'discountValue' || name === 'minOrderValue' || name === 'maxUsage') {
      setNewPromotion({ ...newPromotion, [name]: value === '' ? '' : Number(value) });
    } else {
      setNewPromotion({ ...newPromotion, [name]: value });
    }
  };
  
  const handleEditInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setEditPromotion({ ...editPromotion, [name]: checked });
    } else if (name === 'discountValue' || name === 'minOrderValue' || name === 'maxUsage') {
      setEditPromotion({ ...editPromotion, [name]: value === '' ? '' : Number(value) });
    } else {
      setEditPromotion({ ...editPromotion, [name]: value });
    }
  };
  
  const handleAddPromotion = (e) => {
    e.preventDefault();
    
    // ตรวจสอบว่ากรอกข้อมูลครบถ้วนหรือไม่
    if (!newPromotion.name || !newPromotion.discountValue || !newPromotion.startDate || !newPromotion.endDate) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }
    
    // ตรวจสอบว่ารหัสโปรโมชันซ้ำหรือไม่
    if (newPromotion.code && promotions.some(promo => promo.code === newPromotion.code)) {
      alert('รหัสโปรโมชันนี้ถูกใช้แล้ว');
      return;
    }
    
    const id = promotions.length > 0 ? Math.max(...promotions.map(promo => promo.id)) + 1 : 1;
    const newPromo = {
      ...newPromotion,
      id,
      usageCount: 0,
      createdAt: new Date().toISOString()
    };
    
    const updatedPromotions = [...promotions, newPromo];
    localStorage.setItem('promotions', JSON.stringify(updatedPromotions));
    setPromotions(updatedPromotions);
    setEditingId(null);
  };
  
  const handleDeletePromotion = (id) => {
    if (window.confirm('คุณแน่ใจหรือไม่ที่จะลบโปรโมชันนี้?')) {
      const updatedPromotions = promotions.filter(promo => promo.id !== id);
      localStorage.setItem('promotions', JSON.stringify(updatedPromotions));
      setPromotions(updatedPromotions);
    }
  };
  
  const handleToggleActive = (id) => {
    const updatedPromotions = promotions.map(promo => {
      if (promo.id === id) {
        return { ...promo, isActive: !promo.isActive };
      }
      return promo;
    });
    
    localStorage.setItem('promotions', JSON.stringify(updatedPromotions));
    setPromotions(updatedPromotions);
  };
  
  // ตรวจสอบว่าโปรโมชันหมดอายุหรือไม่
  const isExpired = (endDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiryDate = new Date(endDate);
    return expiryDate < today;
  };
  
  // จัดรูปแบบวันที่เป็นภาษาไทย
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('th-TH', options);
  };
  
  return (
    <div className="promotion-management-page">
      <h1>จัดการโปรโมชัน</h1>
      
      <div className="promotions-container">
        <div className="promotion-form-wrapper">
          <form onSubmit={handleAddPromotion} className="promotion-form">
            <h2>เพิ่มโปรโมชันใหม่</h2>
            
            <div className="form-group">
              <label htmlFor="name">ชื่อโปรโมชัน</label>
              <input
                id="name"
                type="text"
                name="name"
                value={newPromotion.name}
                onChange={handleInputChange}
                placeholder="เช่น ส่วนลด 10%, ฟรีค่าจัดส่ง"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="description">รายละเอียด</label>
              <textarea
                id="description"
                name="description"
                value={newPromotion.description}
                onChange={handleInputChange}
                placeholder="รายละเอียดเพิ่มเติมของโปรโมชัน"
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="discountType">ประเภทส่วนลด</label>
                <select
                  id="discountType"
                  name="discountType"
                  value={newPromotion.discountType}
                  onChange={handleInputChange}
                >
                  <option value="percentage">เปอร์เซ็นต์ (%)</option>
                  <option value="fixed">จำนวนเงิน (บาท)</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="discountValue">มูลค่าส่วนลด</label>
                <input
                  id="discountValue"
                  type="number"
                  name="discountValue"
                  value={newPromotion.discountValue}
                  onChange={handleInputChange}
                  placeholder={newPromotion.discountType === 'percentage' ? 'เช่น 10' : 'เช่น 50'}
                  min="0"
                  required
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="startDate">วันที่เริ่มต้น</label>
                <input
                  id="startDate"
                  type="date"
                  name="startDate"
                  value={newPromotion.startDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="endDate">วันที่สิ้นสุด</label>
                <input
                  id="endDate"
                  type="date"
                  name="endDate"
                  value={newPromotion.endDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="minOrderValue">ยอดสั่งซื้อขั้นต่ำ (บาท)</label>
              <input
                id="minOrderValue"
                type="number"
                name="minOrderValue"
                value={newPromotion.minOrderValue}
                onChange={handleInputChange}
                placeholder="เช่น 300 (ปล่อยว่างถ้าไม่มีขั้นต่ำ)"
                min="0"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="code">รหัสโปรโมชัน</label>
              <input
                id="code"
                type="text"
                name="code"
                value={newPromotion.code}
                onChange={handleInputChange}
                placeholder="เช่น SUMMER10 (ปล่อยว่างถ้าไม่ต้องใช้รหัส)"
              />
            </div>
            
            <div className="form-checkbox">
              <input
                id="isActive"
                type="checkbox"
                name="isActive"
                checked={newPromotion.isActive}
                onChange={handleInputChange}
              />
              <label htmlFor="isActive">เปิดใช้งาน</label>
            </div>
            
            <div className="form-checkbox">
              <input
                id="limitUsage"
                type="checkbox"
                name="limitUsage"
                checked={newPromotion.limitUsage}
                onChange={handleInputChange}
              />
              <label htmlFor="limitUsage">จำกัดจำนวนการใช้งาน</label>
            </div>
            
            {newPromotion.limitUsage && (
              <div className="form-group">
                <label htmlFor="maxUsage">จำนวนการใช้งานสูงสุด</label>
                <input
                  id="maxUsage"
                  type="number"
                  name="maxUsage"
                  value={newPromotion.maxUsage}
                  onChange={handleInputChange}
                  placeholder="เช่น 100"
                  min="1"
                  required={newPromotion.limitUsage}
                />
              </div>
            )}
            
            <button type="submit" className="promotion-submit-btn">เพิ่มโปรโมชัน</button>
          </form>
        </div>
        
        <div className="promotions-list">
          <h2>รายการโปรโมชันทั้งหมด</h2>
          
          {promotions.length === 0 ? (
            <div className="no-promotions">
              <p>ยังไม่มีโปรโมชัน กรุณาเพิ่มโปรโมชันใหม่</p>
            </div>
          ) : (
            <div className="promotion-cards">
              {promotions.map(promotion => (
                <div 
                  key={promotion.id} 
                  className={`promotion-card ${
                    !promotion.isActive ? 'inactive' : 
                    isExpired(promotion.endDate) ? 'expired' : ''
                  }`}
                >
                  {editingId === promotion.id ? (
                    // แสดงฟอร์มแก้ไข
                    <div className="edit-promotion-form">
                      <div className="form-group">
                        <label htmlFor={`edit-name-${promotion.id}`}>ชื่อโปรโมชัน</label>
                        <input
                          id={`edit-name-${promotion.id}`}
                          type="text"
                          name="name"
                          value={editPromotion.name}
                          onChange={handleEditInputChange}
                          required
                        />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor={`edit-description-${promotion.id}`}>รายละเอียด</label>
                        <textarea
                          id={`edit-description-${promotion.id}`}
                          name="description"
                          value={editPromotion.description}
                          onChange={handleEditInputChange}
                        />
                      </div>
                      
                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor={`edit-discountType-${promotion.id}`}>ประเภทส่วนลด</label>
                          <select
                            id={`edit-discountType-${promotion.id}`}
                            name="discountType"
                            value={editPromotion.discountType}
                            onChange={handleEditInputChange}
                          >
                            <option value="percentage">เปอร์เซ็นต์ (%)</option>
                            <option value="fixed">จำนวนเงิน (บาท)</option>
                          </select>
                        </div>
                        
                        <div className="form-group">
                          <label htmlFor={`edit-discountValue-${promotion.id}`}>มูลค่าส่วนลด</label>
                          <input
                            id={`edit-discountValue-${promotion.id}`}
                            type="number"
                            name="discountValue"
                            value={editPromotion.discountValue}
                            onChange={handleEditInputChange}
                            min="0"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor={`edit-startDate-${promotion.id}`}>วันที่เริ่มต้น</label>
                          <input
                            id={`edit-startDate-${promotion.id}`}
                            type="date"
                            name="startDate"
                            value={editPromotion.startDate}
                            onChange={handleEditInputChange}
                            required
                          />
                        </div>
                        
                        <div className="form-group">
                          <label htmlFor={`edit-endDate-${promotion.id}`}>วันที่สิ้นสุด</label>
                          <input
                            id={`edit-endDate-${promotion.id}`}
                            type="date"
                            name="endDate"
                            value={editPromotion.endDate}
                            onChange={handleEditInputChange}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor={`edit-minOrderValue-${promotion.id}`}>ยอดสั่งซื้อขั้นต่ำ (บาท)</label>
                        <input
                          id={`edit-minOrderValue-${promotion.id}`}
                          type="number"
                          name="minOrderValue"
                          value={editPromotion.minOrderValue}
                          onChange={handleEditInputChange}
                          min="0"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor={`edit-code-${promotion.id}`}>รหัสโปรโมชัน</label>
                        <input
                          id={`edit-code-${promotion.id}`}
                          type="text"
                          name="code"
                          value={editPromotion.code}
                          onChange={handleEditInputChange}
                        />
                      </div>
                      
                      <div className="form-checkbox">
                        <input
                          id={`edit-isActive-${promotion.id}`}
                          type="checkbox"
                          name="isActive"
                          checked={editPromotion.isActive}
                          onChange={handleEditInputChange}
                        />
                        <label htmlFor={`edit-isActive-${promotion.id}`}>เปิดใช้งาน</label>
                      </div>
                      
                      <div className="form-checkbox">
                        <input
                          id={`edit-limitUsage-${promotion.id}`}
                          type="checkbox"
                          name="limitUsage"
                          checked={editPromotion.limitUsage}
                          onChange={handleEditInputChange}
                        />
                        <label htmlFor={`edit-limitUsage-${promotion.id}`}>จำกัดจำนวนการใช้งาน</label>
                      </div>
                      
                      {editPromotion.limitUsage && (
                        <div className="form-group">
                          <label htmlFor={`edit-maxUsage-${promotion.id}`}>จำนวนการใช้งานสูงสุด</label>
                          <input
                            id={`edit-maxUsage-${promotion.id}`}
                            type="number"
                            name="maxUsage"
                            value={editPromotion.maxUsage}
                            onChange={handleEditInputChange}
                            min="1"
                            required={editPromotion.limitUsage}
                          />
                        </div>
                      )}
                      
                      <div className="edit-actions">
                        <button onClick={handleSaveEdit} className="save-btn">บันทึก</button>
                        <button onClick={handleCancelEdit} className="cancel-btn">ยกเลิก</button>
                      </div>
                    </div>
                  ) : (
                    // แสดงข้อมูลโปรโมชัน
                    <>
                      <div className="promotion-header">
                        <h3>{promotion.name}</h3>
                        <div className="promotion-status">
                          {!promotion.isActive ? (
                            <span className="status-inactive">ปิดใช้งาน</span>
                          ) : isExpired(promotion.endDate) ? (
                            <span className="status-expired">หมดอายุ</span>
                          ) : (
                            <span className="status-active">ใช้งานได้</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="promotion-details">
                        <p className="promotion-description">{promotion.description}</p>
                        
                        <div className="promotion-info">
                          <p>
                            <strong>ส่วนลด:</strong> {
                              promotion.discountType === 'percentage' ? 
                              `${promotion.discountValue}%` : 
                              `${promotion.discountValue} บาท`
                            }
                          </p>
                          
                          <p>
                            <strong>ระยะเวลา:</strong> {formatDate(promotion.startDate)} - {formatDate(promotion.endDate)}
                          </p>
                          
                          {promotion.minOrderValue > 0 && (
                            <p>
                              <strong>ยอดสั่งซื้อขั้นต่ำ:</strong> {promotion.minOrderValue} บาท
                            </p>
                          )}
                          
                          {promotion.code && (
                            <p>
                              <strong>รหัสโปรโมชัน:</strong> <span className="promotion-code">{promotion.code}</span>
                            </p>
                          )}
                          
                          {promotion.limitUsage && (
                            <p>
                              <strong>การใช้งาน:</strong> {promotion.usageCount} / {promotion.maxUsage}
                            </p>
                          )}
                        </div>
                        
                        <div className="promotion-actions">
                          <button onClick={() => handleStartEdit(promotion)} className="edit-btn">แก้ไข</button>
                          <button 
                            onClick={() => handleToggleActive(promotion.id)} 
                            className={promotion.isActive ? "deactivate-btn" : "activate-btn"}
                          >
                            {promotion.isActive ? "ปิดใช้งาน" : "เปิดใช้งาน"}
                          </button>
                          <button onClick={() => handleDeletePromotion(promotion.id)} className="delete-btn">ลบ</button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="promotion-management-footer">
        <Link to="/admin" className="back-link">กลับไปหน้าจัดการเมนู</Link>
      </div>
    </div>
  );
}

export default PromotionManagement;