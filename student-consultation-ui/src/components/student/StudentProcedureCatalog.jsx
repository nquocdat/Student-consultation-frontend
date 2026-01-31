import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function StudentProcedureCatalog() {
    const navigate = useNavigate();
    const DOMAIN = "http://localhost:8080";
    
    // State dữ liệu gốc
    const [procedures, setProcedures] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // 🔍 1. STATE TÌM KIẾM
    const [searchTerm, setSearchTerm] = useState("");

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

    // 🔍 2. LOGIC LỌC THỦ TỤC
    const filteredProcedures = procedures.filter(p => {
        const term = searchTerm.toLowerCase().trim();
        if (!term) return true; // Nếu không tìm gì thì hiện hết

        // Tìm theo Tên thủ tục OR Mã thủ tục
        const nameMatch = p.name?.toLowerCase().includes(term);
        const codeMatch = p.code?.toLowerCase().includes(term);

        return nameMatch || codeMatch;
    });

    // Hàm tải file mẫu
    const handleDownloadTemplate = (fileUrl) => {
        if (!fileUrl) {
            alert("Thủ tục này chưa có biểu mẫu hướng dẫn!");
            return;
        }
        const fullUrl = `${DOMAIN}${fileUrl}`;
        window.location.href = fullUrl; 
    };

    const handleSelect = (id) => {
        navigate("/student/procedures/create", { state: { procedureId: id } });
    };

    return (
        <div className="container-fluid animate__animated animate__fadeIn">
            
            {/* HEADER: Tiêu đề + Thanh tìm kiếm */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
                <h3 className="fw-bold text-primary m-0">📂 Danh Mục Thủ Tục</h3>
                
                {/* 🔍 3. THANH TÌM KIẾM ĐẸP (Modern Search Bar) */}
                <div style={{ minWidth: "300px" }}>
                    <div className="input-group shadow-sm rounded-pill overflow-hidden bg-white border">
                        <span className="input-group-text bg-white border-0 ps-3">
                            <i className="bi bi-search text-muted"></i>
                        </span>
                        <input 
                            type="text" 
                            className="form-control border-0 shadow-none ps-2 py-2" 
                            placeholder="Tìm tên hoặc mã thủ tục..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <button 
                                className="btn btn-white border-0 pe-3 text-secondary" 
                                onClick={() => setSearchTerm("")}
                            >
                                <i className="bi bi-x-circle-fill"></i>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* DANH SÁCH THỦ TỤC */}
            <div className="row">
                {loading ? (
                    <div className="text-center w-100 py-5">
                        <div className="spinner-border text-primary"></div>
                    </div>
                ) : filteredProcedures.length > 0 ? (
                    filteredProcedures.map(p => {
                        const fileUrl = p.templateUrl || p.template_url;

                        return (
                            <div key={p.id} className="col-md-6 col-lg-4 mb-4 animate__animated animate__fadeInUp">
                                <div className="card h-100 border-0 shadow-sm hover-card transition-all">
                                    <div className="card-body p-4">
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                            <h6 className="fw-bold text-dark mb-0">{p.name}</h6>
                                            <span className="badge bg-light text-secondary border font-monospace ms-2">
                                                {p.code}
                                            </span>
                                        </div>
                                        
                                        <p className="text-muted small mb-4" style={{minHeight: "40px", lineHeight: "1.5"}}>
                                            {p.description || "Thủ tục hành chính dành cho sinh viên."}
                                        </p>
                                        
                                        <div className="d-grid gap-2">
                                            <button 
                                                className={`btn btn-sm ${fileUrl ? 'btn-outline-secondary' : 'btn-outline-secondary disabled'}`}
                                                onClick={() => handleDownloadTemplate(fileUrl)} 
                                                disabled={!fileUrl}
                                            >
                                                <i className="bi bi-download me-2"></i>
                                                {fileUrl ? "Tải mẫu hướng dẫn" : "Chưa có mẫu"}
                                            </button>

                                            <button className="btn btn-primary btn-sm fw-bold shadow-sm" onClick={() => handleSelect(p.id)}>
                                                Chọn thủ tục này <i className="bi bi-arrow-right ms-1"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    // Thông báo khi không tìm thấy kết quả
                    <div className="text-center py-5 text-muted w-100">
                        <i className="bi bi-search display-1 text-light d-block mb-3"></i>
                        <p className="lead">Không tìm thấy thủ tục nào khớp với "<strong>{searchTerm}</strong>"</p>
                        <button className="btn btn-link text-decoration-none" onClick={() => setSearchTerm("")}>
                            Xem tất cả thủ tục
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}