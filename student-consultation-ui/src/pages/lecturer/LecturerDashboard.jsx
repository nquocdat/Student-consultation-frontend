import { useEffect, useState } from "react";
import { Link } from "react-router-dom"; 
import axios from "axios";

export default function LecturerDashboard() {
    const [loading, setLoading] = useState(true);
    
    // State lưu dữ liệu tổng quan
    const [summary, setSummary] = useState({
        pendingCount: 0,      
        todayCount: 0,        
        completedMonth: 0     
    });

    const [todaySchedule, setTodaySchedule] = useState([]);
    const [cancelRequests, setCancelRequests] = useState([]);

    const getTodayString = () => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get("http://localhost:8080/api/appointment/lecturer/my", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                const allAppointments = res.data;
                const todayStr = getTodayString();

                const pending = allAppointments.filter(a => a.statusCode === 'PENDING').length;
                const completed = allAppointments.filter(a => a.statusCode === 'COMPLETED').length;
                
                const todayList = allAppointments.filter(a => 
                    a.date === todayStr && a.statusCode === 'APPROVED'
                ).sort((a, b) => a.time.localeCompare(b.time));

                const cancelList = allAppointments.filter(a => a.statusCode === 'CANCEL_REQUEST');

                setSummary({
                    pendingCount: pending,
                    todayCount: todayList.length,
                    completedMonth: completed
                });

                setTodaySchedule(todayList);
                setCancelRequests(cancelList); 

            } catch (error) {
                console.error("Lỗi tải dashboard", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const formatTime = (t) => t ? t.substring(0, 5) : "";

    if (loading) return <div className="p-5 text-center"><div className="spinner-border text-primary"></div></div>;

    return (
        <div className="container-fluid p-4 font-monospace">
            {/* --- HEADER --- */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="fw-bold text-primary mb-1">Xin chào, Giảng viên 👋</h3>
                    <p className="text-muted mb-0">Chúc bạn một ngày làm việc hiệu quả!</p>
                </div>
                <div className="text-end text-muted small">
                    Hôm nay, {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </div>

            {/* --- KHỐI THỐNG KÊ NHANH --- */}
            <div className="row mb-4">
                <div className="col-md-4 mb-3">
                    <div className="card border-0 shadow-sm h-100 bg-warning bg-opacity-10 border-start border-warning border-4">
                        <div className="card-body">
                            <h6 className="text-uppercase text-muted small fw-bold">Yêu cầu chờ duyệt</h6>
                            <div className="d-flex align-items-center justify-content-between">
                                <h2 className="fw-bold text-warning mb-0">{summary.pendingCount}</h2>
                                <i className="bi bi-hourglass-split fs-1 text-warning opacity-50"></i>
                            </div>
                            <Link 
                                to="/lecturer/appointments" 
                                state={{ status: 'PENDING' }}
                                className="small text-decoration-none fw-bold text-warning mt-2 d-inline-block"
                            >
                                Xử lý ngay &rarr;
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="col-md-4 mb-3">
                    <div className="card border-0 shadow-sm h-100 bg-primary bg-opacity-10 border-start border-primary border-4">
                        <div className="card-body">
                            <h6 className="text-uppercase text-muted small fw-bold">Lịch hẹn hôm nay</h6>
                            <div className="d-flex align-items-center justify-content-between">
                                <h2 className="fw-bold text-primary mb-0">{summary.todayCount}</h2>
                                <i className="bi bi-calendar-check fs-1 text-primary opacity-50"></i>
                            </div>
                            <small className="text-muted">Sắp xếp theo giờ</small>
                        </div>
                    </div>
                </div>

                <div className="col-md-4 mb-3">
                    <div className="card border-0 shadow-sm h-100 bg-success bg-opacity-10 border-start border-success border-4">
                        <div className="card-body">
                            <h6 className="text-uppercase text-muted small fw-bold">Đã hoàn thành</h6>
                            <div className="d-flex align-items-center justify-content-between">
                                <h2 className="fw-bold text-success mb-0">{summary.completedMonth}</h2>
                                <i className="bi bi-check2-circle fs-1 text-success opacity-50"></i>
                            </div>
                            <Link to="/lecturer/statistics" className="small text-decoration-none fw-bold text-success mt-2 d-inline-block">
                                Xem báo cáo &rarr;
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-lg-8 mb-4">
                    
                    {/* DANH SÁCH YÊU CẦU HỦY */}
                    {cancelRequests.length > 0 && (
                        <div className="card border-0 shadow-sm mb-4 border-start border-danger border-4 animate__animated animate__pulse">
                            <div className="card-header bg-danger bg-opacity-10 border-0 py-3">
                                <h5 className="fw-bold text-danger m-0">
                                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                    Sinh viên yêu cầu hủy ({cancelRequests.length})
                                </h5>
                            </div>
                            <div className="list-group list-group-flush">
                                {cancelRequests.map((req, idx) => (
                                    <Link 
                                        key={idx} 
                                        to="/lecturer/appointments" 
                                        // ✅ CŨNG LỌC CẢ NGÀY CỦA YÊU CẦU HỦY CHO CHÍNH XÁC
                                        state={{ searchTerm: req.studentCode, status: 'CANCEL_REQUEST', date: req.date }}
                                        className="list-group-item list-group-item-action px-4 py-3 d-flex align-items-center justify-content-between"
                                    >
                                        <div>
                                            <div className="fw-bold text-dark">{req.studentName} <span className="small text-muted">({req.studentCode})</span></div>
                                            <div className="small text-danger">Lý do: {req.reason}</div>
                                            <div className="small text-muted">Lịch gốc: {formatTime(req.time)} - {new Date(req.date).toLocaleDateString('vi-VN')}</div>
                                        </div>
                                        <span className="btn btn-sm btn-outline-danger">Xử lý</span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* LỊCH TRÌNH HÔM NAY */}
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-white border-0 py-3">
                            <h5 className="fw-bold text-primary m-0">📅 Lịch Trình Hôm Nay</h5>
                        </div>
                        <div className="card-body p-0">
                            {todaySchedule.length === 0 ? (
                                <div className="text-center py-5 text-muted">
                                    <i className="bi bi-cup-hot fs-1 d-block mb-3 opacity-50"></i>
                                    <p>Hôm nay bạn không có lịch hẹn nào.</p>
                                </div>
                            ) : (
                                <div className="list-group list-group-flush">
                                    {todaySchedule.map((appt, idx) => (
                                        <Link 
                                            key={idx} 
                                            to="/lecturer/appointments"
                                            // ✅ SỬA: Truyền thêm date: appt.date để lọc chính xác ngày hôm nay
                                            state={{ searchTerm: appt.studentCode, status: 'APPROVED', date: appt.date }}
                                            className="list-group-item list-group-item-action px-4 py-3 d-flex align-items-center justify-content-between"
                                            title="Bấm để xem chi tiết và quản lý"
                                        >
                                            <div className="d-flex align-items-center gap-3">
                                                <div className="bg-light rounded p-2 text-center" style={{minWidth: "60px"}}>
                                                    <div className="fw-bold text-dark">{formatTime(appt.time)}</div>
                                                    {appt.endTime && <div className="small text-muted">{formatTime(appt.endTime)}</div>}
                                                </div>
                                                <div>
                                                    <div className="fw-bold text-primary">{appt.studentName}</div>
                                                    <div className="small text-muted">{appt.studentCode} • {appt.reason}</div>
                                                </div>
                                            </div>
                                            <div className="d-flex align-items-center gap-3">
                                                <div>
                                                    {appt.consultationType === 'IN_PERSON' 
                                                        ? <span className="badge bg-white text-dark border shadow-sm">🏢 Trực tiếp</span>
                                                        : <span className="badge bg-white text-primary border shadow-sm">💻 Online</span>
                                                    }
                                                </div>
                                                <i className="bi bi-chevron-right text-muted"></i>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="col-lg-4 mb-4">
                    <div className="card border-0 shadow-sm mb-4">
                        <div className="card-header bg-white border-0 py-3">
                            <h5 className="fw-bold text-secondary m-0">⚡ Truy cập nhanh</h5>
                        </div>
                        <div className="card-body">
                            <div className="d-grid gap-2">
                                <Link to="/lecturer/appointments" className="btn btn-outline-primary text-start p-3 d-flex align-items-center gap-3">
                                    <i className="bi bi-calendar-check fs-4"></i>
                                    <div>
                                        <div className="fw-bold">Quản lý lịch hẹn</div>
                                        <small className="text-muted">Duyệt và xử lý yêu cầu</small>
                                    </div>
                                </Link>
                                <Link to="/lecturer/schedule" className="btn btn-outline-info text-start p-3 d-flex align-items-center gap-3">
                                    <i className="bi bi-clock-history fs-4"></i>
                                    <div>
                                        <div className="fw-bold">Đăng ký lịch làm việc</div>
                                        <small className="text-muted">Cập nhật thời gian làm việc</small>
                                    </div>
                                </Link>
                                <Link to="/lecturer/statistics" className="btn btn-outline-success text-start p-3 d-flex align-items-center gap-3">
                                    <i className="bi bi-graph-up-arrow fs-4"></i>
                                    <div>
                                        <div className="fw-bold">Báo cáo thống kê</div>
                                        <small className="text-muted">Xem hiệu suất tư vấn</small>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}