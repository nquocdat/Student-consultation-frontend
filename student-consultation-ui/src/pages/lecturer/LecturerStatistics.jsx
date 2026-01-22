import { useEffect, useState, useMemo } from "react";
import axios from "axios";

const LecturerStatistics = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // State lưu trạng thái đang được chọn. 'ALL' là xem tất cả.
    const [selectedStatus, setSelectedStatus] = useState(null);

    // 1. Load dữ liệu
    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get("http://localhost:8080/api/appointment/lecturer/my", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setAppointments(res.data);
            } catch (error) {
                console.error("Lỗi tải dữ liệu", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // 2. Tính toán số liệu
    const stats = useMemo(() => {
        const count = (code) => appointments.filter(a => a.statusCode === code).length;
        return {
            total: appointments.length,
            PENDING: count('PENDING'),
            APPROVED: count('APPROVED'),
            COMPLETED: count('COMPLETED'),
            CANCEL_REQUEST: count('CANCEL_REQUEST'),
            CANCELED: count('CANCELED'),
            REJECTED: count('REJECTED')
        };
    }, [appointments]);

    // 3. Lọc danh sách hiển thị
    const filteredList = useMemo(() => {
        if (!selectedStatus) return [];
        if (selectedStatus === 'ALL') return appointments;
        return appointments.filter(a => a.statusCode === selectedStatus);
    }, [appointments, selectedStatus]);

    // --- ✅ HÀM FORMAT HIỂN THỊ (SỬ DỤNG LOGIC CỦA BẠN) ---
    const getDurationDisplay = (startTime, endTime) => {
        // Cắt chuỗi để bỏ giây (nếu có): 08:00:00 -> 08:00
        const formatTime = (t) => t ? t.substring(0, 5) : "";
        
        if (startTime && endTime) {
            return `${formatTime(startTime)} - ${formatTime(endTime)}`;
        }
        return formatTime(startTime); // Chỉ hiện giờ bắt đầu nếu thiếu giờ kết thúc
    };

    const formatFullDateTime = (date, startTime, endTime) => {
        if(!date) return "";
        const [y, m, d] = date.split("-");
        
        // Gọi hàm xử lý giờ chuẩn từ DB
        const timeString = getDurationDisplay(startTime, endTime);
        
        return (
            <div>
                <div className="fw-bold text-primary">{timeString}</div>
                <div className="small text-muted">Ngày {d}/{m}/{y}</div>
            </div>
        );
    }

    // Component Thẻ Số Liệu
    const StatCard = ({ title, value, icon, colorClass, bgClass, statusKey }) => {
        const isActive = selectedStatus === statusKey;
        return (
            <div className="col-md-3 mb-4" 
                 onClick={() => setSelectedStatus(isActive ? null : statusKey)} 
                 style={{ cursor: "pointer" }}>
                <div className={`card border-0 shadow-sm h-100 transition-all ${isActive ? 'ring-2' : ''}`}
                     style={{ 
                         transform: isActive ? "scale(1.03)" : "scale(1)", 
                         border: isActive ? `2px solid currentColor` : "1px solid rgba(0,0,0,0.05)",
                         transition: "all 0.2s"
                     }}>
                    <div className={`card-body ${isActive ? 'bg-light' : ''}`}>
                        <div className="d-flex align-items-center justify-content-between mb-3">
                            <div>
                                <h6 className="text-muted mb-1 small text-uppercase fw-bold">{title}</h6>
                                <h2 className={`fw-bold mb-0 ${colorClass}`}>{value}</h2>
                            </div>
                            <div className={`rounded-circle d-flex align-items-center justify-content-center ${bgClass}`} 
                                 style={{ width: 50, height: 50, fontSize: "1.5rem" }}>
                                {icon}
                            </div>
                        </div>
                        {isActive && <div className={`badge ${bgClass.replace('bg-opacity-10 text-', 'bg-')} w-100`}>Đang xem chi tiết ▼</div>}
                    </div>
                </div>
            </div>
        );
    };

    if (loading) return <div className="p-5 text-center">Đang tính toán số liệu...</div>;

    return (
        <div className="container-fluid p-4 bg-light font-monospace" style={{ minHeight: "100vh" }}>
            <h3 className="fw-bold text-primary mb-4">📈 Thống Kê Hoạt Động</h3>

            <div className="row">
                <StatCard title="Tổng số lịch hẹn" value={stats.total} icon="Σ" 
                    colorClass="text-dark" bgClass="bg-dark bg-opacity-10 text-dark" statusKey="ALL" />

                <StatCard title="Chờ Duyệt" value={stats.PENDING} icon="⏳" 
                    colorClass="text-warning" bgClass="bg-warning bg-opacity-10 text-warning" statusKey="PENDING" />
                
                <StatCard title="Đã Duyệt" value={stats.APPROVED} icon="📅" 
                    colorClass="text-primary" bgClass="bg-primary bg-opacity-10 text-primary" statusKey="APPROVED" />

                <StatCard title="Xin Hủy" value={stats.CANCEL_REQUEST} icon="📩" 
                    colorClass="text-info" bgClass="bg-info bg-opacity-10 text-info" statusKey="CANCEL_REQUEST" />

                <StatCard title="Hoàn Thành" value={stats.COMPLETED} icon="✅" 
                    colorClass="text-success" bgClass="bg-success bg-opacity-10 text-success" statusKey="COMPLETED" />
                
                <StatCard title="Từ Chối" value={stats.REJECTED} icon="⛔" 
                    colorClass="text-danger" bgClass="bg-danger bg-opacity-10 text-danger" statusKey="REJECTED" />

                <StatCard title="Đã Hủy" value={stats.CANCELED} icon="❌" 
                    colorClass="text-secondary" bgClass="bg-secondary bg-opacity-10 text-secondary" statusKey="CANCELED" />
            </div>

            {/* --- BIỂU ĐỒ --- */}
            <div className="card border-0 shadow-sm p-4 mb-4">
                <h5 className="fw-bold mb-3">Tỷ lệ phân bố</h5>
                <div className="progress" style={{ height: "25px", fontSize: "0.8rem", fontWeight: "bold" }}>
                    <div className="progress-bar bg-success" style={{ width: `${(stats.COMPLETED/stats.total)*100}%` }}>{stats.COMPLETED > 0 && stats.COMPLETED}</div>
                    <div className="progress-bar bg-primary" style={{ width: `${(stats.APPROVED/stats.total)*100}%` }}>{stats.APPROVED > 0 && stats.APPROVED}</div>
                    <div className="progress-bar bg-warning text-dark" style={{ width: `${(stats.PENDING/stats.total)*100}%` }}>{stats.PENDING > 0 && stats.PENDING}</div>
                    <div className="progress-bar bg-info text-dark" style={{ width: `${(stats.CANCEL_REQUEST/stats.total)*100}%` }}>{stats.CANCEL_REQUEST > 0 && stats.CANCEL_REQUEST}</div>
                    <div className="progress-bar bg-danger" style={{ width: `${(stats.REJECTED/stats.total)*100}%` }}>{stats.REJECTED > 0 && stats.REJECTED}</div>
                    <div className="progress-bar bg-secondary" style={{ width: `${(stats.CANCELED/stats.total)*100}%` }}>{stats.CANCELED > 0 && stats.CANCELED}</div>
                </div>

                {/* --- CHÚ THÍCH (LEGEND) --- */}
                <div className="mt-3 d-flex flex-wrap gap-4 justify-content-center">
                    <div className="d-flex align-items-center small text-muted">
                        <span className="d-inline-block rounded-circle me-2 bg-success" style={{width: 12, height: 12}}></span>
                        Hoàn thành
                    </div>
                    <div className="d-flex align-items-center small text-muted">
                        <span className="d-inline-block rounded-circle me-2 bg-primary" style={{width: 12, height: 12}}></span>
                        Đã duyệt
                    </div>
                    <div className="d-flex align-items-center small text-muted">
                        <span className="d-inline-block rounded-circle me-2 bg-warning" style={{width: 12, height: 12}}></span>
                        Chờ duyệt
                    </div>
                    <div className="d-flex align-items-center small text-muted">
                        <span className="d-inline-block rounded-circle me-2 bg-info" style={{width: 12, height: 12}}></span>
                        Xin hủy
                    </div>
                    <div className="d-flex align-items-center small text-muted">
                        <span className="d-inline-block rounded-circle me-2 bg-danger" style={{width: 12, height: 12}}></span>
                        Từ chối
                    </div>
                    <div className="d-flex align-items-center small text-muted">
                        <span className="d-inline-block rounded-circle me-2 bg-secondary" style={{width: 12, height: 12}}></span>
                        Đã hủy
                    </div>
                </div>
            </div>

            {/* --- DANH SÁCH CHI TIẾT --- */}
            {selectedStatus && (
                <div className="card border-0 shadow-sm animate__animated animate__fadeInUp">
                    <div className="card-header bg-white py-3 border-0 d-flex justify-content-between align-items-center">
                        <h5 className="fw-bold m-0 text-primary">
                            📝 Danh sách: {selectedStatus === 'ALL' ? 'TẤT CẢ LỊCH HẸN' : selectedStatus} ({filteredList.length})
                        </h5>
                        <button className="btn btn-close" onClick={() => setSelectedStatus(null)}></button>
                    </div>
                    <div className="card-body p-0">
                        <div className="table-responsive">
                            <table className="table table-hover mb-0 align-middle">
                                <thead className="bg-light text-secondary">
                                    <tr>
                                        <th className="ps-4">STT</th>
                                        <th>Sinh viên</th>
                                        <th>Thời gian & Ngày</th>
                                        <th>Hình thức</th>
                                        <th>Nội dung</th>
                                        <th>Trạng thái</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredList.length === 0 ? (
                                        <tr><td colSpan="6" className="text-center py-4 text-muted">Không có dữ liệu nào.</td></tr>
                                    ) : (
                                        filteredList.map((a, index) => (
                                            <tr key={a.id}>
                                                <td className="ps-4 text-muted fw-bold">{index + 1}</td>
                                                <td>
                                                    <div className="fw-bold">{a.studentName || "Sinh viên"}</div>
                                                    <small className="text-muted">{a.studentCode}</small>
                                                </td>
                                                
                                                {/* ✅ GỌI HÀM FORMAT THỜI GIAN CHUẨN DB */}
                                                <td>{formatFullDateTime(a.date, a.time, a.endTime)}</td>
                                                
                                                <td>
                                                    {a.consultationType === 'IN_PERSON' 
                                                        ? <span className="badge bg-light text-dark border">🏢 Trực tiếp</span> 
                                                        : <span className="badge bg-light text-primary border">💻 Online</span>}
                                                </td>
                                                <td>
                                                    <div className="text-truncate" style={{maxWidth: "200px"}} title={a.reason}>
                                                        {a.reason}
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={`badge ${
                                                        a.statusCode === 'APPROVED' ? 'bg-primary' :
                                                        a.statusCode === 'COMPLETED' ? 'bg-success' :
                                                        a.statusCode === 'PENDING' ? 'bg-warning text-dark' :
                                                        a.statusCode === 'REJECTED' ? 'bg-danger' : 'bg-secondary'
                                                    }`}>
                                                        {a.statusDescription || a.statusCode}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LecturerStatistics;