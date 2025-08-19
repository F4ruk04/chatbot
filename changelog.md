# Changelog

## 2025-08-19
- **Fix**: Resolved `Unexpected any` TypeScript error in `frontend/src/components/DashboardChart.tsx` by explicitly typing `apiData` in `processChartData` function.
- **Fix**: Corrected `useCallback` dependency warning in `frontend/src/contexts/NotificationContext.tsx` by reordering and adding `removeNotification` to the dependency array.
- **Fix**: Ensured `useNotification` hook is used within `NotificationProvider` by wrapping `children` in `frontend/src/app/layout.tsx` with `NotificationProvider` to resolve prerendering error on `/login` page.
