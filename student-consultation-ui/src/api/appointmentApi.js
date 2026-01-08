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

    // duyệt lịch hẹn ban đầu
    approve(id) {
        return axiosClient.put(`/api/appointment/${id}/approve`);
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
