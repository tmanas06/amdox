# Amdox Jobs - Design System Reference Guide

## 🎨 Color System

### Primary Colors
```
Purple Gradient: #667eea → #764ba2
Used for: Buttons, headers, accents, active states
```

### Background Colors
```
Page Background: linear-gradient(135deg, #0a0e1a 0%, #1a1f2e 100%)
Card Background: rgba(30, 41, 59, 0.7)
Overlay Dark: rgba(0, 0, 0, 0.2) and rgba(0, 0, 0, 0.3)
```

### Text Colors
```
Primary Text: #f8fafc (bright white)
Secondary Text: #cbd5e1 (light gray)
Tertiary Text: #94a3b8 (muted gray)
Disabled Text: #64748b (darker gray)
```

### Status Colors
```
Success: #10b981 (Green)
Warning: #f59e0b (Amber)
Danger: #ef4444 (Red)
Info: #3b82f6 (Blue)
```

---

## 📐 Spacing System

```css
/* Base unit: 0.25rem = 4px */
0.25rem = 4px
0.375rem = 6px
0.5rem = 8px
0.75rem = 12px
1rem = 16px
1.25rem = 20px
1.5rem = 24px
2rem = 32px
```

---

## 🎯 Typography

```css
/* Headings */
h1: 3.5rem, 800 weight (Page titles)
h2: 1.75rem, 800 weight (Section titles)
h3: 1.25rem, 600 weight (Card titles)
h4: 1rem, 600 weight (Subsection titles)

/* Body Text */
Regular: 0.9375rem, 400 weight
Small: 0.875rem, 500 weight
Tiny: 0.8125rem, 500 weight
*/
```

---

## 🔘 Component Styles

### Buttons

#### Primary Button (Gradient)
```css
Background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
Color: white
Padding: 0.625rem 1.25rem
Border Radius: 0.375rem
Hover: transform translateY(-2px), box-shadow
```

#### Secondary Button (Outline)
```css
Background: rgba(255, 255, 255, 0.05)
Border: 1px solid rgba(255, 255, 255, 0.1)
Color: #cbd5e1
Padding: 0.5rem 1rem
Hover: background rgba(255, 255, 255, 0.1)
```

#### Tertiary Button (Accent)
```css
Background: rgba(102, 126, 234, 0.15)
Border: 1px solid rgba(102, 126, 234, 0.3)
Color: #667eea
Padding: 0.5rem 1rem
Hover: background rgba(102, 126, 234, 0.25)
```

### Cards

```css
Background: rgba(30, 41, 59, 0.7)
Backdrop: blur(10px)
Border: 1px solid rgba(255, 255, 255, 0.08)
Border Radius: 0.75rem
Padding: 1.5rem
Hover: transform translateY(-4px), shadow-lg
```

### Input Fields

```css
Background: rgba(255, 255, 255, 0.05)
Border: 1px solid rgba(255, 255, 255, 0.1)
Color: #f8fafc
Placeholder: #64748b
Focus Border: rgba(102, 126, 234, 0.5)
Focus Shadow: 0 0 0 3px rgba(102, 126, 234, 0.1)
```

### Badges & Tags

#### Accent Badge
```css
Background: rgba(102, 126, 234, 0.1)
Border: 1px solid rgba(102, 126, 234, 0.3)
Color: #667eea
Padding: 0.25rem 0.75rem
Border Radius: 9999px
```

#### Status Badge
```css
Background: Color-specific at 0.15 opacity
Border: 1px solid Color-specific at 0.3 opacity
Color: Full color (not muted)
Padding: 0.5rem 1rem
Text Transform: uppercase
Letter Spacing: 0.5px
```

---

## ✨ Visual Effects

### Glassmorphism
```css
Background: Semi-transparent color with opacity
Backdrop Filter: blur(10px) to blur(24px)
Border: 1px solid rgba(255, 255, 255, 0.08)
Creates: Frosted glass effect
```

### Transitions
```css
Standard: all 0.3s ease
Button Hover: transform translateY(-2px)
Shadow: 0 4px 12px rgba(102, 126, 234, 0.4)
```

### Shadows
```css
Shadow SM: 0 1px 2px rgba(0, 0, 0, 0.3)
Shadow MD: 0 4px 6px rgba(0, 0, 0, 0.25)
Shadow LG: 0 10px 15px rgba(0, 0, 0, 0.3)
```

---

## 📱 Responsive Breakpoints

```css
Desktop: Full layout
Tablet (max-width: 1024px): Adjusted columns, smaller padding
Mobile (max-width: 768px): 1-2 columns, stack vertically
Small Mobile (max-width: 480px): Full width, flex column
```

---

## 🎭 Component States

### Hover States
- **Buttons**: Elevation (translateY -2px), enhanced shadow
- **Cards**: Elevation (translateY -4px), border color change
- **Links**: Color change to primary gradient
- **Inputs**: Border color to primary, background lighter

### Focus States
- **Inputs**: Border to primary, box-shadow with accent
- **Buttons**: Visible focus ring (browser default)
- **Checkboxes**: Visible outline

### Disabled States
- **Buttons**: opacity 0.7, cursor not-allowed
- **Inputs**: opacity 0.5, cursor not-allowed
- **All**: No hover effects

### Active States
- **Tabs**: Border-bottom gradient color
- **Pagination**: Full gradient background
- **Navigation**: Color change + underline

---

## 🎓 Implementation Guidelines

### When Adding New Components
1. Use gradient text for section headings: `background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
2. Use dark card background: `rgba(30, 41, 59, 0.7)` with `backdrop-filter: blur(10px)`
3. Use accent color for interactive elements: `#667eea` as primary
4. Add hover elevation: `transform: translateY(-4px)` for cards
5. Use 0.3s ease transitions for smooth animations
6. Maintain consistent padding/margin system
7. Test on mobile (768px, 480px breakpoints)
8. Ensure WCAG AAA contrast (4.5:1 for normal text)

### Color Combinations (Safe Pairs)
```
Text on Card: #f8fafc on rgba(30, 41, 59, 0.7) ✅
Accent Button: #667eea on white/light ✅
Success Badge: #10b981 on rgba(16, 185, 129, 0.1) ✅
Danger Badge: #ef4444 on rgba(239, 68, 68, 0.1) ✅
Secondary Text: #94a3b8 on dark background ✅
```

### Performance Tips
1. Use `backdrop-filter: blur()` sparingly (GPU intensive)
2. Prefer `box-shadow` over multiple backgrounds
3. Use CSS variables for color system (already done)
4. Batch animations (no staggered transitions)
5. Optimize gradient usage (limit to key elements)

---

## 📋 Checklist for New Features

- [ ] Color scheme matches primary gradient
- [ ] Dark card background with glassmorphism
- [ ] Proper text color hierarchy (light → muted → secondary)
- [ ] Smooth 0.3s transitions on interactive elements
- [ ] Hover/focus states for all interactive elements
- [ ] Responsive design tested (desktop, tablet, mobile)
- [ ] WCAG contrast standards met
- [ ] Consistent spacing using baseline system
- [ ] No inline styles (use CSS classes)
- [ ] Icons/emojis for visual enhancement
- [ ] Loading/error/success states
- [ ] Empty state message and styling

---

**Last Updated**: January 15, 2025  
**Standardization Status**: ✅ Complete  
**All Pages**: Unified Dark Glassmorphism Theme
