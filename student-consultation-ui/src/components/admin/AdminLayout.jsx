import React from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar"; // Import Sidebar cùng thư mục

const AdminLayout = () => {
    return (
        <div className="d-flex">
            {/* Sidebar nằm cố định bên trái */}
            <AdminSidebar />
            
            {/* Phần nội dung chính thay đổi theo từng trang */}
            <div className="flex-grow-1 bg-light vh-100 overflow-auto">
                <Outlet />
            </div>
        </div>
    );
};

export default AdminLayout;