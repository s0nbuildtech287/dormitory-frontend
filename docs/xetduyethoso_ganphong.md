# HƯỚNG DẪN QUY TRÌNH XÉT DUYỆT HỒ SƠ VÀ GÁN PHÒNG KÝ TÚC XÁ
## (Tài liệu hướng dẫn vận hành liên thông dành cho Quản lý)

Quy trình quản lý sinh viên vào ở ký túc xá được thiết kế khép kín và tự động hóa cao, giúp Ban quản lý vận hành dễ dàng thông qua ba bước chính tiếp nối nhau. Dưới đây là mô tả chi tiết quy trình vận hành và cơ chế tính toán thực tế của hệ thống.

---

## BƯỚC 1: CHUẨN BỊ VÀ MỞ ĐỢT ĐĂNG KÝ MỚI

Trước khi chính thức mở cổng đăng ký trực tuyến cho sinh viên nộp hồ sơ, Quản lý ký túc xá thực hiện kiểm tra và đánh giá năng lực sẵn sàng của hệ thống để cân đối cung cầu chỗ ở.

1. Kiểm kê và dự báo quỹ phòng trống:
Hệ thống tự động quét toàn bộ cơ sở dữ liệu để đưa ra số lượng giường trống thực tế qua hai chỉ số:
* Chỗ trống sẵn có ngay: Số giường chưa có người ở tại các phòng đang hoạt động bình thường.
* Chỗ trống sắp giải phóng: Số giường dự kiến sẽ trống trong vòng 30 ngày, 60 ngày hoặc 90 ngày tới dựa trên danh sách các hợp đồng sinh viên chuẩn bị hết hạn hiệu lực.

2. Dự báo nhu cầu đăng ký của sinh viên:
Dựa trên lịch sử số lượng đơn đăng ký của 6 năm học gần nhất kết hợp với tỷ lệ tăng trưởng giả định hàng năm (mặc định là tăng thêm 10%), hệ thống tự động tính toán ra số lượng hồ sơ dự kiến sẽ nộp vào đối với từng nhóm đối tượng (Tân sinh viên, sinh viên khóa cũ, diện chính sách).

3. So sánh chênh lệch cung cầu (Cảnh báo thông minh):
Hệ thống so sánh tổng số giường trống dự kiến có thể đáp ứng với tổng nhu cầu đăng ký ước tính:
* Chênh lệch Dương (Đủ chỗ): Quỹ chỗ trống lớn hơn nhu cầu đăng ký, hệ thống hiển thị khuyến nghị an toàn để mở đợt đăng ký mới.
* Chênh lệch Âm (Thiếu chỗ): Quỹ chỗ trống nhỏ hơn nhu cầu đăng ký, hệ thống cảnh báo Quản lý cần cân nhắc lại chỉ tiêu tuyển sinh hoặc kích hoạt hoạt động lại đối với các phòng đang tạm khóa bảo trì.

4. Thu hồi quỹ phòng qua Email nhắc gia hạn tự động:
Để tối ưu hóa số giường trống trước đợt đăng ký mới, Quản lý lọc danh sách các sinh viên sắp hết hạn hợp đồng ở trong phòng và chọn gửi email nhắc nhở hàng loạt. Hệ thống tự động gửi email yêu cầu sinh viên xác nhận việc gia hạn hoặc lập lịch bàn giao trả phòng. Riêng đối với sinh viên năm thứ tư sắp tốt nghiệp, hệ thống tự động gán nhãn cảnh báo để Quản lý không gửi email gia hạn nhầm, giúp giữ lại chỗ trống cho khóa mới.

---

## BƯỚC 2: TIẾP NHẬN VÀ XÉT DUYỆT HỒ SƠ ĐĂNG KÝ

Sau khi Quản lý mở cổng đăng ký, sinh viên nộp đơn trực tuyến và tải lên các ảnh chụp giấy tờ minh chứng diện ưu tiên. Hệ thống sẽ tự động thực hiện hai khâu kiểm tra và chấm điểm xét tuyển.

1. Tự động kiểm tra ảnh giấy tờ minh chứng bằng OCR:
Để tránh tình trạng nộp sai giấy tờ hoặc giấy tờ giả mạo, hệ thống tự động đọc văn bản trên hình ảnh minh chứng (như giấy chứng nhận hộ nghèo, thẻ thương binh, căn cước công dân). Hệ thống đối chiếu tên, mã sinh viên và các từ khóa đặc trưng của chính sách ưu tiên để gán nhãn gợi ý cho Quản lý:
* Hợp lệ: Ảnh rõ nét, thông tin khớp hoàn toàn với tờ khai.
* Nghi ngờ: Ảnh mờ hoặc có dấu hiệu không khớp thông tin, cần Quản lý kiểm tra thủ công lại bằng mắt.
* Không hợp lệ: Sai loại giấy tờ hoặc thông tin sai lệch hoàn toàn.
* Lỗi: File ảnh hỏng, không thể đọc dữ liệu.

2. Thuật toán chấm điểm xét duyệt tự động:
Hệ thống tự động chia sinh viên thành ba nhóm đối tượng để đảm bảo công bằng trong xét duyệt: Nhóm diện chính sách, Nhóm tân sinh viên và Nhóm sinh viên khóa cũ.
Mỗi nhóm sẽ áp dụng các trọng số (tỷ lệ phần trăm ưu tiên) khác nhau cho ba tiêu chí chấm điểm gồm: Điểm chính sách ưu tiên, Điểm năm học và Điểm học tập (GPA).
* Đối với nhóm diện chính sách: Tiêu chí hoàn cảnh khó khăn là quan trọng nhất và chiếm tỷ trọng điểm cao nhất (40%).
* Đối với nhóm tân sinh viên: Tiêu chí năm học thứ nhất là quan trọng nhất và chiếm tỷ trọng điểm cao nhất (50%).
* Đối với nhóm sinh viên khóa cũ: Tiêu chí kết quả học tập (GPA) tại trường là quan trọng nhất và chiếm tỷ trọng điểm cao nhất (70%).

3. Công thức tính điểm xét duyệt:
Điểm xét tuyển tổng hợp của sinh viên được tính theo cấu trúc cố định như sau:
Điểm xét tuyển = (Điểm chính sách nhân với Trọng số chính sách) + (Điểm năm học nhân với Trọng số năm học) + (Điểm học tập nhân với Trọng số học tập)

Dưới đây là các bảng điểm thành phần (mang tính chất tham khảo đại diện và có thể tùy chỉnh cấu hình tùy theo chỉ tiêu của từng trường) dùng để tính toán:

Bảng 1: Điểm quy đổi diện đối tượng chính sách ưu tiên (Cộng dồn tối đa 100 điểm)
| Đối tượng ưu tiên | Mã hệ thống | Điểm cộng đại diện |
| :--- | :--- | :---: |
| Con liệt sỹ | liet_sy | 50 |
| Con thương binh | thuong_binh | 45 |
| Hộ nghèo | ho_ngheo | 40 |
| Lưu học sinh | luu_hoc_sinh | 40 |
| Cận nghèo | can_ngheo | 35 |
| Khuyết tật | khuyet_tat | 30 |
| Hoàn cảnh khó khăn | hoan_canh_kho_khan | 30 |
| Hải đảo | hai_dao | 25 |
| Vùng sâu vùng xa | vung_sau_xa | 20 |
| Có giấy xác nhận chính sách khác | giay_xac_nhan | 15 |

Bảng 2: Điểm quy đổi theo năm học của sinh viên
| Năm học của sinh viên | Phân loại năm | Điểm quy đổi đại diện |
| :--- | :---: | :---: |
| Năm thứ nhất (Tân sinh viên) | year1 | 100 |
| Năm thứ hai | year2 | 60 |
| Năm thứ ba | year3 | 40 |
| Năm thứ tư | year4 | 20 |

Bảng 3: Quy tắc tính điểm học tập (GPA)
* Hệ số quy đổi điểm GPA: Điểm học tập hệ số 4.0 được quy đổi sang thang điểm 100 theo công thức: Điểm quy đổi = GPA x 25. Ví dụ: GPA đạt 3.20 tương đương với 3.20 x 25 = 80 điểm.
* Điểm GPA tối thiểu đầu vào để xét duyệt: 2.0 (Hồ sơ dưới 2.0 sẽ tự động xếp vào diện Không ưu tiên).

Bảng 4: Trọng số (Tỷ lệ phần trăm ưu tiên) cố định áp dụng theo nhóm
| Nhóm xét tuyển | Trọng số chính sách | Trọng số năm học | Trọng số học tập (GPA) |
| :--- | :---: | :---: | :---: |
| Nhóm 1 (Nhóm diện chính sách) | 40% (0.4) | 30% (0.3) | 30% (0.3) |
| Nhóm 2 (Nhóm tân sinh viên) | 20% (0.2) | 50% (0.5) | 30% (0.3) |
| Nhóm 3 (Nhóm sinh viên khóa cũ) | 10% (0.1) | 20% (0.2) | 70% (0.7) |

Dù các mức điểm thành phần ở Bảng 1, Bảng 2 và Bảng 3 có thể thay đổi tùy chỉnh theo quy định và chỉ tiêu của từng nhà trường, cấu trúc công thức tính điểm và tỷ lệ trọng số ở Bảng 4 luôn được giữ nguyên để xếp hạng sinh viên từ cao xuống thấp.

Dựa trên điểm xét tuyển tổng hợp, hệ thống đưa ra khuyến nghị duyệt:
* Điểm từ 70 trở lên: Khuyến nghị phê duyệt.
* Điểm từ 50 đến dưới 70: Cần xem xét thêm.
* Điểm dưới 50: Không ưu tiên tuyển chọn.

4. Cơ chế dồn chỉ tiêu thừa (Dồn hạn mức):
Quản lý thiết lập chỉ tiêu số lượng giường ở cho từng nhóm đối tượng hoặc chỉ tiêu riêng của từng khoa đào tạo. Khi một số khoa tuyển không đủ số lượng sinh viên đăng ký, hệ thống (nếu bật chế độ dồn chỉ tiêu) sẽ tự động gom số chỉ tiêu thừa của các khoa đó để bổ sung và duyệt tiếp cho các sinh viên đang xếp hàng chờ ở các khoa bị quá tải theo thứ tự điểm từ cao xuống thấp, tránh lãng phí chỗ ở.

5. Chế độ chạy thử nghiệm (Mô phỏng):
Quản lý có thể thay đổi nhanh chỉ tiêu và trọng số trên màn hình rồi bấm chạy thử nghiệm. Hệ thống sẽ mô phỏng phân bổ chỗ ở và hiển thị kết quả phân tích phân phối để Quản lý xem trước mà không làm ảnh hưởng đến dữ liệu thực tế trong database. Khi thấy kết quả mô phỏng tối ưu nhất, Quản lý mới bấm xác nhận duyệt thực tế. Những hồ sơ được duyệt thành công sẽ tự động tạo hợp đồng thuê phòng ở trạng thái Chờ xếp phòng.

---

## BƯỚC 3: XẾP GÁN PHÒNG THỰC TẾ VÀ KÍCH HOẠT HỢP ĐỒNG

Sau khi hoàn tất phê duyệt danh sách sinh viên được vào ở ký túc xá, Quản lý chạy tính năng xếp phòng tự động. Hệ thống phân bổ sinh viên vào các phòng trống thực tế theo các quy tắc thông minh sau:

1. Ràng buộc cứng bắt buộc tuân thủ:
* Đúng giới tính: Sinh viên nam chỉ được gán vào phòng dành cho nam, sinh viên nữ chỉ gán vào phòng nữ.
* Còn chỗ trống: Chỉ xếp sinh viên vào các phòng có số người ở hiện tại ít hơn sức chứa thiết kế tối đa của phòng.
* Trạng thái hoạt động: Chỉ xếp vào các phòng đang mở hoạt động bình thường, không xếp vào phòng đang bảo trì cơ sở vật chất hoặc tạm khóa.

2. Tiêu chí ưu tiên xếp gán thông minh (Trọng số mềm):
Hệ thống tính toán điểm tương thích của từng phòng trống đối với mỗi sinh viên theo các tiêu chí:
* Xếp cùng khóa học: Ưu tiên gán sinh viên học cùng năm học (ví dụ cùng năm thứ nhất) vào chung một phòng để các em có nếp sống tương đồng, dễ hòa nhập.
* Xếp cùng khoa đào tạo: Ưu tiên gán sinh viên học cùng khoa đào tạo vào chung phòng để hỗ trợ nhau trong học tập chuyên ngành.
* Tối ưu hóa lấp đầy phòng: Ưu tiên xếp dồn vào các phòng đang ở dở dang trước nhằm sử dụng tối đa hiệu suất phòng ở, tránh phân bổ rải rác lãng phí tài nguyên điện nước và khó quản lý tập trung.
* Phòng dành riêng cho đối tượng: Tự động gán sinh viên vào các phòng đặc thù được thiết lập riêng (ví dụ: phòng dành riêng cho đội xung kích, phòng dành riêng cho lưu học sinh nước ngoài).

3. Kích hoạt hợp đồng và bàn giao:
Khi tìm được phòng phù hợp nhất, hệ thống tự động gán sinh viên vào phòng, tăng số lượng người ở thực tế của phòng đó lên, cấp tài khoản cho sinh viên và kích hoạt hợp đồng thuê phòng sang trạng thái Hoạt động. Sinh viên nhận được thông báo số phòng ở và có thể đến nhận phòng.
