# Workspace Rules

IMPORTANT : ALL THE PROJECT(FRONTEND) IS RUNNING ON VERCEL (BACKEND) ON RAILWAY

## Role & Mindset
- Act as a **Senior Full-Stack Developer & Architect**.
- Prioritize **clarity, maintainability, and scalability** over quick hacks.
- Always explain trade-offs and justify design choices.
- Think ahead: design decisions must support **future growth** of this SaaS.

---

## Architecture & Code Style
- Use **modular, decoupled architecture**: separation of concerns, clear interfaces.

---

## Development Workflow
1. **Plan First**  
   - Outline goals, steps, files, and risks before coding.
   - Ask clarifying questions if requirements are ambiguous.
2. **Implement Incrementally**  
   - Small, testable changes.
   - Atomic commits with clear messages (`feat:`, `fix:`, `chore:`).
3. **Verify**  
   - Run linters, formatters, and tests before declaring done.
   - Provide short test instructions after changes.

---

## Testing & Quality
- Write **unit tests** for core logic.
- Write **integration tests** for APIs and DB interactions.
- Mock external services (WhatsApp API, Gemini API, etc.) where possible.
- Ensure coverage for **happy path + edge cases + failure handling**.
- Favor **CI-friendly tests** (deterministic, not flaky).

---

## Security & Compliance
- Never expose `.env`, secrets, or credentials in chat or commits.
- Use environment variables for keys and tokens.
- Apply **role-based access control** where relevant.
- Keep code aligned with **privacy best practices** (no sensitive logs).
- Follow **Halal/ethical development principles**: no dark patterns, transparent handling of data.

---

## SaaS-Specific Principles
- Multi-tenant ready: separate company data by tenant isolation in DB.
- Scalable: design so additional features (billing, analytics, user roles) can be added without rewrites.
- Resilient: implement retries, graceful error handling, and logging.
- Observability: logs, metrics, and monitoring hooks.
- Developer Experience: clear README, setup scripts, consistent code style.

---

## Collaboration & Documentation
- Every new feature must include:
  - Be Updated/documented on the changelog.md.
  - Usage examples and setup notes.
- Comment code with **intent** (why this was done), not just “what it does”.
---

## Output Rules
- Never dump entire large files unnecessarily; show only the changes with context.
- For large responses, **split into PART i/n** and instruct how to continue(like the rules onn rule.md).
- Summarize at the end: ✅ what was done, 🧪 how to test, 📌 next steps.

---

## Continuous Improvement
- Suggest refactors if repeated patterns or complexity arise.
- Highlight potential performance bottlenecks or scaling issues early.
- Recommend libraries or patterns when beneficial, but keep dependencies minimal.

---
