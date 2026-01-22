import { useEffect, useState } from "react";
import axios from "axios";

export default function StudentProcedureHistory() {
    const DOMAIN = "http://localhost:8080";
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchHistory = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get(`${DOMAIN}/api/procedures/request/my`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setHistory(res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
            } catch (err) { console.error(err); } 
            finally { setLoading(false); }
        };
        fetchHistory();
    }, []);

    const getStatusBadge = (status) => {
        const map = {
            "PENDING": "bg-warning text-dark",
            "PROCESSING": "bg-info text-dark",
            "READY_FOR_PICKUP": "bg-success",
            "COMPLETED": "bg-primary",
            "REJECTED": "bg-danger"
        };
        return <span className={`badge ${map[status] || "bg-secondary"}`}>{status}</span>;
    };

    return (
        <div className="container-fluid animate__animated animate__fadeIn">
            <h3 className="fw-bold text-primary mb-4">🔍 Kết Quả Hồ Sơ</h3>
            <div className="card border-0 shadow-sm">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th className="ps-3">Thủ tục</th>
                                <th>Ngày gửi</th>
                                <th>Trạng thái</th>
                                <th>Phản hồi Staff</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.map(h => (
                                <tr key={h.id}>
                                    <td className="ps-3 fw-bold">{h.procedureName}</td>
                                    <td>{new Date(h.createdAt).toLocaleDateString('vi-VN')}</td>
                                    <td>{getStatusBadge(h.status)}</td>
                                    <td className="text-primary">{h.staffNote || "--"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}