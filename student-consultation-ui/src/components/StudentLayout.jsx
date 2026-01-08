import { Outlet, NavLink } from "react-router-dom";

const StudentLayout = () => {
  const linkStyle = ({ isActive }) => ({
    display: "block",
    padding: "8px 12px",
    marginBottom: 6,
    borderRadius: 4,
    color: "white",
    textDecoration: "none",
    background: isActive ? "#146b25" : "transparent",
  });

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <aside
        style={{
          width: 260,
          background: "#1b8c2f",
          color: "white",
          padding: 20,
        }}
      >
        <h3>For Students</h3>

        {/* CÁC MỤC CŨ – GIỮ NGUYÊN */}
        <p>Danh mục thủ tục</p>
        <p>Tạo yêu cầu tư vấn</p>
        <p>Xem kết quả xử lý</p>

        <hr style={{ borderColor: "rgba(255,255,255,0.3)" }} />

        {/* MỤC MỚI */}
        <NavLink to="/student/consultation" style={linkStyle}>
          💬 Tư vấn hỗ trợ
        </NavLink>
      </aside>

      <main style={{ flex: 1, padding: 20 }}>
        <Outlet />
      </main>
    </div>
  );
};

export default StudentLayout;
