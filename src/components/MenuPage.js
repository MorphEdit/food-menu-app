import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import MenuItem from './MenuItem';
import Loading from './Loading';
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
            { _id: 1, name: 'ข้าวผัดกระเพรา', description: 'ข้าวผัดกระเพราหมูสับ ไข่ดาว', price: 60, category: 'อาหารจานเดียว' },
            { _id: 2, name: 'ผัดไทย', description: 'ผัดไทยกุ้งสด ใส่ไข่', price: 80, category: 'อาหารจานเดียว' },
            { _id: 3, name: 'ต้มยำกุ้ง', description: 'ต้มยำกุ้งน้ำข้น', price: 120, category: 'อาหารทานเล่น' },
            { _id: 4, name: 'ส้มตำไทย', description: 'ส้มตำไทยรสจัด', price: 60, category: 'อาหารทานเล่น' },
            { _id: 5, name: 'แกงเขียวหวาน', description: 'แกงเขียวหวานไก่', price: 80, category: 'แกงและซุป' },
            { _id: 6, name: 'ข้าวมันไก่', description: 'ข้าวมันไก่ต้ม พร้อมน้ำจิ้ม', price: 70, category: 'อาหารจานเดียว' },
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
    
    if (loading) return <Loading />;
    
    const categories = getCategories();
    
    // คำนวณจำนวนรายการทั้งหมดในตะกร้า
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    return (
        <div className="menu-page">
            <div className="header">
                <h1>เมนูอาหาร</h1>
                <div className="search-container">
                    <input 
                        type="text" 
                        placeholder="ค้นหาเมนูอาหาร..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
                <Link to="/cart" className="cart-icon">
                    🛒
                    {totalItems > 0 && <span className="cart-count">{totalItems}</span>}
                </Link>
            </div>
            
            {searchTerm ? (
                <div className="search-results">
                    <h2>ผลการค้นหา: {searchTerm}</h2>
                    {filteredItems.length === 0 ? (
                        <p className="no-results">ไม่พบเมนูที่ค้นหา</p>
                    ) : (
                        <div className="menu-grid">
                            {filteredItems.map(item => (
                                <MenuItem
                                    key={item._id}
                                    item={item}
                                    onAddToCart={() => addToCart(item)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                Object.keys(categories).map(category => (
                    <div key={category} className="menu-category">
                        <h2 className="menu-category-title">{category}</h2>
                        <div className="menu-grid">
                            {categories[category].map(item => (
                                <MenuItem
                                    key={item._id}
                                    item={item}
                                    onAddToCart={() => addToCart(item)}
                                />
                            ))}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}

export default MenuPage;