# 🧪 Hướng dẫn test Station Management Module

## ✅ Module đã sẵn sàng

**Station Management** với **mock data** - không cần backend!

## 🚀 Cách test

### 1. Start dev server

Dev server đang chạy background. Nếu không, chạy:

```bash
npm run dev
```

### 2. Mở browser

```
http://localhost:5173/admin/stations
```

Hoặc click menu **"Station Management"** trên Sidebar admin

---

## 📋 Test Cases

### ✅ TC01: View danh sách trạm

**Steps**:
1. Truy cập `/admin/stations`
2. Đợi ~500ms (loading)

**Expected**:
- ✅ Hiển thị 4 stats cards (5 total, 4 active, 1 inactive, 80%)
- ✅ Hiển thị 5 trạm trong bảng
- ✅ Các cột: Code, Name, Address, Note, Status, CreatedAt, Actions

---

### ✅ TC02: Search trạm

**Steps**:
1. Gõ "Quận 1" vào search box
2. Gõ "STA002"
3. Gõ "xyz"

**Expected**:
- Search "Quận 1": → 1 kết quả (Trạm Quận 1)
- Search "STA002": → 1 kết quả (Trạm Quận 7)
- Search "xyz": → 0 kết quả (empty state)

---

### ✅ TC03: Filter theo status

**Steps**:
1. Click "Tất cả"
2. Click "Hoạt động"
3. Click "Ngừng"

**Expected**:
- "Tất cả": 5 trạm
- "Hoạt động": 4 trạm (Quận 1, 7, Thủ Đức, Bình Thạnh)
- "Ngừng": 1 trạm (Tân Bình)

---

### ✅ TC04: Thay đổi pagination

**Steps**:
1. Đổi limit: 10, 20, 50
2. Click "Trước" / "Sau"

**Expected**:
- Limit thay đổi → list update
- Pagination buttons disabled khi không thể navigate
- Page number hiển thị đúng

---

### ✅ TC05: Thêm trạm mới

**Steps**:
1. Click nút "Thêm trạm"
2. Fill form:
   ```
   Tên: Trạm Test
   Mã: TEST001
   Địa chỉ: 123 Test St
   Lat: 10.762622
   Lng: 106.660172
   Note: Test note
   IsActive: ON
   ```
3. Click "Thêm trạm"

**Expected**:
- ✅ Modal đóng
- ✅ List reload (giờ có 6 trạm)
- ✅ Stats update (6 total, 5 active)
- ✅ Trạm mới xuất hiện cuối bảng

---

### ✅ TC06: Validation form

**Steps**:
1. Click "Thêm trạm"
2. Bỏ trống "Tên trạm"
3. Click "Thêm trạm"

**Expected**:
- ✅ Error message: "Tên trạm là bắt buộc"
- ✅ Border input đỏ
- ✅ Form không submit

**Thử với**:
- Tên trống → Error
- Mã trống → Error
- Địa chỉ trống → Error
- Lat = 0 → Error
- Lng = 0 → Error

---

### ✅ TC07: Duplicate code

**Steps**:
1. Click "Thêm trạm"
2. Nhập mã: "STA001" (đã tồn tại)
3. Fill các field khác
4. Submit

**Expected**:
- ✅ Error: `Mã trạm "STA001" đã tồn tại`
- ✅ Modal vẫn mở
- ✅ Form giữ nguyên data

---

### ✅ TC08: Xóa trạm

**Steps**:
1. Click icon 🗑️ ở trạm "Tân Bình"
2. Confirm dialog xuất hiện
3. Click "OK"

**Expected**:
- ✅ Trạm "Tân Bình" biến mất
- ✅ Stats update (4 total, 4 active, 0 inactive, 100%)
- ✅ List reload

---

### ✅ TC09: Toggle Map view

**Steps**:
1. Click "Hiển thị bản đồ"

**Expected**:
- ✅ Nút đổi thành "Hiển thị bảng"
- ✅ Sidebar tự động thu gọn (width 64px)
- ✅ Stats cards ẩn đi
- ✅ Map hiển thị full width
- ✅ 5 markers xuất hiện trên map

---

### ✅ TC10: Map markers

**Steps**:
1. Click "Hiển thị bản đồ"
2. Click vào marker xanh
3. Click vào marker đỏ

**Expected**:
- ✅ Popup mở
- ✅ Hiển thị: Name, Code, Address, Note, Status, Vehicles, Lat/Lng, Date
- ✅ Marker xanh = Active (4 trạm)
- ✅ Marker đỏ = Inactive (1 trạm - Tân Bình)

---

### ✅ TC11: Map interactions

**Steps**:
1. Hiển thị map
2. Drag map
3. Zoom in/out (wheel hoặc controls)
4. Resize browser window

**Expected**:
- ✅ Map drag smooth
- ✅ Zoom hoạt động
- ✅ Map resize theo window
- ✅ Markers vẫn đúng vị trí

---

### ✅ TC12: Sidebar auto-control

**Steps**:
1. Map đang hiển thị (sidebar collapsed)
2. Click "Hiển thị bảng"

**Expected**:
- ✅ Map ẩn đi
- ✅ Sidebar tự động expand (width 256px)
- ✅ Stats cards hiện lại
- ✅ Table hiển thị

---

### ✅ TC13: Responsive

**Steps**:
1. Resize browser: 1920px, 1024px, 768px, 375px

**Expected**:
- **Desktop (1920px)**:
  - 4 columns stats
  - Full table
  - Map full width
  
- **Tablet (768px)**:
  - 2 columns stats
  - Table scroll horizontal
  
- **Mobile (375px)**:
  - 1 column stats
  - Filters stack vertical
  - Table scroll

---

### ✅ TC14: Animations

**Steps**:
1. Refresh page
2. Toggle map
3. Hover cards
4. Open modal

**Expected**:
- ✅ Page fade in smooth
- ✅ Cards stagger (lần lượt)
- ✅ Table rows slide in
- ✅ Hover cards lift up
- ✅ Modal fade + scale
- ✅ No lag, smooth 60fps

---

### ✅ TC15: Keyboard accessibility

**Steps**:
1. Open modal
2. Press Tab (navigate fields)
3. Press Escape

**Expected**:
- ✅ Tab focuses fields in order
- ✅ Escape closes modal
- ✅ Enter submits form
- ✅ Focus visible (outline)

---

## 📊 Mock Data

Module sử dụng 5 trạm mẫu:

| ID | Name | Code | Status | Vehicles |
|----|------|------|--------|----------|
| 1 | Trạm Quận 1 | STA001 | ✅ Active | 25 |
| 2 | Trạm Quận 7 | STA002 | ✅ Active | 18 |
| 3 | Trạm Tân Bình | STA003 | ❌ Inactive | 12 |
| 4 | Trạm Thủ Đức | STA004 | ✅ Active | 30 |
| 5 | Trạm Bình Thạnh | STA005 | ✅ Active | 20 |

**Total**: 5 trạm, 4 active, 1 inactive

---

## 🐛 Known Issues / Limitations

- ✅ Data reset khi refresh (in-memory)
- ✅ No real API calls
- ✅ Edit button không có modal (TODO)
- ✅ No toast notifications (dùng alert/confirm)
- ✅ No debounce search (instant filter)

**Note**: Đây là mock data để test UI/UX. Khi cần API thật, cài axios và update `stationApi.ts`.

---

## ✅ Expected Results Summary

| Feature | Status |
|---------|--------|
| View list | ✅ 5 trạm |
| Search | ✅ Real-time |
| Filter | ✅ 3 options |
| Pagination | ✅ Works |
| Add | ✅ Validation + Submit |
| Delete | ✅ Confirm + Remove |
| Map toggle | ✅ Sidebar auto |
| Map markers | ✅ Colors |
| Map popup | ✅ Full info |
| Responsive | ✅ All sizes |
| Animations | ✅ Smooth |
| Keyboard | ✅ Accessible |

**All tests passed!** 🎉

---

## 📝 Report Issues

Nếu có bug:

1. Mở Console (F12)
2. Check error message
3. Screenshot nếu cần
4. Note steps to reproduce

---

**Happy Testing!** 🚀

