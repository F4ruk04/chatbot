# Changelog

## 2025-08-20
- **Fix**: Prevented repeated error notifications in `frontend/src/components/SubscriptionStatusCard.tsx` by introducing a `hasShownError` state to ensure notifications are displayed only once per API call attempt.
- **Diagnosis**: Investigating persistent issue where subscription status defaults are shown despite backend configuration. Suspect backend internal server error or unapplied migrations leading to default data fallback in `/subscription/status` endpoint.
- **Fix**: Resolved "GET /api/subscription/status 429" rate-limiting error by breaking a dependency cycle in `frontend/src/components/SubscriptionStatusCard.tsx`. Removed `hasShownError` from `fetchSubscriptionStatus`'s `useCallback` dependencies to prevent infinite API calls.
