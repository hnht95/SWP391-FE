# Admin Animation Components 🎨

Các component animation mượt mà, chuyên nghiệp cho trang Admin - **smooth hơn cả trang Staff**.

## 📦 Components

### 1. PageTransition
Wrap toàn bộ nội dung trang để có hiệu ứng fade-in + slide-up mượt mà.

```tsx
import { PageTransition } from "../component/animations";

const YourPage = () => {
  return (
    <PageTransition>
      {/* Nội dung trang */}
    </PageTransition>
  );
};
```

### 2. FadeIn
Hiệu ứng fade-in cho từng element riêng lẻ.

```tsx
import { FadeIn } from "../component/animations";

<FadeIn delay={0.2} direction="up">
  <div>Content here</div>
</FadeIn>

// Props:
// - delay: số giây delay (mặc định 0)
// - duration: thời gian animation (mặc định 0.5s)
// - direction: "up" | "down" | "left" | "right" | "none"
```

### 3. StaggerContainer + StaggerItem
Animate danh sách theo thứ tự (stagger effect).

```tsx
import { StaggerContainer, StaggerItem } from "../component/animations";

<StaggerContainer staggerDelay={0.1} initialDelay={0.2}>
  {items.map((item, index) => (
    <StaggerItem key={index}>
      <div>{item}</div>
    </StaggerItem>
  ))}
</StaggerContainer>

// StaggerContainer props:
// - staggerDelay: khoảng cách giữa các item (mặc định 0.1s)
// - initialDelay: delay trước khi bắt đầu (mặc định 0)
```

### 4. ScaleIn
Hiệu ứng scale-in (phóng to) cho cards, stats, modals.

```tsx
import { ScaleIn } from "../component/animations";

<ScaleIn delay={0.3}>
  <div className="stat-card">...</div>
</ScaleIn>
```

## 🎯 Best Practices

### Thứ tự animation:
1. **PageTransition** (0s) - Wrap toàn bộ
2. **Header/Title** (0.1-0.2s) - FadeIn
3. **Stats/Cards** (0.3-0.6s) - ScaleIn hoặc StaggerContainer
4. **Secondary content** (0.6-0.8s) - FadeIn

### Timing smooth:
- Trang chính: 0 → 0.8s
- Lists: stagger 0.08-0.1s
- Hover effects: 200-300ms

## ✨ So sánh với Staff

| Feature | Staff | Admin |
|---------|-------|-------|
| Easing | Default | Custom cubic-bezier [0.25, 0.46, 0.45, 0.94] |
| Duration | 0.3-0.5s | 0.4-0.5s |
| Stagger | 0.1s | 0.08-0.1s (smoother) |
| Hover | Basic | Enhanced với scale + shadow |
| Spring | stiffness: 300 | stiffness: 260 (smoother) |

## 📝 Ví dụ đầy đủ

Xem `DashboardAdmin.tsx` để tham khảo implementation hoàn chỉnh.

