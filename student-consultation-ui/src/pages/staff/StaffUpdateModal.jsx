import React, { useState, useEffect } from "react";

export default function StaffUpdateModal({ request, onClose, onUpdate }) {
    const [status, setStatus] = useState("PENDING");
    const [note, setNote] = useState("");

    // Mỗi khi mở 1 request khác nhau, reset lại form
    useEffect(() => {
        if (request) {
            setStatus(request.status);
            setNote(""); // Reset ghi chú về rỗng để nhập mới
        }
    }, [request]);

    if (!request) return null; // Không có request thì không hiện

    const handleSubmit = () => {
        if (!note.trim()) {
            alert("Vui lòng nhập ghi chú xử lý (VD: Đã nhận hồ sơ...)");
            return;
        }
        // Gọi hàm cập nhật ở trang cha
        onUpdate(request.id, status, note);
    };

    return (
        <>
            <div className="modal-backdrop show"></div>
            <div className="modal d-block" tabIndex="-1">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content shadow">
                        <div className="modal-header bg-primary text-white">
                            <h5 className="modal-title">Xử lý hồ sơ: {request.studentName}</h5>
                            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                        </div>
                        <div className="modal-body">
                            <div className="mb-3">
                                <label className="form-label fw-bold">Thủ tục:</label>
                                <div className="form-control bg-light">{request.procedureName}</div>
                            </div>

                            <div className="mb-3">
                                <label className="form-label fw-bold text-danger">1. Cập nhật trạng thái:</label>
                                <select 
                                    className="form-select"
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                >
                                    <option value="PENDING">Chờ xử lý</option>
                                    <option value="PROCESSING">Đang xử lý (Đã tiếp nhận)</option>
                                    <option value="READY_FOR_PICKUP">Chờ nhận kết quả (Đã xong)</option>
                                    <option value="COMPLETED">Hoàn thành (Đã trả hồ sơ)</option>
                                    <option value="REJECTED">Từ chối / Yêu cầu bổ sung</option>
                                </select>
                            </div>

                            <div className="mb-3">
                                <label className="form-label fw-bold text-danger">2. Ghi chú xử lý (Bắt buộc):</label>
                                <textarea 
                                    className="form-control" 
                                    rows="3"
                                    placeholder="VD: Hồ sơ hợp lệ, hẹn trả kết quả ngày 25/01..."
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                ></textarea>
                                <small className="text-muted fst-italic">* Nội dung này sẽ hiển thị trên Timeline của sinh viên.</small>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={onClose}>Đóng</button>
                            <button type="button" className="btn btn-primary" onClick={handleSubmit}>
                                <i className="bi bi-check-lg me-1"></i> Lưu cập nhật
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}