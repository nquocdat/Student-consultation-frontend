import React, { useEffect, useState } from 'react';
import axios from 'axios';

const StudentProfile = () => {
    // ==========================================
    // 1. CẤU HÌNH & STATE
    // ==========================================
    const DOMAIN = "https://student-consultation-nqd.onrender.com";
    // ⚠️ BẠN KIỂM TRA LẠI ĐƯỜNG DẪN API NÀY CHO KHỚP VỚI CONTROLLER NHÉ
    const API_CHANGE_PASS = `${DOMAIN}/api/auth/change-password`; 

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
            const response = await axios.get(`${DOMAIN}/api/students/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProfile(response.data);
        } catch (err) {
            console.error(err);
            setError("Lỗi tải thông tin.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchProfile(); }, []);

    // --- Xử lý Upload Avatar ---
    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setPreviewImage(URL.createObjectURL(file)); 
        const formData = new FormData();
        formData.append("file", file);

        try {
            const token = localStorage.getItem("token");
            await axios.post(`${DOMAIN}/api/students/avatar`, formData, {
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }
            });
            alert("Cập nhật ảnh thành công!");
            fetchProfile(); // Load lại để lấy ảnh mới nhất từ DB
        } catch (err) { alert("Lỗi upload ảnh!"); }
    };

    // --- Xử lý Đổi Mật Khẩu ---
    const handlePassInput = (e) => {
        setPassData({ ...passData, [e.target.name]: e.target.value });
    };

    const submitChangePassword = async () => {
        // 1. Validate Client
        if (!passData.oldPassword || !passData.newPassword || !passData.confirmPassword) {
            setPassError("Vui lòng điền đầy đủ thông tin!");
            return;
        }
        if (passData.newPassword !== passData.confirmPassword) {
            setPassError("Mật khẩu xác nhận không khớp!");
            return;
        }
        if (passData.newPassword.length < 6) {
            setPassError("Mật khẩu mới phải từ 6 ký tự trở lên!");
            return;
        }

        // 2. Gọi API
        try {
            const token = localStorage.getItem("token");
            
            // Body gửi đi phải khớp với DTO ChangePasswordRequest bên Java
            const payload = {
                oldPassword: passData.oldPassword,
                newPassword: passData.newPassword
            };

            await axios.post(API_CHANGE_PASS, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // 3. Thành công
            alert("Đổi mật khẩu thành công!");
            setShowModal(false); // Tắt modal
            setPassData({ oldPassword: "", newPassword: "", confirmPassword: "" }); // Reset form
            setPassError("");

        } catch (err) {
            // Lấy lỗi từ Backend trả về (dòng return ResponseEntity.badRequest...)
            const msg = err.response?.data || "Đổi mật khẩu thất bại.";
            setPassError(msg);
        }
    };

    // ==========================================
    // 3. RENDER GIAO DIỆN
    // ==========================================
    if (loading) return <div className="text-center mt-5">Loading...</div>;
    if (error) return <div className="text-center mt-5 text-danger">{error}</div>;
    if (!profile) return null;

    const defaultAvatar = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
    // Hiển thị ảnh Base64 từ DB
    const avatarSrc = previewImage || profile.avatar || defaultAvatar;

    return (
        <div className="container mt-4">
            <div className="card shadow p-4">
                <h3 className="text-primary mb-4 text-center">👤 Hồ Sơ Sinh Viên</h3>
                <div className="row">
                    
                    {/* --- CỘT TRÁI: AVATAR & NÚT --- */}
                    <div className="col-md-4 text-center border-end">
                        <div style={{ position: 'relative', display: 'inline-block' }}>
                            <img 
                                src={avatarSrc} alt="Avatar" 
                                className="img-thumbnail rounded-circle mb-3"
                                style={{ width: "180px", height: "180px", objectFit: "cover", cursor: "pointer" }}
                                onClick={() => document.getElementById('fileInput').click()}
                            />
                            <input id="fileInput" type="file" style={{ display: "none" }} onChange={handleFileChange} accept="image/*" />
                            <div className="mt-1 text-primary fw-bold" style={{ cursor: "pointer" }} onClick={() => document.getElementById('fileInput').click()}>
                                📸 Đổi ảnh đại diện
                            </div>
                        </div>

                        <h4 className="mt-3">{profile.fullName}</h4>
                        <p className="text-muted">{profile.studentCode}</p>

                        {/* Nút mở Modal Đổi Pass */}
                        <button className="btn btn-outline-danger mt-3 w-75" onClick={() => setShowModal(true)}>
                            🔒 Đổi mật khẩu
                        </button>
                    </div>

                    {/* --- CỘT PHẢI: THÔNG TIN --- */}
                    <div className="col-md-8 px-4">
                        <div className="alert alert-info py-2 small">ℹ️ Thông tin cá nhân được quản lý bởi nhà trường.</div>
                        <h5 className="text-secondary">Thông tin cơ bản</h5> <hr />
                        <div className="row mb-2"><div className="col-sm-4 fw-bold">Email:</div><div className="col-sm-8">{profile.email}</div></div>
                        <div className="row mb-2"><div className="col-sm-4 fw-bold">Ngày sinh:</div><div className="col-sm-8">{profile.dob}</div></div>
                        <div className="row mb-2"><div className="col-sm-4 fw-bold">Giới tính:</div><div className="col-sm-8">{profile.gender}</div></div>
                        <div className="row mb-2"><div className="col-sm-4 fw-bold">SĐT:</div><div className="col-sm-8">{profile.phone}</div></div>
                        <div className="row mb-2"><div className="col-sm-4 fw-bold">Địa chỉ:</div><div className="col-sm-8">{profile.address}</div></div>
                        
                        <h5 className="text-secondary mt-4">Thông tin học tập</h5> <hr />
                        <div className="row mb-2"><div className="col-sm-4 fw-bold">Lớp:</div><div className="col-sm-8">{profile.className}</div></div>
                        <div className="row mb-2"><div className="col-sm-4 fw-bold">Ngành:</div><div className="col-sm-8">{profile.major}</div></div>
                        <div className="row mb-2"><div className="col-sm-4 fw-bold">Khóa:</div><div className="col-sm-8">{profile.course}</div></div>
                    </div>
                </div>
            </div>

            {/* ========================================== */}
            {/* MODAL ĐỔI MẬT KHẨU (Overlay)               */}
            {/* ========================================== */}
            {showModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div className="bg-white p-4 rounded shadow" style={{ width: '400px', maxWidth: '90%' }}>
                        <h4 className="text-center mb-3 text-danger">🔒 Đổi Mật Khẩu</h4>
                        
                        {/* Thông báo lỗi nếu có */}
                        {passError && <div className="alert alert-danger p-2 small">{passError}</div>}

                        <div className="mb-3">
                            <label className="form-label fw-bold">Mật khẩu hiện tại</label>
                            <input 
                                type="password" name="oldPassword" className="form-control" 
                                value={passData.oldPassword} onChange={handlePassInput} 
                                placeholder="Nhập mật khẩu cũ..."
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label fw-bold">Mật khẩu mới</label>
                            <input 
                                type="password" name="newPassword" className="form-control" 
                                value={passData.newPassword} onChange={handlePassInput} 
                                placeholder="Mật khẩu mới (tối thiểu 8 kí tự)"
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label fw-bold">Xác nhận mật khẩu mới</label>
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

export default StudentProfile;