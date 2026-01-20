import axiosClient from "./axiosClient";

const scheduleApi = {
    // ================== CHO GIẢNG VIÊN ==================

    // 1. Lấy danh sách lịch rảnh của chính tôi
    // Endpoint: GET /api/schedule/lecturer/my
    getMySchedules() {
        return axiosClient.get("/api/schedule/lecturer/my");
    },

    // 2. Tạo lịch rảnh mới
    // Endpoint: POST /api/schedule/create
    // data gửi lên: { date: "2025-10-20", startTime: "08:00:00", endTime: "10:00:00" }
    create(data) {
        return axiosClient.post("/api/schedule/create", data);
    },

    // 3. Xóa lịch rảnh
    // Endpoint: DELETE /api/schedule/{id}
    delete(id) {
        return axiosClient.delete(`/api/schedule/${id}`);
    },

    // ================== CHO SINH VIÊN (Đặt lịch) ==================

    // 4. Tìm slot rảnh linh hoạt (Dùng cho trang Đặt lịch)
    // Endpoint: GET /api/schedule/slots?date=...&lecturerId=...
    getAvailableSlots(lecturerId, date) {
        return axiosClient.get("/api/schedule/slots", {
            params: { 
                lecturerId: lecturerId, 
                date: date 
            }
        });
    },

    // 5. Lấy các mốc giờ hợp lệ (Nếu bạn dùng dropdown chọn giờ)
    getValidTimes(lecturerId, date, duration) {
        return axiosClient.get("/api/schedule/valid-times", {
            params: { lecturerId, date, duration }
        });
    },
    // API Cập nhật (Sửa)
    update(id, data) {
        return axiosClient.put(`/api/schedule/${id}`, data);
    },

    // API Lấy slot thực tế còn trống (đã trừ appointment)
    // Backend cần viết endpoint này, logic giống hệt cái getAvailableSlots cho sinh viên
    getMyFreeSlots(fromDate) {
        return axiosClient.get(`/api/schedule/lecturer/my-free-slots?from=${fromDate}`);
    }
};

export default scheduleApi;