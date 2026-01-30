import React, { useEffect, useState } from "react";
import axios from "axios";

export default function AdminAppointmentManager() {
    const DOMAIN = "http://localhost:8080";
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(false);

    // --- STATE BỘ LỌC ---
    const [searchTerm, setSearchTerm] = useState("");
    const [filterDate, setFilterDate] = useState("");
    const [filterStatus, setFilterStatus] = useState("");

    // --- STATE PHÂN TRANG ---
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    // 1. Tải dữ liệu
    const fetchAppointments = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(`${DOMAIN}/api/admin/appointments`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Sắp xếp ngày mới nhất lên đầu
            const sortedData = res.data.sort((a, b) => new Date(b.date) - new Date(a.date));
            setAppointments(sortedData);
        } catch (err) {
            console.error(err);
            setAppointments([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAppointments(); }, []);

    // Reset về trang 1 khi lọc
    useEffect(() => { setCurrentPage(1); }, [searchTerm, filterDate, filterStatus]);

    // 2. Hủy lịch
    const handleCancel = async (id) => {
        if (!window.confirm("Xác nhận HỦY lịch hẹn này?")) return;
        try {
            const token = localStorage.getItem("token");
            await axios.put(`${DOMAIN}/api/admin/appointments/${id}/cancel`, {}, { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            alert("Đã hủy lịch hẹn thành công!");
            fetchAppointments();
        } catch (err) {
            alert("Lỗi: " + (err.response?.data || "Có lỗi xảy ra"));
        }
    };

    // 3. Xóa lịch
    const handleDelete = async (id) => {
        if (!window.confirm("CẢNH BÁO: Xóa vĩnh viễn?")) return;
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`${DOMAIN}/api/admin/appointments/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Đã xóa dữ liệu!");
            fetchAppointments();
        } catch (err) {
            alert("Lỗi: " + (err.response?.data));
        }
    };

    // 4. Helper hiển thị Status
    const getStatusBadge = (code) => {
        // Fallback nếu code bị null
        const safeCode = code ? code : "UNKNOWN";
        switch (safeCode) {
            case "PENDING": return <span className="badge bg-warning text-dark">Chờ duyệt</span>;
            case "APPROVED": return <span className="badge bg-success">Đã duyệt</span>;
            case "REJECTED": return <span className="badge bg-danger">Từ chối</span>;
            case "COMPLETED": return <span className="badge bg-primary">Hoàn thành</span>;
            case "CANCELED": return <span className="badge bg-secondary">Đã hủy</span>;
            case "CANCEL_REQUEST": return <span className="badge bg-info text-dark">Yêu cầu hủy</span>;
            default: return <span className="badge bg-light text-dark border">{safeCode}</span>;
        }
    };

    // Helper ngày giờ
    const formatDateVN = (dateStr) => {
        if (!dateStr) return "-";
        const [year, month, day] = dateStr.split("-");
        return `${day}/${month}/${year}`;
    };

    const formatTimeRange = (startTime, endTime) => {
        if (!startTime) return "-";
        const start = startTime.substring(0, 5);
        const end = endTime ? endTime.substring(0, 5) : "--";
        return `${start} - ${end}`;
    };

    // --- LOGIC LỌC (ĐÃ SỬA DÙNG statusCode) ---
    const filteredAppointments = appointments.filter(appt => {
        const s = searchTerm.toLowerCase();
        const matchSearch = (appt.studentName?.toLowerCase().includes(s) || appt.lecturerName?.toLowerCase().includes(s));
        const matchDate = filterDate ? appt.date === filterDate : true;
        
        // 🔥 QUAN TRỌNG: Sửa appt.status -> appt.statusCode
        const matchStatus = filterStatus ? appt.statusCode === filterStatus : true; 
        
        return matchSearch && matchDate && matchStatus;
    });

    // Phân trang
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredAppointments.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="container-fluid p-4 animate__animated animate__fadeIn">
            <h3 className="fw-bold mb-4 text-primary"><i className="bi bi-calendar-check-fill me-2"></i>Quản lý Lịch hẹn</h3>

            {/* BỘ LỌC */}
            <div className="card border-0 shadow-sm rounded-4 mb-4 bg-white">
                <div className="card-body p-4">
                    <div className="row g-3">
                        <div className="col-md-4">
                            <label className="form-label fw-bold small text-muted">Tìm kiếm</label>
                            <input type="text" className="form-control bg-light" placeholder="Tên SV hoặc GV..." 
                                value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label fw-bold small text-muted">Ngày</label>
                            <input type="date" className="form-control bg-light" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label fw-bold small text-muted">Trạng thái</label>
                            <select className="form-select bg-light" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                                <option value="">-- Tất cả --</option>
                                <option value="PENDING">Chờ duyệt</option>
                                <option value="APPROVED">Đã duyệt</option>
                                <option value="REJECTED">Từ chối</option>
                                <option value="COMPLETED">Hoàn thành</option>
                                <option value="CANCEL_REQUEST">Yêu cầu hủy</option>
                                <option value="CANCELED">Đã hủy</option>
                            </select>
                        </div>
                        
                    </div>
                </div>
            </div>

            {/* BẢNG DỮ LIỆU */}
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light text-secondary">
                            <tr>
                                <th className="ps-4 py-3">STT</th>
                                <th className="py-3">Sinh viên</th>
                                <th className="py-3">Giảng viên</th>
                                <th className="py-3" style={{width: '20%'}}>Lý do & File</th>
                                <th className="py-3">Thời gian</th>
                                <th className="py-3">Trạng thái</th>
                                <th className="text-end pe-4 py-3">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (<tr><td colSpan="7" className="text-center py-5">Đang tải...</td></tr>) : 
                             currentItems.length === 0 ? (<tr><td colSpan="7" className="text-center py-5 text-muted">Không có dữ liệu.</td></tr>) : 
                             (currentItems.map((appt, index) => (
                                <tr key={appt.id}>
                                    <td className="ps-4 fw-bold text-muted">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                    
                                    <td>
                                        <div className="fw-bold text-dark">{appt.studentName}</div>
                                        <div className="small text-muted">{appt.studentCode}</div>
                                    </td>
                                    
                                    <td><span className="text-primary fw-bold">{appt.lecturerName}</span></td>
                                    
                                    {/* CỘT LÝ DO & FILE */}
                                    <td>
                                        <div className="text-truncate" style={{maxWidth: '200px'}} title={appt.reason}>
                                            {appt.reason || <span className="text-muted small">--</span>}
                                        </div>
                                        {appt.attachments && appt.attachments.length > 0 && (
                                            <div className="mt-1 d-flex flex-wrap gap-1">
                                                {appt.attachments.map(file => (
                                                    <a key={file.id} href={`${DOMAIN}/api/files/download/${file.fileName}`} 
                                                       className="badge bg-light text-primary border text-decoration-none" target="_blank" rel="noreferrer">
                                                        <i className="bi bi-paperclip"></i> File
                                                    </a>
                                                ))}
                                            </div>
                                        )}
                                    </td>

                                    {/* CỘT THỜI GIAN */}
                                    <td>
                                        <div className="fw-bold">{formatDateVN(appt.date)}</div>
                                        <div className="small text-muted bg-light px-2 rounded d-inline-block border mt-1">
                                            {formatTimeRange(appt.time, appt.endTime)}
                                        </div>
                                    </td>
                                    
                                    {/* 🔥 QUAN TRỌNG: Sửa appt.status -> appt.statusCode */}
                                    <td>{getStatusBadge(appt.statusCode)}</td>
                                    
                                    <td className="text-end pe-4">
                                        <div className="btn-group">
                                            {/* 🔥 Sửa appt.status -> appt.statusCode */}
                                            {appt.statusCode !== "COMPLETED" && appt.statusCode !== "CANCELED" && (
                                                <button className="btn btn-sm btn-outline-warning" onClick={() => handleCancel(appt.id)} title="Hủy">
                                                    <i className="bi bi-x-circle"></i>
                                                </button>
                                            )}
                                            <button className="btn btn-sm btn-outline-danger ms-1" onClick={() => handleDelete(appt.id)} title="Xóa">
                                                <i className="bi bi-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )))}
                        </tbody>
                    </table>
                </div>

                {/* PHÂN TRANG */}
                {filteredAppointments.length > itemsPerPage && (
                    <div className="card-footer bg-white border-0 py-3 d-flex justify-content-center">
                        <nav>
                            <ul className="pagination mb-0">
                                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                    <button className="page-link border-0 rounded-circle mx-1" onClick={() => paginate(currentPage - 1)}><i className="bi bi-chevron-left"></i></button>
                                </li>
                                {[...Array(totalPages)].map((_, i) => (
                                    <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                                        <button className={`page-link border-0 rounded-circle mx-1 ${currentPage === i + 1 ? 'bg-primary text-white' : 'text-dark bg-light'}`} onClick={() => paginate(i + 1)}>{i + 1}</button>
                                    </li>
                                ))}
                                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                    <button className="page-link border-0 rounded-circle mx-1" onClick={() => paginate(currentPage + 1)}><i className="bi bi-chevron-right"></i></button>
                                </li>
                            </ul>
                        </nav>
                    </div>
                )}
            </div>
            <div className="text-end mt-2 text-muted small">Hiển thị {currentItems.length} / {filteredAppointments.length} kết quả</div>
        </div>
    );
}