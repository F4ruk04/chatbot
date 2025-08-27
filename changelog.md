# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed
- Resolved `useSearchParams()` SSR issue in billing page by implementing proper Suspense boundary
- Created separate `BillingContent` component to handle client-side hooks
- Wrapped billing content in Suspense boundary to prevent prerendering errors during build
- Fixed API endpoint URLs to match backend routes (added `/api` prefix)
- Resolved login/registration issues caused by incorrect API endpoint URLs
- Fixed API base URL configuration to use Railway deployment URL instead of localhost
- Fixed subscription router endpoint paths to avoid double prefix issue
- Fixed companies and dashboard router endpoint paths to avoid double prefix issue
- Fixed health check endpoint to respond with correct format and without database dependency
- Ensured health check endpoint is publicly accessible by including its router before any global authentication middleware in `main.py`.

### Changed
- Refactored billing page to use new component structure with Suspense boundary
- Improved error handling for payment processing flow
- Enhanced type safety in API response handling
- Updated all frontend API calls to use correct backend endpoints with `/api` prefix
- Updated frontend environment configuration to use correct Railway API URL
- Corrected subscription router endpoint paths to match expected API structure
- Corrected companies and dashboard router endpoint paths to match expected API structure
- Simplified health check endpoint to respond with {"status": "ok"} without database dependency
- Updated `SubscriptionStatusCard.tsx` to display more detailed subscription information (messages used, quota, days remaining, warning level).
- Repositioned `SubscriptionStatusCard` to the left column of the dashboard and enhanced its UI/UX.
- Implemented dynamic company creation limits based on user's subscription plan in `backend/app/routers/companies.py` and `frontend/src/app/companies/new/page.tsx`.
- Added `plan_company_limits` configuration to `backend/app/config.py`.
- Exposed `/api/subscription/plan-limits` endpoint in `backend/app/routers/subscriptions.py` to provide plan limits to the frontend.
- Updated `frontend/src/lib/api.ts` to include `getPlanLimits` for `subscriptionsAPI`.
- Corrected redirection logic in `frontend/src/components/Pricing.tsx` so logged-in users are directed to `/billing` or `/dashboard` instead of `/register`.
- Standardized plan names to "Básico", "Profissional", and "Enterprise" across `backend/app/models/subscription.py`, `backend/app/routers/subscriptions.py`, `backend/app/routers/companies.py`, `backend/app/models/user.py`, and `frontend/src/app/billing/BillingContent.tsx`.
- Updated `SubscriptionStatusResponse` interface in `frontend/src/lib/api.ts` to match the expanded data from the backend.

## [1.0.0] - 2025-08-26

### Added
- Initial release of the SaaS Chatbot Inteligente with WhatsApp integration
- User authentication and authorization system
- Company management functionality
- WhatsApp message handling via Twilio integration
- Subscription and payment processing system
- Dashboard with analytics and reporting
- Multi-plan pricing structure (Free, Pro, Business)
