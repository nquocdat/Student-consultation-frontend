import axiosClient from "./axiosClient";

const appointmentApi = {

    // ===== STUDENT =====
    getMyAppointments() {
        return axiosClient.get("/api/appointment/my");
    },

    requestCancel(id) {
        return axiosClient.put(`/api/appointment/${id}/cancel/student`);
    },

    // ===== LECTURER =====
    getLecturerAppointments() {
        return axiosClient.get("/api/appointment/lecturer/my");
    },

    // ✅ CẬP NHẬT: Duyệt lịch hẹn kèm tin nhắn phản hồi
    approve(id, message) {
        // Gửi message dưới dạng query param (VD: .../approve?message=PhongC01)
        // Tham số thứ 2 là body (null), tham số thứ 3 là config (params)
        return axiosClient.put(`/api/appointment/${id}/approve`, null, {
            params: { message: message }
        });
    },

    reject(id) {
        return axiosClient.put(`/api/appointment/${id}/reject`);
    },

    // 🔥 XỬ LÝ YÊU CẦU HỦY
    approveCancelRequest(id) {
        return axiosClient.put(
            `/api/appointment/${id}/cancel-request/approve`
        );
    },

    rejectCancelRequest(id) {
        return axiosClient.put(
            `/api/appointment/${id}/cancel-request/reject`
        );
    },

    // giảng viên chủ động hủy
    cancelByLecturer(id) {
        return axiosClient.put(`/api/appointment/${id}/cancel/lecturer`);
    }
};

export default appointmentApi;