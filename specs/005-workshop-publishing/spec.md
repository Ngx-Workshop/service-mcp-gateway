# Workshop publishing
FR-001: Administrators and authenticated agents can generate and review a workshop draft, then explicitly publish it.
FR-002: Documentation uses Ngx-EditorJs2 block arrays serialized in service-document html.
FR-003: Authoring tools support owner API CRUD for documents, labs and assessments, plus uploader image search/upload.
FR-004: Public catalog OAuth cannot authorize writes. Publishing requires validated platform admin authentication.
FR-005: Publish verifies labs before publication and records each completed operation; duplicate run IDs cannot blindly repeat writes.
AC-001: A valid draft creates documentation, verified labs, assessment and ordered references.
AC-002: Invalid blocks/questions and non-admin access fail before owner writes.
AC-003: Partial failure returns completed resource IDs and stops; uncertain writes require reconciliation.
AC-004: Publisher preserves drafts on failure and shows generation/publishing/recovery states.
Assumption: Use existing platform administrator credentials via the shell for the publisher and bearer auth for external agents. Catalog OAuth remains independent.
