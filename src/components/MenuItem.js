import React from 'react';

function MenuItem({ item, onAddToCart }) {
  return (
    <div className="menu-item">
      <h3>{item.name}</h3>
      <p>{item.description}</p>
      <p className="price">{item.price} บาท</p>
      <button onClick={onAddToCart}>เพิ่มลงตะกร้า</button>
    </div>
  );
}

export default MenuItem;