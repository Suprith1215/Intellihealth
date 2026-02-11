# Quick Implementation Guide

## Adding Theme Toggle to Layout

To complete the theme system integration, add a theme toggle button to the Layout component:

### Step 1: Update Layout.tsx

```tsx
import React from 'react';
import { Activity, BookOpen, BarChart2, Video, Settings, Menu, ShieldCheck, Terminal, MessageSquare, HeartPulse, FileText, User, Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

// ... existing code ...

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const { theme, toggleTheme } = useTheme(); // Add this line

  // ... existing navItems ...

  return (
    <div className="flex h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] overflow-hidden">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[var(--bg-secondary)] border-r border-[var(--border-light)] ...`}>
        <div className="flex items-center justify-between h-20 px-6 border-b border-[var(--border-light)]">
          <div className="flex items-center">
            <ShieldCheck className="w-8 h-8 text-[var(--medical-primary)] mr-3" />
            <h1 className="text-xl font-bold tracking-wide">IntelliHeal</h1>
          </div>
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-yellow-400" />
            ) : (
              <Moon className="w-5 h-5 text-indigo-600" />
            )}
          </button>
        </div>

        {/* ... rest of sidebar ... */}
      </aside>

      {/* ... rest of layout ... */}
    </div>
  );
};
```

### Step 2: Update Component Styles

Replace hardcoded colors with CSS variables:

**Before:**
```tsx
className="bg-[#1a1429] text-white"
```

**After:**
```tsx
className="bg-[var(--bg-secondary)] text-[var(--text-primary)]"
```

### Common Variable Replacements

| Old Value | New Variable |
|-----------|--------------|
| `#0f0a1e` | `var(--bg-primary)` |
| `#1a1429` | `var(--bg-secondary)` |
| `#251c3b` | `var(--bg-tertiary)` |
| `#ffffff` / `#f8fafc` | `var(--text-primary)` |
| `#cbd5e1` | `var(--text-secondary)` |
| `#94a3b8` | `var(--text-tertiary)` |
| `rgba(255,255,255,0.05)` | `var(--border-light)` |
| `rgba(255,255,255,0.1)` | `var(--border-medium)` |

### Step 3: Add Glassmorphism to Cards

```tsx
// Before
<div className="bg-[#1a1429] border border-white/5 p-6 rounded-2xl">

// After
<div className="glass-card p-6">
```

### Step 4: Add 3D Effects to Interactive Cards

```tsx
<div className="glass-card card-3d p-6">
  {/* Card content */}
</div>
```

### Step 5: Use Medical Colors

```tsx
// Status indicators
<div className="text-[var(--status-low)]">Low Risk</div>
<div className="text-[var(--status-moderate)]">Moderate Risk</div>
<div className="text-[var(--status-high)]">High Risk</div>
<div className="text-[var(--status-critical)]">Critical</div>

// Medical actions
<button className="bg-[var(--medical-primary)] text-white">
  Primary Action
</button>
```

### Step 6: Add Smooth Animations

```tsx
<div className="animate-slide-up">
  {/* Content slides up on mount */}
</div>

<div className="animate-fade-in">
  {/* Content fades in */}
</div>

<div className="card-3d-deep">
  {/* Card lifts on hover */}
</div>
```

## Testing the Theme System

1. **Check Theme Persistence**
   - Toggle theme
   - Refresh page
   - Theme should persist

2. **Verify All Components**
   - Navigate through all pages
   - Check readability in both modes
   - Ensure no hardcoded colors break

3. **Test Accessibility**
   - Check contrast ratios
   - Test keyboard navigation
   - Verify focus states

4. **Mobile Responsiveness**
   - Test on mobile viewport
   - Check touch targets
   - Verify readable text sizes

## Common Issues & Solutions

### Issue: Theme not applying
**Solution:** Ensure ThemeProvider wraps the entire app in App.tsx

### Issue: Colors not changing
**Solution:** Replace hardcoded colors with CSS variables

### Issue: Flash of unstyled content
**Solution:** Theme is loaded from localStorage on mount, this is expected

### Issue: Glassmorphism not visible
**Solution:** Ensure parent has a background or image

## Next Steps

1. Update remaining components with CSS variables
2. Add theme toggle to mobile header
3. Test all interactive states
4. Optimize for print
5. Add high contrast mode option
6. Implement reduced motion preference

## Quick Reference

### Theme Hook
```tsx
const { theme, toggleTheme } = useTheme();
```

### CSS Variables
```css
/* Backgrounds */
var(--bg-primary)
var(--bg-secondary)
var(--bg-tertiary)
var(--bg-elevated)

/* Text */
var(--text-primary)
var(--text-secondary)
var(--text-tertiary)

/* Borders */
var(--border-light)
var(--border-medium)
var(--border-heavy)

/* Medical */
var(--medical-primary)
var(--medical-secondary)
var(--medical-success)
var(--medical-warning)
var(--medical-danger)

/* Status */
var(--status-low)
var(--status-moderate)
var(--status-high)
var(--status-critical)
```

### Utility Classes
```css
.glass-card          /* Glassmorphism effect */
.glass-card-sm       /* Smaller glass card */
.card-3d             /* 3D hover effect */
.card-3d-deep        /* Enhanced 3D effect */
.gradient-medical    /* Medical gradient */
.animate-fade-in     /* Fade in animation */
.animate-slide-up    /* Slide up animation */
.text-gradient       /* Gradient text */
.shadow-glow         /* Glowing shadow */
```

---

**The theme system is now ready to use!** 🎨✨

Simply update components to use CSS variables and utility classes for a professional, medical-grade interface with full light/dark mode support.
