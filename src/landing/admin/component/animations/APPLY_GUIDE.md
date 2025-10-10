# 🚀 Hướng dẫn áp dụng Animations vào trang Admin

## Bước 1: Import components

```tsx
import { PageTransition, FadeIn, StaggerContainer, StaggerItem, ScaleIn } from "../component/animations";
```

## Bước 2: Wrap toàn bộ trang với PageTransition

```tsx
const YourAdminPage = () => {
  return (
    <PageTransition>  {/* ← Thêm đây */}
      <div className="space-y-6">
        {/* ... nội dung */}
      </div>
    </PageTransition>  {/* ← và đây */}
  );
};
```

## Bước 3: Thêm FadeIn cho Header

```tsx
<FadeIn delay={0.1}>
  <div className="flex items-center justify-between">
    <h1>Title</h1>
    <button>Action</button>
  </div>
</FadeIn>
```

## Bước 4: Thêm hover effects cho cards/buttons

### Cards:
```tsx
className="... hover:shadow-md transition-all duration-300 hover:-translate-y-1"
```

### Buttons:
```tsx
className="... hover:scale-105 transition-all duration-300 hover:shadow-lg"
```

### Icons trong cards:
```tsx
className="... transition-transform duration-300 hover:scale-110"
```

## Bước 5: Wrap Stats Grid với StaggerContainer

```tsx
<StaggerContainer staggerDelay={0.1} initialDelay={0.2}>
  <div className="grid grid-cols-4 gap-6">
    {stats.map((stat, index) => (
      <StaggerItem key={index}>
        <ScaleIn delay={0.3 + index * 0.1}>
          <StatCard {...stat} />
        </ScaleIn>
      </StaggerItem>
    ))}
  </div>
</StaggerContainer>
```

## Bước 6: Thêm FadeIn cho sections

```tsx
<FadeIn delay={0.6} direction="up">
  <div className="bg-white rounded-lg ...">
    {/* Section content */}
  </div>
</FadeIn>
```

## Bước 7: Table rows với hover

```tsx
<tr className="hover:bg-gray-50 transition-colors duration-200">
  {/* ... */}
</tr>
```

## ⏱️ Timeline gợi ý:

- Header: 0.1s
- Stats: 0.2-0.6s (stagger)
- Main content: 0.6s
- Secondary content: 0.8s

## ✅ Checklist

- [ ] Import animation components
- [ ] Wrap với PageTransition
- [ ] FadeIn cho header
- [ ] StaggerContainer cho lists/grids
- [ ] Hover effects cho interactive elements
- [ ] transition-colors/transform/shadow cho smooth effects
- [ ] Test animation timing (không quá nhanh, không quá chậm)

## 🎨 Class Tailwind thường dùng:

```
hover:shadow-md
hover:-translate-y-1
hover:scale-105
hover:scale-110
hover:bg-gray-50
transition-all
transition-colors
transition-transform
transition-shadow
duration-200
duration-300
```

