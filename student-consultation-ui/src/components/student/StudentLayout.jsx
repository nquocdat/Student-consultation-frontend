import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import ChatAssistant from "../../components/chatAI/ChatAssistant.jsx";
import axios from "axios";

const StudentLayout = () => {
  const navigate = useNavigate();
  const DOMAIN = "https://student-consultation-nqd.onrender.com";

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
        // Nếu lỗi (ví dụ token hết hạn), có thể xử lý logout hoặc để mặc định
        console.error("Lỗi tải thông tin sinh viên:", e);
        setStudent((prev) => ({ ...prev, fullName: "Sinh viên" }));
      }
    };
    fetchStudentData();
  }, []);

  // 2. HÀM XỬ LÝ ĐĂNG XUẤT
  const handleLogout = (e) => {
    e.stopPropagation();
    const confirm = window.confirm("Bạn có chắc chắn muốn đăng xuất?");
    if (confirm) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  // --- STYLES ---
  const linkStyle = ({ isActive }) => ({
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
    marginBottom: 8,
    borderRadius: 12,
    textDecoration: "none",
    fontSize: "14.5px",
    fontWeight: isActive ? "600" : "500",
    background: isActive
      ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      : "transparent",
    color: isActive ? "white" : "#94a3b8", // Màu chữ khi không active sửa lại cho dễ nhìn hơn
    transition: "all 0.3s ease",
    boxShadow: isActive ? "0 4px 15px rgba(102, 126, 234, 0.4)" : "none",
  });

  const footerStyle = {
    marginTop: "auto", // Đẩy footer xuống đáy
    paddingTop: "20px",
    borderTop: "1px solid rgba(255,255,255,0.08)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px",
    borderRadius: "16px",
    background: "rgba(255, 255, 255, 0.03)",
    transition: "all 0.3s ease",
  };

  const sectionTitleStyle = {
    textTransform: "uppercase",
    marginBottom: 12,
    display: "block",
    fontWeight: "700",
    fontSize: "11px",
    color: "#64748b", // Slate-500
    letterSpacing: "1px",
  };

  const dividerStyle = {
    border: "none",
    height: "1px",
    background:
      "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
    margin: "20px 0",
  };

  const defaultAvatar =
    "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
  const avatarSrc = student.avatar || defaultAvatar;

  return (
    <div style={{ display: "flex", height: "100vh", background: "#f8fafc" }}>
      {/* --- MODERN SIDEBAR --- */}
      <aside
        style={{
          width: 290,
          background: "linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)",
          color: "white",
          padding: "24px 18px",
          display: "flex",
          flexDirection: "column",
          boxShadow: "4px 0 24px rgba(0, 0, 0, 0.12)",
          position: "relative",
          overflow: "hidden",
          zIndex: 10,
        }}
      >
        {/* Decorative gradient overlay */}
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "200px",
            height: "200px",
            background:
              "radial-gradient(circle, rgba(102, 126, 234, 0.15) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        ></div>

        {/* --- HEADER SIDEBAR --- */}
        <h3
          style={{
            marginBottom: "32px",
            fontWeight: "700",
            textAlign: "center",
            fontSize: "22px",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            letterSpacing: "0.5px",
            cursor: "pointer",
          }}
          onClick={() => navigate("/student")}
        >
          Student Portal
        </h3>

        {/* --- MENU ITEMS (SCROLLABLE AREA) --- */}
        <div
          style={{
            flex: 1,
            position: "relative",
            zIndex: 1,
            overflowY: "auto", // Cho phép cuộn nếu menu dài
            paddingRight: "4px", // Tránh thanh cuộn đè nội dung
          }}
          className="custom-scrollbar" // Bạn có thể thêm class css cho thanh cuộn đẹp hơn
        >
          {/* 1. THÔNG TIN */}
          <small style={sectionTitleStyle}>🔔 Thông Tin</small>
          <NavLink to="/student/notifications" style={linkStyle}>
            <span>📢</span>
            <span>Thông báo chung</span>
          </NavLink>

          <hr style={dividerStyle} />

          {/* 2. THỦ TỤC */}
          <small style={sectionTitleStyle}>📚 Thủ Tục</small>
          <NavLink to="/student/procedures/catalog" style={linkStyle}>
            <span>📂</span>
            <span>Danh mục thủ tục</span>
          </NavLink>
          <NavLink to="/student/procedures/create" style={linkStyle}>
            <span>📝</span>
            <span>Tạo yêu cầu thủ tục</span>
          </NavLink>
          <NavLink to="/student/procedures/history" style={linkStyle}>
            <span>🔍</span>
            <span>Xem kết quả hồ sơ</span>
          </NavLink>

          <hr style={dividerStyle} />

          {/* 3. TƯ VẤN & HỖ TRỢ */}
          <small style={sectionTitleStyle}>💡 Tư Vấn & Hỗ Trợ</small>
          <NavLink to="/student/create-request" style={linkStyle}>
            <span>💬</span>
            <span>Tạo yêu cầu tư vấn</span>
          </NavLink>
          <NavLink to="/student/history" style={linkStyle}>
            <span>📋</span>
            <span>Lịch sử tư vấn</span>
          </NavLink>
        </div>

        {/* --- MODERN FOOTER: PROFILE & LOGOUT --- */}
        <div style={footerStyle}>
          <div
            onClick={() => navigate("/student/profile")}
            style={{
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              flex: 1,
              overflow: "hidden",
              transition: "transform 0.2s ease",
            }}
            title="Xem hồ sơ cá nhân"
            onMouseEnter={(e) => (e.currentTarget.style.transform = "translateX(4px)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "translateX(0)")}
          >
            <div style={{ position: "relative" }}>
              <img
                src={avatarSrc}
                alt="Avatar"
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  marginRight: "12px",
                  border: "3px solid rgba(102, 126, 234, 0.6)",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: "2px",
                  right: "12px",
                  width: "12px",
                  height: "12px",
                  background: "#10b981", // Online indicator
                  borderRadius: "50%",
                  border: "2px solid #1a1a2e",
                }}
              ></div>
            </div>
            <div
              style={{
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  fontWeight: "600",
                  fontSize: "14px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  color: "#f1f5f9",
                }}
              >
                {student.fullName}
              </div>
              <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                {student.studentCode || "Sinh viên"}
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Đăng xuất"
            style={{
              background: "rgba(239, 68, 68, 0.15)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: "12px",
              width: "40px",
              height: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#ef4444",
              marginLeft: "12px",
              transition: "all 0.3s ease",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#ef4444";
              e.currentTarget.style.color = "white";
              e.currentTarget.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(239, 68, 68, 0.15)";
              e.currentTarget.style.color = "#ef4444";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path
                fillRule="evenodd"
                d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z"
              />
              <path
                fillRule="evenodd"
                d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"
              />
            </svg>
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main
        style={{
          flex: 1,
          padding: "32px",
          overflowY: "auto",
          background: "#f8fafc",
          position: "relative",
        }}
      >
        <Outlet />
      </main>

      {/* --- CHAT BOT --- */}
      <ChatAssistant />
    </div>
  );
};

export default StudentLayout;