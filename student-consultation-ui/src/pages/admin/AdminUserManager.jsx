import React, { useEffect, useState } from "react";
import axios from "axios";

export default function AdminUserManager() {
    const DOMAIN = "http://localhost:8080";
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [activeTab, setActiveTab] = useState("STUDENT");

    // Dữ liệu form (giữ nguyên như cũ)
    const initialFormState = {
        username: "", password: "", fullName: "", email: "", role: "STUDENT",
        phone: "", dob: "", gender: "Nam", address: "",
        studentCode: "", major: "", className: "", course: "",
        department: "", position: "", office: "", academicDegree: "", academicRank: "", description: "",
        officeLocation: "", workPhone: ""
    };
    const [formData, setFormData] = useState(initialFormState);

    // 1. Tải danh sách
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(`${DOMAIN}/api/admin/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(res.data);
        } catch (err) { console.error(err); } 
        finally { setLoading(false); }
    };

    useEffect(() => { fetchUsers(); }, []);

    // 2. Các hàm Modal (Giữ nguyên)
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

    // 3. Hàm Lưu (Giữ nguyên)
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

    // 4. 👇 HÀM XÓA USER (MỚI THÊM)
    const handleDeleteUser = async (id, e) => {
        e.stopPropagation(); // ⛔ Chặn sự kiện click của dòng (không mở modal sửa)
        
        if (!window.confirm("Bạn có chắc chắn muốn XÓA vĩnh viễn tài khoản này?")) return;

        try {
            const token = localStorage.getItem("token");
            await axios.delete(`${DOMAIN}/api/admin/users/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Đã xóa tài khoản!");
            fetchUsers(); // Load lại danh sách
        } catch (err) {
            alert("Lỗi khi xóa: " + (err.response?.data || "Không thể xóa"));
        }
    };

    const filteredUsers = users.filter(u => u.role === activeTab);

    return (
        <div className="container-fluid p-4 animate__animated animate__fadeIn">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="fw-bold text-dark">Quản lý Tài khoản</h3>
                <button className="btn btn-primary shadow-sm" onClick={handleOpenAdd}>
                    <i className="bi bi-person-plus-fill me-2"></i> Thêm mới
                </button>
            </div>

            <ul className="nav nav-tabs mb-3">
                {['STUDENT', 'LECTURER', 'STAFF', 'ADMIN'].map(role => (
                    <li className="nav-item" key={role}>
                        <button className={`nav-link ${activeTab === role ? 'active fw-bold' : ''}`} onClick={() => setActiveTab(role)}>
                            {role === 'STUDENT' ? 'Sinh viên' : role === 'LECTURER' ? 'Giảng viên' : role === 'STAFF' ? 'Nhân viên' : 'Admin'}
                        </button>
                    </li>
                ))}
            </ul>

            <div className="card border-0 shadow-sm rounded-4">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0" style={{fontSize: '0.95rem'}}>
                        <thead className="bg-light">
                            <tr>
                                <th className="ps-3">ID</th>
                                <th>Họ tên</th>
                                <th>Username</th>
                                <th>SĐT</th>
                                <th>Giới tính</th>
                                {activeTab === 'STUDENT' && <><th>Lớp</th><th>Ngành</th><th>Khóa</th></>}
                                {activeTab === 'LECTURER' && <><th>Khoa</th><th>Chức vụ</th></>}
                                {activeTab === 'STAFF' && <><th>Phòng ban</th><th>Chức vụ</th></>}
                                <th>Email</th>
                                <th className="text-end pe-3">Thao tác</th> {/* ✅ Đổi tên cột */}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.length === 0 ? (
                                <tr><td colSpan="11" className="text-center py-4 text-muted">Chưa có dữ liệu</td></tr>
                            ) : (
                                filteredUsers.map((u) => {
                                    const details = u.student || u.lecturer || u.staff || {};
                                    return (
                                        <tr key={u.id} style={{cursor: 'pointer'}} onClick={() => handleEditClick(u)} title="Nhấn để sửa">
                                            <td className="ps-3 fw-bold text-muted">#{u.id}</td>
                                            <td className="fw-bold text-primary">{u.fullName}</td>
                                            <td>{u.username}</td>
                                            <td>{u.phone || details.phone || "-"}</td>
                                            <td>
                                                <span className={`badge ${(u.gender || details.gender) === 'Nam' ? 'bg-info text-dark' : 'bg-danger-subtle text-danger'}`}>
                                                    {u.gender || details.gender || "-"}
                                                </span>
                                            </td>
                                            
                                            {activeTab === 'STUDENT' && <><td>{details.className || "-"}</td><td>{details.major || "-"}</td><td>{details.course || "-"}</td></>}
                                            {activeTab === 'LECTURER' && <><td>{details.department || "-"}</td><td>{details.position || "-"}</td></>}
                                            {activeTab === 'STAFF' && <><td>{details.department || "-"}</td><td>{details.position || "-"}</td></>}

                                            <td>{u.email || "-"}</td>

                                            {/* 👇 CỘT THAO TÁC (Action) */}
                                            <td className="text-end pe-3">
                                                {/* Nút Khóa (Giả lập) */}
                                                <button className="btn btn-sm btn-outline-warning me-2" title="Khóa/Mở khóa" 
                                                    onClick={(e) => { e.stopPropagation(); alert("Tính năng khóa đang phát triển"); }}>
                                                    <i className="bi bi-lock-fill"></i>
                                                </button>

                                                {/* ✅ NÚT XÓA (DELETE BUTTON) */}
                                                <button className="btn btn-sm btn-outline-danger" title="Xóa tài khoản" 
                                                    onClick={(e) => handleDeleteUser(u.id, e)}>
                                                    <i className="bi bi-trash-fill"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL GIỮ NGUYÊN NHƯ CŨ (KHÔNG ĐỔI GÌ BÊN DƯỚI) */}
            {showModal && (
                <div className="modal d-block" style={{backgroundColor: "rgba(0,0,0,0.5)"}}>
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content border-0 shadow">
                            <div className="modal-header bg-primary text-white">
                                <h5 className="modal-title">{isEditing ? `Cập nhật: ${formData.username}` : "Thêm Tài Khoản Mới"}</h5>
                                <button className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="fw-bold">Vai trò:</label>
                                    <select className="form-select w-auto d-inline-block ms-2" value={formData.role} disabled={isEditing} onChange={e => setFormData({...formData, role: e.target.value})}>
                                        <option value="STUDENT">Sinh viên</option><option value="LECTURER">Giảng viên</option><option value="STAFF">Nhân viên</option><option value="ADMIN">Admin</option>
                                    </select>
                                </div>
                                <div className="row">
                                    <div className="col-md-6 mb-3"><label className="form-label">Họ tên <span className="text-danger">*</span></label><input className="form-control" value={formData.fullName} onChange={e=>setFormData({...formData, fullName: e.target.value})} /></div>
                                    <div className="col-md-6 mb-3"><label className="form-label">Email</label><input className="form-control" value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})} /></div>
                                    <div className="col-md-6 mb-3"><label className="form-label">Username</label><input className="form-control" value={formData.username} disabled={isEditing} onChange={e=>setFormData({...formData, username: e.target.value})} /></div>
                                    <div className="col-md-6 mb-3"><label className="form-label">Password</label><input type="password" className="form-control" value={formData.password} onChange={e=>setFormData({...formData, password: e.target.value})} /></div>
                                    <hr/>
                                    {formData.role === 'STUDENT' && <div className="row"><div className="col-md-4 mb-3"><label>Mã SV</label><input className="form-control" value={formData.studentCode} onChange={e=>setFormData({...formData, studentCode: e.target.value})} /></div><div className="col-md-4 mb-3"><label>Lớp</label><input className="form-control" value={formData.className} onChange={e=>setFormData({...formData, className: e.target.value})} /></div><div className="col-md-4 mb-3"><label>Ngành</label><input className="form-control" value={formData.major} onChange={e=>setFormData({...formData, major: e.target.value})} /></div><div className="col-md-4 mb-3"><label>Khóa</label><input className="form-control" value={formData.course} onChange={e=>setFormData({...formData, course: e.target.value})} /></div></div>}
                                    {(formData.role === 'LECTURER' || formData.role === 'STAFF') && <div className="row"><div className="col-md-6 mb-3"><label>Phòng/Khoa</label><input className="form-control" value={formData.department} onChange={e=>setFormData({...formData, department: e.target.value})} /></div><div className="col-md-6 mb-3"><label>Chức vụ</label><input className="form-control" value={formData.position} onChange={e=>setFormData({...formData, position: e.target.value})} /></div></div>}
                                    {formData.role === 'LECTURER' && <div className="row"><div className="col-md-4 mb-3"><label>Học hàm</label><input className="form-control" value={formData.academicRank} onChange={e=>setFormData({...formData, academicRank: e.target.value})} /></div><div className="col-md-4 mb-3"><label>Học vị</label><input className="form-control" value={formData.academicDegree} onChange={e=>setFormData({...formData, academicDegree: e.target.value})} /></div><div className="col-md-4 mb-3"><label>Văn phòng</label><input className="form-control" value={formData.office} onChange={e=>setFormData({...formData, office: e.target.value})} /></div></div>}
                                    {formData.role === 'STAFF' && <div className="row"><div className="col-md-6 mb-3"><label>Địa điểm làm việc</label><input className="form-control" value={formData.officeLocation} onChange={e=>setFormData({...formData, officeLocation: e.target.value})} /></div><div className="col-md-6 mb-3"><label>Hotline</label><input className="form-control" value={formData.workPhone} onChange={e=>setFormData({...formData, workPhone: e.target.value})} /></div></div>}
                                    <div className="row mt-2 border-top pt-2"><div className="col-md-4 mb-3"><label>SĐT</label><input className="form-control" value={formData.phone} onChange={e=>setFormData({...formData, phone: e.target.value})} /></div><div className="col-md-4 mb-3"><label>Ngày sinh</label><input type="date" className="form-control" value={formData.dob} onChange={e=>setFormData({...formData, dob: e.target.value})} /></div><div className="col-md-4 mb-3"><label>Giới tính</label><select className="form-select" value={formData.gender} onChange={e=>setFormData({...formData, gender: e.target.value})}><option value="Nam">Nam</option><option value="Nữ">Nữ</option></select></div><div className="col-12 mb-3"><label>Địa chỉ</label><input className="form-control" value={formData.address} onChange={e=>setFormData({...formData, address: e.target.value})} /></div></div>
                                </div>
                            </div>
                            <div className="modal-footer"><button className="btn btn-light" onClick={() => setShowModal(false)}>Hủy</button><button className="btn btn-primary" onClick={handleSaveUser}>{isEditing ? "Lưu thay đổi" : "Tạo mới"}</button></div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}