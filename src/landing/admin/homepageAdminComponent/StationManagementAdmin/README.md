# 📍 Station Management Module

Module quản lý trạm hoàn chỉnh với tích hợp API, Leaflet maps, và UI components tách biệt.

## 📂 Cấu trúc

```
StationManagementAdmin/
├── StationManagement.tsx      # Component chính (fetch + layout + logic)
├── StationTable.tsx           # Bảng danh sách trạm
├── StationFilters.tsx         # Search + filter + pagination controls
├── MapView.tsx                # Leaflet map (thuần Leaflet trong useEffect)
├── StationPopup.tsx           # Helper render popup content
├── AddStationModal.tsx        # Modal thêm trạm mới
├── stationApi.ts              # Axios service (GET, POST, PUT, DELETE)
├── types.d.ts                 # TypeScript interfaces
├── index.ts                   # Exports
└── README.md                  # This file
```

## 🎯 Tính năng

### 1. ✅ API Integration (stationApi.ts)
- **GET** `/api/stations?page={page}&limit={limit}` - Lấy danh sách
- **POST** `/api/stations` - Tạo trạm mới
- **PUT** `/api/stations/{id}` - Cập nhật trạm
- **DELETE** `/api/stations/{id}` - Xóa trạm
- Base URL: `https://be-ev-rental-system-production.up.railway.app/api`
- Timeout: 30s
- Support Authorization header (token from localStorage)

### 2. ✅ StationManagement.tsx (Main Component)
- Fetch data on mount và khi filters change
- State management: stations, filters, pagination, loading, error
- **2 chế độ view**: Table (default) và Map (toggle)
- Auto control sidebar:
  - Map visible → sidebar collapse
  - Map hidden → sidebar expand
- Statistics cards (ẩn khi map visible):
  - Tổng số trạm
  - Đang hoạt động
  - Ngừng hoạt động
  - Tỷ lệ hoạt động (%)

### 3. ✅ StationFilters.tsx
- **Search**: Tìm theo tên, mã, địa chỉ (client-side)
- **Status filter**: All / Active / Inactive
- **Limit selector**: 10, 20, 50, 100 per page
- Display total results count
- Auto reset page to 1 when filters change

### 4. ✅ StationTable.tsx
- 7 cột: Code, Name, Address, Note, Status, CreatedAt, Actions
- Status badge:
  - 🟢 Xanh: `isActive = true` → "Đang hoạt động"
  - 🔴 Đỏ: `isActive = false` → "Ngừng hoạt động"
- Actions: Edit (icon), Delete (icon with confirm)
- Hover highlight rows
- Loading spinner
- Empty state với icon

### 5. ✅ MapView.tsx (Leaflet Integration)
- **Thuần Leaflet** trong `useEffect` (không dùng react-leaflet)
- Fix default icon với CDN URLs
- Default center: Vietnam (lat ~16.0, lng ~108.2, zoom 6)
- Auto-fit bounds theo tất cả markers
- **Marker colors**:
  - 🟢 Xanh: `isActive = true` (bình thường)
  - 🟡 Vàng: `maintenanceRatio > 0.5` (bảo trì nhiều)
  - 🔴 Đỏ: `!isActive` OR `availableRatio < 0.2` (thiếu xe / ngừng)
- Click marker → open popup (StationPopup content)
- Hover marker → open popup
- **Legend** hiển thị trên header
- Responsive: resize khi sidebar change (350ms delay)
- Drag, zoom wheel, controls enabled

### 6. ✅ StationPopup.tsx
- Export `createPopupContent(station)` → HTML string for Leaflet
- Hiển thị:
  - Tên, mã, địa chỉ, ghi chú
  - Trạng thái (badge màu)
  - Số xe (available, maintenance, total) - nếu có data
  - Tọa độ (lat, lng)
  - Ngày tạo (formatted)
- Styled with inline CSS (for Leaflet popup)

### 7. ✅ AddStationModal.tsx
- Modal overlay centered, rounded-2xl, shadow-2xl
- Form fields:
  - Name* (required)
  - Code* (required, mono font)
  - Address* (required)
  - Latitude* (required, number)
  - Longitude* (required, number)
  - Note (optional, textarea)
  - IsActive (toggle switch)
- Validation: required fields, numeric lat/lng
- Submit → `createStation()` API call
- Success: close modal, reload list, show success (parent callback)
- Error: show inline error message
- Loading state với spinner
- Keyboard accessible (Escape to close)
- Disabled interactions while loading

### 8. ✅ Pagination
- Controls: "Trước" / "Sau" buttons
- Display: "Trang X / Y"
- Only show if totalPages > 1
- Disabled when at first/last page

## 🚀 Sử dụng

### Import
```typescript
import StationManagement from './StationManagementAdmin';
// hoặc
import { StationManagement } from './StationManagementAdmin';
```

### Trong Router
```typescript
<Route path="/admin/locations" element={<StationManagement />} />
```

### Dependencies
- ✅ axios (API calls)
- ✅ leaflet + @types/leaflet (maps)
- ✅ framer-motion (animations)
- ✅ react-icons (icons)
- ✅ tailwindcss (styling)

## 📊 API Response Format

### GET /api/stations
```typescript
{
  data: {
    items: Station[];
    total: number;
    page: number;
    limit: number;
    totalPages?: number;
  };
  message: string;
  status: number;
}
```

### Station Interface
```typescript
interface Station {
  id: string;
  name: string;
  code: string;
  location: {
    address: string;
    latitude: number;
    longitude: number;
  };
  note?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  // Optional for display
  vehicleCount?: number;
  availableCount?: number;
  maintenanceCount?: number;
}
```

## 🎨 Styling

- **Tailwind CSS**: Responsive, modern UI
- **Colors**:
  - Blue: Primary (buttons, links)
  - Green: Active status
  - Red: Inactive / delete
  - Yellow: Warning / maintenance
  - Gray: Text, borders
- **Animations**: Framer Motion
  - Page transitions
  - Card stagger
  - Modal fade/scale
  - Table row slide
- **Responsive**:
  - Mobile: Stack filters, single column stats
  - Tablet: 2-column stats
  - Desktop: 4-column stats, full table

## 🧪 Testing Checklist

- [ ] GET stations API call success
- [ ] Loading spinner displays
- [ ] Error message + retry button
- [ ] Empty state displays
- [ ] Search filters stations
- [ ] Status filter works
- [ ] Limit selector updates list
- [ ] Pagination controls work
- [ ] Table displays all columns
- [ ] Status badges show correct color
- [ ] Map toggle button works
- [ ] Sidebar collapses when map visible
- [ ] Stats cards hide when map visible
- [ ] Map displays all markers
- [ ] Marker colors correct
- [ ] Click marker opens popup
- [ ] Popup shows all info
- [ ] Map resizes with sidebar
- [ ] Add modal opens
- [ ] Add modal validation works
- [ ] Create station API success
- [ ] List reloads after create
- [ ] Edit button logs (TODO)
- [ ] Delete confirms and removes
- [ ] Keyboard accessible (Tab, Escape)

## 🐛 Troubleshooting

### Leaflet markers không hiển thị
- Check console có lỗi icon loading không
- Ensure CDN URLs accessible
- Check lat/lng valid (not 0)

### Map không resize khi sidebar change
- Check `useSidebar()` context available
- Check 350ms timeout in useEffect
- Try `map.invalidateSize()` manually

### API calls fail
- Check network tab
- Verify backend running
- Check CORS settings
- Verify token in localStorage (if auth required)

### Search không hoạt động
- Check `applyFilters()` logic
- Verify `filters.search` state updates
- Console log filtered results

## 📝 TODO / Future Enhancements

- [ ] Edit station modal (update API)
- [ ] Bulk actions (delete multiple)
- [ ] Export data (CSV, Excel)
- [ ] Import stations from file
- [ ] Advanced filters (date range, location radius)
- [ ] Map clustering (when many markers)
- [ ] Real-time vehicle count from API
- [ ] Station details page
- [ ] Assign vehicles to station
- [ ] Station activity history

---

**Version**: 2.0.0  
**Created**: 2025-10-07  
**Tech Stack**: React + TypeScript + Vite + Tailwind + Axios + Leaflet
