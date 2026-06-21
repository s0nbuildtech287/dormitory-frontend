# Hướng dẫn Cơ chế Duyệt hồ sơ và Xếp gán phòng KTX

Tài liệu này giải thích quy trình duyệt hồ sơ đăng ký và cách thức xếp phòng cho sinh viên vào ở ký túc xá một cách đơn giản, dễ hiểu cho người sử dụng thông thường.

---

## Quy trình 2 bước độc lập

Để đảm bảo tính chính xác và dễ quản lý, quy trình đưa một sinh viên vào ở ký túc xá được chia làm hai bước riêng biệt:

*   Bước 1 (Duyệt hồ sơ): Ban quản lý duyệt đơn đăng ký của sinh viên. Những sinh viên được duyệt sẽ có một hợp đồng ở trạng thái chờ xếp phòng (chưa có số phòng cụ thể).
*   Bước 2 (Xếp phòng): Ban quản lý chạy tính năng gán phòng để xếp những sinh viên đã được duyệt ở Bước 1 vào các phòng trống thực tế.

---

## BƯỚC 1: Cơ chế duyệt hồ sơ tự động và dồn chỉ tiêu

Bước này giúp xác định những sinh viên nào đủ tiêu chuẩn được vào ở ký túc xá.

### 1. Thứ tự xét tuyển
Hệ thống tự động sắp xếp danh sách sinh viên theo thứ tự ưu tiên từ trên xuống dưới:
*   Đầu tiên là nhóm diện chính sách (ưu tiên hàng đầu).
*   Tiếp theo là nhóm tân sinh viên năm thứ nhất.
*   Cuối cùng là nhóm sinh viên khóa cũ.
*   Trong cùng một nhóm, sinh viên nào có điểm xét tuyển cao hơn sẽ được xếp lên trên để duyệt trước.

### 2. Kiểm soát bằng hạn mức (Chỉ tiêu)
Hệ thống quản lý việc xét duyệt dựa trên các hạn mức sau:
*   Tổng số chỗ ở tối đa của ký túc xá (ví dụ 1000 chỗ).
*   Hạn mức theo nhóm đối tượng (ví dụ dành 60% số chỗ cho tân sinh viên và 40% cho sinh viên khóa cũ).
*   Hạn mức theo từng khoa (tùy chọn): Giới hạn số lượng sinh viên tối đa của từng khoa được phép vào ở. Hạn mức này được chia riêng biệt cho Tân sinh viên của khoa và Lưu sinh viên của khoa để ban quản lý dễ điều chỉnh. Khoa nào để hạn mức bằng 0 nghĩa là khoa đó không bị giới hạn riêng.

### 3. Cơ chế dồn chỉ tiêu thừa (Dồn hạn mức)
Khi có một số khoa hoặc nhóm đối tượng không tuyển hết hạn mức đã định, số chỗ dư ra sẽ được xử lý như sau:
*   Nếu tắt chế độ dồn chỉ tiêu: Các sinh viên nộp đơn vượt quá hạn mức của khoa quá tải sẽ bị loại trực tiếp. Số chỗ thừa của các khoa khác sẽ bị bỏ phí.
*   Nếu bật chế độ dồn chỉ tiêu: Hệ thống tự động thu gom toàn bộ số chỗ dư thừa của các khoa tuyển không đủ để dồn sang duyệt tiếp cho các sinh viên đang phải xếp hàng chờ ở các khoa bị quá tải. Việc dồn chỉ tiêu vẫn ưu tiên theo điểm xét tuyển từ cao xuống thấp.

### 4. Chế độ chạy thử nghiệm (Mô phỏng)
Ban quản lý có thể điều chỉnh nhanh các hạn mức chỉ tiêu trực tiếp trên màn hình và bấm chạy thử nghiệm. Hệ thống sẽ tính toán và hiển thị kết quả phân bổ chi tiết cho ban quản lý xem trước mà không ghi dữ liệu thật hay làm thay đổi danh sách sinh viên trong cơ sở dữ liệu. Khi thấy kết quả thử nghiệm hợp lý, ban quản lý mới bấm xác nhận duyệt thực tế để lưu lại.

---

## BƯỚC 2: Cơ chế xếp gán phòng thực tế

Sau khi sinh viên đã được duyệt hồ sơ ở Bước 1, ban quản lý tiến hành xếp phòng thực tế dựa trên các nguyên tắc sau:

*   Đúng giới tính: Sinh viên nam chỉ được xếp vào phòng nam, sinh viên nữ chỉ được xếp vào phòng nữ.
*   Còn giường trống: Chỉ xếp sinh viên vào các phòng chưa đủ người so với sức chứa tối đa của phòng đó.
*   Ưu tiên cùng khoa và cùng khóa: Hệ thống ưu tiên xếp những sinh viên học cùng khoa và cùng năm học vào chung một phòng. Điều này giúp các em dễ dàng làm quen, giúp đỡ nhau trong học tập và sinh hoạt hàng ngày.
*   Xếp dồn lấp đầy: Hệ thống xếp dồn sinh viên vào các phòng để sử dụng phòng tối ưu nhất, tránh việc mỗi phòng chỉ có một vài người ở rải rác gây lãng phí tài nguyên và khó quản lý.
