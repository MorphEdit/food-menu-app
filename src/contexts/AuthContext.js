import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // เช็คสถานะการล็อกอินเมื่อโหลดหน้า
  useEffect(() => {
    const user = localStorage.getItem('restaurantUser');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
    setLoading(false);
  }, []);

  // ฟังก์ชันเข้าสู่ระบบ
  const login = (email, password) => {
    return new Promise((resolve, reject) => {
      // จำลองการตรวจสอบกับข้อมูลในระบบ (ในกรณีจริงควรใช้ API)
      const users = JSON.parse(localStorage.getItem('restaurantUsers') || '[]');
      const user = users.find(u => u.email === email && u.password === password);
      
      if (user) {
        // ไม่ควรเก็บ password ลง localStorage ในโปรดักชัน ใช้ token แทน
        const { password, ...userWithoutPassword } = user;
        localStorage.setItem('restaurantUser', JSON.stringify(userWithoutPassword));
        setCurrentUser(userWithoutPassword);
        resolve(userWithoutPassword);
      } else {
        reject(new Error('อีเมลหรือรหัสผ่านไม่ถูกต้อง'));
      }
    });
  };

  // ฟังก์ชันลงทะเบียน
  const register = (name, email, password, role) => {
    return new Promise((resolve, reject) => {
      const users = JSON.parse(localStorage.getItem('restaurantUsers') || '[]');
      
      // ตรวจสอบว่ามีอีเมลนี้ในระบบแล้วหรือไม่
      if (users.some(user => user.email === email)) {
        reject(new Error('อีเมลนี้ถูกใช้งานแล้ว'));
        return;
      }

      // สร้างผู้ใช้ใหม่
      const newUser = {
        id: Date.now(),
        name,
        email,
        password, // ในโปรดักชัน ควรเข้ารหัส password ก่อนเก็บ
        role,
        createdAt: new Date().toISOString()
      };

      // บันทึกข้อมูล
      const updatedUsers = [...users, newUser];
      localStorage.setItem('restaurantUsers', JSON.stringify(updatedUsers));
      
      // ล็อกอินอัตโนมัติ
      const { password: _, ...userWithoutPassword } = newUser;
      localStorage.setItem('restaurantUser', JSON.stringify(userWithoutPassword));
      setCurrentUser(userWithoutPassword);
      
      resolve(userWithoutPassword);
    });
  };

  // ฟังก์ชันออกจากระบบ
  const logout = () => {
    localStorage.removeItem('restaurantUser');
    setCurrentUser(null);
  };

  // สร้างผู้ใช้เริ่มต้นหากไม่มีในระบบ
  useEffect(() => {
    const users = JSON.parse(localStorage.getItem('restaurantUsers') || '[]');
    if (users.length === 0) {
      const defaultAdmin = {
        id: 1,
        name: 'ผู้ดูแลระบบ',
        email: 'admin@restaurant.com',
        password: 'admin123',
        role: 'admin',
        createdAt: new Date().toISOString()
      };
      localStorage.setItem('restaurantUsers', JSON.stringify([defaultAdmin]));
    }
  }, []);

  const value = {
    currentUser,
    login,
    register,
    logout,
    isAdmin: currentUser?.role === 'admin',
    isStaff: currentUser?.role === 'staff'
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}