import React from "react";

export default function StaffRequestTable({ 
    requests, loading, onDownload, onOpenModal, 
    selectedIds, onToggleSelect, onToggleAll, filterStatus 
}) {
    
    // Checkbox chỉ hiện ở các Tab còn hoạt động
    const showCheckbox = ["PENDING", "PROCESSING", "READY_FOR_PICKUP"].includes(filterStatus);
    const isAllSelected = requests.length > 0 && selectedIds.length === requests.length;

    // ... (Giữ nguyên hàm getStatusBadge) ...
    const getStatusBadge = (status) => { /* Code cũ */ 
        const map = { "PENDING": "bg-warning text-dark", "PROCESSING": "bg-info text-dark", "READY_FOR_PICKUP": "bg-success", "COMPLETED": "bg-primary", "REJECTED": "bg-danger" };
        const text = { "PENDING": "Chờ xử lý", "PROCESSING": "Đang xử lý", "READY_FOR_PICKUP": "Chờ nhận KQ", "COMPLETED": "Hoàn thành", "REJECTED": "Từ chối" };
        return <span className={`badge ${map[status] || "bg-secondary"}`}>{text[status] || status}</span>;
    };

    return (
        <div className="card border-0 shadow-sm">
            <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                    <thead className="bg-light text-nowrap">
                        <tr>
                            {showCheckbox && (
                                <th className="ps-3" style={{width: "40px"}}>
                                    <input type="checkbox" className="form-check-input" checked={isAllSelected} onChange={(e) => onToggleAll(e.target.checked)} />
                                </th>
                            )}
                            <th>STT</th>
                            <th>Sinh Viên</th>
                            <th>Thủ tục</th>
                            <th style={{width: "20%"}}>Nội dung</th>
                            <th>File</th>
                            <th>Ngày gửi</th>
                            <th>Trạng thái</th>
                            <th className="text-end pe-3">Tác vụ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? <tr><td colSpan="9" className="text-center py-4">Loading...</td></tr> : 
                         requests.length === 0 ? <tr><td colSpan="9" className="text-center py-4 text-muted">Trống</td></tr> :
                         requests.map((req, index) => (
                            <tr key={req.id} className={selectedIds.includes(req.id) ? "table-active" : ""}>
                                {showCheckbox && (
                                    <td className="ps-3">
                                        <input type="checkbox" className="form-check-input" checked={selectedIds.includes(req.id)} onChange={() => onToggleSelect(req.id)} />
                                    </td>
                                )}
                                <td>{index + 1}</td>
                                <td>
                                    <div className="fw-bold">{req.studentCode}</div>
                                    <small className="text-muted">{req.studentName}</small>
                                </td>
                                <td className="text-primary fw-bold">{req.procedureName}</td>
                                <td><div className="text-truncate-3 small text-muted" style={{maxHeight: "50px", overflowY: "auto"}}>{req.reason}</div></td>
                                <td>
                                    {req.attachmentUrl ? (
                                        <button className="btn btn-sm btn-light border text-primary" onClick={(e) => { e.stopPropagation(); onDownload(req.id); }}>
                                            <i className="bi bi-download"></i>
                                        </button>
                                    ) : "--"}
                                </td>
                                <td>{new Date(req.createdAt).toLocaleDateString('vi-VN')}</td>
                                <td>{getStatusBadge(req.status)}</td>
                                
                                {/* --- CỘT TÁC VỤ --- */}
                                <td className="text-end pe-3">
                                    {/* 1. CHỜ XỬ LÝ -> Tiếp nhận */}
                                    {req.status === "PENDING" && (
                                        <button className="btn btn-outline-primary btn-sm fw-bold" onClick={() => onOpenModal({...req, _forceStatus: "PROCESSING"})}>
                                            <i className="bi bi-arrow-right-circle me-1"></i> Tiếp nhận
                                        </button>
                                    )}

                                    {/* 2. ĐANG XỬ LÝ -> Xong (Nhập phòng) HOẶC Từ chối */}
                                    {req.status === "PROCESSING" && (
                                        <div className="d-flex justify-content-end gap-2">
                                            {/* Nút XONG -> Chuyển sang READY_FOR_PICKUP */}
                                            <button className="btn btn-success btn-sm fw-bold" 
                                                onClick={() => onOpenModal({...req, _forceStatus: "READY_FOR_PICKUP"})}>
                                                <i className="bi bi-check-lg"></i> Xong
                                            </button>
                                            
                                            {/* Nút TỪ CHỐI -> Chuyển sang REJECTED */}
                                            <button className="btn btn-outline-danger btn-sm" 
                                                onClick={() => onOpenModal({...req, _forceStatus: "REJECTED"})}>
                                                <i className="bi bi-x-lg"></i> Từ chối
                                            </button>
                                        </div>
                                    )}

                                    {/* 3. CHỜ NHẬN KQ -> Đã trả hồ sơ */}
                                    {req.status === "READY_FOR_PICKUP" && (
                                        <button className="btn btn-outline-info btn-sm fw-bold" 
                                            onClick={() => onOpenModal({...req, _forceStatus: "COMPLETED"})}>
                                            <i className="bi bi-box-seam me-1"></i> Đã trả HS
                                        </button>
                                    )}

                                    {/* 4. Đã xong */}
                                    {(req.status === "COMPLETED" || req.status === "REJECTED") && (
                                        <span className="text-muted small fst-italic"><i className="bi bi-lock-fill"></i> Đã đóng</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}