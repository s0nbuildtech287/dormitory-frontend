# AGENTS.md — Dormitory Frontend

> Tài liệu hướng dẫn dành cho AI Agent khi làm việc với dự án frontend.
> Xưng hô với chủ dự án là **master Xuân Sơn**.

---

## 1. Tổng quan dự án

Giao diện quản lý ký túc xá Đại học Thủy Lợi (TLU). SPA React phục vụ hai nhóm người dùng: **Admin** (Ban quản lý) và **Student** (Sinh viên), kết nối backend qua REST API và Socket.IO.

- **Framework:** React 19 (Vite 6, ESM)
- **Routing:** React Router DOM 7
- **Styling:** Tailwind CSS 4
- **Icons:** lucide-react
- **Charts:** Recharts
- **Realtime:** socket.io-client 4
- **AI Chatbot:** @google/genai (Gemini)
- **Build tool:** Vite 6
- **Backend URL mặc định:** `http://localhost:1234`

---

## 2. Cấu trúc thư mục

```
dormitory-frontend/
├── index.html
├── vite.config.js
├── tailwind.config.js
├── src/
│   ├── main.jsx               # Entry point, mount <App />
│   ├── App.jsx                # Root: AuthProvider, Router, RouteConfig + Layout
│   ├── index.css              # Tailwind directives + custom global styles
│   │
│   ├── config/
│   │   └── api.js             # BACKEND_URL, API_BASE_URL, SOCKET_URL (đọc từ .env)
│   │
│   ├── utils/
│   │   ├── types.js           # Enum-like objects: UserRole, Gender, BillStatus, ...
│   │   ├── constants.jsx      # Re-export BACKEND_URL, các hằng số chung
│   │   └── buildingDisplay.js # Helper map mã tòa nhà → tên hiển thị
│   │
│   ├── assets/
│   │   ├── icons.js           # Export các icon SVG
│   │   ├── images.js          # Export các ảnh tĩnh
│   │   ├── index.js           # Barrel export
│   │   └── images/            # File ảnh: logo.png, ktx.jpg, tlu*.jpg, ...
│   │
│   ├── api/                   # Hàm gọi API → fetch/axios wrapper, mỗi file ứng 1 module
│   │   ├── apiAuth.js         # login, logout, getCurrentUser, changePassword, OTP
│   │   ├── apiRoom.js         # getRooms, createRoom, updateRoom, ...
│   │   ├── apiRegistration.js
│   │   ├── apiContract.js
│   │   ├── apiInvoice.js
│   │   ├── apiFeedback.js
│   │   ├── apiNotification.js
│   │   ├── apiAsset.js
│   │   ├── apiDiscipline.js
│   │   ├── apiStudent.js
│   │   ├── apiLog.js
│   │   ├── apiEmail.js
│   │   ├── apiNews.js
│   │   └── apiVNPay.js
│   │
│   ├── contexts/              # React Context — state toàn cục
│   │   ├── AuthContext.jsx    # user, isLoading, login(), logout()
│   │   ├── NotificationContext.jsx  # notifications, adminAlerts, unreadCount, socket
│   │   ├── NavigationContext.jsx    # contractFilter, invoiceFilter, notificationData
│   │   ├── ChatBotContext.jsx       # trạng thái chatbot AI
│   │   └── index.js           # Barrel export
│   │
│   ├── hooks/                 # Custom React hooks
│   │   ├── usePagination.js           # Phân trang phía client
│   │   ├── useSelection.js            # Chọn nhiều dòng trong bảng
│   │   ├── useBuildingDisplayNames.js # Map mã tòa → tên hiển thị
│   │   ├── useNavigationHandlers.js   # Handler điều hướng liên module
│   │   └── index.js                   # Barrel export
│   │
│   ├── components/
│   │   ├── Layout.jsx         # Shell chung: sidebar + header + children
│   │   ├── AIChatBot.jsx      # Floating chatbot (Gemini)
│   │   └── common/            # Các component dùng lại trên nhiều trang
│   │       ├── PageTabs.jsx       # Tab điều hướng nội bộ trang (BẮT BUỘC dùng)
│   │       ├── DataTable.jsx      # Bảng dữ liệu chuẩn
│   │       ├── Pagination.jsx     # Phân trang
│   │       ├── FilterBar.jsx      # Thanh lọc/tìm kiếm
│   │       ├── StatCard.jsx       # Card thống kê (số liệu tổng quan)
│   │       ├── ConfirmModal.jsx   # Modal xác nhận hành động
│   │       └── EmailComposeModal.jsx  # Modal soạn email
│   │
│   ├── router/
│   │   ├── index.js           # ADMIN_ROUTES, STUDENT_ROUTES — định nghĩa cấu hình route
│   │   ├── RouteConfig.jsx    # Render <Routes> từ config, inject props đặc biệt
│   │   ├── ProtectedRoute.jsx # Bảo vệ route theo role
│   │   └── routeUtils.js      # Helper: getRoutesByRole, getRouteById, ...
│   │
│   └── pages/                 # Mỗi folder = 1 module chức năng
│       ├── auth/
│       │   └── LoginPage.jsx
│       │
│       ├── admin_dashboard/         # /dashboard — Tổng quan admin
│       │   ├── index.jsx
│       │   └── sections/
│       │       ├── DashboardHome.jsx
│       │       ├── StatsCards.jsx
│       │       ├── Charts.jsx
│       │       ├── RecentActivity.jsx
│       │       └── ActivityLog.jsx
│       │
│       ├── registration_management/ # /registrations — Hồ sơ đăng ký
│       │   ├── index.jsx
│       │   └── sections/
│       │       ├── RegistrationList.jsx
│       │       ├── RegistrationStatistics.jsx
│       │       ├── RegistrationSettings.jsx
│       │       ├── AddRegistrationModal.jsx
│       │       ├── ModelimportCSV.jsx
│       │       └── ModelImportSheets.jsx
│       │
│       ├── contract_management/     # /students — Hợp đồng sinh viên
│       │   ├── index.jsx
│       │   └── sections/
│       │       ├── StudentList.jsx
│       │       ├── StudentDetail.jsx
│       │       ├── ContractDetailModal.jsx
│       │       └── ContractStatistics.jsx
│       │
│       ├── room_management/         # /rooms — Quản lý phòng
│       │   ├── index.jsx
│       │   └── sections/
│       │       ├── RoomList.jsx
│       │       ├── RoomDetailModal.jsx
│       │       ├── RoomAnalytics.jsx
│       │       ├── RoomSettings.jsx
│       │       └── AddRoomModal.jsx
│       │
│       ├── asset_management/        # /assets — Cơ sở vật chất
│       │   ├── index.jsx
│       │   └── sections/
│       │       ├── AssetList.jsx
│       │       ├── AssetDetailModal.jsx
│       │       ├── AssetHistoryModal.jsx
│       │       ├── AssetAnalytics.jsx
│       │       ├── AssetSettings.jsx
│       │       ├── AddAssetModal.jsx
│       │       ├── ImportAssetModal.jsx
│       │       └── ExportAssetModal.jsx
│       │
│       ├── billing_management/      # /billing — Hóa đơn
│       │   ├── index.jsx
│       │   └── sections/
│       │       ├── BillList.jsx
│       │       ├── InvoiceStatistics.jsx
│       │       ├── PricingSettings.jsx
│       │       ├── CreateInvoiceModal.jsx
│       │       ├── InvoiceDetailModal.jsx
│       │       └── AnomalyModal.jsx
│       │
│       ├── discipline_management/   # /discipline — Kỷ luật
│       │   ├── index.jsx
│       │   └── sections/
│       │       ├── DisciplineList.jsx
│       │       ├── DisciplineRegulations.jsx
│       │       └── DisciplineScoreSettings.jsx
│       │
│       ├── notification_management/ # /notifications — Thông báo
│       │   ├── index.jsx
│       │   └── sections/
│       │       ├── NotificationList.jsx
│       │       └── CreateNotificationForm.jsx
│       │
│       ├── feedback_management/     # /feedback — Phản ánh
│       │   ├── index.jsx
│       │   └── sections/
│       │       ├── FeedbackList.jsx
│       │       ├── FeedbackStatistics.jsx
│       │       └── SearchBar.jsx
│       │
│       ├── profile_admin/           # /profile-admin — Hồ sơ admin
│       │   └── index.jsx
│       │
│       ├── payment/                 # /payment/result — Kết quả VNPay
│       │   └── PaymentResult.jsx
│       │
│       └── student/                 # Portal sinh viên (dùng chung StudentDashboard)
│           ├── index.jsx            # StudentDashboard — render section theo route
│           ├── profile/index.jsx    # /profile
│           ├── contract/            # /contract
│           │   ├── index.jsx
│           │   └── ContractPrintView.jsx
│           ├── bills/index.jsx      # /bills
│           ├── home/                # /home — thông báo sinh viên
│           │   ├── index.jsx
│           │   └── NotifDetailModal.jsx
│           ├── news/index.jsx       # /news
│           ├── feedback/index.jsx   # /feedback
│           └── regulations/index.jsx # /regulations
│
├── .env                       # VITE_BACKEND_URL
└── package.json
```

---

## 3. Kiến trúc & luồng dữ liệu

```
AuthProvider
  └── NotificationContext (Socket.IO)
        └── NavigationContext
              └── ChatBotContext
                    └── BrowserRouter
                          └── Layout (Sidebar + Header)
                                └── RouteConfig → <Page index.jsx>
                                                       └── <sections/>
```

- `contexts/` quản lý state toàn cục — không dùng Redux hay Zustand
- `api/` là tầng duy nhất gọi fetch — không gọi fetch trực tiếp trong component
- Mỗi page `index.jsx` fetch dữ liệu và truyền xuống các `sections/` qua props
- `sections/` chỉ nhận props, không tự fetch API (trừ trường hợp đặc biệt có state riêng)

---

## 4. Design pattern giao diện — BẮT BUỘC tuân thủ

### Màu sắc & style chuẩn (Tailwind)

| Thành phần | Class |
|---|---|
| Background trang | `bg-slate-50` |
| Card / panel | `bg-white rounded-2xl shadow-sm border border-slate-100` |
| Header card | `px-6 py-4 border-b border-slate-100` |
| Nút primary | `bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-2` |
| Nút danger | `bg-red-500 hover:bg-red-600 text-white rounded-xl px-4 py-2` |
| Nút secondary | `bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl px-4 py-2` |
| Badge trạng thái | `px-2 py-0.5 rounded-full text-xs font-semibold` |
| Text heading | `text-slate-900 font-bold` |
| Text phụ | `text-slate-500 text-sm` |
| Sidebar active | `bg-blue-600 text-white` |
| Tab active | `border-blue-600 text-blue-700 bg-blue-50/50 border-b-2` |

### Màu badge trạng thái

```jsx
// Chờ duyệt
"bg-yellow-100 text-yellow-700 border border-yellow-200"
// Chấp nhận / Đã thanh toán
"bg-green-100 text-green-700 border border-green-200"
// Từ chối / Quá hạn
"bg-red-100 text-red-700 border border-red-200"
// Thông tin
"bg-blue-100 text-blue-700 border border-blue-200"
```

### Component dùng lại — ưu tiên trước khi tạo mới

| Component | Dùng khi |
|---|---|
| `<PageTabs>` | Mọi trang có tab điều hướng nội bộ |
| `<DataTable>` | Mọi bảng dữ liệu |
| `<Pagination>` | Khi có danh sách phân trang |
| `<FilterBar>` | Thanh tìm kiếm + lọc |
| `<StatCard>` | Card số liệu tổng quan |
| `<ConfirmModal>` | Xác nhận xóa / hành động nguy hiểm |
| `<EmailComposeModal>` | Soạn & gửi email |

---

## 5. Routing

- Routes được định nghĩa tập trung trong `src/router/index.js` — `ADMIN_ROUTES` và `STUDENT_ROUTES`
- Thêm route mới: bổ sung object vào đúng mảng, **không** sửa `RouteConfig.jsx` hoặc `Layout.jsx`
- Icon sidebar dùng tên string Lucide (ví dụ: `"LayoutDashboard"`, `"Bell"`)
- Submenu: thêm key `submenu: [...]` vào route cha — Layout tự xử lý accordion

```js
// Thêm route admin mới
{
  id: "new-feature",
  label: "Tính năng mới",
  path: "/new-feature",
  component: NewFeaturePage,
  icon: "Star",
  role: UserRole.ADMIN,
}
```

---

## 6. Gọi API

- **Không** gọi `fetch` hoặc `axios` trực tiếp trong component — luôn tạo hàm trong `src/api/`
- Dùng `BACKEND_URL` / `API_BASE_URL` từ `src/config/api.js`
- Gắn token từ `localStorage.getItem("token")` vào header `Authorization: Bearer`

```js
// src/api/apiNewFeature.js — pattern chuẩn
import { API_BASE_URL } from "../config/api.js";

const getAuthHeader = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export const getNewFeatureData = async () => {
  const res = await fetch(`${API_BASE_URL}/new-feature`, { headers: getAuthHeader() });
  const json = await res.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
};
```

---

## 7. Quy tắc khi code

### ✅ BẮT BUỘC
- Dùng **functional component + hooks**, không dùng class component
- Mọi trang mới phải dùng `<PageTabs>` nếu có nhiều section
- Dùng `<DataTable>` cho mọi bảng danh sách — không tự viết `<table>` mới
- Dùng `<ConfirmModal>` trước các hành động xóa/thay đổi không thể hoàn tác
- Tailwind class phải nhất quán với design system trên (màu slate/blue/green/red/yellow)
- Responsive: dùng prefix `sm:`, `md:`, `lg:` — đảm bảo hiển thị tốt trên mobile
- Mọi hành động async phải có loading state và hiển thị lỗi khi thất bại

### ❌ TUYỆT ĐỐI KHÔNG
- Không dùng inline style (`style={{}}`) — chỉ dùng Tailwind class
- Không cài thêm thư viện UI mới (Ant Design, MUI, Chakra, ...) — dự án dùng Tailwind thuần
- Không sửa `Layout.jsx`, `router/index.js`, `contexts/AuthContext.jsx` khi thêm tính năng mới trừ khi thực sự cần thiết
- Không tự tạo lại component khi đã có sẵn trong `components/common/`
- Không hard-code URL — luôn dùng `API_BASE_URL` / `BACKEND_URL` từ `config/api.js`
- Không commit thay đổi `.env`

### 🎨 Giao diện
- Thiết kế theo đúng format các trang hiện có: card trắng, border slate, border-radius `rounded-2xl`
- Spacing: dùng `space-y-6` cho các section, `p-6` cho nội dung card
- Loading state: hiển thị text "Đang tải dữ liệu..." hoặc skeleton — không để trống trắng
- Empty state: hiển thị icon + mô tả — dùng prop `emptyState` của `<DataTable>`

---

## 8. Contexts — cách sử dụng

```jsx
// Lấy thông tin user đang đăng nhập
import { useAuth } from "../contexts/AuthContext.jsx";
const { user, logout } = useAuth();

// Lấy/gửi thông báo realtime
import { useNotifications } from "../contexts/NotificationContext.jsx";
const { notifications, unreadCount } = useNotifications();

// Điều hướng liên module (room → contract, billing → contract, ...)
import { useNavigation } from "../contexts/NavigationContext.jsx";
```

---

## 9. Thêm trang mới — checklist

1. Tạo `src/pages/new_feature/index.jsx` (page chính, fetch data, render PageTabs)
2. Tạo `src/pages/new_feature/sections/` (các section con)
3. Tạo `src/api/apiNewFeature.js` (hàm gọi API)
4. Thêm route vào `src/router/index.js` (ADMIN_ROUTES hoặc STUDENT_ROUTES)
5. Không sửa Layout, RouteConfig, hoặc các trang khác

---

## 10. Lệnh thường dùng

```bash
npm run dev       # Dev server (Vite HMR)
npm run build     # Build production → dist/
npm run preview   # Preview bản build
```

> Sau khi `build`, copy thư mục `dist/` vào `dormitory_backend/dist/` để backend serve static.

---

## 11. Biến môi trường (.env)

```
VITE_BACKEND_URL=http://localhost:1234
```

> Mọi biến dùng trong Vite phải có prefix `VITE_`. Đọc qua `import.meta.env.VITE_...`

---

## 12. Quy tắc chỉnh sửa code

- **Đọc trước khi sửa**: Luôn đọc file đích trước. Không được giả định nội dung.
- **Sửa một lần duy nhất**: Thực hiện tất cả thay đổi trong một lượt. Không thử lại cùng một cách quá một lần.
- **Không giải thích dài dòng**: Không cần nói sắp làm gì. Làm luôn.
- **An toàn với encoding**: Với file có tiếng Việt, dùng Node.js (`fs.readFileSync/writeFileSync` với `'utf8'`) thay vì các công cụ shell (sed, patch, PowerShell string ops).
- **Báo lỗi ngay**: Nếu không tìm thấy đoạn cần thay thế, throw error ngay với tên label. Không được tự đoán hoặc âm thầm bỏ qua.
- **Không lặp lại lỗi**: Nếu cách làm thất bại, nêu nguyên nhân một lần duy nhất và đề xuất một phương án thay thế. Không giải thích lại vấn đề cũ.


---

## 13. Workflow sau khi thay đổi code

### Reset & fake data (chạy ở backend)
Sau mỗi lần thay đổi liên quan đến dữ liệu hoặc schema:

```bash
node clean-database.js   # Xóa toàn bộ dữ liệu
node fake-all-data.js    # Tạo lại dữ liệu mẫu
```

### Debug bắt buộc sau khi code
Sau mỗi thay đổi giao diện hoặc logic, phải kiểm tra:
1. Chạy lại fake data ở backend, đảm bảo dữ liệu hiển thị đúng trên UI
2. Mở các trang **không liên quan đến thay đổi** — xác nhận không bị ảnh hưởng
3. Kiểm tra console trình duyệt: không có lỗi React, không có lỗi API call
4. Nếu có lỗi: đọc lại file gốc, xác định nguyên nhân, sửa một lần duy nhất


---

## 14. Lỗi thường gặp — bắt buộc kiểm tra trước khi hoàn thành

### Import thiếu
- Sau khi viết xong component/function, rà soát **toàn bộ** identifier được dùng trong file
- Mọi component, hook, util, icon, hàm API đều phải có dòng `import` tương ứng ở đầu file
- Không được để `ReferenceError: X is not defined` do quên import
- Với icon Lucide: import đúng tên, ví dụ `import { BarChart3, Settings, List } from "lucide-react"`
- Với file nội bộ: dùng đường dẫn tương đối chính xác (`../../components/common/PageTabs.jsx`)

### Encoding & định dạng chữ tiếng Việt
- Sau khi tạo/sửa file, kiểm tra nội dung tiếng Việt không bị vỡ ký tự (mojibake)
- Luôn dùng `'utf8'` khi đọc/ghi file qua Node.js
- Không dùng shell command (sed, echo, PowerShell string ops) để ghi nội dung có tiếng Việt
- Nếu dùng `fsWrite` / `strReplace`, đảm bảo nội dung truyền vào đã encode UTF-8 đúng


---

## 15. Báo cáo sau khi hoàn thành task

Sau khi chạy xong bất kỳ task nào, **bắt buộc** báo cáo lại với **master Xuân Sơn** theo format:

- Đã làm gì (file nào, thay đổi gì)
- Kết quả kiểm tra (debug, fake data, import, encoding)
- Nếu có vấn đề phát sinh: nêu rõ nguyên nhân và cách đã xử lý
