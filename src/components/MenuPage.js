import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import '../styles/MenuPage.css';

function MenuPage() {
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { cart, addToCart } = useCart();
    
    useEffect(() => {
        // โหลดข้อมูลจาก localStorage
        const savedItems = localStorage.getItem('menuItems');
        if (savedItems) {
          setMenuItems(JSON.parse(savedItems));
          setLoading(false);
        } else {
          // ข้อมูลตัวอย่าง
          const sampleMenuItems = [
            { _id: 1, name: 'ข้าวผัดกระเพรา', description: 'ข้าวผัดกระเพราหมูสับ ไข่ดาว', price: 60, category: 'อาหารจานเดียว', imageUrl: 'https://img.wongnai.com/p/1920x0/2019/05/15/042aca436d1341b29736cc5d64d87267.jpg' },
            { _id: 2, name: 'ผัดไทย', description: 'ผัดไทยกุ้งสด ใส่ไข่', price: 80, category: 'อาหารจานเดียว', imageUrl: 'https://img.wongnai.com/p/1920x0/2017/07/11/6b4b9ca1c36046fa99473a8c993e1d14.jpg' },
            { _id: 3, name: 'ต้มยำกุ้ง', description: 'ต้มยำกุ้งน้ำข้น', price: 120, category: 'อาหารทานเล่น', imageUrl: 'https://img.wongnai.com/p/1920x0/2020/09/07/e0a74e9f64154b859a9f07be69d08628.jpg' },
            { _id: 4, name: 'ส้มตำไทย', description: 'ส้มตำไทยรสจัด', price: 60, category: 'อาหารทานเล่น', imageUrl: 'https://img.wongnai.com/p/1920x0/2019/06/11/ad26f3584186498f9a3f86f2b5bc8920.jpg' },
            { _id: 5, name: 'แกงเขียวหวาน', description: 'แกงเขียวหวานไก่', price: 80, category: 'แกงและซุป', imageUrl: 'https://img.wongnai.com/p/1920x0/2019/07/08/753becc6f9c44f848ffcb280c9722890.jpg' },
            { _id: 6, name: 'ข้าวมันไก่', description: 'ข้าวมันไก่ต้ม พร้อมน้ำจิ้ม', price: 70, category: 'อาหารจานเดียว', imageUrl: 'https://img.wongnai.com/p/1920x0/2020/04/29/f00cf829794e4c5ca6e2d5b688eeec47.jpg' },
          ];
          setTimeout(() => {
            setMenuItems(sampleMenuItems);
            localStorage.setItem('menuItems', JSON.stringify(sampleMenuItems));
            setLoading(false);
          }, 1000);
        }
    }, []);
    
    // แยกเมนูตามหมวดหมู่
    const getCategories = () => {
        const categories = {};
        menuItems.forEach(item => {
            if (!categories[item.category]) {
                categories[item.category] = [];
            }
            categories[item.category].push(item);
        });
        return categories;
    };
    
    // กรองรายการอาหารตามคำค้นหา
    const filteredItems = menuItems.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Loading component
    const Loading = () => (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <div className="loading-text">กำลังโหลดเมนูอาหาร...</div>
      </div>
    );
    
    if (loading) return <Loading />;
    
    const categories = getCategories();
    
    // คำนวณจำนวนรายการทั้งหมดในตะกร้า
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    return (
      <div className="menu-page-container">
        {/* Header */}
        <div className="menu-header">
          <div className="header-content">
            <h1>อร่อยดี</h1>
            <div className="search-container">
              <input 
                type="text" 
                placeholder="ค้นหาเมนูที่คุณชอบ..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <Link to="/cart" className="cart-button">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
              {totalItems > 0 && <span className="cart-count">{totalItems}</span>}
            </Link>
          </div>
        </div>
        
        {/* Category Navigation */}
        <div className="category-nav">
          <div className="category-nav-inner">
            <button className="category-btn active">ทั้งหมด</button>
            {Object.keys(categories).map((category, index) => (
              <button 
                key={index} 
                className="category-btn"
              >
                {category}
              </button>
            ))}
          </div>
        </div>
        
        {/* Main Content */}
        <div className="menu-content">
          {searchTerm ? (
            <div className="search-results">
              <h2>ผลการค้นหา: {searchTerm}</h2>
              {filteredItems.length === 0 ? (
                <p className="no-results">ไม่พบเมนูที่ค้นหา</p>
              ) : (
                <div className="menu-grid">
                  {filteredItems.map(item => (
                    <div key={item._id} className="menu-item">
                      <div className="menu-item-image">
                        <img src={item.imageUrl || 'https://via.placeholder.com/300x200'} alt={item.name} />
                        <div className="price-tag">{item.price} บาท</div>
                      </div>
                      <div className="menu-item-info">
                        <h3>{item.name}</h3>
                        <p>{item.description}</p>
                        <button onClick={() => addToCart(item)} className="add-to-cart-btn">
                          เพิ่มลงตะกร้า
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            Object.keys(categories).map(category => (
              <div key={category} className="menu-category">
                <h2 className="category-title">{category}</h2>
                <div className="menu-grid">
                  {categories[category].map(item => (
                    <div key={item._id} className="menu-item">
                      <div className="menu-item-image">
                        <img src={item.imageUrl || 'https://via.placeholder.com/300x200'} alt={item.name} />
                        <div className="price-tag">{item.price} บาท</div>
                      </div>
                      <div className="menu-item-info">
                        <h3>{item.name}</h3>
                        <p>{item.description}</p>
                        <button onClick={() => addToCart(item)} className="add-to-cart-btn">
                          เพิ่มลงตะกร้า
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* Mobile Navigation */}
        <div className="mobile-nav">
          <a href="#" className="mobile-nav-item active">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
            </svg>
            <span>หน้าหลัก</span>
          </a>
          <a href="#" className="mobile-nav-item">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            <span>ค้นหา</span>
          </a>
          <Link to="/cart" className="mobile-nav-item">
            <div className="mobile-cart-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
              {totalItems > 0 && <span className="mobile-cart-count">{totalItems}</span>}
            </div>
            <span>ตะกร้า</span>
          </Link>
          <a href="#" className="mobile-nav-item">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
            <span>บัญชี</span>
          </a>
        </div>
      </div>
    );
}

export default MenuPage;