# 🏗️ Cấu Trúc Dự Án React - DormiManage

## 📁 Cấu Trúc Thư Mục Chuẩn React

```
Dormitory System/
│
├── public/                      # File tĩnh public
│   ├── index.html              # HTML template chính
│   └── favicon.ico             # (có thể thêm)
│
├── src/                        # Source code chính
│   │
│   ├── assets/                 # Ảnh, icon, fonts
│   │   └── (thêm logo, images...)
│   │
│   ├── components/             # React components dùng chung
│   │   ├── Layout.jsx          # Layout với sidebar & header
│   │   └── AIChatBot.jsx       # Chatbot component
│   │
│   ├── pages/                  # Các trang (routes)
│   │   ├── AdminDashboard.jsx          # Trang dashboard admin
│   │   ├── StudentDashboard.jsx        # Trang dashboard sinh viên
│   │   ├── RoomManagement.jsx          # Quản lý phòng
│   │   ├── StudentManagement.jsx       # Quản lý sinh viên
│   │   ├── BillingManagement.jsx       # Quản lý hóa đơn
│   │   ├── RegistrationManagement.jsx  # Duyệt hồ sơ (AI)
│   │   ├── NotificationManagement.jsx  # Quản lý thông báo
│   │   └── FeedbackManagement.jsx      # Quản lý phản hồi
│   │
│   ├── services/               # API calls & external services
│   │   ├── geminiService.js    # Google Gemini AI integration
│   │   └── algorithmService.js # Room allocation algorithm
│   │
│   ├── utils/                  # Utilities & helpers
│   │   ├── constants.jsx       # Mock data & constants
│   │   └── types.js           # Type definitions (JS objects)
│   │
│   ├── App.jsx                 # Root component với routing
│   ├── main.jsx               # Entry point (ReactDOM.render)
│   └── index.css              # Global CSS (Tailwind)
│
├── .env.local                  # Environment variables (API keys)
├── .gitignore                 # Git ignore rules
├── jsconfig.json              # JavaScript config
├── package.json               # Dependencies
├── vite.config.js             # Vite configuration
└── README.md                  # Documentation

```

## 📊 Chi Tiết Các Thư Mục

### 🔵 public/

- **Mục đích**: Chứa file tĩnh không qua build process
- **File**: index.html (điểm vào HTML)
- **Lưu ý**: File trong public/ được copy nguyên vẹn vào dist/

### 🟢 src/

Thư mục chứa toàn bộ source code

#### 📸 src/assets/

- Hình ảnh: logo, banner, avatars
- Icons: SVG, PNG icons
- Fonts: Custom fonts (nếu cần)

#### 🧩 src/components/

**Components dùng chung** (reusable)

- `Layout.jsx` - Sidebar, header, wrapper
- `AIChatBot.jsx` - Floating chatbot

**Quy tắc**:

- Không chứa logic nghiệp vụ phức tạp
- Có thể tái sử dụng ở nhiều trang
- Nhận data qua props

#### 📄 src/pages/

**Các trang chính** (mỗi page = 1 route)

**Admin Pages**:

- `AdminDashboard.jsx` - Tổng quan thống kê
- `RoomManagement.jsx` - Quản lý phòng ở
- `StudentManagement.jsx` - Quản lý sinh viên
- `BillingManagement.jsx` - Quản lý hóa đơn
- `RegistrationManagement.jsx` - Duyệt hồ sơ (AI)
- `NotificationManagement.jsx` - Gửi thông báo
- `FeedbackManagement.jsx` - Xử lý phản hồi

**Student Pages**:

- `StudentDashboard.jsx` - Dashboard sinh viên

**Quy tắc**:

- Mỗi page tương ứng 1 route/tab
- Chứa logic nghiệp vụ của trang đó
- Import components từ `../components/`

#### 🔌 src/services/

**API & External Services**

- `geminiService.js` - Google Gemini AI
  - `analyzeSentiment()` - Phân tích cảm xúc
  - `getAIChatResponse()` - Chatbot responses

- `algorithmService.js` - Business logic
  - `smartAllocate()` - Thuật toán phân phòng

**Quy tắc**:

- Tách biệt API calls khỏi components
- Export functions, không export components
- Handle errors trong service

#### 🛠️ src/utils/

**Helper functions & constants**

- `constants.jsx` - Mock data (MOCK_STUDENTS, MOCK_ROOMS...)
- `types.js` - Type definitions as objects (UserRole, Gender...)

**Quy tắc**:

- Pure functions, không side effects
- Không import components
- Có thể import ở bất kỳ đâu

#### ⚛️ src/App.jsx

**Root component**

- Authentication logic
- Tab/Route management
- Layout wrapper
- Conditional rendering based on user role

#### 🚀 src/main.jsx

**Entry point**

```javascript
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

## 🎯 Import Rules

### ✅ Đúng - Relative Imports

```javascript
// Trong src/pages/AdminDashboard.jsx
import Layout from "../components/Layout.jsx";
import { MOCK_STUDENTS } from "../utils/constants.jsx";
import { geminiService } from "../services/geminiService.js";
```

### ✅ Đúng - Absolute Imports (nếu config alias)

```javascript
// Trong vite.config.js: alias: { '@': './src' }
import Layout from "@/components/Layout.jsx";
import { MOCK_STUDENTS } from "@/utils/constants.jsx";
```

### ❌ Sai

```javascript
// KHÔNG import page từ page khác
import AdminDashboard from "../pages/AdminDashboard.jsx"; // ❌
```

## 🔄 Data Flow

```
main.jsx (entry)
    ↓
App.jsx (state, auth, routing)
    ↓
Layout.jsx (wrapper)
    ↓
Pages (AdminDashboard, StudentDashboard...)
    ↓
Components (AIChatBot, etc.)
    ↓
Services (API calls)
```

## 📝 Naming Conventions

### Files

- **Components/Pages**: PascalCase (`AdminDashboard.jsx`)
- **Services/Utils**: camelCase (`geminiService.js`)
- **CSS**: kebab-case (`index.css`)

### Folders

- **Lowercase**: `src/`, `components/`, `pages/`
- **Descriptive**: tên thư mục mô tả rõ nội dung

## 🚀 Development Workflow

```bash
# 1. Cài đặt
npm install

# 2. Cấu hình .env.local
API_KEY=your_gemini_api_key

# 3. Chạy dev server
npm run dev

# 4. Build production
npm run build

# 5. Preview build
npm run preview
```

## 📦 Build Output

```
dist/
├── index.html           # HTML đã inject scripts
├── assets/
│   ├── index-[hash].js  # Bundled JavaScript
│   └── index-[hash].css # Bundled CSS
└── ...
```

## ✨ Best Practices

1. **Component purity**: Components nhận props, không fetch data
2. **Service separation**: API calls trong services/, không trong components
3. **Utils independence**: Utils functions thuần túy, không side effects
4. **Page isolation**: Pages độc lập, không import lẫn nhau
5. **Lazy loading**: Có thể thêm React.lazy() cho các pages lớn

---

**Cấu trúc này tuân theo chuẩn React best practices! 🎉**
