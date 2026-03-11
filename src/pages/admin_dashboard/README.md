# Dashboard - Trang Tổng Quan

## Cấu trúc

Trang Dashboard có các tab con:

1. **Trang chủ** - Hiển thị tổng quan hệ thống
2. **Thống kê & Phân tích** - Chuyển đến trang Hồ sơ đăng ký (tab thống kê)
3. **Thống kê mật độ** - Chuyển đến trang Quản lý phòng (tab analytics)
4. **Thống kê hợp đồng** - Chuyển đến trang Hợp đồng sinh viên (tab stats)
5. **Thống kê hóa đơn** - Chuyển đến trang Hóa đơn (tab statistics)
6. **Thống kê phản ánh** - Chuyển đến trang Phản ánh (tab statistics)

## Cách hoạt động

Khi người dùng click vào các tab thống kê (2-6), hệ thống sẽ:
1. Lưu `targetTab: 'stats'` vào localStorage
2. Navigate đến trang tương ứng
3. Trang đích sẽ đọc localStorage và tự động chuyển sang tab thống kê
4. Xóa flag trong localStorage sau khi đã sử dụng

## Trang chủ Dashboard

Hiển thị:
- Welcome banner với ngày giờ hiện tại
- 6 stat cards nhanh (Hồ sơ, Phòng, Hợp đồng, Hóa đơn, Phản ánh, Thông báo)
- 2 metric cards chi tiết (Tài chính & Tình trạng phòng)
- Danh sách cảnh báo & công việc cần xử lý

## TODO

- [ ] Kết nối API thực tế thay vì mock data
- [ ] Thêm real-time updates
- [ ] Thêm charts/graphs cho metrics
- [ ] Thêm export reports
