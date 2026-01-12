export default function LecturerProfileModal({ lecturer, onChange, onSave }) {
    return (
        <div className="modal fade show d-block" style={{ background: "#00000088" }}>
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Thông tin giảng viên</h5>
                    </div>

                    <div className="modal-body">
                        <div className="mb-3">
                            <label>Họ tên</label>
                            <input
                                type="text"
                                className="form-control"
                                value={lecturer.fullName}
                                onChange={e => onChange("fullName", e.target.value)}
                            />
                        </div>

                        <div className="mb-3">
                            <label>Email</label>
                            <input
                                type="email"
                                className="form-control"
                                value={lecturer.email}
                                disabled
                            />
                        </div>

                        <div className="mb-3">
                            <label>Số điện thoại</label>
                            <input
                                type="text"
                                className="form-control"
                                value={lecturer.phone}
                                onChange={e => onChange("phone", e.target.value)}
                            />
                        </div>

                        <div className="mb-3">
                            <label>Chuyên ngành</label>
                            <input
                                type="text"
                                className="form-control"
                                value={lecturer.specialization}
                                onChange={e => onChange("specialization", e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button className="btn btn-secondary">
                            Đóng
                        </button>
                        <button className="btn btn-primary" onClick={onSave}>
                            Lưu thay đổi
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
