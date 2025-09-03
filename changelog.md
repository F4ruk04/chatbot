# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed
- **FIXED**: Resolved import error by restructuring the config module. Moved all settings into the `config` package's `__init__.py` and removed the conflicting `config.py` file.
- Corrected `GZipMiddleware` and `TrustedHostMiddleware` imports in `backend/main.py` to use `starlette.middleware.gzip` and `starlette.middleware.trustedhost` respectively.
- Added `starlette==0.27.0` to `backend/requirements.txt` to ensure compatibility with FastAPI middlewares.
- Standardized plan name "Enterprise" to "Business" in `backend/app/models/subscription.py` and `backend/app/models/user.py` comments for consistency across the application.
- Updated `backend/app/routers/subscriptions.py` to dynamically fetch `messages_quota` for new basic subscriptions from `settings.plan_message_limits`.
- Modified `backend/app/routers/subscriptions.py`'s `get_plan_limits` endpoint to return both `plan_company_limits` and `plan_message_limits`.
- Corrected plan name "Enterprise" to "Business" in `frontend/src/components/SubscriptionStatusCard.tsx`'s `planDetails` object.
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
- **CRITICAL FIX**: Corrected `MessageLimitsMiddleware` to inherit from `BaseHTTPMiddleware` and implement proper `dispatch()` method instead of `__call__()` to resolve deployment error: `TypeError: MessageLimitsMiddleware.__init__() got an unexpected keyword argument 'app'`
- **FIXED**: Corrected import error in `backend/app/config.py` - moved all plan configurations directly into `config.py` to eliminate `ModuleNotFoundError` during deployment
- **FIXED**: Removed `backend/app/config/plans.py` file to avoid import conflicts and consolidate everything in a single file
- **FIXED**: Updated imports in `dashboard.py` and `plan_checker.py` to use `app.config` instead of `app.config.plans`
- **FIXED**: Updated middleware functions to use consolidated `get_plan_limits` function from config module
- **FIXED**: Removed `backend/app/config/__init__.py` to resolve circular import issue that was preventing application startup
- **FIXED**: Updated relative import paths in `stripe_service.py`, `subscriptions.py`, `payments.py`, and `performance.py` to use absolute imports after removing `__init__.py` file
- **FIXED**: Changed import in `stripe_service.py` back to relative import `from ..config.stripe_config import stripe_config` to resolve deployment error

### Added
- Created `AuthMiddleware` for JWT authentication and user state management in `backend/app/middleware/auth_middleware.py`.
- Created `PlanCheckerMiddleware` for plan-based access control to API routes in `backend/app/middleware/plan_checker.py`.
- Created `DashboardBasic.tsx` component for basic plan dashboard.
- Created `DashboardProfessional.tsx` component for professional plan dashboard.
- Created `DashboardBusiness.tsx` component for business plan dashboard.
- **NEW**: Created centralized plan configuration system with `backend/app/config/plans.py` and updated `frontend/src/config/plans.ts`
- **NEW**: Created `usePlanConfig` custom hook for accessing plan information in React components
- **NEW**: Added comprehensive plan features tracking (detailed history, export capabilities, support levels, dashboard types)
- **SPRINT 1**: Created `MessageLimitsMiddleware` for real-time message validation and quota enforcement
- **SPRINT 1**: Created `NotificationService` for intelligent user notifications (80% limit warnings, limit exceeded alerts)
- **SPRINT 1**: Implemented comprehensive message usage tracking and automatic blocking system
- **SPRINT 1**: Added detailed documentation files: `ROADMAP_PROJETO.md`, `TWILIO_PRODUCAO_PLANO.md`, `EXPLICACAO_POOL_COMPARTILHADO.md`

### Changed
- Updated `backend/app/config.py` to include `plan_message_limits` and adjusted `plan_company_limits`.
- Modified `backend/app/routers/whatsapp.py` to enforce message limits per plan and log/notify users upon 80% usage or limit exceedance.
- Enhanced `backend/app/routers/dashboard.py` to return user plan, company/message limits, and message usage percentage.
- Applied `PlanCheckerMiddleware` to `/api/dashboard/messages-chart/{company_id}` endpoint to restrict access to Professional and Business plans.
- Integrated `AuthMiddleware` and other performance/security middlewares into `backend/main.py` in the correct order.
- Updated `frontend/src/lib/api.ts` to include `user_plan`, `company_limit`, `message_limit`, `message_usage_percentage` in `DashboardStats` interface and added `MessageStats` interface.
- Modified `frontend/src/app/dashboard/page.tsx` to dynamically render plan-specific dashboard components (`DashboardBasic`, `DashboardProfessional`, `DashboardBusiness`).
- Adjusted `frontend/src/components/dashboards/DashboardBasic.tsx` to correctly display message usage progress.
- Updated `frontend/src/components/PricingSection.tsx` to reflect correct plan names ("Básico", "Profissional", "Business") and their detailed features/descriptions as per task requirements.
- Updated `frontend/src/app/billing/BillingContent.tsx` to reflect correct plan names ("Básico", "Profissional", "Business") and their detailed features/descriptions, and to use plan names for selection and comparison.
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
- **NEW**: Refactored plan configuration to use centralized system - updated `frontend/src/config/plans.ts` with user's exact requirements
- **NEW**: Updated `backend/app/config.py` to use centralized plan configuration from `backend/app/config/plans.py`
- **NEW**: Updated `backend/app/middleware/plan_checker.py` to use centralized plan functions
- **NEW**: Updated `backend/app/routers/dashboard.py` to use centralized plan configuration
- **NEW**: Updated `frontend/src/components/Pricing.tsx` to use centralized `PLANS` configuration instead of local array
- **NEW**: Created utility functions for plan management (getPlanById, getPlanLimits, canAccessFeature)
- **NEW**: Complete Stripe payment integration implemented
- **NEW**: Created Stripe service with full API integration (`backend/app/services/stripe_service.py`)
- **NEW**: Implemented payment endpoints (`/api/payments/create-session`, `/api/payments/verify`, `/api/payments/webhook`)
- **NEW**: Created Stripe configuration module (`backend/app/config/stripe_config.py`)
- **NEW**: Updated frontend API client with Stripe payment functions (`frontend/src/lib/api.ts`)
- **NEW**: Created checkout component with Stripe integration (`frontend/src/components/Checkout.tsx`)
- **NEW**: Added success and cancel pages for Stripe checkout flow
- **NEW**: Updated environment configuration for Stripe credentials
- **NEW**: Added Stripe SDK to backend dependencies
- **NEW**: Implemented webhook processing for payment confirmations
- **NEW**: Added payment history and refund functionality

## [1.0.0] - 2025-08-26

## [1.0.0] - 2025-08-26

## [1.0.0] - 2025-08-26

### Added
- Initial release of the SaaS Chatbot Inteligente with WhatsApp integration
- User authentication and authorization system
- Company management functionality
- WhatsApp message handling via Twilio integration
- Subscription and payment processing system
- Dashboard with analytics and reporting
- Multi-plan pricing structure (Free, Pro, Business)
