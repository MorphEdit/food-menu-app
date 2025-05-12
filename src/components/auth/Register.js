import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/Auth.css';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('staff'); // Default role
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register, currentUser, isAdmin } = useAuth();

  // ถ้ามีการล็อกอินอยู่แล้ว และไม่ใช่ admin ให้ redirect ไปที่หน้าหลัก
  React.useEffect(() => {
    if (currentUser && !isAdmin) {
      navigate('/');
    }
  }, [currentUser, isAdmin, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name || !email || !password || !confirmPassword) {
      setError('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('รหัสผ่านไม่ตรงกัน');
      return;
    }
    
    if (password.length < 6) {
      setError('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      await register(name, email, password, role);
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
        <h1>ลงทะเบียน</h1>
        
        {error && <div className="auth-error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">ชื่อ</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="กรอกชื่อของคุณ"
            />
          </div>
          
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
          
          <div className="form-group">
            <label htmlFor="confirm-password">ยืนยันรหัสผ่าน</label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="กรอกรหัสผ่านอีกครั้ง"
            />
          </div>
          
          {isAdmin && (
            <div className="form-group">
              <label htmlFor="role">บทบาท</label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="staff">พนักงาน</option>
                <option value="admin">ผู้ดูแลระบบ</option>
              </select>
            </div>
          )}
          
          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'กำลังลงทะเบียน...' : 'ลงทะเบียน'}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>มีบัญชีอยู่แล้ว? <Link to="/login">เข้าสู่ระบบ</Link></p>
          <Link to="/" className="back-link">กลับไปหน้าหลัก</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;