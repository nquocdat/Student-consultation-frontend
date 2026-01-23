import { useEffect, useState } from "react";
import axios from "axios";
import StaffFilter from "./StaffFilter";
import StaffRequestTable from "./StaffRequestTable";
import StaffUpdateModal from "./StaffUpdateModal";

export default function StaffProcedureManager() {
    const DOMAIN = "http://localhost:8080";
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Mặc định vào là tab "Chờ xử lý" (PENDING) cho giống Shopee (cần xử lý việc cần làm trước)
    const [filterStatus, setFilterStatus] = useState("PENDING"); 
    
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);

    // 1. TẢI DỮ LIỆU
    const fetchRequests = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const url = filterStatus 
                ? `${DOMAIN}/api/procedures/staff/requests?status=${filterStatus}`
                : `${DOMAIN}/api/procedures/staff/requests`;

            const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
            setRequests(res.data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)));
            setSelectedIds([]); // Reset chọn khi đổi tab
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchRequests(); }, [filterStatus]);

    // 2. CHECKBOX LOGIC
    const handleToggleSelect = (id) => {
        if (selectedIds.includes(id)) setSelectedIds(selectedIds.filter(i => i !== id));
        else setSelectedIds([...selectedIds, id]);
    };

    const handleToggleAll = (isChecked) => {
        setSelectedIds(isChecked ? requests.map(r => r.id) : []);
    };

    // 3. LOGIC BULK ACTION (XỬ LÝ HÀNG LOẠT)
    const handleBulkAction = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;

        // CẤU HÌNH HÀNH ĐỘNG DỰA TRÊN TAB HIỆN TẠI
        let nextStatus = "";
        let note = "";
        let confirmMsg = "";
        let shouldDownload = false;

        if (filterStatus === "PENDING") {
            nextStatus = "PROCESSING";
            note = "Đã tiếp nhận hồ sơ, đang xử lý.";
            confirmMsg = `Tiếp nhận ${selectedIds.length} hồ sơ và TẢI FILE về?`;
            shouldDownload = true;
        } else if (filterStatus === "PROCESSING") {
            nextStatus = "READY_FOR_PICKUP";
            note = "Đã có kết quả, em đến phòng C01 nhận kết quả.";
            confirmMsg = `Xác nhận ĐÃ XONG ${selectedIds.length} hồ sơ này (Chuyển sang Chờ nhận KQ)?`;
        } else if (filterStatus === "READY_FOR_PICKUP") {
            nextStatus = "COMPLETED";
            note = "Sinh viên đã nhận kết quả. Hoàn tất.";
            confirmMsg = `Xác nhận ĐÃ TRẢ ${selectedIds.length} hồ sơ (Chuyển sang Hoàn thành)?`;
        } else {
            return; // Các tab khác không có bulk action
        }

        if (!window.confirm(confirmMsg)) return;

        setLoading(true);
        try {
            for (const id of selectedIds) {
                // Nếu là tab Chờ xử lý thì tải file
                if (shouldDownload) {
                    await downloadFile(id);
                    await new Promise(r => setTimeout(r, 300)); // Delay nhỏ
                }

                // Gọi API chuyển trạng thái
                await axios.put(`${DOMAIN}/api/procedures/staff/request/${id}/status`, 
                    { status: nextStatus, note: note }, 
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }
            alert("Xử lý thành công!");
            fetchRequests();
        } catch (err) {
            alert("Có lỗi xảy ra!");
        } finally {
            setLoading(false);
        }
    };

    // Hàm tải file lẻ
    const downloadFile = async (requestId) => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(`${DOMAIN}/api/procedures/request/${requestId}/download`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `HoSo_${requestId}.docx`); 
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (e) { console.error("Lỗi tải file", e); }
    };

    // Xử lý cập nhật lẻ từ Modal
    const handleUpdateSubmit = async (requestId, newStatus, note) => {
        try {
            const token = localStorage.getItem("token");
            await axios.put(`${DOMAIN}/api/procedures/staff/request/${requestId}/status`, {
                status: newStatus,
                note: note
            }, { headers: { Authorization: `Bearer ${token}` } });
            alert("Cập nhật thành công!");
            setSelectedRequest(null);
            fetchRequests();
        } catch (err) { alert("Lỗi: " + err.message); }
    };

    // --- RENDER NÚT HÀNG LOẠT ---
    const renderBulkButton = () => {
        if (selectedIds.length === 0) return null;

        if (filterStatus === "PENDING") {
            return (
                <button className="btn btn-success fw-bold shadow-sm" onClick={handleBulkAction}>
                    <i className="bi bi-cloud-download me-2"></i> Tiếp nhận & Tải file ({selectedIds.length})
                </button>
            );
        }
        if (filterStatus === "PROCESSING") {
            return (
                <button className="btn btn-primary fw-bold shadow-sm" onClick={handleBulkAction}>
                    <i className="bi bi-check2-circle me-2"></i> Xác nhận Đã Xong ({selectedIds.length})
                </button>
            );
        }
        if (filterStatus === "READY_FOR_PICKUP") {
            return (
                <button className="btn btn-info text-white fw-bold shadow-sm" onClick={handleBulkAction}>
                    <i className="bi bi-box-seam me-2"></i> Xác nhận Đã Trả HS ({selectedIds.length})
                </button>
            );
        }
        return null;
    };

    return (
        <div className="container-fluid animate__animated animate__fadeIn p-0 bg-light min-vh-100">
            {/* 1. Filter Tab */}
            <StaffFilter filterStatus={filterStatus} setFilterStatus={setFilterStatus} />

            <div className="px-4">
                {/* 2. Thanh công cụ Bulk Action */}
                {selectedIds.length > 0 && (
                    <div className="alert alert-warning border-0 shadow-sm d-flex justify-content-between align-items-center mb-3">
                        <div><i className="bi bi-check-square-fill me-2"></i>Đang chọn <strong>{selectedIds.length}</strong> yêu cầu.</div>
                        <div>{renderBulkButton()}</div>
                    </div>
                )}

                {/* 3. Bảng dữ liệu */}
                <StaffRequestTable 
                    requests={requests}
                    loading={loading}
                    onDownload={downloadFile}
                    onOpenModal={(req) => setSelectedRequest(req)} // Modal dùng cho "Từ chối" hoặc sửa lẻ
                    selectedIds={selectedIds}
                    onToggleSelect={handleToggleSelect}
                    onToggleAll={handleToggleAll}
                    filterStatus={filterStatus} // Truyền status xuống để ẩn/hiện cột
                />
            </div>

            {/* 4. Modal (Dùng chung) */}
            <StaffUpdateModal 
                request={selectedRequest}
                onClose={() => setSelectedRequest(null)}
                onUpdate={handleUpdateSubmit}
            />
        </div>
    );
}