import { Outlet, NavLink, useNavigate } from "react-router-dom";
import LecturerHeader from "./LecturerHeader";
import { useState, useEffect } from "react";
import axios from "axios";

export default function LecturerLayout() {
    const navigate = useNavigate();

    // State lưu thông tin user
    const [user, setUser] = useState({
        name: "Đang tải...",
        avatar: "",
        role: "Giảng viên"
    });

    // --- GỌI API LẤY THÔNG TIN USER ---
    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) return;

                const response = await axios.get("http://localhost:8080/api/lecturers/me", {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const data = response.data;
                setUser({
                    name: data.fullName || "Giảng viên",
                    avatar: data.avatar || "https://cdn-icons-png.flaticon.com/512/3429/3429522.png",
                    role: data.department ? `Khoa ${data.department}` : "Giảng viên"
                });

            } catch (error) {
                console.error("Lỗi tải thông tin:", error);
            }
        };

        fetchUserInfo();
    }, []);

    // --- XỬ LÝ ĐĂNG XUẤT ---
    const handleLogout = (e) => {
        e.stopPropagation(); 
        const confirm = window.confirm("Đăng xuất khỏi hệ thống?");
        if (confirm) {
            localStorage.clear();
            navigate("/login");
        }
    };

    // --- STYLE CHO LINK MENU ---
    const linkStyle = ({ isActive }) => ({
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "10px 14px",
        marginBottom: "6px",
        borderRadius: "8px",
        textDecoration: "none",
        color: isActive ? "#ffffff" : "#94a3b8", // Active: Trắng, Inactive: Xám
        backgroundColor: isActive ? "rgba(255, 255, 255, 0.1)" : "transparent", // Active: Nền mờ
        borderLeft: isActive ? "3px solid #facc15" : "3px solid transparent", // Active: Viền vàng
        transition: "all 0.2s ease",
        fontSize: "14px",
        fontWeight: isActive ? "600" : "500"
    });

    return (
        <div className="d-flex vh-100 overflow-hidden" style={{ fontFamily: "'Inter', sans-serif", backgroundColor: "#f8f9fa" }}>
            
            {/* ================= SIDEBAR ================= */}
            <div 
                className="d-flex flex-column" 
                style={{ 
                    width: 260, 
                    height: "100%", 
                    background: "#0f172a", // Màu xanh đen hiện đại (Slate-900)
                    color: "white",
                    boxShadow: "4px 0 24px rgba(0,0,0,0.1)",
                    zIndex: 10
                }}
            >
                {/* 1. LOGO AREA */}
                <div className="p-4 d-flex align-items-center gap-3">
                    <div style={{
                        width: 40, height: 40, 
                        background: "linear-gradient(135deg, #facc15, #ca8a04)", 
                        borderRadius: "10px",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        boxShadow: "0 4px 12px rgba(250, 204, 21, 0.3)"
                    }}>
                        <span style={{ fontSize: "20px" }}>👨‍🏫</span>
                    </div>
                    <div>
                        <h6 className="m-0 fw-bold text-white" style={{ letterSpacing: "0.5px" }}>TEACHER APP</h6>
                        <small style={{ color: "#94a3b8", fontSize: "11px" }}>Quản lý tư vấn</small>
                    </div>
                </div>

                {/* 2. MENU ITEMS */}
                <div className="flex-grow-1 overflow-auto px-3 py-2 custom-scrollbar">
                    
                    {/* -- Nhóm: Thông tin -- */}
                    <small style={{ 
                        textTransform: "uppercase", 
                        marginBottom: 12, display: "block", 
                        fontWeight: "700", fontSize: "11px", color: "#64748b", letterSpacing: "1px"
                    }}>
                        🔔 Thông Tin
                    </small>

                    <NavLink to="/lecturer/notifications" style={linkStyle}>
                        <span>📢</span> <span>Thông báo chung</span>
                    </NavLink>

                    <div className="my-3 border-top border-secondary opacity-25"></div>

                    {/* -- Nhóm: Quản lý -- */}
                    <small style={{ 
                        textTransform: "uppercase", 
                        marginBottom: 12, display: "block", 
                        fontWeight: "700", fontSize: "11px", color: "#64748b", letterSpacing: "1px"
                    }}>
                        📊 Quản Lý
                    </small>

                    <NavLink to="/lecturer/dashboard" style={linkStyle}>
                        <span>🏠</span> <span>Dashboard</span>
                    </NavLink>

                    <NavLink to="/lecturer/appointments" style={linkStyle}>
                        <span>📅</span> <span>Lịch hẹn tư vấn</span>
                    </NavLink>

                    <NavLink to="/lecturer/schedule" style={linkStyle}>
                        <span>🕒</span> <span>Đăng ký lịch làm việc</span>
                    </NavLink>

                    <div className="my-3 border-top border-secondary opacity-25"></div>

                    {/* -- Nhóm: Báo cáo -- */}
                    <small style={{ 
                        textTransform: "uppercase", 
                        marginBottom: 12, display: "block", 
                        fontWeight: "700", fontSize: "11px", color: "#64748b", letterSpacing: "1px"
                    }}>
                        📈 Báo Cáo
                    </small>

                    <NavLink to="/lecturer/statistics" style={linkStyle}>
                        <span>📉</span> <span>Thống kê</span>
                    </NavLink>

                </div>

                {/* 3. USER PROFILE (FOOTER) */}
                <div className="p-3 mt-auto" style={{ background: "rgba(0,0,0,0.2)" }}>
                    <div 
                        className="d-flex align-items-center gap-3 p-2 rounded cursor-pointer profile-hover"
                        style={{ transition: "all 0.2s" }}
                        onClick={() => navigate("/lecturer/profile")}
                    >
                        <img 
                            src={user.avatar || "https://cdn-icons-png.flaticon.com/512/3429/3429522.png"} 
                            alt="User" 
                            className="rounded-circle border border-2 border-warning"
                            style={{ width: 42, height: 42, objectFit: "cover" }}
                        />
                        <div className="flex-grow-1 overflow-hidden">
                            <h6 className="mb-0 text-white text-truncate fw-bold" style={{ fontSize: "14px" }}>
                                {user.name}
                            </h6>
                            <small className="text-secondary d-block text-truncate" style={{ fontSize: "11px" }}>
                                {user.role}
                            </small>
                        </div>
                        <button 
                            onClick={handleLogout}
                            className="btn btn-link text-danger p-0 opacity-75 hover-opacity-100"
                            title="Đăng xuất"
                        >
                            <i className="bi bi-box-arrow-right fs-5"></i>
                        </button>
                    </div>
                </div>
            </div>

            {/* ================= MAIN CONTENT ================= */}
            <div className="flex-grow-1 d-flex flex-column" style={{ minWidth: 0, height: "100vh", overflow: "hidden" }}>
                
                {/* Header */}
                <div style={{ 
                    position: "sticky", top: 0, zIndex: 100, 
                    backgroundColor: "rgba(255, 255, 255, 0.9)", 
                    backdropFilter: "blur(10px)",
                    borderBottom: "1px solid #e2e8f0"
                }}>
                    <LecturerHeader simpleMode={true} /> 
                </div>

                {/* Body Content */}
                <div className="p-4 flex-grow-1 overflow-auto custom-scrollbar bg-light">
                    <div className="container-fluid h-100 p-0 fade-in-up"> 
                        <Outlet />
                    </div>
                </div>
            </div>

            {/* CSS INLINE CHO HIỆU ỨNG */}
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(255,255,255,0.1); border-radius: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                
                .profile-hover:hover { background-color: rgba(255,255,255,0.05); }
                
                .fade-in-up {
                    animation: fadeInUp 0.4s ease-out forwards;
                }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}