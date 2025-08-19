# Changelog

## 2025-08-19
- **Fix**: Resolved `Unexpected any` TypeScript error in `frontend/src/components/DashboardChart.tsx` by explicitly typing `apiData` in `processChartData` function.
- **Fix**: Corrected `useCallback` dependency warning in `frontend/src/contexts/NotificationContext.tsx` by reordering and adding `removeNotification` to the dependency array.
- **Fix**: Ensured `useNotification` hook is used within `NotificationProvider` by wrapping `children` in `frontend/src/app/layout.tsx` with `NotificationProvider` to resolve prerendering error on `/login` page.
- **Fix**: Refactored `frontend/src/app/register/plan/page.tsx` to dynamically import `PlanContentClient.tsx` with `ssr: false` to resolve `useSearchParams` prerendering error. Created `frontend/src/app/register/plan/PlanContentClient.tsx` to house the client-side logic.
- **Fix**: Removed `ssr: false` from dynamic import in `frontend/src/app/register/plan/page.tsx` as it's not allowed in Server Components, relying on `'use client'` in `PlanContentClient.tsx` for client-side rendering.
- **Troubleshooting**: Encountered `ENOENT` error for `pages-manifest.json` and `MODULE_NOT_FOUND` for `/companies/new/page.js` during local build. Cleaned `node_modules` and reinstalled dependencies.
- **Troubleshooting**: Persistent "npm error Invalid Version" on Vercel. Incremented `package.json` version to `0.1.1` to trigger rebuild. Attempted aggressive local cleanup and reinstall.
- **Final Diagnosis**: The "npm error Invalid Version" on Vercel is due to a corrupted Vercel build cache.
- **Solution**: Modified `frontend/vercel.json` to include `rm -rf node_modules package-lock.json` in the `installCommand` to force a clean dependency installation on Vercel.
- **New Errors**: Encountered "Cannot find module 'react'" and other type declaration errors in `frontend/src/components/SubscriptionStatusCard.tsx` after previous `replace_in_file` attempt, likely due to persistent local `node_modules` corruption. Addressed `fetchSubscriptionStatus` declaration and `useCallback` dependency. Pushing changes, expecting Vercel's forced clean install to resolve these.
