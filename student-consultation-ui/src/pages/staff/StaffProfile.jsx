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
            // Gọi API Upload
            const res = await axios.post(API_UPLOAD_AVATAR, formData, {
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }
            });
            
            // Cập nhật lại avatarUrl nếu backend trả về base64
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
        // Validate
        if (!passData.oldPassword || !passData.newPassword || !passData.confirmPassword) {
            setPassError("Vui lòng điền đầy đủ thông tin!"); return;
        }
        if (passData.newPassword !== passData.confirmPassword) {
            setPassError("Mật khẩu xác nhận không khớp!"); return;
        }
        if (passData.newPassword.length < 6) {
            setPassError("Mật khẩu mới phải từ 6 ký tự trở lên!"); return;
        }

        // Call API
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

    // Ảnh mặc định
    const defaultAvatar = `https://ui-avatars.com/api/?name=${profile.fullname}&background=random&size=200`;
    const avatarSrc = previewImage || profile.avatarUrl || defaultAvatar;

    return (
        <div className="container mt-4 animate__animated animate__fadeIn">
            <div className="card shadow p-4" style={{borderRadius: "15px"}}>
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
                            
                            {/* Input file ẩn */}
                            <input id="fileInput" type="file" style={{ display: "none" }} onChange={handleFileChange} accept="image/*" />
                            
                            {/* Nút đổi Avatar */}
                            <button 
                                className="btn btn-sm btn-light border w-100 mt-1 fw-bold text-primary"
                                onClick={() => document.getElementById('fileInput').click()}
                            >
                                📸 Đổi ảnh đại diện
                            </button>
                        </div>

                        <h4 className="mt-3 fw-bold">{profile.fullname}</h4>
                        
                        {/* Hiển thị Username (Mã NV) */}
                        <p className="text-muted fw-bold">{profile.staffCode}</p>

                        <button className="btn btn-outline-danger mt-2 w-75 rounded-pill" onClick={() => setShowModal(true)}>
                            <i className="bi bi-key-fill me-2"></i>Đổi mật khẩu
                        </button>
                    </div>

                    {/* --- CỘT PHẢI: THÔNG TIN CHI TIẾT --- */}
                    <div className="col-md-8 px-4">
                        <div className="alert alert-info py-2 small">
                            <i className="bi bi-info-circle me-2"></i>
                            Thông tin cá nhân được quản lý bởi nhà trường.
                        </div>

                        <h5 className="text-secondary text-uppercase small fw-bold mt-3">Thông tin liên hệ</h5> <hr />
                        <div className="row mb-3">
                            <div className="col-sm-4 fw-bold text-muted">Email công vụ:</div>
                            <div className="col-sm-8">{profile.email}</div>
                        </div>
                        <div className="row mb-3">
                            <div className="col-sm-4 fw-bold text-muted">SĐT công việc:</div>
                            <div className="col-sm-8">{profile.workPhone || "-- Chưa cập nhật --"}</div>
                        </div>
                        
                        <h5 className="text-secondary text-uppercase small fw-bold mt-4">Thông tin công tác</h5> <hr />
                        <div className="row mb-3">
                            <div className="col-sm-4 fw-bold text-muted">Phòng ban / Khoa:</div>
                            <div className="col-sm-8 fw-bold text-primary">{profile.department}</div>
                        </div>
                        <div className="row mb-3">
                            <div className="col-sm-4 fw-bold text-muted">Chức vụ:</div>
                            <div className="col-sm-8">{profile.position || "Nhân viên"}</div>
                        </div>
                        <div className="row mb-3">
                            <div className="col-sm-4 fw-bold text-muted">Văn phòng:</div>
                            <div className="col-sm-8">{profile.officeLocation || "--"}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ========================================== */}
            {/* MODAL ĐỔI MẬT KHẨU                         */}
            {/* ========================================== */}
            {showModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div className="bg-white p-4 rounded shadow animate__animated animate__fadeInDown" style={{ width: '400px', maxWidth: '90%' }}>
                        <h4 className="text-center mb-3 text-danger fw-bold">🔒 Đổi Mật Khẩu</h4>
                        
                        {passError && <div className="alert alert-danger p-2 small">{passError}</div>}

                        <div className="mb-3">
                            <label className="form-label fw-bold small">Mật khẩu hiện tại</label>
                            <input 
                                type="password" name="oldPassword" className="form-control" 
                                value={passData.oldPassword} onChange={handlePassInput} 
                                placeholder="••••••"
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label fw-bold small">Mật khẩu mới</label>
                            <input 
                                type="password" name="newPassword" className="form-control" 
                                value={passData.newPassword} onChange={handlePassInput} 
                                placeholder="Tối thiểu 8 ký tự"
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label fw-bold small">Xác nhận mật khẩu mới</label>
                            <input 
                                type="password" name="confirmPassword" className="form-control" 
                                value={passData.confirmPassword} onChange={handlePassInput} 
                                placeholder="Nhập lại mật khẩu mới"
                            />
                        </div>

                        <div className="d-flex justify-content-end gap-2 mt-4">
                            <button className="btn btn-secondary" onClick={() => {setShowModal(false); setPassError("");}}>
                                Hủy bỏ
                            </button>
                            <button className="btn btn-primary" onClick={submitChangePassword}>
                                Xác nhận đổi
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffProfile;