import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react'; // แก้ตรงนี้ จาก QRCode เป็น { QRCodeCanvas }
import '../styles/QRCodePage.css';

function QRCodePage() {
  const [tableNumber, setTableNumber] = useState(1);
  const orderUrl = `${window.location.origin}?table=${tableNumber}`;
  
  return (
    <div className="qrcode-page">
      <h1>QR Code สำหรับโต๊ะอาหาร</h1>
      
      <div className="table-selector">
        <label htmlFor="table-select">เลือกโต๊ะ:</label>
        <select 
          id="table-select"
          value={tableNumber} 
          onChange={(e) => setTableNumber(e.target.value)}
        >
          {[...Array(10)].map((_, i) => (
            <option key={i+1} value={i+1}>โต๊ะ {i+1}</option>
          ))}
        </select>
      </div>
      
      <div className="qrcode-container">
        <QRCodeCanvas value={orderUrl} size={256} /> {/* แก้ตรงนี้ จาก QRCode เป็น QRCodeCanvas */}
        <p className="qrcode-info">สแกนเพื่อสั่งอาหารที่โต๊ะ {tableNumber}</p>
      </div>
      
      <div className="qrcode-actions">
        <button onClick={() => window.print()} className="print-button">
          พิมพ์ QR Code
        </button>
        
        <Link to="/" className="back-link">
          กลับไปหน้าหลัก
        </Link>
      </div>
    </div>
  );
}

export default QRCodePage;