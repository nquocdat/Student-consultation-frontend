import React, { useEffect, useState } from "react";
import axios from "axios";

export default function AdminProcedureManager() {
    const DOMAIN = "http://localhost:8080";
    
    const [procedures, setProcedures] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Modal & Form State
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);

    // State cho Form (Khớp với DB của bạn)
    const initialFormState = {
        code: "",        // Mã thủ tục (P01)
        name: "",        // Tên thủ tục
        description: ""  // Mô tả
    };
    const [formData, setFormData] = useState(initialFormState);
    
    // State riêng để lưu File khi chọn
    const [selectedFile, setSelectedFile] = useState(null);

    // 1. Tải danh sách
    const fetchProcedures = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(`${DOMAIN}/api/admin/procedures`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProcedures(res.data);
        } catch (err) {
            console.error(err);
            // Dữ liệu giả lập khớp với ảnh DB
            setProcedures([
                { id: 1, code: "P01", name: "Xin cấp bảng điểm", description: "Dành cho sinh viên năm cuối...", template_url: "/files/mau_bang_diem.docx" },
                { id: 2, code: "P02", name: "Giấy xác nhận sinh viên", description: "Dùng để vay vốn ngân hàng...", template_url: "/files/mau_xac_nhan.docx" },
            ]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchProcedures(); }, []);

    // 2. Mở Modal Thêm
    const handleOpenAdd = () => {
        setIsEditing(false);
        setFormData(initialFormState);
        setSelectedFile(null); // Reset file
        setShowModal(true);
    };

    // 3. Mở Modal Sửa
    const handleEditClick = (proc) => {
        setIsEditing(true);
        setCurrentId(proc.id);
        setFormData({
            code: proc.code,
            name: proc.name,
            description: proc.description
        });
        setSelectedFile(null); // Reset file (Nếu không chọn file mới thì giữ file cũ ở BE)
        setShowModal(true);
    };

    // 4. Xử lý Lưu (Dùng FormData để upload file)
    const handleSave = async () => {
        if (!formData.code || !formData.name) {
            alert("Vui lòng nhập Mã và Tên thủ tục!"); return;
        }

        // Tạo FormData để chứa cả Text và File
        const data = new FormData();
        data.append("code", formData.code);
        data.append("name", formData.name);
        data.append("description", formData.description);
        
        // Chỉ append file nếu người dùng có chọn file mới
        if (selectedFile) {
            data.append("file", selectedFile);
        }

        const token = localStorage.getItem("token");
        
        try {
            // Cấu hình Header cho upload file
            const config = {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data" 
                }
            };

            if (isEditing) {
                // PUT
                await axios.put(`${DOMAIN}/api/admin/procedures/${currentId}`, data, config);
                alert("Cập nhật thành công!");
            } else {
                // POST
                if (!selectedFile) {
                    alert("Vui lòng chọn file biểu mẫu!"); return;
                }
                await axios.post(`${DOMAIN}/api/admin/procedures`, data, config);
                alert("Thêm mới thành công!");
            }
            setShowModal(false);
            fetchProcedures();
        } catch (err) {
            alert("Lỗi: " + (err.response?.data || "Có lỗi xảy ra"));
        }
    };

    // 5. Xóa
    const handleDelete = async (id) => {
        if(!window.confirm("Bạn có chắc chắn muốn xóa thủ tục này?")) return;
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`${DOMAIN}/api/admin/procedures/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Đã xóa!");
            fetchProcedures();
        } catch (err) {
            alert("Lỗi khi xóa: " + (err.response?.data));
        }
    };

    return (
        <div className="container-fluid p-4 animate__animated animate__fadeIn">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="fw-bold text-dark">
                    <i className="bi bi-file-earmark-text-fill me-2"></i>Danh mục Thủ tục
                </h3>
                <button className="btn btn-primary shadow-sm" onClick={handleOpenAdd}>
                    <i className="bi bi-plus-lg me-2"></i> Thêm thủ tục
                </button>
            </div>

            {/* DANH SÁCH THỦ TỤC */}
            <div className="row g-4">
                {procedures.map(proc => (
                    <div className="col-md-6 col-lg-4" key={proc.id}>
                        <div className="card h-100 border-0 shadow-sm hover-shadow transition-all rounded-4">
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-start">
                                    <div>
                                        {/* Hiển thị Mã thủ tục */}
                                        <span className="badge bg-primary-subtle text-primary border border-primary-subtle mb-2">
                                            {proc.code}
                                        </span>
                                        <h5 className="card-title fw-bold text-dark mb-1">{proc.name}</h5>
                                    </div>
                                    
                                    <div className="dropdown">
                                        <button className="btn btn-sm btn-light rounded-circle" type="button" data-bs-toggle="dropdown">
                                            <i className="bi bi-three-dots-vertical"></i>
                                        </button>
                                        <ul className="dropdown-menu dropdown-menu-end border-0 shadow">
                                            <li><button className="dropdown-item" onClick={() => handleEditClick(proc)}><i className="bi bi-pencil me-2 text-warning"></i>Sửa</button></li>
                                            <li><button className="dropdown-item text-danger" onClick={() => handleDelete(proc.id)}><i className="bi bi-trash me-2"></i>Xóa</button></li>
                                        </ul>
                                    </div>
                                </div>
                                
                                <p className="card-text text-muted small mt-3" style={{minHeight: '40px'}}>
                                    {proc.description}
                                </p>

                                {/* Link tải file mẫu */}
                                <div className="border-top pt-3">
                                    <a href={`${DOMAIN}${proc.template_url}`} className="btn btn-sm btn-outline-success w-100" target="_blank" rel="noreferrer">
                                        <i className="bi bi-file-earmark-arrow-down me-2"></i>Tải biểu mẫu
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* MODAL FORM */}
            {showModal && (
                <div className="modal d-block" style={{backgroundColor: "rgba(0,0,0,0.5)"}}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow">
                            <div className="modal-header bg-primary text-white">
                                <h5 className="modal-title">{isEditing ? "Cập nhật Thủ tục" : "Thêm Thủ tục Mới"}</h5>
                                <button className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                {/* Mã thủ tục */}
                                <div className="mb-3">
                                    <label className="form-label fw-bold">Mã thủ tục <span className="text-danger">*</span></label>
                                    <input type="text" className="form-control" placeholder="VD: P01" 
                                        value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} />
                                </div>
                                
                                {/* Tên thủ tục */}
                                <div className="mb-3">
                                    <label className="form-label fw-bold">Tên thủ tục <span className="text-danger">*</span></label>
                                    <input type="text" className="form-control" placeholder="VD: Xin bảng điểm..." 
                                        value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                                </div>

                                {/* Mô tả */}
                                <div className="mb-3">
                                    <label className="form-label fw-bold">Mô tả</label>
                                    <textarea className="form-control" rows="3" 
                                        value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
                                </div>

                                {/* Upload File */}
                                <div className="mb-3">
                                    <label className="form-label fw-bold">Biểu mẫu đính kèm (Word/PDF)</label>
                                    <input type="file" className="form-control" 
                                        onChange={e => setSelectedFile(e.target.files[0])} />
                                    {isEditing && <div className="form-text text-muted">Bỏ trống nếu không muốn thay đổi file cũ.</div>}
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-light" onClick={() => setShowModal(false)}>Hủy</button>
                                <button className="btn btn-primary" onClick={handleSave}>
                                    {isEditing ? "Lưu thay đổi" : "Thêm mới"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}