# Plan

Move the cohesive publishing subsystem, skills and tests from the gateway working tree. Replace seed CRUD with guarded publishing endpoints; use port 3014. Keep the gateway as a bounded HTTP forwarding adapter to a fixed configured publisher URL, preserving caller credentials for publisher authorization. Generate an independent publisher contracts package; vendor its tarball for standalone gateway builds. Gateway contracts retain compatibility types and discovery via that package.

Copy the existing receipt volume into the publisher deployment configuration; never mount it to two active writers. Preparation jobs are memory-only and require drain/restart. No domain DB migration. Update CI, environment examples and local docs. Validate unit, protocol, build, lint and generated contracts locally. Live production cutover requires an operator-controlled drain and environment/volume transfer; no deployment is implied.

Deployment follow-up: diagnose gateway run 42306873767 and publisher run
42304355840 using logs plus read-only host checks. Back up private configuration
and receipts, configure the fixed publisher destination, retry the existing validated
gateway artifact, then retry publisher only after gateway detaches the journal.
Improve gateway preflight diagnostics to name mismatched fields without their values.
