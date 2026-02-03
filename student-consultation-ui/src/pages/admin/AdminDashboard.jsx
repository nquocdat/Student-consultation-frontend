import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
    const DOMAIN = "https://student-consultation-nqd.onrender.com";
    const [loading, setLoading] = useState(true);

    // State lưu trữ thống kê
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalRequests: 0,
        pendingRequests: 0,
        totalAppointments: 0
    });

    // State lưu danh sách hoạt động gần đây (Gộp từ Request & Appointment)
    const [recentActivities, setRecentActivities] = useState([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            const token = localStorage.getItem("token");
            const headers = { Authorization: `Bearer ${token}` };

            try {
                // GỌI SONG SONG 3 API ĐỂ LẤY DỮ LIỆU TỔNG
                const [usersRes, requestsRes, apptRes] = await Promise.allSettled([
                    axios.get(`${DOMAIN}/api/admin/users`, { headers }),
                    axios.get(`${DOMAIN}/api/procedures/staff/requests`, { headers }), 
                    axios.get(`${DOMAIN}/api/admin/appointments`, { headers })
                ]);

                // 1. XỬ LÝ SỐ LIỆU USER
                const users = usersRes.status === 'fulfilled' ? usersRes.value.data : [];

                // 2. XỬ LÝ SỐ LIỆU THỦ TỤC (REQUESTS)
                const requests = requestsRes.status === 'fulfilled' ? requestsRes.value.data : [];
                const pendingCount = requests.filter(r => r.status === 'PENDING').length;

                // 3. XỬ LÝ SỐ LIỆU LỊCH HẸN (APPOINTMENTS)
                const appointments = apptRes.status === 'fulfilled' ? apptRes.value.data : [];

                setStats({
                    totalUsers: users.length,
                    totalRequests: requests.length,
                    pendingRequests: pendingCount,
                    totalAppointments: appointments.length
                });

                // 4. TẠO DANH SÁCH "HOẠT ĐỘNG GẦN ĐÂY"
                const normalizedRequests = requests.map(r => ({
                    id: r.id,
                    type: 'PROCEDURE',
                    title: `Yêu cầu: ${r.procedureName}`,
                    user: r.studentName,
                    date: r.createdAt, 
                    status: r.status
                }));

                const normalizedAppts = appointments.map(a => ({
                    id: a.id,
                    type: 'APPOINTMENT',
                    title: `Lịch hẹn với ${a.lecturerName}`,
                    user: a.studentName,
                    date: a.date + ' ' + a.time, 
                    status: a.status
                }));

                // Gộp lại, sắp xếp mới nhất -> cũ nhất, lấy 5 cái đầu
                const combined = [...normalizedRequests, ...normalizedAppts]
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .slice(0, 5);

                setRecentActivities(combined);

            } catch (err) {
                console.error("Lỗi tải dashboard:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // Helper: Badge trạng thái tích hợp cả Thủ tục và Lịch hẹn
    const getStatusBadge = (item) => {
        const status = item.status;
        
        // --- XỬ LÝ TRẠNG THÁI LỊCH HẸN (Dựa trên bảng statuses của bạn) ---
        if (item.type === 'APPOINTMENT') {
            const appointmentMap = {
                PENDING: "bg-warning text-dark",    // Chờ giảng viên duyệt
                APPROVED: "bg-success",             // Đã duyệt
                REJECTED: "bg-danger",              // Từ chối
                CANCELED: "bg-secondary",            // Đã hủy
                CANCEL_REQUEST: "bg-info text-dark",// SV yêu cầu hủy
                COMPLETED: "bg-primary"             // Hoàn thành
            };
            return (
                <span className={`badge ${appointmentMap[status] || "bg-secondary"} rounded-pill`}>
                    {status === 'CANCEL_REQUEST' ? 'Yêu cầu hủy' : status}
                </span>
            );
        }

        // --- XỬ LÝ TRẠNG THÁI THỦ TỤC ---
        const procedureMap = {
            PENDING: "bg-warning text-dark",
            APPROVED: "bg-info text-dark",
            PROCESSING: "bg-primary",
            READY_FOR_PICKUP: "bg-success",
            COMPLETED: "bg-success",
            REJECTED: "bg-danger",
            CANCELED: "bg-secondary"
        };
        return <span className={`badge ${procedureMap[status] || "bg-secondary"} rounded-pill`}>{status}</span>;
    };
    

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center vh-100">
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>
    );

    return (
        <div className="container-fluid p-4 animate__animated animate__fadeIn">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="fw-bold text-dark mb-0">Dashboard Tổng Quan</h3>
                    <p className="text-muted small">Cập nhật lần cuối: {new Date().toLocaleTimeString()}</p>
                </div>
                <div>
                    <button className="btn btn-outline-primary btn-sm me-2" onClick={() => window.location.reload()}>
                        <i className="bi bi-arrow-clockwise me-1"></i> Làm mới
                    </button>
                </div>
            </div>

            {/* --- KHỐI THỐNG KÊ (CARDS) --- */}
            <div className="row g-3 mb-4">
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm h-100 border-start border-4 border-primary">
                        <div className="card-body">
                            <div className="d-flex align-items-center justify-content-between mb-2">
                                <h6 className="text-muted fw-bold mb-0">TỔNG NGƯỜI DÙNG</h6>
                                <div className="bg-primary bg-opacity-10 p-2 rounded text-primary">
                                    <i className="bi bi-people-fill fs-5"></i>
                                </div>
                            </div>
                            <h2 className="fw-bold mb-0">{stats.totalUsers}</h2>
                            <Link to="/admin/users" className="small text-decoration-none mt-2 d-block">Quản lý tài khoản &rarr;</Link>
                        </div>
                    </div>
                </div>

                <div className="col-md-3">
                    <div className="card border-0 shadow-sm h-100 border-start border-4 border-info">
                        <div className="card-body">
                            <div className="d-flex align-items-center justify-content-between mb-2">
                                <h6 className="text-muted fw-bold mb-0">LỊCH HẸN TƯ VẤN</h6>
                                <div className="bg-info bg-opacity-10 p-2 rounded text-info">
                                    <i className="bi bi-calendar-event-fill fs-5"></i>
                                </div>
                            </div>
                            <h2 className="fw-bold mb-0">{stats.totalAppointments}</h2>
                            <Link to="/admin/appointments" className="small text-decoration-none mt-2 d-block text-info">Xem chi tiết &rarr;</Link>
                        </div>
                    </div>
                </div>

                <div className="col-md-3">
                    <div className="card border-0 shadow-sm h-100 border-start border-4 border-success">
                        <div className="card-body">
                            <div className="d-flex align-items-center justify-content-between mb-2">
                                <h6 className="text-muted fw-bold mb-0">YÊU CẦU THỦ TỤC</h6>
                                <div className="bg-success bg-opacity-10 p-2 rounded text-success">
                                    <i className="bi bi-file-earmark-text-fill fs-5"></i>
                                </div>
                            </div>
                            <h2 className="fw-bold mb-0">{stats.totalRequests}</h2>
                            <span className="small text-muted">Đã tiếp nhận vào hệ thống</span>
                        </div>
                    </div>
                </div>

                <div className="col-md-3">
                    <div className="card border-0 shadow-sm h-100 border-start border-4 border-warning">
                        <div className="card-body">
                            <div className="d-flex align-items-center justify-content-between mb-2">
                                <h6 className="text-muted fw-bold mb-0">THỦ TỤC CHỜ XỬ LÝ</h6>
                                <div className="bg-warning bg-opacity-10 p-2 rounded text-warning">
                                    <i className="bi bi-hourglass-split fs-5"></i>
                                </div>
                            </div>
                            <h2 className="fw-bold mb-0 text-warning">{stats.pendingRequests}</h2>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- KHỐI HOẠT ĐỘNG GẦN ĐÂY --- */}
            <div className="row">
                <div className="col-md-8">
                    <div className="card border-0 shadow-sm rounded-4">
                        <div className="card-header bg-white py-3 border-bottom-0">
                            <h6 className="fw-bold mb-0"><i className="bi bi-clock-history me-2"></i>Hoạt động mới nhất</h6>
                        </div>
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="bg-light text-secondary small">
                                    <tr>
                                        <th className="ps-4">Loại</th>
                                        <th>Nội dung</th>
                                        <th>Người gửi</th>
                                        <th>Thời gian</th>
                                        <th>Trạng thái</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentActivities.length === 0 ? (
                                        <tr><td colSpan="5" className="text-center py-4 text-muted">Chưa có hoạt động nào</td></tr>
                                    ) : (
                                        recentActivities.map((item, index) => (
                                            <tr key={index}>
                                                <td className="ps-4">
                                                    {item.type === 'PROCEDURE' ? (
                                                        <span className="badge bg-light text-primary border border-primary"><i className="bi bi-file-earmark"></i> Thủ tục</span>
                                                    ) : (
                                                        <span className="badge bg-light text-info border border-info"><i className="bi bi-calendar"></i> Lịch hẹn</span>
                                                    )}
                                                </td>
                                                <td className="fw-bold">{item.title}</td>
                                                <td>{item.user}</td>
                                                <td className="small text-muted">{new Date(item.date).toLocaleDateString('vi-VN')}</td>
                                                {/* Đã cập nhật để truyền item thay vì chỉ status */}
                                                <td>{getStatusBadge(item)}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="card-footer bg-white text-center py-3 border-top-0">
                            <small className="text-muted">Chỉ hiển thị 5 hoạt động gần nhất</small>
                        </div>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="card border-0 shadow-sm rounded-4">
                        <div className="card-header bg-white py-3 border-bottom-0">
                            <h6 className="fw-bold mb-0">Truy cập nhanh</h6>
                        </div>
                        <div className="card-body">
                            <Link to="/admin/users" className="btn btn-light w-100 text-start mb-2 d-flex align-items-center p-3 border hover-shadow">
                                <div className="bg-primary text-white rounded-circle p-2 me-3 d-flex align-items-center justify-content-center" style={{ width: 40, height: 40 }}>
                                    <i className="bi bi-person-plus"></i>
                                </div>
                                <div>
                                    <div className="fw-bold">Tạo tài khoản mới</div>
                                    <div className="small text-muted">Thêm GV, NV hoặc SV</div>
                                </div>
                            </Link>

                            <Link to="/admin/procedures" className="btn btn-light w-100 text-start mb-2 d-flex align-items-center p-3 border hover-shadow">
                                <div className="bg-success text-white rounded-circle p-2 me-3 d-flex align-items-center justify-content-center" style={{ width: 40, height: 40 }}>
                                    <i className="bi bi-file-earmark-plus"></i>
                                </div>
                                <div>
                                    <div className="fw-bold">Quản lý danh mục</div>
                                    <div className="small text-muted">Thêm/Sửa loại thủ tục</div>
                                </div>
                            </Link>

                            <Link to="/admin/appointments" className="btn btn-light w-100 text-start d-flex align-items-center p-3 border hover-shadow">
                                <div className="bg-danger text-white rounded-circle p-2 me-3 d-flex align-items-center justify-content-center" style={{ width: 40, height: 40 }}>
                                    <i className="bi bi-calendar-x"></i>
                                </div>
                                <div>
                                    <div className="fw-bold">Hủy lịch hẹn</div>
                                    <div className="small text-muted">Can thiệp lịch đã đặt</div>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <style>
                {`
                .hover-shadow:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 .5rem 1rem rgba(0,0,0,.15)!important;
                    transition: all .2s;
                }
                `}
            </style>
        </div>
    );
}