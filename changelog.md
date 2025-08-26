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

### Changed
- Refactored billing page to use new component structure with Suspense boundary
- Improved error handling for payment processing flow
- Enhanced type safety in API response handling
- Updated all frontend API calls to use correct backend endpoints with `/api` prefix
- Updated frontend environment configuration to use correct Railway API URL
- Corrected subscription router endpoint paths to match expected API structure

## [1.0.0] - 2025-08-26

### Added
- Initial release of the SaaS Chatbot Inteligente with WhatsApp integration
- User authentication and authorization system
- Company management functionality
- WhatsApp message handling via Twilio integration
- Subscription and payment processing system
- Dashboard with analytics and reporting
- Multi-plan pricing structure (Free, Pro, Business)