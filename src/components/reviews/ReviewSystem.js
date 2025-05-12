import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/ReviewSystem.css';

function ReviewSystem() {
  const [menuItems, setMenuItems] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [filter, setFilter] = useState('all');
  const [newReview, setNewReview] = useState({
    menuItemId: '',
    rating: 5,
    comment: '',
    customerName: ''
  });
  const [selectedMenuItem, setSelectedMenuItem] = useState(null);
  const { currentUser } = useAuth();
  const { itemId } = useParams();
  const navigate = useNavigate();
  
  // โหลดข้อมูลเมนูและรีวิว
  useEffect(() => {
    // โหลดข้อมูลเมนู
    const savedMenuItems = JSON.parse(localStorage.getItem('menuItems') || '[]');
    setMenuItems(savedMenuItems);
    
    // โหลดข้อมูลรีวิว
    const savedReviews = JSON.parse(localStorage.getItem('reviews') || '[]');
    setReviews(savedReviews);
    
    // กรองรีวิวตามประเภท
    filterReviewsByCategory('all');
    
    // ถ้ามีการระบุ itemId ให้เลือกเมนูนั้น
    if (itemId) {
      const menuItem = savedMenuItems.find(item => item._id === parseInt(itemId));
      if (menuItem) {
        setSelectedMenuItem(menuItem);
        setNewReview(prev => ({ ...prev, menuItemId: menuItem._id }));
      }
    }
  }, [itemId]);
  
  // กรองรีวิวตามหมวดหมู่
  const filterReviewsByCategory = (category) => {
    setFilter(category);
    
    if (category === 'all') {
      setFilteredReviews(reviews);
    } else {
      const filteredItems = menuItems.filter(item => item.category === category);
      const itemIds = filteredItems.map(item => item._id);
      setFilteredReviews(reviews.filter(review => itemIds.includes(review.menuItemId)));
    }
  };
  
  // หาคะแนนเฉลี่ยของเมนู
  const getAverageRating = (menuItemId) => {
    const menuReviews = reviews.filter(review => review.menuItemId === menuItemId);
    if (menuReviews.length === 0) return 0;
    
    const sum = menuReviews.reduce((total, review) => total + review.rating, 0);
    return (sum / menuReviews.length).toFixed(1);
  };
  
  // หาชื่อเมนูจาก menuItemId
  const getMenuItemName = (menuItemId) => {
    const menuItem = menuItems.find(item => item._id === menuItemId);
    return menuItem ? menuItem.name : 'เมนูที่ถูกลบ';
  };
  
  // จัดรูปแบบวันที่
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('th-TH', options);
  };
  
  // ดึงหมวดหมู่ทั้งหมดที่ไม่ซ้ำกัน
  const getUniqueCategories = () => {
    return [...new Set(menuItems.map(item => item.category))];
  };
  
  // เปลี่ยนเมนูที่เลือก
  const handleMenuItemChange = (e) => {
    const menuItemId = parseInt(e.target.value);
    setNewReview({ ...newReview, menuItemId });
    
    if (menuItemId) {
      const menuItem = menuItems.find(item => item._id === menuItemId);
      setSelectedMenuItem(menuItem);
    } else {
      setSelectedMenuItem(null);
    }
  };
  
  // เปลี่ยนคะแนนรีวิว
  const handleRatingChange = (rating) => {
    setNewReview({ ...newReview, rating });
  };
  
  // เปลี่ยนข้อความรีวิว
  const handleCommentChange = (e) => {
    setNewReview({ ...newReview, comment: e.target.value });
  };
  
  // เปลี่ยนชื่อผู้รีวิว
  const handleNameChange = (e) => {
    setNewReview({ ...newReview, customerName: e.target.value });
  };
  
  // ส่งรีวิวใหม่
  const handleSubmitReview = (e) => {
    e.preventDefault();
    
    if (!newReview.menuItemId || !newReview.comment || !newReview.customerName) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }
    
    const review = {
      id: Date.now(),
      ...newReview,
      createdAt: new Date().toISOString(),
      isApproved: true // ในระบบจริงอาจต้องผ่านการอนุมัติก่อน
    };
    
    const updatedReviews = [review, ...reviews];
    localStorage.setItem('reviews', JSON.stringify(updatedReviews));
    setReviews(updatedReviews);
    filterReviewsByCategory(filter);
    
    // รีเซ็ตฟอร์ม
    setNewReview({
      menuItemId: '',
      rating: 5,
      comment: '',
      customerName: ''
    });
    
    setSelectedMenuItem(null);
    
    // แสดงข้อความขอบคุณและกลับไปหน้าเมนู
    alert('ขอบคุณสำหรับรีวิว!');
    
    // ถ้ามีการระบุ itemId ให้กลับไปหน้าเมนู
    if (itemId) {
      navigate('/');
    }
  };
  
  // ลบรีวิว (สำหรับผู้ดูแลระบบ)
  const handleDeleteReview = (reviewId) => {
    if (window.confirm('คุณแน่ใจหรือไม่ที่จะลบรีวิวนี้?')) {
      const updatedReviews = reviews.filter(review => review.id !== reviewId);
      localStorage.setItem('reviews', JSON.stringify(updatedReviews));
      setReviews(updatedReviews);
      filterReviewsByCategory(filter);
    }
  };
  
  // แสดงดาวตามคะแนน
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span 
          key={i} 
          className={`star ${i <= rating ? 'filled' : 'empty'}`}
          onClick={() => handleRatingChange(i)}
        >
          ★
        </span>
      );
    }
    return stars;
  };
  
  return (
    <div className="review-system-page">
      <h1>รีวิวเมนูอาหาร</h1>
      
      <div className="review-container">
        <div className="review-form-section">
          <form onSubmit={handleSubmitReview} className="review-form">
            <h2>{selectedMenuItem ? `รีวิว ${selectedMenuItem.name}` : 'เขียนรีวิวใหม่'}</h2>
            
            {!itemId && (
              <div className="form-group">
                <label htmlFor="menuItemId">เลือกเมนูที่ต้องการรีวิว</label>
                <select
                  id="menuItemId"
                  value={newReview.menuItemId}
                  onChange={handleMenuItemChange}
                  required
                >
                  <option value="">-- เลือกเมนู --</option>
                  {menuItems.map(item => (
                    <option key={item._id} value={item._id}>{item.name}</option>
                  ))}
                </select>
              </div>
            )}
            
            {(selectedMenuItem || itemId) && (
              <>
                {selectedMenuItem && selectedMenuItem.imageUrl && (
                  <div className="menu-image">
                    <img src={selectedMenuItem.imageUrl} alt={selectedMenuItem.name} />
                  </div>
                )}
                
                <div className="form-group">
                  <label>ให้คะแนน</label>
                  <div className="rating-select">
                    {renderStars(newReview.rating)}
                    <span className="rating-text">{newReview.rating}/5</span>
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="comment">ความคิดเห็น</label>
                  <textarea
                    id="comment"
                    value={newReview.comment}
                    onChange={handleCommentChange}
                    placeholder="แชร์ประสบการณ์ของคุณ..."
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="customerName">ชื่อของคุณ</label>
                  <input
                    id="customerName"
                    type="text"
                    value={newReview.customerName}
                    onChange={handleNameChange}
                    placeholder="กรอกชื่อของคุณ"
                    required
                  />
                </div>
                
                <button type="submit" className="submit-review-btn">ส่งรีวิว</button>
              </>
            )}
            
            {!selectedMenuItem && !itemId && (
              <div className="select-menu-prompt">
                <p>กรุณาเลือกเมนูที่ต้องการรีวิว</p>
              </div>
            )}
          </form>
        </div>
        
        <div className="reviews-section">
          <h2>รีวิวล่าสุด</h2>
          
          <div className="filter-tabs">
            <button 
              className={filter === 'all' ? 'active' : ''} 
              onClick={() => filterReviewsByCategory('all')}
            >
              ทั้งหมด
            </button>
            
            {getUniqueCategories().map((category, index) => (
              <button 
                key={index} 
                className={filter === category ? 'active' : ''} 
                onClick={() => filterReviewsByCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
          
          {filteredReviews.length === 0 ? (
            <div className="no-reviews">
              <p>ยังไม่มีรีวิว</p>
            </div>
          ) : (
            <div className="reviews-list">
              {filteredReviews.map(review => (
                <div key={review.id} className="review-card">
                  <div className="review-header">
                    <h3>{getMenuItemName(review.menuItemId)}</h3>
                    <div className="review-rating">
                      {renderStars(review.rating).map(star => (
                        <span key={Math.random()} className={star.props.className}>★</span>
                      ))}
                      <span className="rating-number">{review.rating}/5</span>
                    </div>
                  </div>
                  
                  <div className="review-content">
                    <p className="review-comment">{review.comment}</p>
                    <div className="review-meta">
                      <p className="reviewer-name">โดย: {review.customerName}</p>
                      <p className="review-date">{formatDate(review.createdAt)}</p>
                    </div>
                  </div>
                  
                  {currentUser && currentUser.isAdmin && (
                    <div className="review-admin-actions">
                      <button 
                        onClick={() => handleDeleteReview(review.id)} 
                        className="delete-review-btn"
                      >
                        ลบรีวิว
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="review-footer">
        <Link to="/" className="back-link">กลับไปหน้าเมนู</Link>
      </div>
    </div>
  );
}

export default ReviewSystem;