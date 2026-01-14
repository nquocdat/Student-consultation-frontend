import { Outlet, NavLink } from "react-router-dom";

const StudentLayout = () => {
  // Style cho các link hoạt động (Tư vấn)
  const linkStyle = ({ isActive }) => ({
    display: "block",
    padding: "10px 12px",
    marginBottom: 6,
    borderRadius: 4,
    color: "white",
    textDecoration: "none",
    background: isActive ? "#146b25" : "transparent", // Màu khi active
    transition: "background 0.3s",
    border: "1px solid rgba(255,255,255,0.1)"
  });

  // Style cho các mục TĨNH (Thủ tục - chưa dùng)
  const staticItemStyle = {
    padding: "10px 12px",
    marginBottom: 6,
    color: "rgba(255, 255, 255, 0.7)", // Làm mờ đi một chút để phân biệt
    cursor: "default", // Không hiện bàn tay bấm
    display: "flex",
    alignItems: "center",
    gap: "10px"
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* --- SIDEBAR --- */}
      <aside
        style={{
          width: 280, // Tăng độ rộng chút cho thoáng
          background: "#1b8c2f",
          color: "white",
          padding: "20px 15px",
          display: "flex",
          flexDirection: "column"
        }}
      >
        <h3 className="mb-4 fw-bold text-center">For Students</h3>

        {/* ========================================= */}
        {/* PHẦN 1: THỦ TỤC HÀNH CHÍNH (CHƯA DÙNG)    */}
        {/* ========================================= */}
        <small style={{ textTransform: "uppercase", opacity: 0.8, marginBottom: 10, display:"block", fontWeight: "bold", fontSize: "12px", color: "#a8e6cf" }}>
            Góc làm thủ tục
        </small>
        <div className="mb-2">
            <div style={staticItemStyle}>
                📂 Danh mục thủ tục
            </div>
            <div style={staticItemStyle}>
                📝 Tạo yêu cầu thủ tục
            </div>
            <div style={staticItemStyle}>
                🔍 Xem kết quả xử lý hồ sơ
            </div>
        </div>

        {/* Đường kẻ phân cách */}
        <hr style={{ borderColor: "rgba(255,255,255,0.4)", margin: "10px 0 20px 0" }} />
        
        {/* ========================================= */}
        {/* PHẦN 2: HỆ THỐNG TƯ VẤN (HOẠT ĐỘNG)       */}
        {/* ========================================= */}
        <small style={{ textTransform: "uppercase", opacity: 0.8, marginBottom: 10, display:"block", fontWeight: "bold", fontSize: "12px", color: "#a8e6cf" }}>
            Góc tư vấn & Hỗ trợ
        </small>

        {/* 1. Link TẠO YÊU CẦU TƯ VẤN */}
        <NavLink to="/student/create-request" style={linkStyle}>
          💬 Tạo yêu cầu tư vấn
        </NavLink>

        {/* 2. Link LỊCH SỬ TƯ VẤN */}
        <NavLink to="/student/history" style={linkStyle}>
          📋 Lịch sử tư vấn
        </NavLink>

      </aside>

      {/* --- MAIN CONTENT --- */}
      <main style={{ flex: 1, padding: 20, overflowY: "auto", background: "#f8f9fa" }}>
        <Outlet />
      </main>
    </div>
  );
};

export default StudentLayout;