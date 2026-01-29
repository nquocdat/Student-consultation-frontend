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

    // State cho Form
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
            // Log ra để kiểm tra xem backend trả về 'templateUrl' hay 'template_url'
            console.log("Dữ liệu thủ tục:", res.data); 
            setProcedures(res.data);
        } catch (err) {
            console.error(err);
            setProcedures([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchProcedures(); }, []);

    // 2. Mở Modal Thêm
    const handleOpenAdd = () => {
        setIsEditing(false);
        setFormData(initialFormState);
        setSelectedFile(null);
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
        setSelectedFile(null);
        setShowModal(true);
    };

    // 4. Xử lý Lưu
    const handleSave = async () => {
        if (!formData.code || !formData.name) {
            alert("Vui lòng nhập Mã và Tên thủ tục!"); return;
        }

        const data = new FormData();
        data.append("code", formData.code);
        data.append("name", formData.name);
        data.append("description", formData.description);
        
        if (selectedFile) {
            data.append("file", selectedFile);
        }

        const token = localStorage.getItem("token");
        
        try {
            const config = {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data" 
                }
            };

            if (isEditing) {
                await axios.put(`${DOMAIN}/api/admin/procedures/${currentId}`, data, config);
                alert("Cập nhật thành công!");
            } else {
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
                {procedures.length === 0 ? (
                    <div className="col-12 text-center text-muted py-5">
                        <i className="bi bi-inbox display-4 d-block mb-3"></i>
                        Chưa có dữ liệu thủ tục nào.
                    </div>
                ) : (
                    procedures.map(proc => {
                        // 🔥 LOGIC QUAN TRỌNG: Kiểm tra cả 2 trường hợp tên biến
                        const fileUrl = proc.templateUrl || proc.template_url;

                        return (
                            <div className="col-md-6 col-lg-4" key={proc.id}>
                                <div className="card h-100 border-0 shadow-sm hover-shadow transition-all rounded-4">
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between align-items-start">
                                            <div>
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

                                        {/* --- PHẦN NÚT TẢI ĐÃ SỬA --- */}
                                        <div className="border-top pt-3">
                                            <a 
                                                // Nếu có link thì điền vào, không thì để #
                                                href={fileUrl ? `${DOMAIN}${fileUrl}` : "#"} 
                                                
                                                // Đổi màu nút để dễ nhận biết (Xanh: Có file, Xám: Chưa có)
                                                className={`btn btn-sm w-100 ${fileUrl ? 'btn-outline-success' : 'btn-outline-secondary'}`}
                                                
                                                // Thuộc tính quan trọng để tải file
                                                download 
                                                
                                                onClick={(e) => {
                                                    // Nếu không có URL file thì chặn lại và báo lỗi
                                                    if (!fileUrl) {
                                                        e.preventDefault();
                                                        alert("Thủ tục này chưa được admin cập nhật file biểu mẫu!");
                                                    }
                                                }}
                                            >
                                                <i className={`bi ${fileUrl ? 'bi-file-earmark-arrow-down' : 'bi-exclamation-circle'} me-2`}></i>
                                                {fileUrl ? "Tải biểu mẫu" : "Chưa có biểu mẫu"}
                                            </a>
                                        </div>
                                        {/* --------------------------- */}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
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
                                <div className="mb-3">
                                    <label className="form-label fw-bold">Mã thủ tục <span className="text-danger">*</span></label>
                                    <input type="text" className="form-control" placeholder="VD: P01" 
                                        value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} />
                                </div>
                                
                                <div className="mb-3">
                                    <label className="form-label fw-bold">Tên thủ tục <span className="text-danger">*</span></label>
                                    <input type="text" className="form-control" placeholder="VD: Xin bảng điểm..." 
                                        value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label fw-bold">Mô tả</label>
                                    <textarea className="form-control" rows="3" 
                                        value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
                                </div>

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