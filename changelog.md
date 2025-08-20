# Changelog

## 2025-08-20
- **Fix**: Prevented repeated error notifications in `frontend/src/components/SubscriptionStatusCard.tsx` by introducing a `hasShownError` state to ensure notifications are displayed only once per API call attempt.
- **Diagnosis**: Investigating persistent issue where subscription status defaults are shown despite backend configuration. Suspect backend internal server error or unapplied migrations leading to default data fallback in `/subscription/status` endpoint.
- **Fix**: Resolved "GET /api/subscription/status 429" rate-limiting error by breaking a dependency cycle in `frontend/src/components/SubscriptionStatusCard.tsx`. Removed `hasShownError` from `fetchSubscriptionStatus`'s `useCallback` dependencies to prevent infinite API calls.
- **Diagnosis**: New error "GET /api/subscription/status 404" observed. This indicates the backend endpoint is not found or the backend application is not running/accessible. Verified `backend/main.py` and confirmed `subscriptions` router is correctly included. The issue is likely related to the backend deployment on Railway (e.g., application not running, startup crash, or accessibility issues). Confirmed 404 is returned by the backend itself.
- **Fix**: Resolved potential routing conflict in `backend/main.py` by removing duplicate inclusions of routers without prefixes. This ensures that the `/api/subscription` endpoint is correctly registered.
- **Fix**: Resolved "Cannot find module 'react'" and other TypeScript errors in `frontend/src/app/register/plan/PlanContentClient.tsx` and `frontend/src/components/DashboardChart.tsx` by ensuring all necessary imports are present and code is correctly structured. Removed unused `Layout` import and `Plan` interface from `PlanContentClient.tsx`. Removed unused `maxValue` state and fixed `useEffect` dependency for `fetchChartData` in `DashboardChart.tsx`.
- **Fix**: Addressed "erro ao carregar dados do dashboard" by adding a new endpoint `/api/dashboard/messages-chart` in `backend/app/routers/dashboard.py` to handle requests for aggregated message data across all companies, matching the frontend's expected API call when no specific `companyId` is provided.

## Project Summary (Prior to 2025-08-20)

### Primary Request and Intent
The initial task was to resolve "Failed to compile" errors in the frontend. This evolved into troubleshooting and resolving runtime errors on the deployed site, specifically "cannot show subscription status" and "gives error when creating account." The user also requested a comprehensive project summary to be added to the `changelog.md` file.

### Key Technical Concepts
*   **Frontend**: Next.js (Server Components, Client Components, `useRouter`, dynamic imports), React (`useEffect`, `useState`, `useCallback`, Context API - `NotificationContext`), TypeScript (type errors, `any` types), Tailwind CSS, Vercel deployment (`vercel.json`, build cache).
*   **Backend**: FastAPI (API routes, dependencies, HTTPException), Python, SQLAlchemy (ORM), PostgreSQL (database), Alembic (database migrations), JWT (authentication), Twilio (WhatsApp integration), Google Gemini (AI), Railway deployment (`start.sh`, environment variables, database provisioning).
*   **General**: API communication, CORS, authentication flow, error handling, dependency management, Git version control.

### Files and Code Sections
*   `frontend/src/components/DashboardChart.tsx`:
    *   **Summary**: Component for displaying dashboard charts.
    *   **Changes**: Resolved `Unexpected any` TypeScript error by explicitly typing `apiData` in `processChartData` function.
*   `frontend/src/contexts/NotificationContext.tsx`:
    *   **Summary**: Provides a context for displaying notifications.
    *   **Changes**: Corrected `useCallback` dependency warning by reordering and adding `removeNotification` to the dependency array.
*   `frontend/src/app/layout.tsx`:
    *   **Summary**: Root layout file for the Next.js application.
    *   **Changes**: Wrapped children with `NotificationProvider` to resolve prerendering error on `/login` page.
*   `frontend/src/app/register/plan/page.tsx`:
    *   **Summary**: Page for user plan registration.
    *   **Changes**: Refactored to dynamically import `PlanContentClient.tsx` with `ssr: false` (later removed `ssr: false` as it's not allowed in Server Components, relying on `'use client'` in `PlanContentClient.tsx`).
*   `frontend/src/app/register/plan/PlanContentClient.tsx`:
    *   **Summary**: New file created to house client-side logic for the plan registration page.
    *   **Changes**: Created this file to separate client-side logic.
*   `frontend/vercel.json`:
    *   **Summary**: Vercel deployment configuration for the frontend.
    *   **Changes**: Modified `installCommand` to `rm -rf node_modules package-lock.json && npm install` to force a clean dependency installation on Vercel, addressing the "npm error Invalid Version".
*   `backend/main.py`:
    *   **Summary**: Main FastAPI application entry point.
    *   **Review**: Reviewed to understand router inclusion and CORS configuration.
*   `backend/app/routers/subscriptions.py`:
    *   **Summary**: Handles subscription-related API endpoints.
    *   **Review**: Reviewed the logic for fetching and returning subscription status, including fallback to default data and automatic free plan creation.
*   `backend/app/routers/auth.py`:
    *   **Summary**: Handles user registration and login.
    *   **Review**: Reviewed the `/auth/register` endpoint logic, including user creation and initial free subscription assignment.
*   `backend/alembic/versions/`:
    *   **Summary**: Directory containing database migration scripts.
    *   **Review**: Listed files to confirm migration history.
*   `RAILWAY_DEPLOY_READY.md`:
    *   **Summary**: Deployment guide for Railway.
    *   **Review**: Confirmed that `start.sh` is the script responsible for running database migrations on Railway.
*   `frontend/src/components/SubscriptionStatusCard.tsx`:
    *   **Summary**: Displays the user's subscription status on the frontend.
    *   **Changes**:
        *   Added `useCallback` to React import.
        *   Wrapped `fetchSubscriptionStatus` in `useCallback` and added `showNotification` and `hasShownError` to its dependencies.
        *   Introduced a `hasShownError` state (`useState(false)`) and conditional logic to `showNotification` calls to prevent repeated display of error notifications when API calls fail.
*   `changelog.md`:
    *   **Summary**: Project change log.
    *   **Changes**: Continuously updated to document all fixes, troubleshooting, diagnoses, solutions, and a comprehensive project summary.

### Problem Solving
*   **Initial Compilation Errors**: Resolved various TypeScript and Next.js related compilation errors by correcting types, `useCallback` dependencies, and dynamic import configurations.
*   **Vercel "npm error Invalid Version"**: Diagnosed as a corrupted Vercel build cache. Solved by modifying `frontend/vercel.json` to force a clean `npm install` during Vercel builds.
*   **Runtime Errors ("cannot show subscription status", "error creating account")**: Diagnosed as likely due to unapplied database migrations or general database connectivity issues on the Railway backend. The solution provided to the user was to manually verify PostgreSQL setup on Railway and trigger a backend redeploy to ensure `start.sh` runs and applies migrations.
*   **Repeated Error Notifications on Frontend**: Diagnosed as `SubscriptionStatusCard.tsx` repeatedly calling `showNotification` due to persistent API failures. The solution implemented was to add a `hasShownError` state to `SubscriptionStatusCard.SubscriptionStatusCard.tsx` to ensure error notifications are displayed only once per API call attempt, preventing UI flooding.

### Pending Tasks
*   User needs to manually verify PostgreSQL database setup on Railway and trigger a redeploy of the backend application to ensure migrations are applied. This is crucial for resolving the core backend API issues.
