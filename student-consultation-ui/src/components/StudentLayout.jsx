import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const StudentLayout = () => {
  const navigate = useNavigate();
  const DOMAIN = "http://localhost:8080";

  const [student, setStudent] = useState({
    fullName: "Đang tải...",
    avatar: null,
    studentCode: "" 
  });

  // 1. LẤY DATA
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
            const response = await axios.get(`${DOMAIN}/api/students/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStudent(response.data);
        }
      } catch (e) {
        setStudent(prev => ({ ...prev, fullName: "Sinh viên" }));
      }
    };
    fetchStudentData();
  }, []);

  // 2. HÀM XỬ LÝ ĐĂNG XUẤT
  const handleLogout = (e) => {
    // Ngăn không cho sự kiện click lan ra ngoài (để không bị nhảy sang trang profile)
    e.stopPropagation(); 
    
    const confirm = window.confirm("Bạn có chắc chắn muốn đăng xuất?");
    if (confirm) {
        localStorage.removeItem("token");
        localStorage.removeItem("user"); // Nếu có lưu
        navigate("/login"); // Chuyển về trang đăng nhập
    }
  };

  // --- STYLES ---
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

  // Style container chứa Profile + Nút Logout
  const footerStyle = {
    marginTop: "auto", 
    paddingTop: "15px",
    borderTop: "1px solid rgba(255,255,255,0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between", // Đẩy nút logout sang phải
    padding: "10px",
    borderRadius: "8px",
    transition: "background 0.2s",
    // cursor: "pointer" // Xóa ở đây, chuyển vào phần info
  };

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
            <small style={{ textTransform: "uppercase", opacity: 0.8, marginBottom: 10, display:"block", fontWeight: "bold", fontSize: "12px", color: "#a8e6cf" }}>
                Góc làm danh mục thủ tục
            </small>
            <div className="mb-2">
                <div style={staticItemStyle}>📂 Danh mục thủ tục</div>
                <div style={staticItemStyle}>📝 Tạo yêu cầu thủ tục</div>
                <div style={staticItemStyle}>🔍 Xem kết quả hồ sơ</div>
            </div>

            <hr style={{ borderColor: "rgba(255,255,255,0.4)", margin: "10px 0 20px 0" }} />
            
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

        {/* --- FOOTER: PROFILE & LOGOUT --- */}
        <div style={footerStyle}>
            
            {/* PHẦN 1: THÔNG TIN (Click vào thì xem Profile) */}
            <div 
                onClick={() => navigate("/student/profile")}
                style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', flex: 1, overflow: 'hidden' }}
                title="Xem hồ sơ"
            >
                <img 
                    src={avatarSrc} 
                    alt="Avatar" 
                    style={{ 
                        width: "40px", height: "40px", 
                        borderRadius: "50%", objectFit: "cover", 
                        marginRight: "10px", border: "2px solid white" 
                    }}
                />
                <div style={{ overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    <div style={{ fontWeight: "bold", fontSize: "14px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {student.fullName}
                    </div>
                    <div style={{ fontSize: "12px", opacity: 0.8 }}>
                        {student.studentCode || "Sinh viên"}
                    </div>
                </div>
            </div>

            {/* PHẦN 2: NÚT LOGOUT (Nằm gọn bên phải) */}
            <button 
                onClick={handleLogout}
                title="Đăng xuất"
                style={{
                    background: "rgba(255, 255, 255, 0.2)",
                    border: "none",
                    borderRadius: "8px",
                    width: "36px",
                    height: "36px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer",
                    color: "white",
                    marginLeft: "8px",
                    transition: "0.2s"
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "#dc3545"} // Màu đỏ khi hover
                onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)"}
            >
                {/* Icon Logout SVG */}
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z"/>
                    <path fillRule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"/>
                </svg>
            </button>
        </div>

      </aside>

      <main style={{ flex: 1, padding: 20, overflowY: "auto", background: "#f8f9fa" }}>
        <Outlet />
      </main>
    </div>
  );
};

export default StudentLayout;