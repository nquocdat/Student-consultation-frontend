import React, { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import StaffSidebar from "./StaffSidebar";

export default function StaffLayout() {
    const navigate = useNavigate();

    // Kiểm tra bảo mật cơ bản: Nếu không có token thì đá về Login
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
        }
    }, [navigate]);

    return (
        <div className="d-flex min-vh-100 bg-light">
            {/* 1. Sidebar cố định bên trái */}
            <StaffSidebar />

            {/* 2. Nội dung chính thay đổi (Outlet) */}
            <div className="flex-grow-1 p-4" style={{ overflowY: "auto", height: "100vh" }}>
                <Outlet />
            </div>
        </div>
    );
}