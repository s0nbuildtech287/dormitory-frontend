# Hướng dẫn Cơ chế Xét tuyển và Quản lý Hồ sơ Đăng ký KTX

Tài liệu này giải thích cách hoạt động của quy trình xét duyệt hồ sơ đăng ký vào ký túc xá một cách đơn giản, giúp bất kỳ ai cũng có thể hiểu được mà không cần biết về kỹ thuật hay lập trình.

---

## 1. Các bước xử lý hồ sơ đăng ký

Mỗi đơn đăng ký vào ký túc xá của sinh viên sẽ lần lượt nằm ở một trong ba trạng thái sau:

*   Chờ duyệt: Đây là trạng thái khi sinh viên mới gửi đơn lên hoặc khi ban quản lý mới nhập danh sách sinh viên vào hệ thống. Các hồ sơ này đang đợi ban quản lý kiểm tra và đưa ra quyết định.
*   Được duyệt (Chấp nhận): Khi ban quản lý đồng ý cho sinh viên vào ký túc xá. Lúc này hệ thống sẽ tạo một hợp đồng chờ xếp phòng cho sinh viên.
*   Từ chối: Khi hồ sơ không đạt yêu cầu hoặc do ký túc xá đã hết chỗ ở.

---

## 2. Hệ thống tự động tính điểm ưu tiên

Để việc xét duyệt được công bằng và nhanh chóng, hệ thống tự động tính điểm xét tuyển cho mỗi hồ sơ dựa trên ba tiêu chí chính:

### A. Ba nhóm xét tuyển riêng biệt
Hệ thống tự động chia sinh viên thành ba nhóm để so sánh công bằng:
1.  Nhóm diện chính sách: Gồm các bạn sinh viên có hoàn cảnh khó khăn hoặc thuộc diện ưu tiên của Nhà nước.
2.  Nhóm tân sinh viên: Gồm sinh viên năm thứ nhất, không thuộc diện chính sách.
3.  Nhóm sinh viên khóa cũ: Gồm sinh viên năm thứ hai trở đi, không thuộc diện chính sách.

### B. Cách quy đổi điểm cho từng tiêu chí
Mỗi sinh viên sẽ có điểm số của ba tiêu chí sau (đều quy về thang điểm tối đa là 100):

*   Điểm chính sách: Cộng dồn điểm của các diện ưu tiên mà sinh viên đạt được (tối đa 100 điểm). Ví dụ: Hộ nghèo được cộng 40 điểm, vùng sâu vùng xa được cộng 20 điểm. Nếu sinh viên có cả hai thì tổng điểm chính sách là 60 điểm.
*   Điểm năm học: Ưu tiên lớn nhất cho sinh viên năm nhất để các em sớm ổn định nơi ở. Sinh viên năm nhất được 100 điểm, năm hai được 60 điểm, năm ba được 40 điểm và năm tư được 20 điểm.
*   Điểm học tập: Lấy điểm trung bình học tập (GPA) nhân với hệ số quy đổi. Những sinh viên có điểm học tập quá thấp dưới mức trung bình (dưới 2.0) sẽ bị hệ thống đánh giá là không ưu tiên để đảm bảo chất lượng.

### C. Cách tính điểm xét tuyển cuối cùng
Mỗi nhóm sinh viên sẽ có mức độ ưu tiên (trọng số) khác nhau cho từng tiêu chí:

*   Đối với nhóm diện chính sách: Tiêu chí hoàn cảnh khó khăn là quan trọng nhất và chiếm tỷ lệ điểm cao nhất.
*   Đối với nhóm tân sinh viên: Việc là sinh viên năm nhất mới vào trường là quan trọng nhất và chiếm tỷ lệ điểm cao nhất.
*   Đối với nhóm sinh viên khóa cũ: Kết quả học tập tại trường là quan trọng nhất và chiếm tỷ lệ điểm cao nhất.

Hệ thống sẽ lấy điểm của từng tiêu chí nhân với tỷ lệ ưu tiên tương ứng rồi cộng lại để ra điểm xét tuyển cuối cùng. Sinh viên có điểm xét tuyển càng cao thì càng được ưu tiên duyệt vào ở trước.

Hệ thống cũng tự động đưa ra các gợi ý duyệt cho ban quản lý dễ quan sát:
*   Điểm từ 70 trở lên: Khuyến nghị duyệt.
*   Điểm từ 50 đến dưới 70: Cần cân nhắc.
*   Điểm dưới 50: Không ưu tiên.

---

## 3. Tự động kiểm tra ảnh giấy tờ minh chứng

Để tránh việc nộp nhầm hoặc giả mạo giấy tờ, hệ thống có tính năng tự động đọc và quét hình ảnh giấy tờ minh chứng (như giấy chứng nhận hộ nghèo, thẻ thương binh...) mà sinh viên tải lên.

Hệ thống sẽ đối chiếu thông tin trên ảnh giấy tờ xem có khớp với tên sinh viên, mã sinh viên và đúng loại giấy tờ hay không, sau đó dán nhãn gợi ý cho ban quản lý biết:
*   Hợp lệ: Giấy tờ chính xác, thông tin trùng khớp.
*   Nghi ngờ: Giấy tờ bị mờ hoặc có dấu hiệu bất thường cần ban quản lý kiểm tra lại bằng mắt.
*   Không hợp lệ: Sai loại giấy tờ hoặc thông tin không trùng khớp.
*   Lỗi: Ảnh bị lỗi không đọc được.
