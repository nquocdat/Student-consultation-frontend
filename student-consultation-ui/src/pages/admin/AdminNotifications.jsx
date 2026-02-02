import React, { useEffect, useState } from "react";
import axios from "axios";

export default function AdminNotifications() {
    const [notifications, setNotifications] = useState([]);
    
    // 🔥 State mặc định gửi cho ALL
    const [newNotif, setNewNotif] = useState({ 
        title: "", content: "", type: "INFO", targetRole: "ALL" 
    });
    const [loading, setLoading] = useState(false);

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get("https://student-consultation-nqd.onrender.com/api/notifications", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(res.data);
        } catch (error) {
            console.error("Lỗi tải:", error);
        }
    };

    useEffect(() => { fetchNotifications(); }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            await axios.post("https://student-consultation-nqd.onrender.com/api/notifications", newNotif, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // Reset form
            setNewNotif({ title: "", content: "", type: "INFO", targetRole: "ALL" });
            fetchNotifications(); 
            alert("Đăng thông báo thành công!");
        } catch (error) {
            alert("Lỗi khi đăng");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if(!window.confirm("Xóa thông báo này?")) return;
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`https://student-consultation-nqd.onrender.com/api/notifications/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchNotifications();
        } catch (error) { alert("Lỗi xóa"); }
    };

    // Helper hiển thị badge
    const getTargetBadge = (role) => {
        switch (role) {
            case 'ROLE_STUDENT': return <span className="badge bg-primary"><i className="bi bi-mortarboard me-1"></i>Sinh viên</span>;
            case 'ROLE_LECTURER': return <span className="badge bg-success"><i className="bi bi-person-video3 me-1"></i>Giảng viên</span>;
            case 'ROLE_STAFF': return <span className="badge bg-secondary"><i className="bi bi-briefcase me-1"></i>Nhân viên</span>;
            default: return <span className="badge bg-info text-dark"><i className="bi bi-globe me-1"></i>Tất cả hệ thống</span>;
        }
    };

    return (
        <div className="container-fluid p-4 animate__animated animate__fadeIn">
            <h3 className="fw-bold text-primary mb-4">
                <i className="bi bi-bell-fill me-2"></i>Quản Lý Thông Báo
            </h3>

            <div className="row g-4">
                {/* --- FORM TẠO --- */}
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm">
                        <div className="card-header bg-white py-3">
                            <h6 className="fw-bold mb-0 text-secondary">Soạn thông báo</h6>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleCreate}>
                                <div className="mb-3">
                                    <label className="form-label fw-bold">Tiêu đề</label>
                                    <input type="text" className="form-control" required
                                        value={newNotif.title}
                                        onChange={e => setNewNotif({...newNotif, title: e.target.value})}
                                    />
                                </div>

                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-bold">Loại tin</label>
                                        <select className="form-select" value={newNotif.type}
                                            onChange={e => setNewNotif({...newNotif, type: e.target.value})}>
                                            <option value="INFO">ℹ️ Tin tức</option>
                                            <option value="WARNING">⚠️ Lưu ý</option>
                                            <option value="ALERT">🔥 Khẩn cấp</option>
                                        </select>
                                    </div>

                                    {/* 🔥 DROPDOWN CHỌN NHÓM (CẬP NHẬT) */}
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-bold">Gửi đến</label>
                                        <select className="form-select border-primary fw-bold" 
                                            value={newNotif.targetRole} 
                                            onChange={e => setNewNotif({...newNotif, targetRole: e.target.value})}>
                                            <option value="ALL">🌐 Tất cả (Chung)</option>
                                            <option value="ROLE_STUDENT">🎓 Toàn bộ Sinh viên</option>
                                            <option value="ROLE_LECTURER">👨‍🏫 Toàn bộ Giảng viên</option>
                                            <option value="ROLE_STAFF">💼 Toàn bộ Nhân viên</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label fw-bold">Nội dung</label>
                                    <textarea className="form-control" rows="5" required
                                        value={newNotif.content}
                                        onChange={e => setNewNotif({...newNotif, content: e.target.value})}
                                    ></textarea>
                                </div>
                                <button className="btn btn-primary w-100 py-2" disabled={loading}>
                                    {loading ? "Đang gửi..." : <><i className="bi bi-send-fill me-2"></i>Gửi ngay</>}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* --- DANH SÁCH --- */}
                <div className="col-md-8">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-white py-3">
                            <h6 className="fw-bold mb-0 text-secondary">Lịch sử gửi</h6>
                        </div>
                        <div className="card-body p-0 custom-scrollbar" style={{maxHeight: '600px', overflowY: 'auto'}}>
                            <div className="list-group list-group-flush">
                                {notifications.map((notif) => (
                                    <div key={notif.id} className="list-group-item p-3">
                                        <div className="d-flex justify-content-between align-items-start">
                                            <div className="w-100">
                                                <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                                                    {/* Badge Loại */}
                                                    <span className={`badge ${notif.type === 'ALERT' ? 'bg-danger' : notif.type === 'WARNING' ? 'bg-warning text-dark' : 'bg-info text-dark'}`}>
                                                        {notif.type}
                                                    </span>
                                                    
                                                    {/* Badge Đối tượng */}
                                                    {getTargetBadge(notif.targetRole)}

                                                    <h6 className="fw-bold text-primary mb-0 ms-1">{notif.title}</h6>
                                                </div>
                                                
                                                <small className="text-muted d-block mb-2">
                                                    {new Date(notif.createdAt).toLocaleString('vi-VN')}
                                                </small>
                                                <p className="mb-0 text-dark opacity-75">{notif.content}</p>
                                            </div>
                                            <button className="btn btn-outline-danger btn-sm border-0" onClick={() => handleDelete(notif.id)}>
                                                <i className="bi bi-trash"></i>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}