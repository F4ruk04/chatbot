# Changelog

## 2025-08-19
- **Fix**: Resolved `Unexpected any` TypeScript error in `frontend/src/components/DashboardChart.tsx` by explicitly typing `apiData` in `processChartData` function.
- **Fix**: Corrected `useCallback` dependency warning in `frontend/src/contexts/NotificationContext.tsx` by reordering and adding `removeNotification` to the dependency array.
- **Fix**: Ensured `useNotification` hook is used within `NotificationProvider` by wrapping `children` in `frontend/src/app/layout.tsx` with `NotificationProvider` to resolve prerendering error on `/login` page.
- **Fix**: Refactored `frontend/src/app/register/plan/page.tsx` to dynamically import `PlanContentClient.tsx` with `ssr: false` to resolve `useSearchParams` prerendering error. Created `frontend/src/app/register/plan/PlanContentClient.tsx` to house the client-side logic.
- **Fix**: Removed `ssr: false` from dynamic import in `frontend/src/app/register/plan/page.tsx` as it's not allowed in Server Components, relying on `'use client'` in `PlanContentClient.tsx` for client-side rendering.
- **Troubleshooting**: Encountered `ENOENT` error for `pages-manifest.json` and `MODULE_NOT_FOUND` for `/companies/new/page.js` during build. Attempted to clean `node_modules` and reinstall dependencies.
- **Troubleshooting**: Encountered "npm error Invalid Version" during `npm install` and `swc-win32-x64-msvc` error during build. Next step: more aggressive cleanup of `node_modules` and `package-lock.json`, then reinstall with explicit npm registry.
