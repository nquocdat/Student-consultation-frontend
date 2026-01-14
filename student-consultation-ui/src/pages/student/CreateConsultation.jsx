import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom"; // 👈 Dùng để chuyển trang

// Helper tạo giờ tiêu chuẩn
const generateStandardTimes = () => {
    const times = [];
    const startHour = 7; const endHour = 17;
    for (let i = startHour; i <= endHour; i++) {
        if (i === 12) continue;
        if (i === 11) { times.push(`${i}:00`, `${i}:15`, `${i}:30`); continue; }
        if (i === 13) { times.push(`${i}:30`, `${i}:45`); continue; }
        times.push(`${(i<10?'0':'')+i}:00`, `${(i<10?'0':'')+i}:15`, `${(i<10?'0':'')+i}:30`, `${(i<10?'0':'')+i}:45`);
    }
    return times;
};
const STANDARD_TIMES = generateStandardTimes();

const CreateConsultation = () => {
    const token = localStorage.getItem("token");
    const navigate = useNavigate(); // Hook chuyển trang

    // --- STATE ---
    const [form, setForm] = useState({
        lecturerId: "", date: "", startTime: "", duration: 30, reason: "",
    });
    const [consultationType, setConsultationType] = useState("IN_PERSON");
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null);
    
    // Data
    const [lecturers, setLecturers] = useState([]);
    const [validStartTimes, setValidStartTimes] = useState([]);
    const [isQueueing, setIsQueueing] = useState(false);
    const [endTimePreview, setEndTimePreview] = useState("");

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
        fetch("http://localhost:8080/api/lecturers")
            .then(res => res.json()).then(setLecturers).catch(console.error);
    }, []);

    // --- Load Valid Times ---
    useEffect(() => {
        if (form.date && form.duration) {
            let url = `http://localhost:8080/api/schedule/valid-times?date=${form.date}&duration=${form.duration}`;
            if (form.lecturerId) url += `&lecturerId=${form.lecturerId}`;

            fetch(url, { headers: { Authorization: `Bearer ${token}` } })
            .then(res => res.json())
            .then(data => {
                if (data.length > 0) {
                    setValidStartTimes(data); setIsQueueing(false);
                } else {
                    setValidStartTimes(STANDARD_TIMES); setIsQueueing(true);
                }
            })
            .catch(() => { setValidStartTimes(STANDARD_TIMES); setIsQueueing(true); });
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
            lecturerId: form.lecturerId || null, 
            date: form.date, 
            time: timeString, 
            reason: form.reason, 
            consultationType 
        };

        try {
            const res = await fetch("http://localhost:8080/api/appointment/create", {
                method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error(await res.text());
            const newAppt = await res.json();

            if (selectedFile && newAppt.id) {
                const fd = new FormData(); fd.append("file", selectedFile);
                await fetch(`http://localhost:8080/api/appointment/${newAppt.id}/attachments`, {
                    method: "POST", headers: {Authorization: `Bearer ${token}`}, body: fd
                });
            }

            alert("Đăng ký thành công!");
            
            // 👉 CHUYỂN HƯỚNG SANG TRANG LỊCH SỬ SAU KHI TẠO XONG
            navigate("/history"); 

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
                        <select className="form-control" name="lecturerId" value={form.lecturerId} onChange={handleChange}>
                            <option value="">-- Hệ thống tự phân công --</option>
                            {lecturers.map(l => <option key={l.id} value={l.id}>{l.fullName}</option>)}
                        </select>
                    </div>
                    <div className="col-md-4 mb-3">
                        <label className="fw-bold">⏳ Thời lượng</label>
                        <select className="form-control" name="duration" value={form.duration} onChange={handleChange}>
                            <option value="15">15 Phút</option>
                            <option value="30">30 Phút</option>
                            <option value="45">45 Phút</option>
                            <option value="60">60 Phút</option>
                        </select>
                    </div>
                </div>

                <div className="mb-3">
                    <label className="fw-bold">⏰ Giờ bắt đầu <span className="text-danger">*</span></label>
                    <select className="form-control" name="startTime" value={form.startTime} onChange={handleChange} disabled={validStartTimes.length === 0}>
                        <option value="">{validStartTimes.length === 0 ? (form.date ? "Đang tải..." : "Chọn ngày trước") : "-- Chọn giờ --"}</option>
                        {validStartTimes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    {isQueueing && form.date && <small className="text-danger fw-bold mt-1">* Chưa có lịch rảnh. Xếp vào danh sách chờ.</small>}
                    {endTimePreview && <div className="alert alert-info mt-2 py-1 small">ℹ️ Kết thúc lúc: <strong>{endTimePreview}</strong></div>}
                </div>

                <div className="mb-3">
                    <label className="fw-bold">📝 Nội dung / Lý do</label>
                    <textarea className="form-control" rows={2} name="reason" value={form.reason} onChange={handleChange} />
                </div>

                <div className="mb-3">
                    <label className="fw-bold">📎 Đính kèm file</label>
                    <input type="file" className="form-control" ref={fileInputRef} onChange={e => setSelectedFile(e.target.files[0])} />
                </div>

                <div className="mb-3">
                    <label className="fw-bold d-block">📞 Hình thức:</label>
                    <div className="mt-2">
                        <div className="form-check form-check-inline">
                            <input className="form-check-input" type="radio" name="ctype" value="IN_PERSON" checked={consultationType==="IN_PERSON"} onChange={e=>setConsultationType(e.target.value)}/> Trực tiếp
                        </div>
                        <div className="form-check form-check-inline">
                            <input className="form-check-input" type="radio" name="ctype" value="PHONE" checked={consultationType==="PHONE"} onChange={e=>setConsultationType(e.target.value)}/> Online
                        </div>
                    </div>
                </div>

                <button className="btn btn-success w-100 fw-bold py-2" onClick={handleSubmit}>🚀 Gửi Đăng Ký</button>
            </div>
        </div>
    );
};

export default CreateConsultation;