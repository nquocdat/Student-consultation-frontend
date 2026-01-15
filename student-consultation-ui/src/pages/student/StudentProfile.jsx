import React, { useEffect, useState } from 'react';
import axios from 'axios';

const StudentProfile = () => {
    // 1. State
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [previewImage, setPreviewImage] = useState(null); // Để xem trước ảnh

    const DOMAIN = "http://localhost:8080";

    // 2. Lấy thông tin Profile
    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                setError("Bạn chưa đăng nhập!");
                setLoading(false);
                return;
            }

            const response = await axios.get(`${DOMAIN}/api/students/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setProfile(response.data);
        } catch (err) {
            console.error("Lỗi tải thông tin:", err);
            setError("Không thể tải thông tin cá nhân.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    // 3. Xử lý Upload Avatar (Được phép)
    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setPreviewImage(URL.createObjectURL(file)); // Hiện ảnh xem trước

        const formData = new FormData();
        formData.append("file", file);

        try {
            const token = localStorage.getItem("token");
            await axios.post(`${DOMAIN}/api/students/avatar`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            });
            alert("Cập nhật ảnh đại diện thành công!");
            fetchProfile(); // Load lại để lấy link ảnh chuẩn từ server
        } catch (err) {
            console.error("Lỗi upload:", err);
            alert("Lỗi khi cập nhật ảnh đại diện!");
        }
    };

    // 4. Xử lý Đổi mật khẩu (Được phép)
    const handleChangePassword = () => {
        // Chỗ này bạn sẽ điều hướng sang trang đổi pass hoặc mở Modal
        // Ví dụ: navigate('/change-password')
        alert("Tính năng đổi mật khẩu sẽ hiện Modal hoặc chuyển trang tại đây!");
    };

    // --- RENDER ---
    if (loading) return <div className="text-center mt-5">Loading...</div>;
    if (error) return <div className="text-center mt-5 text-danger">{error}</div>;
    if (!profile) return null;

    const defaultAvatar = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
    const avatarSrc = previewImage || (profile.avatar ? `${DOMAIN}${profile.avatar}` : defaultAvatar);

    return (
        <div className="container mt-4">
            <div className="card shadow p-4">
                <h3 className="text-primary mb-4 text-center">👤 Hồ Sơ Sinh Viên</h3>
                <div className="row">
                    
                    {/* --- CỘT TRÁI: AVATAR & ĐỔI MẬT KHẨU --- */}
                    <div className="col-md-4 text-center border-end">
                        <div style={{ position: 'relative', display: 'inline-block' }}>
                            <img 
                                src={avatarSrc} 
                                alt="Avatar" 
                                className="img-thumbnail rounded-circle mb-3"
                                style={{ width: "180px", height: "180px", objectFit: "cover", cursor: "pointer" }}
                                onClick={() => document.getElementById('fileInput').click()}
                                title="Bấm để đổi ảnh đại diện"
                            />
                            
                            <input 
                                id="fileInput" 
                                type="file" 
                                style={{ display: "none" }} 
                                onChange={handleFileChange} 
                                accept="image/*"
                            />

                            <div 
                                className="mt-1 text-primary" 
                                style={{ cursor: "pointer", fontSize: "0.9rem", fontWeight: "bold" }}
                                onClick={() => document.getElementById('fileInput').click()}
                            >
                                📸 Đổi ảnh đại diện
                            </div>
                        </div>

                        <h4 className="mt-3">{profile.fullName}</h4>
                        <p className="text-muted">{profile.studentCode}</p>

                        {/* Thay nút "Chỉnh sửa hồ sơ" thành nút "Đổi mật khẩu" */}
                        <button 
                            className="btn btn-outline-danger mt-3 w-75"
                            onClick={handleChangePassword}
                        >
                            🔒 Đổi mật khẩu
                        </button>
                    </div>

                    {/* --- CỘT PHẢI: CHỈ HIỂN THỊ THÔNG TIN (READ-ONLY) --- */}
                    <div className="col-md-8 px-4">
                        <div className="alert alert-info py-2" style={{fontSize: '0.9rem'}}>
                            ℹ️ Thông tin cá nhân được quản lý bởi nhà trường. Nếu có sai sót, vui lòng liên hệ phòng đào tạo.
                        </div>

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