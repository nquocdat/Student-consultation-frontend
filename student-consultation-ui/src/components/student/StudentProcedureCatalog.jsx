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
                            <div className="card h-100 border-0 shadow-sm">
                                <div className="card-body p-4">
                                    <h6 className="fw-bold text-dark">{p.name}</h6>
                                    <small className="text-muted d-block mb-3">{p.code}</small>
                                    <p className="text-muted small mb-4">{p.description}</p>
                                    <div className="d-grid gap-2">
                                        {p.templateUrl && (
                                            <a href={DOMAIN + p.templateUrl} className="btn btn-outline-secondary btn-sm" download>
                                                <i className="bi bi-download me-2"></i>Tải mẫu
                                            </a>
                                        )}
                                        <button className="btn btn-primary btn-sm" onClick={() => handleSelect(p.id)}>
                                            Chọn thủ tục này
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