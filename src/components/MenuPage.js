import React, { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import MenuItem from './MenuItem';
import Loading from './Loading';
import '../styles/MenuPage.css';

function MenuPage() {
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const { cart, addToCart } = useCart();
    
    useEffect(() => {
        // ข้อมูลตัวอย่างแทนการเรียก API
        const sampleMenuItems = [
            { _id: 1, name: 'ข้าวผัดกระเพรา', description: 'ข้าวผัดกระเพราหมูสับ ไข่ดาว', price: 60, category: 'อาหารจานเดียว' },
            { _id: 2, name: 'ผัดไทย', description: 'ผัดไทยกุ้งสด ใส่ไข่', price: 80, category: 'อาหารจานเดียว' },
            { _id: 3, name: 'ต้มยำกุ้ง', description: 'ต้มยำกุ้งน้ำข้น', price: 120, category: 'อาหารทานเล่น' },
            { _id: 4, name: 'ส้มตำไทย', description: 'ส้มตำไทยรสจัด', price: 60, category: 'อาหารทานเล่น' },
            { _id: 5, name: 'แกงเขียวหวาน', description: 'แกงเขียวหวานไก่', price: 80, category: 'แกงและซุป' },
            { _id: 6, name: 'ข้าวมันไก่', description: 'ข้าวมันไก่ต้ม พร้อมน้ำจิ้ม', price: 70, category: 'อาหารจานเดียว' },
        ];
        
        // จำลองการโหลดข้อมูล
        setTimeout(() => {
            setMenuItems(sampleMenuItems);
            setLoading(false);
        }, 1000); // จำลองการโหลด 1 วินาที
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
    
    if (loading) return <Loading />;
    
    const categories = getCategories();
    
    return (
        <div className="menu-page">
            <div className="header">
                <h1>เมนูอาหาร</h1>
                <div className="cart-icon">
                    🛒
                    {cart.length > 0 && <span className="cart-count">{cart.length}</span>}
                </div>
            </div>
            
            {Object.keys(categories).map(category => (
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
            ))}
        </div>
    );
}

export default MenuPage;