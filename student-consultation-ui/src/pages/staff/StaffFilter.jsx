import React from "react";

export default function StaffFilter({ filterStatus, setFilterStatus, onRefresh }) {
    return (
        <div className="card border-0 shadow-sm mb-4">
            <div className="card-body">
                <div className="row g-3 align-items-center">
                    <div className="col-auto">
                        <label className="fw-bold me-2">Lọc trạng thái:</label>
                    </div>
                    <div className="col-auto">
                        <select 
                            className="form-select" 
                            value={filterStatus} 
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="">-- Tất cả --</option>
                            <option value="PENDING">Chờ xử lý</option>
                            <option value="PROCESSING">Đang xử lý</option>
                            <option value="READY_FOR_PICKUP">Chờ nhận kết quả</option>
                            <option value="COMPLETED">Hoàn thành</option>
                            <option value="REJECTED">Đã từ chối</option>
                        </select>
                    </div>
                    <div className="col-auto ms-auto">
                        <button className="btn btn-outline-primary" onClick={onRefresh}>
                            <i className="bi bi-arrow-clockwise me-1"></i> Làm mới
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}