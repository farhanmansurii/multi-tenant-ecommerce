# Dashboard UI Architecture Documentation

## Overview

This document describes the dashboard UI architecture, layout system, and component structure for the multi-tenant e-commerce platform. The system is built on Next.js App Router with nested layouts, ensuring consistent, reusable, and maintainable UI components.

## Table of Contents

1. [Layout System](#layout-system)
2. [Design Tokens](#design-tokens)
3. [Component Structure](#component-structure)
4. [Nested Layouts Implementation](#nested-layouts-implementation)
5. [Page Patterns](#page-patterns)
6. [Component Usage Guidelines](#component-usage-guidelines)
7. [Future Enhancements](#future-enhancements)

---

## Layout System

### Architecture Overview

The dashboard uses a **nested layout system** leveraging Next.js App Router's layout capabilities:

```
Root Layout (app/layout.tsx)
  └── Dashboard Layout (app/dashboard/layout.tsx)
      ├── Provides: SidebarProvider, Navbar, Footer
      ├── Default Sidebar: AppSidebar
      └── Store Layout (app/dashboard/stores/[slug]/layout.tsx)
          └── Overrides Sidebar: StoreSidebar
              └── Page Content (renders here)
```

### Key Benefits

- **Persistent Sidebars**: Sidebar persists across route changes (no re-renders)
- **Better Performance**: Only page content re-renders, not entire layout
- **Cleaner Code**: Pages focus on content, not structure
- **Backward Compatible**: `DashboardLayout` component auto-detects layout context

---

## Design Tokens

**Location**: `src/lib/design-tokens.ts`

### Spacing
```typescript
spacing: {
  xs: "0.5rem",
  sm: "0.75rem",
  md: "1rem",
  lg: "1.5rem",
  xl: "2rem",
  "2xl": "3rem",
  "3xl": "4rem",
}
```

### Container Padding
```typescript
containerPadding: {
  mobile: "1rem",
  tablet: "1.5rem",
  desktop: "2rem",
}
```

### Max Width
```typescript
maxWidth: {
  full: "100%",
  "7xl": "80rem",
  "6xl": "72rem",
  "5xl": "64rem",
  "4xl": "56rem",
  "3xl": "48rem",
  "2xl": "42rem",
}
```

### Border Radius
```typescript
borderRadius: {
  sm: "0.375rem",
  md: "0.5rem",
  lg: "0.75rem",
  xl: "1rem",
  "2xl": "1.5rem",
  full: "9999px",
}
```

### Shadows
```typescript
shadows: {
  xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  sm: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
  md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
}
```

### Transitions
```typescript
transitions: {
  fast: "150ms",
  base: "200ms",
  slow: "300ms",
}
```

---

## Component Structure

### Core Layout Components

#### 1. PageContainer
**Location**: `src/components/shared/layout/page-container.tsx`

Unified container for pages with consistent responsive padding and configurable max-width.

**Props**:
- `maxWidth`: `"full" | "7xl" | "6xl" | "5xl" | "4xl" | "3xl" | "2xl"` (default: `"full"`)
- `fullWidth`: `boolean` (default: `false`)
- `className`: `string`

**Usage**:
```tsx
<PageContainer maxWidth="6xl">
  {/* Page content */}
</PageContainer>
```

#### 2. PageHeader
**Location**: `src/components/shared/layout/page-header.tsx`

Standardized header component with title, description, breadcrumbs, icon/image, and actions.

**Props**:
- `title`: `string`
- `description`: `string`
- `image`: `string` (URL)
- `icon`: `ReactNode`
- `breadcrumbs`: `Breadcrumb[]`
- `headerActions`: `ReactNode`
- `bottomActions`: `ReactNode`
- `sticky`: `boolean` (default: `false`)
- `className`: `string`

**Usage**:
```tsx
<PageHeader
  title="Products"
  description="Manage your store products"
  icon={<Package />}
  breadcrumbs={[
    { label: 'Home', href: '/' },
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Products' },
  ]}
  headerActions={<Button>Add Product</Button>}
/>
```

#### 3. PageContent
**Location**: `src/components/shared/layout/page-content.tsx`

Main content wrapper for consistent spacing and optional animations.

**Props**:
- `children`: `ReactNode`
- `className`: `string`
- `animate`: `boolean` (default: `true`)
- `contentKey`: `string` (for animation key)

**Usage**:
```tsx
<PageContent contentKey={title}>
  {/* Page content */}
</PageContent>
```

#### 4. PageSection
**Location**: `src/components/shared/layout/page-section.tsx`

Reusable section component for grouping content.

**Props**:
- `title`: `string`
- `description`: `string`
- `headerActions`: `ReactNode`
- `collapsible`: `boolean` (default: `false`)
- `defaultOpen`: `boolean` (default: `true`)
- `children`: `ReactNode`

**Usage**:
```tsx
<PageSection
  title="Product Information"
  description="Basic product details"
>
  {/* Section content */}
</PageSection>
```

#### 5. PageCard
**Location**: `src/components/shared/layout/page-card.tsx`

Standardized card component replacing generic Card for consistent styling.

**Props**:
- `title`: `string`
- `description`: `string`
- `children`: `ReactNode`
- `footer`: `ReactNode`
- `headerActions`: `ReactNode`
- `variant`: `"default" | "outlined" | "elevated"` (default: `"default"`)
- `className`: `string`

**Usage**:
```tsx
<PageCard
  title="Store Settings"
  description="Configure your store"
  variant="outlined"
>
  {/* Card content */}
</PageCard>
```

### Specialized Layouts

#### 1. FormLayout
**Location**: `src/components/shared/layout/layouts/form-layout.tsx`

Specialized layout for form pages with sticky header, save/cancel buttons, and success messages.

**Props**:
- `title`: `string`
- `description`: `string`
- `icon`: `ReactNode`
- `breadcrumbs`: `Breadcrumb[]`
- `children`: `ReactNode`
- `onSubmit`: `(e: React.FormEvent) => void`
- `onCancel`: `() => void`
- `isSaving`: `boolean` (default: `false`)
- `isSuccess`: `boolean` (default: `false`)
- `cancelLabel`: `string` (default: `"Cancel"`)
- `submitLabel`: `string` (default: `"Save Changes"`)

**Usage**:
```tsx
<FormLayout
  title="Edit Store"
  description="Update your store settings"
  onSubmit={handleSubmit}
  onCancel={handleCancel}
  isSaving={isSaving}
  isSuccess={isSuccess}
>
  {/* Form content */}
</FormLayout>
```

#### 2. ListLayout
**Location**: `src/components/shared/layout/layouts/list-layout.tsx`

Specialized layout for list pages with search and filter bars.

**Props**:
- `title`: `string`
- `description`: `string`
- `icon`: `ReactNode`
- `breadcrumbs`: `Breadcrumb[]`
- `headerActions`: `ReactNode`
- `searchBar`: `ReactNode`
- `filterBar`: `ReactNode`
- `children`: `ReactNode`

**Usage**:
```tsx
<ListLayout
  title="Products"
  description="Manage your products"
  searchBar={<SearchInput />}
  filterBar={<FilterBar />}
>
  {/* List content */}
</ListLayout>
```

#### 3. DetailLayout
**Location**: `src/components/shared/layout/layouts/detail-layout.tsx`

Specialized layout for detail pages with metadata and sections.

**Props**:
- `title`: `string`
- `description`: `string`
- `icon`: `ReactNode`
- `breadcrumbs`: `Breadcrumb[]`
- `headerActions`: `ReactNode`
- `metadata`: `ReactNode`
- `sections`: `ReactNode[]`
- `children`: `ReactNode`

**Usage**:
```tsx
<DetailLayout
  title="Product Details"
  metadata={<ProductMetadata />}
  sections={[<ProductInfo />, <Pricing />]}
>
  {/* Additional content */}
</DetailLayout>
```

### Dashboard Layout Component

**Location**: `src/components/shared/layout/dashboard-container.tsx`

Smart wrapper component that detects if it's inside a Next.js layout.

**Behavior**:
- If inside layout: Renders only `PageHeader`/`PageContent` (no wrapper)
- If standalone: Renders full structure (`SidebarProvider`, `SidebarInset`, `Navbar`, `Footer`)

**Props**:
- `title`: `string`
- `desc`: `string`
- `image`: `string`
- `icon`: `ReactNode`
- `breadcrumbs`: `Breadcrumb[]`
- `headerActions`: `ReactNode`
- `bottomActions`: `ReactNode`
- `sidebar`: `ReactNode` (only used when standalone)
- `fullWidth`: `boolean` (default: `true`)
- `maxWidth`: `MaxWidth` (default: `"full"`)
- `children`: `ReactNode`
- `className`: `string`

**Usage**:
```tsx
// Inside nested layout (sidebar handled by layout)
<DashboardLayout
  title="Products"
  desc="Manage products"
  icon={<Package />}
>
  {/* Content */}
</DashboardLayout>
```

---

## Nested Layouts Implementation

### Dashboard Root Layout

**Location**: `app/dashboard/layout.tsx`

```tsx
export default function DashboardLayout({ children }) {
  return (
    <DashboardSidebarProvider>
      <DashboardLayoutContent>
        {children}
      </DashboardLayoutContent>
    </DashboardSidebarProvider>
  );
}
```

**Responsibilities**:
- Authentication check
- Provides `SidebarProvider` with `SidebarInset`
- Renders `DashboardNavbar` and `DashboardFooter`
- Defaults to `AppSidebar` if no sidebar set in context

### Store Layout

**Location**: `app/dashboard/stores/[slug]/layout.tsx`

```tsx
export default async function StoreLayout({ children, params }) {
  const { slug } = await params;
  return <StoreSidebarWrapper slug={slug}>{children}</StoreSidebarWrapper>;
}
```

**Responsibilities**:
- Sets `StoreSidebar` in context for all store pages
- Cleans up on unmount (resets to `AppSidebar`)

### Sidebar Context

**Location**: `src/components/shared/layout/dashboard-sidebar-context.tsx`

Manages sidebar state across nested layouts:

```tsx
// Provider
<DashboardSidebarProvider>
  {children}
</DashboardSidebarProvider>

// Hook to set sidebar
const setSidebar = useSetDashboardSidebar();
setSidebar(<StoreSidebar slug={slug} />);
```

---

## Page Patterns

### Standard Dashboard Page

```tsx
// app/dashboard/stores/[slug]/products/page.tsx
import DashboardLayout from '@/components/shared/layout/dashboard-container';

export default async function ProductsPage({ params }) {
  const { slug } = await params;

  return (
    <DashboardLayout
      title="Products"
      desc="Manage your store products"
      icon={<Package />}
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Stores', href: '/dashboard/stores' },
      { label: store?.name || slug, href: `/dashboard/stores/${slug}` },
        { label: 'Products' },
      ]}
    >
      <ProductManager storeSlug={slug} />
    </DashboardLayout>
  );
}
```

### Form Page

```tsx
// app/dashboard/stores/[slug]/settings/page.tsx
import DashboardLayout from '@/components/shared/layout/dashboard-container';

export default async function StoreSettingsPage({ params }) {
  const { slug } = await params;

  return (
    <DashboardLayout
      title="Settings"
      desc="Configure your store settings"
      icon={<Settings />}
      breadcrumbs={[...]}
    >
      <StoreSettings params={params} />
    </DashboardLayout>
  );
}
```

### Loading State

```tsx
// app/dashboard/stores/[slug]/products/loading.tsx
import DashboardLayout from '@/components/shared/layout/dashboard-container';
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <DashboardLayout
      title="Products"
      desc="Manage your store products"
      icon={<Package />}
    >
      <Skeleton className="h-96" />
    </DashboardLayout>
  );
}
```

---

## Component Usage Guidelines

### Icons

**Rule**: Always use default theme colors. **Never** add custom colors like `text-indigo-500`, `text-blue-600`, etc.

✅ **Correct**:
```tsx
icon={<Package />}
```

❌ **Incorrect**:
```tsx
icon={<Package className="text-indigo-500" />}
```

### Sidebars

**Rule**: Never pass `sidebar` prop to `DashboardLayout` when inside nested layouts. The layout handles it automatically.

✅ **Correct** (inside nested layout):
```tsx
<DashboardLayout title="Products" icon={<Package />}>
  {/* Content */}
</DashboardLayout>
```

❌ **Incorrect**:
```tsx
<DashboardLayout
  title="Products"
  sidebar={<StoreSidebar slug={slug} />}  // ❌ Unnecessary
>
  {/* Content */}
</DashboardLayout>
```

### Breadcrumbs

**Rule**: Always include full navigation path for better UX.

```tsx
breadcrumbs={[
  { label: 'Home', href: '/' },
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Stores', href: '/dashboard/stores' },
{ label: store?.name || slug, href: `/dashboard/stores/${slug}` },
  { label: 'Current Page' }, // No href = current page
]}
```

### Alerts

**Rule**: Always use shadcn `Alert` components, never custom divs.

✅ **Correct**:
```tsx
<Alert variant="destructive">
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>Something went wrong</AlertDescription>
</Alert>
```

❌ **Incorrect**:
```tsx
<div className="bg-red-50 border-red-200">
  {/* Custom alert */}
</div>
```

### Loaders

**Rule**: Use simplified `Loader` component, not complex animations.

```tsx
<Loader text="Loading..." variant="default" />
```

---

## Current State

### ✅ Implemented

- [x] Nested layout system with Next.js App Router
- [x] Design tokens for consistent spacing/sizing
- [x] Core layout components (PageContainer, PageHeader, PageContent, PageSection, PageCard)
- [x] Specialized layouts (FormLayout, ListLayout, DetailLayout)
- [x] Sidebar context system for dynamic sidebar switching
- [x] Simplified loader component
- [x] Uniform icon styling (no custom colors)
- [x] Proper shadcn Alert components
- [x] All store pages use nested layouts
- [x] Backward compatible DashboardLayout component

### 📋 Structure

```
src/
├── app/
│   └── dashboard/
│       ├── layout.tsx                    # Root dashboard layout
│       ├── stores/
│       │   └── [slug]/
│       │       ├── layout.tsx           # Store layout (sets StoreSidebar)
│       │       ├── page.tsx             # Store overview
│       │       ├── products/
│       │       ├── orders/
│       │       ├── categories/
│       │       ├── customers/
│       │       ├── discounts/
│       │       ├── inventory/
│       │       └── settings/
│       └── stores/
│           └── page.tsx                 # Stores list
│
└── components/
    └── shared/
        └── layout/
            ├── page-container.tsx
            ├── page-header.tsx
            ├── page-content.tsx
            ├── page-section.tsx
            ├── page-card.tsx
            ├── dashboard-container.tsx
            ├── dashboard-sidebar-context.tsx
            └── layouts/
                ├── form-layout.tsx
                ├── list-layout.tsx
                └── detail-layout.tsx
```

---

## Future Enhancements

### 1. Enhanced Form Layout
- [ ] Add form validation error summary at top
- [ ] Sticky form actions bar
- [ ] Auto-save functionality
- [ ] Form state persistence

### 2. Improved List Layout
- [ ] Built-in pagination component
- [ ] Advanced filtering UI
- [ ] Bulk actions toolbar
- [ ] Export functionality

### 3. Better Detail Layout
- [ ] Tabbed sections support
- [ ] Related items sidebar
- [ ] Activity timeline
- [ ] Quick actions menu

### 4. Design System Enhancements
- [ ] Dark mode improvements
- [ ] Animation system
- [ ] Responsive breakpoint utilities
- [ ] Typography scale

### 5. Performance Optimizations
- [ ] Code splitting for heavy components
- [ ] Virtual scrolling for long lists
- [ ] Image optimization
- [ ] Lazy loading patterns

### 6. Accessibility
- [ ] ARIA labels and roles
- [ ] Keyboard navigation
- [ ] Focus management
- [ ] Screen reader support

### 7. Developer Experience
- [ ] Storybook for components
- [ ] Component playground
- [ ] Design system documentation
- [ ] Usage examples

### 8. UI Polish
- [ ] Micro-interactions
- [ ] Loading skeletons for all pages
- [ ] Empty states with illustrations
- [ ] Error boundaries with recovery

---

## Best Practices

### 1. Component Composition
Always prefer composition over configuration. Use specialized layouts when appropriate.

### 2. Consistency
- Use design tokens for spacing/sizing
- Follow icon styling rules (no custom colors)
- Use PageCard instead of generic Card
- Use Alert components for notifications

### 3. Performance
- Leverage Next.js layouts for persistent components
- Use React.memo for expensive components
- Implement proper loading states
- Optimize images and assets

### 4. Accessibility
- Semantic HTML
- Proper ARIA attributes
- Keyboard navigation
- Focus management

### 5. Code Organization
- Keep layout components in `components/shared/layout`
- Page-specific components in `components/features/dashboard`
- Reusable UI in `components/ui`
- Business logic in `lib/domains`

---

## Migration Guide

### Migrating Old Pages to New Layout System

**Before**:
```tsx
<DashboardLayout
  title="Products"
  sidebar={<StoreSidebar slug={slug} />}
  breadcrumbs={[...]}
>
  {/* Content */}
</DashboardLayout>
```

**After**:
```tsx
// Remove sidebar prop - handled by layout
<DashboardLayout
  title="Products"
  breadcrumbs={[...]}
>
  {/* Content */}
</DashboardLayout>
```

### Using Specialized Layouts

**Form Pages**:
```tsx
import { FormLayout } from '@/components/shared/layout';

<FormLayout
  title="Edit Store"
  onSubmit={handleSubmit}
  onCancel={handleCancel}
  isSaving={isSaving}
>
  {/* Form fields */}
</FormLayout>
```

**List Pages**:
```tsx
import { ListLayout } from '@/components/shared/layout';

<ListLayout
  title="Products"
  searchBar={<SearchInput />}
  filterBar={<FilterBar />}
>
  {/* Product list */}
</ListLayout>
```

---

## Notes

- All icons should use default theme colors (no custom `text-*` classes)
- Sidebar is automatically handled by nested layouts
- Use `PageCard` instead of generic `Card` for consistency
- Always use shadcn `Alert` components for notifications
- Keep loaders simple and consistent
- Follow breadcrumb pattern for navigation clarity

---

**Last Updated**: January 2025
**Maintained By**: Development Team
