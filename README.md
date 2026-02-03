Student Consultation Management System

Live Demo
Website: student-consultation-nqd.vercel.app

Lưu ý: Vì hệ thống sử dụng các nền tảng miễn phí (Render & Vercel), server Backend có thể rơi vào trạng thái "ngủ" nếu không có người truy cập. Trong lần đầu tiên truy cập, vui lòng đợi từ 1-2 phút để hệ thống khởi động hoàn tất (Cold Start). 

Chức năng hệ thống 

Hệ thống được thiết kế với luồng nghiệp vụ chặt chẽ, phân quyền rõ ràng cho 4 nhóm người dùng thông qua hệ thống xác thực tập trung
<img width="1212" height="984" alt="image" src="https://github.com/user-attachments/assets/34928947-2f8d-4526-93ab-897f32c551f7" />


1. Phân hệ Sinh viên 
Tìm kiếm & Đặt lịch: Cho phép sinh viên tra cứu danh sách giảng viên và đăng ký lịch tư vấn trực tuyến.

Đăng ký thủ tục: Gửi các yêu cầu xử lý thủ tục hành chính học đường tới bộ phận chuyên trách.

Quản lý lịch hẹn: Theo dõi trạng thái, thời gian và lịch sử các buổi tư vấn đã đăng ký.

Quản lý tài khoản: Cập nhật thông tin cá nhân và quản lý trạng thái đăng nhập hệ thống.
Trợ lý ảo AI (AI Chatbot): Tích hợp công nghệ AI hỗ trợ sinh viên trả vấn thông tin nhanh về lịch trống của giảng viên, thủ tục
<img width="407" height="572" alt="image" src="https://github.com/user-attachments/assets/f85c0357-5ab3-4db4-a1d1-726f7a6c202e" /> <img width="387" height="570" alt="image" src="https://github.com/user-attachments/assets/fdd91cd3-6f40-4df6-919a-6f6f2ebf17cd" />

2. Phân hệ Giảng viên 
Quản lý lịch làm việc: Thiết lập các khung giờ rảnh để sinh viên có thể chủ động đặt lịch.

Xử lý yêu cầu: Xem danh sách đăng ký và xử lý các yêu cầu hủy lịch hẹn từ phía sinh viên.

Báo cáo: Thống kê các buổi tư vấn đã thực hiện và quản lý hồ sơ công việc.
<img width="1920" height="992" alt="image" src="https://github.com/user-attachments/assets/1891e86c-3ce8-4123-9218-8107329e8d18" />

3. Phân hệ Nhân viên 
Xử lý thủ tục: Tiếp nhận, kiểm tra và phản hồi kết quả cho các yêu cầu thủ tục hành chính của sinh viên.

4. Phân hệ Quản trị viên 
Quản trị người dùng: Quản lý tập trung dữ liệu Sinh viên, Giảng viên và Nhân viên trên toàn hệ thống.

Quản lý danh mục: Thiết lập các loại hình thủ tục hành chính và danh mục tư vấn.

Giám sát hệ thống: Theo dõi toàn bộ lịch hẹn và truy xuất các báo cáo thống kê tổng quan.
<img width="1916" height="993" alt="image" src="https://github.com/user-attachments/assets/b82bb71c-b54f-4561-9535-d22b5bf9a4a3" />



Tất cả các chức năng trên đều được bảo mật nghiêm ngặt. Hệ thống yêu cầu người dùng phải Đăng nhập thành công để xác thực quyền hạn (Authentication) trước khi truy cập vào các tài nguyên tương ứng với vai trò của mình.
