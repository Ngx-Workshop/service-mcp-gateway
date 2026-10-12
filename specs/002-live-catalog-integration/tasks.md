# Tasks
Updated: 2026-10-12
Spec: [spec.md](spec.md) · Plan: [plan.md](plan.md)

- [x] T001: Inspect owner local modes, start current-source services and gateway; run initial real scan (FR-001, AC-001–003).
- [x] T002: Add repeatable read-only local integration check; diagnose/fix evidence-based mismatches (FR-002–004, AC-001–005).
- [x] T003: Run real check and appropriate build/lint/regressions; document counts and limits (FR-005).
- [x] T004: Update context docs and handoff; stop owned verification processes, preserve owner working trees and data (FR-004–005).

Initial evidence: real MongoDB-backed services returned five sections, eleven workshops and one published lab. All three tools succeeded in a modern SDK scan; no runtime fix required at this point.

Final evidence: modern and legacy passes for all five sections, eleven workshops and one published lab; pinned latest and negative cases passed. Strict build, typed lint and diff checks passed. Owner checkouts remained clean; all three owned listeners were stopped and existing MongoDB retained. See [handoff.md](handoff.md).
