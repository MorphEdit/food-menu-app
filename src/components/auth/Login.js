import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/Auth.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, currentUser } = useAuth();

  // ถ้ามีการล็อกอินอยู่แล้ว ให้ redirect ไปที่หน้าหลัก
  React.useEffect(() => {
    if (currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      await login(email, password);
      navigate('/');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1>เข้าสู่ระบบ</h1>
        
        {error && <div className="auth-error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">อีเมล</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="กรอกอีเมลของคุณ"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">รหัสผ่าน</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="กรอกรหัสผ่านของคุณ"
            />
          </div>
          
          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>ยังไม่มีบัญชี? <Link to="/register">ลงทะเบียน</Link></p>
          <Link to="/" className="back-link">กลับไปหน้าหลัก</Link>
        </div>

        <div className="demo-credentials">
          <h3>ข้อมูลสำหรับทดลองใช้งาน</h3>
          <p><strong>อีเมล:</strong> admin@restaurant.com</p>
          <p><strong>รหัสผ่าน:</strong> admin123</p>
        </div>
      </div>
    </div>
  );
}

export default Login;