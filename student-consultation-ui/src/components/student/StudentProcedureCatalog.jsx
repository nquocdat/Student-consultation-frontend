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
                const res = await axios.get(`${DOMAIN}/api/procedures`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setProcedures(res.data);
            } catch (err) { console.error(err); } 
            finally { setLoading(false); }
        };
        fetchProcedures();
    }, []);

    // ⭐ HÀM TẢI FILE ĐÃ SỬA: NHẬN URL CỦA TỪNG THỦ TỤC
    const handleDownloadTemplate = (fileUrl) => {
        // Kiểm tra xem thủ tục đó có file không
        if (!fileUrl) {
            alert("Thủ tục này chưa có biểu mẫu hướng dẫn!");
            return;
        }

        // Tạo đường dẫn đầy đủ
        // fileUrl từ DB có dạng: /files/170999_abc.docx
        const fullUrl = `${DOMAIN}${fileUrl}`;
        
        // Mở link trực tiếp để trình duyệt tải
        window.location.href = fullUrl; 
    };

    const handleSelect = (id) => {
        navigate("/student/procedures/create", { state: { procedureId: id } });
    };

    return (
        <div className="container-fluid animate__animated animate__fadeIn">
            <h3 className="fw-bold text-primary mb-4">📂 Danh Mục Thủ Tục</h3>
            <div className="row">
                {loading ? <div className="text-center w-100"><div className="spinner-border text-primary"></div></div> : (
                    procedures.map(p => {
                        // Lấy link file (ưu tiên camelCase nếu có)
                        const fileUrl = p.templateUrl || p.template_url;

                        return (
                            <div key={p.id} className="col-md-6 col-lg-4 mb-4">
                                <div className="card h-100 border-0 shadow-sm hover-card">
                                    <div className="card-body p-4">
                                        <h6 className="fw-bold text-dark">{p.name}</h6>
                                        <small className="text-muted d-block mb-3 font-monospace">{p.code}</small>
                                        <p className="text-muted small mb-4" style={{minHeight: "40px"}}>
                                            {p.description || "Thủ tục hành chính dành cho sinh viên."}
                                        </p>
                                        <div className="d-grid gap-2">
                                            
                                            {/* 👇 NÚT TẢI MẪU: TRUYỀN ĐÚNG FILE CỦA THỦ TỤC ĐÓ */}
                                            <button 
                                                className={`btn btn-sm ${fileUrl ? 'btn-outline-secondary' : 'btn-outline-secondary disabled'}`}
                                                onClick={() => handleDownloadTemplate(fileUrl)} 
                                                title={fileUrl ? "Tải biểu mẫu hướng dẫn" : "Chưa có biểu mẫu"}
                                            >
                                                <i className="bi bi-download me-2"></i>
                                                {fileUrl ? "Tải mẫu hướng dẫn" : "Chưa có mẫu"}
                                            </button>

                                            <button className="btn btn-primary btn-sm" onClick={() => handleSelect(p.id)}>
                                                Chọn thủ tục này <i className="bi bi-arrow-right ms-1"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}