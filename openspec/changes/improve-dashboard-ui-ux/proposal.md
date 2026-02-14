## Why

The dashboard UI audit identified **32 issues** ranging from inconsistent badge colors to missing accessibility features. While the foundation is solid (B+ grade), these inconsistencies create a fragmented user experience, hinder accessibility, and make the codebase harder to maintain. Addressing these issues will improve user satisfaction, ensure WCAG compliance, and establish design system discipline.

## What Changes

- **Fix badge color system**: Use semantic variants instead of hard-coded Tailwind classes
- **Add table scroll indicators**: Visual fade gradients for horizontal overflow
- **Improve empty states**: Better visual hierarchy with icon prominence
- **Standardize form validation errors**: Add icons, animation, and better visibility
- **Add mobile navigation**: Hamburger menu for dashboard on mobile devices
- **Enhance metric cards**: Add trend indicators (up/down) with color coding
- **Improve search UX**: Add clear button and loading indicators
- **Add focus management**: Trap focus in modals for keyboard navigation
- **Enhance accessibility**: Skip links, aria labels, reduced motion support
- **Standardize design tokens**: Use tokens for spacing, radius, shadows consistently

## Capabilities

### New Capabilities

- `badge-variants`: Semantic badge color system (success, warning, error, info)
- `table-scroll-indicators`: Visual overflow indicators for data tables
- `mobile-navigation`: Responsive drawer menu for dashboard navigation
- `search-input-enhanced`: Search with clear button and loading states
- `metric-card-trends`: Metric cards with trend indicators and animations
- `form-validation-ux`: Enhanced form error display with icons
- `accessibility-enhancements`: Skip links, aria attributes, focus management

### Modified Capabilities

- `empty-state`: Enhanced visual hierarchy and icon treatment
- `loading-state`: Standardized skeleton/spinner patterns
- `button-component`: Add loading state prop
- `page-card`: Respect prefers-reduced-motion

## Impact

**Components to modify:**

- `src/components/ui/badge.tsx` - Add semantic variants
- `src/components/ui/table.tsx` - Add scroll indicators
- `src/components/shared/empty-state.tsx` - Enhance visual hierarchy
- `src/components/shared/layout/dashboard-navbar.tsx` - Add mobile menu
- `src/components/shared/common/metric-card.tsx` - Add trends
- `src/components/forms/form-field.tsx` - Improve validation display
- `src/components/shared/page-card.tsx` - Reduced motion support
- `src/app/dashboard/**` - Apply consistent patterns

**New components:**

- `src/components/shared/mobile-nav.tsx` - Mobile navigation drawer
- `src/components/shared/table-scroll-container.tsx` - Scroll indicator wrapper

**Design tokens:**

- Map spacing, radius, shadow tokens to CSS variables
- Update Tailwind config to use design tokens

**Dependencies:** No new dependencies required

**Accessibility impact:** Significant improvement for screen reader and keyboard users
