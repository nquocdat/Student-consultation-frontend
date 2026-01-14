import React from 'react';

const StudentProfile = () => {
    // Lấy thông tin fake hoặc từ localStorage để hiển thị
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    return (
        <div className="container mt-4">
            <div className="card shadow p-4">
                <h3 className="text-primary mb-4">👤 Thông tin sinh viên</h3>
                <div className="row">
                    <div className="col-md-3 text-center">
                        <img 
                            src={user.avatar || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} 
                            alt="Avatar" 
                            className="img-thumbnail rounded-circle mb-3"
                            style={{ width: "150px", height: "150px", objectFit:"cover" }}
                        />
                    </div>
                    <div className="col-md-9">
                        <p><strong>Họ và tên:</strong> {user.fullName || "Nguyễn Văn A"}</p>
                        <p><strong>Email:</strong> {user.email || "email@example.com"}</p>
                        <p><strong>Mã sinh viên:</strong> {user.username || "SV001"}</p>
                        <p><strong>Lớp:</strong> KTPM01</p>
                        <button className="btn btn-warning mt-3">✏️ Chỉnh sửa thông tin</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentProfile;