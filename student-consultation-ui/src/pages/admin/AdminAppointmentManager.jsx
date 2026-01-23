import React, { useEffect, useState } from "react";
import axios from "axios";

export default function AdminAppointmentManager() {
    const DOMAIN = "http://localhost:8080";
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(false);

    // --- STATE CHO BỘ LỌC ---
    const [searchTerm, setSearchTerm] = useState("");
    const [filterDate, setFilterDate] = useState("");
    const [filterStatus, setFilterStatus] = useState("");

    // 1. Tải dữ liệu
    const fetchAppointments = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(`${DOMAIN}/api/admin/appointments`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAppointments(res.data);
        } catch (err) {
            console.error(err);
            // Dữ liệu giả lập
            setAppointments([
                { id: 1, studentName: "Nguyễn Văn A", lecturerName: "Thầy Hùng", date: "2025-02-10", time: "08:00", status: "PENDING" },
                { id: 2, studentName: "Trần Thị B", lecturerName: "Cô Lan", date: "2025-02-11", time: "14:00", status: "APPROVED" },
                { id: 3, studentName: "Lê Văn C", lecturerName: "Thầy Minh", date: "2025-02-12", time: "09:30", status: "REJECTED" },
            ]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAppointments(); }, []);

    // 2. Xử lý XÓA LỊCH (DELETE)
    const handleDelete = async (id) => {
        if(!window.confirm("CẢNH BÁO: Bạn có chắc chắn muốn XÓA VĨNH VIỄN lịch hẹn này không?")) return;
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`${DOMAIN}/api/admin/appointments/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Đã xóa lịch hẹn thành công!");
            fetchAppointments();
        } catch (err) {
            alert("Lỗi khi xóa: " + (err.response?.data || "Có lỗi xảy ra"));
        }
    };

    // 3. Helper: Format ngày YYYY-MM-DD -> DD/MM/YYYY
    const formatDateVN = (dateStr) => {
        if (!dateStr) return "-";
        const [year, month, day] = dateStr.split("-");
        return `${day}/${month}/${year}`;
    };

    // 4. Helper: Tính toán khung giờ
    const formatTimeRange = (startTime) => {
        if (!startTime) return "-";
        const [hourStr, minuteStr] = startTime.split(":");
        let hour = parseInt(hourStr);
        let endHour = hour + 1; 
        const format = (n) => n.toString().padStart(2, "0");
        return `${format(hour)}:${minuteStr} - ${format(endHour)}:${minuteStr}`;
    };

    // 5. Helper: Badge trạng thái
    const getStatusBadge = (status) => {
        switch (status) {
            case "PENDING": return <span className="badge bg-warning text-dark">Chờ duyệt</span>;
            case "APPROVED": return <span className="badge bg-success">Đã duyệt</span>;
            case "REJECTED": return <span className="badge bg-danger">Từ chối</span>;
            case "COMPLETED": return <span className="badge bg-primary">Hoàn thành</span>;
            case "CANCELED": return <span className="badge bg-secondary">Đã hủy</span>;
            default: return <span className="badge bg-secondary">{status}</span>;
        }
    };

    // --- LOGIC LỌC DỮ LIỆU ---
    const filteredAppointments = appointments.filter(appt => {
        const matchSearch = 
            appt.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
            appt.lecturerName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchDate = filterDate ? appt.date === filterDate : true;
        const matchStatus = filterStatus ? appt.status === filterStatus : true;
        return matchSearch && matchDate && matchStatus;
    });

    const resetFilters = () => {
        setSearchTerm("");
        setFilterDate("");
        setFilterStatus("");
    };

    return (
        <div className="container-fluid p-4 animate__animated animate__fadeIn">
            <h3 className="fw-bold mb-4"><i className="bi bi-calendar-week-fill me-2"></i>Quản lý Lịch hẹn</h3>

            {/* THANH CÔNG CỤ */}
            <div className="card border-0 shadow-sm rounded-4 mb-4 bg-light">
                <div className="card-body p-3">
                    <div className="row g-3">
                        <div className="col-md-4">
                            <label className="form-label fw-bold small text-muted">Tìm kiếm</label>
                            <div className="input-group">
                                <span className="input-group-text bg-white border-end-0"><i className="bi bi-search"></i></span>
                                <input type="text" className="form-control border-start-0" placeholder="Tên SV hoặc GV..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                            </div>
                        </div>
                        <div className="col-md-3">
                            <label className="form-label fw-bold small text-muted">Lọc theo ngày</label>
                            <input type="date" className="form-control" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label fw-bold small text-muted">Trạng thái</label>
                            <select className="form-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                                <option value="">-- Tất cả --</option>
                                <option value="PENDING">Chờ duyệt</option>
                                <option value="APPROVED">Đã duyệt</option>
                                <option value="REJECTED">Từ chối</option>
                                <option value="COMPLETED">Hoàn thành</option>
                                <option value="CANCELED">Đã hủy</option>
                            </select>
                        </div>
                        <div className="col-md-2 d-flex align-items-end">
                            
                        </div>
                    </div>
                </div>
            </div>

            {/* BẢNG DỮ LIỆU */}
            <div className="card border-0 shadow-sm rounded-4">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-white text-secondary border-bottom">
                            <tr>
                                <th className="ps-3">ID</th>
                                <th>Sinh viên</th>
                                <th>Giảng viên</th>
                                <th>Ngày</th>
                                <th>Khung giờ</th>
                                <th>Trạng thái</th>
                                
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? <tr><td colSpan="7" className="text-center py-5">Đang tải dữ liệu...</td></tr> : 
                             filteredAppointments.length === 0 ? 
                                <tr><td colSpan="7" className="text-center py-5 text-muted">Không tìm thấy lịch hẹn nào.</td></tr> :
                             filteredAppointments.map((appt) => (
                                <tr key={appt.id}>
                                    <td className="ps-3 fw-bold text-muted">#{appt.id}</td>
                                    <td><div className="fw-bold">{appt.studentName}</div></td>
                                    <td><span className="text-primary fw-bold">{appt.lecturerName}</span></td>
                                    <td>{formatDateVN(appt.date)}</td>
                                    <td>
                                        <span className="badge bg-light text-dark border border-secondary">
                                            <i className="bi bi-clock me-1"></i>{formatTimeRange(appt.time)}
                                        </span>
                                    </td>
                                    <td>{getStatusBadge(appt.status)}</td>
                                    
                                    
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div className="text-end mt-3 text-muted small">
                Hiển thị {filteredAppointments.length} / {appointments.length} lịch hẹn
            </div>
        </div>
    );
}