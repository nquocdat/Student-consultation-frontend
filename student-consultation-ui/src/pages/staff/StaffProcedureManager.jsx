import { useEffect, useState } from "react";
import axios from "axios";
import JSZip from "jszip";
import { saveAs } from "file-saver";

import StaffFilter from "./StaffFilter";
import StaffRequestTable from "./StaffRequestTable";
import StaffUpdateModal from "./StaffUpdateModal";

export default function StaffProcedureManager() {
    const DOMAIN = "http://localhost:8080";
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Mặc định vào tab PENDING
    const [filterStatus, setFilterStatus] = useState("PENDING"); 
    
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);

    // --- 1. TẢI DỮ LIỆU ---
    const fetchRequests = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const url = filterStatus 
                ? `${DOMAIN}/api/procedures/staff/requests?status=${filterStatus}`
                : `${DOMAIN}/api/procedures/staff/requests`;

            const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
            setRequests(res.data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)));
            setSelectedIds([]); // Reset chọn khi load lại
        } catch (err) { console.error(err); } 
        finally { setLoading(false); }
    };
    
    useEffect(() => { fetchRequests(); }, [filterStatus]);

    // --- 2. XỬ LÝ CHECKBOX ---
    const handleToggleSelect = (id) => {
        if (selectedIds.includes(id)) setSelectedIds(selectedIds.filter(i => i !== id));
        else setSelectedIds([...selectedIds, id]);
    };

    const handleToggleAll = (isChecked) => {
        setSelectedIds(isChecked ? requests.map(r => r.id) : []);
    };

    // --- 3. HÀM TRỢ GIÚP LẤY ĐUÔI FILE ---
    const getFileExtension = (filename) => {
        if (!filename) return "docx"; 
        return filename.split('.').pop().toLowerCase();
    };

    // --- 4. TẢI FILE LẺ (Cho nút download ở từng dòng) ---
    const downloadFile = async (requestId) => {
        try {
            const request = requests.find(r => r.id === requestId);
            const originalUrl = request?.attachmentUrl || "";
            const ext = getFileExtension(originalUrl); 

            const token = localStorage.getItem("token");
            const res = await axios.get(`${DOMAIN}/api/procedures/request/${requestId}/download`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `HoSo_${request.studentCode}_${requestId}.${ext}`); 
            
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (e) { 
            console.error("Lỗi tải file", e); 
            alert("Không thể tải file. Vui lòng kiểm tra lại.");
        }
    };

    // --- 5. XỬ LÝ HÀNG LOẠT (ZIP + NHẬP PHÒNG + CHUYỂN TRẠNG THÁI) ---
    const handleBulkAction = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;

        let nextStatus = "";
        let note = "";
        let shouldDownload = false;

        // --- CẤU HÌNH HÀNH ĐỘNG DỰA TRÊN TAB ---
        if (filterStatus === "PENDING") {
            if (!window.confirm(`Bạn có chắc muốn TIẾP NHẬN ${selectedIds.length} hồ sơ và TẢI FILE ZIP về không?`)) return;
            
            nextStatus = "PROCESSING";
            note = "Đã tiếp nhận hồ sơ, đang xử lý.";
            shouldDownload = true; // Tab này cần tải file
        } 
        else if (filterStatus === "PROCESSING") {
            // 👇 Hộp thoại nhập số phòng cho tất cả hồ sơ đã chọn
            const room = window.prompt(`Nhập PHÒNG TRẢ KẾT QUẢ cho ${selectedIds.length} hồ sơ này:`, "C01");
            if (room === null) return; // Hủy bỏ
            if (room.trim() === "") {
                alert("Bạn chưa nhập tên phòng!"); return;
            }

            nextStatus = "READY_FOR_PICKUP";
            note = `Đã có kết quả, em đến phòng ${room} nhận kết quả.`;
        } 
        else if (filterStatus === "READY_FOR_PICKUP") {
            if (!window.confirm(`Xác nhận ĐÃ TRẢ ${selectedIds.length} hồ sơ?`)) return;

            nextStatus = "COMPLETED";
            note = "Sinh viên đã nhận kết quả. Hoàn tất.";
        } 
        else { return; }

        setLoading(true);
        const zip = new JSZip();
        const folderName = `HoSo_TiepNhan_${new Date().toLocaleDateString('vi-VN').replace(/\//g, '-')}`;
        const imgFolder = zip.folder(folderName);
        
        let successCount = 0;
        let fileCount = 0;

        try {
            for (const id of selectedIds) {
                // A. TẢI FILE VÀO ZIP (Chỉ khi ở tab Pending)
                if (shouldDownload) {
                    try {
                        const reqInfo = requests.find(r => r.id === id);
                        const ext = getFileExtension(reqInfo.attachmentUrl);
                        const fileName = `${reqInfo.studentCode}_${reqInfo.studentName}_${id}.${ext}`;

                        const fileRes = await axios.get(`${DOMAIN}/api/procedures/request/${id}/download`, {
                            headers: { Authorization: `Bearer ${token}` },
                            responseType: 'blob'
                        });

                        imgFolder.file(fileName, fileRes.data);
                        fileCount++;
                    } catch (downloadErr) {
                        console.error(`Lỗi tải file ID ${id}`, downloadErr);
                        imgFolder.file(`ERROR_${id}.txt`, "Lỗi tải file này.");
                    }
                }

                // B. GỌI API UPDATE TRẠNG THÁI
                try {
                    await axios.put(`${DOMAIN}/api/procedures/staff/request/${id}/status`, 
                        { status: nextStatus, note: note }, 
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    successCount++;
                } catch (updateErr) {
                    console.error(`Lỗi update trạng thái ID ${id}`, updateErr);
                }
            }

            // C. TẢI ZIP VỀ MÁY
            if (shouldDownload && fileCount > 0) {
                const content = await zip.generateAsync({ type: "blob" });
                saveAs(content, `${folderName}.zip`);
            }

            alert(`Xử lý thành công ${successCount}/${selectedIds.length} hồ sơ!`);
            fetchRequests(); 
            setSelectedIds([]); 

        } catch (err) {
            alert("Có lỗi xảy ra: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    // --- 6. CẬP NHẬT LẺ (TỪ MODAL) ---
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

    // --- 7. RENDER NÚT BẤM ---
    const renderBulkButton = () => {
        if (selectedIds.length === 0) return null;
        if (filterStatus === "PENDING") return <button className="btn btn-success fw-bold shadow-sm" onClick={handleBulkAction}><i className="bi bi-file-zip-fill me-2"></i> Tiếp nhận & Tải ZIP ({selectedIds.length})</button>;
        if (filterStatus === "PROCESSING") return <button className="btn btn-primary fw-bold shadow-sm" onClick={handleBulkAction}><i className="bi bi-check2-circle me-2"></i> Xác nhận Đã Xong ({selectedIds.length})</button>;
        if (filterStatus === "READY_FOR_PICKUP") return <button className="btn btn-info text-white fw-bold shadow-sm" onClick={handleBulkAction}><i className="bi bi-box-seam me-2"></i> Xác nhận Đã Trả HS ({selectedIds.length})</button>;
        return null;
    };

    return (
        <div className="container-fluid animate__animated animate__fadeIn p-0 bg-light min-vh-100">
             <StaffFilter filterStatus={filterStatus} setFilterStatus={setFilterStatus} />
             <div className="px-4">
                {selectedIds.length > 0 && (
                    <div className="alert alert-warning border-0 shadow-sm d-flex justify-content-between align-items-center mb-3">
                        <div><i className="bi bi-check-square-fill me-2"></i>Đang chọn <strong>{selectedIds.length}</strong> yêu cầu.</div>
                        <div>{renderBulkButton()}</div>
                    </div>
                )}
                <StaffRequestTable 
                    requests={requests}
                    loading={loading}
                    onDownload={downloadFile}
                    onOpenModal={(req) => setSelectedRequest(req)}
                    selectedIds={selectedIds}
                    onToggleSelect={handleToggleSelect}
                    onToggleAll={handleToggleAll}
                    filterStatus={filterStatus}
                />
             </div>
             <StaffUpdateModal 
                request={selectedRequest}
                onClose={() => setSelectedRequest(null)}
                onUpdate={handleUpdateSubmit}
            />
        </div>
    );
}