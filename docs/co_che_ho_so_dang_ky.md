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

### D. Bảng điểm quy đổi và trọng số hiện tại của hệ thống

Dưới đây là chi tiết toàn bộ thang điểm và trọng số đang được áp dụng trực tiếp trên hệ thống:

#### 1. Thang điểm đối tượng ưu tiên (Chính sách)
Hệ thống cộng dồn điểm dựa trên các chính sách ưu tiên hợp lệ mà sinh viên đã nộp minh chứng (tổng tối đa là 100 điểm):

| Đối tượng ưu tiên | Mã hệ thống | Điểm cộng |
| :--- | :--- | :---: |
| Con liệt sỹ | `liet_sy` | 50 |
| Con thương binh | `thuong_binh` | 45 |
| Hộ nghèo | `ho_ngheo` | 40 |
| Lưu học sinh | `luu_hoc_sinh` | 40 |
| Cận nghèo | `can_ngheo` | 35 |
| Khuyết tật | `khuyet_tat` | 30 |
| Hoàn cảnh khó khăn | `hoan_canh_kho_khan` | 30 |
| Hải đảo | `hai_dao` | 25 |
| Vùng sâu vùng xa | `vung_sau_xa` | 20 |
| Có giấy xác nhận chính sách khác | `giay_xac_nhan` | 15 |

#### 2. Thang điểm theo năm học
Nhằm ổn định nơi ở cho các tân sinh viên và sinh viên các khóa khác:

| Năm học | Phân loại | Điểm quy đổi |
| :--- | :---: | :---: |
| Năm thứ nhất (Tân sinh viên) | `year1` | 100 |
| Năm thứ hai | `year2` | 60 |
| Năm thứ ba | `year3` | 40 |
| Năm thứ tư | `year4` | 20 |

#### 3. Quy tắc quy đổi điểm học tập (GPA)
*   Hệ số quy đổi: Điểm GPA (hệ 4.0) được quy đổi sang thang điểm 100 theo công thức: Điểm quy đổi = GPA x 25. (Ví dụ: GPA đạt 3.20 tương đương với 3.20 x 25 = 80 điểm).
*   Điểm GPA tối thiểu để xét duyệt: 2.0. Các hồ sơ có điểm GPA dưới 2.0 sẽ tự động chuyển sang trạng thái "Không ưu tiên".

#### 4. Bảng trọng số (Tỷ lệ ưu tiên) theo nhóm xét tuyển
Tùy thuộc vào nhóm sinh viên, hệ thống sẽ tự động áp dụng các tỷ lệ trọng số khác nhau để tính điểm xét duyệt cuối cùng:

| Nhóm xét tuyển | Tỷ trọng Chính sách | Tỷ trọng Năm học | Tỷ trọng Học tập (GPA) |
| :--- | :---: | :---: | :---: |
| Nhóm 1 (Nhóm diện chính sách) | 40% (0.4) | 30% (0.3) | 30% (0.3) |
| Nhóm 2 (Nhóm tân sinh viên) | 20% (0.2) | 50% (0.5) | 30% (0.3) |
| Nhóm 3 (Nhóm sinh viên khóa cũ) | 10% (0.1) | 20% (0.2) | 70% (0.7) |

---

## 3. Tự động kiểm tra ảnh giấy tờ minh chứng

Để tránh việc nộp nhầm hoặc giả mạo giấy tờ, hệ thống có tính năng tự động đọc và quét hình ảnh giấy tờ minh chứng (như giấy chứng nhận hộ nghèo, thẻ thương binh...) mà sinh viên tải lên.

Hệ thống sẽ đối chiếu thông tin trên ảnh giấy tờ xem có khớp với tên sinh viên, mã sinh viên và đúng loại giấy tờ hay không, sau đó dán nhãn gợi ý cho ban quản lý biết:
*   Hợp lệ: Giấy tờ chính xác, thông tin trùng khớp.
*   Nghi ngờ: Giấy tờ bị mờ hoặc có dấu hiệu bất thường cần ban quản lý kiểm tra lại bằng mắt.
*   Không hợp lệ: Sai loại giấy tờ hoặc thông tin không trùng khớp.
*   Lỗi: Ảnh bị lỗi không đọc được.

---

## 4. Khâu chuẩn bị và mở đợt đăng ký mới (Vận hành hệ thống)

Trước khi chính thức mở cổng cho sinh viên nộp hồ sơ, Ban quản lý sẽ thực hiện khâu đánh giá năng lực sẵn sàng (Readiness Check) để đảm bảo Ký túc xá đáp ứng đủ chỗ ở và vận hành trơn tru:

### A. Dự báo và kiểm kê quỹ phòng trống
Hệ thống tự động thống kê số lượng giường ở thời điểm hiện tại thông qua 2 chỉ số:
*   Chỗ trống sẵn có ngay: Giường chưa có người ở trong các phòng đang hoạt động (Active).
*   Chỗ trống sắp giải phóng: Số giường sẽ trống trong vòng X ngày tới (ví dụ 30, 60, 90 ngày) dựa trên danh sách các hợp đồng sinh viên chuẩn bị hết hạn hợp đồng.

### B. Dự báo nhu cầu đăng ký
Hệ thống sử dụng dữ liệu lịch sử đăng ký của 6 năm gần nhất kết hợp với tỷ lệ tăng trưởng giả định hàng năm (ví dụ +10%) để đưa ra số lượng hồ sơ dự báo sẽ nộp vào cho từng đối tượng (Tân sinh viên, sinh viên khóa cũ, diện chính sách).

Hệ thống tự động tính toán chênh lệch Cung - Cầu để đưa ra cảnh báo:
*   Chênh lệch Dương (Đủ chỗ): Số chỗ trống dự kiến lớn hơn nhu cầu đăng ký -> Hệ thống khuyến nghị an toàn để mở đợt đăng ký.
*   Chênh lệch Âm (Thiếu chỗ): Số chỗ trống dự kiến nhỏ hơn nhu cầu đăng ký -> Cảnh báo Ban quản lý cần cân đối lại chỉ tiêu hoặc chuyển các phòng đang bảo trì (Maintenance) quay lại hoạt động.

### C. Gửi email nhắc gia hạn tự động để giải phóng quỹ phòng
Để có con số chính xác về số lượng giường sẽ được giải phóng, Ban quản lý có thể lọc danh sách các hợp đồng sắp hết hạn trực tiếp trên giao diện:
1.  Lọc theo số ngày sắp hết hạn (30 ngày, 60 ngày hoặc 90 ngày).
2.  Chọn hàng loạt sinh viên và click gửi email nhắc nhở tự động.
3.  Hệ thống sẽ gửi email (qua giao thức SMTP gửi thư tự động) yêu cầu sinh viên xác nhận: Tiếp tục gia hạn (để giữ chỗ) hoặc Lập lịch bàn giao phòng (để giải phóng giường cho đợt tuyển sinh mới).
*(Lưu ý: Đối với sinh viên năm thứ 4 sắp tốt nghiệp, hệ thống sẽ tự động gán nhãn cảnh báo để Ban quản lý không gửi email gia hạn, giúp giữ lại chỗ trống cho khóa mới).*
