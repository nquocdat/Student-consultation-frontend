import React from "react";

export default function StaffRequestTable({ requests, loading, onDownload, onOpenModal }) {
    
    // Hàm hiển thị Badge tiếng Việt
    const getStatusBadge = (status) => {
        const colorMap = {
            "PENDING": "bg-warning text-dark",
            "PROCESSING": "bg-info text-dark",
            "READY_FOR_PICKUP": "bg-success",
            "COMPLETED": "bg-primary",
            "REJECTED": "bg-danger"
        };
        const textMap = {
            "PENDING": "Chờ xử lý",
            "PROCESSING": "Đang xử lý",
            "READY_FOR_PICKUP": "Chờ nhận KQ",
            "COMPLETED": "Hoàn thành",
            "REJECTED": "Từ chối"
        };
        return <span className={`badge ${colorMap[status] || "bg-secondary"}`}>{textMap[status] || status}</span>;
    };

    return (
        <div className="card border-0 shadow-sm">
            <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                    <thead className="bg-light text-nowrap">
                        <tr>
                            <th className="ps-3">STT</th>
                            <th>Sinh Viên</th>
                            <th>Thủ tục</th>
                            <th style={{width: "20%"}}>Lý do/Nội dung</th>
                            <th>File đính kèm</th>
                            <th>Ngày gửi</th>
                            <th>Trạng thái</th>
                            <th className="text-end pe-3">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="8" className="text-center py-4">Đang tải dữ liệu...</td></tr>
                        ) : requests.length === 0 ? (
                            <tr><td colSpan="8" className="text-center py-4 text-muted">Không có yêu cầu nào.</td></tr>
                        ) : (
                            requests.map((req, index) => (
                                <tr key={req.id}>
                                    <td className="ps-3">{index + 1}</td>
                                    <td>
                                        <div className="fw-bold">{req.studentCode}</div>
                                        <small className="text-muted">{req.studentName}</small>
                                    </td>
                                    <td className="text-primary fw-bold">{req.procedureName}</td>
                                    <td>
                                        <div className="text-truncate-3 small text-muted" style={{maxHeight: "60px", overflowY: "auto"}}>
                                            {req.reason}
                                        </div>
                                    </td>
                                    <td>
                                        {req.attachmentUrl ? (
                                            <button 
                                                className="btn btn-sm btn-light border text-primary"
                                                onClick={() => onDownload(req.id)}
                                                title="Tải file sinh viên gửi"
                                            >
                                                <i className="bi bi-download"></i> Tải về
                                            </button>
                                        ) : <span className="text-muted small">--</span>}
                                    </td>
                                    <td>{new Date(req.createdAt).toLocaleDateString('vi-VN')}</td>
                                    <td>{getStatusBadge(req.status)}</td>
                                    <td className="text-end pe-3">
                                        <button 
                                            className="btn btn-primary btn-sm"
                                            onClick={() => onOpenModal(req)}
                                        >
                                            <i className="bi bi-pencil-square me-1"></i> Xử lý
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}