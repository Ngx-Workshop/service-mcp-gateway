# Tasks
- [x] T001 Define strict draft/editor/CRUD contracts (FR-002/003). Generated additive contracts 1.1.0; provided editor specimen passes validation.
- [x] T002 Implement admin endpoint, owner adapters, model drafting and journaled orchestration (FR-001/004/005). Auth/protocol, verification failure, duplicate IDs, ownership and uncertain writes covered by tests.
- [x] T003 Add publisher brief/review/results UI (AC-004). Section lookup, generation/import, edit invalidation, explicit publication and receipt inspection implemented.
- [x] T004 Test local acceptance and regenerate contracts. Gateway and browser checks pass; nginx syntax validated using temporary local certs.
- [ ] T005 Provision actual model/owner settings, deploy gateway/MFE/proxies together, and verify a disposable workshop through real services. Deployment requires separate authorization; live integrations were not claimed.

## Generation diagnostics tasks
- [x] T006: Classify generator failures in service-mcp-gateway and decode safe codes in the publisher (FR-006).
- [x] T007: Verify stage classification, privacy, compatibility and existing checks (AC-005).
- [x] T008: Verify real authenticated generation and record the original failure diagnosis if reproducible.

- [x] T009: Repair internal nested-block model schema and deterministic editor conversion (FR-007/AC-006); verify regression checks and deploy for live generation acceptance.

Generation repair evidence: gateway build/lint, 79 unit tests and 43 protocol tests passed; publisher architecture/types/build and 12 ChromeHeadless tests passed. Owner-approved production deployment passed readiness and unauthenticated facade remained 401. Original brief generated a valid Angular level-2 draft with 5 pages, 2 labs and 3 questions, including two correctly serialized image blocks. No publication performed.
