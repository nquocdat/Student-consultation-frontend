import React, { useState, useEffect } from "react";

const LecturerSelectModal = ({ show, onClose, onSelect, lecturers }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterDept, setFilterDept] = useState("");
    const [filteredList, setFilteredList] = useState([]);

    // Logic lọc (Vẫn giữ nguyên để tìm kiếm hoạt động tốt)
    useEffect(() => {
        if (!lecturers || lecturers.length === 0) {
            setFilteredList([]);
            return;
        }

        let result = lecturers;

        // 1. Lọc theo Khoa
        if (filterDept) {
            result = result.filter(l => l.department === filterDept);
        }

        // 2. Lọc theo Tên (Tìm kiếm)
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            result = result.filter(l => {
                // Kiểm tra an toàn null
                const name = (l.fullName || l.user?.fullName || "").toLowerCase();
                const username = (l.username || l.user?.username || "").toLowerCase();
                // Vẫn cho phép tìm theo mã ngầm bên dưới, dù không hiện ra
                return name.includes(lowerTerm) || username.includes(lowerTerm);
            });
        }
        setFilteredList(result);
    }, [searchTerm, filterDept, lecturers]);

    if (!show) return null;

    return (
        <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}>
            <div className="modal-dialog modal-lg modal-dialog-scrollable">
                <div className="modal-content">
                    {/* HEADER */}
                    <div className="modal-header border-0 pb-0">
                        <h5 className="modal-title fw-bold text-primary">
                            <i className="bi bi-people-fill me-2"></i>Tìm & Chọn Giảng Viên
                        </h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    
                    <div className="modal-body bg-light pt-3">
                        {/* --- THANH TÌM KIẾM & LỌC --- */}
                        <div className="row g-2 mb-3 sticky-top bg-light pb-2" style={{zIndex: 10}}>
                            <div className="col-md-4">
                                <select className="form-select shadow-sm" onChange={(e) => setFilterDept(e.target.value)}>
                                    <option value="">-- Tất cả Khoa --</option>
                                    <option value="CNTT">Khoa CNTT</option>
                                    <option value="KINHTE">Khoa Kinh Tế</option>
                                    <option value="MOITRUONG">Khoa Môi Trường</option>
                                    <option value="QTKD">Quản Trị Kinh Doanh</option>
                                    <option value="QLDD">Quản Lý Đất Đai</option>
                                </select>
                            </div>
                            <div className="col-md-8">
                                <div className="input-group shadow-sm">
                                    <span className="input-group-text bg-white border-end-0"><i className="bi bi-search"></i></span>
                                    <input 
                                        type="text" 
                                        className="form-control border-start-0" 
                                        placeholder="Nhập tên giảng viên để tìm..." 
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* --- NÚT CHỌN HỆ THỐNG TỰ ĐỘNG --- */}
                        <div className="card mb-4 border-primary shadow-sm hover-scale" 
                             style={{cursor: 'pointer', transition: '0.2s'}} 
                             onClick={() => onSelect(null)}> 
                            <div className="card-body d-flex align-items-center justify-content-between py-3">
                                <div className="d-flex align-items-center">
                                    <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center me-3" style={{width: 45, height: 45}}>
                                        <i className="bi bi-robot fs-4"></i>
                                    </div>
                                    <div>
                                        <h6 className="fw-bold mb-0 text-primary">Hệ thống tự phân công</h6>
                                        <small className="text-muted">Chọn mục này nếu bạn không yêu cầu giảng viên cụ thể</small>
                                    </div>
                                </div>
                                <i className="bi bi-chevron-right text-muted"></i>
                            </div>
                        </div>

                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <h6 className="text-muted small fw-bold mb-0">DANH SÁCH GIẢNG VIÊN ({filteredList.length})</h6>
                        </div>

                        {/* --- DANH SÁCH GIẢNG VIÊN (GRID) --- */}
                        <div className="row g-3">
                            {filteredList.map(lec => {
                                // Xử lý dữ liệu hiển thị an toàn
                                const displayName = lec.fullName || lec.user?.fullName || "Chưa cập nhật tên";
                                const avatar = lec.avatarUrl || lec.avatar || "https://via.placeholder.com/150";
                                const dept = lec.department || "Chưa có khoa";
                                const degree = lec.academicDegree ? `${lec.academicDegree}. ` : "";

                                return (
                                    <div key={lec.id} className="col-md-6">
                                        <div className="card h-100 border-0 shadow-sm" 
                                             onClick={() => onSelect(lec)} // 🔥 Bấm vào là CHỌN LUÔN
                                             style={{cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s'}}
                                             onMouseEnter={(e) => {
                                                 e.currentTarget.style.transform = 'translateY(-3px)';
                                                 e.currentTarget.style.boxShadow = '0 .5rem 1rem rgba(0,0,0,.15)';
                                             }}
                                             onMouseLeave={(e) => {
                                                 e.currentTarget.style.transform = 'translateY(0)';
                                                 e.currentTarget.style.boxShadow = '0 .125rem .25rem rgba(0,0,0,.075)';
                                             }}
                                        >
                                            <div className="card-body d-flex align-items-center p-3">
                                                {/* Avatar to hơn chút cho dễ nhìn */}
                                                <img 
                                                    src={avatar} 
                                                    alt="avt" 
                                                    className="rounded-circle border me-3"
                                                    style={{width: "65px", height: "65px", objectFit: "cover"}}
                                                />
                                                
                                                {/* Thông tin gọn gàng */}
                                                <div className="flex-grow-1">
                                                    <h6 className="fw-bold mb-1 text-dark">
                                                        {degree}{displayName}
                                                    </h6>
                                                    
                                                    {/* Badge Khoa màu mè chút cho đẹp */}
                                                    <span className={`badge ${getDepartmentColor(dept)} bg-opacity-10 text-dark border`}>
                                                        {dept}
                                                    </span>
                                                    
                                                    {/* ẨN DÒNG MÃ THEO YÊU CẦU */}
                                                </div>
                                                
                                                {/* Mũi tên chỉ dẫn bấm vào */}
                                                <i className="bi bi-chevron-right text-muted small"></i>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            
                            {filteredList.length === 0 && (
                                <div className="text-center py-5 text-muted w-100">
                                    <i className="bi bi-search display-6 mb-3 d-block opacity-50"></i>
                                    Không tìm thấy giảng viên nào phù hợp.
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className="modal-footer bg-white border-top-0">
                        <button type="button" className="btn btn-light text-secondary fw-bold" onClick={onClose}>Đóng cửa sổ</button>
                    </div>
                </div>
            </div>
        </div>
    );
};


const getDepartmentColor = (dept) => {
    if (dept === 'CNTT') return 'bg-primary';
    if (dept === 'KINHTE') return 'bg-success';
    if (dept === 'QTKD') return 'bg-warning';
    return 'bg-secondary';
};

export default LecturerSelectModal;