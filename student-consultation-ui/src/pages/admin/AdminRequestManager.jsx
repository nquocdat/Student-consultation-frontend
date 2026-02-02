import React, { useEffect, useState } from "react";
import axios from "axios";

export default function AdminRequestManager() {
    const DOMAIN = "https://student-consultation-nqd.onrender.com";
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // --- CÁC STATE BỘ LỌC ---
    const [filterStatus, setFilterStatus] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [filterDate, setFilterDate] = useState(""); 

    // 1. Tải dữ liệu
    const fetchRequests = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(`${DOMAIN}/api/admin/procedure-requests`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const sorted = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setRequests(sorted);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    // (Đã xóa hàm handleUpdateStatus vì Admin không thao tác)

    // 2. Helper hiển thị Badge
    const getStatusBadge = (status) => {
        switch (status) {
            case "PENDING": 
                return <span className="badge bg-secondary">Mới gửi</span>;
            case "PROCESSING": 
                return <span className="badge bg-warning text-dark">Đang xử lý</span>;
            case "READY_FOR_PICKUP": 
                return <span className="badge bg-info text-dark">Chờ lấy</span>;
            case "COMPLETED": 
                return <span className="badge bg-success">Hoàn thành</span>;
            case "REJECTED": 
                return <span className="badge bg-danger">Từ chối</span>;
            default: 
                return <span className="badge bg-light text-dark border">{status}</span>;
        }
    };

    // 3. Logic lọc
    const filteredRequests = requests.filter(req => {
        const matchStatus = filterStatus ? req.status === filterStatus : true;
        
        const search = searchTerm.toLowerCase();
        const matchSearch = (req.studentName?.toLowerCase().includes(search)) || 
                            (req.procedureName?.toLowerCase().includes(search));

        let matchDate = true;
        if (filterDate && req.createdAt) {
            const createdDate = new Date(req.createdAt).toISOString().split('T')[0];
            matchDate = createdDate === filterDate;
        }

        return matchStatus && matchSearch && matchDate;
    });

    return (
        <div className="container-fluid p-4 animate__animated animate__fadeIn">
            <h3 className="fw-bold mb-4 text-primary">
                <i className="bi bi-clipboard-data me-2"></i>Quản lý Yêu cầu Thủ tục
            </h3>

            {/* THANH CÔNG CỤ FILTER */}
            <div className="card border-0 shadow-sm rounded-4 mb-4 bg-white">
                <div className="card-body p-4">
                    <div className="row g-3">
                        <div className="col-md-4">
                            <label className="fw-bold small text-muted">Tìm kiếm:</label>
                            <input 
                                type="text" 
                                className="form-control" 
                                placeholder="Tên sinh viên hoặc thủ tục..." 
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="col-md-3">
                            <label className="fw-bold small text-muted">Ngày gửi:</label>
                            <input 
                                type="date" 
                                className="form-control" 
                                value={filterDate}
                                onChange={e => setFilterDate(e.target.value)}
                            />
                        </div>

                        <div className="col-md-3">
                            <label className="fw-bold small text-muted">Trạng thái:</label>
                            <select className="form-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                                <option value="">-- Tất cả --</option>
                                <option value="PENDING">Mới gửi</option>
                                <option value="PROCESSING">Đang xử lý</option>
                                <option value="READY_FOR_PICKUP">Chờ lấy</option>
                                <option value="COMPLETED">Hoàn thành</option>
                                <option value="REJECTED">Đã từ chối</option>
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
                                <th>Sinh viên</th>
                                <th>Thủ tục</th>
                                <th>Ngày gửi</th>
                                <th className="text-center">Trạng thái</th>
                                {/* Đã xóa cột Thao tác */}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" className="text-center py-5">Đang tải dữ liệu...</td></tr>
                            ) : filteredRequests.length === 0 ? (
                                <tr><td colSpan="5" className="text-center py-5 text-muted">Không tìm thấy yêu cầu nào.</td></tr>
                            ) : (
                                filteredRequests.map((req, index) => (
                                    <tr key={req.id}>
                                        <td className="ps-4 fw-bold text-muted">{index + 1}</td>
                                        <td>
                                            <div className="fw-bold">{req.studentName}</div>
                                            <div className="small text-muted">{req.studentCode}</div>
                                        </td>
                                        <td><span className="text-primary fw-bold">{req.procedureName}</span></td>
                                        <td>{new Date(req.createdAt).toLocaleDateString('vi-VN')}</td>
                                        
                                        <td className="text-center">{getStatusBadge(req.status)}</td>
                                        
                                        {/* Đã xóa cột nút bấm */}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            
            {/* Footer thống kê nhỏ */}
            <div className="text-end mt-3 text-muted small">
                Hiển thị {filteredRequests.length} / {requests.length} yêu cầu
            </div>
        </div>
    );
}