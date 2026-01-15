import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom"; 

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

    // --- Load Valid Times (SỬA CHÍNH Ở ĐÂY) ---
    useEffect(() => {
        if (form.date && form.duration) {
            // Xây dựng URL
            let url = `${DOMAIN}/api/schedule/valid-times?date=${form.date}&duration=${form.duration}`;
            
            // Chỉ thêm lecturerId nếu người dùng ĐÃ CHỌN giảng viên cụ thể
            if (form.lecturerId && form.lecturerId !== "") {
                url += `&lecturerId=${form.lecturerId}`;
            }
            // Nếu không có lecturerId => Backend sẽ tự hiểu là tìm "ALL Slots" (Cần Backend hỗ trợ required=false)

            fetch(url, { headers: { Authorization: `Bearer ${token}` } })
            .then(async (res) => {
                if (!res.ok) {
                    // Nếu lỗi (400/500) -> Log ra xem Backend báo gì
                    const text = await res.text();
                    console.error("API Error:", text);
                    throw new Error("Lỗi tải lịch");
                }
                return res.json();
            })
            .then(data => {
                if (data && data.length > 0) {
                    setValidStartTimes(data); 
                    setIsQueueing(false); // Có lịch rảnh -> Tắt chế độ chờ
                } else {
                    // API trả về rỗng -> Tức là full lịch thật sự
                    setValidStartTimes(STANDARD_TIMES); 
                    setIsQueueing(true);
                }
            })
            .catch((err) => { 
                console.error("Fetch slots failed:", err);
                // Nếu lỗi API (do Backend chưa sửa) -> Vẫn hiện giờ nhưng báo Queueing
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

    // --- SUBMIT ---
    const handleSubmit = async () => {
        if (!form.date || !form.startTime) return alert("Vui lòng chọn Ngày và Giờ bắt đầu!");

        const finalEndTime = calculateEndTime(form.startTime, form.duration);
        const timeString = `${form.startTime} - ${finalEndTime}`;
        
        const payload = { 
            // Nếu để trống -> gửi null để Backend Auto Assign
            lecturerId: form.lecturerId === "" ? null : form.lecturerId, 
            date: form.date, 
            time: timeString, 
            reason: form.reason, 
            consultationType 
        };

        try {
            const res = await fetch(`${DOMAIN}/api/appointment/create`, {
                method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error(await res.text());
            const newAppt = await res.json();

            // Upload file nếu có
            if (selectedFile && newAppt.id) {
                const fd = new FormData(); fd.append("file", selectedFile);
                await fetch(`${DOMAIN}/api/appointment/${newAppt.id}/attachments`, {
                    method: "POST", headers: {Authorization: `Bearer ${token}`}, body: fd
                });
            }

            alert("Đăng ký thành công!");
            navigate("/student/history"); // Chuyển trang đúng với Router của bạn

        } catch (err) { alert("Lỗi: " + err.message); }
    };

    return (
        <div className="container mt-4">
            <h4 className="mb-3 text-primary fw-bold">📝 Tạo yêu cầu tư vấn</h4>
            <div className="card p-4 shadow-sm bg-white">
                <div className="row">
                    <div className="col-md-4 mb-3">
                        <label className="fw-bold">📅 Ngày tư vấn <span className="text-danger">*</span></label>
                        <input type="date" className="form-control" name="date" value={form.date} onChange={handleChange} />
                    </div>
                    <div className="col-md-4 mb-3">
                        <label className="fw-bold">👨‍🏫 Giảng viên</label>
                        <select className="form-select" name="lecturerId" value={form.lecturerId} onChange={handleChange}>
                            <option value="">-- Hệ thống tự phân công --</option>
                            {lecturers.map(l => <option key={l.id} value={l.id}>{l.fullName}</option>)}
                        </select>
                    </div>
                    <div className="col-md-4 mb-3">
                        <label className="fw-bold">⏳ Thời lượng</label>
                        <select className="form-select" name="duration" value={form.duration} onChange={handleChange}>
                            <option value="15">15 Phút</option>
                            <option value="30">30 Phút</option>
                            <option value="45">45 Phút</option>
                            <option value="60">60 Phút</option>
                        </select>
                    </div>
                </div>

                <div className="mb-3">
                    <label className="fw-bold">⏰ Giờ bắt đầu <span className="text-danger">*</span></label>
                    <select className="form-select" name="startTime" value={form.startTime} onChange={handleChange} disabled={validStartTimes.length === 0}>
                        <option value="">
                            {validStartTimes.length === 0 ? (form.date ? "Đang tải hoặc hết lịch..." : "Vui lòng chọn ngày trước") : "-- Chọn giờ --"}
                        </option>
                        {validStartTimes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>

                    {/* Hiển thị cảnh báo danh sách chờ */}
                    {isQueueing && form.date && (
                        <div className="alert alert-warning mt-2 py-2 small">
                            <i className="bi bi-exclamation-triangle me-2"></i>
                            <strong>Chưa tìm thấy lịch rảnh phù hợp.</strong> Yêu cầu của bạn sẽ được xếp vào danh sách chờ (Waiting List).
                        </div>
                    )}
                    
                    {endTimePreview && <div className="alert alert-info mt-2 py-2 small">ℹ️ Kết thúc lúc: <strong>{endTimePreview}</strong></div>}
                </div>

                <div className="mb-3">
                    <label className="fw-bold">📝 Nội dung / Lý do</label>
                    <textarea className="form-control" rows={2} name="reason" value={form.reason} onChange={handleChange} placeholder="Mô tả ngắn gọn vấn đề của bạn..." />
                </div>

                <div className="mb-3">
                    <label className="fw-bold">📎 Đính kèm file</label>
                    <input type="file" className="form-control" ref={fileInputRef} onChange={e => setSelectedFile(e.target.files[0])} />
                </div>

                <div className="mb-3">
                    <label className="fw-bold d-block">📞 Hình thức:</label>
                    <div className="mt-2">
                        <div className="form-check form-check-inline">
                            <input className="form-check-input" type="radio" name="ctype" value="IN_PERSON" checked={consultationType==="IN_PERSON"} onChange={e=>setConsultationType(e.target.value)}/> 
                            <label className="form-check-label">Trực tiếp</label>
                        </div>
                        <div className="form-check form-check-inline">
                            <input className="form-check-input" type="radio" name="ctype" value="PHONE" checked={consultationType==="PHONE"} onChange={e=>setConsultationType(e.target.value)}/> 
                            <label className="form-check-label">Online</label>
                        </div>
                    </div>
                </div>

                <button className="btn btn-success w-100 fw-bold py-2 shadow-sm" onClick={handleSubmit}>🚀 Gửi Đăng Ký</button>
            </div>
        </div>
    );
};

export default CreateConsultation;