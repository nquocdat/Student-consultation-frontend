import { Outlet, NavLink, useNavigate } from "react-router-dom";
import LecturerHeader from "./LecturerHeader";
import { useState, useEffect } from "react";
import axios from "axios"; // 👈 Nhớ import axios

export default function LecturerLayout() {
    const navigate = useNavigate();

    // State lưu thông tin user
    const [user, setUser] = useState({
        name: "Đang tải...",
        avatar: "",
        role: "Giảng viên"
    });

    // 👇 ĐOẠN LOGIC MỚI: GỌI API LẤY THÔNG TIN THẬT 👇
    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) return;

                // Gọi API /me để lấy thông tin mới nhất
                const response = await axios.get("http://localhost:8080/api/lecturers/me", {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const data = response.data;
                
                setUser({
                    name: data.fullName || "Giảng viên",
                    // Nếu chưa có avatar thì dùng ảnh mặc định
                    avatar: data.avatar || "https://cdn-icons-png.flaticon.com/512/3429/3429522.png",
                    // Hiển thị khoa nếu có
                    role: data.department ? `Khoa ${data.department}` : "Giảng viên"
                });

            } catch (error) {
                console.error("Lỗi tải thông tin sidebar:", error);
                // Nếu lỗi token hết hạn hoặc lỗi mạng, có thể để mặc định hoặc logout tùy ý
            }
        };

        fetchUserInfo();
    }, []); 
    // 👆 KẾT THÚC LOGIC MỚI 👆

    const handleLogout = (e) => {
        e.stopPropagation(); 
        const confirm = window.confirm("Đăng xuất khỏi hệ thống?");
        if (confirm) {
            localStorage.clear();
            navigate("/login");
        }
    };

    const getNavLinkClass = ({ isActive }) => 
        `d-flex align-items-center gap-2 mb-2 px-3 py-2 rounded text-decoration-none transition-all ${
            isActive 
            ? "bg-warning text-dark fw-bold shadow-sm" 
            : "text-white-50 hover-text-white hover-bg-light-opacity"
        }`;

    return (
        <div className="d-flex vh-100 overflow-hidden font-monospace">
            
            {/* === SIDEBAR === */}
            <div 
                className="bg-dark text-white d-flex flex-column shadow-lg" 
                style={{ width: 240, height: "100%", transition: "all 0.3s" }}
            >
                {/* 1. Logo Khu vực */}
                <div className="p-4 pb-2">
                    <h5 className="mb-0 d-flex align-items-center gap-2 text-warning">
                        <span className="fs-3">👨‍🏫</span> 
                        <span className="fw-bold tracking-tight">TEACHER APP</span>
                    </h5>
                    <p className="text-secondary small mt-1 mb-0">Hệ thống quản lý tư vấn</p>
                </div>

                <hr className="border-secondary opacity-50 mx-3" />

                {/* 2. Menu Items */}
<div className="flex-grow-1 overflow-auto px-3 custom-scrollbar">
    <small className="text-uppercase text-secondary fw-bold mb-2 d-block" style={{fontSize: "0.7rem"}}>Menu Chính</small>
    
    <NavLink to="/lecturer/dashboard" className={getNavLinkClass}>
        <span>📊</span> Dashboard
    </NavLink>

    <NavLink to="/lecturer/appointments" className={getNavLinkClass}>
        <span>📅</span> Quản lý lịch hẹn
    </NavLink>

    <NavLink to="/lecturer/schedule" className={getNavLinkClass}>
        <span>🕒</span> Đăng ký lịch làm việc
    </NavLink>

    {/* 👇 MỤC MỚI THÊM VÀO ĐÂY */}
    <NavLink to="/lecturer/free-slots" className={getNavLinkClass}>
        <span>👀</span> Xem giờ còn trống
    </NavLink>

    <NavLink to="/lecturer/history" className={getNavLinkClass}>
        <span>📜</span> Lịch sử tư vấn
    </NavLink>
</div>

                {/* 3. USER PROFILE (DỮ LIỆU THẬT) */}
                <div className="mt-auto p-3 border-top border-secondary border-opacity-25 bg-black bg-opacity-25">
                    <div 
                        className="d-flex align-items-center gap-3 p-2 rounded cursor-pointer hover-bg-light-opacity position-relative group-user"
                        style={{ cursor: "pointer", transition: "0.2s" }}
                        onClick={() => navigate("/lecturer/profile")}
                        title="Xem thông tin cá nhân"
                    >
                        {/* Avatar */}
                        <img 
                            // Nếu avatar rỗng thì dùng ảnh mặc định
                            src={user.avatar || "https://cdn-icons-png.flaticon.com/512/3429/3429522.png"} 
                            alt="User" 
                            className="rounded-circle border border-2 border-warning object-fit-cover"
                            width={45} 
                            height={45}
                        />
                        
                        {/* Tên và Role */}
                        <div className="flex-grow-1 overflow-hidden">
                            <h6 className="mb-0 text-white text-truncate fw-bold" style={{fontSize: "0.95rem"}}>
                                {user.name}
                            </h6>
                            <small className="text-secondary text-truncate d-block" style={{fontSize: "0.75rem"}}>
                                {user.role}
                            </small>
                        </div>

                        {/* Nút Đăng xuất */}
                        <button 
                            onClick={handleLogout}
                            className="btn btn-link text-danger p-0 ms-1 opacity-75 hover-opacity-100"
                            title="Đăng xuất"
                        >
                            <i className="bi bi-box-arrow-right fs-5"></i>
                        </button>
                    </div>
                </div>
            </div>

            {/* === CONTENT AREA === */}
            <div className="flex-grow-1 d-flex flex-column bg-light" style={{ minWidth: 0 }}>
                {/* Header */}
                <div style={{ position: "relative", zIndex: 100 }}>
                    <LecturerHeader simpleMode={true} /> 
                </div>

                {/* Main Content (Đã xóa maxWidth để full màn hình như bạn yêu cầu ở bài trước) */}
                <div className="p-4 flex-grow-1 overflow-auto">
                    <div className="container-fluid h-100 p-0"> 
                        <Outlet />
                    </div>
                </div>
            </div>
        </div>
    );
}