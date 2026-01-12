export default function LecturerProfile() {
    return (
        <div className="card shadow-sm">
            <div className="card-body">
                <h4 className="mb-3">👤 Thông tin giảng viên</h4>

                <p><strong>Họ tên:</strong> Nguyễn Văn A</p>
                <p><strong>Email:</strong> lecturer@gmail.com</p>
                <p><strong>Số điện thoại:</strong> 0123456789</p>
                <p><strong>Chuyên ngành:</strong> Công nghệ thông tin</p>

                <button className="btn btn-primary">
                    ✏️ Chỉnh sửa thông tin
                </button>
            </div>
        </div>
    );
}
