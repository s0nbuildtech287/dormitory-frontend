# 🏢 Hệ Thống Quản Lý Ký Túc Xá - Dormitory Unis

Hệ thống quản lý ký túc xá hiện đại được xây dựng bằng **React + JavaScript**, tích hợp **AI (Google Gemini)** để hỗ trợ phân tích và duyệt hồ sơ tự động.

## 🚀 Tính Năng

### 👨‍💼 Dành cho Admin

- ✅ **Dashboard tổng quan** - Thống kê sinh viên, tỷ lệ lấp đầy, doanh thu
- ✅ **Quản lý sinh viên** - Danh sách, hợp đồng, phân tích nhân khẩu
- ✅ **Quản lý phòng** - Sức chứa, phân bổ, theo dõi tình trạng
- ✅ **Duyệt hồ sơ (AI)** - Phân tích điểm ưu tiên, đề xuất duyệt tự động
- ✅ **Quản lý hóa đơn** - Theo dõi thanh toán, báo cáo doanh thu
- ✅ **Thông báo & Phản hồi** - Gửi thông báo, xử lý phản hồi với phân tích cảm xúc AI

### 👨‍🎓 Dành cho Sinh viên

- ✅ **Thông tin cá nhân** - Hồ sơ, hợp đồng
- ✅ **Thanh toán hóa đơn** - Xem và thanh toán qua VNPay
- ✅ **Gửi phản hồi** - Hệ thống tự động phân tích cảm xúc (AI)
- ✅ **Chatbot AI** - Trợ lý ảo hỗ trợ 24/7

## 🛠️ Công Nghệ Sử Dụng

- **Frontend**: React 19.2.3 (JavaScript ES6+)
- **Build Tool**: Vite 6.2.0
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Charts**: Recharts 3.6.0
- **AI Integration**: Google Gemini API (@google/genai 1.37.0)

## 📦 Cài Đặt

### Yêu cầu

- Node.js (phiên bản 16 trở lên)
- NPM hoặc Yarn

### Các bước cài đặt

1. **Clone repository:**

   ```bash
   git clone <repository-url>
   cd "Dormitory System"
   ```

2. **Cài đặt dependencies:**

   ```bash
   npm install
   ```

3. **Cấu hình API Key:**
   - Tạo file `.env.local` trong thư mục gốc
   - Thêm Google Gemini API key:

   ```env
   API_KEY=your_gemini_api_key_here
   ```

4. **Chạy ứng dụng:**

   ```bash
   npm run dev
   ```

5. **Mở trình duyệt:**
   - Truy cập: `http://localhost:5173`

## 🔑 Tài Khoản Demo

### Admin

- **Username:** admin
- **Password:** 123

### Sinh viên

- **Username:** SV001 (hoặc SV002, SV003)
- **Password:** 123

## 📁 Cấu Trúc Dự Án

```
Dormitory System/
├── components/              # Các React components
│   ├── Layout.jsx          # Layout chính với sidebar
│   ├── AdminDashboard.jsx  # Dashboard quản trị
│   ├── StudentDashboard.jsx # Dashboard sinh viên
│   ├── RoomManagement.jsx  # Quản lý phòng
│   ├── StudentManagement.jsx # Quản lý sinh viên
│   ├── BillingManagement.jsx # Quản lý hóa đơn
│   ├── RegistrationManagement.jsx # Duyệt hồ sơ (AI)
│   ├── NotificationManagement.jsx # Quản lý thông báo
│   ├── FeedbackManagement.jsx # Quản lý phản hồi
│   └── AIChatBot.jsx       # Chatbot AI
├── services/               # Services và API
│   ├── geminiService.js   # Tích hợp Gemini AI
│   └── algorithmService.js # Thuật toán phân phòng
├── types.js               # Type definitions (JS objects)
├── constants.jsx          # Mock data và constants
├── App.jsx               # Root component
├── index.jsx             # Entry point
├── vite.config.js        # Vite configuration
├── jsconfig.json         # JavaScript config
└── package.json          # Dependencies

```

## 🎨 Giao Diện

Giao diện được thiết kế hiện đại với:

- **Dark mode** cho các section đặc biệt
- **Gradient backgrounds** với hiệu ứng blur
- **Rounded corners** (2rem, 2.5rem, 3rem)
- **Shadow effects** cho depth
- **Smooth transitions** và **hover effects**
- **Responsive design** cho mọi thiết bị

## 🤖 Tính Năng AI

### 1. Phân Tích Cảm Xúc (Sentiment Analysis)

- Tự động phân tích phản hồi: Positive/Negative/Neutral
- Hiển thị biểu tượng cảm xúc tương ứng

### 2. Duyệt Hồ Sơ Thông Minh

- Chấm điểm tự động dựa trên:
  - Điểm ưu tiên
  - Khoảng cách địa lý
  - Năm học
  - Hoàn cảnh đặc biệt
- Đề xuất: Nên duyệt / Cân nhắc / Không ưu tiên
- Duyệt hàng loạt cho các hồ sơ được đề xuất

### 3. Chatbot Hỗ Trợ

- Trả lời tự động các câu hỏi về:
  - Nội quy ký túc xá
  - Cách thanh toán
  - Báo hỏng thiết bị
  - Giờ mở cửa

## 📊 Build cho Production

```bash
npm run build
```

File build sẽ được tạo trong thư mục `dist/`

## 🔄 Chuyển Đổi Từ TypeScript

Dự án này đã được chuyển đổi hoàn toàn từ TypeScript sang JavaScript thuần:

- ✅ Loại bỏ tất cả type annotations
- ✅ Chuyển enums thành plain objects
- ✅ Loại bỏ React.FC và interface props
- ✅ Cập nhật import paths (.js, .jsx)
- ✅ Giữ nguyên 100% functionality và UI

Chi tiết xem file: [CONVERSION_COMPLETE.md](./CONVERSION_COMPLETE.md)

## 📝 License

MIT License

## 👥 Đóng Góp

Mọi đóng góp đều được chào đón! Vui lòng tạo Pull Request hoặc Issue.

---

**Phát triển bởi:** Team Dormitory Unis
**Năm:** 2026
