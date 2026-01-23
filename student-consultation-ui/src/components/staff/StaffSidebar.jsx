import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios"; // Nhớ import axios

export default function StaffSidebar() {
    const navigate = useNavigate();
    const DOMAIN = "http://localhost:8080";

    // State lưu thông tin người dùng trên Sidebar
    const [currentUser, setCurrentUser] = useState({
        fullname: "Đang tải...",
        staffCode: "...",
        avatarUrl: null,
        department: "Nhân viên"
    });

    // --- LẤY THÔNG TIN NGƯỜI DÙNG THẬT ---
    useEffect(() => {
        const fetchMe = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) return;

                // Gọi nhẹ API /me để lấy tên và avatar hiển thị lên Sidebar
                const res = await axios.get(`${DOMAIN}/api/staff/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setCurrentUser(res.data);
            } catch (err) {
                console.error("Lỗi tải thông tin sidebar:", err);
                // Nếu lỗi thì kệ, giữ nguyên default hoặc xử lý tùy ý
            }
        };
        fetchMe();
    }, []);

    const handleLogout = () => {
        if (window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            navigate("/login");
        }
    };

    const handleViewProfile = () => {
        navigate("/staff/profile");
    };

    // --- XỬ LÝ ẢNH ĐẠI DIỆN ---
    const defaultAvatar = `https://ui-avatars.com/api/?name=${currentUser.fullname}&background=random&color=fff&size=128`;
    const avatarSrc = currentUser.avatarUrl || defaultAvatar;

    // --- STYLE TÙY CHỈNH ---
    const styles = {
        sidebar: {
            width: "280px",
            background: "linear-gradient(180deg, #1a2a6c 0%, #b21f1f 100%)", 
            color: "#fff",
            boxShadow: "4px 0 10px rgba(0,0,0,0.1)",
            transition: "all 0.3s",
        },
        navLink: {
            borderRadius: "8px",
            padding: "12px 16px",
            marginBottom: "8px",
            fontWeight: "500",
            display: "flex",
            alignItems: "center",
            color: "rgba(255, 255, 255, 0.7)",
            transition: "all 0.2s",
        },
        activeLink: {
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            color: "#fff",
            fontWeight: "bold",
            borderLeft: "4px solid #fff",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
        },
        userCard: {
            background: "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(10px)",
            borderRadius: "12px",
            padding: "10px",
            cursor: "pointer",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            transition: "background 0.3s",
        }
    };

    return (
        <div className="d-flex flex-column flex-shrink-0 p-3 vh-100" style={styles.sidebar}>
            {/* --- HEADER --- */}
            <div className="d-flex align-items-center mb-4 px-2 text-decoration-none text-white">
                <div className="bg-white text-primary rounded-3 d-flex align-items-center justify-content-center me-3 shadow" style={{width: "40px", height: "40px"}}>
                    <i className="bi bi-shield-lock-fill fs-5"></i>
                </div>
                <div>
                    <h5 className="mb-0 fw-bold">Staff Portal</h5>
                    <small className="text-white-50" style={{fontSize: "0.75rem"}}>Hệ thống quản lý</small>
                </div>
            </div>

            <hr className="bg-white opacity-25 my-2" />

            {/* --- MENU LIST --- */}
            <ul className="nav flex-column mb-auto mt-3">
                <li className="nav-item">
                    <NavLink 
                        to="/staff/procedures" 
                        className={({ isActive }) => isActive ? "nav-link active-nav" : "nav-link"}
                        style={({ isActive }) => isActive ? {...styles.navLink, ...styles.activeLink} : styles.navLink}
                    >
                        <i className="bi bi-kanban me-3 fs-5"></i>
                        <span>Quản lý thủ tục</span>
                    </NavLink>
                </li>
                
                <li className="nav-item">
                    <NavLink 
                        to="/staff/schedule" 
                        className="nav-link"
                        style={{...styles.navLink, opacity: 0.5, cursor: "not-allowed"}}
                    >
                        <i className="bi bi-calendar-check me-3 fs-5"></i>
                        <span>Lịch công tác <span className="badge bg-warning text-dark ms-2" style={{fontSize: "0.6rem"}}>Sắp có</span></span>
                    </NavLink>
                </li>
            </ul>

            {/* --- FOOTER (USER INFO ĐỘNG) --- */}
            <div className="mt-auto">
                <div 
                    className="d-flex align-items-center justify-content-between user-card-hover" 
                    style={styles.userCard}
                >
                    {/* Click vào khu vực này để xem Profile */}
                    <div 
                        className="d-flex align-items-center flex-grow-1 me-2" 
                        onClick={handleViewProfile}
                        title="Xem thông tin cá nhân"
                    >
                        <img 
                            src={avatarSrc} 
                            alt="Avatar" 
                            width="40" 
                            height="40" 
                            className="rounded-circle me-2 border border-2 border-white shadow-sm"
                            style={{objectFit: "cover"}} 
                        />
                        <div style={{lineHeight: "1.2", overflow: "hidden"}}>
                            {/* Tên thật từ API */}
                            <strong className="d-block text-white text-truncate" style={{fontSize: "0.9rem", maxWidth: "120px"}}>
                                {currentUser.fullname}
                            </strong>
                            {/* Mã nhân viên từ API */}
                            <small className="text-white-50" style={{fontSize: "0.75rem"}}>
                                {currentUser.staffCode}
                            </small>
                        </div>
                    </div>

                    {/* Nút Đăng xuất (Đã sửa icon) */}
                    <button 
                        onClick={handleLogout} 
                        className="btn btn-outline-light border-0 rounded-circle d-flex align-items-center justify-content-center"
                        style={{width: "35px", height: "35px", background: "rgba(255,255,255,0.1)"}}
                        title="Đăng xuất"
                    >
                        {/* Icon Logout chuẩn: Cánh cửa có mũi tên đi ra */}
                        <i className="bi bi-box-arrow-right text-white"></i>
                    </button>
                </div>
            </div>

            {/* Hiệu ứng Hover */}
            <style>
                {`
                    .user-card-hover:hover {
                        background: rgba(255, 255, 255, 0.2) !important;
                    }
                `}
            </style>
        </div>
    );
}