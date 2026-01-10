import { useEffect, useState } from "react";

const ConsultationPage = () => {
  const [form, setForm] = useState({
    lecturerId: "",
    date: "",
    time: "",
    reason: "",
  });

  const [lecturers, setLecturers] = useState([]);
  const [freeSlots, setFreeSlots] = useState([]);

  const token = localStorage.getItem("token");

  /* ================= LOAD GIẢNG VIÊN ================= */
  useEffect(() => {
    fetch("http://localhost:8080/api/lecturers")
      .then(res => res.json())
      .then(setLecturers)
      .catch(console.error);
  }, []);

  /* ================= LOAD SLOT RẢNH ================= */
  useEffect(() => {
    if (!form.lecturerId || !form.date || !token) {
      setFreeSlots([]);
      setForm(prev => ({ ...prev, time: "" }));
      return;
    }

    fetch(
      `http://localhost:8080/api/schedule/free/${form.lecturerId}?date=${form.date}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
      .then(res => res.ok ? res.json() : [])
      .then(data => setFreeSlots(data))
      .catch(() => setFreeSlots([]));
  }, [form.lecturerId, form.date, token]);

  /* ================= HANDLE CHANGE ================= */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = () => {
    if (!form.date) {
      alert("Vui lòng chọn ngày tư vấn");
      return;
    }

    if (!form.time) {
      alert("Vui lòng chọn giờ tư vấn");
      return;
    }

    if (!token) {
      alert("Bạn chưa đăng nhập");
      return;
    }

    const payload = {
      lecturerId: form.lecturerId ? Number(form.lecturerId) : null,
      date: form.date,
      time: form.time, // ✅ CHỈ GỬI time
      reason: form.reason,
    };

    console.log("📤 CREATE APPOINTMENT PAYLOAD:", payload);

    fetch("http://localhost:8080/api/appointment/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })
      .then(res => {
        if (!res.ok) throw new Error("Tạo lịch hẹn thất bại");
        return res.json();
      })
      .then(() => {
        alert("Đăng ký tư vấn thành công!");
        setForm({ lecturerId: "", date: "", time: "", reason: "" });
        setFreeSlots([]);
      })
      .catch(err => alert(err.message));
  };

  return (
    <div>
      <h4 className="mb-3">📘 Đăng ký tư vấn học đường</h4>

      <div style={{ background: "#cfe6ff", padding: 20, borderRadius: 6 }}>

        {/* ===== NGÀY ===== */}
        <div className="mb-3">
          <label>Ngày tư vấn</label>
          <input
            type="date"
            className="form-control"
            name="date"
            value={form.date}
            onChange={handleChange}
          />
        </div>

        {/* ===== GIẢNG VIÊN ===== */}
        <div className="mb-3">
          <label>Giảng viên tư vấn</label>
          <select
            className="form-control"
            name="lecturerId"
            value={form.lecturerId}
            onChange={handleChange}
            disabled={!form.date}
          >
            <option value="">-- Không chọn (tự phân công) --</option>
            {lecturers.map(l => (
              <option key={l.id} value={l.id}>
                {l.fullName}
              </option>
            ))}
          </select>
        </div>

        {/* ===== GIỜ ===== */}
        <div className="mb-3">
          <label>Giờ tư vấn (30 phút)</label>

          {form.lecturerId ? (
            <select
              className="form-control"
              name="time"
              value={form.time}
              onChange={handleChange}
            >
              <option value="">-- Chọn giờ rảnh --</option>
              {freeSlots.map((slot, index) => (
                <option key={index} value={slot.startTime}>
                  {slot.startTime} - {slot.endTime}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="time"
              className="form-control"
              name="time"
              value={form.time}
              onChange={handleChange}
              step="1800"
            />
          )}

          {form.lecturerId && !freeSlots.length && (
            <small className="text-danger">
              Giảng viên không có giờ rảnh ngày này
            </small>
          )}
        </div>

        {/* ===== LÝ DO ===== */}
        <div className="mb-3">
          <label>Lý do / nội dung</label>
          <textarea
            className="form-control"
            rows={3}
            name="reason"
            value={form.reason}
            onChange={handleChange}
          />
        </div>

        <div className="text-end">
          <button className="btn btn-success" onClick={handleSubmit}>
            ➕ Đăng ký tư vấn
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConsultationPage;
