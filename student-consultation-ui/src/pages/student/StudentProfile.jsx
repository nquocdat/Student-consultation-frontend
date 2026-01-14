import React, { useEffect, useState } from 'react';
import axios from 'axios';

const StudentProfile = () => {
    // 1. State để lưu dữ liệu từ API
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 2. Gọi API ngay khi trang được tải (Mount)
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                // Lấy token từ localStorage
                const token = localStorage.getItem("token");
                if (!token) {
                    setError("Bạn chưa đăng nhập!");
                    setLoading(false);
                    return;
                }

                // Gọi API Backend
                const response = await axios.get("http://localhost:8080/api/students/me", {
                    headers: {
                        Authorization: `Bearer ${token}` // Gửi kèm token xác thực
                    }
                });

                setProfile(response.data); // Lưu dữ liệu vào state
            } catch (err) {
                console.error("Lỗi tải thông tin:", err);
                setError("Không thể tải thông tin cá nhân.");
            } finally {
                setLoading(false); // Tắt trạng thái loading
            }
        };

        fetchProfile();
    }, []);

    // 3. Hiển thị khi đang tải hoặc lỗi
    if (loading) return <div className="text-center mt-5">Loading...</div>;
    if (error) return <div className="text-center mt-5 text-danger">{error}</div>;
    if (!profile) return null;

    return (
        <div className="container mt-4">
            <div className="card shadow p-4">
                <h3 className="text-primary mb-4 text-center">👤 Hồ Sơ Sinh Viên</h3>
                <div className="row">
                    {/* Cột trái: Avatar */}
                    <div className="col-md-4 text-center border-end">
                        <img 
                            src={profile.avatar || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} 
                            alt="Avatar" 
                            className="img-thumbnail rounded-circle mb-3"
                            style={{ width: "180px", height: "180px", objectFit:"cover" }}
                        />
                        <h4 className="mt-2">{profile.fullName}</h4>
                        <p className="text-muted">{profile.studentCode}</p>
                        <button className="btn btn-warning mt-3 w-75">✏️ Chỉnh sửa hồ sơ</button>
                    </div>

                    {/* Cột phải: Thông tin chi tiết */}
                    <div className="col-md-8 px-4">
                        <h5 className="mb-3 text-secondary">Thông tin cơ bản</h5>
                        <hr />
                        
                        <div className="row mb-3">
                            <div className="col-sm-4 fw-bold">Email:</div>
                            <div className="col-sm-8">{profile.email}</div>
                        </div>

                        <div className="row mb-3">
                            <div className="col-sm-4 fw-bold">Ngày sinh:</div>
                            <div className="col-sm-8">{profile.dob || "Chưa cập nhật"}</div>
                        </div>

                        <div className="row mb-3">
                            <div className="col-sm-4 fw-bold">Giới tính:</div>
                            <div className="col-sm-8">{profile.gender || "Chưa cập nhật"}</div>
                        </div>

                        <div className="row mb-3">
                            <div className="col-sm-4 fw-bold">Số điện thoại:</div>
                            <div className="col-sm-8">{profile.phone || "Chưa cập nhật"}</div>
                        </div>

                        <div className="row mb-3">
                            <div className="col-sm-4 fw-bold">Địa chỉ:</div>
                            <div className="col-sm-8">{profile.address || "Chưa cập nhật"}</div>
                        </div>

                        <h5 className="mb-3 mt-4 text-secondary">Thông tin học tập</h5>
                        <hr />

                        <div className="row mb-3">
                            <div className="col-sm-4 fw-bold">Lớp hành chính:</div>
                            <div className="col-sm-8">{profile.className || "N/A"}</div>
                        </div>

                        <div className="row mb-3">
                            <div className="col-sm-4 fw-bold">Chuyên ngành:</div>
                            <div className="col-sm-8">{profile.major || "N/A"}</div>
                        </div>

                        <div className="row mb-3">
                            <div className="col-sm-4 fw-bold">Niên khóa:</div>
                            <div className="col-sm-8">{profile.course || "N/A"}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentProfile;