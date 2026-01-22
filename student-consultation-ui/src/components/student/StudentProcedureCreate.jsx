import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

export default function StudentProcedureCreate() {
    const location = useLocation();
    const navigate = useNavigate();
    const DOMAIN = "http://localhost:8080";

    const [procedures, setProcedures] = useState([]);
    // Tự động điền ID nếu từ trang Catalog chuyển sang
    const [selectedProcedureId, setSelectedProcedureId] = useState(location.state?.procedureId || "");
    const [reason, setReason] = useState("");
    const [file, setFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchProcedures = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get(`${DOMAIN}/api/procedures`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setProcedures(res.data);
            } catch (err) { console.error(err); }
        };
        fetchProcedures();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        
        const formData = new FormData();
        formData.append("procedureId", selectedProcedureId);
        formData.append("reason", reason);
        formData.append("file", file);

        try {
            setSubmitting(true);
            await axios.post(`${DOMAIN}/api/procedures/request`, formData, {
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }
            });
            alert("Gửi thành công!");
            navigate("/student/procedures/history"); // Gửi xong chuyển sang xem lịch sử
        } catch (err) {
            alert("Lỗi: " + (err.response?.data || "Hệ thống bận"));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="container-fluid animate__animated animate__fadeIn">
            <h3 className="fw-bold text-primary mb-4">📝 Tạo Yêu Cầu Mới</h3>
            <div className="card border-0 shadow-sm rounded-4" style={{maxWidth: "800px"}}>
                <div className="card-body p-4">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label fw-bold">Chọn thủ tục (*)</label>
                            <select className="form-select" value={selectedProcedureId} onChange={e => setSelectedProcedureId(e.target.value)} required>
                                <option value="">-- Chọn --</option>
                                {procedures.map(p => <option key={p.id} value={p.id}>{p.code} - {p.name}</option>)}
                            </select>
                        </div>
                        <div className="mb-3">
                            <label className="form-label fw-bold">Lý do / Ghi chú</label>
                            <textarea className="form-control" rows="3" value={reason} onChange={e => setReason(e.target.value)}></textarea>
                        </div>
                        <div className="mb-4">
                            <label className="form-label fw-bold">File đính kèm (*)</label>
                            <input type="file" className="form-control" onChange={e => setFile(e.target.files[0])} required />
                        </div>
                        <button type="submit" className="btn btn-primary w-100" disabled={submitting}>
                            {submitting ? "Đang gửi..." : "Gửi Yêu Cầu"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}