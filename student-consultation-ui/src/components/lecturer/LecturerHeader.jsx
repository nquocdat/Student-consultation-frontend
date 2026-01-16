// LecturerHeader.jsx
export default function LecturerHeader() {
    return (
        <nav className="navbar bg-white shadow-sm px-4" style={{ height: 64 }}>
            
            {/* Bên trái: Breadcrumb hoặc Tiêu đề */}
            <span className="navbar-brand fw-bold text-primary">
                Khu vực giảng viên
            </span>

            {/* Bên phải: Chỉ để lại Thông báo (nếu có) */}
            <div className="d-flex align-items-center gap-3">
                <button className="btn btn-light position-relative rounded-circle p-2">
                    🔔
                    <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle">
                        <span className="visually-hidden">New alerts</span>
                    </span>
                </button>
            </div>
        </nav>
    );
}