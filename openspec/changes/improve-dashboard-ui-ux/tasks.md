## 1. Badge Variants (Semantic)

- [ ] 1.1 Update `/Users/farhanmansuri/Documents/codebase/farhan/multi-tenant-ecommerce/src/components/ui/badge.tsx` to add semantic variants: `success`, `warning`, `destructive`, `info`
- [ ] 1.2 Replace hard-coded status/badge color classes in dashboard features with semantic variants or theme tokens (e.g. `text-destructive`, `Badge variant="destructive"`)
- [ ] 1.3 Verify badge contrast in light/dark themes for each semantic variant

## 2. Dashboard Consistency Sweep

- [ ] 2.1 Remove remaining hard-coded semantic color classes in dashboard UI (`text-red-*`, `bg-red-*`, `border-red-*`, etc.) and replace with theme tokens/variants
- [ ] 2.2 Standardize destructive dropdown items to use `text-destructive` + proper focus styles across dashboard menus
- [ ] 2.3 Ensure all dashboard route `loading.tsx` skeleton pages use the store-first breadcrumb pattern (no `/dashboard` crumb)

## 3. Validation and Regression Checks

- [ ] 3.1 Run `npx tsc -p tsconfig.json --noEmit` and fix any type errors introduced by badge variant changes
- [ ] 3.2 Manually sanity-check Orders status badges and destructive actions (Cancel/Delete) in both light and dark theme for consistent behavior
