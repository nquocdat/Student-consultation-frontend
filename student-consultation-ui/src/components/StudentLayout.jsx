import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios"; // 1. Nhớ import axios để gọi API

const StudentLayout = () => {
  const navigate = useNavigate();
  const DOMAIN = "http://localhost:8080";

  // 2. Khởi tạo state (Mặc định hiển thị đang tải...)
  const [student, setStudent] = useState({
    fullName: "Đang tải...",
    avatar: null,
    studentCode: "" 
  });

  // 3. LẤY THÔNG TIN TỪ API (Để đồng bộ với Database)
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const token = localStorage.getItem("token");
        
        if (token) {
            // Gọi API /me để lấy thông tin mới nhất (Avatar, Tên...)
            const response = await axios.get(`${DOMAIN}/api/students/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStudent(response.data);
        }
      } catch (e) {
        console.error("Lỗi tải thông tin sidebar:", e);
        // Nếu lỗi thì để tên mặc định
        setStudent(prev => ({ ...prev, fullName: "Sinh viên" }));
      }
    };

    fetchStudentData();
  }, []);

  // --- STYLES (Giữ nguyên như cũ) ---
  const linkStyle = ({ isActive }) => ({
    display: "block",
    padding: "10px 12px",
    marginBottom: 6,
    borderRadius: 4,
    color: "white",
    textDecoration: "none",
    fontSize: "15px",
    background: isActive ? "#146b25" : "transparent",
    transition: "background 0.3s",
    border: "1px solid rgba(255,255,255,0.1)"
  });

  const staticItemStyle = {
    padding: "10px 12px",
    marginBottom: 6,
    color: "rgba(255, 255, 255, 0.7)",
    cursor: "default",
    display: "flex", alignItems: "center", gap: "10px"
  };

  const profileStyle = {
    marginTop: "auto", 
    paddingTop: "15px",
    borderTop: "1px solid rgba(255,255,255,0.2)",
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
    padding: "10px",
    borderRadius: "8px",
    transition: "background 0.2s"
  };

  // Logic hiển thị Avatar
  const defaultAvatar = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
  const avatarSrc = student.avatar || defaultAvatar;

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* --- SIDEBAR --- */}
      <aside
        style={{
          width: 280,
          background: "#1b8c2f",
          color: "white",
          padding: "20px 15px",
          display: "flex",
          flexDirection: "column"
        }}
      >
        <h3 className="mb-4 fw-bold text-center">For Students</h3>

        <div style={{ flex: 1 }}>
            {/* CÁC MỤC THỦ TỤC */}
            <small style={{ textTransform: "uppercase", opacity: 0.8, marginBottom: 10, display:"block", fontWeight: "bold", fontSize: "12px", color: "#a8e6cf" }}>
                Góc làm danh mục thủ tục
            </small>
            <div className="mb-2">
                <div style={staticItemStyle}>📂 Danh mục thủ tục</div>
                <div style={staticItemStyle}>📝 Tạo yêu cầu thủ tục</div>
                <div style={staticItemStyle}>🔍 Xem kết quả hồ sơ</div>
            </div>

            <hr style={{ borderColor: "rgba(255,255,255,0.4)", margin: "10px 0 20px 0" }} />
            
            {/* CÁC MỤC TƯ VẤN */}
            <small style={{ textTransform: "uppercase", opacity: 0.8, marginBottom: 10, display:"block", fontWeight: "bold", fontSize: "12px", color: "#a8e6cf" }}>
                Góc tư vấn & Hỗ trợ
            </small>

            <NavLink to="/student/create-request" style={linkStyle}>
              💬 Tạo yêu cầu tư vấn
            </NavLink>

            <NavLink to="/student/history" style={linkStyle}>
              📋 Lịch sử tư vấn
            </NavLink>
        </div>

        {/* --- USER PROFILE (ĐÃ SỬA DỮ LIỆU ĐỘNG) --- */}
        <div 
            style={profileStyle} 
            onClick={() => navigate("/student/profile")}
            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            title="Bấm để xem hồ sơ chi tiết"
        >
            {/* AVATAR: Lấy từ state student.avatar */}
            <img 
                src={avatarSrc} 
                alt="Avatar" 
                style={{ 
                    width: "40px", height: "40px", 
                    borderRadius: "50%", objectFit: "cover", 
                    marginRight: "12px", border: "2px solid white" 
                }}
            />
            
            <div style={{ overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                
                {/* TÊN SINH VIÊN: Lấy từ state student.fullName */}
                <div style={{ fontWeight: "bold", fontSize: "14px", lineHeight: "1.2", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {student.fullName}
                </div>
                
                {/* MÃ SINH VIÊN: Lấy từ state student.studentCode */}
                <div style={{ fontSize: "12px", opacity: 0.8, marginTop: "2px" }}>
                    {student.studentCode || "Sinh viên"}
                </div>

            </div>
        </div>

      </aside>

      {/* --- MAIN CONTENT --- */}
      <main style={{ flex: 1, padding: 20, overflowY: "auto", background: "#f8f9fa" }}>
        <Outlet />
      </main>
    </div>
  );
};

export default StudentLayout;