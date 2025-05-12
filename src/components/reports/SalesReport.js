import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import '../../styles/SalesReport.css';

function SalesReport() {
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [reportType, setReportType] = useState('daily');
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [reportData, setReportData] = useState([]);
  const [topSellingItems, setTopSellingItems] = useState([]);
  const [salesSummary, setSalesSummary] = useState({
    totalSales: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    totalItems: 0
  });
  const { currentUser, isAdmin } = useAuth();
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#FF6B6B', '#4CAF50', '#9C27B0'];
  
  useEffect(() => {
    // โหลดข้อมูลออเดอร์และเมนู
    const savedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    const savedMenuItems = JSON.parse(localStorage.getItem('menuItems') || '[]');
    
    setOrders(savedOrders);
    setMenuItems(savedMenuItems);
    
    // สร้างรายงานเริ่มต้น
    generateReport(savedOrders, savedMenuItems, reportType, dateRange);
  }, []);
  
  // ตรวจสอบสิทธิ์การเข้าถึง - เฉพาะ admin เท่านั้น
  if (!currentUser || !isAdmin) {
    return (
      <div className="sales-report-page">
        <div className="auth-required">
          <h2>ไม่มีสิทธิ์เข้าถึง</h2>
          <p>คุณจำเป็นต้องเข้าสู่ระบบด้วยบัญชีผู้ดูแลระบบเพื่อเข้าถึงหน้านี้</p>
          <Link to="/login" className="login-button">เข้าสู่ระบบ</Link>
        </div>
      </div>
    );
  }
  
  // เปลี่ยนประเภทรายงาน
  const handleReportTypeChange = (type) => {
    setReportType(type);
    generateReport(orders, menuItems, type, dateRange);
  };
  
  // เปลี่ยนช่วงวันที่
  const handleDateRangeChange = (e) => {
    const { name, value } = e.target;
    const newDateRange = { ...dateRange, [name]: value };
    setDateRange(newDateRange);
    generateReport(orders, menuItems, reportType, newDateRange);
  };
  
  // สร้างรายงานการขาย
  const generateReport = (orders, menuItems, type, range) => {
    // กรองออเดอร์ตามช่วงวันที่
    const filteredOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      const startDate = new Date(range.start);
      const endDate = new Date(range.end);
      endDate.setHours(23, 59, 59, 999); // ให้ endDate เป็นเวลาสิ้นสุดของวัน
      
      return orderDate >= startDate && orderDate <= endDate && 
             (order.status === 'completed' || order.status === 'ready');
    });
    
    // หากไม่มีออเดอร์ในช่วงเวลาที่เลือก
    if (filteredOrders.length === 0) {
      setReportData([]);
      setTopSellingItems([]);
      setSalesSummary({
        totalSales: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        totalItems: 0
      });
      return;
    }
    
    // คำนวณยอดขายรวม
    const totalSales = filteredOrders.reduce((sum, order) => sum + order.total, 0);
    const totalItems = filteredOrders.reduce((sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);
    
    // สรุปข้อมูลการขาย
    setSalesSummary({
      totalSales,
      totalOrders: filteredOrders.length,
      averageOrderValue: totalSales / filteredOrders.length,
      totalItems
    });
    
    // สร้างข้อมูลรายงานตามประเภท
    let data = [];
    
    if (type === 'daily') {
      // จัดกลุ่มข้อมูลตามวัน
      const groupedByDay = {};
      
      filteredOrders.forEach(order => {
        const date = new Date(order.createdAt).toISOString().split('T')[0];
        if (!groupedByDay[date]) {
          groupedByDay[date] = {
            date,
            sales: 0,
            orders: 0
          };
        }
        
        groupedByDay[date].sales += order.total;
        groupedByDay[date].orders += 1;
      });
      
      data = Object.values(groupedByDay).sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (type === 'weekly') {
      // จัดกลุ่มข้อมูลตามสัปดาห์
      const groupedByWeek = {};
      
      filteredOrders.forEach(order => {
        const orderDate = new Date(order.createdAt);
        const year = orderDate.getFullYear();
        const weekNumber = getWeekNumber(orderDate);
        const weekKey = `${year}-W${weekNumber}`;
        
        if (!groupedByWeek[weekKey]) {
          groupedByWeek[weekKey] = {
            week: weekKey,
            sales: 0,
            orders: 0
          };
        }
        
        groupedByWeek[weekKey].sales += order.total;
        groupedByWeek[weekKey].orders += 1;
      });
      
      data = Object.values(groupedByWeek).sort((a, b) => {
        const [yearA, weekA] = a.week.split('-W');
        const [yearB, weekB] = b.week.split('-W');
        return yearA === yearB ? weekA - weekB : yearA - yearB;
      });
    } else if (type === 'monthly') {
      // จัดกลุ่มข้อมูลตามเดือน
      const groupedByMonth = {};
      
      filteredOrders.forEach(order => {
        const orderDate = new Date(order.createdAt);
        const year = orderDate.getFullYear();
        const month = orderDate.getMonth() + 1;
        const monthKey = `${year}-${month.toString().padStart(2, '0')}`;
        
        if (!groupedByMonth[monthKey]) {
          groupedByMonth[monthKey] = {
            month: monthKey,
            sales: 0,
            orders: 0
          };
        }
        
        groupedByMonth[monthKey].sales += order.total;
        groupedByMonth[monthKey].orders += 1;
      });
      
      data = Object.values(groupedByMonth).sort((a, b) => a.month.localeCompare(b.month));
    }
    
    setReportData(data);
    
    // หาสินค้าขายดี
    const itemSales = {};
    
    filteredOrders.forEach(order => {
      order.items.forEach(item => {
        if (!itemSales[item._id]) {
          itemSales[item._id] = {
            id: item._id,
            name: item.name,
            quantity: 0,
            total: 0
          };
        }
        
        itemSales[item._id].quantity += item.quantity;
        itemSales[item._id].total += item.price * item.quantity;
      });
    });
    
    const topItems = Object.values(itemSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
    
    setTopSellingItems(topItems);
  };
  
  // คำนวณเลขสัปดาห์ในปี
  const getWeekNumber = (date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };
  
  // จัดรูปแบบข้อมูลวันที่
  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('th-TH', options);
  };
  
  // จัดรูปแบบข้อมูลเดือน
  const formatMonth = (monthString) => {
    const [year, month] = monthString.split('-');
    const monthNames = [
      'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ];
    
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };
  
  // จัดรูปแบบข้อมูลสัปดาห์
  const formatWeek = (weekString) => {
    const [year, week] = weekString.split('-W');
    return `สัปดาห์ที่ ${week} ปี ${year}`;
  };
  
  // ฟังก์ชันสร้างชื่อสำหรับแกน X
  const formatXAxis = (value) => {
    if (reportType === 'daily') {
      return formatDate(value);
    } else if (reportType === 'weekly') {
      return `W${value.split('-W')[1]}`;
    } else if (reportType === 'monthly') {
      return formatMonth(value);
    }
    return value;
  };
  
  // ฟังก์ชันแสดงข้อมูลในทูลทิป
  const renderTooltipContent = (props) => {
    const { payload, label } = props;
    if (!payload || payload.length === 0) return null;
    
    let formattedLabel = '';
    if (reportType === 'daily') {
      formattedLabel = formatDate(label);
    } else if (reportType === 'weekly') {
      formattedLabel = formatWeek(label);
    } else if (reportType === 'monthly') {
      formattedLabel = formatMonth(label);
    }
    
    return (
      <div className="custom-tooltip">
        <p className="tooltip-label">{formattedLabel}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }}>
            {entry.name}: {entry.name === 'ยอดขาย' ? `${entry.value.toLocaleString()} บาท` : entry.value}
          </p>
        ))}
      </div>
    );
  };
  
  return (
    <div className="sales-report-page">
      <h1>รายงานการขาย</h1>
      
      <div className="report-controls">
        <div className="report-type-buttons">
          <button 
            className={reportType === 'daily' ? 'active' : ''} 
            onClick={() => handleReportTypeChange('daily')}
          >
            รายวัน
          </button>
          <button 
            className={reportType === 'weekly' ? 'active' : ''} 
            onClick={() => handleReportTypeChange('weekly')}
          >
            รายสัปดาห์
          </button>
          <button 
            className={reportType === 'monthly' ? 'active' : ''} 
            onClick={() => handleReportTypeChange('monthly')}
          >
            รายเดือน
          </button>
        </div>
        
        <div className="date-range-picker">
          <div className="date-input-group">
            <label htmlFor="start">วันที่เริ่มต้น</label>
            <input 
              id="start" 
              type="date" 
              name="start"
              value={dateRange.start}
              onChange={handleDateRangeChange}
            />
          </div>
          
          <div className="date-input-group">
            <label htmlFor="end">วันที่สิ้นสุด</label>
            <input 
              id="end" 
              type="date" 
              name="end"
              value={dateRange.end}
              onChange={handleDateRangeChange}
            />
          </div>
        </div>
      </div>
      
      <div className="sales-summary">
        <div className="summary-card">
          <h3>ยอดขายรวม</h3>
          <div className="summary-value">{salesSummary.totalSales.toLocaleString()} บาท</div>
        </div>
        
        <div className="summary-card">
          <h3>จำนวนออเดอร์</h3>
          <div className="summary-value">{salesSummary.totalOrders.toLocaleString()} ออเดอร์</div>
        </div>
        
        <div className="summary-card">
          <h3>ยอดเฉลี่ยต่อออเดอร์</h3>
          <div className="summary-value">{salesSummary.averageOrderValue.toLocaleString(undefined, { maximumFractionDigits: 2 })} บาท</div>
        </div>
        
        <div className="summary-card">
          <h3>จำนวนสินค้าที่ขายได้</h3>
          <div className="summary-value">{salesSummary.totalItems.toLocaleString()} รายการ</div>
        </div>
      </div>
      
      {reportData.length > 0 ? (
        <div className="report-charts">
          <div className="chart-container">
            <h2>ยอดขาย{reportType === 'daily' ? 'รายวัน' : reportType === 'weekly' ? 'รายสัปดาห์' : 'รายเดือน'}</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={reportData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey={reportType === 'daily' ? 'date' : reportType === 'weekly' ? 'week' : 'month'} 
                  tickFormatter={formatXAxis}
                />
                <YAxis />
                <Tooltip content={renderTooltipContent} />
                <Legend />
                <Line type="monotone" dataKey="sales" name="ยอดขาย" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div className="chart-container">
            <h2>จำนวนออเดอร์{reportType === 'daily' ? 'รายวัน' : reportType === 'weekly' ? 'รายสัปดาห์' : 'รายเดือน'}</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reportData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey={reportType === 'daily' ? 'date' : reportType === 'weekly' ? 'week' : 'month'} 
                  tickFormatter={formatXAxis}
                />
                <YAxis />
                <Tooltip content={renderTooltipContent} />
                <Legend />
                <Bar dataKey="orders" name="จำนวนออเดอร์" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="chart-container">
            <h2>สินค้าขายดี 5 อันดับ</h2>
            <div className="top-selling-container">
              <div className="pie-chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={topSellingItems}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="quantity"
                      nameKey="name"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {topSellingItems.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="top-selling-list">
                <h3>รายละเอียด</h3>
                <table className="top-selling-table">
                  <thead>
                    <tr>
                      <th>อันดับ</th>
                      <th>ชื่อสินค้า</th>
                      <th>จำนวน</th>
                      <th>ยอดขาย</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topSellingItems.map((item, index) => (
                      <tr key={item.id}>
                        <td>{index + 1}</td>
                        <td>{item.name}</td>
                        <td>{item.quantity}</td>
                        <td>{item.total.toLocaleString()} บาท</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="no-data">
          <p>ไม่มีข้อมูลในช่วงเวลาที่เลือก</p>
        </div>
      )}
      
      <div className="report-footer">
        <button className="print-button" onClick={() => window.print()}>พิมพ์รายงาน</button>
        <Link to="/dashboard" className="back-link">กลับไปหน้าแดชบอร์ด</Link>
      </div>
    </div>
  );
}

export default SalesReport;