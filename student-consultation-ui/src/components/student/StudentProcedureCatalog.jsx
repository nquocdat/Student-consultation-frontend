import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function StudentProcedureCatalog() {
    const navigate = useNavigate();
    const DOMAIN = "http://localhost:8080";
    const [procedures, setProcedures] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchProcedures = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem("token");
                // Lấy danh sách thủ tục
                const res = await axios.get(`${DOMAIN}/api/procedures`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setProcedures(res.data);
            } catch (err) { console.error(err); } 
            finally { setLoading(false); }
        };
        fetchProcedures();
    }, []);

    // ⭐ HÀM TẢI FILE: "TUYỆT CHIÊU CUỐI"
    // Gọi thẳng vào API Controller mà không cần xử lý Blob phức tạp
    const handleDownloadTemplate = () => {
        // Đường dẫn API Java bạn vừa viết: /api/procedures/template
        const url = `${DOMAIN}/api/procedures/template`;
        
        // Mở tab mới, trình duyệt sẽ tự động tải file về
        // Vì bên Java đã set Header "attachment", nên nó sẽ không mở file mà tải xuống luôn
        window.open(url, "_blank");
    };

    // Chuyển sang trang tạo và mang theo ID thủ tục đã chọn
    const handleSelect = (id) => {
        navigate("/student/procedures/create", { state: { procedureId: id } });
    };

    return (
        <div className="container-fluid animate__animated animate__fadeIn">
            <h3 className="fw-bold text-primary mb-4">📂 Danh Mục Thủ Tục</h3>
            <div className="row">
                {loading ? <div className="text-center w-100"><div className="spinner-border text-primary"></div></div> : (
                    procedures.map(p => (
                        <div key={p.id} className="col-md-6 col-lg-4 mb-4">
                            <div className="card h-100 border-0 shadow-sm hover-card">
                                <div className="card-body p-4">
                                    <h6 className="fw-bold text-dark">{p.name}</h6>
                                    <small className="text-muted d-block mb-3 font-monospace">{p.code}</small>
                                    <p className="text-muted small mb-4" style={{minHeight: "40px"}}>
                                        {p.description || "Thủ tục hành chính dành cho sinh viên."}
                                    </p>
                                    <div className="d-grid gap-2">
                                        
                                        {/* 👇 NÚT TẢI MẪU ĐÃ SỬA LẠI ĐƠN GIẢN NHẤT */}
                                        <button 
                                            className="btn btn-outline-secondary btn-sm" 
                                            onClick={handleDownloadTemplate} 
                                        >
                                            <i className="bi bi-download me-2"></i>Tải mẫu
                                        </button>

                                        <button className="btn btn-primary btn-sm" onClick={() => handleSelect(p.id)}>
                                            Chọn thủ tục này <i className="bi bi-arrow-right ms-1"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}