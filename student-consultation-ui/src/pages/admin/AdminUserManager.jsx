import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";

export default function AdminUserManager() {
    const DOMAIN = "https://student-consultation-nqd.onrender.com";
    const [users, setUsers] = useState([]);
    

    // 🔍 1. STATE CHO TÌM KIẾM
    const [searchTerm, setSearchTerm] = useState("");

    // Modal & Form State
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [activeTab, setActiveTab] = useState("STUDENT");

    // Dữ liệu form
    const initialFormState = {
        username: "", password: "", fullName: "", email: "", role: "STUDENT",
        phone: "", dob: "", gender: "Nam", address: "",
        studentCode: "", major: "", className: "", course: "",
        department: "", position: "", office: "", academicDegree: "", academicRank: "", description: "",
        officeLocation: "", workPhone: ""
    };
    const [formData, setFormData] = useState(initialFormState);

    // Tải danh sách
    const fetchUsers = useCallback(async () => {
    try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${DOMAIN}/api/admin/users`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(res.data);
    } catch (err) { 
        console.error(err); 
    } 
    // Đã xóa setLoading(true) và setLoading(false)
}, [DOMAIN]);

    useEffect(() => { fetchUsers(); }, []);

    // Các hàm Modal
    const handleOpenAdd = () => {
        setIsEditing(false); setCurrentUserId(null);
        setFormData({ ...initialFormState, role: activeTab }); setShowModal(true);
    };

    const handleEditClick = (user) => {
        setIsEditing(true); setCurrentUserId(user.id);
        const details = user.student || user.lecturer || user.staff || {};
        setFormData({
            username: user.username, password: "", fullName: user.fullName, email: user.email || "", role: user.role,
            phone: user.phone || details.phone || "", dob: user.dob || details.dob || "",
            gender: user.gender || details.gender || "Nam", address: user.address || details.address || "",
            studentCode: details.studentCode || "", major: details.major || "", className: details.className || "", course: details.course || "",
            department: details.department || "", position: details.position || "", office: details.office || "",
            academicDegree: details.academicDegree || "", academicRank: details.academicRank || "", description: details.description || "",
            officeLocation: details.officeLocation || "", workPhone: details.workPhone || ""
        });
        setShowModal(true);
    };

    // Hàm Lưu
    const handleSaveUser = async () => {
        if (!formData.fullName) { alert("Vui lòng nhập họ tên!"); return; }
        const token = localStorage.getItem("token");
        try {
            if (isEditing) {
                await axios.put(`${DOMAIN}/api/admin/users/${currentUserId}`, formData, { headers: { Authorization: `Bearer ${token}` } });
                alert("Cập nhật thành công!");
            } else {
                if (!formData.username || !formData.password) { alert("Tên đăng nhập/Mật khẩu bắt buộc!"); return; }
                await axios.post(`${DOMAIN}/api/admin/users`, formData, { headers: { Authorization: `Bearer ${token}` } });
                alert("Tạo mới thành công!");
            }
            setShowModal(false); fetchUsers();
        } catch (err) { alert("Lỗi: " + (err.response?.data || "Có lỗi xảy ra")); }
    };

    // Hàm Khóa
    const handleLockUser = async (id, currentStatus, e) => {
        e.stopPropagation();
        const actionText = currentStatus ? "KHÓA" : "MỞ KHÓA";
        if (!window.confirm(`Bạn có chắc muốn ${actionText} tài khoản này không?`)) return;

        try {
            const token = localStorage.getItem("token");
            await axios.put(`${DOMAIN}/api/admin/users/${id}/lock`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert(`Đã ${actionText.toLowerCase()} thành công!`);
            setUsers(prevUsers => prevUsers.map(u => {
                if (u.id === id) {
                    return { ...u, active: !currentStatus, isActive: !currentStatus };
                }
                return u;
            }));
        } catch (err) {
            fetchUsers();
        }
    };

    // 🔍 2. LOGIC LỌC DANH SÁCH (FILTER)
    const filteredUsers = users.filter(u => {
        const matchRole = u.role === activeTab;
        const keyword = searchTerm.toLowerCase();
        const matchName = u.fullName?.toLowerCase().includes(keyword);
        const matchUsername = u.username?.toLowerCase().includes(keyword);
        return matchRole && (matchName || matchUsername);
    });

    return (
        <div className="container-fluid p-4 animate__animated animate__fadeIn bg-light" style={{ minHeight: '100vh' }}>
            {/* --- HEADER --- */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 bg-white p-3 rounded-4 shadow-sm">
                <h4 className="fw-bold text-primary m-0 mb-3 mb-md-0">
                    <i className="bi bi-people-fill me-2"></i>
                    Quản lý Tài khoản
                </h4>

                <div className="d-flex align-items-center gap-3">
                    {/* 🔍 THANH TÌM KIẾM */}
                    <div className="input-group shadow-sm rounded-pill overflow-hidden border"
                        style={{ maxWidth: '280px', height: '38px' }}>
                        <span className="input-group-text bg-white border-0 ps-3 d-flex align-items-center">
                            <i className="bi bi-search text-secondary" style={{ fontSize: '0.9rem' }}></i>
                        </span>
                        <input
                            type="text"
                            className="form-control border-0 ps-2 shadow-none h-100"
                            placeholder="Tìm kiếm..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ fontSize: '0.9rem', paddingTop: '8px' }}
                        />
                    </div>

                    {/* ➕ NÚT THÊM MỚI */}
                    <button
                        className="btn btn-primary btn-sm rounded-pill px-3 shadow-sm d-flex align-items-center gap-2"
                        onClick={handleOpenAdd}
                        style={{ height: '38px' }}
                    >
                        <i className="bi bi-plus-lg" style={{ fontSize: '0.9rem' }}></i>
                        <span className="fw-medium" style={{ fontSize: '0.9rem' }}>Thêm mới</span>
                    </button>
                </div>
            </div>

            {/* TAB LIST */}
            <ul className="nav nav-tabs mb-4 border-bottom-0 ms-2">
                {['STUDENT', 'LECTURER', 'STAFF', 'ADMIN'].map(role => (
                    <li className="nav-item" key={role}>
                        <button
                            className={`nav-link border-0 rounded-top px-4 py-2 ${activeTab === role ? 'active bg-white text-primary shadow-sm fw-bold' : 'text-muted'}`}
                            onClick={() => { setActiveTab(role); setSearchTerm(""); }}
                            style={{ transition: 'all 0.2s' }}
                        >
                            {role === 'STUDENT' ? 'Sinh viên' : role === 'LECTURER' ? 'Giảng viên' : role === 'STAFF' ? 'Nhân viên' : 'Admin'}
                        </button>
                    </li>
                ))}
            </ul>

            {/* TABLE LIST */}
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.9rem' }}>
                        <thead className="bg-light text-secondary text-uppercase" style={{ fontSize: '0.8rem', letterSpacing: '0.5px' }}>
                            <tr>
                                <th className="ps-4 py-3">Họ tên</th>
                                <th className="py-3">Mã số (Username)</th>
                                <th className="py-3">Thông tin liên hệ</th>
                                {activeTab === 'STUDENT' && <><th className="py-3">Lớp/Ngành</th></>}
                                {activeTab === 'LECTURER' && <><th className="py-3">Khoa/Chức vụ</th></>}
                                {activeTab === 'STAFF' && <><th className="py-3">Phòng ban</th></>}
                                {/* ẨN CỘT THAO TÁC NẾU LÀ ADMIN */}
                                {activeTab !== 'ADMIN' && <th className="text-end pe-4 py-3">Thao tác</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="11" className="text-center py-5 text-muted">
                                        <div className="d-flex flex-column align-items-center">
                                            <i className="bi bi-inbox display-4 text-light mb-2"></i>
                                            <span>{searchTerm ? `Không tìm thấy "${searchTerm}"` : "Chưa có dữ liệu"}</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((u) => {
                                    const details = u.student || u.lecturer || u.staff || {};
                                    let isActive = true;
                                    if (u.active !== undefined) isActive = u.active;
                                    else if (u.isActive !== undefined) isActive = u.isActive;

                                    return (
                                        <tr key={u.id} style={{ cursor: 'pointer', transition: 'background 0.2s' }} onClick={() => handleEditClick(u)}>
                                            {/* Cột Họ Tên + Avatar giả lập */}
                                            <td className="ps-4 py-3">
                                                <div className="d-flex align-items-center">
                                                    <div className={`rounded-circle d-flex justify-content-center align-items-center text-white fw-bold me-3 shadow-sm ${isActive ? 'bg-primary' : 'bg-secondary'}`}
                                                        style={{ width: '35px', height: '35px', fontSize: '0.8rem' }}>
                                                        {u.fullName.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className={`fw-bold ${isActive ? 'text-dark' : 'text-muted'}`}>{u.fullName}</div>
                                                        {!isActive && <span className="badge bg-danger-subtle text-danger rounded-pill" style={{ fontSize: '0.6rem' }}>Đã khóa</span>}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Cột Username */}
                                            <td className="fw-medium text-primary">{u.username}</td>

                                            {/* Cột Liên hệ */}
                                            <td>
                                                <div className="d-flex flex-column">
                                                    <span className="text-muted"><i className="bi bi-envelope me-1"></i>{u.email || "---"}</span>
                                                    <span className="text-muted small"><i className="bi bi-telephone me-1"></i>{u.phone || details.phone || "---"}</span>
                                                </div>
                                            </td>

                                            {/* Các cột riêng theo Role */}
                                            {activeTab === 'STUDENT' && <td>{details.className || "-"} <br /> <small className="text-muted">{details.major}</small></td>}
                                            {activeTab === 'LECTURER' && <td>{details.department || "-"} <br /> <small className="text-muted">{details.position}</small></td>}
                                            {activeTab === 'STAFF' && <td>{details.department || "-"} <br /> <small className="text-muted">{details.position}</small></td>}

                                            {/* Cột Thao tác - ẨN NẾU LÀ ADMIN */}
                                            {activeTab !== 'ADMIN' && (
                                                <td className="text-end pe-4">
                                                    <button
                                                        className={`btn btn-sm rounded-pill px-3 fw-bold border ${isActive ? 'btn-white text-danger border-danger-subtle hover-danger' : 'btn-success text-white border-success'}`}
                                                        onClick={(e) => handleLockUser(u.id, isActive, e)}
                                                    >
                                                        {isActive ? <><i className="bi bi-lock me-1"></i> Khóa</> : <><i className="bi bi-unlock-fill me-1"></i> Mở</>}
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- MODAL --- */}
            {showModal && (
                <div className="modal d-block animate__animated animate__fadeIn" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content border-0 shadow rounded-4 overflow-hidden">
                            <div className="modal-header bg-primary text-white px-4 py-3">
                                <h5 className="modal-title fw-bold">
                                    {isEditing ? <><i className="bi bi-pencil-square me-2"></i>Cập nhật thông tin</> : <><i className="bi bi-person-plus-fill me-2"></i>Thêm tài khoản mới</>}
                                </h5>
                                <button className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
                            </div>
                            <div className="modal-body p-4 bg-light">
                                <div className="card border-0 shadow-sm p-3">
                                    <div className="mb-3">
                                        <label className="fw-bold form-label">Vai trò hệ thống</label>
                                        <select className="form-select bg-light" value={formData.role} disabled={isEditing} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                                            <option value="STUDENT">Sinh viên</option><option value="LECTURER">Giảng viên</option><option value="STAFF">Nhân viên</option><option value="ADMIN">Quản trị viên (Admin)</option>
                                        </select>
                                    </div>

                                    <div className="row g-3">
                                        <div className="col-md-6"><label className="form-label text-muted small fw-bold">Họ và tên <span className="text-danger">*</span></label><input className="form-control" value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} /></div>
                                        <div className="col-md-6"><label className="form-label text-muted small fw-bold">Email</label><input className="form-control" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} /></div>
                                        <div className="col-md-6"><label className="form-label text-muted small fw-bold">Tên đăng nhập (Mã số)</label><input className="form-control" value={formData.username} disabled={isEditing} onChange={e => setFormData({ ...formData, username: e.target.value })} /></div>
                                        <div className="col-md-6"><label className="form-label text-muted small fw-bold">Mật khẩu</label><input type="password" className="form-control" placeholder={isEditing ? "Để trống nếu không đổi" : ""} value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} /></div>

                                        <div className="col-12"><hr className="text-muted opacity-25" /></div>

                                        {/* Các trường riêng */}
                                        {formData.role === 'STUDENT' && <><div className="col-md-4"><label className="small">Lớp</label><input className="form-control" value={formData.className} onChange={e => setFormData({ ...formData, className: e.target.value })} /></div><div className="col-md-4"><label className="small">Ngành</label><input className="form-control" value={formData.major} onChange={e => setFormData({ ...formData, major: e.target.value })} /></div><div className="col-md-4"><label className="small">Khóa</label><input className="form-control" value={formData.course} onChange={e => setFormData({ ...formData, course: e.target.value })} /></div></>}
                                        {(formData.role === 'LECTURER' || formData.role === 'STAFF') && <><div className="col-md-6"><label className="small">Phòng/Khoa</label><input className="form-control" value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} /></div><div className="col-md-6"><label className="small">Chức vụ</label><input className="form-control" value={formData.position} onChange={e => setFormData({ ...formData, position: e.target.value })} /></div></>}
                                        {formData.role === 'LECTURER' && <div className="col-12"><div className="row g-3"><div className="col-md-4"><label className="small">Học hàm</label><input className="form-control" value={formData.academicRank} onChange={e => setFormData({ ...formData, academicRank: e.target.value })} /></div><div className="col-md-4"><label className="small">Học vị</label><input className="form-control" value={formData.academicDegree} onChange={e => setFormData({ ...formData, academicDegree: e.target.value })} /></div><div className="col-md-4"><label className="small">Văn phòng</label><input className="form-control" value={formData.office} onChange={e => setFormData({ ...formData, office: e.target.value })} /></div></div></div>}
                                        {formData.role === 'STAFF' && <div className="col-12"><div className="row g-3"><div className="col-md-6"><label className="small">Địa điểm làm việc</label><input className="form-control" value={formData.officeLocation} onChange={e => setFormData({ ...formData, officeLocation: e.target.value })} /></div><div className="col-md-6"><label className="small">Hotline</label><input className="form-control" value={formData.workPhone} onChange={e => setFormData({ ...formData, workPhone: e.target.value })} /></div></div></div>}

                                        <div className="col-md-4"><label className="small">SĐT Cá nhân</label><input className="form-control" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} /></div>
                                        <div className="col-md-4"><label className="small">Ngày sinh</label><input type="date" className="form-control" value={formData.dob} onChange={e => setFormData({ ...formData, dob: e.target.value })} /></div>
                                        <div className="col-md-4"><label className="small">Giới tính</label><select className="form-select" value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })}><option value="Nam">Nam</option><option value="Nữ">Nữ</option></select></div>
                                        <div className="col-12"><label className="small">Địa chỉ</label><input className="form-control" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} /></div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer bg-white">
                                <button className="btn btn-light rounded-pill px-4" onClick={() => setShowModal(false)}>Hủy bỏ</button>
                                <button className="btn btn-primary rounded-pill px-4" onClick={handleSaveUser}>{isEditing ? "Lưu thay đổi" : "Tạo mới"}</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}