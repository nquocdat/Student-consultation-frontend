import { useEffect, useState } from "react";

const ConsultationPage = () => {
  const [form, setForm] = useState({
    lecturerId: "", // có thể rỗng
    date: "",
    time: "",
    reason: "",
  });

  const [lecturers, setLecturers] = useState([]);

  // ===== LẤY DANH SÁCH GIẢNG VIÊN =====
  useEffect(() => {
    fetch("http://localhost:8080/api/lecturers")
      .then(res => res.json())
      .then(data => setLecturers(data))
      .catch(err => console.error("Lỗi load giảng viên:", err));
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = () => {
    // ❗ KHÔNG bắt buộc lecturerId
    if (!form.date || !form.time) {
      alert("Vui lòng chọn ngày và giờ tư vấn!");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Bạn chưa đăng nhập!");
      return;
    }

    fetch("http://localhost:8080/api/appointment/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        lecturerId: form.lecturerId || null, // 👈 nếu không chọn → null
        date: form.date,
        time: form.time,
        reason: form.reason,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Tạo lịch hẹn thất bại");
        return res.json();
      })
      .then(() => {
        alert("Đăng ký lịch tư vấn thành công!");
        setForm({
          lecturerId: "",
          date: "",
          time: "",
          reason: "",
        });
      })
      .catch((err) => {
        console.error(err);
        alert(err.message);
      });
  };

  return (
    <div>
      <h4 className="mb-3">📘 Đăng ký tư vấn học đường</h4>

      <div
        style={{
          background: "#cfe6ff",
          padding: 20,
          borderRadius: 6,
          marginBottom: 20,
        }}
      >
        {/* ===== CHỌN GIẢNG VIÊN (KHÔNG BẮT BUỘC) ===== */}
        <div className="mb-3">
          <label>Giảng viên tư vấn</label>
          <select
            className="form-control"
            name="lecturerId"
            value={form.lecturerId}
            onChange={handleChange}
          >
            <option value="">
              -- Không chọn (hệ thống tự phân công) --
            </option>
            {lecturers.map((l) => (
              <option key={l.id} value={l.id}>
                {l.fullName}
              </option>
            ))}
          </select>
          <small className="text-muted">
            Nếu không chọn, hệ thống sẽ tìm giảng viên rảnh phù hợp
          </small>
        </div>

        <div className="row mb-3">
          <div className="col-md-6">
            <label>Ngày tư vấn</label>
            <input
              type="date"
              className="form-control"
              name="date"
              value={form.date}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-6">
            <label>Giờ tư vấn</label>
            <input
              type="time"
              className="form-control"
              name="time"
              value={form.time}
              onChange={handleChange}
              step="1800" // ⏱️ gợi ý 30 phút
            />
          </div>
        </div>

        <div className="mb-3">
          <label>Lý do / nội dung tư vấn</label>
          <textarea
            className="form-control"
            rows={3}
            name="reason"
            value={form.reason}
            onChange={handleChange}
            placeholder="Nhập nội dung cần tư vấn (không bắt buộc)"
          />
        </div>

        <div className="text-end">
          <button className="btn btn-success" onClick={handleSubmit}>
            ➕ Đăng ký tư vấn
          </button>
        </div>
      </div>

      {/* ===== TABLE PLACEHOLDER ===== */}
      <table className="table table-bordered table-sm text-center">
        <thead className="table-light">
          <tr>
            <th>Giảng viên</th>
            <th>Ngày</th>
            <th>Giờ</th>
            <th>Lý do</th>
            <th>Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan="5">Chưa có dữ liệu</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ConsultationPage;
