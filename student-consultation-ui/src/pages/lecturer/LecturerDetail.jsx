import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const LecturerDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [lecturer, setLecturer] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // API này giờ trả về LecturerDTO (dạng phẳng)
        fetch(`https://student-consultation-nqd.onrender.com/api/lecturers/${id}`)
            .then(res => {
                if (!res.ok) throw new Error("Không tìm thấy giảng viên");
                return res.json();
            })
            .then(data => {
                console.log("Dữ liệu DTO nhận được:", data); // Check log để chắc chắn
                setLecturer(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [id]);

    if (loading) return <div className="p-5 text-center fs-5">⏳ Đang tải thông tin...</div>;
    if (!lecturer) return <div className="p-5 text-center text-danger">❌ Không tìm thấy thông tin!</div>;

    // 👇 SỬA ĐỔI QUAN TRỌNG: Lấy dữ liệu trực tiếp (vì DTO đã phẳng)
    // Không còn lecturer.user.fullName nữa, mà là lecturer.fullName luôn
    const fullName = lecturer.fullName || "Tên chưa cập nhật";
    const email = lecturer.email || "Chưa cập nhật";
    const avatarUrl = lecturer.avatar; 

    return (
        <div className="container mt-4">
            <button className="btn btn-outline-secondary mb-3 border-0" onClick={() => navigate(-1)}>
                ⬅ Quay lại
            </button>
            
            <div className="card shadow border-0 rounded-4 overflow-hidden">
                {/* Header Card: Ảnh bìa + Avatar */}
                <div className="bg-primary bg-opacity-10 position-relative" style={{height: "120px"}}></div>
                
                <div className="px-4 pb-4 position-relative" style={{marginTop: "-60px"}}>
                    <div className="d-flex align-items-end mb-3">
                        {/* Avatar */}
                        {avatarUrl ? (
                            <img 
                                src={avatarUrl} 
                                alt="Avatar" 
                                className="rounded-circle border border-4 border-white shadow bg-white object-fit-cover"
                                style={{width: "120px", height: "120px"}}
                                onError={(e) => {
                                    e.target.onerror = null; 
                                    e.target.src = "https://via.placeholder.com/150?text=GV";
                                }}
                            />
                        ) : (
                            <div className="rounded-circle border border-4 border-white shadow bg-white d-flex align-items-center justify-content-center text-primary fw-bold display-4"
                                 style={{width: "120px", height: "120px"}}>
                                {fullName.charAt(0)}
                            </div>
                        )}
                        
                        <div className="ms-3 mb-2">
                            <h2 className="fw-bold mb-0">{fullName}</h2>
                            <span className="badge bg-primary rounded-pill mt-1">Giảng viên</span>
                        </div>
                    </div>

                    <div className="row g-4 mt-2">
                        {/* Cột trái: Thông tin liên hệ */}
                        <div className="col-md-5">
                            <div className="card bg-light border-0 rounded-3 h-100">
                                <div className="card-body">
                                    <h5 className="fw-bold text-secondary mb-3">📍 Thông tin liên hệ</h5>
                                    
                                    <div className="mb-3">
                                        <label className="small text-muted fw-bold text-uppercase">Email</label>
                                        <div className="fw-medium">{email}</div>
                                    </div>

                                    <div className="mb-3">
                                        <label className="small text-muted fw-bold text-uppercase">Phòng làm việc</label>
                                        <div className="fw-medium">{lecturer.office || "---"}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Cột phải: Thông tin chuyên môn */}
                        <div className="col-md-7">
                            <div className="card border-0 shadow-sm h-100">
                                <div className="card-body">
                                    <h5 className="fw-bold text-primary mb-3">🎓 Thông tin chuyên môn</h5>
                                    
                                    <div className="row mb-3">
                                        <div className="col-6">
                                            <label className="small text-muted fw-bold">Khoa / Bộ môn</label>
                                            <div>{lecturer.department || "---"}</div>
                                        </div>
                                        <div className="col-6">
                                            <label className="small text-muted fw-bold">Ngày sinh</label>
                                            {/* Format ngày sinh (yyyy-mm-dd -> dd/mm/yyyy) */}
                                            <div>{lecturer.dob ? new Date(lecturer.dob).toLocaleDateString('vi-VN') : "---"}</div>
                                        </div>
                                    </div>

                                    <div className="row mb-3">
                                        <div className="col-6">
                                            <label className="small text-muted fw-bold">Học vị</label>
                                            <div>{lecturer.academicDegree || "---"}</div>
                                        </div>
                                        <div className="col-6">
                                            <label className="small text-muted fw-bold">Học hàm</label>
                                            <div>{lecturer.academicRank || "---"}</div>
                                        </div>
                                    </div>

                                    <hr className="opacity-10"/>
                                    
                                    <label className="small text-muted fw-bold mb-1">Giới thiệu</label>
                                    <p className="text-secondary small" style={{whiteSpace: "pre-line"}}>
                                        {lecturer.description || "Giảng viên chưa cập nhật thông tin giới thiệu."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LecturerDetail;