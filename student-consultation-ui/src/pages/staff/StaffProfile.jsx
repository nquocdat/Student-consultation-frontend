import React, { useEffect, useState } from 'react';
import axios from 'axios';

const StaffProfile = () => {
    // ==========================================
    // 1. CẤU HÌNH & STATE
    // ==========================================
    const DOMAIN = "http://localhost:8080";
    
    // API Endpoints cho Staff
    const API_GET_PROFILE = `${DOMAIN}/api/staff/me`; 
    const API_CHANGE_PASS = `${DOMAIN}/api/auth/change-password`;
    const API_UPLOAD_AVATAR = `${DOMAIN}/api/staff/avatar`;

    // State Profile
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);

    // State cho Modal Đổi Mật Khẩu
    const [showModal, setShowModal] = useState(false);
    const [passData, setPassData] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [passError, setPassError] = useState("");

    // ==========================================
    // 2. CÁC HÀM XỬ LÝ (LOGIC)
    // ==========================================

    // --- Lấy thông tin Profile ---
    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                setError("Bạn chưa đăng nhập!");
                setLoading(false); return;
            }
            const response = await axios.get(API_GET_PROFILE, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProfile(response.data);
        } catch (err) {
            console.error(err);
            setError("Lỗi tải thông tin nhân viên.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchProfile(); }, []);

    // --- Xử lý Upload Avatar ---
    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Preview ảnh tạm thời
        setPreviewImage(URL.createObjectURL(file)); 
        const formData = new FormData();
        formData.append("file", file);

        try {
            const token = localStorage.getItem("token");
            const res = await axios.post(API_UPLOAD_AVATAR, formData, {
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }
            });
            
            if (res.data) {
                setProfile(prev => ({ ...prev, avatarUrl: res.data }));
            }
            alert("Cập nhật ảnh đại diện thành công!");
        } catch (err) { 
            alert("Lỗi upload ảnh! " + (err.response?.data || "")); 
        }
    };

    // --- Xử lý Đổi Mật Khẩu ---
    const handlePassInput = (e) => {
        setPassData({ ...passData, [e.target.name]: e.target.value });
    };

    const submitChangePassword = async () => {
        if (!passData.oldPassword || !passData.newPassword || !passData.confirmPassword) {
            setPassError("Vui lòng điền đầy đủ thông tin!"); return;
        }
        if (passData.newPassword !== passData.confirmPassword) {
            setPassError("Mật khẩu xác nhận không khớp!"); return;
        }
        if (passData.newPassword.length < 6) {
            setPassError("Mật khẩu mới phải từ 6 ký tự trở lên!"); return;
        }

        try {
            const token = localStorage.getItem("token");
            await axios.post(API_CHANGE_PASS, {
                oldPassword: passData.oldPassword,
                newPassword: passData.newPassword
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert("Đổi mật khẩu thành công!");
            setShowModal(false);
            setPassData({ oldPassword: "", newPassword: "", confirmPassword: "" });
            setPassError("");
        } catch (err) {
            const msg = err.response?.data || "Đổi mật khẩu thất bại.";
            setPassError(msg);
        }
    };

    // ==========================================
    // 3. RENDER GIAO DIỆN
    // ==========================================
    if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>;
    if (error) return <div className="text-center mt-5 text-danger">{error}</div>;
    if (!profile) return null;

    const defaultAvatar = `https://ui-avatars.com/api/?name=${profile.fullname}&background=random&size=200`;
    const avatarSrc = previewImage || profile.avatarUrl || defaultAvatar;

    return (
        <div className="container mt-4 animate__animated animate__fadeIn">
            <div className="card shadow p-4 border-0 rounded-4">
                <h3 className="text-primary mb-4 text-center fw-bold">
                    👤 Hồ Sơ Nhân Viên
                </h3>
                
                <div className="row">
                    
                    {/* --- CỘT TRÁI: AVATAR & USERNAME --- */}
                    <div className="col-md-4 text-center border-end">
                        <div style={{ position: 'relative', display: 'inline-block' }}>
                            <img 
                                src={avatarSrc} alt="Avatar" 
                                className="img-thumbnail rounded-circle mb-3 shadow-sm"
                                style={{ width: "180px", height: "180px", objectFit: "cover", cursor: "pointer" }}
                                onClick={() => document.getElementById('fileInput').click()}
                            />
                            <input id="fileInput" type="file" style={{ display: "none" }} onChange={handleFileChange} accept="image/*" />
                            
                            <div className="mt-1 text-primary fw-bold" style={{ cursor: "pointer" }} onClick={() => document.getElementById('fileInput').click()}>
                                📸 Đổi ảnh đại diện
                            </div>
                        </div>

                        <h4 className="mt-3 fw-bold">{profile.fullname}</h4>
                        <span className="badge bg-info text-dark px-3 py-2 rounded-pill mt-1">
                            {profile.position || "Nhân viên"}
                        </span>
                        
                        {/* Hiển thị Mã NV */}
                        <p className="text-muted mt-2 small">Mã NV: <span className="fw-bold">{profile.staffCode || profile.username}</span></p>

                        <button className="btn btn-outline-danger mt-3 w-75 rounded-pill shadow-sm" onClick={() => setShowModal(true)}>
                            <i className="bi bi-key-fill me-2"></i>Đổi mật khẩu
                        </button>
                    </div>

                    {/* --- CỘT PHẢI: THÔNG TIN CHI TIẾT --- */}
                    <div className="col-md-8 px-4">
                        <div className="alert alert-light border border-info text-info py-2 small d-flex align-items-center">
                            <i className="bi bi-info-circle-fill me-2"></i>
                            Thông tin cá nhân được quản lý bởi nhà trường.
                        </div>

                        {/* 1. THÔNG TIN CÁ NHÂN */}
                        <h5 className="text-secondary text-uppercase small fw-bold mt-3">Thông tin cá nhân</h5> <hr className="mt-1" />
                        <div className="row mb-3">
                            <div className="col-sm-4 fw-bold text-muted">Ngày sinh:</div>
                            <div className="col-sm-8 fw-medium">{profile.dob || "---"}</div>
                        </div>
                        {/* 🔥 HIỂN THỊ GIỚI TÍNH */}
                        <div className="row mb-3">
                            <div className="col-sm-4 fw-bold text-muted">Giới tính:</div>
                            <div className="col-sm-8 fw-medium">
                                {profile.gender === "NAM" ? "Nam" : (profile.gender === "NU" ? "Nữ" : "---")}
                            </div>
                        </div>
                        <div className="row mb-3">
                            <div className="col-sm-4 fw-bold text-muted">Địa chỉ:</div>
                            <div className="col-sm-8 fw-medium">{profile.address || "---"}</div>
                        </div>

                        {/* 2. LIÊN HỆ */}
                        <h5 className="text-secondary text-uppercase small fw-bold mt-4">Liên hệ</h5> <hr className="mt-1" />
                        <div className="row mb-3">
                            <div className="col-sm-4 fw-bold text-muted">Email công vụ:</div>
                            <div className="col-sm-8 fw-medium">{profile.email}</div>
                        </div>
                        <div className="row mb-3">
                            <div className="col-sm-4 fw-bold text-muted">SĐT Cá nhân:</div>
                            <div className="col-sm-8 fw-medium">{profile.phone || "---"}</div>
                        </div>
                        <div className="row mb-3">
                            <div className="col-sm-4 fw-bold text-muted">SĐT Công việc (Hotline):</div>
                            <div className="col-sm-8 fw-medium text-primary">{profile.workPhone || "---"}</div>
                        </div>

                        {/* 3. CÔNG TÁC */}
                        <h5 className="text-secondary text-uppercase small fw-bold mt-4">Thông tin công tác</h5> <hr className="mt-1" />
                        <div className="row mb-3">
                            <div className="col-sm-4 fw-bold text-muted">Phòng ban:</div>
                            <div className="col-sm-8 fw-bold text-primary">{profile.department}</div>
                        </div>
                        <div className="row mb-3">
                            <div className="col-sm-4 fw-bold text-muted">Văn phòng làm việc:</div>
                            <div className="col-sm-8 fw-medium">{profile.officeLocation || "---"}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL ĐỔI MẬT KHẨU */}
            {showModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div className="bg-white p-4 rounded-4 shadow animate__animated animate__fadeInDown" style={{ width: '400px', maxWidth: '90%' }}>
                        <h4 className="text-center mb-3 text-danger fw-bold">🔒 Đổi Mật Khẩu</h4>
                        
                        {passError && <div className="alert alert-danger p-2 small text-center">{passError}</div>}

                        <div className="mb-3">
                            <label className="form-label fw-bold small">Mật khẩu hiện tại</label>
                            <input type="password" name="oldPassword" className="form-control" value={passData.oldPassword} onChange={handlePassInput} placeholder="••••••" />
                        </div>
                        <div className="mb-3">
                            <label className="form-label fw-bold small">Mật khẩu mới</label>
                            <input type="password" name="newPassword" className="form-control" value={passData.newPassword} onChange={handlePassInput} placeholder="Tối thiểu 6 ký tự" />
                        </div>
                        <div className="mb-3">
                            <label className="form-label fw-bold small">Xác nhận mật khẩu</label>
                            <input type="password" name="confirmPassword" className="form-control" value={passData.confirmPassword} onChange={handlePassInput} placeholder="Nhập lại mật khẩu mới" />
                        </div>

                        <div className="d-flex justify-content-end gap-2 mt-4">
                            <button className="btn btn-light text-secondary fw-bold" onClick={() => {setShowModal(false); setPassError("");}}>Hủy bỏ</button>
                            <button className="btn btn-primary fw-bold px-4" onClick={submitChangePassword}>Xác nhận</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffProfile;