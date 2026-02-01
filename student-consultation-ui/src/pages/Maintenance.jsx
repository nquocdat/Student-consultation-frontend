import React from "react";

export default function Maintenance() {
    return (
        <div className="d-flex flex-column justify-content-center align-items-center vh-100 bg-light text-center p-4">
            <div className="animate__animated animate__fadeInDown">
                <i className="bi bi-cone-striped text-warning display-1 mb-3"></i>
                <h1 className="fw-bold text-dark mb-3">Hệ Thống Đang Bảo Trì</h1>
                <p className="lead text-muted mb-4" style={{ maxWidth: "600px" }}>
                    Chúng tôi đang tiến hành nâng cấp hệ thống để phục vụ bạn tốt hơn. 
                    Vui lòng quay lại sau ít phút. Xin lỗi vì sự bất tiện này!
                </p>
                <button 
                    className="btn btn-primary px-4 py-2 fw-bold" 
                    onClick={() => window.location.reload()}
                >
                    <i className="bi bi-arrow-clockwise me-2"></i>Thử lại
                </button>
            </div>
            
            <div className="mt-5 text-muted small">
                &copy; 2024 Student Consultation System
            </div>
        </div>
    );
}