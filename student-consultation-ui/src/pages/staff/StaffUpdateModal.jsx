import React, { useState, useEffect } from "react";

export default function StaffUpdateModal({ request, onClose, onUpdate }) {
    const [note, setNote] = useState("");
    const [room, setRoom] = useState("C01"); // Mặc định phòng C01
    const [targetStatus, setTargetStatus] = useState("");

    useEffect(() => {
        if (request) {
            // Xác định trạng thái đích dựa trên nút bấm (được truyền qua _forceStatus)
            // Hoặc nếu không có thì lấy status hiện tại (mặc dù logic mới sẽ luôn có _forceStatus)
            setTargetStatus(request._forceStatus || request.status);
            setNote(""); 
            setRoom("C01"); // Reset phòng
        }
    }, [request]);

    if (!request) return null;

    // --- XỬ LÝ NỘI DUNG GỬI ĐI ---
    const handleSubmit = () => {
        let finalNote = note;

        // LOGIC RIÊNG CHO TỪNG TRẠNG THÁI
        if (targetStatus === "READY_FOR_PICKUP") {
            // Nếu là bước Xác nhận kết quả -> Ghép chuỗi phòng
            if (!room.trim()) {
                alert("Vui lòng nhập tên phòng!"); return;
            }
            finalNote = `Đã có kết quả, em đến phòng ${room} nhận kết quả.`;
        } 
        else if (targetStatus === "REJECTED") {
            // Nếu từ chối -> Bắt buộc nhập lý do
            if (!note.trim()) {
                alert("Vui lòng nhập lý do từ chối!"); return;
            }
            finalNote = note;
        }
        else if (targetStatus === "COMPLETED") {
            // Hoàn thành -> Ghi chú mặc định nếu để trống
            finalNote = "Đã trả hồ sơ cho sinh viên.";
        }

        onUpdate(request.id, targetStatus, finalNote);
    };

    // --- RENDER GIAO DIỆN THEO TRẠNG THÁI ---
    const renderModalContent = () => {
        // TRƯỜNG HỢP 1: XÁC NHẬN KẾT QUẢ (Từ Processing -> Ready)
        if (targetStatus === "READY_FOR_PICKUP") {
            return (
                <>
                    <div className="alert alert-success border-0 d-flex align-items-center mb-3">
                        <i className="bi bi-check-circle-fill me-2 fs-4"></i>
                        <div>
                            <strong>Xác nhận hoàn thành xử lý</strong><br/>
                            Hồ sơ sẽ chuyển sang trạng thái: <span className="badge bg-success">Chờ nhận KQ</span>
                        </div>
                    </div>

                    <div className="mb-3">
                        <label className="form-label fw-bold text-primary">
                            <i className="bi bi-geo-alt-fill me-1"></i> Sinh viên đến nhận tại phòng nào?
                        </label>
                        <input 
                            type="text" 
                            className="form-control form-control-lg fw-bold text-primary" 
                            value={room}
                            onChange={(e) => setRoom(e.target.value)}
                            placeholder="VD: C01, A205..."
                            autoFocus
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label fw-bold text-muted small">Nội dung sẽ gửi sinh viên (Preview):</label>
                        <div className="p-3 bg-light rounded border text-muted fst-italic">
                            "Đã có kết quả, em đến phòng <strong>{room || "..."}</strong> nhận kết quả."
                        </div>
                    </div>
                </>
            );
        }

        // TRƯỜNG HỢP 2: TỪ CHỐI (Từ Processing -> Rejected)
        if (targetStatus === "REJECTED") {
            return (
                <>
                    <div className="alert alert-danger border-0 mb-3">
                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                        <strong>Từ chối hồ sơ này?</strong>
                    </div>
                    <div className="mb-3">
                        <label className="form-label fw-bold text-danger">Lý do từ chối (Bắt buộc):</label>
                        <textarea 
                            className="form-control" rows="4"
                            placeholder="VD: Hồ sơ thiếu ảnh, thông tin không khớp..."
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            autoFocus
                        ></textarea>
                    </div>
                </>
            );
        }

        // TRƯỜNG HỢP 3: ĐÃ TRẢ HỒ SƠ (Từ Ready -> Completed)
        if (targetStatus === "COMPLETED") {
            return (
                <div className="text-center py-4">
                    <i className="bi bi-person-check-fill text-primary" style={{fontSize: "3rem"}}></i>
                    <h5 className="mt-3">Xác nhận đã trả hồ sơ cho sinh viên?</h5>
                    <p className="text-muted">Hồ sơ sẽ được đóng lại và lưu vào lịch sử.</p>
                </div>
            );
        }

        // TRƯỜNG HỢP 4: MẶC ĐỊNH (Tiếp nhận hoặc Sửa chữa)
        return (
            <div className="mb-3">
                <label className="form-label fw-bold">Ghi chú xử lý:</label>
                <textarea 
                    className="form-control" rows="3"
                    placeholder="Nhập ghi chú..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                ></textarea>
            </div>
        );
    };

    return (
        <>
            <div className="modal-backdrop show"></div>
            <div className="modal d-block animate__animated animate__fadeInDown" tabIndex="-1">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content shadow border-0">
                        <div className="modal-header bg-white border-bottom-0">
                            <h5 className="modal-title fw-bold text-primary">
                                <i className="bi bi-pencil-square me-2"></i> 
                                Xử lý hồ sơ: {request.studentName}
                            </h5>
                            <button type="button" className="btn-close" onClick={onClose}></button>
                        </div>
                        
                        <div className="modal-body pt-0">
                            {/* Thông tin thủ tục (Luôn hiện) */}
                            <div className="mb-4 pb-3 border-bottom">
                                <small className="text-muted text-uppercase fw-bold" style={{fontSize: "0.7rem"}}>Thủ tục yêu cầu</small>
                                <div className="fw-bold text-dark fs-5">{request.procedureName}</div>
                            </div>

                            {/* Nội dung thay đổi theo trạng thái */}
                            {renderModalContent()}
                        </div>

                        <div className="modal-footer border-top-0">
                            <button type="button" className="btn btn-light" onClick={onClose}>Đóng</button>
                            <button type="button" className="btn btn-primary px-4 fw-bold" onClick={handleSubmit}>
                                <i className="bi bi-check-lg me-1"></i> Xác nhận
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}