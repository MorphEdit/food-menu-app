import React from 'react';

function MenuItem({ item, onAddToCart }) {
  return (
    <div className="menu-item">
      <div className="menu-item-image">
        <img src={item.imageUrl || 'https://via.placeholder.com/300x200'} alt={item.name} />
        <div className="price-tag">{item.price} บาท</div>
      </div>
      <div className="menu-item-info">
        <h3>{item.name}</h3>
        <p>{item.description}</p>
        <button onClick={onAddToCart} className="add-to-cart-btn">
          เพิ่มลงตะกร้า
        </button>
      </div>
    </div>
  );
}

export default MenuItem;