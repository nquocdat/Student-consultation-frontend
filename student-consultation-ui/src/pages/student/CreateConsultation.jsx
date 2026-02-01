import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import LecturerSelectModal from "../../components/student/LecturerSelectModal.jsx";
import axios from "axios"; // Khuyên dùng axios thay vì fetch để xử lý lỗi tốt hơn

// Helper tạo giờ tiêu chuẩn (7h - 17h)
const generateStandardTimes = () => {
    const times = [];
    const startHour = 7; const endHour = 17;
    for (let i = startHour; i <= endHour; i++) {
        if (i === 12) continue; // Nghỉ trưa
        if (i === 11) { times.push(`${i}:00`, `${i}:15`, `${i}:30`); continue; }
        if (i === 13) { times.push(`${i}:30`, `${i}:45`); continue; }
        times.push(`${(i<10?'0':'')+i}:00`, `${(i<10?'0':'')+i}:15`, `${(i<10?'0':'')+i}:30`, `${(i<10?'0':'')+i}:45`);
    }
    return times;
};
const STANDARD_TIMES = generateStandardTimes();

const CreateConsultation = () => {
    const token = localStorage.getItem("token");
    const navigate = useNavigate();

    // --- STATE ---
    const [form, setForm] = useState({
        lecturerId: "", // Mặc định rỗng là "Tự phân công"
        date: "",
        startTime: "",
        duration: 30,
        reason: "",
    });
    const [consultationType, setConsultationType] = useState("IN_PERSON");
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null);

    // Data
    const [lecturers, setLecturers] = useState([]);
    const [validStartTimes, setValidStartTimes] = useState([]);
    const [isQueueing, setIsQueueing] = useState(false);
    const [endTimePreview, setEndTimePreview] = useState("");

    // 🔥 STATE MỚI CHO MODAL CHỌN GIẢNG VIÊN
    const [showLecModal, setShowLecModal] = useState(false);
    const [selectedLecturerObj, setSelectedLecturerObj] = useState(null);

    // API Domain
    const DOMAIN = "http://localhost:8080";

    // --- Helpers ---
    const calculateEndTime = (start, minutes) => {
        if (!start) return "";
        const [h, m] = start.split(':').map(Number);
        const date = new Date(); date.setHours(h, m, 0, 0); date.setMinutes(date.getMinutes() + Number(minutes));
        const newH = date.getHours(); const newM = date.getMinutes();
        return `${(newH < 10 ? '0' : '') + newH}:${(newM < 10 ? '0' : '') + newM}`;
    };

    // --- Load Lecturers ---
    useEffect(() => {
        fetch(`${DOMAIN}/api/lecturers`)
            .then(res => res.json()).then(setLecturers).catch(console.error);
    }, []);

    // --- Load Valid Times ---
    useEffect(() => {
        if (form.date && form.duration) {
            let url = `${DOMAIN}/api/schedule/valid-times?date=${form.date}&duration=${form.duration}`;
            if (form.lecturerId && form.lecturerId !== "") {
                url += `&lecturerId=${form.lecturerId}`;
            }

            fetch(url, { headers: { Authorization: `Bearer ${token}` } })
                .then(async (res) => {
                    if (!res.ok) throw new Error("Lỗi tải lịch");
                    return res.json();
                })
                .then(data => {
                    if (data && data.length > 0) {
                        setValidStartTimes(data);
                        setIsQueueing(false);
                    } else {
                        setValidStartTimes(STANDARD_TIMES);
                        setIsQueueing(true);
                    }
                })
                .catch((err) => {
                    console.error("Fetch slots failed:", err);
                    setValidStartTimes(STANDARD_TIMES);
                    setIsQueueing(true);
                });
        } else {
            setValidStartTimes([]);
        }
    }, [form.date, form.lecturerId, form.duration, token]);

    // --- Preview End Time ---
    useEffect(() => {
        setEndTimePreview(form.startTime ? calculateEndTime(form.startTime, form.duration) : "");
    }, [form.startTime, form.duration]);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    // 🔥 HÀM XỬ LÝ KHI CHỌN TỪ MODAL
    const handleSelectLecturer = (lecturer) => {
        setSelectedLecturerObj(lecturer); // Lưu object để hiển thị ảnh/tên
        setForm(prev => ({
            ...prev,
            lecturerId: lecturer ? lecturer.id : "" // Nếu null thì gán rỗng (Tự phân công)
        }));
        setShowLecModal(false); // Đóng modal
    };

    // --- SUBMIT ---
    const handleSubmit = async () => {
        if (!form.date || !form.startTime) return alert("Vui lòng chọn Ngày và Giờ bắt đầu!");

        const finalEndTime = calculateEndTime(form.startTime, form.duration);
        const timeString = `${form.startTime} - ${finalEndTime}`;

        const payload = {
            lecturerId: form.lecturerId === "" ? null : form.lecturerId,
            date: form.date,
            time: timeString,
            reason: form.reason,
            consultationType
        };

        try {
            const res = await fetch(`${DOMAIN}/api/appointment/create`, {
                method: "POST", 
                headers: { 
                    "Content-Type": "application/json", 
                    Authorization: `Bearer ${token}` 
                },
                body: JSON.stringify(payload),
            });

            // 🔥 XỬ LÝ LỖI (QUAN TRỌNG)
            if (!res.ok) {
                // 1. Đọc dữ liệu lỗi trả về dưới dạng JSON
                const errorData = await res.json();
                
                // 2. Lấy tin nhắn (message)
                // Nếu Backend đã sửa thành ResponseStatusException thì message sẽ nằm ở errorData.message
                // Nếu Backend vẫn là RuntimeException thì message nằm lẫn trong errorData.trace hoặc message
                const errorMessage = errorData.message || JSON.stringify(errorData);
                
                throw new Error(errorMessage);
            }

            const newAppt = await res.json();

            // Upload file nếu có
            if (selectedFile && newAppt.id) {
                const fd = new FormData(); fd.append("file", selectedFile);
                await fetch(`${DOMAIN}/api/appointment/${newAppt.id}/attachments`, {
                    method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd
                });
            }

            alert("✅ Đăng ký thành công!");
            navigate("/student/history");

        } catch (err) { 
            console.error(err);
            // 🔥 HIỂN THỊ THÔNG BÁO GỌN GÀNG
            // Nếu tin nhắn có chứa chữ "java.lang..." (do chưa sửa backend) thì ta cắt chuỗi để lấy phần tiếng Việt
            let displayMsg = err.message;
            
            if (displayMsg.includes("java.lang.RuntimeException: ")) {
                displayMsg = displayMsg.split("java.lang.RuntimeException: ")[1];
            }
            
            // Xóa bớt các ký tự thừa nếu có
            if (displayMsg.includes("timestamp")) {
                 // Fallback nếu vẫn hiện json
                 displayMsg = "⛔ Yêu cầu không hợp lệ hoặc bị giới hạn!";
            }

            alert(displayMsg);
        }
    };

    return (
        <div className="container mt-4 animate__animated animate__fadeIn">
            <h4 className="mb-4 text-primary fw-bold border-bottom pb-2">📝 Tạo yêu cầu tư vấn</h4>
            
            <div className="row">
                {/* Cột trái: Form nhập liệu */}
                <div className="col-lg-8">
                    <div className="card p-4 shadow-sm bg-white border-0 rounded-3">
                        
                        {/* 1. CHỌN GIẢNG VIÊN (GIAO DIỆN MỚI) */}
                        <div className="mb-4">
                            <label className="fw-bold mb-2">👨‍🏫 Giảng viên mong muốn</label>
                            
                            {!selectedLecturerObj ? (
                                // --- Trường hợp: TỰ PHÂN CÔNG ---
                                <div className="card border-primary border-dashed bg-light p-3 d-flex flex-row align-items-center justify-content-between">
                                    <div className="d-flex align-items-center">
                                        <div className="bg-white text-primary rounded-circle border d-flex align-items-center justify-content-center me-3" style={{width: 45, height: 45}}>
                                            <i className="bi bi-robot fs-4"></i>
                                        </div>
                                        <div>
                                            <h6 className="fw-bold mb-0 text-primary">Hệ thống tự phân công</h6>
                                            <small className="text-muted">Nhà trường sẽ sắp xếp giảng viên phù hợp.</small>
                                        </div>
                                    </div>
                                    <button className="btn btn-primary btn-sm fw-bold shadow-sm" onClick={() => setShowLecModal(true)}>
                                        <i className="bi bi-search me-1"></i> Thay đổi
                                    </button>
                                </div>
                            ) : (
                                // --- Trường hợp: ĐÃ CHỌN GIẢNG VIÊN ---
                                <div className="card border-success shadow-sm p-3 d-flex flex-row align-items-center justify-content-between bg-white">
                                    <div className="d-flex align-items-center">
                                        <img 
                                            src={selectedLecturerObj.avatarUrl || selectedLecturerObj.avatar || "https://via.placeholder.com/50"} 
                                            alt="avt" 
                                            className="rounded-circle border me-3"
                                            style={{width: "50px", height: "50px", objectFit: "cover"}}
                                        />
                                        <div>
                                            <h6 className="fw-bold mb-0 text-success">
                                                {selectedLecturerObj.academicDegree ? `${selectedLecturerObj.academicDegree}. ` : ""}
                                                {selectedLecturerObj.fullName || selectedLecturerObj.user?.fullName || "Tên giảng viên"}
                                            </h6>
                                            
                                            <small className="text-muted d-block">
                                                Khoa {selectedLecturerObj.department} 
                                            </small>
                                        </div>
                                    </div>
                                    <button className="btn btn-outline-secondary btn-sm" onClick={() => setShowLecModal(true)}>
                                        <i className="bi bi-pencil me-1"></i> Chọn lại
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* 2. NGÀY & THỜI LƯỢNG */}
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className="fw-bold">📅 Ngày tư vấn <span className="text-danger">*</span></label>
                                <input type="date" className="form-control" name="date" value={form.date} onChange={handleChange} />
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="fw-bold">⏳ Thời lượng</label>
                                <select className="form-select" name="duration" value={form.duration} onChange={handleChange}>
                                    <option value="15">15 Phút</option>
                                    <option value="30">30 Phút</option>
                                    <option value="45">45 Phút</option>
                                    <option value="60">60 Phút</option>
                                </select>
                            </div>
                        </div>

                        {/* 3. GIỜ BẮT ĐẦU */}
                        <div className="mb-3">
                            <label className="fw-bold">⏰ Giờ bắt đầu <span className="text-danger">*</span></label>
                            <select className="form-select" name="startTime" value={form.startTime} onChange={handleChange} disabled={validStartTimes.length === 0}>
                                <option value="">
                                    {validStartTimes.length === 0 ? (form.date ? "Đang tải hoặc hết lịch..." : "Vui lòng chọn ngày trước") : "-- Chọn giờ --"}
                                </option>
                                {validStartTimes.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>

                            {/* Cảnh báo & Preview */}
                            {isQueueing && form.date && (
                                <div className="alert alert-warning mt-2 py-2 small d-flex align-items-center">
                                    <i className="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
                                    <div><strong>Lịch đã kín hoặc giảng viên chưa đăng ký lịch.</strong> Yêu cầu sẽ được đưa vào hàng chờ.</div>
                                </div>
                            )}
                            {endTimePreview && <div className="alert alert-info mt-2 py-2 small">ℹ️ Kết thúc dự kiến: <strong>{endTimePreview}</strong></div>}
                        </div>

                        {/* 4. NỘI DUNG & FILE */}
                        <div className="mb-3">
                            <label className="fw-bold">📝 Nội dung / Lý do</label>
                            <textarea className="form-control" rows={3} name="reason" value={form.reason} onChange={handleChange} placeholder="Mô tả ngắn gọn vấn đề của bạn..." />
                        </div>

                        <div className="mb-4">
                            <label className="fw-bold">📎 Đính kèm file</label>
                            <input type="file" className="form-control" ref={fileInputRef} onChange={e => setSelectedFile(e.target.files[0])} />
                        </div>

                        <button className="btn btn-success w-100 fw-bold py-2 shadow-sm" onClick={handleSubmit}>
                            <i className="bi bi-send-fill me-2"></i> Gửi Đăng Ký
                        </button>
                    </div>
                </div>

                {/* Cột phải: Tùy chọn hình thức (Để riêng cho thoáng) */}
                <div className="col-lg-4 mt-4 mt-lg-0">
                    <div className="card p-4 shadow-sm bg-white border-0 rounded-3">
                        <label className="fw-bold mb-3 d-block"><i className="bi bi-headset me-2"></i>Hình thức tư vấn:</label>
                        
                        <div className="form-check p-3 border rounded mb-2 bg-light cursor-pointer" onClick={() => setConsultationType("IN_PERSON")}>
                            <input className="form-check-input mt-1" type="radio" name="ctype" value="IN_PERSON" checked={consultationType==="IN_PERSON"} onChange={()=>{}} /> 
                            <label className="form-check-label fw-bold ms-2">Gặp trực tiếp</label>
                            <div className="small text-muted ms-4">Đến văn phòng khoa để gặp giảng viên.</div>
                        </div>

                        <div className="form-check p-3 border rounded bg-light cursor-pointer" onClick={() => setConsultationType("PHONE")}>
                            <input className="form-check-input mt-1" type="radio" name="ctype" value="PHONE" checked={consultationType==="PHONE"} onChange={()=>{}} /> 
                            <label className="form-check-label fw-bold ms-2">Online / Gọi điện</label>
                            <div className="small text-muted ms-4">Tư vấn qua Google Meet hoặc điện thoại.</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 🔥 NHÚNG MODAL Ở CUỐI TRANG */}
            <LecturerSelectModal 
                show={showLecModal}
                onClose={() => setShowLecModal(false)}
                onSelect={handleSelectLecturer}
                lecturers={lecturers}
            />
        </div>
    );
};

export default CreateConsultation;