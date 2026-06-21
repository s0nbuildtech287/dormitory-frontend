# Dashboard - Trang Tổng Quan

## Cấu trúc

Trang Dashboard có các tab con hiển thị trực tiếp các trang thống kê:

1. **Trang chủ** - Hiển thị tổng quan hệ thống với các card và cảnh báo
2. **Thống kê & Phân tích** - Hiển thị component RegistrationStatistics
3. **Thống kê mật độ** - Hiển thị component RoomAnalytics
4. **Thống kê hợp đồng** - Hiển thị component ContractStatistics
5. **Thống kê hóa đơn** - Hiển thị component InvoiceStatistics
6. **Thống kê phản ánh** - Hiển thị component FeedbackStatistics

## Cách hoạt động

- Tất cả các trang thống kê được hiển thị trực tiếp trong Dashboard
- Khi chuyển tab, component tương ứng sẽ fetch data từ API
- Có loading spinner khi đang fetch data
- User có thể xem thống kê ngay tại Dashboard hoặc vào từng trang riêng

## Ưu điểm

- Tiện lợi: Xem tất cả thống kê tại một nơi
- Linh hoạt: Vẫn có thể vào từng trang riêng để xem chi tiết và thao tác
- Hiệu quả: Chỉ fetch data khi cần (lazy loading)

## Trang chủ Dashboard

Hiển thị:
- Welcome banner với ngày giờ hiện tại
- 6 stat cards nhanh (Hồ sơ, Phòng, Hợp đồng, Hóa đơn, Phản ánh, Thông báo)
- 2 metric cards chi tiết (Tài chính & Tình trạng phòng)
- Danh sách cảnh báo & công việc cần xử lý

## TODO

- [ ] Kết nối API thực tế cho DashboardHome (hiện đang dùng mock data)
- [ ] Tạo API getFeedbacks cho feedback statistics
- [ ] Thêm real-time updates
- [ ] Thêm refresh button cho từng tab thống kê
- [ ] Cache data để tránh fetch lại khi switch tabs
